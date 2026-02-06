import { spawn } from "node:child_process";
import http from "node:http";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { WebSocket } from "ws";
import { chromium } from "playwright";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../../..");
const DEMO_DIR = path.join(ROOT, "apps/demo-site");
const EXTENSION_DIR = path.join(ROOT, "apps/extension/dist");
const DEFAULT_MODE = "extension";

const modeArg = process.argv.find((arg) => arg.startsWith("--mode="));
const mode = (modeArg ? modeArg.split("=")[1] : process.env.E2E_MODE || DEFAULT_MODE).toLowerCase();

const log = (message) => {
  const timestamp = new Date().toISOString();
  console.log(`[demo-e2e ${timestamp}] ${message}`);
};

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const startStaticServer = async (port = 4173) => {
  const server = http.createServer(async (req, res) => {
    const requestPath = decodeURIComponent(req.url || "/");
    const safePath = requestPath === "/" ? "/index.html" : requestPath;
    const filePath = path.join(DEMO_DIR, safePath);
    if (!filePath.startsWith(DEMO_DIR)) {
      res.writeHead(403);
      res.end("Forbidden");
      return;
    }
    try {
      const data = await fs.readFile(filePath);
      const ext = path.extname(filePath).toLowerCase();
      const type =
        ext === ".html"
          ? "text/html"
          : ext === ".css"
          ? "text/css"
          : ext === ".js"
          ? "text/javascript"
          : "application/octet-stream";
      res.writeHead(200, { "Content-Type": type });
      res.end(data);
    } catch {
      res.writeHead(404);
      res.end("Not found");
    }
  });

  await new Promise((resolve) => server.listen(port, resolve));
  return server;
};

const waitForHttp = async (url, timeoutMs = 30000) => {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      await new Promise((resolve, reject) => {
        http
          .get(url, (res) => {
            res.resume();
            res.statusCode && res.statusCode < 500 ? resolve() : reject(new Error("Bad response"));
          })
          .on("error", reject);
      });
      return;
    } catch {
      await delay(500);
    }
  }
  throw new Error(`Timeout waiting for ${url}`);
};

const runCommand = (command, args, options = {}) =>
  new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: "inherit", ...options });
    child.on("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${command} exited with code ${code}`));
    });
  });

const spawnService = (command, args, env = {}) => {
  const child = spawn(command, args, {
    env: { ...process.env, ...env },
    stdio: "inherit",
    cwd: ROOT
  });
  return child;
};

const connectAgent = (url, timeoutMs = 5000) =>
  new Promise((resolve, reject) => {
    const ws = new WebSocket(url);
    const timer = setTimeout(() => {
      try {
        ws.terminate();
      } catch {
        // ignore
      }
      reject(new Error(`Timeout connecting to ${url}`));
    }, timeoutMs);
    ws.on("open", () => {
      clearTimeout(timer);
      resolve(ws);
    });
    ws.on("error", (err) => {
      clearTimeout(timer);
      reject(err);
    });
  });

const waitForMessage = (ws, predicate, timeoutMs = 10000) =>
  new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      ws.off("message", handler);
      reject(new Error("Timed out waiting for message"));
    }, timeoutMs);
    const handler = (raw) => {
      try {
        const message = JSON.parse(raw.toString());
        if (predicate(message)) {
          clearTimeout(timer);
          ws.off("message", handler);
          resolve(message);
        }
      } catch {
        // ignore
      }
    };
    ws.on("message", handler);
  });

const attachWsLogger = (ws) => {
  const handler = (raw) => {
    try {
      const message = JSON.parse(raw.toString());
      if (message.type === "agent:rotation-update") {
        log(
          `rotation ${message.status}${message.stepId ? ` (${message.stepId})` : ""}${
            message.message ? ` - ${message.message}` : ""
          }`
        );
        return;
      }
      if (message.type === "agent:error") {
        log(`agent error: ${message.message}`);
        return;
      }
      if (message.type === "agent:client-connected") {
        log(`client connected: ${message.clientId}`);
        return;
      }
      if (message.type === "agent:client-list") {
        log(`client list: ${(message.clients || []).join(", ")}`);
        return;
      }
      if (message.type === "agent:hello") {
        log(`agent hello: ${message.agentVersion} (protocol ${message.protocolVersion})`);
      }
    } catch {
      // ignore
    }
  };
  ws.on("message", handler);
  return () => ws.off("message", handler);
};

const run = async () => {
  log(`Starting demo E2E in ${mode} mode`);

  const demoServer = await startStaticServer();
  const agentEnv = mode === "playwright" ? { AGENT_DRIVER: "playwright" } : {};
  let agent = null;
  let agentStarted = false;
  try {
    const probe = await connectAgent("ws://localhost:8787", 1500);
    probe.close();
    log("Using existing agent on ws://localhost:8787");
  } catch {
    log("Starting agent service");
    agent = spawnService("npm", ["--prefix", "apps/agent", "run", "dev"], agentEnv);
    agentStarted = true;
  }
  log("Starting desktop service");
  const desktop = spawnService("npm", ["--prefix", "apps/desktop", "run", "dev", "--", "--host", "127.0.0.1", "--port", "5173"]);

  let context;

  try {
    log("Waiting for demo site and desktop");
    await waitForHttp("http://localhost:4173/");
    await waitForHttp("http://localhost:5173/");

    if (mode === "extension") {
      log("Building extension");
      await runCommand("npm", ["--prefix", "apps/extension", "run", "build"], { cwd: ROOT });
      const userDataDir = await fs.mkdtemp(path.join(os.tmpdir(), "pc-ext-"));
      log("Launching Chromium with extension");
      context = await chromium.launchPersistentContext(userDataDir, {
        headless: false,
        args: [
          `--disable-extensions-except=${EXTENSION_DIR}`,
          `--load-extension=${EXTENSION_DIR}`
        ]
      });
      const page = await context.newPage();
      await page.goto("http://localhost:4173/");
    }

    const ws = await connectAgent("ws://localhost:8787");
    const detachLogger = attachWsLogger(ws);
    ws.send(JSON.stringify({ type: "ext:hello", clientId: "demo-e2e", version: "1.0" }));

    if (mode === "extension") {
      log("Waiting for extension to connect");
      const waitForExtension = () =>
        Promise.race([
          waitForMessage(ws, (msg) => msg.type === "agent:client-list" && msg.clients?.includes("extension"), 20000),
          waitForMessage(ws, (msg) => msg.type === "agent:client-connected" && msg.clientId === "extension", 20000)
        ]);
      await waitForExtension();
      log("Extension connected");
    }

    const requestId = `demo-${Date.now()}`;
    const newPassword = `DemoPass!${Date.now().toString().slice(-6)}`;
    log(`Sending rotate request ${requestId}`);
    ws.send(
      JSON.stringify({
        type: "ext:rotate-request",
        requestId,
        flowId: "flow.demo-site.change-password",
        accountId: "acct-005",
        domain: "localhost",
        bindings: {
          username: "demo@password.cluster",
          old_password: "OldPass!234",
          new_password: newPassword
        },
        driver: mode === "extension" ? "extension" : "playwright"
      })
    );

    const result = await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error("Flow timed out")), 120000);
      const handler = (raw) => {
        try {
          const message = JSON.parse(raw.toString());
          if (message.type === "agent:rotation-update" && message.requestId === requestId) {
            if (message.status === "completed") {
              clearTimeout(timeout);
              ws.off("message", handler);
              resolve("completed");
            }
            if (message.status === "failed") {
              clearTimeout(timeout);
              ws.off("message", handler);
              reject(new Error(message.message || "Flow failed"));
            }
          }
        } catch {
          // ignore
        }
      };
      ws.on("message", handler);
    });

    log(`Demo flow result: ${result}`);
    ws.close();
    detachLogger();
  } finally {
    demoServer.close();
    if (agentStarted && agent) {
      log("Stopping agent service");
      agent.kill("SIGTERM");
    }
    log("Stopping desktop service");
    desktop.kill("SIGTERM");
    if (context) {
      log("Closing Chromium context");
      await context.close();
    }
  }
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});

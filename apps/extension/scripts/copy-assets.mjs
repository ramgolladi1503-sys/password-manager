import { mkdirSync, copyFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(new URL("..", import.meta.url).pathname);
const dist = resolve(root, "dist");

mkdirSync(dist, { recursive: true });

copyFileSync(resolve(root, "manifest.json"), resolve(dist, "manifest.json"));
copyFileSync(resolve(root, "src", "popup.html"), resolve(dist, "popup.html"));
copyFileSync(resolve(root, "src", "popup.css"), resolve(dist, "popup.css"));

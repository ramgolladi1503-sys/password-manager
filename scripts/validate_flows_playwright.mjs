import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

const flowsDir = process.env.FLOWS_DIR
  ? path.resolve(process.env.FLOWS_DIR)
  : path.resolve(process.cwd(), "flows");

const flowFiles = fs
  .readdirSync(flowsDir)
  .filter((file) => file.endsWith(".json"))
  .map((file) => path.join(flowsDir, file));

const textBySelector = new Map();
const selectSelectors = new Set();
const selectorTags = new Map();

const actionToTag = (action) => {
  if (action === "type") return "input";
  if (action === "select") return "select";
  if (action === "click") return "button";
  if (action === "assert_text") return "div";
  if (action === "assert_element") return "div";
  if (action === "wait_for") return "div";
  return null;
};

const tagPriority = ["input", "select", "button", "a", "div"];

const pickTag = (current, next) => {
  if (!current) return next;
  if (!next) return current;
  const currentRank = tagPriority.indexOf(current);
  const nextRank = tagPriority.indexOf(next);
  if (currentRank === -1 && nextRank === -1) return current;
  if (currentRank === -1) return next;
  if (nextRank === -1) return current;
  return nextRank < currentRank ? next : current;
};

const parseSelector = (selector) => {
  if (!selector || selector.includes(" ") || selector.startsWith("text=")) {
    return null;
  }

  const attrMatch = selector.match(/^(\w+)?\[([^=\]]+)=['"]([^'"]+)['"]\]$/);
  if (attrMatch) {
    return {
      tag: attrMatch[1] || "div",
      attrs: { [attrMatch[2]]: attrMatch[3] }
    };
  }

  const idMatch = selector.match(/^(\w+)?#([\w-]+)$/);
  if (idMatch) {
    return { tag: idMatch[1] || "div", attrs: { id: idMatch[2] } };
  }

  const classMatch = selector.match(/^(\w+)?\.([\w-]+)$/);
  if (classMatch) {
    return { tag: classMatch[1] || "div", attrs: { class: classMatch[2] } };
  }

  return null;
};

const buildElement = (selector, text) => {
  const parsed = parseSelector(selector);
  if (!parsed) return null;
  const preferredTag = selectorTags.get(selector);
  if (parsed.tag === "div" && preferredTag) {
    parsed.tag = preferredTag;
  }
  const attrs = Object.entries(parsed.attrs)
    .map(([key, value]) => `${key}="${value}"`)
    .join(" ");
  const baseStyle = 'style="display:inline-block;min-height:16px;min-width:16px"';
  if (selectSelectors.has(selector)) {
    return `<select ${attrs} ${baseStyle}><option value="option">Option</option></select>`;
  }
  const tag = parsed.tag.toLowerCase();
  const fallbackText = tag === "a" ? "Link" : tag === "button" ? "Button" : "";
  if (tag === "input") {
    return `<input ${attrs} ${baseStyle} />`;
  }
  return `<${parsed.tag} ${attrs} ${baseStyle}>${text ?? fallbackText}</${parsed.tag}>`;
};

const buildHtml = (selectors) => {
  const elements = [];
  for (const selector of selectors) {
    const text = textBySelector.get(selector);
    const element = buildElement(selector, text);
    if (element) {
      elements.push(element);
    }
  }
  return `<!doctype html><html><body>${elements.join("\n")}</body></html>`;
};

const collectSelectors = (flow) => {
  const selectors = new Set();
  const steps = flow.steps ?? [];
  for (const step of steps) {
    if (step.selector) {
      selectors.add(step.selector);
      const suggested = actionToTag(step.action);
      const existing = selectorTags.get(step.selector);
      selectorTags.set(step.selector, pickTag(existing, suggested));
    }
    if (step.action === "assert_text" && step.selector && step.value) {
      textBySelector.set(step.selector, step.value);
    }
    if (step.action === "select" && step.selector) {
      selectSelectors.add(step.selector);
    }
  }
  return selectors;
};

const isSupported = (selector) => Boolean(parseSelector(selector));

const run = async () => {
  if (!flowFiles.length) {
    console.log("No flow files found");
    return;
  }

  const browser = await chromium.launch();
  const page = await browser.newPage();
  let failures = 0;

  for (const file of flowFiles) {
    const flow = JSON.parse(fs.readFileSync(file, "utf-8"));
    const selectors = collectSelectors(flow);
    const html = buildHtml(selectors);
    await page.setContent(html);

    for (const step of flow.steps ?? []) {
      try {
        if (step.action === "navigate") continue;
        if (step.action === "pause_for_user") continue;

        const selector = step.selector;
        if (selector && !isSupported(selector) && !selector.startsWith("text=")) {
          console.warn(`Skipping unsupported selector in ${flow.id}: ${selector}`);
          continue;
        }
        if (step.action === "click" && selector) {
          await page.locator(selector).first().click({ timeout: 2000, force: true });
        }
        if (step.action === "type" && selector) {
          await page.locator(selector).first().fill("value", { timeout: 2000, force: true });
        }
        if (step.action === "select" && selector) {
          await page.locator(selector).first().selectOption({ value: "option" });
        }
        if (step.action === "wait_for") {
          const waitSelector = step.selector || step.condition;
          if (waitSelector && !waitSelector.startsWith("text=")) {
            await page.waitForSelector(waitSelector, { timeout: 2000 });
          }
        }
        if (step.action === "assert_text" && selector && step.value) {
          const text = await page.textContent(selector);
          if (!text || !text.includes(step.value)) {
            throw new Error(`assert_text failed for ${selector}`);
          }
        }
        if (step.action === "assert_element" && selector) {
          await page.waitForSelector(selector, { timeout: 2000 });
        }
      } catch (error) {
        failures += 1;
        console.error(`Flow ${flow.id} failed on step ${step.id}:`, error.message);
      }
    }
  }

  await browser.close();

  if (failures > 0) {
    console.error(`Playwright flow validation failed (${failures} errors)`);
    process.exit(1);
  }

  console.log("Playwright flow validation passed");
};

run();

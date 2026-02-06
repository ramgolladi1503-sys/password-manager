import { chromium } from "playwright";
import type { FlowBindings, FlowTemplate, RotationEvent } from "./types";

const resolveValue = (template: string, bindings: FlowBindings) =>
  template.replace(/{{\s*([a-z0-9_]+)\s*}}/gi, (_, key) => bindings[key] ?? "");

type Emit = (event: RotationEvent) => void;

const bindingPattern = (binding: string) => new RegExp(`{{\\s*${binding}\\s*}}`, "i");

const stepUsesBinding = (value: string | undefined, binding: string) =>
  Boolean(value && bindingPattern(binding).test(value));

const findSelectorForBinding = (flow: FlowTemplate, binding: string) =>
  flow.steps.find(
    (step) => step.action === "type" && step.selector && stepUsesBinding(step.value, binding)
  )?.selector;

const findLoginSubmitSelector = (flow: FlowTemplate, startIndex = 0) => {
  const clickSteps = flow.steps.filter((step) => step.action === "click" && step.selector);
  const keyword = (text: string | undefined) =>
    (text ?? "").toLowerCase().includes("login") ||
    (text ?? "").toLowerCase().includes("sign") ||
    (text ?? "").toLowerCase().includes("submit");

  const prioritized = clickSteps.find(
    (step) => keyword(step.id) || keyword(step.label) || keyword(step.selector)
  );
  if (prioritized?.selector) return prioritized.selector;

  const afterIndex = flow.steps.slice(startIndex).find((step) => step.action === "click" && step.selector);
  return afterIndex?.selector ?? clickSteps[0]?.selector;
};

const resolveLoginUrl = (flow: FlowTemplate) => {
  if (flow.requires?.loginUrl) return flow.requires.loginUrl;
  const nav = flow.steps.find((step) => step.action === "navigate" && step.target);
  return nav?.target;
};

const runLoginAssertion = async (
  flow: FlowTemplate,
  bindings: FlowBindings,
  step: NonNullable<FlowTemplate["verify"]>[number],
  page: any,
  expected: "success" | "fail"
) => {
  const loginUrl = resolveLoginUrl(flow);
  if (!loginUrl) {
    throw new Error("Missing loginUrl for verification");
  }

  await page.goto(loginUrl, { waitUntil: "domcontentloaded" });

  const usernameSelector = findSelectorForBinding(flow, "username");
  if (usernameSelector && bindings.username) {
    await page.fill(usernameSelector, bindings.username);
  }

  const passwordSelector =
    findSelectorForBinding(flow, "old_password") ||
    findSelectorForBinding(flow, "current_password") ||
    findSelectorForBinding(flow, "new_password");

  if (passwordSelector && step.using) {
    const value = resolveValue(step.using, bindings);
    await page.fill(passwordSelector, value);
  }

  const usernameIndex = flow.steps.findIndex(
    (s) => s.action === "type" && stepUsesBinding(s.value, "username")
  );
  const submitSelector = findLoginSubmitSelector(flow, Math.max(usernameIndex, 0));
  if (submitSelector) {
    await page.click(submitSelector);
  }

  const timeout = (step.timeoutSeconds ?? 15) * 1000;
  if (step.selector) {
    await page.waitForSelector(step.selector, { timeout });
    if (step.value) {
      const text = await page.textContent(step.selector);
      const expectedText = resolveValue(step.value, bindings);
      if (!text || !text.includes(expectedText)) {
        throw new Error(`Verification text mismatch for ${step.selector}`);
      }
    }
    return;
  }

  if (expected === "success") {
    await page.waitForTimeout(1000);
    return;
  }

  const genericPasswordSelector = "input[type='password']";
  const fallbackSelector = usernameSelector || passwordSelector || genericPasswordSelector;
  try {
    await page.waitForSelector(fallbackSelector, { timeout });
    return;
  } catch {
    if (fallbackSelector !== genericPasswordSelector) {
      await page.waitForSelector(genericPasswordSelector, { timeout });
      return;
    }
  }

  throw new Error("Verification selector missing for login failure check");
};

export const runFlowWithPlaywright = async (
  flow: FlowTemplate,
  bindings: FlowBindings,
  emit: Emit
) => {
  const browser = await chromium.launch({ headless: process.env.HEADLESS !== "false" });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    emit({ status: "started", message: `Running ${flow.id}` });

    for (const step of flow.steps) {
      emit({ status: "step-start", stepId: step.id, message: step.label });

      switch (step.action) {
        case "navigate":
          if (step.target) {
            await page.goto(step.target, { waitUntil: "domcontentloaded" });
          }
          break;
        case "click":
          if (step.selector) {
            await page.click(step.selector);
          }
          break;
        case "type":
          if (step.selector && step.value) {
            const value = resolveValue(step.value, bindings);
            await page.fill(step.selector, value);
          }
          break;
        case "select":
          if (step.selector && step.value) {
            const value = resolveValue(step.value, bindings);
            await page.selectOption(step.selector, value);
          }
          break;
        case "wait_for":
          if (step.selector) {
            await page.waitForSelector(step.selector, { timeout: 15000 });
          } else if (step.condition) {
            await page.waitForSelector(step.condition, { timeout: 15000 });
          }
          break;
        case "assert_text":
          if (step.selector && step.value) {
            const text = await page.textContent(step.selector);
            if (!text || !text.includes(resolveValue(step.value, bindings))) {
              throw new Error(`Assertion failed for ${step.selector}`);
            }
          }
          break;
        case "assert_element":
          if (step.selector) {
            await page.waitForSelector(step.selector, { timeout: 15000 });
          }
          break;
        case "pause_for_user":
          emit({ status: "paused", stepId: step.id, message: step.label });
          return;
        default:
          break;
      }

      emit({ status: "step-complete", stepId: step.id, message: step.label });
    }

    if (flow.verify?.length) {
      for (const verifyStep of flow.verify) {
        emit({
          status: "step-start",
          stepId: verifyStep.id,
          message: `Verify: ${verifyStep.label}`
        });

        switch (verifyStep.action) {
          case "assert_login_succeeds":
            await runLoginAssertion(flow, bindings, verifyStep, page, "success");
            break;
          case "assert_login_fails":
            await runLoginAssertion(flow, bindings, verifyStep, page, "fail");
            break;
          case "assert_text":
            if (verifyStep.selector && verifyStep.value) {
              const timeout = (verifyStep.timeoutSeconds ?? 15) * 1000;
              await page.waitForSelector(verifyStep.selector, { timeout });
              const text = await page.textContent(verifyStep.selector);
              if (!text || !text.includes(resolveValue(verifyStep.value, bindings))) {
                throw new Error(`Verification failed for ${verifyStep.selector}`);
              }
            }
            break;
          case "assert_element":
            if (verifyStep.selector) {
              const timeout = (verifyStep.timeoutSeconds ?? 15) * 1000;
              await page.waitForSelector(verifyStep.selector, { timeout });
            }
            break;
          default:
            break;
        }

        emit({
          status: "step-complete",
          stepId: verifyStep.id,
          message: `Verified: ${verifyStep.label}`
        });
      }
    }

    emit({ status: "completed", message: "Flow completed" });
  } catch (error) {
    emit({ status: "failed", message: error instanceof Error ? error.message : "Flow failed" });
  } finally {
    await context.close();
    await browser.close();
  }
};

#!/usr/bin/env python3
"""Validate flow templates with a JSON Schema if available, plus basic lint rules.

Usage:
  python scripts/validate_flows.py
  python scripts/validate_flows.py --flows flows --schema flow-schema.json
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path
from typing import Dict, List

SEMVER_RE = re.compile(r"^\d+\.\d+\.\d+(-[0-9A-Za-z.-]+)?$")
BINDING_RE = re.compile(r"^[a-z_][a-z0-9_]*$")
STEP_ID_RE = re.compile(r"^[a-z0-9][a-z0-9-]*$")

ALLOWED_MODES = {"auto", "guided", "manual"}
ALLOWED_ACTIONS = {
    "navigate",
    "click",
    "type",
    "wait_for",
    "pause_for_user",
    "select",
    "assert_text",
    "assert_element",
}
ALLOWED_VERIFY_ACTIONS = {
    "assert_login_fails",
    "assert_login_succeeds",
    "assert_text",
    "assert_element",
}
ALLOWED_CAPTCHA = {"pause", "manual", "ignore"}


def _load_json(path: Path) -> Dict:
    with path.open("r", encoding="utf-8") as handle:
        return json.load(handle)


def _lint_flow(flow: Dict, path: Path) -> List[str]:
    errors: List[str] = []

    def err(msg: str) -> None:
        errors.append(f"{path}: {msg}")

    required = ["id", "domain", "version", "modeSupport", "requires", "bindings", "steps"]
    for key in required:
        if key not in flow:
            err(f"missing required field '{key}'")

    if "id" in flow and not isinstance(flow["id"], str):
        err("id must be a string")
    if "domain" in flow and not isinstance(flow["domain"], str):
        err("domain must be a string")
    if "version" in flow:
        if not isinstance(flow["version"], str) or not SEMVER_RE.match(flow["version"]):
            err("version must be semver like 1.0.0")

    mode_support = flow.get("modeSupport")
    if mode_support is not None:
        if not isinstance(mode_support, list) or not mode_support:
            err("modeSupport must be a non-empty list")
        else:
            invalid = [m for m in mode_support if m not in ALLOWED_MODES]
            if invalid:
                err(f"modeSupport contains invalid values: {invalid}")

    requires = flow.get("requires")
    if requires is not None:
        if not isinstance(requires, dict):
            err("requires must be an object")
        else:
            for req_key in ["authenticatedSession", "mfaSupported", "captchaHandled"]:
                if req_key not in requires:
                    err(f"requires missing '{req_key}'")
            if "authenticatedSession" in requires and not isinstance(requires["authenticatedSession"], bool):
                err("requires.authenticatedSession must be boolean")
            if "mfaSupported" in requires and not isinstance(requires["mfaSupported"], bool):
                err("requires.mfaSupported must be boolean")
            if "captchaHandled" in requires and requires["captchaHandled"] not in ALLOWED_CAPTCHA:
                err("requires.captchaHandled must be pause, manual, or ignore")
            if "loginUrl" in requires and not isinstance(requires["loginUrl"], str):
                err("requires.loginUrl must be a string")

    bindings = flow.get("bindings")
    if bindings is not None:
        if not isinstance(bindings, list) or not bindings:
            err("bindings must be a non-empty list")
        else:
            invalid = [b for b in bindings if not isinstance(b, str) or not BINDING_RE.match(b)]
            if invalid:
                err(f"bindings contain invalid entries: {invalid}")

    signals = flow.get("signals")
    if signals is not None:
        if not isinstance(signals, dict):
            err("signals must be an object")
        else:
            for key in ["captchaDetected", "rateLimited", "mfaPrompt"]:
                if key in signals:
                    if not isinstance(signals[key], list) or not all(isinstance(s, str) for s in signals[key]):
                        err(f"signals.{key} must be a list of strings")

    steps = flow.get("steps")
    if steps is not None:
        if not isinstance(steps, list) or not steps:
            err("steps must be a non-empty list")
        else:
            seen_ids = set()
            for idx, step in enumerate(steps):
                if not isinstance(step, dict):
                    err(f"steps[{idx}] must be an object")
                    continue
                sid = step.get("id")
                if not isinstance(sid, str) or not STEP_ID_RE.match(sid):
                    err(f"steps[{idx}].id must match {STEP_ID_RE.pattern}")
                if sid in seen_ids:
                    err(f"duplicate step id '{sid}'")
                seen_ids.add(sid)
                if not isinstance(step.get("label"), str):
                    err(f"steps[{idx}].label must be a string")
                mode = step.get("mode")
                if mode not in ALLOWED_MODES:
                    err(f"steps[{idx}].mode must be one of {sorted(ALLOWED_MODES)}")
                action = step.get("action")
                if action not in ALLOWED_ACTIONS:
                    err(f"steps[{idx}].action must be one of {sorted(ALLOWED_ACTIONS)}")
                if action == "navigate" and "target" not in step:
                    err(f"steps[{idx}] navigate requires target")
                if action in {"click", "type", "select", "assert_text", "assert_element"} and "selector" not in step:
                    err(f"steps[{idx}] {action} requires selector")
                if action in {"type", "select", "assert_text"} and "value" not in step:
                    err(f"steps[{idx}] {action} requires value")
                if action == "wait_for" and "selector" not in step and "condition" not in step:
                    err(f"steps[{idx}] wait_for requires selector or condition")

    verify = flow.get("verify")
    if verify is not None:
        if not isinstance(verify, list):
            err("verify must be a list")
        else:
            for idx, step in enumerate(verify):
                if not isinstance(step, dict):
                    err(f"verify[{idx}] must be an object")
                    continue
                if not isinstance(step.get("id"), str) or not STEP_ID_RE.match(step.get("id", "")):
                    err(f"verify[{idx}].id must match {STEP_ID_RE.pattern}")
                if not isinstance(step.get("label"), str):
                    err(f"verify[{idx}].label must be a string")
                action = step.get("action")
                if action not in ALLOWED_VERIFY_ACTIONS:
                    err(f"verify[{idx}].action must be one of {sorted(ALLOWED_VERIFY_ACTIONS)}")
                if action in {"assert_login_fails", "assert_login_succeeds"} and "using" not in step:
                    err(f"verify[{idx}] {action} requires using")
                if action in {"assert_text", "assert_element"} and "selector" not in step:
                    err(f"verify[{idx}] {action} requires selector")
                if action == "assert_text" and "value" not in step:
                    err(f"verify[{idx}] assert_text requires value")

    return errors


def _schema_validate(schema_path: Path, flow_path: Path) -> List[str]:
    try:
        import jsonschema
    except Exception:
        return []

    try:
        schema = _load_json(schema_path)
    except Exception as exc:
        return [f"{schema_path}: failed to load schema: {exc}"]

    try:
        flow = _load_json(flow_path)
    except Exception as exc:
        return [f"{flow_path}: invalid JSON: {exc}"]

    errors: List[str] = []
    validator = jsonschema.Draft202012Validator(schema)
    for error in sorted(validator.iter_errors(flow), key=str):
        location = ".".join(str(p) for p in error.path) or "root"
        errors.append(f"{flow_path}: schema error at {location}: {error.message}")
    return errors


def main() -> int:
    parser = argparse.ArgumentParser(description="Validate flow templates")
    parser.add_argument("--flows", default="flows", help="flows directory")
    parser.add_argument("--schema", default="flow-schema.json", help="schema path")
    args = parser.parse_args()

    flows_dir = Path(args.flows)
    schema_path = Path(args.schema)

    if not flows_dir.exists():
        print(f"Flows directory not found: {flows_dir}")
        return 2

    flow_files = sorted(p for p in flows_dir.glob("*.json") if p.is_file())
    if not flow_files:
        print(f"No flow files found in {flows_dir}")
        return 0

    all_errors: List[str] = []

    for flow_path in flow_files:
        try:
            flow = _load_json(flow_path)
        except Exception as exc:
            all_errors.append(f"{flow_path}: invalid JSON: {exc}")
            continue

        all_errors.extend(_lint_flow(flow, flow_path))

        if schema_path.exists():
            all_errors.extend(_schema_validate(schema_path, flow_path))

    if all_errors:
        print("Flow validation failed:\n")
        for error in all_errors:
            print(f"- {error}")
        return 1

    print(f"All flow files passed validation ({len(flow_files)} files)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

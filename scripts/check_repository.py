#!/usr/bin/env python3
"""Check local Markdown file links and repository metadata without dependencies."""

import json
import re
import sys
from pathlib import Path
from urllib.parse import unquote, urlsplit


ROOT = Path(__file__).resolve().parent.parent
REQUIRED = (
    "README.md", "LICENSE", "CONTRIBUTING.md", "AGENTS.md", "SECURITY.md",
    "CODE_OF_CONDUCT.md", "CHANGELOG.md", "docs/concept.md", "docs/mvp-spec.md",
    "docs/development.md", "docs/architecture.md", "docs/maintaining.md",
    "docs/decisions/0001-desktop-stack.md", ".github/workflows/ci.yml",
    ".github/CODEOWNERS", ".github/rulesets/main.json",
)


def main() -> int:
    errors = []
    for name in REQUIRED:
        path = ROOT / name
        if not path.is_file() or not path.read_text(encoding="utf-8").strip():
            errors.append(f"Missing or empty: {name}")

    # These are the project's doc locations; avoid walking dependency/build trees.
    documents = sorted(ROOT.glob("*.md"))
    documents += sorted((ROOT / "docs").rglob("*.md"))
    documents += sorted((ROOT / ".github").rglob("*.md"))
    for document in documents:
        body = document.read_text(encoding="utf-8")
        body = re.sub(r"^```.*?^```[^\n]*", "", body, flags=re.M | re.S)
        for target in re.findall(r"\[[^\]\n]*\]\(([^)\n]+)\)", body):
            url = urlsplit(target.strip("<>"))
            if url.scheme or url.netloc or not url.path:
                continue
            path = unquote(url.path)
            destination = (ROOT / path.lstrip("/")) if path.startswith("/") else document.parent / path
            if not destination.exists():
                errors.append(f"{document.relative_to(ROOT)}: broken file link: {target}")

    for path in (ROOT / ".github/rulesets").glob("*.json"):
        try:
            ruleset = json.loads(path.read_text(encoding="utf-8"))
            if ruleset.get("target") != "branch" or not ruleset.get("rules"):
                errors.append(f"Invalid branch ruleset: {path.relative_to(ROOT)}")
        except (ValueError, UnicodeError) as exc:
            errors.append(f"{path.relative_to(ROOT)}: {exc}")

    if errors:
        print("\n".join(errors), file=sys.stderr)
        return 1
    print(f"Repository checks passed ({len(documents)} Markdown files; file links and metadata).")
    print("This check does not build or test the desktop application or validate link anchors.")
    return 0


if __name__ == "__main__":
    sys.exit(main())

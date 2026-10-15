# -*- coding: utf-8 -*-
"""Pre-push sensitive-info scan over the staged git set (push gate).

Scans every staged file for: local user paths, machine username, provider tokens,
emails, intranet IPs, password assignments, phone numbers, absolute D:\tools paths.
The scanner file itself is excluded from its own scan: its SAMPLE_* strings are
fabricated positive-control fixtures (obviously fake), one per pattern kind.
ASCII output only. Exit 0 = clean, 1 = hits found, 2 = selftest/usage failure.
"""
import os
import re
import subprocess
import sys

sys.stdout.reconfigure(encoding="utf-8", errors="replace")

SELF = os.path.basename(__file__)

PATTERNS = {
    "windows-user-path": re.compile(r"C:[/\\]+Users", re.I),
    "machine-username": re.compile(r"\bycwan\b"),
    "local-abs-path": re.compile(r"D:[/\\]tools", re.I),
    "file-url-with-drive": re.compile(r"file:///[A-Za-z]:", re.I),
    "github-token": re.compile(r"\b(?:ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9]{20,}\b"),
    "github-fine-token": re.compile(r"\bgithub_pat_[A-Za-z0-9_]{20,}\b"),
    "provider-key": re.compile(r"\bsk-[A-Za-z0-9_-]{16,}\b"),
    "slack-token": re.compile(r"\bxox[baprs]-[A-Za-z0-9-]{10,}\b"),
    "aws-key": re.compile(r"\bAKIA[0-9A-Z]{16}\b"),
    "google-key": re.compile(r"\bAIza[0-9A-Za-z_\-]{30,}\b"),
    "npm-token": re.compile(r"\bnpm_[A-Za-z0-9]{20,}\b"),
    "hf-token": re.compile(r"\bhf_[A-Za-z0-9]{20,}\b"),
    "email": re.compile(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+\.[A-Za-z0-9.-]+"),
    "intranet-ip": re.compile(r"\b(?:192\.168|10\.\d+|172\.(?:1[6-9]|2\d|3[01]))\.\d+\.\d+\b"),
    "secret-assign": re.compile(r"(?:password|passwd|secret|api[_-]?key)\s*[:=]", re.I),
    "phone-cn": re.compile(r"\b1[3-9]\d{9}\b"),
    "private-key-block": re.compile(r"-----BEGIN [A-Z ]*PRIVATE KEY-----"),
}

# One fabricated fixture per pattern kind (values are fake by construction).
SAMPLES = {
    "windows-user-path": "run at C:\\Users\\someone\\x",
    "machine-username": "user ycwan logged in",
    "local-abs-path": "see D:/tools/secret.txt",
    "file-url-with-drive": "open file:///D:/page.html",
    "github-token": "key = ghp_ABCDEFGHIJKLMNOPQRSTUVWXYZ123456",
    "github-fine-token": "key = github_pat_ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890",
    "provider-key": "key = sk-abcdefghijklmnopqrstuvwx",
    "slack-token": "key = xoxb-1234567890-abcdef",
    "aws-key": "key = AKIAIOSFODNN7EXAMPLE",
    "google-key": "key = AIzaSyA1234567890abcdefghijklmnopqrstuv",
    "npm-token": "key = npm_ABCDEFGHIJKLMNOPQRSTUVWXYZ123",
    "hf-token": "key = hf_ABCDEFGHIJKLMNOPQRSTUVWXYZ123",
    "email": "mail me a@b.com",
    "intranet-ip": "proxy 192.168.1.10",
    "secret-assign": "password: hunter2",
    "phone-cn": "phone 13812345678",
    "private-key-block": "-----BEGIN RSA PRIVATE KEY-----",
}

SAMPLE_CLEAN = [
    "normal line",
    "contact: github.com/wangyuanchuan2022",
    'URL = "file:///" + TARGET.replace("\\\\", "/")',
]


def staged_files():
    out = subprocess.run(
        ["git", "diff", "--cached", "--name-only", "--diff-filter=ACMR"],
        capture_output=True, text=True, encoding="utf-8", errors="replace",
    )
    if out.returncode != 0:
        print("FATAL: git diff --cached failed:", out.stderr.strip())
        sys.exit(2)
    return [line.strip() for line in out.stdout.splitlines() if line.strip()]


def scan_text(name, text):
    hits = []
    for label, rx in PATTERNS.items():
        for i, line in enumerate(text.splitlines(), 1):
            if rx.search(line):
                shown = line.strip()
                if len(shown) > 90:
                    shown = shown[:90] + "..."
                hits.append(f"{name}:{i} [{label}] {shown}")
    return hits


def selftest():
    clean_flagged = [h for t in SAMPLE_CLEAN for h in scan_text("CLEAN", t)]
    tainted_flagged = {label: scan_text("TAINT", text) for label, text in SAMPLES.items()}
    kinds_hit = sorted(label for label, hits in tainted_flagged.items() if hits)
    expected = sorted(PATTERNS)
    print(f"selftest: clean_samples_flagged={len(clean_flagged)} kinds_hit={len(kinds_hit)}/{len(expected)}")
    if clean_flagged:
        print("SELFTEST-FAIL: clean samples must not be flagged:")
        for h in clean_flagged:
            print("  " + h)
        sys.exit(2)
    if kinds_hit != expected:
        missing = [k for k in expected if k not in kinds_hit]
        print("SELFTEST-FAIL: every pattern kind must have a firing fixture; missing:", ", ".join(missing))
        sys.exit(2)
    print("SELFTEST-OK: all %d pattern kinds fire on their fixture, zero clean false-positives" % len(expected))


def main():
    if "--selftest" in sys.argv:
        selftest()
        return
    files = staged_files()
    if not files:
        print("FATAL: nothing staged to scan")
        sys.exit(2)
    skipped = [f for f in files if os.path.basename(f) == SELF]
    files = [f for f in files if os.path.basename(f) != SELF]
    print(f"scanning {len(files)} staged files (self excluded: {len(skipped)}) ...")
    all_hits = []
    for name in files:
        try:
            with open(name, "r", encoding="utf-8", errors="replace") as f:
                all_hits.extend(scan_text(name, f.read()))
        except OSError as e:
            print(f"WARN: unreadable staged file {name}: {e}")
    if all_hits:
        print(f"HITS: {len(all_hits)}")
        for h in all_hits:
            print("  " + h)
        sys.exit(1)
    print("CLEAN: no sensitive patterns in staged set")


if __name__ == "__main__":
    main()

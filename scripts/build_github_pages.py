#!/usr/bin/env python3
"""Build a GitHub Pages artifact from the portfolio's static public directory."""

from pathlib import Path
import shutil

SOURCE = Path("public")
OUTPUT = Path("_site")

if not SOURCE.is_dir():
    raise SystemExit("Expected the static portfolio in ./public")

if OUTPUT.exists():
    shutil.rmtree(OUTPUT)

shutil.copytree(SOURCE, OUTPUT)

index = OUTPUT / "index.html"
html = index.read_text(encoding="utf-8")
# GitHub Pages serves project sites from /<repository>/, so root-absolute assets
# would otherwise resolve outside this portfolio. Keep deployed asset paths relative.
html = html.replace('="/assets/', '="assets/')
index.write_text(html, encoding="utf-8")

print(f"Prepared GitHub Pages artifact in {OUTPUT}")

# ContentGraph — Standalone Script Analysis

A single-file script coaching tool. Analyzes talk scripts for science claims, metaphors, logic gaps, and engagement arc.

## Usage

Open `scriptsense.html` in any browser. No build step, no dependencies to install.

## Features

- **Script editor** with inline highlight overlays
- **Insight cards**: science claims, metaphors (with 8-country localizations), logic gaps
- **Engagement arc** chart with per-paragraph scoring
- **Rephrase suggestions** with one-click apply
- **Auto-save** drafts to localStorage
- **Country selector** for localized metaphor variants

## Branding

Uses the ContentGraph "Chalk" design system:
- DM Sans + IBM Plex Mono typography
- Green accent (#0DBF5A) with AAA contrast compliance
- Light theme only, desktop only

## Current mode

Running with **mock data** — click "Generate insights" to see sample analysis instantly. To switch to live Claude API, replace the `callClaude` function with the Anthropic API call and provide your key.

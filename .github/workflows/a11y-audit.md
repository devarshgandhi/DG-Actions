---
on:
  schedule: daily
  workflow_dispatch:

steps:
  - uses: actions/checkout@v6
    with:
      persist-credentials: false

  - uses: actions/setup-python@v6
    with:
      python-version: "3.13"

  - uses: actions/setup-node@v6
    with:
      node-version: "24"
      cache: npm
      cache-dependency-path: app/client/package-lock.json

  - name: Install Python dependencies
    working-directory: app/server
    run: |
      python -m pip install --upgrade pip
      pip install -r requirements.txt

  - name: Install Node dependencies
    working-directory: app/client
    run: npm ci

  - name: Start dev servers
    working-directory: app/client
    env:
      PYTHON: python
    run: |
      node start-test-server.mjs &
      npx cross-env API_SERVER_URL=http://localhost:5100 npm run dev -- --no-clearScreen &

  - name: Wait for servers
    run: |
      for i in $(seq 1 30); do
        curl -sf http://localhost:4321/ >/dev/null 2>&1 && exit 0
        sleep 1
      done
      echo "Server did not start in time"
      exit 1

tools:
  playwright:
    mode: cli
  bash:
    - "curl http://localhost:*"

network:
  allowed:
    - defaults
    - playwright
    - local
    - node
    - python

permissions:
  contents: read
  issues: read

safe-outputs:
  create-issue:
    title-prefix: "[a11y] "
    labels: [accessibility, automated-audit]
    close-older-issues: true
---

# Accessibility Audit — Tailspin Shelter

You are an accessibility auditor. Use Playwright to check the Tailspin Shelter
application for WCAG 2.1 Level AA compliance.

The dev server is running at http://localhost:4321/.

## Pages to Audit

Check each of these pages:

1. **Homepage** — `http://localhost:4321/`
2. **About page** — `http://localhost:4321/about`
3. **Dog details page** — `http://localhost:4321/dog/1`

## For Each Page

1. Navigate to the page:
   ```bash
   playwright-cli browser_navigate --url "http://localhost:4321/"
   ```

2. Take a snapshot of the page accessibility tree:
   ```bash
   playwright-cli browser_snapshot
   ```

3. Check for these WCAG 2.1 Level AA issues:
   - **Images without alt text** (WCAG 1.1.1)
   - **Insufficient color contrast** (WCAG 1.4.3)
   - **Missing form labels** (WCAG 1.3.1)
   - **Missing ARIA landmarks** (WCAG 1.3.1)
   - **Missing page language attribute** (WCAG 3.1.1)
   - **Missing skip navigation links** (WCAG 2.4.1)
   - **Heading hierarchy issues** (WCAG 1.3.1)
   - **Interactive elements without accessible names** (WCAG 4.1.2)
   - **Missing focus indicators** (WCAG 2.4.7)
   - **Non-descriptive link text** (WCAG 2.4.4)

4. Also evaluate the page using JavaScript to run automated checks:
   ```bash
   playwright-cli browser_evaluate --expression "JSON.stringify({
     title: document.title,
     lang: document.documentElement.lang,
     headings: [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].map(h => ({level: h.tagName, text: h.textContent.trim()})),
     images: [...document.querySelectorAll('img')].map(img => ({src: img.src, alt: img.alt, hasAlt: img.hasAttribute('alt')})),
     links: [...document.querySelectorAll('a')].map(a => ({href: a.href, text: a.textContent.trim(), ariaLabel: a.getAttribute('aria-label')})),
     forms: [...document.querySelectorAll('input,select,textarea')].map(el => ({type: el.type, id: el.id, label: el.labels?.[0]?.textContent})),
     landmarks: [...document.querySelectorAll('[role]')].map(el => ({role: el.getAttribute('role'), tag: el.tagName}))
   }, null, 2)"
   ```

## Report

Create a single GitHub issue summarizing all findings across all pages.
Organize the issue body as follows:

### Issue Structure

- **Title**: `Accessibility audit results — <date>`
- **Summary**: Brief overview of how many issues found across how many pages
- **Per-page sections**: For each page, list the issues found with:
  - The WCAG criterion violated
  - What element is affected
  - A recommended fix
- **Priority**: Label issues as Critical, Major, or Minor
- **Recommendations**: Top 3 most impactful fixes to make first

If no issues are found, still create an issue confirming the audit passed.

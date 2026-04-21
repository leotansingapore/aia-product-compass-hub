// Check whether mermaid diagrams render as SVG on each First 14 Days page.
import { chromium } from "@playwright/test";

const BASE = "http://localhost:8080";
const EMAIL = process.env.AUDIT_EMAIL ?? "tanjunsing@gmail.com";
const PASSWORD = process.env.AUDIT_PASSWORD ?? "Leotantemppass1";

const DAYS_WITH_MERMAID = [3, 6, 7, 8, 9, 14]; // day 8 has 2 blocks

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(`${BASE}/auth`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(3000);
  await page.getByPlaceholder("you@example.com").first().fill(EMAIL);
  await page.getByPlaceholder("Enter your password").first().fill(PASSWORD);
  await Promise.all([
    page.waitForURL((u) => !u.pathname.startsWith("/auth"), { timeout: 45000 }).catch(() => {}),
    page.getByRole("button", { name: /^sign in$/i }).click(),
  ]);
  await page.waitForLoadState("networkidle", { timeout: 30000 }).catch(() => {});

  for (const day of DAYS_WITH_MERMAID) {
    await page.goto(`${BASE}/learning-track/first-14-days/day/${day}`, { waitUntil: "networkidle" });
    await page.waitForTimeout(2500);
    // Scroll through the whole page so lazy-rendered mermaid below the fold can mount
    await page.evaluate(async () => {
      const step = window.innerHeight * 0.8;
      const max = document.documentElement.scrollHeight;
      for (let y = 0; y < max; y += step) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 150));
      }
      window.scrollTo(0, 0);
    });
    await page.waitForTimeout(1500);
    const mermaidStats = await page.evaluate(() => {
      const containers = Array.from(document.querySelectorAll('[class*="mermaid" i], div[data-mermaid], .mermaid, svg[id*="mermaid" i]'));
      const svgs = Array.from(document.querySelectorAll("svg"));
      // Heuristic: mermaid SVGs typically have aria-roledescription or id starting with "mermaid"
      const mermaidSvgs = svgs.filter((s) => {
        const id = s.getAttribute("id") ?? "";
        const role = s.getAttribute("aria-roledescription") ?? "";
        return id.toLowerCase().includes("mermaid") || role.length > 0 || (s.outerHTML || "").includes("mermaid");
      });
      const parseErrors = document.body.innerText.match(/Syntax error|mermaid\s*error|Parse error/gi) ?? [];
      return {
        containers: containers.length,
        svgCount: svgs.length,
        mermaidSvgs: mermaidSvgs.length,
        parseErrors,
      };
    });
    console.log(`day ${day}: svgs=${mermaidStats.svgCount} mermaidSvgs=${mermaidStats.mermaidSvgs} parseErrors=${mermaidStats.parseErrors.length}`);
    if (mermaidStats.parseErrors.length > 0) {
      console.log(`  errors:`, mermaidStats.parseErrors.slice(0, 3));
    }
  }
  await browser.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});

const { chromium } = require('playwright');
const AxeBuilder = require('@axe-core/playwright').default;

const routes = [
  '/',
  '/discover',
  '/profile/u1',
  '/dashboard',
  '/my-skills',
  '/requests',
  '/exchanges'
];

const viewports = [
  { name: 'Mobile', width: 375, height: 667 },
  { name: 'Tablet', width: 768, height: 1024 },
  { name: 'Desktop', width: 1024, height: 768 },
  { name: 'Large Desktop', width: 1280, height: 800 }
];

async function runTests() {
  const browser = await chromium.launch();
  let anyErrors = false;

  console.log("=== RUNTIME ERRORS ===");
  for (const route of routes) {
    const context = await browser.newContext();
    const page = await context.newPage();
    const url = `http://localhost:3000${route}`;

    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log(`[${route}] Console Error:`, msg.text());
        anyErrors = true;
      }
    });

    page.on('pageerror', error => {
      console.log(`[${route}] Runtime Error:`, error.message);
      anyErrors = true;
    });

    const response = await page.goto(url);
    if (!response || !response.ok()) {
      console.log(`[${route}] Failed to load: ${response ? response.status() : 'Unknown error'}`);
      anyErrors = true;
    } else {
      console.log(`[${route}] Loaded OK`);
    }

    await context.close();
  }

  if (!anyErrors) {
    console.log("No console/runtime errors found.");
  }

  console.log("\n=== RESPONSIVE OVERFLOW TESTS ===");
  for (const route of routes) {
    for (const vp of viewports) {
      const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
      const page = await context.newPage();
      await page.goto(`http://localhost:3000${route}`);
      
      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      if (scrollWidth > vp.width) {
        console.log(`WARNING: Horizontal scrolling detected on [${route}] at ${vp.name} (${vp.width}px). Scroll width: ${scrollWidth}px`);
      }
      await context.close();
    }
  }

  console.log("\n=== ACCESSIBILITY (AXE) ===");
  for (const route of routes) {
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto(`http://localhost:3000${route}`);

    try {
      const results = await new AxeBuilder({ page }).analyze();
      if (results.violations.length === 0) {
        console.log(`[${route}] No accessibility violations found.`);
      } else {
        console.log(`[${route}] ${results.violations.length} violations found:`);
        results.violations.forEach(v => {
          console.log(`  - ${v.id} (${v.impact}): ${v.description}`);
          v.nodes.forEach(n => console.log(`    Target: ${n.target.join(', ')}`));
        });
      }
    } catch (e) {
      console.error(`[${route}] Axe analysis failed:`, e.message);
    }
    await context.close();
  }

  await browser.close();
}

runTests().catch(console.error);

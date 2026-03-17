import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 393, height: 852 } });
await page.goto('http://localhost:5173/bracket', { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);

// Screenshot just the bracket preview element
const el = await page.$('#bracket-preview');
if (el) {
  await el.screenshot({ path: '.context/attachments/current-state.png' });
  console.log('Screenshot saved');
} else {
  console.log('Element not found, taking full page');
  await page.screenshot({ path: '.context/attachments/current-state.png', fullPage: true });
}
await browser.close();

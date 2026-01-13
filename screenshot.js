const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1200, height: 900 } });
  await page.goto('http://localhost:5173');
  
  // Wait for page to load
  await page.waitForTimeout(1500);
  
  // Click on Trade Slip Maker button
  const tradeSlipBtn = await page.locator('text=Trade Slip Maker').first();
  if (await tradeSlipBtn.isVisible()) {
    await tradeSlipBtn.click();
    await page.waitForTimeout(1000);
  }
  
  // Take screenshot of the trade slip preview area
  await page.screenshot({ path: '/tmp/tradeslip.png', fullPage: false });
  
  console.log('Screenshot saved to /tmp/tradeslip.png');
  await browser.close();
})();

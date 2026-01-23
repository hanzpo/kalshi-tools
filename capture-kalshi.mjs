import { chromium } from 'playwright';
import fs from 'fs';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1200 } });
  
  console.log('Navigating to Kalshi market page...');
  await page.goto('https://kalshi.com/markets/kxpresperson/pres-person/kxpresperson-28', { 
    waitUntil: 'domcontentloaded',
    timeout: 90000 
  });
  
  // Wait for content to load
  await page.waitForTimeout(8000);
  
  // Take full page screenshot
  await page.screenshot({ 
    path: '/tmp/kalshi-market2-full.png',
    fullPage: true 
  });
  console.log('Full page screenshot saved');
  
  // Take viewport screenshot
  await page.screenshot({ 
    path: '/tmp/kalshi-market2-viewport.png'
  });
  console.log('Viewport screenshot saved');
  
  await browser.close();
  console.log('Done!');
})();

const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  await page.goto('http://localhost:5173');
  await new Promise(r => setTimeout(r, 1000));
  const tabs = await page.$$('.sidebar-btn');
  console.log('Found tabs:', tabs.length);
  for (let tab of tabs) {
    const text = await page.evaluate(el => el.textContent, tab);
    console.log('Tab text:', text);
    if (text.includes('Opportunity Cost')) {
      await tab.click();
      console.log('Clicked Opportunity Cost tab');
    }
  }
  await new Promise(r => setTimeout(r, 1000));
  await browser.close();
})();

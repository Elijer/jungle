import { chromium, test } from '@playwright/test';

let c = {
  loops: 400,
  maxDuration: 200,
  tests: 4,
  timeout: 100000
}

let direction = ['W', 'A', 'S', 'D'];

let mC = async (page) => {
  let randomIndex = Math.floor(Math.random() * 4);
  await page.keyboard.press(direction[randomIndex]);
  let duration = Math.random() * c.maxDuration / 10;
  await page.waitForTimeout(duration);
}

test.describe.configure({ mode: 'parallel', timeout: c.timeout });

for (let i = 0; i < c.tests; i++) {
  test(`memory test-${i}`, async () => {

    const browser = await chromium.launch();
    const context = await browser.newContext();
    const page = await context.newPage();

    // Replace with the URL of the page you want to test
    const url = 'http://localhost:5173/';

    let memoryUsageData: number[] = [];
    let startTime = Date.now();

    // Start memory usage collection
    const intervalId = setInterval(async () => {
      const memory = await page.evaluate(() => {
        const performance = window.performance as Performance & { memory?: any };
        if (performance && performance.memory) {
          return {
            jsHeapSizeLimit: performance.memory.jsHeapSizeLimit,
            totalJSHeapSize: performance.memory.totalJSHeapSize,
            usedJSHeapSize: performance.memory.usedJSHeapSize,
          };
        }
        return null;
      });
      if (memory) {
        memoryUsageData.push(memory.usedJSHeapSize / 1024 / 1024); // Convert bytes to MB
      }
    }, 1000); // Collect data every second

    await page.goto(url);

    for (let j = 0; j < c.loops; j++) {
      await mC(page);
    }
    // Stop memory usage collection
    clearInterval(intervalId);

    await new Promise(resolve => setTimeout(resolve, 1500 + i * 10));

    // Calculate the statistics
    const duration = (Date.now() - startTime) / 1000; // in seconds
    const minMemoryUsage = Math.min(...memoryUsageData);
    const maxMemoryUsage = Math.max(...memoryUsageData);
    const avgMemoryUsage = memoryUsageData.reduce((a, b) => a + b, 0) / memoryUsageData.length;
    console.log(avgMemoryUsage)

    await fetch('http://localhost:3088/report/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ avgMemoryUsage, maxMemoryUsage, minMemoryUsage})
    })

    // Generate the report
    const report = `
      Test Duration: ${duration}s
      Minimum Memory Usage: ${minMemoryUsage.toFixed(2)} MB
      Maximum Memory Usage: ${maxMemoryUsage.toFixed(2)} MB
      Average Memory Usage: ${avgMemoryUsage.toFixed(2)} MB
    `;

    console.log(report);
    await page.waitForTimeout(1000);
    await context.close()
    // await browser.close();
  });
}
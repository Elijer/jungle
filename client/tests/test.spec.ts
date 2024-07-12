import { test, expect } from '@playwright/test';

let direction = ['W', 'A', 'S', 'D'];

let mC = async (page) => {
  let randomIndex = Math.floor(Math.random() * 4);
  await page.keyboard.press(direction[randomIndex]);
  let duration = Math.random() * 200
  await page.waitForTimeout(10 * duration);
}

test.describe.configure({mode: 'parallel'});

for (let i = 0; i < 30; i++) {
  setTimeout(() => {}, 300 * i)
  test(`suite ${i}`, async ({ page }) => {
    // await page.goto('http://localhost:5173/');
    await page.goto('http://localhost:5173/');
    await page.locator('body').click();
    await page.locator('canvas').click({
      position: {
        x: 647,
        y: 358
      }
    });

    for (let j = 0; j < 500; j++) {
      await mC(page);
    }
  });
}

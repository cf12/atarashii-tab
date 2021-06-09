const { chromium } = require("playwright")
const path = require("path")

const extPath = path.join(__dirname, "../build/index.html")
const num = 5

;(async () => {
  const browser = await chromium.launch({
    headless: false,
    args: ["--disable-web-security"],
  })

  const page = await browser.newPage()
  await page.goto(`file://${extPath}`)
  await page.setViewportSize({ width: 1280, height: 800 })

  for (let i = 0; i < num; i++) {
    await page.goto(`file://${extPath}`, { waitUntil: "networkidle0" })
    await page.waitForTimeout(2000)
    await page.screenshot({
      path: path.join(__dirname, `screenshots_${i + 1}.png`),
    })
  }

  await browser.close()
})()

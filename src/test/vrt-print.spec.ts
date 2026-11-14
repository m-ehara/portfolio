import { expect, test } from "@playwright/test"
import {
  setupVrtHooks,
  stabilizeForScreenshot,
  waitForPageReady,
} from "./helpers/vrt-helpers"

test.describe("Portfolio Visual Regression Tests - Skill Sheet & Print View", () => {
  test.beforeEach(async ({ page }) => {
    await setupVrtHooks(page)
  })

  test("1. renders skill sheet (screen preview & @media print emulation) accurately", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 900 })
    await page.goto("/")
    await waitForPageReady(page)

    const sheetToggleBtn = page
      .getByRole("button", { name: /職務経歴書モード|Resume \/ Print View/i })
      .first()
    await sheetToggleBtn.click()

    await expect(
      page.getByRole("heading", {
        name: /経歴・スキルシート|Curriculum Vitae & Skill Sheet/i,
      }),
    ).toBeVisible()

    await stabilizeForScreenshot(page)
    await expect(page).toHaveScreenshot("desktop-resume-sheet.png", {
      fullPage: true,
      animations: "disabled",
    })

    // Emulate @media print and verify .no-print elements are hidden
    await page.emulateMedia({ media: "print" })
    await expect(page.locator("header")).toBeHidden()

    await stabilizeForScreenshot(page)
    await expect(page).toHaveScreenshot("desktop-resume-print.png", {
      fullPage: true,
      animations: "disabled",
    })
  })
})

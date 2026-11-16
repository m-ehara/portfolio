import { expect, test } from "@playwright/test"
import {
  setupVrtHooks,
  stabilizeForScreenshot,
  waitForPageReady,
} from "./helper"

test.describe("Portfolio Visual Regression Tests - Mobile Viewport", () => {
  test.beforeEach(async ({ page }) => {
    await setupVrtHooks(page)
  })

  test("1. renders mobile viewport and expanded hamburger menu drawer", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto("/")
    await waitForPageReady(page)

    const menuBtn = page.getByRole("button", { name: "Toggle Menu" })
    await expect(menuBtn).toBeVisible()
    await expect(menuBtn).toHaveAttribute("aria-expanded", "false")

    await stabilizeForScreenshot(page)
    await expect(page).toHaveScreenshot("mobile-dark-top.png", {
      animations: "disabled",
    })

    await menuBtn.click()
    await expect(menuBtn).toHaveAttribute("aria-expanded", "true")
    await expect(
      page.getByRole("dialog", { name: "Mobile Navigation" }),
    ).toBeVisible()

    await stabilizeForScreenshot(page)
    await expect(page).toHaveScreenshot("mobile-menu-open.png", {
      animations: "disabled",
    })
  })
})

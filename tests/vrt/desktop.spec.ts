import { expect, test } from "@playwright/test"
import { setupVrtHooks, stabilizeForScreenshot, waitForPageReady } from "./helper"

test.describe("Portfolio Visual Regression Tests - Desktop Viewport", () => {
  test.beforeEach(async ({ page }) => {
    await setupVrtHooks(page)
  })

  test("1. renders desktop dark theme full page (JA)", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    await page.goto("/")
    await waitForPageReady(page)

    await expect(page.locator("#about")).toBeVisible()
    await expect(page.locator("#skills")).toBeVisible()
    await expect(page.locator("#projects")).toBeVisible()

    const fontSizeBase = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue("--font-size-base").trim(),
    )
    expect(fontSizeBase).toBe("1rem")

    await stabilizeForScreenshot(page)
    await expect(page).toHaveScreenshot("desktop-dark-full.png", {
      fullPage: true,
      animations: "disabled",
    })
  })

  test("2. renders desktop light theme full page (JA)", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    await page.goto("/")
    await waitForPageReady(page)

    const themeBtn = page.getByRole("button", { name: "Toggle Theme" })
    await themeBtn.click()

    await expect(page.locator("html")).toHaveAttribute("data-theme", "light")

    await stabilizeForScreenshot(page)
    await expect(page).toHaveScreenshot("desktop-light-full.png", {
      fullPage: true,
      animations: "disabled",
    })
  })

  test("3. renders desktop English (EN) locale full page without text overflow", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    await page.goto("/")
    await waitForPageReady(page)

    const langBtn = page.getByRole("button", { name: "Toggle Language" })
    await langBtn.click()

    await expect(page.getByRole("heading", { name: "Core Strengths & Specialties" })).toBeVisible()
    await expect(page.getByRole("heading", { name: "Technical Skills Matrix" })).toBeVisible()

    await stabilizeForScreenshot(page)
    await expect(page).toHaveScreenshot("desktop-en-full.png", {
      fullPage: true,
      animations: "disabled",
    })
  })

  test("4. renders active filter states (.skillSelected, .activeFilterTag, .resetBtn) and empty states (.empty-state)", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    await page.goto("/")
    await waitForPageReady(page)

    // Select a category tab and click a skill card to activate cross-section filtering
    const fwTab = page.getByRole("tab", { name: "FW / ライブラリ" })
    await fwTab.click()
    await expect(fwTab).toHaveAttribute("aria-selected", "true")

    const reactSkillBtn = page.locator("#skills").getByRole("button", { name: /React/i }).first()
    await reactSkillBtn.click()

    // Select PM role filter in Projects section
    const pmRoleBtn = page.locator("#projects").getByRole("button", { name: "PM", exact: true })
    await pmRoleBtn.click()

    const resetBtn = page
      .locator("#projects")
      .getByRole("button", { name: /フィルタ解除|Reset Filters/i })
    await expect(resetBtn).toBeVisible()
    await expect(page.locator("#projects")).toContainText("Tech:")

    await stabilizeForScreenshot(page)
    await expect(page).toHaveScreenshot("desktop-filtered-active.png", {
      fullPage: true,
      animations: "disabled",
    })

    // Trigger empty states (.empty-state) in both Skills and Projects sections
    const skillSearch = page.getByRole("searchbox", {
      name: /スキルを検索|Search skills/i,
    })
    await skillSearch.fill("NonExistentSkillXYZ")
    await expect(page.getByText("条件に一致するスキルが見つかりませんでした。")).toBeVisible()

    const projectSearch = page.getByRole("searchbox", {
      name: /案件名・技術・キーワードで検索|Search by title, tech, or keyword/i,
    })
    await projectSearch.fill("NonExistentProjectXYZ")
    await expect(page.getByText("条件に一致する案件が見つかりませんでした。")).toBeVisible()

    await stabilizeForScreenshot(page)
    await expect(page).toHaveScreenshot("desktop-empty-states.png", {
      fullPage: true,
      animations: "disabled",
    })
  })

  test("5. renders QR code share modal dialog and copied state accurately", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    await page.goto("/")
    await waitForPageReady(page)

    const qrBtn = page.getByRole("button", { name: "Open QR Code Modal" })
    await qrBtn.click()

    const dialog = page.getByRole("dialog", { name: "QR Code Modal" })
    await expect(dialog).toBeVisible()
    await expect(dialog.getByRole("img", { name: /QR Code for/i })).toBeVisible()

    const copyBtn = dialog.getByRole("button", {
      name: /URLをコピー|Copy URL/i,
    })
    await copyBtn.click()
    await expect(dialog.getByRole("button", { name: /コピー済み|Copied!/i })).toBeVisible()

    await stabilizeForScreenshot(page)
    await expect(page).toHaveScreenshot("desktop-qr-modal.png", {
      animations: "disabled",
    })
  })
})

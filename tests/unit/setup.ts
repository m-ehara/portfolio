import "@testing-library/jest-dom/vitest"
import { beforeEach } from "vitest"
import { PORTFOLIO_DATA_STORAGE_KEY, TURNSTILE_VERIFY_STORAGE_KEY } from "../../src/data/constants"

beforeEach(() => {
  window.sessionStorage.removeItem(PORTFOLIO_DATA_STORAGE_KEY)
  window.sessionStorage.setItem(TURNSTILE_VERIFY_STORAGE_KEY, "true")
})

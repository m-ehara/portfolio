import { expect, type Page } from "@playwright/test"

// Web フォント（Google Fonts）は @font-face が「ウェイト × unicode-range サブセット」単位で
// 遅延ロードされるため、言語切替などで新しいグリフ / ウェイトが必要になった直後は
// `document.fonts.ready` が未ロードのフェイスを待たずに解決してしまうことがある。
// 撮影前に、現在表示中のテキストに必要な全ファミリー・全ウェイトを明示的にロードする。
export const FONT_FAMILIES = ['"Inter"', '"Noto Sans JP"', '"JetBrains Mono"']
export const FONT_WEIGHTS = [400, 500, 600, 700, 800]

/**
 * App.tsx 内の el.scrollIntoView({ behavior: "smooth" }) 等による
 * JS 指定の非同期スムーズスクロール（CSS scroll-behavior: auto を上書きする）を
 * 即時（instant）に強制変換する initScript を登録する。
 */
export const setupVrtHooks = async (page: Page): Promise<void> => {
  // 動的計算される年月（updatedAt / 実務経験年数 / フリーランス歴）が月替わりで変化して
  // VRT スナップショットが Flaky にならないよう、VRT 実行時のシステム時刻を固定する
  await page.clock.setFixedTime(new Date("2026-10-15T12:00:00+09:00"))
  await page.addInitScript(() => {
    window.sessionStorage.setItem("portfolio_turnstile_verified", "true")
    Element.prototype.scrollIntoView = new Proxy(
      Element.prototype.scrollIntoView,
      {
        apply: (target, thisArg, args) => {
          const first = args[0]
          if (
            first &&
            typeof first === "object" &&
            first.behavior === "smooth"
          ) {
            return Reflect.apply(target, thisArg, [
              { ...first, behavior: "instant" },
            ])
          }
          return Reflect.apply(target, thisArg, args)
        },
      },
    )
  })
}

/**
 * ページのネットワークアイドル待機および表示中テキストのフォント完全読み込みを待機する。
 */
export const waitForPageReady = async (page: Page): Promise<void> => {
  await page.waitForLoadState("networkidle")
  await page.evaluate(
    async ({ families, weights }) => {
      document.documentElement.style.scrollBehavior = "auto"
      const text = document.body.innerText
      await Promise.all(
        families.flatMap((family) =>
          weights.map((weight) =>
            document.fonts.load(`${weight} 16px ${family}`, text),
          ),
        ),
      )
      await document.fonts.ready
    },
    { families: FONT_FAMILIES, weights: FONT_WEIGHTS },
  )
}

/**
 * スクリーンショット撮影前の表示安定化処理:
 * 1. カーソルを (0, 0) に移動し、ホバー解除
 * 2. アクティブ要素のフォーカス解除（blur）
 * 3. 画面内テキストのフォント完全ロード確認
 * 4. スクロール座標を (0, 0) にリセット
 * 5. コンポジタ層キャッシュのリセットと 2 フレーム描画待ち
 * 6. スクロール位置が 0 であることを検証
 */
export const stabilizeForScreenshot = async (page: Page): Promise<void> => {
  // クリック後のマウスホバー状態（:hover スタイル）を撮影に持ち込まない
  await page.mouse.move(0, 0)

  await page.evaluate(
    async ({ families, weights }) => {
      document.documentElement.style.scrollBehavior = "auto"
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur()
      }

      const text = document.body.innerText
      await Promise.all(
        families.flatMap((family) =>
          weights.map((weight) =>
            document.fonts.load(`${weight} 16px ${family}`, text),
          ),
        ),
      )
      await document.fonts.ready

      window.scrollTo({ top: 0, left: 0, behavior: "instant" })

      // スクロール操作中に小数ピクセル座標でラスタライズされたコンポジタタイルキャッシュを破棄し、
      // 座標 (0, 0) で確実に再ラスタライズさせる
      document.documentElement.style.transform = "translateZ(0)"
      void document.documentElement.offsetHeight
      document.documentElement.style.transform = ""
      void document.documentElement.offsetHeight

      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => resolve())
        })
      })
    },
    { families: FONT_FAMILIES, weights: FONT_WEIGHTS },
  )

  const scrollY = await page.evaluate(() => window.scrollY)
  expect(scrollY).toBe(0)
}

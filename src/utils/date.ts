import type { LocalizedText, ProjectItem, YearMonth } from "../types/portfolio"

export type TimeReference = YearMonth | number | Date

const EN_MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const

const JST_YEAR_MONTH_FORMATTER = new Intl.DateTimeFormat("en-US", {
  timeZone: "Asia/Tokyo",
  year: "numeric",
  month: "numeric",
})

/**
 * 標準 Intl.DateTimeFormat (timeZone: "Asia/Tokyo") を用い、
 * 実行環境のローカルタイムゾーンや getMonth() の 0 始まり仕様に依存せず
 * 日本時間（JST）基準の「年」と「月（1〜12）」を抽出する。
 */
const getCurrentYearMonth = (reference?: TimeReference): YearMonth => {
  if (
    reference &&
    typeof reference === "object" &&
    "year" in reference &&
    "month" in reference
  ) {
    return { year: reference.year, month: reference.month }
  }

  const parts = JST_YEAR_MONTH_FORMATTER.formatToParts(reference ?? Date.now())
  const yearPart = parts.find((part) => part.type === "year")?.value
  const monthPart = parts.find((part) => part.type === "month")?.value

  return {
    year: Number(yearPart),
    month: Number(monthPart),
  }
}

/**
 * 基準年月を "YYYY/MM" 形式の文字列にフォーマットする（例: "2026/11"）。
 */
export const formatYearMonthSlash = (reference?: TimeReference): string => {
  const { year, month } = getCurrentYearMonth(reference)
  return `${year}/${String(month).padStart(2, "0")}`
}

/**
 * 開始年月から基準時点（JST）までの満年数を算出する。
 * 日数や時刻・うるう年の影響を受けない年月比較のみで決定論的に計算する。
 */
export const calculateElapsedYears = (
  start: YearMonth,
  reference?: TimeReference,
): number => {
  const { year: currentYear, month: currentMonth } =
    getCurrentYearMonth(reference)
  let years = currentYear - start.year
  if (currentMonth < start.month) {
    years -= 1
  }
  return Math.max(0, years)
}

/**
 * 満年数を日英のメトリクス表記（例: "13年+" / "13+ yrs"）にフォーマットする。
 */
export const formatElapsedYearsLabel = (years: number): LocalizedText => ({
  ja: `${years}年+`,
  en: `${years}+ yrs`,
})

/**
 * 開始年月と終了年月（省略時は現在年月）から在籍・参画月数（両端入れ）を算出する。
 */
export const calculateDurationMonths = (
  start: YearMonth,
  end?: YearMonth,
  reference?: TimeReference,
): number => {
  const resolvedEnd = end ?? getCurrentYearMonth(reference)
  const totalMonths =
    (resolvedEnd.year - start.year) * 12 + (resolvedEnd.month - start.month) + 1
  return Math.max(1, totalMonths)
}

/**
 * 月数を日英の期間バッジ表記（例: "14ヶ月間" / "14 mos"）にフォーマットする。
 */
export const formatDurationLabel = (months: number): LocalizedText => ({
  ja: `${months}ヶ月間`,
  en: months === 1 ? "1 mo" : `${months} mos`,
})

/**
 * 開始年月と終了年月（省略時は「現在 / Present」）から日英の期間文字列を生成する。
 */
const formatPeriodRange = (
  start: YearMonth,
  end?: YearMonth,
): LocalizedText => {
  const startMonthEn = EN_MONTH_NAMES[start.month - 1] ?? "Jan"
  const startJa = `${start.year}年${start.month}月`
  const startEn = `${startMonthEn} ${start.year}`

  if (!end) {
    return {
      ja: `${startJa} ～ 現在`,
      en: `${startEn} – Present`,
    }
  }

  const endMonthEn = EN_MONTH_NAMES[end.month - 1] ?? "Jan"
  const endJa = `${end.year}年${end.month}月`
  const endEn = `${endMonthEn} ${end.year}`

  return {
    ja: `${startJa} ～ ${endJa}`,
    en: `${startEn} – ${endEn}`,
  }
}

/**
 * 案件データの period, durationMonths, durationLabel を開始・終了年月から一括生成する。
 */
export const buildProjectPeriod = (
  start: YearMonth,
  end?: YearMonth,
  reference?: TimeReference,
): Pick<ProjectItem, "period" | "durationMonths" | "durationLabel"> => {
  const durationMonths = calculateDurationMonths(start, end, reference)
  return {
    period: formatPeriodRange(start, end),
    durationMonths,
    durationLabel: formatDurationLabel(durationMonths),
  }
}

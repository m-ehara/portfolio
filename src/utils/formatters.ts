import { UI_TEXT } from "../data/i18n"
import type { Locale, ProjectItem } from "../types/portfolio"

export const formatTeamSizeItems = (
  teamSize: ProjectItem["teamSize"],
  locale: Locale,
): string[] => {
  const t = UI_TEXT[locale]
  const items: string[] = []

  if (teamSize.team) {
    items.push(`${t.teamLabel} ${teamSize.team}${t.teamUnit}`)
  }
  if (teamSize.dev) {
    items.push(`${t.devLabel} ${teamSize.dev}${t.teamUnit}`)
  }
  if (teamSize.maintenance) {
    items.push(`${t.maintLabel} ${teamSize.maintenance}${t.teamUnit}`)
  }
  items.push(`${t.totalLabel} ${teamSize.total}${t.teamUnit}`)

  return items
}

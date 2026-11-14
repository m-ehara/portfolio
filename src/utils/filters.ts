import { RANK_SCORE } from "../data/constants"
import type {
  Locale,
  ProjectItem,
  SkillCategoryKey,
  SkillItem,
  SkillRank,
} from "../types/portfolio"

export interface FilterSkillsOptions {
  category?: SkillCategoryKey | "all"
  minRank?: SkillRank | "all"
  query?: string
}

export const filterSkills = (
  skills: SkillItem[],
  options: FilterSkillsOptions,
): SkillItem[] => {
  const { category = "all", minRank = "all", query = "" } = options
  const normalizedQuery = query.trim().toLowerCase()

  return skills.filter((skill) => {
    if (category !== "all" && skill.category !== category) {
      return false
    }
    if (minRank !== "all" && RANK_SCORE[skill.rank] < RANK_SCORE[minRank]) {
      return false
    }
    if (normalizedQuery) {
      return skill.name.toLowerCase().includes(normalizedQuery)
    }
    return true
  })
}

export interface FilterProjectsOptions {
  role?: string
  tech?: string
  query?: string
  locale?: Locale
}

export const filterProjects = (
  projects: ProjectItem[],
  options: FilterProjectsOptions,
): ProjectItem[] => {
  const { role = "all", tech = "all", query = "" } = options
  const normalizedQuery = query.trim().toLowerCase()

  return projects.filter((project) => {
    if (role !== "all" && !project.roles.includes(role)) {
      return false
    }
    if (tech !== "all") {
      const allTechs = [
        ...project.languages,
        ...project.databases,
        ...project.serverOs,
        ...project.frameworksAndTools,
      ].map((t) => t.toLowerCase())
      const target = tech.toLowerCase()
      const matched = allTechs.some(
        (t) => t === target || t.includes(target) || target.includes(t),
      )
      if (!matched) {
        return false
      }
    }
    if (normalizedQuery) {
      const searchable = [
        project.title.ja,
        project.title.en,
        project.responsibilities.ja,
        project.responsibilities.en,
        project.comment.ja,
        project.comment.en,
        project.evaluation?.ja ?? "",
        project.evaluation?.en ?? "",
        ...project.languages,
        ...project.databases,
        ...project.serverOs,
        ...project.frameworksAndTools,
        ...project.acquiredSkills.flatMap((s) => [s.ja, s.en]),
      ]
        .join(" ")
        .toLowerCase()

      if (!searchable.includes(normalizedQuery)) {
        return false
      }
    }
    return true
  })
}

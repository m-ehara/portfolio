import { RANK_SCORE } from "../data/constants"
import type {
  ProjectItem,
  SkillCategoryKey,
  SkillItem,
  SkillRank,
} from "../types/portfolio"

interface FilterSkillsOptions {
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

const normalizeTechToken = (token: string): string =>
  token
    .toLowerCase()
    .replace(/\.js$/, "")
    .replace(/^(html|css)\d+$/, "$1")

const tokenizeTech = (text: string): string[] =>
  text
    .split(/[\s/(),]+/)
    .map(normalizeTechToken)
    .filter(Boolean)

const parseTechVariants = (value: string): string[][] => {
  const trimmed = value.trim()
  if (!trimmed) {
    return []
  }
  const parts = trimmed.includes("/")
    ? [trimmed, ...trimmed.split("/")]
    : [trimmed]
  const variants: string[][] = []
  for (const part of parts) {
    const tokens = tokenizeTech(part)
    if (tokens.length > 0) {
      variants.push(tokens)
    }
  }
  return variants
}

const containsTokenSequence = (
  haystack: string[],
  needle: string[],
): boolean => {
  if (needle.length === 0 || needle.length > haystack.length) {
    return false
  }
  for (let i = 0; i <= haystack.length - needle.length; i++) {
    let matched = true
    for (let j = 0; j < needle.length; j++) {
      if (haystack[i + j] !== needle[j]) {
        matched = false
        break
      }
    }
    if (matched) {
      return true
    }
  }
  return false
}

const matchesTechVariants = (
  candidate: string,
  targetVariants: string[][],
): boolean => {
  const candidateVariants = parseTechVariants(candidate)
  return candidateVariants.some((candTokens) =>
    targetVariants.some((targetTokens) =>
      containsTokenSequence(candTokens, targetTokens),
    ),
  )
}

export const matchesTech = (candidate: string, target: string): boolean => {
  const targetVariants = parseTechVariants(target)
  if (targetVariants.length === 0) {
    return false
  }
  return matchesTechVariants(candidate, targetVariants)
}

interface FilterProjectsOptions {
  role?: string
  tech?: string
  query?: string
}

export const filterProjects = (
  projects: ProjectItem[],
  options: FilterProjectsOptions,
): ProjectItem[] => {
  const { role = "all", tech = "all", query = "" } = options
  const normalizedQuery = query.trim().toLowerCase()
  const targetVariants = tech !== "all" ? parseTechVariants(tech) : null

  return projects.filter((project) => {
    if (role !== "all" && !project.roles.includes(role)) {
      return false
    }
    if (targetVariants) {
      const allTechs = [
        ...project.languages,
        ...project.databases,
        ...project.serverOs,
        ...project.frameworksAndTools,
      ]
      if (
        targetVariants.length === 0 ||
        !allTechs.some((t) => matchesTechVariants(t, targetVariants))
      ) {
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

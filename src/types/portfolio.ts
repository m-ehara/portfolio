export type Locale = "ja" | "en"

export type ThemeMode = "dark" | "light"

export type ViewMode = "interactive" | "resume"

export interface YearMonth {
  year: number
  month: number // 1 - 12
}

/**
 * Skill rating symbols matching the skill sheet:
 * ★ = 5+ years practical experience
 * ◎ = 3+ years practical experience
 * ● = 1+ year practical experience
 * ○ = Practical experience (< 1 year)
 * △ = Knowledge / self-study
 */
export type SkillRank = "★" | "◎" | "●" | "○" | "△"

export type SkillCategoryKey = "language" | "framework" | "db" | "infra" | "os" | "ai" | "other"

export interface LocalizedText {
  ja: string
  en: string
}

export interface SkillItem {
  id: string
  name: string
  category: SkillCategoryKey
  rank: SkillRank
  yearsLabel: LocalizedText
}

export interface RoleExperience {
  role: string
  label: LocalizedText
  rank: SkillRank | "-"
}

export interface PhaseExperience {
  id: PhaseKey
  label: LocalizedText
  rank: SkillRank
}

export type ProjectPhaseKey = "requirements" | "basic_design" | "detailed_design" | "implementation" | "unit_test" | "integration_test" | "maintenance"

type PhaseKey = "planning" | ProjectPhaseKey

export interface SpecialtyItem {
  id: string
  title: LocalizedText
  description: LocalizedText
  details?: LocalizedText[]
}

export interface CareerPeriodSummary {
  id: string
  title: LocalizedText
  period: LocalizedText
  description: LocalizedText
}

export interface ProjectItem {
  id: number
  title: LocalizedText
  period: LocalizedText
  durationMonths: number
  durationLabel: LocalizedText
  roles: string[]
  teamSize: {
    team?: number
    dev?: number
    maintenance?: number
    total: number
  }
  languages: string[]
  databases: string[]
  serverOs: string[]
  frameworksAndTools: string[]
  phases: ProjectPhaseKey[]
  responsibilities: LocalizedText
  acquiredSkills: LocalizedText[]
  comment: LocalizedText
  evaluation?: LocalizedText
}

export interface PortfolioData {
  name: LocalizedText
  handle: string
  githubUrl: string
  brandName: string
  brandRole: string
  portfolioUrl: string
  portfolioQrSvgPath: string
  careerStart: YearMonth
  freelanceStart: YearMonth
  featuredStack: string[]
  jobTitle: LocalizedText
  tagline: LocalizedText
  specialties: SpecialtyItem[]
  careerSummaries: CareerPeriodSummary[]
  roleExperiences: RoleExperience[]
  phaseExperiences: PhaseExperience[]
  skills: SkillItem[]
  projects: ProjectItem[]
}

export type ProfileInfo = Omit<PortfolioData, "specialties" | "careerSummaries" | "roleExperiences" | "phaseExperiences" | "skills" | "projects">

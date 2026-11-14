import type { PortfolioData } from "../types/portfolio"
import * as sampleProfile from "./sample/profile"
import * as sampleProjects from "./sample/projects"
import * as sampleSkills from "./sample/skills"

type ProfileModule = typeof sampleProfile
type ProjectsModule = typeof sampleProjects
type SkillsModule = typeof sampleSkills

const privateProfileModules = import.meta.glob<ProfileModule>(
  "./private/profile.ts",
  { eager: true },
)
const privateProjectsModules = import.meta.glob<ProjectsModule>(
  "./private/projects.ts",
  { eager: true },
)
const privateSkillsModules = import.meta.glob<SkillsModule>(
  "./private/skills.ts",
  { eager: true },
)

const privateProfile = Object.values(privateProfileModules)[0]
const privateProjects = Object.values(privateProjectsModules)[0]
const privateSkills = Object.values(privateSkillsModules)[0]

const resolvedProfile = privateProfile?.profileInfo
  ? privateProfile
  : sampleProfile
const resolvedProjects = privateProjects?.projectsData
  ? privateProjects
  : sampleProjects
const resolvedSkills = privateSkills?.skillsData ? privateSkills : sampleSkills

export {
  DEFAULT_PORTFOLIO_QR_SVG_PATH,
  DEFAULT_PORTFOLIO_URL,
  PORTFOLIO_DATA_STORAGE_KEY,
  PROJECT_PHASES,
  RANK_LEGEND,
  RANK_SCORE,
  SKILL_CATEGORIES,
  TURNSTILE_DUMMY_SITE_KEY,
  TURNSTILE_SCRIPT_URL,
  TURNSTILE_VERIFY_STORAGE_KEY,
} from "./constants"
export { UI_TEXT } from "./i18n"
export {
  filterProjects,
  filterSkills,
  type FilterProjectsOptions,
  type FilterSkillsOptions,
} from "../utils/filters"
export {
  buildProjectPeriod,
  calculateDurationMonths,
  calculateElapsedYears,
  formatDurationLabel,
  formatElapsedYearsLabel,
  formatPeriodRange,
  formatYearMonthSlash,
  getCurrentYearMonth,
  type TimeReference,
  type YearMonth,
} from "../utils/date"

export const samplePortfolioData: PortfolioData = {
  ...sampleProfile.profileInfo,
  specialties: sampleProfile.specialtiesData,
  careerSummaries: sampleProfile.careerSummariesData,
  roleExperiences: sampleProfile.roleExperiencesData,
  phaseExperiences: sampleProfile.phaseExperiencesData,
  skills: sampleSkills.skillsData,
  projects: sampleProjects.projectsData,
}

export const portfolioData: PortfolioData = {
  ...resolvedProfile.profileInfo,
  specialties: resolvedProfile.specialtiesData,
  careerSummaries: resolvedProfile.careerSummariesData,
  roleExperiences: resolvedProfile.roleExperiencesData,
  phaseExperiences: resolvedProfile.phaseExperiencesData,
  skills: resolvedSkills.skillsData,
  projects: resolvedProjects.projectsData,
}

export const PORTFOLIO_URL = portfolioData.portfolioUrl
export const PORTFOLIO_QR_SVG_PATH = portfolioData.portfolioQrSvgPath
export const CAREER_START = portfolioData.careerStart
export const FREELANCE_START = portfolioData.freelanceStart

const isRecord = (value: unknown): boolean =>
  typeof value === "object" && value !== null

const isLocalizedText = (value: unknown): boolean => {
  if (!isRecord(value)) {
    return false
  }
  const obj = value as Record<string, unknown>
  return typeof obj.ja === "string" && typeof obj.en === "string"
}

const isYearMonth = (value: unknown): boolean => {
  if (!isRecord(value)) {
    return false
  }
  const obj = value as Record<string, unknown>
  return (
    typeof obj.year === "number" &&
    Number.isFinite(obj.year) &&
    typeof obj.month === "number" &&
    Number.isFinite(obj.month)
  )
}

export const isValidPortfolioData = (value: unknown): boolean => {
  if (!isRecord(value)) {
    return false
  }
  const obj = value as Record<string, unknown>

  return (
    typeof obj.updatedAt === "string" &&
    isLocalizedText(obj.name) &&
    typeof obj.handle === "string" &&
    typeof obj.githubUrl === "string" &&
    typeof obj.brandName === "string" &&
    typeof obj.brandRole === "string" &&
    typeof obj.portfolioUrl === "string" &&
    typeof obj.portfolioQrSvgPath === "string" &&
    isYearMonth(obj.careerStart) &&
    isYearMonth(obj.freelanceStart) &&
    Array.isArray(obj.featuredStack) &&
    isLocalizedText(obj.jobTitle) &&
    isLocalizedText(obj.tagline) &&
    Array.isArray(obj.specialties) &&
    Array.isArray(obj.careerSummaries) &&
    Array.isArray(obj.roleExperiences) &&
    Array.isArray(obj.phaseExperiences) &&
    Array.isArray(obj.skills) &&
    Array.isArray(obj.projects)
  )
}

export const parsePortfolioData = (value: unknown): PortfolioData | null =>
  isValidPortfolioData(value) ? value as PortfolioData : null

import {
  Award,
  Briefcase,
  Calendar,
  Code2,
  ExternalLink,
  FileText,
  Sparkles,
  Users,
} from "lucide-react"
import {
  UI_TEXT,
  calculateElapsedYears,
  formatElapsedYearsLabel,
  formatYearMonthSlash,
} from "../data/portfolioData"
import styles from "../styles/modules/HeroSection.module.css"
import type {
  Locale,
  PortfolioData,
  ViewMode,
  YearMonth,
} from "../types/portfolio"

interface HeroSectionProps {
  data: PortfolioData
  locale: Locale
  onSelectTech: (tech: string) => void
  onChangeViewMode: (mode: ViewMode) => void
}

const formatStartYearMonth = (ym: YearMonth): string =>
  `${ym.year}.${String(ym.month).padStart(2, "0")}`

export const HeroSection = ({
  data,
  locale,
  onSelectTech,
  onChangeViewMode,
}: HeroSectionProps) => {
  const t = UI_TEXT[locale]
  const currentUpdatedAt = formatYearMonthSlash()
  const totalYearsValue = formatElapsedYearsLabel(
    calculateElapsedYears(data.careerStart),
  )[locale]
  const freelanceYearsValue = formatElapsedYearsLabel(
    calculateElapsedYears(data.freelanceStart),
  )[locale]
  const careerStartStr = formatStartYearMonth(data.careerStart)
  const freelanceStartStr = formatStartYearMonth(data.freelanceStart)
  const projectsCountValue =
    locale === "ja" ? `${data.projects.length}件` : `${data.projects.length}`
  const maxTeamTotal = data.projects.reduce(
    (max, project) => Math.max(max, project.teamSize.total),
    0,
  )
  const maxTeamSizeValue =
    locale === "ja" ? `${maxTeamTotal}名` : `${maxTeamTotal} members`

  return (
    <section id="top" className={styles.heroSection}>
      <div className="container">
        <div className={styles.heroBadgeRow}>
          <span className={styles.statusPill}>
            <span className={styles.statusDot} />
            {t.updatedAt}: {currentUpdatedAt}
          </span>
          <a
            href={data.githubUrl}
            target="_blank"
            rel="noreferrer"
            className={styles.githubPill}
          >
            <span>@{data.handle}</span>
            <ExternalLink size={13} />
          </a>
        </div>

        <h1 className={styles.heroTitle}>
          <span className={styles.heroName}>{data.name[locale]}</span>
          <span className={styles.heroRoleGradient}>
            {data.jobTitle[locale]}
          </span>
        </h1>

        <p className={styles.heroTagline}>{data.tagline[locale]}</p>

        <div className={styles.heroCtaRow}>
          <a href="#projects" className="primary-btn">
            <Briefcase size={17} />
            <span>{t.navProjects}</span>
          </a>
          <button
            type="button"
            className="secondary-btn"
            onClick={() => onChangeViewMode("resume")}
          >
            <FileText size={17} />
            <span>{t.navResume}</span>
          </button>
        </div>

        <div className={styles.heroMetricsGrid}>
          <div className={styles.metricCard}>
            <div className={styles.metricIcon}>
              <Calendar size={20} />
            </div>
            <div>
              <div className={styles.metricValue}>{totalYearsValue}</div>
              <div className={styles.metricLabel}>
                {t.yearsTotal} (
                {locale === "ja" ? `${careerStartStr}〜` : `${careerStartStr}–`}
                )
              </div>
            </div>
          </div>

          <div className={styles.metricCard}>
            <div className={styles.metricIcon}>
              <Award size={20} />
            </div>
            <div>
              <div className={styles.metricValue}>{freelanceYearsValue}</div>
              <div className={styles.metricLabel}>
                {t.freelanceYears} (
                {locale === "ja"
                  ? `${freelanceStartStr}〜`
                  : `${freelanceStartStr}–`}
                )
              </div>
            </div>
          </div>

          <div className={styles.metricCard}>
            <div className={styles.metricIcon}>
              <Code2 size={20} />
            </div>
            <div>
              <div className={styles.metricValue}>{projectsCountValue}</div>
              <div className={styles.metricLabel}>{t.projectsCount}</div>
            </div>
          </div>

          <div className={styles.metricCard}>
            <div className={styles.metricIcon}>
              <Users size={20} />
            </div>
            <div>
              <div className={styles.metricValue}>{maxTeamSizeValue}</div>
              <div className={styles.metricLabel}>{t.maxTeamSize}</div>
            </div>
          </div>
        </div>

        <div className={styles.heroStackBar}>
          <span className={styles.stackBarLabel}>
            <Sparkles size={14} />
            <span>Core Stack:</span>
          </span>
          <div className={styles.stackPills}>
            {data.featuredStack.map((tech) => (
              <button
                key={tech}
                type="button"
                className={styles.techChip}
                onClick={() => onSelectTech(tech)}
              >
                {tech}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

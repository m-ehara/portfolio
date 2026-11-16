import {
  Bot,
  CheckCircle2,
  Cpu,
  GitBranch,
  Layers,
  ShieldCheck,
  Users2,
} from "lucide-react"
import { RANK_LEGEND, UI_TEXT } from "../data/portfolioData"
import styles from "../styles/modules/AboutSection.module.css"
import type { Locale, PortfolioData } from "../types/portfolio"

interface AboutSectionProps {
  data: PortfolioData
  locale: Locale
}

const SPECIALTY_ICONS: Record<string, typeof Layers> = {
  scale: Users2,
  saas: Layers,
  bridge: GitBranch,
  fullstack: Cpu,
  "ai-driven": Bot,
}

export const AboutSection = ({ data, locale }: AboutSectionProps) => {
  const t = UI_TEXT[locale]

  return (
    <section id="about" className="section">
      <div className="container">
        <div className="section-header">
          <span className="section-eyebrow">{t.specialtiesSub}</span>
          <h2 className="section-title">{t.specialtiesTitle}</h2>
        </div>

        <div className={styles.specialtiesGrid}>
          {data.specialties.map((item) => {
            const IconComponent = SPECIALTY_ICONS[item.id] ?? ShieldCheck
            return (
              <article key={item.id} className={styles.specialtyCard}>
                <div className={styles.specialtyCardHead}>
                  <span className={styles.specialtyIcon}>
                    <IconComponent size={20} />
                  </span>
                  <h3 className={styles.specialtyTitle}>
                    {item.title[locale]}
                  </h3>
                </div>
                <p className={styles.specialtyDesc}>
                  {item.description[locale]}
                </p>
                {item.details && item.details.length > 0 && (
                  <ul className={styles.specialtyDetails}>
                    {item.details.map((detail, idx) => (
                      <li key={idx}>
                        <CheckCircle2 size={14} className={styles.checkIcon} />
                        <span>{detail[locale]}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </article>
            )
          })}
        </div>

        <div className={styles.careerAndMatrixGrid}>
          {/* Career Summary */}
          <div className={styles.panelCard}>
            <div className={styles.panelHeader}>
              <span className="section-eyebrow">{t.careerOverviewSub}</span>
              <h3 className={styles.panelTitle}>{t.careerOverviewTitle}</h3>
            </div>
            <div className={styles.careerTimeline}>
              {data.careerSummaries.map((career) => (
                <div key={career.id} className={styles.careerBlock}>
                  <div>
                    <span className={styles.careerPeriodBadge}>
                      {career.period[locale]}
                    </span>
                    <h4 className={styles.careerBlockTitle}>
                      {career.title[locale]}
                    </h4>
                  </div>
                  <p className={styles.careerBlockDesc}>
                    {career.description[locale]}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Roles & Phases */}
          <div className={styles.panelCard}>
            <div className={styles.panelHeader}>
              <span className="section-eyebrow">{t.rolesAndPhasesSub}</span>
              <h3 className={styles.panelTitle}>{t.rolesAndPhasesTitle}</h3>
            </div>

            <div className={styles.matrixSubblock}>
              <h4 className={styles.matrixSubtitle}>{t.rolesHeading}</h4>
              <div className={styles.roleBadgesGrid}>
                {data.roleExperiences.map((r) => (
                  <div
                    key={r.role}
                    className={`${styles.roleCell} ${
                      r.rank === "-" ? styles.noExp : ""
                    }`}
                  >
                    <span>{r.label[locale]}</span>
                    <span className={styles.rankSymbol}>{r.rank}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.matrixSubblock}>
              <h4 className={styles.matrixSubtitle}>{t.phasesHeading}</h4>
              <div className={styles.phaseBadgesGrid}>
                {data.phaseExperiences.map((p) => (
                  <div key={p.id} className={styles.phaseCell}>
                    <span>{p.label[locale]}</span>
                    <span className={styles.rankSymbol}>{p.rank}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.legendInline}>
              {RANK_LEGEND.map((item) => (
                <span key={item.rank}>
                  <strong>{item.rank}</strong> = {item[locale]}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

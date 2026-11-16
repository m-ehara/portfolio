import { Printer } from "lucide-react"
import { PROJECT_PHASES, RANK_LEGEND } from "../data/constants"
import { UI_TEXT } from "../data/i18n"
import { formatYearMonthSlash } from "../utils/date"
import { formatTeamSizeItems } from "../utils/formatters"
import styles from "../styles/modules/ResumeSheetView.module.css"
import type {
  Locale,
  PortfolioData,
  SkillCategoryKey,
  SkillItem,
} from "../types/portfolio"

interface ResumeSheetViewProps {
  data: PortfolioData
  locale: Locale
  onPrint: () => void
}

interface SkillSectionGroup {
  id: string
  label: string
  categories: SkillCategoryKey[]
}

interface SkillSectionConfig {
  id: string
  title: string
  groups: SkillSectionGroup[]
}

export const ResumeSheetView = ({
  data,
  locale,
  onPrint,
}: ResumeSheetViewProps) => {
  const t = UI_TEXT[locale]

  const skillsByCategory = new Map<SkillCategoryKey, SkillItem[]>()
  for (const skill of data.skills) {
    const existing = skillsByCategory.get(skill.category) ?? []
    existing.push(skill)
    skillsByCategory.set(skill.category, existing)
  }

  const skillSections: SkillSectionConfig[] = [
    {
      id: "lang-fw",
      title: t.resumeLangFwBar,
      groups: [
        { id: "language", label: t.resumeLangLabel, categories: ["language"] },
        { id: "framework", label: t.resumeFwLabel, categories: ["framework"] },
      ],
    },
    {
      id: "infra-etc",
      title: t.resumeOtherSkillsBar,
      groups: [
        { id: "db", label: t.resumeDbLabel, categories: ["db"] },
        {
          id: "infra-os",
          label: t.resumeInfraOsLabel,
          categories: ["infra", "os"],
        },
        { id: "ai", label: t.resumeAiLabel, categories: ["ai"] },
        { id: "other", label: t.resumeOthersLabel, categories: ["other"] },
      ],
    },
  ]

  const phaseGapColSpan = Math.max(
    0,
    data.roleExperiences.length - data.phaseExperiences.length,
  )
  const roleGapColSpan = Math.max(
    0,
    data.phaseExperiences.length - data.roleExperiences.length,
  )

  return (
    <div className={styles.resumeSheetWrapper}>
      <div className="container">
        <div className={`${styles.resumeBanner} no-print`}>
          <span>{t.resumeModeBanner}</span>
          <button type="button" className="primary-btn" onClick={onPrint}>
            <Printer size={16} />
            <span>{t.printResume}</span>
          </button>
        </div>

        {/* PAGE 1: Profile, PR, Career Summary, Skills Tables */}
        <div className={styles.resumeSheetPage}>
          <div className={styles.sheetHeaderRow}>
            <h1 className={styles.sheetMainTitle}>{t.resumeSheetTitle}</h1>
            <div className={styles.sheetMetaRight}>
              <div>
                {t.updatedAt} : {formatYearMonthSlash()}
              </div>
              <div>
                {data.name[locale]} (@{data.handle})
              </div>
            </div>
          </div>

          {/* 自己PR */}
          <div className={styles.sheetSection}>
            <div className={styles.sheetSectionTitle}>
              {t.resumeSelfPrTitle}
            </div>
            <div className={styles.sheetBoxContent}>
              <p className={styles.sheetLineBold}>
                {t.resumeRolePrefix}
                {data.jobTitle[locale]}
              </p>
              <p className={`${styles.sheetLineBold} ${styles.mtXs}`}>
                {t.resumeStrengthsPrefix}
              </p>
              <ul className={styles.sheetPrList}>
                {data.specialties.map((spec) => (
                  <li key={spec.id}>
                    ■ {spec.description[locale]}
                    {spec.details && (
                      <ul className={styles.sheetPrSublist}>
                        {spec.details.map((d, idx) => (
                          <li key={idx}>- {d[locale]}</li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* 経歴概要 */}
          <div className={styles.sheetSection}>
            <div className={styles.sheetSectionTitle}>
              {t.careerOverviewTitle}
            </div>
            <div className={styles.sheetBoxContent}>
              {[...data.careerSummaries].reverse().map((c) => (
                <div key={c.id} className={styles.sheetCareerItem}>
                  <div className={styles.sheetLineBold}>
                    【{c.title[locale]}】 {t.resumePeriodPrefix}
                    {c.period[locale]}
                  </div>
                  <p className={styles.sheetParagraph}>
                    {c.description[locale]}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* 凡例 */}
          <div className={styles.sheetLegendLine}>
            {RANK_LEGEND.map((l) => (
              <span key={l.rank}>
                {l.rank}＝{l[locale]}
              </span>
            ))}
          </div>

          {/* 担当領域・工程 */}
          <div className={styles.sheetSection}>
            <div className={styles.sheetSubtitleBar}>
              【{t.rolesAndPhasesTitle}】
            </div>
            <table className={styles.sheetTable}>
              <tbody>
                <tr>
                  <th rowSpan={2} className={styles.sheetThCategory}>
                    {t.rolesHeading}
                  </th>
                  {data.roleExperiences.map((r) => (
                    <th key={r.role}>{r.label[locale]}</th>
                  ))}
                  {roleGapColSpan > 0 && <th colSpan={roleGapColSpan} />}
                </tr>
                <tr>
                  {data.roleExperiences.map((r) => (
                    <td key={r.role} className={styles.textCenter}>
                      {r.rank === "-" ? "" : r.rank}
                    </td>
                  ))}
                  {roleGapColSpan > 0 && <td colSpan={roleGapColSpan} />}
                </tr>
                <tr>
                  <th rowSpan={2} className={styles.sheetThCategory}>
                    {t.phasesHeading}
                  </th>
                  {data.phaseExperiences.map((p) => (
                    <th key={p.id}>{p.label[locale]}</th>
                  ))}
                  {phaseGapColSpan > 0 && <th colSpan={phaseGapColSpan} />}
                </tr>
                <tr>
                  {data.phaseExperiences.map((p) => (
                    <td key={p.id} className={styles.textCenter}>
                      {p.rank}
                    </td>
                  ))}
                  {phaseGapColSpan > 0 && <td colSpan={phaseGapColSpan} />}
                </tr>
              </tbody>
            </table>
          </div>

          {/* 言語・FW/ライブラリ / DB・インフラ・OS・AI・その他 */}
          {skillSections.map((section) => (
            <div key={section.id} className={styles.sheetSection}>
              <div className={styles.sheetSubtitleBar}>{section.title}</div>
              {section.groups.map((group) => {
                const groupSkills = group.categories.flatMap(
                  (category) => skillsByCategory.get(category) ?? [],
                )
                return (
                  <div key={group.id} className={styles.sheetSkillGroup}>
                    <div className={styles.sheetSkillLabel}>{group.label}</div>
                    <div className={styles.sheetSkillCells}>
                      {groupSkills.map((s) => (
                        <div key={s.id} className={styles.sheetSkillCell}>
                          <div className={styles.cellHead}>{s.name}</div>
                          <div className={styles.cellVal}>{s.rank}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          ))}
        </div>

        {/* PAGE 2: Project History Table */}
        <div className={`${styles.resumeSheetPage} ${styles.pageBreakBefore}`}>
          <div className={styles.sheetSubtitleBar}>
            {t.resumeProjectsBarPrefix}
            {data.projects.length}
            {t.resumeProjectsBarSuffix}
          </div>
          <div className={styles.sheetTableScroll}>
            <table className={styles.sheetProjectsTable}>
              <thead>
                <tr>
                  <th>{t.resumeColNo}</th>
                  <th>{t.resumeColPeriod}</th>
                  <th>{t.resumeColDetails}</th>
                  <th>{t.resumeColRoleScale}</th>
                  <th>{t.resumeColLanguages}</th>
                  <th>{t.resumeColDbOs}</th>
                  <th>{t.resumeColFwTools}</th>
                  <th>{t.resumeColPhases}</th>
                </tr>
              </thead>
              <tbody>
                {data.projects.map((p) => (
                  <tr key={p.id}>
                    <td className={`${styles.textCenter} ${styles.fontMono}`}>
                      {p.id}
                    </td>
                    <td>
                      <div>{p.period[locale]}</div>
                      <div className={styles.subMuted}>
                        ({p.durationLabel[locale]})
                      </div>
                    </td>
                    <td>
                      <div className={styles.sheetProjTitle}>
                        ■ {p.title[locale]}
                      </div>
                      <div className={styles.sheetProjBlock}>
                        <strong>≪{t.responsibilitiesLabel}≫</strong>{" "}
                        {p.responsibilities[locale]}
                      </div>
                      {p.acquiredSkills.length > 0 && (
                        <div className={styles.sheetProjBlock}>
                          <strong>≪{t.acquiredSkillsLabel}≫</strong>
                          <ul className={styles.compactList}>
                            {p.acquiredSkills.map((s, i) => (
                              <li key={i}>- {s[locale]}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      <div className={styles.sheetProjBlock}>
                        <strong>≪{t.commentLabel}≫</strong> {p.comment[locale]}
                      </div>
                      {p.evaluation && (
                        <div className={styles.sheetProjBlock}>
                          <strong>≪{t.evaluationLabel}≫</strong>{" "}
                          {p.evaluation[locale]}
                        </div>
                      )}
                    </td>
                    <td className={styles.textCenter}>
                      <div className={styles.fontBold}>
                        {p.roles.join(", ")}
                      </div>
                      {formatTeamSizeItems(p.teamSize, locale).map(
                        (item, idx) => (
                          <div
                            key={item}
                            className={
                              idx === 0
                                ? `${styles.subMuted} ${styles.mtXs}`
                                : styles.subMuted
                            }
                          >
                            {item}
                          </div>
                        ),
                      )}
                    </td>
                    <td>
                      {p.languages.map((l) => (
                        <div key={l}>{l}</div>
                      ))}
                    </td>
                    <td>
                      <div className={styles.fontBold}>DB:</div>
                      {p.databases.map((d) => (
                        <div key={d}>{d}</div>
                      ))}
                      <div className={`${styles.fontBold} ${styles.mtXs}`}>
                        OS:
                      </div>
                      {p.serverOs.map((o) => (
                        <div key={o}>{o}</div>
                      ))}
                    </td>
                    <td>
                      {p.frameworksAndTools.map((f) => (
                        <div key={f}>{f}</div>
                      ))}
                    </td>
                    <td>
                      <div className={styles.compactPhases}>
                        {PROJECT_PHASES.map((ph) => {
                          const has = p.phases.includes(ph.key)
                          return (
                            <div
                              key={ph.key}
                              className={`${styles.compactPhaseItem} ${
                                has ? "" : styles.compactPhaseNone
                              }`}
                            >
                              <span>{has ? "●" : "○"}</span>
                              <span>{ph[locale]}</span>
                            </div>
                          )
                        })}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

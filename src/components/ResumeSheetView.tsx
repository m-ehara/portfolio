import { Printer } from "lucide-react"
import {
  PROJECT_PHASES,
  RANK_LEGEND,
  UI_TEXT,
  formatYearMonthSlash,
} from "../data/portfolioData"
import styles from "../styles/modules/ResumeSheetView.module.css"
import type { Locale, PortfolioData } from "../types/portfolio"

interface ResumeSheetViewProps {
  data: PortfolioData
  locale: Locale
  onPrint: () => void
}

export const ResumeSheetView = ({
  data,
  locale,
  onPrint,
}: ResumeSheetViewProps) => {
  const t = UI_TEXT[locale]

  const langSkills = data.skills.filter((s) => s.category === "language")
  const fwSkills = data.skills.filter((s) => s.category === "framework")
  const dbSkills = data.skills.filter((s) => s.category === "db")
  const infraSkills = data.skills.filter((s) => s.category === "infra")
  const osSkills = data.skills.filter((s) => s.category === "os")
  const aiSkills = data.skills.filter((s) => s.category === "ai")
  const otherSkills = data.skills.filter((s) => s.category === "other")

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
            <h1 className={styles.sheetMainTitle}>
              {locale === "ja"
                ? "経歴・スキルシート"
                : "Curriculum Vitae & Skill Sheet"}
            </h1>
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
              {locale === "ja" ? "自己PR" : "Profile & Core Competencies"}
            </div>
            <div className={styles.sheetBoxContent}>
              <p className={styles.sheetLineBold}>
                {locale === "ja" ? "職種：" : "Role: "}
                {data.jobTitle[locale]}
              </p>
              <p className={`${styles.sheetLineBold} ${styles.mtXs}`}>
                {locale === "ja" ? "得意分野：" : "Key Strengths:"}
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
                    【{c.title[locale]}】{" "}
                    {locale === "ja" ? "期間：" : "Period: "}
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
                </tr>
                <tr>
                  {data.roleExperiences.map((r) => (
                    <td key={r.role} className={styles.textCenter}>
                      {r.rank === "-" ? "" : r.rank}
                    </td>
                  ))}
                </tr>
                <tr>
                  <th rowSpan={2} className={styles.sheetThCategory}>
                    {t.phasesHeading}
                  </th>
                  {data.phaseExperiences.map((p) => (
                    <th key={p.id}>{p.label[locale]}</th>
                  ))}
                  <th colSpan={2} />
                </tr>
                <tr>
                  {data.phaseExperiences.map((p) => (
                    <td key={p.id} className={styles.textCenter}>
                      {p.rank}
                    </td>
                  ))}
                  <td colSpan={2} />
                </tr>
              </tbody>
            </table>
          </div>

          {/* 言語・FW/ライブラリ */}
          <div className={styles.sheetSection}>
            <div className={styles.sheetSubtitleBar}>
              {locale === "ja"
                ? "【言語・FW/ライブラリ】"
                : "【Languages, Frameworks & Libraries】"}
            </div>
            <div className={styles.sheetSkillGroup}>
              <div className={styles.sheetSkillLabel}>
                {locale === "ja" ? "言語" : "Languages"}
              </div>
              <div className={styles.sheetSkillCells}>
                {langSkills.map((s) => (
                  <div key={s.id} className={styles.sheetSkillCell}>
                    <div className={styles.cellHead}>{s.name}</div>
                    <div className={styles.cellVal}>{s.rank}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className={styles.sheetSkillGroup}>
              <div className={styles.sheetSkillLabel}>
                {locale === "ja" ? "FW / ライブラリ" : "FW / Libs"}
              </div>
              <div className={styles.sheetSkillCells}>
                {fwSkills.map((s) => (
                  <div key={s.id} className={styles.sheetSkillCell}>
                    <div className={styles.cellHead}>{s.name}</div>
                    <div className={styles.cellVal}>{s.rank}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* DB・インフラ・OS / AI / その他 */}
          <div className={styles.sheetSection}>
            <div className={styles.sheetSubtitleBar}>
              {locale === "ja"
                ? "【DB・インフラ・OS・AI・その他】"
                : "【DB, Infra, OS, AI & Tools】"}
            </div>
            <div className={styles.sheetSkillGroup}>
              <div className={styles.sheetSkillLabel}>DB</div>
              <div className={styles.sheetSkillCells}>
                {dbSkills.map((s) => (
                  <div key={s.id} className={styles.sheetSkillCell}>
                    <div className={styles.cellHead}>{s.name}</div>
                    <div className={styles.cellVal}>{s.rank}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className={styles.sheetSkillGroup}>
              <div className={styles.sheetSkillLabel}>
                {locale === "ja" ? "インフラ / OS" : "Infra / OS"}
              </div>
              <div className={styles.sheetSkillCells}>
                {[...infraSkills, ...osSkills].map((s) => (
                  <div key={s.id} className={styles.sheetSkillCell}>
                    <div className={styles.cellHead}>{s.name}</div>
                    <div className={styles.cellVal}>{s.rank}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className={styles.sheetSkillGroup}>
              <div className={styles.sheetSkillLabel}>AI</div>
              <div className={styles.sheetSkillCells}>
                {aiSkills.map((s) => (
                  <div key={s.id} className={styles.sheetSkillCell}>
                    <div className={styles.cellHead}>{s.name}</div>
                    <div className={styles.cellVal}>{s.rank}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className={styles.sheetSkillGroup}>
              <div className={styles.sheetSkillLabel}>
                {locale === "ja" ? "その他" : "Others"}
              </div>
              <div className={styles.sheetSkillCells}>
                {otherSkills.map((s) => (
                  <div key={s.id} className={styles.sheetSkillCell}>
                    <div className={styles.cellHead}>{s.name}</div>
                    <div className={styles.cellVal}>{s.rank}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* PAGE 2: Project History Table */}
        <div className={`${styles.resumeSheetPage} ${styles.pageBreakBefore}`}>
          <div className={styles.sheetSubtitleBar}>
            {locale === "ja"
              ? `【業務経歴詳細（全${data.projects.length}案件）】`
              : `【Detailed Project History (${data.projects.length} Projects)】`}
          </div>
          <div className={styles.sheetTableScroll}>
            <table className={styles.sheetProjectsTable}>
              <thead>
                <tr>
                  <th>No</th>
                  <th>{locale === "ja" ? "期間" : "Period"}</th>
                  <th>{locale === "ja" ? "業務内容" : "Project Details"}</th>
                  <th>{locale === "ja" ? "役割・規模" : "Role / Scale"}</th>
                  <th>{locale === "ja" ? "使用言語" : "Languages"}</th>
                  <th>DB / OS</th>
                  <th>{locale === "ja" ? "FW・MW・ツール等" : "FW / Tools"}</th>
                  <th>{locale === "ja" ? "担当工程" : "Phases"}</th>
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
                      <div className={`${styles.subMuted} ${styles.mtXs}`}>
                        {p.teamSize.team
                          ? `${t.teamLabel} ${p.teamSize.team}${t.teamUnit}`
                          : ""}
                      </div>
                      <div className={styles.subMuted}>
                        {p.teamSize.dev
                          ? `${t.devLabel} ${p.teamSize.dev}${t.teamUnit}`
                          : ""}
                      </div>
                      <div className={styles.subMuted}>
                        {p.teamSize.maintenance
                          ? `${t.maintLabel} ${p.teamSize.maintenance}${t.teamUnit}`
                          : ""}
                      </div>
                      <div className={styles.subMuted}>
                        {t.totalLabel} {p.teamSize.total}
                        {t.teamUnit}
                      </div>
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

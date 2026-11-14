import { useState } from "react"
import { Filter, MousePointerClick, Search } from "lucide-react"
import {
  filterSkills,
  RANK_LEGEND,
  RANK_SCORE,
  SKILL_CATEGORIES,
  UI_TEXT,
} from "../data/portfolioData"
import styles from "../styles/modules/SkillsSection.module.css"
import type {
  Locale,
  SkillCategoryKey,
  SkillItem,
  SkillRank,
} from "../types/portfolio"

interface SkillsSectionProps {
  skills: SkillItem[]
  locale: Locale
  selectedTech: string
  onSelectTech: (tech: string) => void
}

const RANK_BADGE_CLASS: Record<number, string | undefined> = {
  5: styles.rank5,
  4: styles.rank4,
  3: styles.rank3,
  2: styles.rank2,
  1: styles.rank1,
}

const RANK_FILL_CLASS: Record<number, string | undefined> = {
  5: styles.rankFill5,
  4: styles.rankFill4,
  3: styles.rankFill3,
  2: styles.rankFill2,
  1: styles.rankFill1,
}

export const SkillsSection = ({
  skills,
  locale,
  selectedTech,
  onSelectTech,
}: SkillsSectionProps) => {
  const t = UI_TEXT[locale]
  const [category, setCategory] = useState<SkillCategoryKey | "all">("all")
  const [minRank, setMinRank] = useState<SkillRank | "all">("all")
  const [query, setQuery] = useState("")

  const filtered = filterSkills(skills, { category, minRank, query })

  return (
    <section id="skills" className="section">
      <div className="container">
        <div className="section-header">
          <span className="section-eyebrow">{t.skillsSub}</span>
          <h2 className="section-title">{t.skillsTitle}</h2>
          <p className="section-hint">
            <MousePointerClick size={15} />
            <span>{t.clickSkillHint}</span>
          </p>
        </div>

        <div className={styles.skillsControls}>
          <div
            className={styles.categoryTabs}
            role="tablist"
            aria-label="Skill Categories"
          >
            {SKILL_CATEGORIES.map((cat) => (
              <button
                key={cat.key}
                type="button"
                role="tab"
                aria-selected={category === cat.key}
                className={`${styles.tabBtn} ${
                  category === cat.key ? styles.tabBtnActive : ""
                }`}
                onClick={() => setCategory(cat.key)}
              >
                {cat[locale]}
              </button>
            ))}
          </div>

          <div className={styles.skillsSearchRow}>
            <div className="search-input-wrap">
              <Search size={16} className="search-icon" />
              <input
                type="search"
                className="search-input"
                placeholder={t.skillSearchPlaceholder}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label={t.skillSearchPlaceholder}
              />
            </div>

            <div className="select-wrap">
              <Filter size={15} />
              <select
                className="filter-select"
                value={minRank}
                onChange={(e) =>
                  setMinRank(e.target.value as SkillRank | "all")
                }
                aria-label={t.minRankLabel}
              >
                <option value="all">{t.rankAll}</option>
                <option value="★">
                  ★ ({locale === "ja" ? "5年以上" : "5+ yrs"})
                </option>
                <option value="◎">
                  ◎ ({locale === "ja" ? "3年以上" : "3+ yrs"})
                </option>
                <option value="●">
                  ● ({locale === "ja" ? "1年以上" : "1+ yr"})
                </option>
              </select>
            </div>
          </div>
        </div>

        <div className={styles.legendBar}>
          {RANK_LEGEND.map((item) => {
            const score = RANK_SCORE[item.rank]
            return (
              <span key={item.rank} className={styles.legendItem}>
                <span
                  className={`${styles.rankBadge} ${
                    RANK_BADGE_CLASS[score] ?? ""
                  }`}
                >
                  {item.rank}
                </span>
                <span>{item[locale]}</span>
              </span>
            )
          })}
        </div>

        {filtered.length === 0 ? (
          <div className="empty-state">{t.noMatchingSkills}</div>
        ) : (
          <div className={styles.skillsGrid}>
            {filtered.map((skill) => {
              const score = RANK_SCORE[skill.rank]
              const isSelected =
                selectedTech !== "all" &&
                skill.name.toLowerCase().includes(selectedTech.toLowerCase())

              return (
                <button
                  key={skill.id}
                  type="button"
                  className={`${styles.skillCard} ${
                    isSelected ? styles.skillSelected : ""
                  }`}
                  onClick={() => {
                    const cleanName = skill.name.split(" (")[0]
                    onSelectTech(cleanName)
                  }}
                >
                  <div className={styles.skillCardTop}>
                    <span className={styles.skillName}>{skill.name}</span>
                    <span
                      className={`${styles.rankBadge} ${
                        RANK_BADGE_CLASS[score] ?? ""
                      }`}
                    >
                      {skill.rank}
                    </span>
                  </div>
                  <div className={styles.skillBarTrack} aria-hidden="true">
                    <div
                      className={`${styles.skillBarFill} ${
                        RANK_FILL_CLASS[score] ?? ""
                      }`}
                      style={{ width: `${(score / 5) * 100}%` }}
                    />
                  </div>
                  <div>
                    <span className={styles.skillYears}>
                      {skill.yearsLabel[locale]}
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}

import { useMemo, useState } from "react"
import {
  Award,
  Briefcase,
  Calendar,
  MessageSquareQuote,
  RotateCcw,
  Search,
  Users,
} from "lucide-react"
import { PROJECT_PHASES } from "../data/constants"
import { UI_TEXT } from "../data/i18n"
import { filterProjects } from "../utils/filters"
import { formatTeamSizeItems } from "../utils/formatters"
import styles from "../styles/modules/ProjectsSection.module.css"
import type { Locale, ProjectItem } from "../types/portfolio"

interface ProjectsSectionProps {
  projects: ProjectItem[]
  locale: Locale
  selectedTech: string
  onSelectTech: (tech: string) => void
}

const ROLE_BADGE_CLASS: Record<string, string | undefined> = {
  PM: styles.rolePm,
  PMO: styles.rolePmo,
  SE: styles.roleSe,
}

export const ProjectsSection = ({
  projects,
  locale,
  selectedTech,
  onSelectTech,
}: ProjectsSectionProps) => {
  const t = UI_TEXT[locale]
  const [roleFilter, setRoleFilter] = useState<string>("all")
  const [query, setQuery] = useState<string>("")

  const allTechOptions = useMemo(() => {
    const set = new Set<string>()
    for (const p of projects) {
      for (const lang of p.languages) set.add(lang)
      for (const db of p.databases) set.add(db)
      for (const os of p.serverOs) set.add(os)
      for (const fw of p.frameworksAndTools) set.add(fw)
    }
    return Array.from(set).sort()
  }, [projects])

  const filteredProjects = useMemo(
    () =>
      filterProjects(projects, {
        role: roleFilter,
        tech: selectedTech,
        query,
      }),
    [projects, roleFilter, selectedTech, query],
  )

  const hasActiveFilters = roleFilter !== "all" || selectedTech !== "all" || query.trim() !== ""

  const handleReset = () => {
    setRoleFilter("all")
    onSelectTech("all")
    setQuery("")
  }

  const sectionTitle = `${t.projectsTitlePrefix}${projects.length}${t.projectsTitleSuffix}`

  return (
    <section id="projects" className="section">
      <div className="container">
        <div className="section-header">
          <span className="section-eyebrow">{t.projectsSub}</span>
          <h2 className="section-title">{sectionTitle}</h2>
        </div>

        {/* Filters */}
        <div className={styles.projectsFilterBar}>
          <div className={styles.rolePills} role="group" aria-label={t.roleFilterLabel}>
            {["all", "PM", "PMO", "SE"].map((role) => (
              <button
                key={role}
                type="button"
                className={`${styles.roleFilterBtn} ${
                  roleFilter === role ? styles.roleFilterBtnActive : ""
                }`}
                onClick={() => setRoleFilter(role)}
              >
                {role === "all" ? t.allRoles : role}
              </button>
            ))}
          </div>

          <div className={styles.projectSearchControls}>
            <div className="search-input-wrap">
              <Search size={16} className="search-icon" />
              <input
                type="search"
                className="search-input"
                placeholder={t.projectSearchPlaceholder}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label={t.projectSearchPlaceholder}
              />
            </div>

            <select
              className="filter-select"
              value={selectedTech}
              onChange={(e) => onSelectTech(e.target.value)}
              aria-label={t.techFilterLabel}
            >
              <option value="all">{t.allTechs}</option>
              {selectedTech !== "all" && !allTechOptions.includes(selectedTech) && (
                <option value={selectedTech}>{selectedTech}</option>
              )}
              {allTechOptions.map((tech) => (
                <option key={tech} value={tech}>
                  {tech}
                </option>
              ))}
            </select>

            {hasActiveFilters && (
              <button type="button" className={styles.resetBtn} onClick={handleReset}>
                <RotateCcw size={14} />
                <span>{t.clearFilters}</span>
              </button>
            )}
          </div>
        </div>

        <div className={styles.projectsCountBar}>
          <span>
            <strong>{filteredProjects.length}</strong> / {projects.length} {t.showingProjects}
          </span>
          {selectedTech !== "all" && (
            <span className={styles.activeFilterTag}>
              Tech: <strong>{selectedTech}</strong>
            </span>
          )}
        </div>

        {filteredProjects.length === 0 ? (
          <div className="empty-state">{t.noMatchingProjects}</div>
        ) : (
          <div className={styles.projectsList}>
            {filteredProjects.map((project) => (
              <article key={project.id} className={styles.projectCard}>
                <div className={styles.projectCardHeader}>
                  <div className={styles.projectTitleGroup}>
                    <span className={styles.projectNumber}>
                      #{String(project.id).padStart(2, "0")}
                    </span>
                    <div>
                      <h3 className={styles.projectTitle}>{project.title[locale]}</h3>
                      <div className={styles.projectPeriodRow}>
                        <span className={styles.projectPeriod}>
                          <Calendar size={14} />
                          <span>{project.period[locale]}</span>
                        </span>
                        <span className={styles.durationBadge}>
                          {project.durationLabel[locale]}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className={styles.projectMetaBadges}>
                    <div className={styles.projectRoles}>
                      {project.roles.map((r) => (
                        <span
                          key={r}
                          className={`${styles.projectRoleBadge} ${ROLE_BADGE_CLASS[r] ?? ""}`}
                        >
                          <Briefcase size={13} />
                          <span>{r}</span>
                        </span>
                      ))}
                    </div>

                    <div className={styles.teamSizeBadge}>
                      <Users size={14} />
                      <span>{formatTeamSizeItems(project.teamSize, locale).join(" / ")}</span>
                    </div>
                  </div>
                </div>

                {/* Assigned Phases Pipeline */}
                <div className={styles.projectPhasesRow}>
                  <span className={styles.rowLabel}>{t.phasesAssignedLabel}:</span>
                  <div className={styles.phasesPipeline}>
                    {PROJECT_PHASES.map((phase) => {
                      const active = project.phases.includes(phase.key)
                      return (
                        <span
                          key={phase.key}
                          className={`${styles.phaseStep} ${
                            active ? styles.phaseActive : styles.phaseInactive
                          }`}
                        >
                          {phase[locale]}
                        </span>
                      )
                    })}
                  </div>
                </div>

                {/* Tech Stack */}
                <div className={styles.projectTechRow}>
                  <span className={styles.rowLabel}>{t.techStackLabel}:</span>
                  <div className={styles.projectTechTags}>
                    {[
                      { prefix: "lang", items: project.languages },
                      { prefix: "db", items: project.databases },
                      { prefix: "os", items: project.serverOs },
                      { prefix: "fw", items: project.frameworksAndTools },
                    ].flatMap(({ prefix, items }) =>
                      items.map((tech) => (
                        <button
                          key={`${prefix}-${tech}`}
                          type="button"
                          className={styles.techTag}
                          onClick={() => onSelectTech(tech)}
                        >
                          {tech}
                        </button>
                      )),
                    )}
                  </div>
                </div>

                {/* Details Grid */}
                <div className={styles.projectDetailsGrid}>
                  <div>
                    <h4 className={styles.detailHeading}>{t.responsibilitiesLabel}</h4>
                    <p className={styles.detailText}>{project.responsibilities[locale]}</p>

                    {project.acquiredSkills.length > 0 && (
                      <>
                        <h4 className={`${styles.detailHeading} ${styles.mtSm}`}>
                          <Award size={14} />
                          <span>{t.acquiredSkillsLabel}</span>
                        </h4>
                        <ul className={styles.acquiredList}>
                          {project.acquiredSkills.map((s, idx) => (
                            <li key={idx}>{s[locale]}</li>
                          ))}
                        </ul>
                      </>
                    )}
                  </div>

                  <div>
                    <h4 className={styles.detailHeading}>{t.commentLabel}</h4>
                    <p className={styles.detailText}>{project.comment[locale]}</p>

                    {project.evaluation && (
                      <div className={styles.evaluationBox}>
                        <div className={styles.evaluationHeader}>
                          <MessageSquareQuote size={15} />
                          <span>{t.evaluationLabel}</span>
                        </div>
                        <p className={styles.evaluationText}>{project.evaluation[locale]}</p>
                      </div>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

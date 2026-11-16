import { useState } from "react"
import {
  FileText,
  Globe,
  LayoutGrid,
  Menu,
  Moon,
  Printer,
  QrCode,
  Sun,
  Terminal,
  X,
} from "lucide-react"
import { UI_TEXT, portfolioData } from "../data/portfolioData"
import styles from "../styles/modules/Header.module.css"
import type {
  Locale,
  PortfolioData,
  ThemeMode,
  ViewMode,
} from "../types/portfolio"
import { QrCodeModal } from "./QrCodeModal"

interface HeaderProps {
  data?: PortfolioData
  locale: Locale
  onToggleLocale: () => void
  theme: ThemeMode
  onToggleTheme: () => void
  viewMode: ViewMode
  onChangeViewMode: (mode: ViewMode) => void
  onPrint: () => void
}

export const Header = ({
  data = portfolioData,
  locale,
  onToggleLocale,
  theme,
  onToggleTheme,
  viewMode,
  onChangeViewMode,
  onPrint,
}: HeaderProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isQrModalOpen, setIsQrModalOpen] = useState(false)
  const t = UI_TEXT[locale]

  const handleToggleViewMode = () => {
    onChangeViewMode(viewMode === "interactive" ? "resume" : "interactive")
    setIsMenuOpen(false)
  }

  const handlePrint = () => {
    setIsMenuOpen(false)
    onPrint()
  }

  const handleOpenQrModal = () => {
    setIsMenuOpen(false)
    setIsQrModalOpen(true)
  }

  const closeMenu = () => {
    setIsMenuOpen(false)
  }

  return (
    <>
      <header className={`${styles.siteHeader} no-print`}>
        <div className={`container ${styles.headerInner}`}>
          <div className={styles.brandGroup}>
            <a href="#top" className={styles.brandLink} onClick={closeMenu}>
              <span className={styles.brandIcon} aria-hidden="true">
                <Terminal size={18} />
              </span>
              <span className={styles.brandText}>
                <span className={styles.brandName}>{data.brandName}</span>
                <span className={styles.brandRole}>{data.brandRole}</span>
              </span>
            </a>
          </div>

          {viewMode === "interactive" && (
            <nav className={styles.mainNav} aria-label="Main Navigation">
              <a href="#about" className={styles.navLink}>
                {t.navAbout}
              </a>
              <a href="#skills" className={styles.navLink}>
                {t.navSkills}
              </a>
              <a href="#projects" className={styles.navLink}>
                {t.navProjects}
              </a>
            </nav>
          )}

          <div className={styles.headerActions}>
            <button
              type="button"
              className={`${styles.actionBtn} ${styles.desktopOnlyAction} ${
                viewMode === "resume" ? styles.modeToggleBtnActive : ""
              }`}
              onClick={handleToggleViewMode}
            >
              {viewMode === "interactive" ? (
                <>
                  <FileText size={16} />
                  <span>{t.navResume}</span>
                </>
              ) : (
                <>
                  <LayoutGrid size={16} />
                  <span>{t.navInteractive}</span>
                </>
              )}
            </button>

            <button
              type="button"
              className={`${styles.actionBtn} ${styles.desktopOnlyAction}`}
              onClick={handlePrint}
              title={t.printResume}
            >
              <Printer size={16} />
              <span className={styles.btnLabelDesktop}>{t.printResume}</span>
            </button>

            <button
              type="button"
              className={styles.iconBtn}
              onClick={handleOpenQrModal}
              aria-label="Open QR Code Modal"
              title={t.qrModalTitle}
            >
              <QrCode size={16} />
              <span className={styles.btnLabelDesktop}>{t.qrShareBtn}</span>
            </button>

            <button
              type="button"
              className={styles.iconBtn}
              onClick={onToggleLocale}
              aria-label="Toggle Language"
              title={t.toggleLanguageTitle}
            >
              <Globe size={16} />
              <span className={styles.langCode}>{locale.toUpperCase()}</span>
            </button>

            <button
              type="button"
              className={styles.iconBtn}
              onClick={onToggleTheme}
              aria-label="Toggle Theme"
              title={
                theme === "dark" ? t.switchToLightTitle : t.switchToDarkTitle
              }
            >
              {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            <button
              type="button"
              className={`${styles.iconBtn} ${styles.mobileMenuBtn} ${
                isMenuOpen ? styles.mobileMenuBtnActive : ""
              }`}
              onClick={() => setIsMenuOpen((prev) => !prev)}
              aria-label="Toggle Menu"
              aria-expanded={isMenuOpen}
              aria-controls="mobile-navigation-drawer"
            >
              {isMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div
            id="mobile-navigation-drawer"
            className={styles.mobileMenuDrawer}
            role="dialog"
            aria-label="Mobile Navigation"
          >
            <div className={`container ${styles.mobileMenuInner}`}>
              {viewMode === "interactive" && (
                <nav
                  className={styles.mobileNavLinks}
                  aria-label="Mobile Section Links"
                >
                  <a
                    href="#about"
                    className={styles.mobileNavLink}
                    onClick={closeMenu}
                  >
                    {t.navAbout}
                  </a>
                  <a
                    href="#skills"
                    className={styles.mobileNavLink}
                    onClick={closeMenu}
                  >
                    {t.navSkills}
                  </a>
                  <a
                    href="#projects"
                    className={styles.mobileNavLink}
                    onClick={closeMenu}
                  >
                    {t.navProjects}
                  </a>
                </nav>
              )}

              <div className={styles.mobileMenuActions}>
                <button
                  type="button"
                  className={`${styles.actionBtn} ${styles.mobileActionBtn} ${
                    viewMode === "resume" ? styles.modeToggleBtnActive : ""
                  }`}
                  onClick={handleToggleViewMode}
                >
                  {viewMode === "interactive" ? (
                    <>
                      <FileText size={16} />
                      <span>{t.navResume}</span>
                    </>
                  ) : (
                    <>
                      <LayoutGrid size={16} />
                      <span>{t.navInteractive}</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  className={`${styles.actionBtn} ${styles.mobileActionBtn}`}
                  onClick={handlePrint}
                >
                  <Printer size={16} />
                  <span>{t.printResume}</span>
                </button>

                <button
                  type="button"
                  className={`${styles.actionBtn} ${styles.mobileActionBtn}`}
                  onClick={handleOpenQrModal}
                >
                  <QrCode size={16} />
                  <span>{t.qrModalTitle}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      {isQrModalOpen && (
        <QrCodeModal
          portfolioUrl={data.portfolioUrl}
          portfolioQrSvgPath={data.portfolioQrSvgPath}
          locale={locale}
          onClose={() => setIsQrModalOpen(false)}
        />
      )}
    </>
  )
}

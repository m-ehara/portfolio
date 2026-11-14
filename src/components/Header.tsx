import { useState } from "react"
import {
  Check,
  Copy,
  Download,
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
  const [copiedUrl, setCopiedUrl] = useState(false)
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
    setCopiedUrl(false)
    setIsQrModalOpen(true)
  }

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(data.portfolioUrl)
      setCopiedUrl(true)
    } catch {
      setCopiedUrl(true)
    }
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
              title={locale === "ja" ? "Switch to English" : "日本語に切り替え"}
            >
              <Globe size={16} />
              <span className={styles.langCode}>{locale.toUpperCase()}</span>
            </button>

            <button
              type="button"
              className={styles.iconBtn}
              onClick={onToggleTheme}
              aria-label="Toggle Theme"
              title={theme === "dark" ? "Light Mode" : "Dark Mode"}
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
        <div
          className={`${styles.qrModalBackdrop} no-print`}
          onClick={() => setIsQrModalOpen(false)}
        >
          <div
            className={styles.qrModalCard}
            role="dialog"
            aria-modal="true"
            aria-label="QR Code Modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.qrModalHeader}>
              <div className={styles.qrModalTitleWrap}>
                <QrCode size={18} className={styles.qrModalIcon} />
                <h2 className={styles.qrModalTitle}>{t.qrModalTitle}</h2>
              </div>
              <button
                type="button"
                className={`${styles.iconBtn} ${styles.qrCloseBtn}`}
                onClick={() => setIsQrModalOpen(false)}
                aria-label={t.closeModalBtn}
              >
                <X size={16} />
              </button>
            </div>

            <p className={styles.qrModalSubtitle}>{t.qrModalSub}</p>

            <div className={styles.qrSvgFrame}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 37 37"
                className={styles.qrSvgImage}
                shapeRendering="crispEdges"
                role="img"
                aria-label={`QR Code for ${data.portfolioUrl}`}
              >
                <rect width="100%" height="100%" fill="#ffffff" rx="2" />
                <path d={data.portfolioQrSvgPath} fill="#0f172a" />
              </svg>
            </div>

            <div className={styles.qrUrlBox}>
              <span className={styles.qrUrlText}>{data.portfolioUrl}</span>
              <button
                type="button"
                className={`${styles.actionBtn} ${styles.qrCopyBtn}`}
                onClick={handleCopyUrl}
              >
                {copiedUrl ? <Check size={14} /> : <Copy size={14} />}
                <span>{copiedUrl ? t.copiedUrlLabel : t.copyUrlBtn}</span>
              </button>
            </div>

            <div className={styles.qrDownloadRow}>
              <a
                href="/qr-portfolio.png"
                download="portfolio-qr.png"
                className={`secondary-btn ${styles.qrDownloadBtn}`}
              >
                <Download size={15} />
                <span>{t.downloadPngBtn}</span>
              </a>
              <a
                href="/qr-portfolio.svg"
                download="portfolio-qr.svg"
                className={`secondary-btn ${styles.qrDownloadBtn}`}
              >
                <Download size={15} />
                <span>{t.downloadSvgBtn}</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

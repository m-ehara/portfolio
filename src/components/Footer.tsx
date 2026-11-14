import { portfolioData } from "../data/portfolioData"
import styles from "../styles/modules/Footer.module.css"
import type { PortfolioData } from "../types/portfolio"

interface FooterProps {
  data?: PortfolioData
}

export const Footer = ({ data = portfolioData }: FooterProps) => {
  return (
    <footer className={`${styles.siteFooter} no-print`}>
      <div className={`container ${styles.footerInner}`}>
        <div className={styles.footerLeft}>
          <span className={styles.footerBrand}>{data.name.en}</span>
          <span className={styles.footerSep}>·</span>
          <span>{data.jobTitle.en}</span>
        </div>
        <div className={styles.footerRight}>
          <span>
            Built with TypeScript, React, Vite, Vitest, Oxlint &amp; Oxfmt
          </span>
        </div>
      </div>
    </footer>
  )
}

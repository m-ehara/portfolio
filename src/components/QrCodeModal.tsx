import { useEffect, useState } from "react"
import { Check, Copy, Download, QrCode, X } from "lucide-react"
import { UI_TEXT } from "../data/portfolioData"
import styles from "../styles/modules/QrCodeModal.module.css"
import type { Locale } from "../types/portfolio"

interface QrCodeModalProps {
  portfolioUrl: string
  portfolioQrSvgPath: string
  locale: Locale
  onClose: () => void
}

const buildQrSvgMarkup = (svgPath: string): string =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 37 37" width="512" height="512" shape-rendering="crispEdges">\n  <rect width="100%" height="100%" fill="#ffffff" rx="2" />\n  <path d="${svgPath}" fill="#0f172a" />\n</svg>\n`

export const QrCodeModal = ({
  portfolioUrl,
  portfolioQrSvgPath,
  locale,
  onClose,
}: QrCodeModalProps) => {
  const [copiedUrl, setCopiedUrl] = useState(false)
  const [pngDownloadHref, setPngDownloadHref] =
    useState<string>("/qr-portfolio.png")
  const t = UI_TEXT[locale]

  const svgDownloadHref = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
    buildQrSvgMarkup(portfolioQrSvgPath),
  )}`

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose()
      }
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => {
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [onClose])

  useEffect(() => {
    let cancelled = false
    const img = new Image()
    const handleLoad = () => {
      if (cancelled) {
        return
      }
      try {
        const canvas = document.createElement("canvas")
        canvas.width = 512
        canvas.height = 512
        const ctx = canvas.getContext("2d")
        if (ctx) {
          ctx.drawImage(img, 0, 0, 512, 512)
          setPngDownloadHref(canvas.toDataURL("image/png"))
        }
      } catch {
        // Keep static fallback if canvas export is unavailable
      }
    }
    img.addEventListener("load", handleLoad)
    img.src = svgDownloadHref
    return () => {
      cancelled = true
      img.removeEventListener("load", handleLoad)
    }
  }, [svgDownloadHref])

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(portfolioUrl)
      setCopiedUrl(true)
    } catch {
      setCopiedUrl(true)
    }
  }

  return (
    <div className={`${styles.qrModalBackdrop} no-print`} onClick={onClose}>
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
            className={`${styles.modalActionBtn} ${styles.qrCloseBtn}`}
            onClick={onClose}
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
            aria-label={`QR Code for ${portfolioUrl}`}
          >
            <rect width="100%" height="100%" fill="#ffffff" rx="2" />
            <path d={portfolioQrSvgPath} fill="#0f172a" />
          </svg>
        </div>

        <div className={styles.qrUrlBox}>
          <span className={styles.qrUrlText}>{portfolioUrl}</span>
          <button
            type="button"
            className={`${styles.modalActionBtn} ${styles.qrCopyBtn}`}
            onClick={handleCopyUrl}
          >
            {copiedUrl ? <Check size={14} /> : <Copy size={14} />}
            <span>{copiedUrl ? t.copiedUrlLabel : t.copyUrlBtn}</span>
          </button>
        </div>

        <div className={styles.qrDownloadRow}>
          <a
            href={pngDownloadHref}
            download="portfolio-qr.png"
            className={`secondary-btn ${styles.qrDownloadBtn}`}
          >
            <Download size={15} />
            <span>{t.downloadPngBtn}</span>
          </a>
          <a
            href={svgDownloadHref}
            download="portfolio-qr.svg"
            className={`secondary-btn ${styles.qrDownloadBtn}`}
          >
            <Download size={15} />
            <span>{t.downloadSvgBtn}</span>
          </a>
        </div>
      </div>
    </div>
  )
}

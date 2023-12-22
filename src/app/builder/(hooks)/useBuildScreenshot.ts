import { useEffect, useRef, useState } from 'react'
import html2canvas from 'html2canvas'

export default function useBuildScreenshot() {
  const [screenshotMode, setScreenshotMode] = useState<{
    el: HTMLDivElement | null
    imageFileName: string
  } | null>(null)

  const buildContainerRef = useRef<HTMLDivElement>(null)

  /**
   * Export the build as an image
   */
  const handleImageExport = async (imageFileName: string) => {
    setScreenshotMode({ el: buildContainerRef.current, imageFileName })
  }

  /**
   * Export the build as an image
   */
  useEffect(() => {
    async function exportImage() {
      if (!screenshotMode) return
      const { el, imageFileName } = screenshotMode

      if (!el) return

      const canvas = await html2canvas(el, {
        useCORS: true,
        allowTaint: true,
        logging: false,
      })
      const image = canvas.toDataURL('image/png', 1.0)

      // Need a fakeLink to trigger the download
      const fakeLink = window.document.createElement('a')
      fakeLink.download = imageFileName
      fakeLink.href = image
      document.body.appendChild(fakeLink)
      fakeLink.click()
      document.body.removeChild(fakeLink)
      fakeLink.remove()

      setScreenshotMode(null)
    }
    exportImage()
  }, [screenshotMode])

  return {
    buildContainerRef,
    handleImageExport,
    isScreenshotModeActive: Boolean(screenshotMode),
  }
}
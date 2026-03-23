import { useEffect, useRef } from 'react'
import QrScanner from 'qr-scanner'
import './QRScanner.css'

const QRScanner = ({ onScanned }) => {
  const videoRef = useRef(null)
  const onScannedRef = useRef(onScanned)
  onScannedRef.current = onScanned

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const qrScanner = new QrScanner(
      video,
      (result) => {
        const tableId = result.data
        onScannedRef.current?.(tableId)
        const stopRet = qrScanner.stop()
        if (stopRet && typeof stopRet.catch === 'function') stopRet.catch(() => {})
      },
      { returnDetailedScanResult: true }
    )

    const startRet = qrScanner.start()
    if (startRet && typeof startRet.catch === 'function') {
      startRet.catch((err) => {
        if (err?.name === 'AbortError') return
        console.warn('QR Scanner start error:', err)
      })
    }

    return () => {
      const stopRet = qrScanner.stop()
      if (stopRet && typeof stopRet.catch === 'function') {
        stopRet.catch(() => {}).finally(() => qrScanner.destroy())
      } else {
        qrScanner.destroy()
      }
    }
  }, [])

  return (
    <div className="qr-scanner">
      <video ref={videoRef} className="qr-video"></video>
      <div className="qr-overlay">
        <div className="qr-frame"></div>
        <p>Đưa camera vào mã QR trên bàn</p>
      </div>
    </div>
  )
}

export default QRScanner

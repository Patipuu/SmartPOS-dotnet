import { useEffect, useRef } from 'react'
import QrScanner from 'qr-scanner'
import './QRScanner.css'

const QRScanner = ({ onScanned }) => {
  const videoRef = useRef(null)
  const qrScannerRef = useRef(null)

  useEffect(() => {
    if (videoRef.current) {
      const qrScanner = new QrScanner(
        videoRef.current,
        (result) => {
          // Extract table ID from QR code
          const tableId = result.data
          onScanned(tableId)
          qrScanner.stop()
        },
        {
          returnDetailedScanResult: true,
        }
      )

      qrScannerRef.current = qrScanner
      qrScanner.start()

      return () => {
        qrScanner.stop()
        qrScanner.destroy()
      }
    }
  }, [onScanned])

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

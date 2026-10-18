import { useEffect, useRef, useState } from 'react'
import { cn } from '@/shared/lib/cn'

type Props = {
  /** `face` draws an oval for a selfie; `qr` draws a square for scanning a code. */
  guide: 'face' | 'qr'
  /** Front camera for faces, back camera for codes. */
  facing: 'user' | 'environment'
  /** Shown when the camera cannot be opened. */
  unavailableText: string
}

/** Live camera preview in a dark rounded frame with a green guide. It stops the camera on unmount. */
export function CameraView({ guide, facing, unavailableText }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [unavailable, setUnavailable] = useState(false)

  useEffect(() => {
    let stream: MediaStream | undefined
    let cancelled = false

    const start = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: facing } })
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop())
        } else if (videoRef.current) {
          videoRef.current.srcObject = stream
        }
      } catch {
        // No permission, no camera, or an insecure (non-HTTPS) page
        if (!cancelled) setUnavailable(true)
      }
    }
    void start()

    return () => {
      cancelled = true
      stream?.getTracks().forEach((track) => track.stop())
    }
  }, [facing])

  return (
    <div className="relative mx-auto aspect-[3/4] w-full max-w-80 shrink-0 overflow-hidden rounded-card bg-neutral-950">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={cn('size-full object-cover', facing === 'user' && '-scale-x-100')}
      />
      {unavailable && (
        <p className="absolute inset-x-6 top-1/2 -translate-y-1/2 text-center text-sm text-on-tile opacity-80">
          {unavailableText}
        </p>
      )}
      {/* The guide; its huge shadow dims everything outside it */}
      <div
        className={cn(
          'pointer-events-none absolute top-1/2 left-1/2 w-[64%] -translate-x-1/2 -translate-y-1/2 border-[3px] border-accent-500 shadow-[0_0_0_999px_rgb(24_25_29/0.55)]',
          guide === 'face' ? 'aspect-[3/4] rounded-[50%]' : 'aspect-square rounded-3xl',
        )}
      />
    </div>
  )
}

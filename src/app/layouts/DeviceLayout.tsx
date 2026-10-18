import { Outlet } from 'react-router-dom'
import { OVERLAY_ROOT_ID } from '@/shared/config/overlay'
import { Toaster } from '@/shared/ui/Toaster'

/** Full-bleed on phones; a centered phone-width column on larger screens. */
export function DeviceLayout() {
  return (
    <div className="relative mx-auto flex h-full w-full max-w-[430px] flex-col overflow-hidden bg-page">
      <Outlet />
      {/* Sheets portal in here so they stay inside the phone column */}
      <div id={OVERLAY_ROOT_ID} />
      <Toaster />
    </div>
  )
}

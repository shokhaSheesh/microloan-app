import { Outlet } from 'react-router-dom'
import { useApi } from '@/shared/api/useApi'
import type { HomeData } from '@/shared/api/types'
import { TabBar } from '@/shared/ui/TabBar'
import { tabs, tabsFromApi } from '../tabs'

/**
 * Tab screens scroll underneath the floating glass tab bar; they end with `pb-tabbar` to clear it.
 * The bar follows GET /client/home (`tabs`); if that fails it falls back to the five fixed tabs.
 */
export function TabLayout() {
  const home = useApi<HomeData>('/client/home')
  const shown = home.data ? tabsFromApi(home.data.tabs) : home.error ? tabs : null
  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      <main className="min-h-0 flex-1 overflow-y-auto">
        <Outlet />
      </main>
      {shown && <TabBar tabs={shown} />}
    </div>
  )
}

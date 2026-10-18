import { Outlet } from 'react-router-dom'
import { TabBar, type Tab } from '@/shared/ui/TabBar'

/** Tab screens scroll underneath the floating glass tab bar; they end with `pb-tabbar` to clear it. */
export function TabLayout({ tabs }: { tabs: Tab[] }) {
  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      <main className="min-h-0 flex-1 overflow-y-auto">
        <Outlet />
      </main>
      <TabBar tabs={tabs} />
    </div>
  )
}

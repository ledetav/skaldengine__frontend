import { useEffect } from 'react'
import type { AdminTab } from '../components/AdminSidebar'
import type { Lorebook } from '../types'

interface UseAdminNavigationParams {
  pathname: string
  activeTab: AdminTab
  lorebooksFandom: Lorebook[]
  lorebooksCharacter: Lorebook[]
  lorebooksPersona: Lorebook[]
  onTabChange: (tab: AdminTab) => void
  onPageReset: (tab: AdminTab) => void
}

/**
 * Синхронизирует активный таб с текущим URL pathname.
 */
export function useAdminNavigation({
  pathname,
  activeTab,
  lorebooksFandom,
  lorebooksCharacter,
  lorebooksPersona,
  onTabChange,
  onPageReset,
}: UseAdminNavigationParams) {
  useEffect(() => {
    let newTab: AdminTab | null = null

    if (pathname.includes('/admin/users')) newTab = 'users'
    else if (pathname.includes('/admin/personas')) newTab = 'personas'
    else if (pathname.includes('/admin/characters')) newTab = 'characters'
    else if (pathname.includes('/admin/scenarios')) newTab = 'scenarios'
    else if (pathname.includes('/admin/lorebooks/fandom')) newTab = 'lorebooks_fandom'
    else if (pathname.includes('/admin/lorebooks/characters')) newTab = 'lorebooks_character'
    else if (pathname.includes('/admin/lorebooks/personas')) newTab = 'lorebooks_persona'
    else if (pathname.includes('/admin/lorebooks/')) {
      const lbId = pathname.split('/admin/lorebooks/')[1]?.split('/')[0]
      if (lbId && lbId !== 'create') {
        const lb = [...lorebooksFandom, ...lorebooksCharacter, ...lorebooksPersona].find(l => l.id === lbId)
        if (lb) {
          if (lb.type === 'fandom') newTab = 'lorebooks_fandom'
          else if (lb.type === 'persona' || lb.user_persona_id) newTab = 'lorebooks_persona'
          else newTab = 'lorebooks_character'
        }
      }
    }

    if (newTab && newTab !== activeTab) {
      onTabChange(newTab)
      onPageReset(newTab)
    }
  }, [pathname, activeTab, lorebooksFandom, lorebooksCharacter, lorebooksPersona])
}

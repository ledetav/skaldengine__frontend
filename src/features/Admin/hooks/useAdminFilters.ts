import { useMemo } from 'react'
import type { Character, Lorebook, User, UserPersona } from '../types'
import type { AdminTab } from '../components/AdminSidebar'

export interface FilterState {
  roles?: string[]
  regDateStart?: string
  regDateEnd?: string
  userIds?: string[]
  chatCountMin?: number
  chatCountMax?: number
  lorebookCountMin?: number
  lorebookCountMax?: number
  fandoms?: string[]
  characterIds?: string[]
  isPublic?: 'all' | 'public' | 'private'
  isNSFW?: 'all' | 'safe' | 'nsfw'
  entriesCountMin?: number
  entriesCountMax?: number
}

interface UseAdminFiltersParams {
  characters: Character[]
  users: User[]
  personas: UserPersona[]
  lorebooksFandom: Lorebook[]
  lorebooksCharacter: Lorebook[]
  lorebooksPersona: Lorebook[]
  activeTab: AdminTab
  activeFilters: FilterState
  sortField: string
  sortDir: 'asc' | 'desc'
  userSearch: string
  personaSearch: string
}

function applySort<T extends Record<string, any>>(data: T[], field: string, dir: 'asc' | 'desc'): T[] {
  if (!field) return data
  return [...data].sort((a, b) => {
    const valA = a[field] ?? ''
    const valB = b[field] ?? ''
    if (typeof valA === 'string' && typeof valB === 'string') {
      const comp = valA.localeCompare(valB)
      return dir === 'asc' ? comp : -comp
    }
    if (valA < valB) return dir === 'asc' ? -1 : 1
    if (valA > valB) return dir === 'asc' ? 1 : -1
    return 0
  })
}

export function useAdminFilters({
  characters, users, personas,
  lorebooksFandom, lorebooksCharacter, lorebooksPersona,
  activeTab, activeFilters, sortField, sortDir,
  userSearch, personaSearch,
}: UseAdminFiltersParams) {
  const filteredUsers = useMemo(() => {
    const list = users.filter(u => {
      const s = userSearch.toLowerCase()
      const searchMatch = u.username.toLowerCase().includes(s) ||
        (u.full_name || '').toLowerCase().includes(s) ||
        u.login.toLowerCase().includes(s)
      if (!searchMatch) return false
      if (activeFilters.roles?.length && !activeFilters.roles.includes(u.role)) return false
      if (activeFilters.regDateStart && new Date(u.created_at) < new Date(activeFilters.regDateStart)) return false
      if (activeFilters.regDateEnd && new Date(u.created_at) > new Date(activeFilters.regDateEnd)) return false
      return true
    })
    return applySort(list, sortField, sortDir)
  }, [users, activeFilters, sortField, sortDir, userSearch])

  const filteredPersonas = useMemo(() => {
    const list = personas.filter(p => {
      if (!p.name.toLowerCase().includes(personaSearch.toLowerCase())) return false
      if (activeFilters.userIds?.length && !activeFilters.userIds.includes(p.owner_id)) return false
      if (activeFilters.chatCountMin !== undefined && (p.chat_count || 0) < activeFilters.chatCountMin) return false
      if (activeFilters.chatCountMax !== undefined && (p.chat_count || 0) > activeFilters.chatCountMax) return false
      if (activeFilters.lorebookCountMin !== undefined && (p.lorebook_count || 0) < activeFilters.lorebookCountMin) return false
      if (activeFilters.lorebookCountMax !== undefined && (p.lorebook_count || 0) > activeFilters.lorebookCountMax) return false
      return true
    })
    return applySort(list, sortField, sortDir)
  }, [personas, activeFilters, sortField, sortDir, personaSearch])

  const filteredCharacters = useMemo(() => {
    const list = characters.filter(c => {
      if (activeFilters.fandoms?.length && !activeFilters.fandoms.includes(c.fandom || '')) return false
      if (activeFilters.isPublic === 'public' && !c.is_public) return false
      if (activeFilters.isPublic === 'private' && c.is_public) return false
      if (activeFilters.isNSFW === 'safe' && c.nsfw_allowed) return false
      if (activeFilters.isNSFW === 'nsfw' && !c.nsfw_allowed) return false
      return true
    })
    return applySort(list, sortField, sortDir)
  }, [characters, activeFilters, sortField, sortDir])

  const filteredLorebooks = useMemo(() => {
    const list = activeTab === 'lorebooks_fandom' ? lorebooksFandom
      : activeTab === 'lorebooks_persona' ? lorebooksPersona
      : lorebooksCharacter
    return applySort(list.filter(lb => {
      const count = lb.entries?.length || lb.entries_count || 0
      if (activeFilters.entriesCountMin !== undefined && count < activeFilters.entriesCountMin) return false
      if (activeFilters.entriesCountMax !== undefined && count > activeFilters.entriesCountMax) return false
      return true
    }), sortField, sortDir)
  }, [lorebooksFandom, lorebooksCharacter, lorebooksPersona, activeFilters, activeTab, sortField, sortDir])

  const isFilterActiveForTab = (filters: FilterState, tab: AdminTab): boolean => {
    if (tab === 'users') return !!(filters.roles?.length || filters.regDateStart || filters.regDateEnd)
    if (tab === 'personas') return !!(filters.userIds?.length || filters.chatCountMin !== undefined || filters.chatCountMax !== undefined || filters.lorebookCountMin !== undefined || filters.lorebookCountMax !== undefined)
    if (tab === 'characters') return !!(filters.fandoms?.length || (filters.isPublic && filters.isPublic !== 'all') || (filters.isNSFW && filters.isNSFW !== 'all'))
    if (tab.startsWith('lorebooks_')) return !!(filters.fandoms?.length || filters.characterIds?.length || filters.entriesCountMin !== undefined || filters.entriesCountMax !== undefined)
    return false
  }

  return { filteredUsers, filteredPersonas, filteredCharacters, filteredLorebooks, isFilterActiveForTab }
}

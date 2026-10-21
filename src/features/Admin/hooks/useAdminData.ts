import { useState, useEffect } from 'react'
import { ApiClient } from '@/core/api/client'
import type { Character, Lorebook, User, UserPersona } from '../types'
import type { Scenario } from '@/core/types/chat'
import type { AdminTab } from '../components/AdminSidebar'

const PAGE_SIZE = 20

interface AdminDataState {
  characters: Character[]
  lorebooksFandom: Lorebook[]
  lorebooksCharacter: Lorebook[]
  lorebooksPersona: Lorebook[]
  users: User[]
  personas: UserPersona[]
  scenarios: Scenario[]
  allLorebooks: Lorebook[]
  isDataLoading: boolean
}

interface AdminDataActions {
  setCharacters: React.Dispatch<React.SetStateAction<Character[]>>
  setLorebooksFandom: React.Dispatch<React.SetStateAction<Lorebook[]>>
  setLorebooksCharacter: React.Dispatch<React.SetStateAction<Lorebook[]>>
  setLorebooksPersona: React.Dispatch<React.SetStateAction<Lorebook[]>>
  setUsers: React.Dispatch<React.SetStateAction<User[]>>
  setPersonas: React.Dispatch<React.SetStateAction<UserPersona[]>>
  setScenarios: React.Dispatch<React.SetStateAction<Scenario[]>>
  fetchTab: (tab: string, page: number, isInitial?: boolean) => Promise<void>
}

export function useAdminData(
  isAdmin: boolean,
  activeTab: AdminTab,
  pathname: string,
  currentPage: Record<string, number>
): AdminDataState & AdminDataActions {
  const [characters, setCharacters] = useState<Character[]>([])
  const [lorebooksFandom, setLorebooksFandom] = useState<Lorebook[]>([])
  const [lorebooksCharacter, setLorebooksCharacter] = useState<Lorebook[]>([])
  const [lorebooksPersona, setLorebooksPersona] = useState<Lorebook[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [personas, setPersonas] = useState<UserPersona[]>([])
  const [scenarios, setScenarios] = useState<Scenario[]>([])
  const [allLorebooks, setAllLorebooks] = useState<Lorebook[]>([])
  const [isDataLoading, setIsDataLoading] = useState(false)
  const [hasMore, setHasMore] = useState<Record<string, boolean>>({
    characters: true, lorebooks_fandom: true, lorebooks_character: true,
    lorebooks_persona: true, users: true, personas: true, scenarios: true
  })

  const fetchTab = async (tab: string, page: number, isInitial = false) => {
    if (!isInitial && !hasMore[tab]) return
    setIsDataLoading(true)
    const skip = (page - 1) * PAGE_SIZE
    try {
      if (tab === 'characters') {
        const res = await ApiClient.get<any>('core', `/characters/?skip=${skip}&limit=${PAGE_SIZE}`)
        if (res?.items) {
          setCharacters(prev => isInitial ? res.items : [...prev, ...res.items])
          setHasMore(prev => ({ ...prev, characters: res.items.length === PAGE_SIZE }))
        }
      } else if (tab.startsWith('lorebooks_')) {
        const type = tab.split('_')[1]
        const res = await ApiClient.get<any>('core', `/lorebooks/?skip=${skip}&limit=${PAGE_SIZE}&type=${type}`)
        const items = res.items || []
        if (type === 'fandom') setLorebooksFandom(prev => isInitial ? items : [...prev, ...items])
        else if (type === 'character') setLorebooksCharacter(prev => isInitial ? items : [...prev, ...items])
        else if (type === 'persona') setLorebooksPersona(prev => isInitial ? items : [...prev, ...items])
        setHasMore(prev => ({ ...prev, [tab]: items.length === PAGE_SIZE }))
      } else if (tab === 'users') {
        const res = await ApiClient.get<any>('auth', `/users/?skip=${skip}&limit=${PAGE_SIZE}`)
        if (res?.items) {
          setUsers(prev => isInitial ? res.items : [...prev, ...res.items])
          setHasMore(prev => ({ ...prev, users: res.items.length === PAGE_SIZE }))
        }
      } else if (tab === 'personas') {
        const res = await ApiClient.get<any>('core', `/personas/admin/all?skip=${skip}&limit=${PAGE_SIZE}`)
        if (res?.items) {
          setPersonas(prev => isInitial ? res.items : [...prev, ...res.items])
          setHasMore(prev => ({ ...prev, personas: res.items.length === PAGE_SIZE }))
        }
      } else if (tab === 'scenarios') {
        const res = await ApiClient.get<any>('core', `/scenarios/?skip=${skip}&limit=${PAGE_SIZE}`)
        if (res?.items) {
          setScenarios(prev => isInitial ? res.items : [...prev, ...res.items])
          setHasMore(prev => ({ ...prev, scenarios: res.items.length === PAGE_SIZE }))
        }
      }
    } catch (e) {
      console.error(`[Admin] Failed to load ${tab}`, e)
    } finally {
      setIsDataLoading(false)
    }
  }

  // Fetch data when tab/page changes
  useEffect(() => {
    if (!isAdmin) return
    fetchTab(activeTab, currentPage[activeTab] || 1, (currentPage[activeTab] || 1) === 1)
  }, [activeTab, isAdmin, currentPage[activeTab]])

  // Fetch all lorebooks for detail views (dropdowns)
  useEffect(() => {
    if (!isAdmin) return
    const needsAllLorebooks = pathname.includes('/characters/') || pathname.includes('/personas/') || pathname.includes('/scenarios/')
    if (!needsAllLorebooks) return
    ApiClient.get<any>('core', '/lorebooks/?skip=0&limit=500')
      .then(res => setAllLorebooks(res.items || []))
      .catch(e => console.error('[Admin] Failed to fetch all lorebooks', e))
  }, [isAdmin, pathname])

  // WebSocket real-time updates
  useEffect(() => {
    if (!isAdmin) return
    const rawApiUrl = import.meta.env.VITE_CORE_API_URL || ''
    let wsBaseUrl: string
    if (rawApiUrl.startsWith('http')) {
      wsBaseUrl = rawApiUrl.replace(/^http/, 'ws')
    } else {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
      wsBaseUrl = `${protocol}//${window.location.host}${rawApiUrl || '/api/v1'}`
    }

    const socket = new WebSocket(`${wsBaseUrl}/ws/updates`)

    socket.onmessage = async (event) => {
      try {
        const payload = JSON.parse(event.data)
        // Lorebook events
        if (payload.type === 'NEW_LOREBOOK') {
          const t = payload.data.type || (payload.data.user_persona_id ? 'persona' : 'character')
          if (t === 'fandom') setLorebooksFandom(p => p.some(l => l.id === payload.data.id) ? p : [payload.data, ...p])
          else if (t === 'character') setLorebooksCharacter(p => p.some(l => l.id === payload.data.id) ? p : [payload.data, ...p])
          else if (t === 'persona') setLorebooksPersona(p => p.some(l => l.id === payload.data.id) ? p : [payload.data, ...p])
        } else if (payload.type === 'UPDATE_LOREBOOK') {
          const upd = (p: Lorebook[]) => p.map(l => l.id === payload.data.id ? { ...l, ...payload.data } : l)
          setLorebooksFandom(upd); setLorebooksCharacter(upd); setLorebooksPersona(upd)
        } else if (payload.type === 'DELETE_LOREBOOK') {
          const del = (p: Lorebook[]) => p.some(l => l.id === payload.data.id) ? p.filter(l => l.id !== payload.data.id) : p
          setLorebooksFandom(del); setLorebooksCharacter(del); setLorebooksPersona(del)
        } else if (payload.type === 'REFRESH_LOREBOOK_ENTRIES') {
          const { lorebook_id } = payload.data
          ApiClient.get<Lorebook>('core', `/lorebooks/${lorebook_id}`).then(updatedLb => {
            const upd = (p: Lorebook[]) => p.map(l => l.id === lorebook_id ? updatedLb : l)
            setLorebooksFandom(upd); setLorebooksCharacter(upd); setLorebooksPersona(upd)
          })
        }
        // Character events
        else if (payload.type === 'NEW_CHARACTER') {
          setCharacters(p => p.some(c => c.id === payload.data.id) ? p : [payload.data, ...p])
        } else if (payload.type === 'UPDATE_CHARACTER') {
          setCharacters(p => p.map(c => c.id === payload.data.id ? { ...c, ...payload.data } : c))
        } else if (payload.type === 'DELETE_CHARACTER') {
          setCharacters(p => p.some(c => c.id === payload.data.id) ? p.filter(c => c.id !== payload.data.id) : p)
        }
        // Scenario events
        else if (payload.type === 'NEW_SCENARIO') {
          setScenarios(p => p.some(s => s.id === payload.data.id) ? p : [payload.data, ...p])
        } else if (payload.type === 'UPDATE_SCENARIO') {
          setScenarios(p => p.map(s => s.id === payload.data.id ? { ...s, ...payload.data } : s))
        } else if (payload.type === 'DELETE_SCENARIO') {
          setScenarios(p => p.some(s => s.id === payload.data.id) ? p.filter(s => s.id !== payload.data.id) : p)
        }
      } catch (err) {
        console.error('[Admin] WS parsing error:', err)
      }
    }

    return () => { socket.close() }
  }, [isAdmin])

  return {
    characters, lorebooksFandom, lorebooksCharacter, lorebooksPersona,
    users, personas, scenarios, allLorebooks, isDataLoading,
    setCharacters, setLorebooksFandom, setLorebooksCharacter, setLorebooksPersona,
    setUsers, setPersonas, setScenarios,
    fetchTab,
  }
}

import { useState, useMemo, useEffect } from 'react'
import { charactersApi } from '@/core/api/characters'
import type { Character } from '@/core/types/character'

export const useDashboard = () => {
  const [characters, setCharacters] = useState<Character[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [nsfwEnabled, setNsfwEnabled] = useState(false)
  const [selectedFandoms, setSelectedFandoms] = useState<string[]>([])
  const [gender, setGender] = useState('Любой')
  const [sortBy, setSortBy] = useState('По популярности')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  useEffect(() => {
    const fetchCharacters = async () => {
      try {
        setIsLoading(true)
        const data = await charactersApi.getCharacters()
        setCharacters(data)
        setError(null)
      } catch (err: any) {
        console.error('Error fetching characters:', err)
        setError('Не удалось загрузить персонажей. Пожалуйста, попробуйте позже.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchCharacters()

    const wsUrl = import.meta.env.VITE_CORE_API_URL?.replace('http', 'ws') || 'ws://localhost:8002/api/v1'
    const socket = new WebSocket(`${wsUrl}/ws/updates`)

    socket.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data)
        if (payload.type === 'NEW_CHARACTER') {
          const newChar = payload.data
          setCharacters(prev => {
            if (prev.some(c => c.id === newChar.id)) return prev
            return [newChar, ...prev]
          })
        } else if (payload.type === 'UPDATE_CHARACTER') {
          const updatedChar = payload.data
          setCharacters(prev => prev.map(c => c.id === updatedChar.id ? { ...c, ...updatedChar } : c))
        } else if (payload.type === 'DELETE_CHARACTER') {
          const { id } = payload.data
          setCharacters(prev => prev.filter(c => c.id !== id))
        }
      } catch (err) {
        console.error('WS Message parsing error:', err)
      }
    }

    socket.onerror = (err) => console.error('WS Error:', err)
    
    return () => {
      socket.close()
    }
  }, [])

  const availableFandoms = useMemo(() => {
    const counts: Record<string, number> = {}
    characters.forEach(c => {
      if (c.fandom) {
        counts[c.fandom] = (counts[c.fandom] || 0) + 1
      }
    })

    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
  }, [characters])

  const filteredCharacters = useMemo(() => {
    let result = [...characters]

    if (nsfwEnabled) {
      result = result.filter(c => c.nsfw_allowed)
    }

    if (selectedFandoms.length > 0) {
      result = result.filter(c => c.fandom && selectedFandoms.includes(c.fandom))
    }

    if (gender !== 'Любой') {
      result = result.filter(c => c.gender === gender)
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      result = result.filter(c =>
        c.name.toLowerCase().includes(query) ||
        c.description?.toLowerCase().includes(query)
      )
    }

    result.sort((a, b) => {
      let comparison = 0
      if (sortBy === 'По популярности') {
        comparison = (b.total_chats_count || 0) - (a.total_chats_count || 0)
      } else if (sortBy === 'Сначала новые') {
        comparison = new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
      } else if (sortBy === 'А-Я') {
        comparison = a.name.localeCompare(b.name)
      }

      return sortOrder === 'desc' ? comparison : -comparison
    })

    return result
  }, [characters, nsfwEnabled, selectedFandoms, gender, searchQuery, sortBy, sortOrder])

  const hotIds = useMemo(() => {
    return [...characters]
      .sort((a, b) => (b.monthly_chats_count || 0) - (a.monthly_chats_count || 0))
      .slice(0, 5)
      .map(c => c.id)
  }, [characters])

  const getPlural = (n: number) => {
    const l1 = n % 10;
    const l2 = n % 100;
    if (l2 >= 11 && l2 <= 19) return 'персонажей';
    if (l1 === 1) return 'персонаж';
    if (l1 >= 2 && l1 <= 4) return 'персонажа';
    return 'персонажей';
  }

  return {
    characters,
    isLoading,
    error,
    nsfwEnabled,
    setNsfwEnabled,
    selectedFandoms,
    setSelectedFandoms,
    gender,
    setGender,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    searchQuery,
    setSearchQuery,
    viewMode,
    setViewMode,
    isSidebarOpen,
    setIsSidebarOpen,
    availableFandoms,
    filteredCharacters,
    hotIds,
    resultsLabel: getPlural(filteredCharacters.length)
  }
}

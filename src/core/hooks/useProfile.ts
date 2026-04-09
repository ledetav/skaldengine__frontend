import { useState, useEffect } from 'react'
import { authApi } from '@/core/api/auth'
import { personasApi } from '@/core/api/personas'
import { lorebooksApi } from '@/core/api/lorebooks'
import type { UserProfile, ProfilePersona, ProfileLorebook } from '@/core/types/profile'

export const useProfile = () => {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [personas, setPersonas] = useState<ProfilePersona[]>([])
  const [lorebooks, setLorebooks] = useState<ProfileLorebook[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Fetch User Info and Stats in parallel
        const [userData, statsResponse, personasResponse, lorebooksResponse] = await Promise.all([
          authApi.getMe(),
          personasApi.getStats(),
          personasApi.getPersonas(),
          lorebooksApi.getLorebooks()
        ])

        // The personas and lorebooks might be wrapped in BaseResponse depending on implementation
        // But useDashboard.ts showed they return direct data (actually let me double check that)
        
        const personasData = Array.isArray(personasResponse) ? personasResponse : (personasResponse as any).data || []
        const lorebooksData = Array.isArray(lorebooksResponse) ? lorebooksResponse : (lorebooksResponse as any).data || []

        setUser({
          ...userData,
          statistics: statsResponse.data || {
            total_chats: 0,
            total_personas: 0,
            total_lorebooks: 0,
            total_messages: 0
          }
        })

        setPersonas(personasData.map((p: any) => ({
          id: p.id,
          name: p.name,
          description: p.description,
          avatar_url: p.avatar_url,
          age: p.age,
          gender: p.gender,
          lorebook_count: p.lorebook_count || 0,
          chat_count: p.chat_count || 0,
          appearance: p.appearance,
          personality: p.personality,
          facts: p.facts
        })))

        setLorebooks(lorebooksData)

      } catch (err: any) {
        console.error('Error fetching profile data:', err)
        setError('Не удалось загрузить данные профиля. Пожалуйста, попробуйте позже.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfileData()
  }, [])

  return {
    user,
    personas,
    lorebooks,
    isLoading,
    error
  }
}

import { useState, useEffect } from 'react'
import { chatsApi } from '@/core/api/chats'
import type { UserProfile, ProfilePersona, ProfileLorebook } from '@/core/types/profile'
import type { Chat } from '@/core/types/chat'

export const useProfile = () => {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [personas, setPersonas] = useState<ProfilePersona[]>([])
  const [lorebooks, setLorebooks] = useState<ProfileLorebook[]>([])
  const [lastChats, setLastChats] = useState<Chat[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Fetch User Info, Stats, Personas, Lorebooks and Chats in parallel
        const [userData, statsResponse, personasResponse, lorebooksResponse, chatsResponse] = await Promise.all([
          authApi.getMe(),
          personasApi.getStats(),
          personasApi.getPersonas(),
          lorebooksApi.getLorebooks(),
          chatsApi.getChats(0, 5) // Fetch last 5 chats
        ])
        
        const personasData = personasResponse || []
        const lorebooksData = lorebooksResponse || []
        const chatsData = chatsResponse || []

        setUser({
          ...userData,
          statistics: statsResponse || {
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
        setLastChats(chatsData)

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
    lastChats,
    isLoading,
    error
  }
}

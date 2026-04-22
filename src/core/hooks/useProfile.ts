import { logger } from "@/core/utils/logger";
import { useState, useEffect } from 'react'
import { authApi } from '@/core/api/auth'
import { personasApi } from '@/core/api/personas'
import { lorebooksApi } from '@/core/api/lorebooks'
import { chatsApi } from '@/core/api/chats'
import type { UserProfile, ProfilePersona, ProfileLorebook } from '@/core/types/profile'
import type { Chat } from '@/core/types/chat'
export const useProfile = (username?: string) => {
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

        if (username) {
          // Fetch public profile
          const publicResponse = await authApi.getPublicProfile(username)
          if (!publicResponse) throw new Error('User not found')
          
          const publicUser = publicResponse
          
          const statsResponse = await personasApi.getStats(publicUser.id)

          setUser({
            ...publicUser,
            statistics: statsResponse || {
              total_chats: 0,
              total_personas: 0,
              total_lorebooks: 0,
              total_messages: 0
            }
          })
          
          setPersonas([])
          setLorebooks([])
          setLastChats([])
        } else {
          // Fetch current user Info, Stats, Personas, Lorebooks and Chats in parallel
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

          setLorebooks(lorebooksData.map((lb: any) => ({
            id: lb.id,
            name: lb.name,
            description: lb.description || null,
            entries_count: lb.entries?.length || 0,
            fandom: lb.fandom || null
          })))
          setLastChats(chatsData)
        }

      } catch (err: any) {
        logger.error('Error fetching profile data:', err)
        setError('Не удалось загрузить данные профиля. Пожалуйста, попробуйте позже.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfileData()
  }, [])

  return {
    user,
    profile: user, // Alias used by AdminDashboard
    personas,
    lorebooks,
    lastChats,
    isLoading,
    error
  }
}

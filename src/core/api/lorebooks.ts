import { type Lorebook } from '@/core/types/chat'
import { ApiClient } from './client'

export const lorebooksApi = {
  getLorebooks: async (skip: number = 0, limit: number = 50): Promise<Lorebook[]> => {
    return ApiClient.get('core', `/lorebooks/?skip=${skip}&limit=${limit}`)
  }
}

import { logger } from '../utils/logger'

const CORE_API_URL = import.meta.env.VITE_CORE_API_URL || 'http://localhost:8002/api/v1'
const AUTH_API_URL = import.meta.env.VITE_AUTH_API_URL || 'http://localhost:8001/api/v1'

type ApiType = 'core' | 'auth'

export class ApiClient {
  private static getBaseUrl(type: ApiType) {
    return type === 'auth' ? AUTH_API_URL : CORE_API_URL
  }

  private static getHeaders() {
    const token = localStorage.getItem('token')
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
    return headers
  }

  static async request<T>(type: ApiType, endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.getBaseUrl(type)}${endpoint}`
    logger.info(`[API Request] ${options.method || 'GET'} ${url}`, options.body ? { body: options.body } : {});

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.getHeaders(),
          ...options.headers,
        },
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const detail = errorData.detail
        let errorMessage: string
        if (typeof detail === 'string') {
          errorMessage = detail
        } else if (detail && typeof detail === 'object' && typeof detail.message === 'string') {
          errorMessage = detail.message
        } else if (Array.isArray(detail)) {
          errorMessage = detail.map((e: any) => e.msg || JSON.stringify(e)).join(', ')
        } else if (typeof errorData.message === 'string') {
          errorMessage = errorData.message
        } else {
          errorMessage = `Request failed: ${response.statusText}`
        }
        logger.error(`[API Error] ${options.method || 'GET'} ${url} - Status ${response.status}: ${errorMessage}`, { errorData });
        throw new Error(errorMessage)
      }

      if (response.status === 204) {
        logger.debug(`[API Response] ${options.method || 'GET'} ${url} - Status 204 (No Content)`);
        return {} as T
      }

      const json = await response.json()
      logger.debug(`[API Response] ${options.method || 'GET'} ${url} - Status ${response.status}`, { data: json });

      // Unwrap BaseResponse if it follows the pattern { success, data, ... }
      if (json && typeof json === 'object' && 'success' in json && 'data' in json) {
        return json.data as T
      }

      return json as T
    } catch (error: any) {
      logger.error(`[API Fetch Error] ${options.method || 'GET'} ${url}`, { error: error.message });
      throw error;
    }
  }

  static get<T>(type: ApiType, endpoint: string, options?: RequestInit) {
    return this.request<T>(type, endpoint, { ...options, method: 'GET' })
  }

  static post<T>(type: ApiType, endpoint: string, body: any, options?: RequestInit) {
    return this.request<T>(type, endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(body),
    })
  }

  static patch<T>(type: ApiType, endpoint: string, body: any, options?: RequestInit) {
    return this.request<T>(type, endpoint, {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(body),
    })
  }

  static put<T>(type: ApiType, endpoint: string, body: any, options?: RequestInit) {
    return this.request<T>(type, endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(body),
    })
  }

  static delete<T>(type: ApiType, endpoint: string, options?: RequestInit) {
    return this.request<T>(type, endpoint, { ...options, method: 'DELETE' })
  }
}

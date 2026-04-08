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
    const response = await fetch(url, {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.detail || `Request failed: ${response.statusText}`)
    }

    if (response.status === 204) return {} as T
    return response.json()
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

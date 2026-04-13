import { ApiClient } from './client'

export const authApi = {
  register: async (data: Record<string, string | null>) => {
    return ApiClient.post('auth', '/auth/register', {
      email: data.email,
      login: data.login,
      username: data.handle || data.login,
      full_name: data.fullName || null,
      password: data.password,
      birth_date: data.birthDate,
    })
  },

  login: async (data: Record<string, string>) => {
    // OAuth2 login expects form data
    const formData = new URLSearchParams()
    formData.append('username', data.login) // OAuth2 uses 'username' for login field
    formData.append('password', data.password)

    return ApiClient.request('auth', '/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData,
    })
  },

  getMe: async () => {
    return ApiClient.get<any>('auth', '/users/me')
  },

  updateMe: async (data: Record<string, string | null>) => {
    return ApiClient.patch<any>('auth', '/users/me', data)
  },

  changePassword: async (oldPassword: string, newPassword: string) => {
    return ApiClient.post<any>('auth', '/users/me/password', {
      old_password: oldPassword,
      new_password: newPassword,
    })
  },

  deleteMe: async () => {
    return ApiClient.delete<any>('auth', '/users/me')
  },

  getPublicProfile: async (username: string) => {
    return ApiClient.get<any>('auth', `/users/profile/${username}`)
  }
}

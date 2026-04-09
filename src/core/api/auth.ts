import { ApiClient } from './client'

export const authApi = {
  register: async (data: Record<string, string | null>) => {
    return ApiClient.post('auth', '/auth/register', {
      email: data.email,
      username: data.login,
      handle: data.handle,
      password: data.password,
      birth_date: data.birthDate,
      full_name: data.fullName || null,
    })
  },

  login: async (data: Record<string, string>) => {
    // OAuth2 login expects form data
    const formData = new URLSearchParams()
    formData.append('username', data.login) // OAuth2 uses 'username' for both login/email
    formData.append('password', data.password)

    return ApiClient.request('auth', '/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData,
    })
  },

  getMe: async () => {
    return ApiClient.get<any>('auth', '/users/me')
  }
}

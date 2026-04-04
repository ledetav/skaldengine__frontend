const BASE_URL = 'http://localhost:8001/api/v1'

export const authApi = {
  register: async (data: any) => {
    const response = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: data.email,
        username: data.login,
        password: data.password,
        birth_date: data.birthDate,
      }),
    })
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.detail || 'Registration failed')
    }
    return response.json()
  },

  login: async (data: any) => {
    // OAuth2 login expects form data
    const formData = new URLSearchParams()
    formData.append('username', data.login) // OAuth2 uses 'username' for both login/email
    formData.append('password', data.password)

    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData,
    })
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.detail || 'Login failed')
    }
    return response.json()
  }
}

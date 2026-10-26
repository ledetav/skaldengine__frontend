import { ApiClient } from './client'

/**
 * Сервис API аутентификации и управления учетными записями пользователей.
 */
export const authApi = {
  /**
   * Регистрация нового пользователя в системе.
   */
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

  /**
   * Авторизация пользователя по стандарту OAuth2 Password Request.
   */
  login: async (data: Record<string, string>) => {
    // Авторизация OAuth2 требует передачи данных формы application/x-www-form-urlencoded
    const formData = new URLSearchParams()
    formData.append('username', data.login) // По спецификации OAuth2 для логина используется поле 'username'
    formData.append('password', data.password)

    return ApiClient.request('auth', '/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData,
    })
  },

  /**
   * Получение данных профиля текущего авторизованного пользователя.
   */
  getMe: async () => {
    return ApiClient.get<any>('auth', '/users/me')
  },

  /**
   * Обновление данных профиля текущего пользователя.
   */
  updateMe: async (data: Record<string, string | null>) => {
    return ApiClient.patch<any>('auth', '/users/me', data)
  },

  /**
   * Смена пароля текущего пользователя.
   */
  changePassword: async (oldPassword: string, newPassword: string) => {
    return ApiClient.post<any>('auth', '/users/me/password', {
      old_password: oldPassword,
      new_password: newPassword,
    })
  },

  /**
   * Удаление учетной записи текущего пользователя.
   */
  deleteMe: async () => {
    return ApiClient.delete<any>('auth', '/users/me')
  },

  /**
   * Получение публичного профиля пользователя по его никнейму.
   */
  getPublicProfile: async (username: string) => {
    return ApiClient.get<any>('auth', `/users/profile/${username}`)
  }
}

import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface User {
  email: string
  name: string
  type: 'guest' | 'staff'
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const isLoggedIn = ref(false)

  const login = (userData: User) => {
    user.value = userData
    isLoggedIn.value = true
    // Store in localStorage for persistence
    localStorage.setItem('user', JSON.stringify(userData))
  }

  const logout = () => {
    user.value = null
    isLoggedIn.value = false
    localStorage.removeItem('user')
  }

  const initAuth = () => {
    // Check for stored user data on app start
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser)
        user.value = userData
        isLoggedIn.value = true
      } catch (error) {
        console.error('Error parsing stored user data:', error)
        localStorage.removeItem('user')
      }
    }
  }

  const isGuest = () => user.value?.type === 'guest'
  const isStaff = () => user.value?.type === 'staff'

  return {
    user,
    isLoggedIn,
    login,
    logout,
    initAuth,
    isGuest,
    isStaff
  }
})

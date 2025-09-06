<template>
    <nav class="bg-white shadow-sm border-b">
        <div class="max-w-7xl mx-auto px-6">
            <div class="flex justify-between items-center h-16">
                <div class="flex items-center cursor-pointer" @click="$router.push('/')">
                    <h1 class="text-xl font-bold text-gray-900">Hotel Reservation System</h1>
                </div>

                <div class="flex items-center space-x-8">
                    <!-- Navigation Links -->
                    <div class="flex space-x-6">
                        <router-link to="/"
                            class="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                            :class="{ 'text-blue-600 bg-blue-50': $route.path === '/' }">
                            Search Rooms
                        </router-link>
                        <router-link v-if="authStore.isLoggedIn && authStore.isGuest()" to="/my-bookings"
                            class="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                            :class="{ 'text-blue-600 bg-blue-50': $route.path === '/my-bookings' }">
                            My Bookings
                        </router-link>
                        <router-link v-if="authStore.isLoggedIn && authStore.isStaff()" to="/staff"
                            class="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                            :class="{ 'text-blue-600 bg-blue-50': $route.path === '/staff' }">
                            Staff Dashboard
                        </router-link>
                    </div>

                    <!-- User Info and Auth -->
                    <div class="flex items-center space-x-4">
                        <div v-if="authStore.isLoggedIn" class="flex items-center space-x-3">
                            <div class="text-sm">
                                <span class="text-gray-700">Welcome, </span>
                                <span class="font-medium text-gray-900">{{ authStore.user?.name }}</span>
                                <span class="text-xs text-gray-500 ml-1">({{ authStore.user?.type }})</span>
                            </div>
                            <button
                                @click="handleLogout"
                                class="text-gray-600 hover:text-gray-900 text-sm font-medium"
                            >
                                Logout
                            </button>
                        </div>
                        <div v-else>
                            <router-link
                                to="/login"
                                class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                            >
                                Login
                            </router-link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </nav>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

const handleLogout = () => {
    authStore.logout()
    router.push('/login')
}
</script>

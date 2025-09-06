<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const userType = ref<'guest' | 'staff'>('guest')
const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

// Demo accounts
const demoAccounts = {
    guest: {
        email: 'guest@demo.com',
        password: 'password',
        name: 'John Doe'
    },
    staff: {
        email: 'staff@demo.com',
        password: 'password',
        name: 'Jane Smith'
    }
}

const fillDemoAccount = (type: 'guest' | 'staff') => {
    userType.value = type
    email.value = demoAccounts[type].email
    password.value = demoAccounts[type].password
}

const handleLogin = async () => {
    loading.value = true
    error.value = ''

    try {
        // Simulate authentication delay
        await new Promise(resolve => setTimeout(resolve, 1000))

        // Simple authentication logic
        const account = demoAccounts[userType.value]

        if (email.value === account.email && password.value === account.password) {
            // Successful login
            authStore.login({
                email: email.value,
                name: account.name,
                type: userType.value
            })

            // Redirect based on user type
            if (userType.value === 'staff') {
                router.push('/staff')
            } else {
                router.push('/my-bookings')
            }
        } else {
            error.value = 'Invalid email or password'
        }
    } catch (err) {
        error.value = 'Login failed. Please try again.'
    } finally {
        loading.value = false
    }
}

const skipLogin = () => {
    router.push('/')
};
</script>


<template>
    <div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div class="max-w-md w-full mx-4">
            <div class="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
                <!-- Header -->
                <div class="text-center mb-8">
                    <h1 class="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
                    <p class="text-gray-600">Sign in to your hotel reservation account</p>
                </div>

                <!-- User Type Selector -->
                <div class="mb-6">
                    <div class="flex rounded-lg bg-gray-100 p-1">
                        <button @click="userType = 'guest'" :class="[
                            'flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors',
                            userType === 'guest'
                                ? 'bg-white text-blue-600 shadow-sm'
                                : 'text-gray-600 hover:text-gray-900'
                        ]">
                            Guest
                        </button>
                        <button @click="userType = 'staff'" :class="[
                            'flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors',
                            userType === 'staff'
                                ? 'bg-white text-blue-600 shadow-sm'
                                : 'text-gray-600 hover:text-gray-900'
                        ]">
                            Staff
                        </button>
                    </div>
                </div>

                <!-- Login Form -->
                <form @submit.prevent="handleLogin" class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
                        <input v-model="email" type="email" required placeholder="Enter your email"
                            class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Password</label>
                        <input v-model="password" type="password" required placeholder="Enter your password"
                            class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                    </div>

                    <!-- Error Message -->
                    <div v-if="error" class="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p class="text-red-600 text-sm">{{ error }}</p>
                    </div>

                    <!-- Login Button -->
                    <button type="submit" :disabled="loading"
                        class="w-full py-3 px-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 disabled:opacity-50">
                        {{ loading ? 'Signing in...' : 'Sign In' }}
                    </button>
                </form>

                <!-- Demo Accounts -->
                <div class="mt-8 pt-6 border-t border-gray-200">
                    <p class="text-sm text-gray-600 text-center mb-4">Demo Accounts</p>
                    <div class="space-y-2">
                        <button @click="fillDemoAccount('guest')"
                            class="w-full p-2 text-left text-sm text-gray-600 hover:bg-gray-50 rounded border">
                            <strong>Guest:</strong> guest@demo.com / password
                        </button>
                        <button @click="fillDemoAccount('staff')"
                            class="w-full p-2 text-left text-sm text-gray-600 hover:bg-gray-50 rounded border">
                            <strong>Staff:</strong> staff@demo.com / password
                        </button>
                    </div>
                </div>

                <!-- Skip Login for Development -->
                <div class="mt-4 text-center">
                    <button @click="skipLogin" class="text-sm text-gray-500 hover:text-gray-700 underline">
                        Continue without login (Development)
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

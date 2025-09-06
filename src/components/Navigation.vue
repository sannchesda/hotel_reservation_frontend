<template>
    <nav class="bg-white shadow-sm border-b">
        <div class="max-w-7xl mx-auto px-6">
            <div class="flex justify-between items-center h-16">
                <div class="flex items-center">
                    <h1 class="text-xl font-bold text-gray-900">Hotel Reservation System</h1>
                </div>

                <div class="flex space-x-8">
                    <router-link to="/"
                        class="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                        :class="{ 'text-blue-600 bg-blue-50': $route.path === '/' }">
                        Guest View
                    </router-link>
                    <router-link to="/staff"
                        class="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                        :class="{ 'text-blue-600 bg-blue-50': $route.path === '/staff' }">
                        Staff Dashboard
                    </router-link>
                </div>
            </div>
        </div>
    </nav>
</template>

<script setup lang="ts">
// No script needed for this simple navigation component
</script>

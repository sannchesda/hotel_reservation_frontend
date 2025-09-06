<template>
    <div class="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
        <div class="flex justify-between items-center mb-6">
            <h2 class="text-xl font-bold text-gray-900">{{ isEditing ? 'Edit Room' : 'Create New Room' }}</h2>
            <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12">
                    </path>
                </svg>
            </button>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-4">
            <!-- Room Number -->
            <div>
                <label for="number" class="block text-sm font-medium text-gray-700 mb-1">
                    Room Number
                </label>
                <input id="number" v-model="form.number" type="text" required placeholder="e.g., 101, A-205"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                <p v-if="errors.number" class="mt-1 text-sm text-red-600">{{ errors.number }}</p>
            </div>

            <!-- Capacity -->
            <div>
                <label for="capacity" class="block text-sm font-medium text-gray-700 mb-1">
                    Capacity (guests)
                </label>
                <input id="capacity" v-model.number="form.capacity" type="number" min="1" max="10" required
                    class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                <p v-if="errors.capacity" class="mt-1 text-sm text-red-600">{{ errors.capacity }}</p>
            </div>

            <!-- Price -->
            <div>
                <label for="price_dollar" class="block text-sm font-medium text-gray-700 mb-1">
                    Price per night ($)
                </label>
                <input id="price_dollar" v-model.number="form.price_dollar" type="number" min="0" step="0.01" required
                    placeholder="0.00"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                <p v-if="errors.price_dollar" class="mt-1 text-sm text-red-600">{{ errors.price_dollar }}</p>
            </div>

            <!-- Submit Button -->
            <div class="flex justify-end space-x-3 pt-4">
                <button type="button" @click="$emit('close')"
                    class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">
                    Cancel
                </button>
                <button type="submit" :disabled="submitting"
                    class="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed">
                    <span v-if="submitting">{{ isEditing ? 'Updating...' : 'Creating...' }}</span>
                    <span v-else>{{ isEditing ? 'Update Room' : 'Create Room' }}</span>
                </button>
            </div>
        </form>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { createRoom, updateRoom } from '@/services/api'
import type { Room } from '@/types'

interface Props {
    room?: Room
}

const props = defineProps<Props>()

// Define emits
const emit = defineEmits<{
    close: []
    success: [room: any]
}>()

const isEditing = computed(() => !!props.room)

// Form data
const form = reactive({
    number: '',
    capacity: 1,
    price_dollar: 0
})

// Component state
const submitting = ref(false)
const errors = ref<Record<string, string>>({})

// Initialize form with existing room data
const initializeForm = () => {
    if (props.room) {
        form.number = props.room.number
        form.capacity = props.room.capacity
        form.price_dollar = props.room.price_dollar
    }
}

// Validate form
const validateForm = () => {
    errors.value = {}

    if (!form.number.trim()) {
        errors.value.number = 'Room number is required'
    }

    if (form.capacity < 1 || form.capacity > 10) {
        errors.value.capacity = 'Capacity must be between 1 and 10'
    }

    if (form.price_dollar <= 0) {
        errors.value.price_dollar = 'Price must be greater than 0'
    }

    return Object.keys(errors.value).length === 0
}

// Handle form submission
const handleSubmit = async () => {
    if (!validateForm()) {
        return
    }

    submitting.value = true

    try {
        const roomData = {
            number: form.number.trim(),
            room_type: '', // Empty string for optional room type
            capacity: form.capacity,
            price_dollar: form.price_dollar
        }

        let result
        if (isEditing.value && props.room) {
            result = await updateRoom(props.room.id, roomData)
        } else {
            result = await createRoom(roomData)
        }

        emit('success', result)
        emit('close')
    } catch (error: any) {
        console.error('Error saving room:', error)

        // Handle validation errors from the backend
        if (error.response?.data?.detail) {
            if (typeof error.response.data.detail === 'string') {
                errors.value.general = error.response.data.detail
            } else if (Array.isArray(error.response.data.detail)) {
                // Handle FastAPI validation errors
                error.response.data.detail.forEach((err: any) => {
                    if (err.loc && err.loc.length > 1) {
                        errors.value[err.loc[1]] = err.msg
                    }
                })
            }
        } else {
            errors.value.general = `Failed to ${isEditing.value ? 'update' : 'create'} room. Please try again.`
        }
    } finally {
        submitting.value = false
    }
}

onMounted(() => {
    initializeForm()
})
</script>

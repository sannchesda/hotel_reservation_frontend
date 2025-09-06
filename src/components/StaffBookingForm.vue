<template>
  <div class="bg-white p-6 rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-xl font-bold text-gray-900">
        {{ isEditing ? 'Edit Booking' : 'Create New Booking' }}
      </h2>
      <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      </button>
    </div>

    <form @submit.prevent="handleSubmit" class="space-y-6">
      <!-- Guest Information -->
      <div class="bg-gray-50 p-4 rounded-lg">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Guest Information</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label for="full_name" class="block text-sm font-medium text-gray-700 mb-1">
              Full Name *
            </label>
            <input
              id="full_name"
              v-model="form.guest.full_name"
              type="text"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            <p v-if="errors.full_name" class="mt-1 text-sm text-red-600">{{ errors.full_name }}</p>
          </div>

          <div>
            <label for="email" class="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <input
              id="email"
              v-model="form.guest.email"
              type="email"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            <p v-if="errors.email" class="mt-1 text-sm text-red-600">{{ errors.email }}</p>
          </div>

          <div class="md:col-span-2">
            <label for="phone" class="block text-sm font-medium text-gray-700 mb-1">
              Phone *
            </label>
            <input
              id="phone"
              v-model="form.guest.phone"
              type="tel"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            <p v-if="errors.phone" class="mt-1 text-sm text-red-600">{{ errors.phone }}</p>
          </div>
        </div>
      </div>

      <!-- Booking Details -->
      <div class="bg-gray-50 p-4 rounded-lg">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Booking Details</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label for="room_id" class="block text-sm font-medium text-gray-700 mb-1">
              Room *
            </label>
            <select
              id="room_id"
              v-model="form.room_id"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select a room</option>
              <option v-for="room in availableRooms" :key="room.id" :value="room.id">
                {{ room.room_type || 'Room' }} - Room {{ room.number }} (${{ room.price_dollar }}/night)
              </option>
            </select>
            <p v-if="errors.room_id" class="mt-1 text-sm text-red-600">{{ errors.room_id }}</p>
          </div>

          <div>
            <label for="status" class="block text-sm font-medium text-gray-700 mb-1">
              Status *
            </label>
            <select
              id="status"
              v-model="form.status"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="PENDING">Pending</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
            <p v-if="errors.status" class="mt-1 text-sm text-red-600">{{ errors.status }}</p>
          </div>

          <div>
            <label for="check_in" class="block text-sm font-medium text-gray-700 mb-1">
              Check-in Date *
            </label>
            <input
              id="check_in"
              v-model="form.check_in"
              type="date"
              required
              :min="new Date().toISOString().split('T')[0]"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            <p v-if="errors.check_in" class="mt-1 text-sm text-red-600">{{ errors.check_in }}</p>
          </div>

          <div>
            <label for="check_out" class="block text-sm font-medium text-gray-700 mb-1">
              Check-out Date *
            </label>
            <input
              id="check_out"
              v-model="form.check_out"
              type="date"
              required
              :min="form.check_in || new Date().toISOString().split('T')[0]"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            <p v-if="errors.check_out" class="mt-1 text-sm text-red-600">{{ errors.check_out }}</p>
          </div>
        </div>

        <!-- Total Calculation -->
        <div v-if="selectedRoom && form.check_in && form.check_out" class="mt-4 p-3 bg-blue-50 rounded-md">
          <div class="flex justify-between items-center">
            <span class="text-sm text-gray-600">Estimated Total:</span>
            <span class="text-lg font-semibold text-blue-600">${{ calculatedTotal }}</span>
          </div>
          <div class="text-xs text-gray-500 mt-1">
            {{ nightsCount }} night(s) × ${{ selectedRoom.price_dollar }} per night
          </div>
        </div>
      </div>

      <!-- Error Display -->
      <div v-if="errors.general" class="bg-red-50 border border-red-200 rounded-md p-3">
        <p class="text-sm text-red-600">{{ errors.general }}</p>
      </div>

      <!-- Submit Buttons -->
      <div class="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          @click="$emit('close')"
          class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          :disabled="submitting"
          class="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span v-if="submitting">{{ isEditing ? 'Updating...' : 'Creating...' }}</span>
          <span v-else>{{ isEditing ? 'Update Booking' : 'Create Booking' }}</span>
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { createBooking, updateBooking, getRooms } from '@/services/api'
import type { Booking, Room, BookingStatus, CreateBookingPayload, UpdateBookingPayload } from '@/types'
import { useAuthStore } from '@/stores/auth';

interface Props {
  booking?: Booking
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  success: [booking: Booking]
}>()

const isEditing = computed(() => !!props.booking)

// Form data
const form = reactive({
  guest: {
    full_name: '',
    email: '',
    phone: ''
  },
  room_id: '' as string | number,
  check_in: '',
  check_out: '',
  status: 'PENDING' as BookingStatus
})

// Component state
const submitting = ref(false)
const availableRooms = ref<Room[]>([])
const errors = ref<Record<string, string>>({})

// Computed properties
const selectedRoom = computed(() => {
  return availableRooms.value.find(room => room.id === Number(form.room_id))
})

const nightsCount = computed(() => {
  if (!form.check_in || !form.check_out) return 0
  const checkIn = new Date(form.check_in)
  const checkOut = new Date(form.check_out)
  const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime())
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
})

const calculatedTotal = computed(() => {
  if (!selectedRoom.value || !nightsCount.value) return 0
  return selectedRoom.value.price_dollar * nightsCount.value
})

// Load available rooms
const loadRooms = async () => {
  try {
    availableRooms.value = await getRooms()
  } catch (error) {
    console.error('Error loading rooms:', error)
  }
}

// Initialize form with existing booking data
const initializeForm = () => {
  if (props.booking) {
    form.guest.full_name = props.booking.guest.full_name
    form.guest.email = props.booking.guest.email
    form.guest.phone = props.booking.guest.phone
    form.room_id = props.booking.room.id
    form.check_in = props.booking.check_in
    form.check_out = props.booking.check_out
    form.status = props.booking.status
  } else {
    // Set default check-in to today and check-out to tomorrow
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    form.check_in = today.toISOString().split('T')[0]
    form.check_out = tomorrow.toISOString().split('T')[0]
  }
}

// Validate form
const validateForm = () => {
  errors.value = {}

  // Guest validation
  if (!form.guest.full_name.trim()) {
    errors.value.full_name = 'Full name is required'
  }

  if (!form.guest.email.trim()) {
    errors.value.email = 'Email is required'
  } else if (!/\S+@\S+\.\S+/.test(form.guest.email)) {
    errors.value.email = 'Email format is invalid'
  }

  if (!form.guest.phone.trim()) {
    errors.value.phone = 'Phone is required'
  }

  // Booking validation
  if (!form.room_id) {
    errors.value.room_id = 'Room is required'
  }

  if (!form.check_in) {
    errors.value.check_in = 'Check-in date is required'
  }

  if (!form.check_out) {
    errors.value.check_out = 'Check-out date is required'
  }

  if (form.check_in && form.check_out && new Date(form.check_in) >= new Date(form.check_out)) {
    errors.value.check_out = 'Check-out date must be after check-in date'
  }

  return Object.keys(errors.value).length === 0
}

// Handle form submission
const handleSubmit = async () => {
  if (!validateForm()) {
    return
  }

  submitting.value = true

  const authStore = useAuthStore();
  try {
    if (isEditing.value && props.booking) {
      // Update existing booking
      const updatePayload: UpdateBookingPayload = {
        status: form.status,
        check_in: form.check_in,
        check_out: form.check_out,
        room_id: Number(form.room_id),
        guest: {
          full_name: form.guest.full_name.trim(),
          email: form.guest.email.trim(),
          phone: form.guest.phone.trim()
        },
        user_type: authStore.user?.type || 'guest',
      }

      const updatedBooking = await updateBooking(props.booking.id, updatePayload)
      emit('success', updatedBooking)
    } else {
      // Create new booking
      const createPayload: CreateBookingPayload = {
        guest: {
          full_name: form.guest.full_name.trim(),
          email: form.guest.email.trim(),
          phone: form.guest.phone.trim()
        },
        room_id: Number(form.room_id),
        check_in: form.check_in,
        check_out: form.check_out
      }

      const newBooking = await createBooking(createPayload)
      emit('success', newBooking)
    }
    
    emit('close')
  } catch (error: any) {
    console.error('Error saving booking:', error)

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
      errors.value.general = `Failed to ${isEditing.value ? 'update' : 'create'} booking. Please try again.`
    }
  } finally {
    submitting.value = false
  }
}

// Watch for check-out date changes to ensure it's after check-in
watch(() => form.check_in, (newCheckIn) => {
  if (newCheckIn && form.check_out && new Date(newCheckIn) >= new Date(form.check_out)) {
    const checkInDate = new Date(newCheckIn)
    checkInDate.setDate(checkInDate.getDate() + 1)
    form.check_out = checkInDate.toISOString().split('T')[0]
  }
})

onMounted(() => {
  loadRooms()
  initializeForm()
})
</script>

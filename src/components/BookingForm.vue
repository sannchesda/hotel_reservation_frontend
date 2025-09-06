<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
      <div class="p-8">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-2xl font-bold text-gray-900">Book Your Room</h2>
          <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <!-- Room Details -->
        <div class="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 class="font-semibold text-lg mb-2">{{ room.name }}</h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
            <div>
              <span class="font-medium">Check-in:</span> {{ checkInFormatted }}
            </div>
            <div>
              <span class="font-medium">Check-out:</span> {{ checkOutFormatted }}
            </div>
            <div>
              <span class="font-medium">Nights:</span> {{ numberOfNights }}
            </div>
          </div>
          <div class="mt-2">
            <span class="text-xl font-bold text-blue-600">${{ totalAmount }}</span>
            <span class="text-gray-600 ml-1">({{ numberOfNights }} nights × ${{ room.price }})</span>
          </div>
        </div>

        <!-- Guest Information Form -->
        <form @submit.prevent="submitBooking" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
              <input v-model="guestInfo.full_name" type="text" required :class="[
                'w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
              ]" placeholder="Enter your full name" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Email *</label>
              <input v-model="guestInfo.email" type="email" required :class="[
                'w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
              ]" placeholder="Enter your email" />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
            <input v-model="guestInfo.phone" type="tel"
              class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your phone number" />
          </div>

          <!-- Error Message -->
          <div v-if="error" class="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p class="text-red-600">{{ error }}</p>
          </div>

          <!-- Action Buttons -->
          <div class="flex gap-4 pt-4">
            <button type="button" @click="$emit('close')"
              class="flex-1 py-3 px-6 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button type="submit" :disabled="loading"
              class="flex-1 py-3 px-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 disabled:opacity-50">
              {{ loading ? 'Processing...' : 'Book Now' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { createBooking } from '@/services/api'
import { useAuthStore } from '@/stores/auth'

interface Room {
  id: number
  name: string
  price: number
  capacity: number
}

interface Props {
  room: Room
  checkIn: string
  checkOut: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  close: []
  booked: [bookingId: number]
}>()

const authStore = useAuthStore()
const loading = ref(false)
const error = ref('')

const guestInfo = ref({
  full_name: '',
  email: '',
  phone: ''
})

// Auto-fill user info if logged in
onMounted(() => {
  if (authStore.isLoggedIn && authStore.user) {
    guestInfo.value.email = authStore.user.email
    guestInfo.value.full_name = authStore.user.name
  }
})

const checkInFormatted = computed(() => new Date(props.checkIn).toLocaleDateString())
const checkOutFormatted = computed(() => new Date(props.checkOut).toLocaleDateString())

const numberOfNights = computed(() => {
  const checkInDate = new Date(props.checkIn)
  const checkOutDate = new Date(props.checkOut)
  const timeDiff = checkOutDate.getTime() - checkInDate.getTime()
  return Math.ceil(timeDiff / (1000 * 3600 * 24))
})

const totalAmount = computed(() => {
  return (props.room.price * numberOfNights.value).toFixed(2)
})

// Simple UUID generator
const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = Math.random() * 16 | 0
    const v = c == 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

const submitBooking = async () => {
  loading.value = true
  error.value = ''

  try {
    const bookingData = {
      room_id: props.room.id,
      guest: guestInfo.value,
      check_in: props.checkIn,
      check_out: props.checkOut,
      client_token: generateUUID()
    }

    const booking = await createBooking(bookingData)
    emit('booked', booking.id)
  } catch (err: any) {
    console.error('Booking error:', err)
    error.value = err.response?.data?.detail || err.response?.data?.error || 'Failed to create booking. Please try again.'
  } finally {
    loading.value = false
  }
}
</script>

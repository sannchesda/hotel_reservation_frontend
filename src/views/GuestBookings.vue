<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-4xl mx-auto px-6 py-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">
          {{ authStore.isLoggedIn ? 'My Bookings' : 'Find Your Bookings' }}
        </h1>
        <p class="text-gray-600">
          {{ authStore.isLoggedIn 
            ? `Welcome back, ${authStore.user?.name}! Here are your hotel reservations.`
            : 'View and manage your hotel reservations' 
          }}
        </p>
      </div>

      <!-- Email Search Form (only show if not logged in) -->
      <div v-if="!authStore.isLoggedIn" class="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">Find Your Bookings</h2>
        <form @submit.prevent="searchBookings" class="flex gap-4">
          <div class="flex-1">
            <input
              v-model="searchEmail"
              type="email"
              required
              placeholder="Enter your email address"
              class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <button
            type="submit"
            :disabled="loading || !searchEmail"
            class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ loading ? 'Searching...' : 'Search' }}
          </button>
        </form>
      </div>

      <!-- Error Message -->
      <div v-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <p class="text-red-600">{{ error }}</p>
      </div>

      <!-- Bookings List -->
      <div v-if="bookings.length > 0" class="space-y-6">
        <h3 class="text-xl font-semibold text-gray-900">Your Bookings ({{ bookings.length }})</h3>
        
        <div v-for="booking in bookings" :key="booking.id" class="bg-white rounded-lg shadow-md overflow-hidden">
          <div class="p-6">
            <div class="flex justify-between items-start mb-4">
              <div>
                <h4 class="text-lg font-semibold text-gray-900">Booking #{{ booking.id }}</h4>
                <p class="text-gray-600">{{ booking.room.room_type || 'Room' }} - Room {{ booking.room.number }}</p>
              </div>
              <div class="text-right">
                <span :class="getStatusBadgeClass(booking.status)" class="inline-flex px-3 py-1 text-sm font-semibold rounded-full">
                  {{ booking.status }}
                </span>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <p class="text-sm font-medium text-gray-700">Check-in</p>
                <p class="text-gray-900">{{ formatDate(booking.check_in) }}</p>
              </div>
              <div>
                <p class="text-sm font-medium text-gray-700">Check-out</p>
                <p class="text-gray-900">{{ formatDate(booking.check_out) }}</p>
              </div>
              <div>
                <p class="text-sm font-medium text-gray-700">Total Amount</p>
                <p class="text-gray-900 font-semibold">${{ booking.total_dollar }}</p>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <p class="text-sm font-medium text-gray-700">Guest</p>
                <p class="text-gray-900">{{ booking.guest.full_name }}</p>
                <p class="text-gray-600 text-sm">{{ booking.guest.email }}</p>
              </div>
              <div>
                <p class="text-sm font-medium text-gray-700">Room Details</p>
                <p class="text-gray-900">{{ booking.room.room_type || 'Room' }}</p>
                <p class="text-gray-600 text-sm">Capacity: {{ booking.room.capacity }} guests</p>
              </div>
            </div>

            <!-- Payment Status -->
            <div v-if="booking.payment_status" class="mb-4">
              <p class="text-sm font-medium text-gray-700">Payment Status</p>
              <span :class="getPaymentStatusClass(booking.payment_status)" class="inline-flex px-2 py-1 text-xs font-semibold rounded">
                {{ booking.payment_status }}
              </span>
            </div>

            <!-- Actions -->
            <div class="flex gap-3 pt-4 border-t">
              <!-- Pay Now Button for Pending Payments -->
              <button
                v-if="booking.status === 'PENDING' && booking.payment_status === 'PENDING'"
                @click="processPayment(booking)"
                :disabled="paymentLoading === booking.id"
                class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                {{ paymentLoading === booking.id ? 'Processing...' : 'Complete Payment' }}
              </button>

              <!-- Cancel Button for Pending/Confirmed bookings -->
              <button
                v-if="booking.status === 'PENDING' || booking.status === 'CONFIRMED'"
                @click="confirmCancelBooking(booking)"
                :disabled="cancelLoading === booking.id"
                class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                {{ cancelLoading === booking.id ? 'Cancelling...' : 'Cancel Booking' }}
              </button>

              <button
                v-if="booking.status === 'CANCELLED'"
                disabled
                class="px-4 py-2 bg-gray-300 text-gray-500 rounded-md cursor-not-allowed"
              >
                Cancelled
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- No Bookings Message -->
      <div v-else-if="searchPerformed && !loading" class="text-center py-12">
        <div class="mx-auto h-24 w-24 text-gray-400 mb-4">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
          </svg>
        </div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">No bookings found</h3>
        <p class="text-gray-600">No reservations were found for this email address.</p>
      </div>

      <!-- Welcome Message -->
      <div v-else-if="!searchPerformed" class="text-center py-12">
        <div class="mx-auto h-24 w-24 text-blue-400 mb-4">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
        </div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">Find Your Bookings</h3>
        <p class="text-gray-600">Enter your email address above to view your hotel reservations.</p>
      </div>
    </div>

    <!-- Simple Dialog -->
    <SimpleDialog
      v-model="dialogVisible"
      :title="dialogTitle"
      :message="dialogMessage"
      :show-cancel="dialogShowCancel"
      :confirm-text="dialogConfirmText"
      :cancel-text="dialogCancelText"
      @confirm="handleDialogConfirm"
      @cancel="handleDialogCancel"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getBookingsByEmail, cancelBooking as cancelBookingAPI, api } from '@/services/api'
import { useAuthStore } from '@/stores/auth'
import { useDialog } from '@/composables/useDialog'
import SimpleDialog from '@/components/SimpleDialog.vue'
import type { Booking } from '@/types'

const authStore = useAuthStore()

const {
  isVisible: dialogVisible,
  title: dialogTitle,
  message: dialogMessage,
  showCancel: dialogShowCancel,
  confirmText: dialogConfirmText,
  cancelText: dialogCancelText,
  showAlert,
  showConfirm,
  handleConfirm: handleDialogConfirm,
  handleCancel: handleDialogCancel
} = useDialog()
const searchEmail = ref('')
const bookings = ref<Booking[]>([])
const loading = ref(false)
const error = ref('')
const searchPerformed = ref(false)
const paymentLoading = ref<number | null>(null)
const cancelLoading = ref<number | null>(null)

// Auto-load bookings if user is logged in
onMounted(() => {
  if (authStore.isLoggedIn && authStore.user?.email) {
    searchEmail.value = authStore.user.email
    searchBookings()
  }
})

const searchBookings = async () => {
  if (!searchEmail.value) return

  loading.value = true
  error.value = ''
  searchPerformed.value = true

  try {
    const result = await getBookingsByEmail(searchEmail.value)
    bookings.value = result
  } catch (err: any) {
    console.error('Error fetching bookings:', err)
    error.value = 'Failed to fetch bookings. Please check your email and try again.'
    bookings.value = []
  } finally {
    loading.value = false
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const getStatusBadgeClass = (status: string) => {
  switch (status) {
    case 'CONFIRMED':
      return 'bg-green-100 text-green-800'
    case 'PENDING':
      return 'bg-yellow-100 text-yellow-800'
    case 'CANCELLED':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const getPaymentStatusClass = (status: string) => {
  switch (status) {
    case 'PAID':
      return 'bg-green-100 text-green-800'
    case 'PENDING':
      return 'bg-yellow-100 text-yellow-800'
    case 'FAILED':
      return 'bg-red-100 text-red-800'
    case 'REFUNDED':
      return 'bg-blue-100 text-blue-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const processPayment = async (booking: Booking) => {
  paymentLoading.value = booking.id

  try {
    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Simulate random payment success/failure (90% success rate)
    const success = Math.random() > 0.1

    const response = await api.post(`/bookings/${booking.id}/confirm_payment/`, {
      success,
      provider_ref: `pay_${Date.now()}`
    })

    // Update the booking in our local state
    const bookingIndex = bookings.value.findIndex(b => b.id === booking.id)
    if (bookingIndex !== -1) {
      bookings.value[bookingIndex].payment_status = response.data.payment_status
      if (response.data.payment_status === 'PAID') {
        bookings.value[bookingIndex].status = 'CONFIRMED'
      }
    }

    if (response.data.payment_status === 'PAID') {
      showAlert('Payment successful! Your booking is now confirmed.')
    } else {
      showAlert('Payment failed. Please try again.')
    }
  } catch (error) {
    console.error('Payment error:', error)
    showAlert('Payment processing failed. Please try again.')
  } finally {
    paymentLoading.value = null
  }
}

const confirmCancelBooking = async (booking: Booking) => {
  const confirmed = await showConfirm(
    `Are you sure you want to cancel booking #${booking.id}?`,
    'Cancel Booking'
  )
  
  if (confirmed) {
    await cancelBooking(booking)
  }
}

const cancelBooking = async (booking: Booking) => {
  cancelLoading.value = booking.id

  try {
    await cancelBookingAPI(booking.id)
    
    // Update the booking status in our local state
    const bookingIndex = bookings.value.findIndex(b => b.id === booking.id)
    if (bookingIndex !== -1) {
      bookings.value[bookingIndex].status = 'CANCELLED'
      // If payment was made, mark as refunded
      if (bookings.value[bookingIndex].payment_status === 'PAID') {
        bookings.value[bookingIndex].payment_status = 'REFUNDED'
      }
    }

    showAlert('Booking cancelled successfully!')
  } catch (error) {
    console.error('Error cancelling booking:', error)
    showAlert('Failed to cancel booking. Please try again.')
  } finally {
    cancelLoading.value = null
  }
}
</script>

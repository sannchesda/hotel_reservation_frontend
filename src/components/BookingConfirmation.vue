<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '@/services/api'
import { useDialog } from '@/composables/useDialog'
import SimpleDialog from '@/components/SimpleDialog.vue'

interface Room {
  id: number
  name: string
  price: number
}

interface Props {
  bookingId: number
  room: Room
  checkIn: string
  checkOut: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  close: []
}>()

const router = useRouter()

const {
  isVisible: dialogVisible,
  title: dialogTitle,
  message: dialogMessage,
  showCancel: dialogShowCancel,
  confirmText: dialogConfirmText,
  cancelText: dialogCancelText,
  showAlert,
  handleConfirm: handleDialogConfirm,
  handleCancel: handleDialogCancel
} = useDialog()

const loading = ref(false)
const paymentStatus = ref('')

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

const processPayment = async () => {
  loading.value = true

  try {
    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Simulate random payment success/failure (90% success rate)
    const success = Math.random() > 0.1

    const response = await api.post(`/bookings/${props.bookingId}/confirm_payment/`, {
      success,
      provider_ref: `pay_${Date.now()}`
    })

    paymentStatus.value = response.data.payment_status
  } catch (error) {
    console.error('Payment error:', error)
    paymentStatus.value = 'FAILED'
  } finally {
    loading.value = false
  }
}

const viewBooking = async () => {
  // Navigate to my bookings page
  await showAlert(`Booking #${props.bookingId} - Payment completed successfully!`)
  emit('close')
  // Use router to navigate to my-bookings
  router.push('/my-bookings')
}
</script>

<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-xl shadow-2xl max-w-lg w-full mx-4">
      <div class="p-8 text-center">
        <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
          <svg class="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>

        <h3 class="text-lg font-medium text-gray-900 mb-2">Booking Confirmed!</h3>
        <p class="text-gray-600 mb-6">Your reservation has been successfully created.</p>

        <div class="bg-gray-50 rounded-lg p-4 mb-6 text-left">
          <h4 class="font-semibold mb-2">Booking Details</h4>
          <p class="text-sm text-gray-600">Booking ID: #{{ bookingId }}</p>
          <p class="text-sm text-gray-600">Room: {{ room.name }}</p>
          <p class="text-sm text-gray-600">Dates: {{ checkInFormatted }} - {{ checkOutFormatted }}</p>
          <p class="text-sm text-gray-600">Total: ${{ totalAmount }}</p>
        </div>

        <div class="mb-6">
          <h4 class="font-semibold mb-3">Complete Payment</h4>
          <p class="text-sm text-gray-600 mb-4">Click below to simulate payment processing</p>

          <button @click="processPayment" :disabled="loading"
            class="w-full py-3 px-6 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 disabled:opacity-50">
            {{ loading ? 'Processing Payment...' : 'Pay Now (Simulated)' }}
          </button>
        </div>

        <div v-if="paymentStatus" class="mb-4">
          <div v-if="paymentStatus === 'PAID'" class="text-green-600 font-semibold">
            ✅ Payment Successful!
          </div>
          <div v-else-if="paymentStatus === 'FAILED'" class="text-red-600 font-semibold">
            ❌ Payment Failed
          </div>
        </div>

        <div class="flex gap-3">
          <button @click="$emit('close')"
            class="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
            Close
          </button>
          <button v-if="paymentStatus === 'PAID'" @click="viewBooking"
            class="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            View Booking
          </button>
        </div>
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

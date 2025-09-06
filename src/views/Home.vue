<script setup>
import RoomItem from "@/components/RoomItem.vue"
import BookingForm from "@/components/BookingForm.vue"
import BookingConfirmation from "@/components/BookingConfirmation.vue"
import SimpleDialog from "@/components/SimpleDialog.vue"
import { ref, computed, onMounted } from "vue"
import { searchRooms } from "@/services/api"
import { useDialog } from "@/composables/useDialog"

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

const rooms = ref([])
const loading = ref(false)
const error = ref("")

// Date picker variables
const checkInDate = ref("")
const checkOutDate = ref("")

// Set default dates (today and tomorrow)
const today = new Date()
const tomorrow = new Date(today)
tomorrow.setDate(today.getDate() + 1)

checkInDate.value = today.toISOString().split('T')[0]
checkOutDate.value = tomorrow.toISOString().split('T')[0]

// Filters
const search = ref("")
const minPrice = ref(0)
const maxPrice = ref(500)
const capacity = ref(0)

// Load rooms from API
const loadRooms = async () => {
    if (!isValidDateRange.value) return
    
    loading.value = true
    error.value = ""
    
    try {
        const params = {
            check_in: checkInDate.value,
            check_out: checkOutDate.value,
        }
        
        if (maxPrice.value > 0) {
            params.max_price = maxPrice.value * 100 // Convert to cents
        }
        
        const response = await searchRooms(params)
        rooms.value = response.map(room => ({
            id: room.id,
            number: room.number,
            name: `${room.room_type || 'Room'} (${room.number})`,
            price: room.price_dollar,
            capacity: room.capacity,
            available: true,
            description: room.description
        }))
    } catch (err) {
        console.error('Error loading rooms:', err)
        error.value = "Failed to load rooms. Please try again."
    } finally {
        loading.value = false
    }
}

// Load rooms on component mount
onMounted(() => {
    loadRooms()
})

const filteredRooms = computed(() =>
    rooms.value.filter((room) => {
        return (
            room.name.toLowerCase().includes(search.value.toLowerCase()) &&
            room.price >= minPrice.value &&
            room.price <= maxPrice.value &&
            (capacity.value <= 0 || room.capacity >= capacity.value)
        )
    })
)

// Date validation
const isValidDateRange = computed(() => {
    if (!checkInDate.value || !checkOutDate.value) return false
    return new Date(checkOutDate.value) > new Date(checkInDate.value)
})

// Calculate number of nights
const numberOfNights = computed(() => {
    if (!isValidDateRange.value) return 0
    const checkIn = new Date(checkInDate.value)
    const checkOut = new Date(checkOutDate.value)
    const timeDiff = checkOut.getTime() - checkIn.getTime()
    return Math.ceil(timeDiff / (1000 * 3600 * 24))
})

// Handle date changes
function onCheckInDateChange() {
    if (checkInDate.value && checkOutDate.value) {
        const checkIn = new Date(checkInDate.value)
        const checkOut = new Date(checkOutDate.value)

        // If check-out is before or same as check-in, set it to next day
        if (checkOut <= checkIn) {
            const nextDay = new Date(checkIn)
            nextDay.setDate(checkIn.getDate() + 1)
            checkOutDate.value = nextDay.toISOString().split('T')[0]
        }
    }
}

function confirmDates() {
    if (!isValidDateRange.value) {
        showAlert('Please select valid check-in and check-out dates.')
        return
    }

    loadRooms()
}

function bookRoom(room) {
    if (!isValidDateRange.value) {
        showAlert('Please select valid dates before booking.')
        return
    }

    selectedRoom.value = room
    showBookingForm.value = true
}

const selectedRoom = ref(null)
const showBookingForm = ref(false)
const showBookingConfirmation = ref(false)
const currentBookingId = ref(null)

const onBookingCompleted = (bookingId) => {
    showBookingForm.value = false
    currentBookingId.value = bookingId
    showBookingConfirmation.value = true
}

const closeBookingForm = () => {
    showBookingForm.value = false
    selectedRoom.value = null
}

const closeBookingConfirmation = () => {
    showBookingConfirmation.value = false
    selectedRoom.value = null
    currentBookingId.value = null
    // Refresh room availability after booking
    loadRooms()
};

</script>

<template>
    <div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div class="max-w-7xl mx-auto px-6 py-8">
            <!-- Date Selection Card -->
            <div class="mb-8">
                <div class="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
                    <h2 class="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                        <svg class="w-6 h-6 mr-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z">
                            </path>
                        </svg>
                        Select Your Dates
                    </h2>
                    <div class="flex flex-wrap gap-6 items-end">
                        <div class="flex-1 min-w-48">
                            <label class="block mb-2 text-sm font-medium text-gray-700">Check-in Date</label>
                            <input v-model="checkInDate" @change="onCheckInDateChange" type="date"
                                :min="today.toISOString().split('T')[0]"
                                class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" />
                        </div>
                        <div class="flex-1 min-w-48">
                            <label class="block mb-2 text-sm font-medium text-gray-700">Check-out Date</label>
                            <input v-model="checkOutDate" type="date" :min="checkInDate" :class="[
                                'w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors',
                                isValidDateRange ? 'border-gray-300' : 'border-red-300'
                            ]" />
                        </div>
                        <div class="flex flex-col items-center">
                            <div v-if="numberOfNights > 0" class="text-sm text-gray-600 mb-2">
                                {{ numberOfNights }} night{{ numberOfNights !== 1 ? 's' : '' }}
                            </div>
                            <button @click="confirmDates" :disabled="!isValidDateRange" :class="[
                                'px-8 py-3 rounded-lg font-medium shadow-lg transition-all duration-200',
                                isValidDateRange
                                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 hover:shadow-xl cursor-pointer'
                                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            ]">
                                Confirm Dates
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div class="flex flex-col lg:flex-row gap-8">
                <!-- Enhanced Sidebar Filters -->
                <aside class="lg:w-80">
                    <div class="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sticky top-6">
                        <h2 class="text-xl font-bold text-gray-900 mb-6 flex items-center">
                            <svg class="w-5 h-5 mr-3 text-blue-600" fill="none" stroke="currentColor"
                                viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z">
                                </path>
                            </svg>
                            Filters
                        </h2>

                        <!-- Search -->
                        <div class="mb-6">
                            <label class="block mb-2 text-sm font-medium text-gray-700">Search Rooms</label>
                            <div class="relative">
                                <input v-model="search" type="text" placeholder="Search room..."
                                    class="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" />
                                <svg class="absolute left-3 top-3.5 w-4 h-4 text-gray-400" fill="none"
                                    stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                                </svg>
                            </div>
                        </div>

                        <!-- Capacity -->
                        <div class="mb-6">
                            <label class="block mb-2 text-sm font-medium text-gray-700">Guest Capacity</label>
                            <input v-model.number="capacity" type="number" min="1" max="10" placeholder="Number of guests"
                                class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" />
                        </div>

                        <!-- Price Range -->
                        <div class="mb-6">
                            <label class="block mb-2 text-sm font-medium text-gray-700">Price Range</label>
                            <div class="flex gap-3">
                                <div class="flex-1">
                                    <input v-model.number="minPrice" type="number"
                                        class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                        placeholder="Min $" />
                                </div>
                                <div class="flex-1">
                                    <input v-model.number="maxPrice" type="number"
                                        class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                        placeholder="Max $" />
                                </div>
                            </div>
                        </div>

                        <button
                            class="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 text-white py-3 rounded-lg hover:from-indigo-700 hover:to-indigo-800 transition-all duration-200 font-medium shadow-lg hover:shadow-xl">
                            Apply Filters
                        </button>
                    </div>
                </aside>

                <!-- Enhanced Room List -->
                <main class="flex-1">
                    <div class="mb-6">
                        <h2 class="text-2xl font-bold text-gray-900 mb-2">Available Rooms</h2>
                        <p class="text-gray-600">{{ filteredRooms.length }} room{{ filteredRooms.length !== 1 ? 's' : ''
                        }} found</p>
                        
                        <!-- Loading state -->
                        <div v-if="loading" class="text-center py-8">
                            <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            <p class="mt-2 text-gray-600">Loading rooms...</p>
                        </div>
                        
                        <!-- Error state -->
                        <div v-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
                            <p class="text-red-600">{{ error }}</p>
                            <button @click="loadRooms" class="mt-2 text-red-600 hover:text-red-800 underline">
                                Try again
                            </button>
                        </div>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        <div v-for="room in filteredRooms" :key="room.id"
                            class="group bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                            <!-- Room Image Placeholder -->
                            <RoomItem :room="room" @bookRoom="bookRoom" />
                        </div>
                    </div>
                </main>
            </div>
        </div>

        <!-- Booking Form Modal -->
        <BookingForm 
            v-if="showBookingForm && selectedRoom"
            :room="selectedRoom"
            :check-in="checkInDate"
            :check-out="checkOutDate"
            @close="closeBookingForm"
            @booked="onBookingCompleted"
        />
        
        <!-- Booking Confirmation Modal -->
        <BookingConfirmation
            v-if="showBookingConfirmation && selectedRoom && currentBookingId"
            :booking-id="currentBookingId"
            :room="selectedRoom"
            :check-in="checkInDate"
            :check-out="checkOutDate"
            @close="closeBookingConfirmation"
        />

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

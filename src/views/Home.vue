<script setup>
import RoomItem from "@/components/RoomItem.vue"
import { ref, computed } from "vue"

const rooms = ref([
    { id: 1, name: "Deluxe Room", price: 60, capacity: 2, available: true },
    { id: 2, name: "Family Suite", price: 120, capacity: 4, available: false },
    { id: 3, name: "Standard Room", price: 40, capacity: 2, available: true },
    { id: 4, name: "Presidential Suite", price: 200, capacity: 6, available: true },
])

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
const maxPrice = ref(200)
const capacity = ref("")

const filteredRooms = computed(() =>
    rooms.value.filter((room) => {
        return (
            room.name.toLowerCase().includes(search.value.toLowerCase()) &&
            room.price >= minPrice.value &&
            room.price <= maxPrice.value &&
            (capacity.value ? room.capacity == capacity.value : true)
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
        alert('Please select valid check-in and check-out dates.')
        return
    }

    const checkIn = new Date(checkInDate.value).toLocaleDateString()
    const checkOut = new Date(checkOutDate.value).toLocaleDateString()

    alert(`Dates confirmed!\nCheck-in: ${checkIn}\nCheck-out: ${checkOut}\nNights: ${numberOfNights.value}`)
}

function bookRoom(room) {
    if (!isValidDateRange.value) {
        alert('Please select valid dates before booking.')
        return
    }

    const checkIn = new Date(checkInDate.value).toLocaleDateString()
    const checkOut = new Date(checkOutDate.value).toLocaleDateString()

    alert(`Booking ${room.name}\nDates: ${checkIn} to ${checkOut}\nNights: ${numberOfNights.value}\nTotal: $${room.price * numberOfNights.value}`)
}
</script>

<template>
    <div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <!-- Header Section -->
        <div class="bg-white shadow-sm border-b">
            <div class="max-w-7xl mx-auto px-6 py-8">
                <h1 class="text-4xl font-bold text-gray-900 mb-2">Find Your Perfect Stay</h1>
                <p class="text-gray-600 text-lg">Discover comfortable rooms tailored to your needs</p>
            </div>
        </div>

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
                            <select v-model="capacity"
                                class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors appearance-none bg-white">
                                <option value="">Any capacity</option>
                                <option value="2">2 guests</option>
                                <option value="4">4 guests</option>
                                <option value="6">6 guests</option>
                            </select>
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
    </div>
</template>

<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-7xl mx-auto px-6 py-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Staff Dashboard</h1>
        <p class="text-gray-600">Manage rooms and bookings</p>
      </div>

      <!-- Navigation Tabs -->
      <div class="mb-8">
        <nav class="flex space-x-8">
          <button @click="activeTab = 'bookings'" :class="[
            'py-2 px-1 border-b-2 font-medium text-sm',
            activeTab === 'bookings'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          ]">
            Bookings
          </button>
          <button @click="activeTab = 'rooms'" :class="[
            'py-2 px-1 border-b-2 font-medium text-sm',
            activeTab === 'rooms'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          ]">
            Rooms
          </button>
        </nav>
      </div>

      <!-- Bookings Tab -->
      <div v-if="activeTab === 'bookings'">
        <div class="bg-white shadow rounded-lg">
          <div class="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 class="text-lg font-medium text-gray-900">All Bookings</h2>
            <button @click="showCreateBookingModal = true"
              class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
              + Create Booking
            </button>
          </div>

          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Booking ID
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Guest
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Room
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Check In - Check Out
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created At
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="booking in bookings" :key="booking.id">
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    #{{ booking.id }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">{{ booking.guest.full_name }}</div>
                    <div class="text-sm text-gray-500">{{ booking.guest.email }}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ booking.room.room_type || 'Room' }} ({{ booking.room.number }})
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ formatDate(booking.check_in) }} - {{ formatDate(booking.check_out) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ formatDate(booking.created_at ?? "") }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${{ booking.total_dollar }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span :class="getStatusColor(booking.status)"
                      class="inline-flex px-2 py-1 text-xs font-semibold rounded-full">
                      {{ booking.status }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div class="flex space-x-2">
                      <button @click="editBooking(booking)" class="text-blue-600 hover:text-blue-900">
                        Edit
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div v-if="loading" class="text-center py-8">
            <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>

          <div v-if="bookings.length === 0 && !loading" class="text-center py-8 text-gray-500">
            No bookings found
          </div>
        </div>
      </div>

      <!-- Rooms Tab -->
      <div v-if="activeTab === 'rooms'">
        <div class="bg-white shadow rounded-lg">
          <div class="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 class="text-lg font-medium text-gray-900">All Rooms</h2>
            <button @click="showCreateRoomModal = true"
              class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
              + Create Room
            </button>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            <div v-for="room in rooms" :key="room.id"
              class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <h3 class="font-semibold text-lg mb-2">{{ room.room_type || 'Room' }}</h3>
              <p class="text-gray-600 mb-2">Room {{ room.number }}</p>
              <p class="text-gray-600 mb-2">Capacity: {{ room.capacity }} guests</p>
              <p class="text-green-600 font-semibold mb-3">${{ room.price_dollar }}/night</p>

              <div v-if="room.amenities && room.amenities.length > 0" class="mb-4">
                <p class="text-sm text-gray-500 mb-1">Amenities:</p>
                <div class="flex flex-wrap gap-1">
                  <span v-for="amenity in room.amenities" :key="amenity.id"
                    class="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                    {{ amenity.name }}
                  </span>
                </div>
              </div>

              <div class="flex space-x-2 mt-4">
                <button @click="editRoom(room)"
                  class="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm font-medium transition-colors">
                  Edit
                </button>
                <button @click="confirmDeleteRoom(room)"
                  class="flex-1 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded text-sm font-medium transition-colors">
                  Delete
                </button>
              </div>
            </div>
          </div>

          <div v-if="rooms.length === 0 && !loading" class="text-center py-8 text-gray-500">
            No rooms found
          </div>
        </div>
      </div>
    </div>

    <!-- Create Room Modal -->
    <div v-if="showCreateRoomModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <RoomForm @close="showCreateRoomModal = false" @success="handleRoomCreated" />
    </div>

    <!-- Edit Room Modal -->
    <div v-if="showEditRoomModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <RoomForm :room="selectedRoom || undefined" @close="showEditRoomModal = false" @success="handleRoomUpdated" />
    </div>

    <!-- Create Booking Modal -->
    <div v-if="showCreateBookingModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <StaffBookingForm @close="showCreateBookingModal = false" @success="handleBookingCreated" />
    </div>

    <!-- Edit Booking Modal -->
    <div v-if="showEditBookingModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <StaffBookingForm :booking="selectedBooking || undefined" @close="showEditBookingModal = false"
        @success="handleBookingUpdated" />
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Confirm Delete</h3>
        <p class="text-gray-600 mb-6">{{ deleteConfirmMessage }}</p>
        <div class="flex justify-end space-x-3">
          <button @click="showDeleteModal = false"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200">
            Cancel
          </button>
          <button @click="handleDelete"
            class="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700">
            Delete
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { api, deleteRoom, deleteBooking } from '@/services/api'
import RoomForm from '@/components/RoomForm.vue'
import StaffBookingForm from '@/components/StaffBookingForm.vue'
import type { Amenity, Room, Booking } from '@/types'

const activeTab = ref('bookings')
const bookings = ref<Booking[]>([])
const rooms = ref<Room[]>([])
const loading = ref(false)

// Room-related state
const showCreateRoomModal = ref(false)
const showEditRoomModal = ref(false)
const selectedRoom = ref<Room | null>(null)

// Booking-related state
const showCreateBookingModal = ref(false)
const showEditBookingModal = ref(false)
const selectedBooking = ref<Booking | null>(null)

// Delete confirmation state
const showDeleteModal = ref(false)
const deleteConfirmMessage = ref('')
const deleteTarget = ref<{ type: 'room' | 'booking', item: Room | Booking } | null>(null)

const loadBookings = async () => {
  loading.value = true
  try {
    const response = await api.get('/bookings/')
    bookings.value = response.data
  } catch (error) {
    console.error('Error loading bookings:', error)
  } finally {
    loading.value = false
  }
}

const loadRooms = async () => {
  loading.value = true
  try {
    const response = await api.get('/rooms/')
    rooms.value = response.data
  } catch (error) {
    console.error('Error loading rooms:', error)
  } finally {
    loading.value = false
  }
}

const handleRoomCreated = (newRoom: Room) => {
  rooms.value.push(newRoom)
  showCreateRoomModal.value = false
}

const handleRoomUpdated = (updatedRoom: Room) => {
  const index = rooms.value.findIndex(room => room.id === updatedRoom.id)
  if (index !== -1) {
    rooms.value[index] = updatedRoom
  }
  showEditRoomModal.value = false
  selectedRoom.value = null
}

const handleBookingCreated = (newBooking: Booking) => {
  bookings.value.push(newBooking)
  showCreateBookingModal.value = false
}

const handleBookingUpdated = (updatedBooking: Booking) => {
  const index = bookings.value.findIndex(booking => booking.id === updatedBooking.id)
  if (index !== -1) {
    bookings.value[index] = updatedBooking
  }
  showEditBookingModal.value = false
  selectedBooking.value = null
}

// Room CRUD operations
const editRoom = (room: Room) => {
  selectedRoom.value = room
  showEditRoomModal.value = true
}

const confirmDeleteRoom = (room: Room) => {
  deleteTarget.value = { type: 'room', item: room }
  deleteConfirmMessage.value = `Are you sure you want to delete room ${room.room_type || 'Room'} (${room.number})? This action cannot be undone.`
  showDeleteModal.value = true
}

// Booking CRUD operations
const editBooking = (booking: Booking) => {
  selectedBooking.value = booking
  showEditBookingModal.value = true
}

const confirmDeleteBooking = (booking: Booking) => {
  deleteTarget.value = { type: 'booking', item: booking }
  deleteConfirmMessage.value = `Are you sure you want to delete booking #${booking.id} for ${booking.guest.full_name}? This action cannot be undone.`
  showDeleteModal.value = true
}

// Handle actual deletion
const handleDelete = async () => {
  if (!deleteTarget.value) return

  try {
    if (deleteTarget.value.type === 'room') {
      const room = deleteTarget.value.item as Room
      await deleteRoom(room.id)
      rooms.value = rooms.value.filter(r => r.id !== room.id)
    } else if (deleteTarget.value.type === 'booking') {
      const booking = deleteTarget.value.item as Booking
      await deleteBooking(booking.id)
      bookings.value = bookings.value.filter(b => b.id !== booking.id)
    }
  } catch (error) {
    console.error('Error deleting item:', error)
    // Here you could show an error notification
  } finally {
    showDeleteModal.value = false
    deleteTarget.value = null
    deleteConfirmMessage.value = ''
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'CONFIRMED':
      return 'bg-green-100 text-green-800'
    case 'CANCELLED':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

onMounted(() => {
  loadBookings()
  loadRooms()
})
</script>

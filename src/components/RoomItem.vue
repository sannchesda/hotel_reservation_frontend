<script setup lang="ts">
interface Room {
    id: number | string;
    name: string;
    capacity: number;
    price: number;
    available: boolean;
    description?: string;
}

interface Props {
    room: Room;
}

const props = defineProps<Props>();

const emit = defineEmits<{
    bookRoom: [room: Room];
}>();

const bookRoom = (room: Room) => {
    emit('bookRoom', room);
};
</script>

<template>
    <div class="bg-white rounded-xl shadow-lg overflow-hidden group hover:shadow-xl transition-all duration-300 h-full flex flex-col">
        <div class="h-48 bg-gradient-to-r from-blue-400 to-indigo-500 relative overflow-hidden flex-shrink-0">
            <div class="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-10 transition-all duration-300">
            </div>
            <div class="absolute top-4 right-4">
                <span :class="props.room.available ? 'bg-green-500' : 'bg-red-500'"
                    class="px-3 py-1 rounded-full text-white text-xs font-medium">
                    {{ props.room.available ? "Available" : "Booked" }}
                </span>
            </div>
        </div>

        <div class="p-6 flex flex-col flex-grow">
            <h3 class="text-xl font-bold text-gray-900 mb-2">{{ props.room.name }}</h3>

            <p v-if="props.room.description" class="text-gray-600 text-sm mb-3 flex-grow">{{ props.room.description }}</p>

            <div class="flex items-center text-gray-600 mb-2">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z">
                    </path>
                </svg>
                Up to {{ props.room.capacity }} guests
            </div>

            <div class="mt-auto">
                <div class="flex items-center justify-between mb-4">
                    <div class="flex items-baseline">
                        <span class="text-2xl font-bold text-gray-900">${{ props.room.price }}</span>
                        <span class="text-gray-600 ml-1">/night</span>
                    </div>
                </div>

                <button :disabled="!props.room.available" @click="bookRoom(props.room)"
                    class="w-full py-3 rounded-lg font-medium transition-all duration-200 transform" :class="props.room.available
                        ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 hover:scale-105 shadow-lg hover:shadow-xl'
                        : 'bg-gray-200 text-gray-500 cursor-not-allowed'">
                    {{ props.room.available ? 'Book Now' : 'Not Available' }}
                </button>
            </div>
        </div>
    </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import { searchRooms } from '@/services/api'
const checkIn = ref(''); const checkOut = ref(''); const maxPrice = ref<number | undefined>()
const amenities = ref<string[]>([])
const rooms = ref<any[]>([]); const loading = ref(false); const error = ref<string | undefined>()

async function onSearch() {
    try {
        loading.value = true; error.value = undefined
        rooms.value = await searchRooms({ check_in: checkIn.value, check_out: checkOut.value, max_price: maxPrice.value, amenities: amenities.value })
    } catch (e: any) { error.value = e.message } finally { loading.value = false }
}
</script>

<template>
    <div class="max-w-5xl mx-auto p-4">
        <h1 class="text-2xl font-semibold mb-4">Find a room</h1>
        <div class="grid gap-3 md:grid-cols-4">
            <input type="date" v-model="checkIn" class="input" />
            <input type="date" v-model="checkOut" class="input" />
            <input type="number" min="0" placeholder="Max price" v-model.number="maxPrice" class="input" />
            <button @click="onSearch" class="btn">Search</button>
        </div>
        <p v-if="error" class="text-red-600 mt-3">{{ error }}</p>
        <div class="grid md:grid-cols-3 gap-4 mt-6">
            <div v-for="r in rooms" :key="r.id" class="border rounded-xl p-4">
                <h3 class="text-lg font-medium">Room {{ r.number }} ({{ r.room_type }})</h3>
                <p class="text-sm">Capacity: {{ r.capacity }}</p>
                <p class="text-sm">Price: ${{ (r.price_cents / 100).toFixed(2) }}/night</p>
                <router-link :to="`/book/${r.id}`" class="btn mt-3 inline-block">Book</router-link>
            </div>
        </div>
    </div>
</template>

<style scoped>
.input {
    @apply border rounded-lg px-3 py-2 w-full;
}

.btn {
    @apply bg-black text-white rounded-lg px-4 py-2;
}
</style>

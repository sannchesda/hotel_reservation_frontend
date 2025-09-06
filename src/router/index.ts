import HomeView from "@/views/Home.vue";
import StaffView from "@/views/Staff.vue";
import GuestBookingsView from "@/views/GuestBookings.vue";
import LoginView from "@/views/Login.vue";
import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@/stores/auth";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/login",
      name: "login",
      component: LoginView,
    },
    {
      path: "/",
      name: "home",
      component: HomeView,
    },
    {
      path: "/my-bookings",
      name: "guest-bookings",
      component: GuestBookingsView,
      meta: { requiresAuth: true, userType: 'guest' }
    },
    {
      path: "/staff",
      name: "staff",
      component: StaffView,
      meta: { requiresAuth: true, userType: 'staff' }
    },
  ],
});

// Navigation guard for authentication
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  
  // Initialize auth on first load
  if (!authStore.isLoggedIn) {
    authStore.initAuth();
  }

  // Check if route requires authentication
  if (to.meta.requiresAuth) {
    if (!authStore.isLoggedIn) {
      next('/login');
      return;
    }

    // Check user type authorization
    if (to.meta.userType && authStore.user?.type !== to.meta.userType) {
      // Redirect to appropriate page based on user type
      if (authStore.user?.type === 'staff') {
        next('/staff');
      } else {
        next('/my-bookings');
      }
      return;
    }
  }

  // Redirect logged-in users away from login page
  if (to.name === 'login' && authStore.isLoggedIn) {
    if (authStore.user?.type === 'staff') {
      next('/staff');
    } else {
      next('/my-bookings');
    }
    return;
  }

  next();
});

export default router;

import HomeView from "@/views/Home.vue";
import StaffView from "@/views/Staff.vue";
import { createRouter, createWebHistory } from "vue-router";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: HomeView,
    },
    {
      path: "/staff",
      name: "staff",
      component: StaffView,
    },
  ],
});

export default router;

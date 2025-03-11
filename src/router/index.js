import { createRouter, createWebHistory } from "vue-router";
import HomePage from "../components/HomePage.vue";
import ContactManagement from "../components/ContactManagement.vue";
import ContactDetail from "../components/ContactDetail.vue";
import EventManagement from "../components/EventManagement.vue";
import LoginPage from "../components/LoginPage.vue";
import ForgotPassword from "../components/ForgotPassword.vue";
import ResetPassword from "../components/ResetPassword.vue";

const routes = [
  { path: "/", name: "Login", component: LoginPage },
  { path: "/home", name: "Home", component: HomePage },
  { path: "/contacts", name: "Contacts", component: ContactManagement },
  { path: "/contacts/:id", name: "ContactDetail", component: ContactDetail, props: true },
  { path: "/events", name: "Events", component: EventManagement },
  { path: "/forgot-password", name: "ForgotPassword", component: ForgotPassword },
  { path: "/reset-password", name: "ResetPassword", component: ResetPassword },
  { path: "/:pathMatch(.*)*", redirect: "/" }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
import { createRouter, createWebHistory } from "vue-router";
import HomePage from "../components/HomePage.vue";
import ContactManagement from "../components/ContactManagement.vue";
import ContactDetail from "../components/ContactDetail.vue";
import EventManagement from "../components/EventManagement.vue";
import LoginPage from "../components/LoginPage.vue";

const routes = [
  { path: "/", name: "Login", component: LoginPage },
  { path: "/home", name: "Home", component: HomePage },
  { path: "/contacts", name: "Contacts", component: ContactManagement },
  { path: "/contacts/:id", name: "ContactDetail", component: ContactDetail, props: true },
  { path: "/events", name: "Events", component: EventManagement },
  { path: "/:pathMatch(.*)*", redirect: "/" }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach((to, from, next) => {
  const publicPages = ["/"];
  const authRequired = !publicPages.includes(to.path);
  const loggedIn = localStorage.getItem("user");

  if (authRequired && !loggedIn) {
    return next("/");
  }

  next();
});

export default router;
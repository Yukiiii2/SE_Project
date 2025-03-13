import { createRouter, createWebHistory } from "vue-router";
import HomePage from "../components/HomePage.vue";
import CollegeHeadHomePage from "../components/CollegeHeadHomePage.vue";
import ContactManagement from "../components/ContactManagement.vue";
import ContactDetail from "../components/ContactDetail.vue";
import EventManagement from "../components/EventManagement.vue";
import LoginPage from "../components/LoginPage.vue";
import ForgotPassword from "../components/ForgotPassword.vue";
import ResetPassword from "../components/ResetPassword.vue";
import ArchiveManagement from "../components/ArchiveManagement.vue";
import RequestPage from "../components/RequestPage.vue";
import AlumniRequestApprovalPage from "../components/AlumniRequestApprovalPage.vue";

const routes = [
  { path: "/", name: "Login", component: LoginPage },
  { path: "/home", name: "Home", component: HomePage },
  { path: "/college-home", name: "CollegeHeadHome", component: CollegeHeadHomePage },
  { path: "/contacts", name: "Contacts", component: ContactManagement },
  { path: "/contacts/:id", name: "ContactDetail", component: ContactDetail, props: true },
  { path: "/events", name: "Events", component: EventManagement },
  { path: "/forgot-password", name: "ForgotPassword", component: ForgotPassword },
  { path: "/reset-password", name: "ResetPassword", component: ResetPassword },
  { path: "/archive", name: "ArchiveManagement", component: ArchiveManagement },
  { path: "/requests", name: "Requests", component: RequestPage },
  { path: "/approve-requests", name: "ApproveRequests", component: AlumniRequestApprovalPage },
  { path: "/:pathMatch(.*)*", redirect: "/" }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});


router.beforeEach((to, from, next) => {
  const publicPages = ["/"];
  const authRequired = !publicPages.includes(to.path);
  const loggedIn = JSON.parse(localStorage.getItem("user"));

  if (authRequired && !loggedIn) {
    return next("/");
  }

  // Ensure only Alumni Coordinators go to /home
  if (to.path === "/home" && loggedIn.role !== "alumniCoordinator") {
    return next("/college-home");
  }

  // Ensure only College Heads go to /college-home
  if (to.path === "/college-home" && loggedIn.role !== "collegeHead") {
    return next("/home");
  }

  next();
});

export default router;
import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { library } from "@fortawesome/fontawesome-svg-core";
import {
  faHome,
  faCalendar,
  faEnvelope,
  faCog,
  faSignOutAlt,
  faGraduationCap,
  faDatabase,
  faComments,
  faUserTimes,
} from "@fortawesome/free-solid-svg-icons";

library.add(
  faHome,
  faCalendar,
  faEnvelope,
  faCog,
  faSignOutAlt,
  faGraduationCap,
  faDatabase,
  faComments,
  faUserTimes
);

const app = createApp(App);

app.component("font-awesome-icon", FontAwesomeIcon);

app.use(router);

app.mount("#app");

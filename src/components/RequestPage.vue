<template>
  <div class="request-page">
    <!-- Sidebar Toggle Button -->
    <button class="menu-btn" @click="toggleSidebar">
      {{ isSidebarOpen ? "✕" : "☰" }}
    </button>

    <!-- Sidebar -->
    <aside :class="{ open: isSidebarOpen }" class="sidebar">
      <div class="logo">
        <img src="../assets/logo.png" alt="Logo" />
        <h2>Alumni Connect</h2>
      </div>
      <nav class="nav-links">
        <router-link to="/home" class="nav-item">
          <i class="fas fa-home"></i>
          <span>Home</span>
        </router-link>
        <router-link to="/contacts" class="nav-item">
          <i class="fas fa-cog"></i>
          <span>Contacts</span>
        </router-link>
        <router-link to="/events" class="nav-item">
          <i class="fas fa-calendar"></i>
          <span>Events</span>
        </router-link>
        <router-link to="/archive" class="nav-item">
          <i class="fas fa-archive"></i>
          <span>Archive</span>
        </router-link>
        <router-link to="/approve-requests" class="nav-item">
          <i class="fas fa-envelope"></i>
          <span>Requests</span>
        </router-link>
      </nav>
      <a href="#" class="logout" @click.prevent="handleLogout">
        <i class="fas fa-sign-out-alt"></i>
        <span>Logout</span>
      </a>
    </aside>

    <!-- Main Content -->
    <main class="main-content">
      <!-- Add Request Form -->
      <section class="add-request">
        <h2>Add Request</h2>
        <form @submit.prevent="submitRequest">
          <div class="form-group">
            <label for="title">Request Title</label>
            <input type="text" id="title" v-model="newRequest.title" required />
          </div>
          <div class="form-group">
            <label for="comments">Comments/Specific Request</label>
            <textarea id="comments" v-model="newRequest.comments" required></textarea>
          </div>
          <div class="form-group">
            <label for="dateRange">Date Range</label>
            <input type="date" id="startDate" v-model="newRequest.startDate" required />
            <input type="date" id="endDate" v-model="newRequest.endDate" required />
          </div>
          <div class="form-group">
            <label for="college">College</label>
            <select id="college" v-model="newRequest.college" required>
              <option value="" disabled>Select College</option>
              <option value="College of Engineering">College of Engineering</option>
              <option value="College of Arts and Sciences">College of Arts and Sciences</option>
              <option value="College of Business">College of Business</option>
              <option value="Others">Others</option>
            </select>
          </div>
          <button type="submit">Submit Request</button>
        </form>
      </section>

      <!-- Pending Requests Dashboard -->
      <section class="pending-requests">
        <h2>Pending Requests</h2>
        <table>
          <thead>
            <tr>
              <th>Request Title</th>
              <th>Date Requested</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="request in pendingRequests" :key="request.id">
              <td>{{ request.title }}</td>
              <td>{{ request.dateRequested }}</td>
              <td>{{ request.status }}</td>
            </tr>
          </tbody>
        </table>
      </section>
    </main>
  </div>
</template>

<script>
export default {
  data() {
    return {
      isSidebarOpen: false,
      newRequest: {
        title: '',
        comments: '',
        startDate: '',
        endDate: '',
        college: '',
        requester: 'John Doe' // This should be dynamically set based on the logged-in user
      },
      pendingRequests: [
        // Sample data, this should be fetched from an API or database
        { id: 1, title: 'Request 1', dateRequested: '2025-03-01', status: 'Pending' },
        { id: 2, title: 'Request 2', dateRequested: '2025-03-02', status: 'Pending' }
      ]
    };
  },
  methods: {
    toggleSidebar() {
      this.isSidebarOpen = !this.isSidebarOpen;
    },
    handleLogout() {
      localStorage.removeItem('user');
      this.$router.push('/');
    },
    submitRequest() {
      const newRequest = {
        ...this.newRequest,
        id: Date.now(),
        dateRequested: new Date().toISOString().split('T')[0],
        status: 'Pending'
      };
      this.pendingRequests.push(newRequest);
      this.resetForm();
    },
    resetForm() {
      this.newRequest = {
        title: '',
        comments: '',
        startDate: '',
        endDate: '',
        college: '',
        requester: 'John Doe' // Reset requester as well
      };
    }
  }
};
</script>

<style scoped>
.contact-management {
  display: flex;
  min-height: 100vh;
  background-color: #FFF5F7;
  font-family: 'Inter', sans-serif;
}

/* Sidebar Styles */
.sidebar {
  width: 180px;
  height: 100vh;
  background: linear-gradient(180deg, #FF4B6E 0%, #E63456 100%);
  color: white;
  position: fixed;
  top: 0;
  left: -250px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 0 30px rgba(255, 75, 110, 0.15);
  z-index: 1000;
  padding: 30px;
  display: flex;
  flex-direction: column;
}

.sidebar.open {
  left: 0;
}

/* Sidebar Header */
.sidebar-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 40px;
}

/* Move "Alumni Connect" lower to avoid overlap with the button */
.logo {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 80px; /* Adjusted to move below the toggle button */
}

.logo img {
  width: 45px;
  height: auto;
  filter: brightness(0) invert(1);
}

.logo h2 {
  font-size: 20px;
  font-weight: 600;
  margin: 0;
  color: white;
}

/* Sidebar Navigation */
.nav-links {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin: 20px 0;
}

.nav-item {
  display: flex;
  align-items: center;
  padding: 14px;
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  border-radius: 16px;
  transition: all 0.3s ease;
  font-weight: 500;
}

.nav-item.active, .nav-item:hover {
  background: rgba(255, 255, 255, 0.15);
  color: white;
  transform: translateX(5px);
}

/* Logout Button */
.logout-btn {
  margin-top: auto;
  padding: 14px;
  background-color: rgba(255, 255, 255, 0.1);
  color: white;
  border: none;
  border-radius: 16px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
}

.logout-btn:hover {
  background-color: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

/* Sidebar Toggle Button */
.menu-btn {
  position: fixed;
  top: 20px;
  left: 20px;
  z-index: 1001;
  background: #FF4B6E;
  color: white;
  border: none;
  padding: 12px;
  border-radius: 16px;
  cursor: pointer;
  width: 48px;
  height: 48px;
  font-size: 20px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(255, 75, 110, 0.2);
}

.menu-btn:hover {
  background: #E63456;
  transform: translateY(-2px);
}

/* Main Content */
.main-content {
  flex: 1;
  padding: 40px;
  transition: all 0.3s ease;
  margin-left: 0;
}

.sidebar.open + .main-content {
  margin-left: 250px;
}

/* Add Request Form */
.add-request {
  background: white;
  padding: 20px;
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(255, 75, 124, 0.1);
  margin-bottom: 24px;
}

.add-request h2 {
  color: #ff1c55;
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 16px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  color: #ff1c55;
  font-size: 14px;
  margin-bottom: 8px;
}

.form-group select,
.form-group input,
.form-group textarea {
  width: 100%;
  padding: 8px;
  border: 1px solid #ffb3c7;
  border-radius: 8px;
  font-size: 14px;
  color: #ff1c55;
}

button {
  background: #ff4b7c;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

button:hover {
  background: #ff1c55;
}

/* Pending Requests Dashboard */
.pending-requests {
  background: white;
  padding: 20px;
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(255, 75, 124, 0.1);
}

.pending-requests h2 {
  color: #ff1c55;
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 16px;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #ffb3c7;
}

th {
  background-color: #fff5f7;
  color: #ff1c55;
  font-weight: 600;
}

td {
  color: #6b4e5b;
}

tr:hover {
  background-color: #fff5f7;
  cursor: pointer;
}
</style>
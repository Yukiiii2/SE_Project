<template>
  <div class="approval-page">
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
        <router-link to="/approve-requests" class="nav-item active">
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
      <!-- Filter Section -->
      <section class="filters">
        <h2>Filter Requests</h2>
        <div class="form-group">
          <label for="status">Status</label>
          <select id="status" v-model="filters.status">
            <option value="">All</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
        <div class="form-group">
          <label for="dateRequested">Date Requested</label>
          <input type="date" id="dateRequested" v-model="filters.dateRequested" />
        </div>
        <button @click="applyFilters">Apply Filters</button>
      </section>

      <!-- Requests Dashboard -->
      <section class="requests-dashboard">
        <h2>All Requests</h2>
        <table>
          <thead>
            <tr>
              <th>Request Title</th>
              <th>Date Requested</th>
              <th>Status</th>
              <th>Requester</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="request in filteredRequests" :key="request.id" @click="viewRequest(request)">
              <td>{{ request.title }}</td>
              <td>{{ request.dateRequested }}</td>
              <td>{{ request.status }}</td>
              <td>{{ request.requester }}</td>
            </tr>
          </tbody>
        </table>
      </section>

      <!-- Individual Request Modal -->
      <div v-if="selectedRequest" class="modal">
        <div class="modal-content">
          <h2>Request Details</h2>
          <p><strong>Title:</strong> {{ selectedRequest.title }}</p>
          <p><strong>Comments:</strong> {{ selectedRequest.comments }}</p>
          <p><strong>Date Range:</strong> {{ selectedRequest.startDate }} to {{ selectedRequest.endDate }}</p>
          <p><strong>College:</strong> {{ selectedRequest.college }}</p>
          <p><strong>Requester:</strong> {{ selectedRequest.requester }}</p>
          <p><strong>Status:</strong> {{ selectedRequest.status }}</p>
          <button @click="closeModal">Close</button>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
export default {
  data() {
    return {
      isSidebarOpen: false,
      filters: {
        status: '',
        dateRequested: ''
      },
      requests: [
        // Sample data, this should be fetched from an API or database
        { id: 1, title: 'Request 1', dateRequested: '2025-03-01', status: 'Pending', requester: 'John Doe', comments: 'Need this ASAP', startDate: '2025-03-05', endDate: '2025-03-10', college: 'College of Engineering' },
        { id: 2, title: 'Request 2', dateRequested: '2025-03-02', status: 'Approved', requester: 'Jane Smith', comments: 'For research purposes', startDate: '2025-03-15', endDate: '2025-03-20', college: 'College of Arts and Sciences' }
      ],
      filteredRequests: [],
      selectedRequest: null
    };
  },
  created() {
    this.filteredRequests = this.requests;
  },
  methods: {
    toggleSidebar() {
      this.isSidebarOpen = !this.isSidebarOpen;
    },
    handleLogout() {
      localStorage.removeItem('user');
      this.$router.push('/');
    },
    applyFilters() {
      this.filteredRequests = this.requests.filter(request => {
        const matchesStatus = this.filters.status ? request.status === this.filters.status : true;
        const matchesDate = this.filters.dateRequested ? request.dateRequested === this.filters.dateRequested : true;
        return matchesStatus && matchesDate;
      });
    },
    viewRequest(request) {
      this.selectedRequest = request;
    },
    closeModal() {
      this.selectedRequest = null;
    }
  }
};
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body, html {
  margin: 0;
  padding: 0;
  overflow-x: hidden;
  width: 100%;
}

.approval-page {
  display: flex;
  min-height: 100vh;
  background-color: #fff5f7;
  font-family: 'Inter', sans-serif;
}

/* Sidebar Styles */
.sidebar {
  width: 250px;
  height: 100vh;
  background: linear-gradient(180deg, #ff4b7c 0%, #ff1c55 100%);
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
.logo {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 40px;
}

.logo img {
  width: 45px;
  height: auto;
  filter: brightness(0) invert(1);
}

.logo h2 {
  font-size: 20px;
  font-weight: 600;
  color: white;
}

/* Sidebar Navigation */
.nav-links {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #ffb3c7;
  padding: 12px;
  border-radius: 14px;
  text-decoration: none;
  transition: all 0.3s ease;
}

.nav-item:hover, .nav-item.active {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

/* Logout Button */
.logout {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #ffffff;
  background-color: rgba(255, 255, 255, 0.1);
  text-decoration: none;
  padding: 14px;
  border-radius: 16px;
  margin-top: auto;
  transition: all 0.3s ease;
  font-weight: 500;
}

.logout:hover {
  background-color: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

/* Sidebar Toggle Button */
.menu-btn {
  position: fixed;
  top: 20px;
  left: 20px;
  z-index: 1001;
  background: #ff4b7c;
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
  background: #ff1c55;
  transform: translateY(-2px);
}

/* Main Content Styles */
.main-content {
  flex: 1;
  margin-left: 250px;
  padding: 40px;
  transition: all 0.3s ease;
  overflow-y: auto;
  min-width: 0;
  width: calc(100% - 250px);
}

/* Filter Section */
.filters {
  background: white;
  padding: 20px;
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(255, 75, 124, 0.1);
  margin-bottom: 24px;
}

.filters h2 {
  color: #ff1c55;
  font-size: 24px;
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
.form-group input {
  width: 100%;
  padding: 12px;
  border: 1px solid #ffb3c7;
  border-radius: 8px;
  font-size: 14px;
  color: #ff1c55;
}

button {
  background: #ff4b7c;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

button:hover {
  background: #ff1c55;
}

/* Requests Dashboard */
.requests-dashboard {
  background: white;
  padding: 20px;
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(255, 75, 124, 0.1);
}

.requests-dashboard h2 {
  color: #ff1c55;
  font-size: 24px;
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

/* Modal Styles */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-content {
  background: white;
  padding: 20px;
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  width: 90%;
  max-width: 500px;
}

.modal-content h2 {
  color: #ff1c55;
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 16px;
}

.modal-content p {
  color: #6b4e5b;
  margin-bottom: 8px;
}

.modal-content button {
  margin-top: 16px;
}

/* Responsive Styles */
@media (max-width: 768px) {
  .main-content {
    margin-left: 0;
    width: 100%;
    padding: 20px;
  }
}
</style>
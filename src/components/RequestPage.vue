<template>
  <div class="request-page">
    <!-- Sidebar Toggle Button -->
    <button class="menu-btn" @click="toggleSidebar">
      <i :class="['fas', isSidebarOpen ? 'fa-times' : 'fa-bars']"></i>
    </button>

    <!-- Sidebar -->
    <aside :class="{ open: isSidebarOpen }" class="sidebar">
      <div class="sidebar-content">
        <div class="logo">
          <img src="../assets/logo.png" alt="Logo" />
          <h2>Alumni Connect</h2>
        </div>
        
        <nav class="nav-links">
          <router-link to="/home" class="nav-item" active-class="active">
            <i class="fas fa-home"></i>
            <span>Home</span>
          </router-link>
          <router-link to="/contacts" class="nav-item" active-class="active">
            <i class="fas fa-address-book"></i>
            <span>Contacts</span>
          </router-link>
          <router-link to="/approve-requests" class="nav-item" active-class="active">
            <i class="fas fa-clipboard-check"></i>
            <span>Requests</span>
          </router-link>
        </nav>

        <button class="logout-btn" @click="handleLogout">
          <i class="fas fa-sign-out-alt"></i>
          <span>Logout</span>
        </button>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="main-content">
      <!-- Add Request Form -->
      <section class="add-request card">
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
          <button type="submit" class="submit-btn">Submit Request</button>
        </form>
      </section>

      <!-- Pending Requests Dashboard -->
      <section class="pending-requests card">
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
.request-page {
  display: flex;
  min-height: 100vh;
  background-color: #f8f9fa;
  font-family: 'Inter', sans-serif;
}

.menu-btn {
  position: fixed;
  top: 1.5rem;
  left: 1.5rem;
  z-index: 100;
  background: #FF4B6E;
  color: white;
  border: none;
  width: 3rem;
  height: 3rem;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px -1px rgba(255, 75, 110, 0.2);
}

.menu-btn:hover {
  background: #E63456;
  transform: translateY(-2px);
}

.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  width: 260px;
  background: linear-gradient(to bottom, #FF4B6E, #E63456);
  transform: translateX(-100%);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 50;
  box-shadow: 4px 0 15px rgba(0, 0, 0, 0.05);
}

.sidebar.open {
  transform: translateX(0);
}

.sidebar-content {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 2rem 1.5rem;
}

.logo {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-top: 3rem;
  margin-bottom: 2.5rem;
}

.logo img {
  width: 2.5rem;
  height: 2.5rem;
  object-fit: contain;
  filter: brightness(0) invert(1);
}

.logo h2 {
  color: white;
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
}

.nav-links {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 1rem;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.875rem 1rem;
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  border-radius: 0.75rem;
  transition: all 0.3s ease;
}

.nav-item i {
  font-size: 1.25rem;
  width: 1.5rem;
}

.nav-item span {
  font-size: 0.938rem;
  font-weight: 500;
}

.nav-item:hover,
.nav-item.active {
  background: rgba(255, 255, 255, 0.15);
  color: white;
  transform: translateX(5px);
}

.logout-btn {
  margin-top: auto;
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.875rem 1rem;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: none;
  border-radius: 0.75rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.logout-btn i {
  font-size: 1.25rem;
}

.logout-btn span {
  font-size: 0.938rem;
  font-weight: 500;
}

.logout-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

.main-content {
  margin-left: 260px;
  padding: 2rem;
  transition: margin-left 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  flex: 1;
}

.card {
  background: white;
  border-radius: 1rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  padding: 2rem;
  margin-bottom: 2rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  color: #4a5568;
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  transition: all 0.2s;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  outline: none;
}

.submit-btn {
  width: 100%;
  padding: 0.75rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
}

.submit-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 6px rgba(102, 126, 234, 0.2);
}

.table-container {
  overflow-x: auto;
  padding: 1.5rem;
}

table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
}

th {
  background-color: #f7fafc;
  padding: 1rem;
  font-weight: 600;
  color: #4a5568;
  text-align: left;
}

td {
  padding: 1rem;
  border-bottom: 1px solid #e2e8f0;
  color: #4a5568;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
}

.status-badge.pending {
  background-color: #fef3c7;
  color: #92400e;
}

.status-badge.approved {
  background-color: #dcfce7;
  color: #166534;
}

.status-badge.rejected {
  background-color: #fee2e2;
  color: #991b1b;
}

.action-btn {
  padding: 0.5rem;
  border: none;
  border-radius: 0.375rem;
  background: transparent;
  color: #4a5568;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn:hover {
  background-color: #f7fafc;
  color: #667eea;
}

/* Responsive Design */
@media (max-width: 768px) {
  .main-content {
    margin-left: 0;
  }
}
</style>
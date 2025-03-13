<template>
  <div class="contact-management">
    <!-- Sidebar Toggle Button -->
    <button class="menu-btn" @click="toggleSidebar">
      {{ isSidebarOpen ? "✕" : "☰" }}
    </button>

    <!-- Sidebar -->
    <aside :class="{ open: isSidebarOpen }" class="sidebar">
      <div class="sidebar-header">
        <div class="logo">
          <img src="../assets/logo.png" alt="Logo" />
          <h2>Alumni Connect</h2>
        </div>
      </div>
      <nav class="nav-links">
        <router-link to="/home" class="nav-item">Home</router-link>
        <router-link to="/contacts" class="nav-item">Contacts</router-link>
        <router-link to="/events" class="nav-item">Events</router-link>
        <router-link to="/archive" class="nav-item active">Archive</router-link>
        <router-link to="/approve-requests" class="nav-item">Requests</router-link>
      </nav>
      <button class="logout-btn" @click="handleLogout">Logout</button>
    </aside>

    <!-- Main Content -->
    <div class="main-content">
      <h1>Archived Contacts</h1>

      <!-- Action Buttons -->
      <div class="actions">
        <button :disabled="!selectedContacts.length" @click="restoreContacts">Restore</button>
        <button :disabled="!selectedContacts.length" @click="permanentDeleteContacts">Permanent Delete</button>
      </div>

      <!-- Filter Tab -->
      <div class="filter-tab">
        <h3>Filters</h3>
        <label>
          Filter by:
          <select v-model="filterKey">
            <option value="all">All</option>
            <option value="alumniId">Alumni ID</option>
            <option value="name">Name</option>
            <option value="college">College</option>
            <option value="program">Program</option>
            <option value="email">Email</option>
            <option value="status">Status</option>
          </select>
        </label>
        <input v-model="filterValue" type="text" placeholder="Enter filter value..." />
      </div>

      <!-- Search Bar -->
      <input v-model="searchTerm" type="text" placeholder="Search contacts..." class="search-bar" />

      <!-- Contacts Table -->
      <table>
        <thead>
          <tr>
            <th><input type="checkbox" @change="toggleSelectAll" /></th>
            <th>Alumni ID</th>
            <th>Name</th>
            <th>College</th>
            <th>Program</th>
            <th>Email</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="contact in paginatedContacts" :key="contact.id">
            <td><input type="checkbox" v-model="selectedContacts" :value="contact.id" @click.stop /></td>
            <td>{{ contact.alumniId }}</td>
            <td @click="$router.push({ name: 'ContactDetail', params: { id: contact.id } })" class="clickable-name">
              {{ contact.name }}
            </td>
            <td>{{ contact.college }}</td>
            <td>{{ contact.program }}</td>
            <td>{{ contact.email }}</td>
            <td><span :class="'status-badge ' + contact.status.toLowerCase()">{{ contact.status }}</span></td>
          </tr>
        </tbody>
      </table>

      <!-- Pagination -->
      <div class="pagination">
        <button @click="goToPage(currentPage - 1)" :disabled="currentPage === 1">Previous</button>
        <span>Page {{ currentPage }} of {{ totalPages }}</span>
        <button @click="goToPage(currentPage + 1)" :disabled="currentPage === totalPages">Next</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "ArchiveManagement",
  data() {
    return {
      contacts: [],
      searchTerm: "",
      selectedContacts: [],
      currentPage: 1,
      pageSize: 10,
      isSidebarOpen: false,
      filterKey: "all", // Default filter key
      filterValue: "", // Filter value
    };
  },
  computed: {
    filteredContacts() {
      const search = this.searchTerm.toLowerCase();
      return this.contacts.filter(contact => {
        const matchesSearch = Object.values(contact).some(val =>
          typeof val === "string" && val.toLowerCase().includes(search)
        );
        const matchesFilter = this.filterKey === "all" || !this.filterValue
          ? Object.values(contact).some(val =>
              typeof val === "string" && val.toLowerCase().includes(this.filterValue.toLowerCase())
            )
          : contact[this.filterKey] && contact[this.filterKey].toLowerCase().includes(this.filterValue.toLowerCase());
        return matchesSearch && matchesFilter;
      });
    },
    totalPages() {
      return Math.ceil(this.filteredContacts.length / this.pageSize);
    },
    paginatedContacts() {
      const start = (this.currentPage - 1) * this.pageSize;
      return this.filteredContacts.slice(start, start + this.pageSize);
    },
  },
  methods: {
    toggleSidebar() {
      this.isSidebarOpen = !this.isSidebarOpen;
    },
    handleLogout() {
      localStorage.removeItem("user");
      this.$router.push("/");
    },
    goToPage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page;
      }
    },
    toggleSelectAll(event) {
      this.selectedContacts = event.target.checked ? this.paginatedContacts.map(c => c.id) : [];
    },
    restoreContacts() {
      if (!this.selectedContacts.length) return;

      const activeContacts = JSON.parse(localStorage.getItem("contacts") || "[]");
      const toRestore = this.contacts.filter(c => this.selectedContacts.includes(c.id));

      // Move to active contacts
      const updatedActiveContacts = [...activeContacts, ...toRestore];
      localStorage.setItem("contacts", JSON.stringify(updatedActiveContacts));

      // Remove from archived contacts
      this.contacts = this.contacts.filter(c => !this.selectedContacts.includes(c.id));
      localStorage.setItem("archivedContacts", JSON.stringify(this.contacts));

      this.selectedContacts = [];
    },
    permanentDeleteContacts() {
      if (!this.selectedContacts.length) return;

      // Remove from archived contacts
      this.contacts = this.contacts.filter(c => !this.selectedContacts.includes(c.id));
      localStorage.setItem("archivedContacts", JSON.stringify(this.contacts));

      this.selectedContacts = [];
    },
  },
  created() {
    const savedContacts = localStorage.getItem("archivedContacts");
    if (savedContacts) {
      this.contacts = JSON.parse(savedContacts);
    }
  },
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

/* Headings */
h1 {
  color: #2D1E2F;
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 30px;
  margin-left: 60px;
}

/* Action Buttons */
.actions {
  display: flex;
  gap: 12px;
  margin-bottom: 30px;
  margin-left: 60px;
}

.actions button {
  padding: 12px 24px;
  border: none;
  border-radius: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.actions button:first-child {
  background: #FF4B6E;
  color: white;
  box-shadow: 0 4px 15px rgba(255, 75, 110, 0.2);
}

.actions button:not(:first-child) {
  background: white;
  color: #2D1E2F;
  border: 1px solid #FFD6DE;
}

.actions button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(255, 75, 110, 0.15);
}

.actions button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Filter Tab */
.filter-tab {
  position: absolute;
  top: 20px;
  right: 20px;
  background: white;
  padding: 20px;
  border-radius: 16px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.filter-tab h3 {
  margin: 0 0 10px 0;
  font-size: 18px;
  color: #2D1E2F;
}

.filter-tab label {
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 14px;
  color: #6B4E5B;
}

.filter-tab select,
.filter-tab input {
  padding: 8px;
  border: 1px solid #FFD6DE;
  border-radius: 8px;
  font-size: 14px;
  color: #2D1E2F;
}

/* Search Bar */
.search-bar {
  width: calc(100% - 60px);
  margin-left: 60px;
  padding: 16px 24px;
  border: 1px solid #FFD6DE;
  border-radius: 16px;
  margin-bottom: 30px;
  font-size: 15px;
  transition: all 0.3s ease;
  background: white;
}

.search-bar:focus {
  outline: none;
  border-color: #FF4B6E;
  box-shadow: 0 0 0 3px rgba(255, 75, 110, 0.1);
}

/* Table */
table {
  width: calc(100% - 60px);
  margin-left: 60px;
  border-collapse: separate;
  border-spacing: 0;
  background: white;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 4px 25px rgba(255, 75, 110, 0.08);
}

th, td {
  padding: 18px;
  text-align: left;
  border-bottom: 1px solid #FFD6DE;
}

th {
  background-color: #FFF5F7;
  color: #2D1E2F;
  font-weight: 600;
  font-size: 14px;
}

td {
  color: #6B4E5B;
  font-size: 14px;
}

tr:hover {
  background-color: #FFF5F7;
  cursor: pointer;
}

/* Pagination */
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-top: 30px;
  margin-left: 60px;
}

.pagination button {
  padding: 10px 20px;
  border: 1px solid #FFD6DE;
  border-radius: 16px;
  background: white;
  color: #2D1E2F;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
}

.pagination button:hover:not(:disabled) {
  background: #FF4B6E;
  color: white;
  border-color: #FF4B6E;
}

.pagination button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination span {
  color: #2D1E2F;
  font-weight: 500;
}

/* Responsive Styles */
@media (max-width: 768px) {
  .main-content {
    padding: 20px;
  }

  h1, .actions, .search-bar, table {
    margin-left: 0;
  }

  .actions {
    flex-wrap: wrap;
  }

  .actions button {
    flex: 1;
    min-width: 120px;
  }

  table {
    width: 100%;
    overflow-x: auto;
  }
}
</style>
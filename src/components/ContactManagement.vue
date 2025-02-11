<template>
  <div class="contact-management">
    <!-- Sidebar -->
    <aside :class="{ open: isSidebarOpen }" class="sidebar">
      <div class="logo">
        <img src="../assets/logo.png" alt="Logo" />
        <h2>Alumni Connect</h2>
      </div>
      <nav class="nav-links">
        <router-link to="/home" class="nav-item">Home</router-link>
        <router-link to="/contacts" class="nav-item active">Contacts</router-link>
        <router-link to="/events" class="nav-item">Events</router-link>
      </nav>
      <button class="logout-btn" @click="handleLogout">Logout</button>
    </aside>

    <!-- Main Content -->
    <div class="main-content">
      <button class="menu-btn" @click="toggleSidebar">☰</button>
      <h1>Manage Contacts</h1>

      <!-- Action Buttons -->
      <div class="actions">
        <button @click="handleNewContact">+ New</button>
        <button :disabled="!selectedContacts.length" @click="deleteContacts">Delete</button>
        <input type="file" ref="fileInput" @change="importCSV" style="display: none;" />
        <button @click="triggerFileInput">Import</button>
        <button @click="exportCSV">Export</button>
      </div>

      <!-- Search Bar -->
      <input v-model="searchTerm" type="text" placeholder="Search contacts..." class="search-bar" />

      <!-- Contacts Table -->
      <table>
        <thead>
          <tr>
            <th><input type="checkbox" @change="toggleSelectAll" /></th>
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
import Papa from "papaparse";

export default {
  data() {
    return {
      contacts: [],
      searchTerm: "",
      selectedContacts: [],
      currentPage: 1,
      pageSize: 10,
      isSidebarOpen: false,
    };
  },
  computed: {
    filteredContacts() {
      const search = this.searchTerm.toLowerCase();
      return this.contacts.filter(contact =>
        Object.values(contact).some(val =>
          typeof val === "string" && val.toLowerCase().includes(search)
        )
      );
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
    importCSV(event) {
      const file = event.target.files[0];
      if (file) {
        Papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            const newContacts = results.data.map((row, index) => ({
              id: index + 1,
              name: row.Name || "",
              college: row.College || "",
              program: row.Program || "",
              email: row.Email || "",
              status: row.Status || "Pending",
            }));

            localStorage.setItem("contacts", JSON.stringify(newContacts));
            this.contacts = newContacts;
          },
        });
      }
    },
    exportCSV() {
      const csv = Papa.unparse(this.contacts);
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "contacts.csv";
      link.click();
    },
    triggerFileInput() {
      this.$refs.fileInput.click();
    },
    goToPage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page;
      }
    },
    toggleSelectAll(event) {
      if (event.target.checked) {
        this.selectedContacts = this.paginatedContacts.map(contact => contact.id);
      } else {
        this.selectedContacts = [];
      }
    },
    deleteContacts() {
      if (this.selectedContacts.length === 0) return;

      this.contacts = this.contacts.filter(contact => !this.selectedContacts.includes(contact.id));
      this.selectedContacts = [];

      localStorage.setItem("contacts", JSON.stringify(this.contacts));
    }
  },
  created() {
    const savedContacts = localStorage.getItem("contacts");
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
  background-color: #f8fafc;
  font-family: 'Inter', sans-serif;
}

/* Sidebar Styles */
.sidebar {
  width: 280px;
  height: 100vh;
  background: linear-gradient(180deg, #2B3674 0%, #1A1F37 100%);
  color: white;
  position: fixed;
  top: 0;
  left: -280px;
  transition: all 0.3s ease;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  padding: 30px;
  display: flex;
  flex-direction: column;
}

.sidebar.open {
  left: 0;
}

.sidebar .logo {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 40px;
}

.sidebar .logo img {
  width: 45px;
  height: auto;
  filter: brightness(0) invert(1);
}

.sidebar .logo h2 {
  font-size: 20px;
  font-weight: 600;
}

.nav-links {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin: 20px 0;
}

.nav-item {
  display: flex;
  align-items: center;
  padding: 12px;
  color: #A3AED0;
  text-decoration: none;
  border-radius: 14px;
  transition: all 0.3s ease;
}

.nav-item.active, .nav-item:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.logout-btn {
  margin-top: auto;
  padding: 12px;
  background-color: rgba(255, 82, 82, 0.1);
  color: #FF5252;
  border: none;
  border-radius: 14px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
}

.logout-btn:hover {
  background-color: rgba(255, 82, 82, 0.2);
}

/* Main Content Styles */
.main-content {
  flex: 1;
  margin-left: 0;
  padding: 30px;
  transition: all 0.3s ease;
}

.menu-btn {
  position: fixed;
  top: 20px;
  left: 20px;
  z-index: 1001;
  background: #4318FF;
  color: white;
  border: none;
  padding: 12px;
  border-radius: 12px;
  cursor: pointer;
  width: 45px;
  height: 45px;
  font-size: 20px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(67, 24, 255, 0.15);
}

.menu-btn:hover {
  background: #2B3674;
  transform: translateY(-2px);
}

h1 {
  color: #2B3674;
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 30px;
  margin-left: 60px;
}

/* Action Buttons */
.actions {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  margin-left: 60px;
}

.actions button {
  padding: 10px 20px;
  border: none;
  border-radius: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.actions button:first-child {
  background: #4318FF;
  color: white;
}

.actions button:not(:first-child) {
  background: #E9EDF7;
  color: #2B3674;
}

.actions button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.actions button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Search Bar */
.search-bar {
  width: calc(100% - 60px);
  margin-left: 60px;
  padding: 12px 20px;
  border: 1px solid #E0E5F2;
  border-radius: 14px;
  margin-bottom: 24px;
  font-size: 14px;
  transition: all 0.3s ease;
}

.search-bar:focus {
  outline: none;
  border-color: #4318FF;
  box-shadow: 0 0 0 3px rgba(67, 24, 255, 0.1);
}

/* Table Styles */
table {
  width: calc(100% - 60px);
  margin-left: 60px;
  border-collapse: separate;
  border-spacing: 0;
  background: white;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
}

th, td {
  padding: 16px;
  text-align: left;
  border-bottom: 1px solid #E0E5F2;
}

th {
  background-color: #F8F9FF;
  color: #2B3674;
  font-weight: 600;
  font-size: 14px;
}

td {
  color: #2B3674;
  font-size: 14px;
}

tr:hover {
  background-color: #F8F9FF;
  cursor: pointer;
}

/* Checkbox Styles */
input[type="checkbox"] {
  width: 18px;
  height: 18px;
  border-radius: 6px;
  cursor: pointer;
}

/* Pagination */
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-top: 24px;
  margin-left: 60px;
}

.pagination button {
  padding: 8px 16px;
  border: 1px solid #E0E5F2;
  border-radius: 12px;
  background: white;
  color: #2B3674;
  cursor: pointer;
  transition: all 0.3s ease;
}

.pagination button:hover:not(:disabled) {
  background: #4318FF;
  color: white;
  border-color: #4318FF;
}

.pagination button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination span {
  color: #2B3674;
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

<template>
  <div class="contact-management">
    <button class="menu-btn" @click="toggleSidebar">☰</button>
    <div :class="['sidebar', { open: isSidebarOpen }]">
      <div class="sidebar-header">
        <div class="logo">
          <img src="@/assets/logo.png" alt="Logo" /> <!-- Correct logo path -->
          <h2>Alumni Connect</h2>
        </div>
      </div>
      <nav class="nav-links">
        <router-link to="/home" class="nav-item" active-class="active">Home</router-link>
        <router-link to="/contacts" class="nav-item" active-class="active">Contacts</router-link>
        <router-link to="/events" class="nav-item" active-class="active">Events</router-link>
        <router-link to="/archive" class="nav-item" active-class="active">Archive</router-link>
        <router-link to="/requests" class="nav-item" active-class="active">Requests</router-link>
      </nav>
      <button class="logout-btn" @click="handleLogout">Logout</button>
    </div>
    <div class="main-content">
      <h1>Manage Contacts</h1>
      <div class="actions">
        <button @click="handleNewContact">+ New</button>
        <button @click="deleteContacts" :disabled="!selectedContacts.length">Delete</button>
        <button @click="triggerFileInput">Import</button>
        <button @click="exportCSV">Export</button>
        <input type="file" ref="fileInput" @change="importCSV" style="display: none;" />
      </div>
      <input type="text" class="search-bar" v-model="searchTerm" placeholder="Search contacts..." />
      <table>
        <thead>
  <tr>
    <th><input type="checkbox" @change="toggleSelectAll" /></th>
    <th>Alumni ID</th>
    <th>Name</th>
    <th>College</th>
    <th>Program</th>
    <th>Email</th>
    <th>Occupation</th>
    <th>Status</th>
  </tr>
</thead>
<tbody>
  <tr v-for="contact in paginatedContacts" :key="contact.id">
    <td><input type="checkbox" v-model="selectedContacts" :value="contact.id" @click.stop /></td>
    <td>{{ contact.alumni_ID }}</td>
    <td>{{ contact.alumni_Name }}</td>
    <td>{{ contact.college }}</td>
    <td>{{ contact.Program }}</td>
    <td>{{ contact.Email }}</td>
    <td>{{ contact.Occupation_Status }}</td>
    <td>
      <span :class="'status-badge ' + (contact.Status || '').toLowerCase()">
        {{ contact.Status }}
      </span>
    </td>
  </tr>
</tbody>

      </table>
      <div class="pagination">
        <button @click="goToPage(currentPage - 1)" :disabled="currentPage === 1">Previous</button>
        <span>Page {{ currentPage }} of {{ totalPages }}</span>
        <button @click="goToPage(currentPage + 1)" :disabled="currentPage === totalPages">Next</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import Papa from 'papaparse';
import { supabase } from '../lib/supabaseClient';

const contacts = ref([]);
const searchTerm = ref('');
const selectedContacts = ref([]);
const currentPage = ref(1);
const pageSize = ref(10);
const isSidebarOpen = ref(false);
const filterKey = ref('all'); // Default filter key
const filterValue = ref(''); // Filter value
const fileInput = ref(null); // Reference for file input

const filteredContacts = computed(() => {
  const search = searchTerm.value.toLowerCase();
  return contacts.value.filter(contact => {
    const matchesSearch = Object.values(contact).some(val =>
      typeof val === 'string' && val.toLowerCase().includes(search)
    );
    const matchesFilter = filterKey.value === 'all' || !filterValue.value
      ? Object.values(contact).some(val =>
          typeof val === 'string' && val.toLowerCase().includes(filterValue.value.toLowerCase())
        )
      : contact[filterKey.value] && contact[filterKey.value].toLowerCase().includes(filterValue.value.toLowerCase());
    return matchesSearch && matchesFilter;
  });
});

const totalPages = computed(() => Math.ceil(filteredContacts.value.length / pageSize.value));

const paginatedContacts = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return filteredContacts.value.slice(start, start + pageSize.value);
});

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value;
};

const handleLogout = () => {
  localStorage.removeItem('user');
  this.$router.push('/');
};

const handleNewContact = () => {
  // Add logic to create a new contact
};

const triggerFileInput = () => {
  fileInput.value.click();
};

const importCSV = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async (e) => {
    const csvData = Papa.parse(e.target.result, {
      header: true,
      skipEmptyLines: true,
    });

    if (csvData.data.length > 0) {
      const newContacts = csvData.data.map((row) => ({
  alumni_ID: row.Alumni_ID ? parseInt(row.Alumni_ID, 10) : null,
  alumni_Name: row.Alumni_Name || '',
  alumni_firstname: row.Alumni_Firstname || '',
  Alumni_LastName: row.Alumni_Lastname || '',
  college: row.college || '',
  Year_Graduated: row.Year_Graduated ? parseInt(row.Year_Graduated, 10) : null,
  Program: row.Program || '',
  Email: row.Email || '',
  Occupation_Status: row.Occupation_Status || '',
  Phone_Number: row.Phone_Number ? parseInt(row.Phone_Number, 10) : null,
  Address: row.Address || '',
  Status: row.Status || '',
}));

      console.log('New Contacts:', newContacts);

      // Insert new contacts into Supabase
      const { data, error } = await supabase
        .from('alumni_table')
        .insert(newContacts);

      if (error) {
        console.error('Error inserting contacts:', error.message);
      } else {
        console.log('Inserted Contacts:', data);

        // Fetch updated contacts from Supabase
        const { data: updatedContacts, error: fetchError } = await supabase
          .from('alumni_table')
          .select('*');

        if (fetchError) {
          console.error('Error fetching contacts:', fetchError.message);
        } else {
          console.log('Updated Contacts:', updatedContacts);
          contacts.value = updatedContacts;
        }
      }
    }
  };
  reader.readAsText(file);
};

const exportCSV = () => {
  if (contacts.value.length === 0) {
    alert('No contacts to export!');
    return;
  }

  const csvContent = Papa.unparse(contacts.value);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'contacts.csv';
  link.click();
};

const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
  }
};

const toggleSelectAll = (event) => {
  selectedContacts.value = event.target.checked ? paginatedContacts.value.map(c => c.id) : [];
};

const deleteContacts = async () => {
  if (!selectedContacts.value.length) return;

  const archivedContacts = JSON.parse(localStorage.getItem('archivedContacts') || '[]');
  const toArchive = contacts.value.filter(c => selectedContacts.value.includes(c.id));

  // Move to archive
  const updatedArchivedContacts = [...archivedContacts, ...toArchive];
  localStorage.setItem('archivedContacts', JSON.stringify(updatedArchivedContacts));

  // Remove from active contacts
  const { error } = await supabase
    .from('alumni_table')
    .delete()
    .in('id', selectedContacts.value);

  if (error) {
    console.error('Error deleting contacts:', error.message);
  } else {
    contacts.value = contacts.value.filter(c => !selectedContacts.value.includes(c.id));
    selectedContacts.value = [];
  }
};

// eslint-disable-next-line no-unused-vars
const navigateToArchive = () => {
  this.$router.push('/archive');
};

onMounted(async () => {
  const { data: fetchedContacts, error } = await supabase
    .from('alumni_table')
    .select('*');

  if (error) {
    console.error('Error fetching contacts:', error.message);
  } else {
    console.log('Fetched Contacts:', fetchedContacts);
    contacts.value = fetchedContacts;
  }
});
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
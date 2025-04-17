<template>
  <div class="contact-management">
    <button class="menu-btn" @click="toggleSidebar">☰</button>
    <div :class="['sidebar', { open: isSidebarOpen }]">
      <div class="sidebar-header">
        <div class="logo">
          <img src="@/assets/logo.png" alt="Logo" />
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

      <div style="display: flex; gap: 10px; margin-bottom: 30px; margin-left: 60px; align-items: center;">
        <input type="text" class="search-bar" v-model="searchTerm" placeholder="Search contacts..." />
        <select v-model="expertiseFilter" style="padding: 14px; border: 1px solid #FFD6DE; border-radius: 16px; background: white; font-size: 15px;">
          <option value="">All Expertise</option>
          <option v-for="tag in expertiseOptions" :key="tag.id" :value="tag.name">{{ tag.name }}</option>
        </select>
      </div>

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
          <tr
            v-for="contact in paginatedContacts"
            :key="contact.alumni_ID"
            @click="navigateToContact(contact.alumni_ID)"
            style="cursor: pointer;"
          >
            <td @click.stop>
              <input
                type="checkbox"
                :value="contact.alumni_ID"
                :checked="selectedContacts.includes(contact.alumni_ID)"
                @change="toggleSingleSelect(contact.alumni_ID)"
              />
            </td>
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
import { useRouter } from 'vue-router';
import Papa from 'papaparse';
import { supabase } from '../lib/supabaseClient';

const router = useRouter();
const contacts = ref([]);
const searchTerm = ref('');
const expertiseFilter = ref('');
const expertiseOptions = ref([]);
const selectedContacts = ref([]);
const currentPage = ref(1);
const pageSize = ref(10);
const isSidebarOpen = ref(false);
const fileInput = ref(null);

const filteredContacts = computed(() => {
  const search = searchTerm.value.toLowerCase();

  return contacts.value.filter(contact => {
    const matchesSearch = Object.values(contact).some(val =>
      typeof val === 'string' && val.toLowerCase().includes(search)
    );

    const matchesExpertise =
      !expertiseFilter.value ||
      contact.expertise_tags?.some(tag =>
        tag.name.toLowerCase() === expertiseFilter.value.toLowerCase()
      );

    return matchesSearch && matchesExpertise;
  });
});

const totalPages = computed(() => Math.ceil(filteredContacts.value.length / pageSize.value));

const paginatedContacts = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return filteredContacts.value.slice(start, start + pageSize.value);
});

const toggleSidebar = () => { isSidebarOpen.value = !isSidebarOpen.value; };

const handleLogout = () => {
  localStorage.removeItem('user');
  router.push('/');
};

const handleNewContact = () => {
  router.push({ name: 'ContactDetail', params: { id: 'new' } });
};

const navigateToContact = (id) => {
  router.push({ name: 'ContactDetail', params: { id } });
};

const triggerFileInput = () => fileInput.value.click();

const importCSV = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async (e) => {
    const csvData = Papa.parse(e.target.result, {
      header: true,
      skipEmptyLines: true,
    });

    const newContacts = csvData.data.map(row => ({
      Alumni_ID: row.Alumni_ID || '',
      Alumni_Firstname: row.Alumni_Firstname || '',
      Alumni_Lastname: row.Alumni_Lastname || '',
      college: row.college || '',
      Year_Graduated: row.Year_Graduated || null,
      Program: row.Program || '',
      Email: row.Email || '',
      Occupation: row.Occupation || '',
      Status: row.Status || '',
      expertise: row.expertise || '', // expertise string in column (e.g. "Technical Expert")
    }));

    const { error } = await supabase.from('alumni_table').insert(newContacts);
    if (!error) fetchContacts();
  };
  reader.readAsText(file);
};

const exportCSV = () => {
  const flatExport = contacts.value.map(contact => ({
    Alumni_ID: contact.alumni_ID,
    Alumni_Firstname: contact.alumni_firstname,
    Alumni_Lastname: contact.Alumni_LastName,
    college: contact.college,
    Year_Graduated: contact.Year_Graduated,
    Program: contact.Program,
    Email: contact.Email,
    Occupation: contact.Occupation_Status,
    Status: contact.Status,
    expertise: contact.expertise_tags?.map(tag => tag.name).join(', ') || ''
  }));

  const csvContent = Papa.unparse(flatExport);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'contacts.csv';
  link.click();
};

const toggleSelectAll = (event) => {
  selectedContacts.value = event.target.checked
    ? paginatedContacts.value.map(c => c.alumni_ID)
    : [];
};

const toggleSingleSelect = (id) => {
  if (selectedContacts.value.includes(id)) {
    selectedContacts.value = selectedContacts.value.filter(cid => cid !== id);
  } else {
    selectedContacts.value.push(id);
  }
};

const deleteContacts = async () => {
  if (!selectedContacts.value.length) return;

  const { error } = await supabase
    .from('alumni_table')
    .delete()
    .in('alumni_ID', selectedContacts.value.map(Number));

  if (!error) {
    await fetchContacts();
    selectedContacts.value = [];
  } else {
    console.error('Delete failed:', error.message);
  }
};

const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) currentPage.value = page;
};

const fetchContacts = async () => {
  const { data: alumni, error } = await supabase
    .from('alumni_table')
    .select(`
      *,
      alumni_expertise (
        expertise_tags (
          id,
          name
        )
      )
    `);

  if (error) return console.error('Failed to fetch contacts:', error);

  contacts.value = alumni.map(a => ({
    ...a,
    expertise_tags: a.alumni_expertise?.map(x => x.expertise_tags) || []
  }));
};

const fetchExpertiseTags = async () => {
  const { data, error } = await supabase.from('expertise_tags').select('*');
  if (!error) expertiseOptions.value = data;
};

onMounted(() => {
  fetchContacts();
  fetchExpertiseTags();
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

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 80px;
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
  margin-bottom: 20px;
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

/* Search + Filter Container (NEW) */
.search-filter-bar {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-left: 60px;
  margin-bottom: 30px;
}

/* Search Bar */
.search-bar {
  flex: 1;
  padding: 16px 24px;
  border: 1px solid #FFD6DE;
  border-radius: 16px;
  font-size: 15px;
  background: white;
  transition: all 0.3s ease;
}

.search-bar:focus {
  outline: none;
  border-color: #FF4B6E;
  box-shadow: 0 0 0 3px rgba(255, 75, 110, 0.1);
}

/* Expertise Dropdown */
.search-filter-bar select {
  padding: 16px 24px;
  border: 1px solid #FFD6DE;
  border-radius: 16px;
  font-size: 15px;
  background: white;
  color: #2D1E2F;
  transition: all 0.3s ease;
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

  h1, .actions, .search-filter-bar, table {
    margin-left: 0;
  }

  .actions {
    flex-wrap: wrap;
  }

  .actions button {
    flex: 1;
    min-width: 120px;
  }

  .search-filter-bar {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }

  table {
    width: 100%;
    overflow-x: auto;
  }
}
</style>

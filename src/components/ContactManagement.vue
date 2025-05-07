<template>
  <div class="contact-management">
    <!-- Sidebar -->
    <button class="menu-btn" @click="toggleSidebar">☰</button>
    <div :class="['sidebar', { open: isSidebarOpen }]">
      <div class="sidebar-header">
        <div class="logo">
          <img src="@/assets/logo.jpg" alt="Logo" />
          <h2>Marian TBI Connect</h2>
        </div>
      </div>
      <nav class="nav-links">
        <router-link to="/home" class="nav-item" active-class="active">Home</router-link>
        <router-link to="/contacts" class="nav-item" active-class="active">Contacts</router-link>
        <router-link to="/events" class="nav-item" active-class="active">Events</router-link>
        <router-link to="/archive" class="nav-item" active-class="active">Archives</router-link>
        <router-link to="/approve-requests" class="nav-item" active-class="active">Requests</router-link>
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

      <!-- Search and Click-to-Toggle Filters -->
      <div style="display: flex; gap: 10px; margin-bottom: 30px; margin-left: 60px; align-items: center;">
  <input
    type="text"
    class="search-bar"
    v-model="searchTerm"
    placeholder="Search contacts..."
  />

  <button
    v-if="isFilterActive"
    @click="resetFilters"
    class="reset-button"
  >
    Reset
  </button>

        <!-- Click-to-Toggle Filter Dropdown -->
        <div class="click-toggle-filter">
          <button @click="toggleFilterMenu" class="filter-toggle">Filter by</button>

          <div v-if="filterMenuOpen" class="filter-menu">
            <div class="filter-item" @mouseenter="handleSubmenuPosition('Status')">
              Status
              <div v-if="showSubmenu === 'Status'" class="submenu" :class="{ 'left-side': submenuDirection === 'left' }">
                <div class="submenu-item" @click="applyFilter('Status', 'Pending')">Pending</div>
                <div class="submenu-item" @click="applyFilter('Status', 'Contacted')">Contacted</div>
              </div>
            </div>

            <div class="filter-item" @mouseenter="handleSubmenuPosition('Expertise')">
              Expertise
              <div v-if="showSubmenu === 'Expertise'" class="submenu" :class="{ 'left-side': submenuDirection === 'left' }">
                <div
                  class="submenu-item"
                  v-for="tag in expertiseOptions"
                  :key="tag.id"
                  @click="applyFilter('Expertise', tag.name)"
                >
                  {{ tag.name }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      

      <!-- Table -->
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
            <td>{{ contact.collegeName }}</td>
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

      <!-- Pagination -->
      <div class="pagination">
        <button @click="goToPage(currentPage - 1)" :disabled="currentPage === 1">Previous</button>
        <span>Page {{ currentPage }}  {{ totalPages }}</span>
        <button @click="goToPage(currentPage + 1)" :disabled="currentPage === totalPages">Next</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import Papa from 'papaparse'
import { supabase } from '../lib/supabaseClient'

const router = useRouter()
const contacts = ref([])
const searchTerm = ref('')
const selectedContacts = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const isSidebarOpen = ref(false)

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value
}

const expertiseOptions = ref([])
const filterCategory = ref('')
const filterValue = ref('')
const filterMenuOpen = ref(false)
const showSubmenu = ref(null)
const submenuDirection = ref('right')

const toggleFilterMenu = () => {
  filterMenuOpen.value = !filterMenuOpen.value
  showSubmenu.value = null
}

const handleSubmenuPosition = async (key) => {
  showSubmenu.value = key
  await nextTick()
  const submenuEl = document.querySelector('.filter-item .submenu')
  if (!submenuEl) return
  const rect = submenuEl.getBoundingClientRect()
  const overflowRight = rect.right > window.innerWidth
  submenuDirection.value = overflowRight ? 'left' : 'right'
}

const applyFilter = (category, value) => {
  filterCategory.value = category
  filterValue.value = value
  filterMenuOpen.value = false
  showSubmenu.value = null
  currentPage.value = 1
}

// Reset Filter and Search
const resetFilters = () => {
  searchTerm.value = ''
  filterCategory.value = ''
  filterValue.value = ''
  currentPage.value = 1
}

const isFilterActive = computed(() => {
  return searchTerm.value !== '' || (filterCategory.value !== '' && filterValue.value !== '')
})

// Watch if any search or filter applied
watch([searchTerm, filterCategory, filterValue], () => {
  // just reactively detect but no additional action needed here
})

const filteredContacts = computed(() => {
  const search = searchTerm.value.toLowerCase()

  return contacts.value
    .filter(contact => {
      const searchable = [
        contact.alumni_ID,
        contact.alumni_Name,
        contact.Email,
        contact.college,
        contact.Phone_Number,
        contact.Year_Graduated,
        contact.Occupation_Status,
        contact.Program,
        contact.College,
        contact.Company,
        contact.expertise
      ]
      const matchesSearch = searchable.some(val =>
        val !== null && val !== undefined && String(val).toLowerCase().includes(search)
      )

      let matchesFilter = true
      if (filterCategory.value === 'Expertise') {
        matchesFilter =
          !filterValue.value ||
          (contact.expertise && contact.expertise.includes(filterValue.value))
      } else if (filterCategory.value && filterValue.value) {
        matchesFilter = contact[filterCategory.value]?.toString() === filterValue.value
      }

      return matchesSearch && matchesFilter
    })
    .sort((a, b) => a.alumni_ID - b.alumni_ID) // Sort based on alumni_ID
})

const paginatedContacts = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredContacts.value.slice(start, start + pageSize.value)
})

const goToPage = (page) => {
  if (page >= 1 && page <= Math.ceil(filteredContacts.value.length / pageSize.value)) {
    currentPage.value = page
  }
}

const navigateToContact = (id) => {
  router.push({ name: 'ContactDetail', params: { id } })
}

const handleNewContact = () => {
  router.push({ name: 'ContactDetail', params: { id: 'new' } })
}

const toggleSelectAll = (event) => {
  selectedContacts.value = event.target.checked
    ? paginatedContacts.value.map(c => c.alumni_ID)
    : []
}

const toggleSingleSelect = (id) => {
  if (selectedContacts.value.includes(id)) {
    selectedContacts.value = selectedContacts.value.filter(cid => cid !== id)
  } else {
    selectedContacts.value.push(id)
  }
}

const fileInput = ref(null)
const triggerFileInput = () => fileInput.value.click()

const importCSV = async (event) => {
  const file = event.target.files[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = async (e) => {
    const csvData = Papa.parse(e.target.result, { header: true, skipEmptyLines: true })
    const newContacts = csvData.data.map(row => ({
      alumni_ID: parseInt(row.alumni_ID) || null,
      alumni_Name: row.alumni_Name || '',
      alumni_firstname: row.alumni_firstname || '',
      Alumni_LastName: row.Alumni_LastName || '',
      Year_Graduated: parseInt(row.Year_Graduated) || 0,
      Program: row.Program || '',
      Phone_Number: parseInt(row.Phone_Number) || 0,
      Email: row.Email || '',
      Address: row.Address || '',
      Occupation_Status: row.Occupation_Status || '',
      college: row.college || '',
      Status: row.Status || '',
      expertise: row.expertise || ''
    }))
    const { error } = await supabase.from('alumni_table').upsert(newContacts, { onConflict: 'alumni_ID' })
    if (!error) fetchContacts()
  }
  reader.readAsText(file)
}

const exportCSV = () => {
  const exportList = selectedContacts.value.length
    ? contacts.value.filter(c => selectedContacts.value.includes(c.alumni_ID))
    : contacts.value

  const flatExport = exportList.map(contact => ({
    alumni_ID: contact.alumni_ID,
    alumni_Name: contact.alumni_Name,
    alumni_firstname: contact.alumni_firstname,
    Alumni_LastName: contact.Alumni_LastName,
    Year_Graduated: contact.Year_Graduated,
    Program: contact.Program,
    Phone_Number: contact.Phone_Number,
    Email: contact.Email,
    Address: contact.Address,
    Occupation_Status: contact.Occupation_Status,
    college: contact.college,
    Status: contact.Status,
    expertise: contact.expertise || ''
  }))

  const csvContent = Papa.unparse(flatExport)
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = selectedContacts.value.length
    ? 'selected_contacts.csv'
    : 'contacts.csv'
  link.click()
}

const deleteContacts = async () => {
  if (!selectedContacts.value.length) return
  const { error } = await supabase
    .from('alumni_table')
    .delete()
    .in('alumni_ID', selectedContacts.value.map(Number))
  if (!error) {
    await fetchContacts()
    selectedContacts.value = []
  } else {
    console.error('Delete failed:', error.message)
  }
}

const fetchContacts = async () => {
  const { data: alumni, error: alumniError } = await supabase.from('alumni_table').select('*')
  const { data: collegeList } = await supabase.from('colleges').select('id, name')
  const { data: programList } = await supabase.from('programs').select('id, name')

  if (!alumniError && alumni) {
    contacts.value = alumni.map(a => {
      const college = collegeList.find(c => c.id === a.college)
      const program = programList.find(p => p.name === a.Program)

      return {
        ...a,
        collegeName: college?.name || a.college,
        programName: program?.name || a.Program
      }
    })
  } else {
    console.error('Error fetching contacts:', alumniError)
  }
}

const fetchExpertiseTags = async () => {
  const { data, error } = await supabase.from('expertise_tags').select('*')
  if (!error) expertiseOptions.value = data
}

onMounted(() => {
  fetchContacts()
  fetchExpertiseTags()
})
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
  width: 190px;
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
.sidebar-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 40px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-top: 80px;
  margin-bottom: 40px;
}

.logo img {
  width: 35px;
  padding: 4px;
  background-color: white;
  border-radius: 10px;
  object-fit: contain;
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
  padding: 12px;
  background-color: rgba(255, 255, 255, 0.1);
  color: white;
  border: none;
  border-radius: 14px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
}

.logout-btn:hover {
  background-color: rgba(255, 255, 255, 0.2);
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

.filter-toggle {
  padding: 12px 24px;
  border: 1px solid #FFD6DE;
  border-radius: 16px;
  font-size: 15px;
  background: white;
  color: #2D1E2F;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
  box-shadow: 0 4px 15px rgba(255, 75, 110, 0.08);
  display: flex;
  align-items: center;
}

.filter-toggle:hover {
  background-color: #FFF5F7;
  border-color: #FF4B6E;
}

.filter-menu {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  background: white;
  border: 1px solid #FFD6DE;
  border-radius: 16px;
  box-shadow: 0 4px 15px rgba(255, 75, 110, 0.08);
  min-width: 200px;
  padding: 8px 0;
  z-index: 1000;
}

.filter-item {
  padding: 12px 24px;
  font-size: 14px;
  color: #2D1E2F;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.filter-item:hover {
  background-color: #FFF5F7;
}

.submenu {
  position: absolute;
  left: 100%;
  top: 0;
  background: white;
  border: 1px solid #FFD6DE;
  border-radius: 16px;
  box-shadow: 0 4px 15px rgba(255, 75, 110, 0.08);
  min-width: 200px;
  padding: 8px 0;
  z-index: 1001; /* Higher than parent menu */
}

.submenu-item {
  padding: 12px 24px;
  font-size: 14px;
  color: #2D1E2F;
  cursor: pointer;
  transition: all 0.2s ease;
}

.submenu-item:hover {
  background-color: #FFF5F7;
}

.click-toggle-filter {
  position: relative;
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
/* --- Filter Dropdown Click-to-Toggle --- */
.filter-dropdown {
  position: relative;
  display: flex;
  justify-content: flex-end;
  margin-bottom: 30px;
  margin-right: 60px;
  z-index: 500;
}

.filter-label {
  padding: 14px 24px;
  background: white;
  border: 1px solid #FFD6DE;
  border-radius: 16px;
  cursor: pointer;
  font-size: 15px;
  font-weight: 500;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  user-select: none;
  transition: all 0.2s ease;
}

.filter-label:hover {
  background-color: #FFF5F7;
}

.filter-menu {
  position: absolute;
  top: 55px;
  right: 0;
  background: white;
  border: 1px solid #FFD6DE;
  border-radius: 16px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.08);
  min-width: 180px;
  padding: 10px 0;
}

.filter-item {
  position: relative;
  padding: 12px 20px;
  font-size: 14px;
  color: #2D1E2F;
  cursor: pointer;
  transition: background 0.2s ease;
}

.filter-item:hover {
  background-color: #FFF5F7;
}

.submenu {
  position: absolute;
  top: 0;
  left: auto;
  right: 100%;
  margin-right: 5px;
  background: white;
  border: 1px solid #FFD6DE;
  border-radius: 16px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.08);
  min-width: 160px;
  padding: 10px 0;
}

.submenu-item {
  padding: 10px 20px;
  font-size: 14px;
  color: #2D1E2F;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.2s ease;
}

.submenu-item:hover {
  background-color: #FFE0E5;
}
.submenu.left-side {
  left: auto;
  right: 100%;
  margin-left: 0;
  margin-right: 5px;
}
.reset-button {
  background-color: #fff0f5;
  color: #ff3e7f;
  border: 1px solid #ff3e7f;
  padding: 8px 16px;
  border-radius: 10px;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.3s ease; /* smooth animation */
  cursor: pointer;
  margin-left: 10px; /* small gap from search bar */
}

.reset-button:hover {
  background-color: #ff3e7f;
  color: white;
  transform: scale(1.05); /* slightly grow on hover */
  box-shadow: 0 2px 8px rgba(255, 62, 127, 0.3); /* soft pink shadow */
}

.reset-button-enter-active,
.reset-button-leave-active {
  transition: opacity 0.5s, transform 0.5s;
}

.reset-button-enter-from,
.reset-button-leave-to {
  opacity: 0;
  transform: translateX(10px);
}
</style>

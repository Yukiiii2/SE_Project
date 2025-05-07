<template>
  <div class="contact-management">
    <!-- Sidebar Toggle -->
    <button class="menu-btn" @click="toggleSidebar">
      {{ isSidebarOpen ? "✕" : "☰" }}
    </button>

    <!-- Sidebar -->
    <aside :class="{ open: isSidebarOpen }" class="sidebar">
      <div class="sidebar-header">
        <div class="logo">
          <img src="../assets/logo.jpg" alt="Logo" />
          <h2>Marian TBI Connect</h2>
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
      <h1>Archived Events</h1>

      <!-- Search Bar -->
      <div class="actions">
        <input v-model="searchQuery" type="text" placeholder="Search archived events..." class="search-bar" />
      </div>

      <!-- Archived Event Cards -->
<div class="events-grid">
  <div v-for="event in paginatedEvents" :key="event.id" class="event-card">
    <div class="event-date">
      <span class="day">{{ formatDateParts(event.dateFrom).day }}</span>
      <span class="month">{{ formatDateParts(event.dateFrom).month }}</span>
      <span class="year">{{ formatDateParts(event.dateFrom).year }}</span>
    </div>
    <div class="event-details">
      <h3>
        {{ event.name }}
        <span class="status-complete">Completed</span>
      </h3>
      <span class="event-time">
        <i class="fas fa-clock"></i>
        {{ formatDateParts(event.dateFrom).month }} {{ formatDateParts(event.dateFrom).day }} to
        {{ formatDateParts(event.dateTo).month }} {{ formatDateParts(event.dateTo).day }}
      </span>
      <span class="event-type">{{ formatEventType(event.event_type) }}</span>
      <span class="event-venue">
        <i class="fas fa-map-marker-alt"></i> {{ event.venue || 'No Venue' }}
      </span>
    </div>
  </div>
</div>

      <!-- Pagination -->
      <div class="pagination" v-if="totalPages > 1">
        <button @click="goToPage(currentPage - 1)" :disabled="currentPage === 1">Previous</button>
        <span>Page {{ currentPage }} of {{ totalPages }}</span>
        <button @click="goToPage(currentPage + 1)" :disabled="currentPage === totalPages">Next</button>
      </div>
    </div>
  </div>
</template>


<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../lib/supabaseClient'

const router = useRouter()
const isSidebarOpen = ref(false)
const searchQuery = ref('')
const currentPage = ref(1)
const pageSize = 6
const archivedEvents = ref([])

const toggleSidebar = () => isSidebarOpen.value = !isSidebarOpen.value

const handleLogout = () => {
  localStorage.removeItem('user')
  router.push('/')
}

const formatEventType = (type) =>
  type ? type.charAt(0).toUpperCase() + type.slice(1) : 'Unknown'

const formatDateParts = (dateStr) => {
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return { day: 'N/A', month: 'N/A', year: 'N/A' }
  return {
    day: date.getDate(),
    month: date.toLocaleString('default', { month: 'short' }).toUpperCase(),
    year: date.getFullYear()
  }
}

const filteredArchivedEvents = computed(() => {
  const search = searchQuery.value.toLowerCase()
  return archivedEvents.value.filter(event =>
    event.name.toLowerCase().includes(search) ||
    event.venue.toLowerCase().includes(search) ||
    formatEventType(event.event_type).toLowerCase().includes(search)
  )
})

const paginatedEvents = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredArchivedEvents.value.slice(start, start + pageSize)
})

const totalPages = computed(() =>
  Math.ceil(filteredArchivedEvents.value.length / pageSize)
)

const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) currentPage.value = page
}

const fetchArchivedEvents = async () => {
  const { data, error } = await supabase
    .from('events')
    .select('id, name, venue, date_from, date_to, event_type')
    .lte('date_to', new Date().toISOString())

  if (data) {
    archivedEvents.value = data.map(e => ({
      ...e,
      dateFrom: e.date_from,
      dateTo: e.date_to
    }))
  }

  if (error) console.error('Fetch archived events failed:', error)
}

onMounted(() => {
  fetchArchivedEvents()
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
  width: 180px;
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

/* Move "Alumni Connect" lower to avoid overlap with the button */
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
/* Search and Filter */
.search-bar {
  padding: 14px 18px;
  border: 1px solid #FFCCD4;
  border-radius: 14px;
  font-size: 16px;
  width: 100%;
  max-width: 300px;
  background: #FFE0E5;
  color: #FF1C55;
  outline: none;
}

/* Event Card Grid */
.events-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.event-card {
  background: white;
  border-radius: 20px;
  padding: 24px;
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 16px;
  border: 1px solid #FFCCD4;
  transition: all 0.3s ease;
  align-items: start;
}
.event-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(255, 75, 124, 0.15);
}

.event-date {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 14px;
  border-radius: 12px;
  background: #FFE0E5;
  min-width: 70px;
}
.event-date .day {
  font-size: 28px;
  font-weight: 700;
  color: #FF1C55;
}
.event-date .month {
  font-size: 14px;
  color: #FFB3C7;
  margin-top: 4px;
}

.event-details h3 {
  color: #FF1C55;
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 8px;
}
.event-time {
  color: #FFB3C7;
  font-size: 16px;
  display: flex;
  align-items: center;
  gap: 6px;
}
.event-type {
  display: inline-block;
  padding: 6px 14px;
  border-radius: 8px;
  background: #FFE0E5;
  color: #FF4B7C;
  font-size: 14px;
  margin-top: 8px;
  font-weight: 500;
}
.event-venue {
  font-size: 14px;
  color: #888;
  display: block;
  margin-top: 6px;
}

/* Pagination */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 32px;
  gap: 10px;
}

.pagination button {
  background-color: #FF4B7C;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s ease;
}
.pagination button:disabled {
  background-color: #FFC0CB;
  cursor: not-allowed;
}
.pagination span {
  font-weight: 600;
  color: #FF4B7C;
}

/* Responsive */
@media (max-width: 768px) {
  .main-content {
    margin-left: 0;
    padding: 20px;
  }

  .events-grid {
    grid-template-columns: 1fr;
  }
}
.status-complete {
  background-color: #4CAF50;
  color: white;
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 12px;
  margin-left: 8px;
}
</style>
<template>
  <div class="homepage">
    <!-- Sidebar -->
    <aside class="sidebar">
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
          <i class="fas fa-address-book"></i>
          <span>Contacts</span>
        </router-link>
        <router-link to="/events" class="nav-item active">
          <i class="fas fa-calendar"></i>
          <span>Events</span>
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
      <section class="stats-cards">
        <div class="card">
          <div class="card-icon pink">
            <i class="fas fa-calendar"></i>
          </div>
          <h3>Total Events</h3>
          <p>{{ events.length || 0 }}</p>
        </div>
        <div class="card">
          <div class="card-icon green">
            <i class="fas fa-user-check"></i>
          </div>
          <h3>Active Events</h3>
          <p>{{ activeEvents || 0 }}</p>
        </div>
        <div class="card">
          <div class="card-icon purple">
            <i class="fas fa-users"></i>
          </div>
          <h3>Total Attendees</h3>
          <p>{{ totalAttendees || 0 }}</p>
        </div>
      </section>

      <section class="events-section">
        <div class="section-header">
          <div>
            <h2>Event Management</h2>
            <p>View and manage your events</p>
          </div>
          <button class="create-button" @click="showCreateEventModal">
            <i class="fas fa-plus"></i> Create Event
          </button>
        </div>

        <div class="filter-bar">
          <div class="search-box">
            <i class="fas fa-search"></i>
            <input type="text" placeholder="Search events..." v-model="searchQuery" />
          </div>
          <select v-model="selectedEventType" class="filter-select">
            <option value="">All Types</option>
            <option v-for="type in eventTypes" :key="type" :value="type">{{ formatEventType(type) }}</option>
          </select>
        </div>

        <div class="events-grid">
          <div v-for="event in filteredEvents" :key="event.id" class="event-card">
            <div class="event-date">
              <span class="day">{{ formatDate(event.dateFrom).day }}</span>
              <span class="month">{{ formatDate(event.dateFrom).month }}</span>
              <span class="year">{{ formatDate(event.dateFrom).year }}</span>
            </div>
            <div class="event-details">
              <h3>{{ event.name }}</h3>
              <span class="event-time">
                <i class="fas fa-clock"></i>
                {{ formatDate(event.dateFrom).month }} {{ formatDate(event.dateFrom).day }} to
                {{ formatDate(event.dateTo).month }} {{ formatDate(event.dateTo).day }}
              </span>
              <span class="event-type">{{ formatEventType(event.event_type) }}</span>
              <span class="event-venue">
                <i class="fas fa-map-marker-alt"></i> {{ event.venue || 'No Venue' }}
              </span>
            </div>
            <div class="event-actions">
              <button class="delete-btn" @click="deleteEvent(event.id)">
                <i class="fas fa-trash"></i> Delete Event
              </button>
            </div>
          </div>
        </div>
      </section>

      <section class="calendar-section">
        <vue-cal
          :events="calendarEvents"
          default-view="week"
          :disable-views="['years', 'year', 'month']"
          @event-click="handleEventClick"
        >
          <template v-slot:event="{ event }">
            <div class="custom-event">
              <strong>{{ event.title }}</strong>
              <p>{{ event.content }}</p>
            </div>
          </template>
        </vue-cal>
      </section>
    </main>

    <!-- Create Event Modal -->
    <div v-if="isCreateModalVisible" class="modal">
      <div class="modal-content">
        <h2>Create New Event</h2>
        <form @submit.prevent="createEvent">
          <div class="form-group">
            <label>Event Name</label>
            <input v-model="newEvent.name" required />
          </div>
          <div class="form-group">
            <label>Venue</label>
            <input v-model="newEvent.venue" required />
          </div>
          <div class="form-group">
            <label>Date From</label>
            <input type="date" v-model="newEvent.dateFrom" required />
          </div>
          <div class="form-group">
            <label>Date To</label>
            <input type="date" v-model="newEvent.dateTo" required />
          </div>
          <div class="form-group">
            <label>Event Type</label>
            <div v-if="isAddingNewType">
              <input v-model="newEventType" placeholder="New type" />
              <button type="button" @click="confirmNewType">Confirm</button>
              <button type="button" @click="cancelNewType">Cancel</button>
            </div>
            <div v-else>
              <select v-model="newEvent.type" @change="checkAddNewType">
                <option v-for="type in eventTypes" :key="type" :value="type">
                  {{ formatEventType(type) }}
                </option>
                <option value="add-new">Add New Type</option>
              </select>
            </div>
          </div>
          <div class="form-group">
            <label>Invite Alumni</label>
            <div v-for="alumnus in alumni" :key="alumnus.id">
              <input type="checkbox" :value="alumnus.id" v-model="newEvent.invitedAlumni" />
              <span>{{ alumnus.name }} ({{ alumnus.email }})</span>
            </div>
          </div>
          <div class="modal-actions">
            <button type="button" @click="hideCreateEventModal">Cancel</button>
            <button type="submit">Create Event</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import VueCal from 'vue-cal'
import 'vue-cal/dist/vuecal.css'
import { supabase } from '../lib/supabaseClient'

const router = useRouter()
const events = ref([])
const calendarEvents = ref([])
const alumni = ref([])
const eventTypes = ref([])
const searchQuery = ref('')
const selectedEventType = ref('')
const isCreateModalVisible = ref(false)
const isAddingNewType = ref(false)
const newEventType = ref('')
const newEvent = ref({
  name: '',
  venue: '',
  dateFrom: '',
  dateTo: '',
  type: '',
  invitedAlumni: []
})

const formatEventType = (type) =>
  type ? type.charAt(0).toUpperCase() + type.slice(1) : 'Unknown'

const activeEvents = computed(() =>
  events.value.filter((e) => new Date(e.dateTo) >= new Date()).length
)

const totalAttendees = computed(() =>
  events.value.reduce((acc, e) => acc + (e.invited_count || 0), 0)
)

const filteredEvents = computed(() =>
  events.value.filter((event) => {
    const matchName = event.name
      ?.toLowerCase()
      .includes(searchQuery.value.toLowerCase())
    const matchType =
      !selectedEventType.value || event.event_type === selectedEventType.value
    return matchName && matchType
  })
)

const formatDate = (dateStr) => {
  const date = new Date(dateStr)
  if (isNaN(date.getTime()))
    return { day: 'N/A', month: 'N/A', year: 'N/A' }
  return {
    day: date.getDate(),
    month: date.toLocaleString('default', { month: 'short' }).toUpperCase(),
    year: date.getFullYear()
  }
}

const fetchEvents = async () => {
  const { data, error } = await supabase
    .from('events')
    .select('id, name, venue, date_from, date_to, event_type, invited_count')
  if (error || !data) return console.error('Error fetching events:', error)

  events.value = data.map((event) => ({
    id: event.id,
    name: event.name,
    venue: event.venue,
    dateFrom: event.date_from,
    dateTo: event.date_to,
    event_type: event.event_type,
    invited_count: event.invited_count
  }))

  calendarEvents.value = events.value.map((event) => ({
    title: event.name || 'Untitled',
    content: formatEventType(event.event_type),
    start: new Date(event.dateFrom),
    end: new Date(event.dateTo)
  }))
}

const fetchAlumni = async () => {
  const { data, error } = await supabase
    .from('alumni_table')
    .select('alumni_ID, alumni_Name, Email')
  if (!error && data) {
    alumni.value = data.map((a) => ({
      id: a.alumni_ID,
      name: a.alumni_Name,
      email: a.Email
    }))
  }
}

const fetchEventTypes = async () => {
  const { data } = await supabase.from('event_types').select('name')
  if (data) eventTypes.value = data.map((e) => e.name)
}

const showCreateEventModal = () => {
  isCreateModalVisible.value = true
}

const hideCreateEventModal = () => {
  isCreateModalVisible.value = false
  isAddingNewType.value = false
  newEventType.value = ''
  newEvent.value = {
    name: '',
    venue: '',
    dateFrom: '',
    dateTo: '',
    type: '',
    invitedAlumni: []
  }
}

const checkAddNewType = () => {
  if (newEvent.value.type === 'add-new') {
    isAddingNewType.value = true
    newEvent.value.type = ''
  }
}

const confirmNewType = async () => {
  if (!newEventType.value.trim()) return
  await supabase.from('event_types').insert([
    { name: newEventType.value.trim().toLowerCase() }
  ])
  await fetchEventTypes()
  newEvent.value.type = newEventType.value.trim().toLowerCase()
  isAddingNewType.value = false
  newEventType.value = ''
}

const cancelNewType = () => {
  isAddingNewType.value = false
  newEventType.value = ''
}

const createEvent = async () => {
  try {
    const invitedAlumni = [...newEvent.value.invitedAlumni] // Ensure it's populated
    const { data: createdEvent, error: eventError } = await supabase
      .from('events')
      .insert([{
        name: newEvent.value.name,
        venue: newEvent.value.venue,
        date_from: newEvent.value.dateFrom,
        date_to: newEvent.value.dateTo,
        event_type: newEvent.value.type,
        invited_count: invitedAlumni.length // ✅ Insert directly with count
      }])
      .select()

    if (eventError || !createdEvent?.[0])
      throw new Error(eventError?.message || 'Insert failed')

    const eventId = createdEvent[0].id

    await supabase.from('calendar_events').insert([{
      event_id: eventId,
      start: new Date(newEvent.value.dateFrom).toISOString(),
      end: new Date(newEvent.value.dateTo).toISOString(),
      title: newEvent.value.name,
      content: newEvent.value.type
    }])

    await fetchEvents()
    hideCreateEventModal()
    alert('Event created successfully!')
  } catch (err) {
    console.error('Create event failed:', err)
    alert('Something went wrong while creating the event.')
  }
}

const deleteEvent = async (id) => {
  const { error } = await supabase.from('events').delete().eq('id', id)
  if (!error) await fetchEvents()
}

const handleLogout = () => {
  localStorage.removeItem('user')
  router.push('/')
}

const handleEventClick = ({ event }) => {
  if (!event || !event.title) {
    console.warn('Event object missing or malformed:', event)
    return
  }
  alert(`Event: ${event.title}\nType: ${event.content}`)
}

onMounted(() => {
  fetchAlumni()
  fetchEventTypes()
  fetchEvents()
})
</script>



<style scoped>
/* Reset & Base */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
body, html {
  overflow-x: hidden;
  width: 100%;
}
.homepage {
  display: flex;
  min-height: 100vh;
  background-color: #fff5f7;
  font-family: 'Inter', sans-serif;
  overflow: hidden;
}

/* Sidebar */
.sidebar {
  position: fixed;
  left: 0; top: 0; bottom: 0;
  width: 280px;
  background: linear-gradient(180deg, #ff4b7c, #ff1c55);
  padding: 30px;
  color: white;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  z-index: 100;
}
.logo {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 40px;
}
.logo img {
  width: 60px;
  filter: brightness(0) invert(1);
}
.logo h2 {
  font-size: 24px;
  color: white;
}
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
  font-size: 18px;
  transition: all 0.3s ease;
}
.nav-item:hover, .nav-item.active {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}
.logout {
  display: flex;
  align-items: center;
  gap: 12px;
  color: white;
  background-color: #ff1c55;
  padding: 12px;
  border-radius: 14px;
  font-size: 18px;
  transition: all 0.3s ease;
}
.logout:hover {
  background: #ff4b7c;
}

/* Main Content */
.main-content {
  margin-left: 280px;
  padding: 40px;
  width: calc(100% - 280px);
  overflow-y: auto;
}

/* Stats Cards */
.stats-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  margin-bottom: 24px;
}
.card {
  background: white;
  padding: 32px;
  border-radius: 20px;
  text-align: center;
  box-shadow: 0 4px 20px rgba(255, 75, 124, 0.1);
}
.card-icon {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  font-size: 28px;
  color: white;
}
.card-icon.pink { background: linear-gradient(135deg, #ff4b7c, #ff8faf); }
.card-icon.green { background: linear-gradient(135deg, #ff6b98, #ff97b8); }
.card-icon.purple { background: linear-gradient(135deg, #ff4b7c, #ff799e); }
.card h3 {
  color: black;
  font-size: 18px;
  margin-bottom: 8px;
}
.card p {
  color: black;
  font-size: 28px;
  font-weight: 700;
}
/* Events Section */
.events-section {
  background: white;
  padding: 32px;
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(255, 75, 124, 0.1);
  margin-bottom: 32px;
}
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #ffe0e5;
}
.section-header h2 {
  color: #ff1c55;
  font-size: 24px;
  font-weight: 600;
}
.section-header p {
  color: #ffb3c7;
  font-size: 16px;
  margin: 4px 0 0;
}
.create-button {
  background: #ff4b7c;
  color: white;
  border: none;
  padding: 14px 28px;
  border-radius: 14px;
  font-weight: 500;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
}
.create-button:hover {
  background: #ff1c55;
  transform: translateY(-2px);
}

/* Filter */
.filter-bar {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}
.search-box {
  flex: 1;
  display: flex;
  align-items: center;
  background: #ffe0e5;
  padding: 14px 18px;
  border-radius: 14px;
  border: 1px solid #ffccd4;
}
.search-box i {
  color: #ffb3c7;
  margin-right: 12px;
}
.search-box input {
  background: transparent;
  border: none;
  outline: none;
  width: 100%;
  color: #ff1c55;
  font-size: 16px;
}
.filter-select {
  padding: 14px 18px;
  border: 1px solid #ffccd4;
  border-radius: 14px;
  color: #ff1c55;
  background: white;
  min-width: 200px;
  font-size: 16px;
  cursor: pointer;
}

/* Events Grid */
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
  border: 1px solid #ffccd4;
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
  background: #ffe0e5;
  min-width: 70px;
}
.event-date .day {
  font-size: 28px;
  font-weight: 700;
  color: #ff1c55;
}
.event-date .month {
  font-size: 14px;
  color: #ffb3c7;
  margin-top: 4px;
}
.event-details h3 {
  color: #ff1c55;
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 8px;
}
.event-time {
  color: #ffb3c7;
  font-size: 16px;
  display: flex;
  align-items: center;
  gap: 6px;
}
.event-type {
  display: inline-block;
  padding: 6px 14px;
  border-radius: 8px;
  background: #ffe0e5;
  color: #ff4b7c;
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
.event-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  justify-content: center;
}
.delete-btn {
  background: #ff4b7c;
  color: white;
  border: none;
  padding: 10px 18px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.3s ease;
}
.delete-btn:hover {
  background: #ff1c55;
}

/* Calendar */
.calendar-section {
  margin-top: 32px;
  background: white;
  padding: 24px;
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(255, 75, 124, 0.1);
}
.vuecal__cell {
  font-family: 'Inter', sans-serif !important;
}
.vuecal__event {
  white-space: normal !important;
  word-break: break-word;
  padding: 6px 8px;
  font-size: 13px;
  border-radius: 8px;
  line-height: 1.3;
  background-color: #ffccd4 !important;
  color: #333 !important;
  font-weight: 500;
  display: flex;
  flex-direction: column;
  justify-content: center;
  text-align: left;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.vuecal__event strong {
  font-size: 13px;
  color: #ff1c55;
  font-weight: bold;
}

.vuecal__event p {
  margin: 2px 0 0 0;
  font-size: 12px;
  color: #ff4b7c;
}

/* Modal */
.modal {
  position: fixed;
  top: 0; left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}
.modal-content {
  background: white;
  padding: 32px;
  border-radius: 20px;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
}
.form-group {
  margin-bottom: 20px;
}
.form-group label {
  font-weight: 600;
  color: #ff1c55;
  margin-bottom: 8px;
  display: block;
}
.form-group input,
.form-group select {
  width: 100%;
  padding: 12px 14px;
  border-radius: 10px;
  border: 1px solid #ffccd4;
  font-size: 14px;
  background: #ffe0e5;
}
.new-type-input {
  width: 100%;
  margin-top: 10px;
}
.confirm-btn, .cancel-btn {
  margin-top: 10px;
  padding: 10px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
}
.confirm-btn {
  background: #ff4b7c;
  color: white;
  border: none;
}
.cancel-btn {
  background: #ffe0e5;
  color: #ff1c55;
  border: none;
}
.confirm-btn:hover {
  background: #ff1c55;
}
.cancel-btn:hover {
  background: #ffccd4;
}
.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}
.modal-actions button {
  padding: 12px 24px;
  border-radius: 10px;
  font-size: 14px;
  border: none;
  cursor: pointer;
  font-weight: 600;
}
.modal-actions button:first-child {
  background: #ffe0e5;
  color: #ff1c55;
}
.modal-actions button:last-child {
  background: #ff4b7c;
  color: white;
}
.modal-actions button:last-child:hover {
  background: #ff1c55;
}

/* Scrollbar */
::-webkit-scrollbar {
  width: 8px;
}
::-webkit-scrollbar-track {
  background: #ffe0e5;
}
::-webkit-scrollbar-thumb {
  background: #ff4b7c;
  border-radius: 4px;
}

/* Responsive */
@media (max-width: 1024px) {
  .stats-cards {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (max-width: 768px) {
  .stats-cards,
  .events-grid {
    grid-template-columns: 1fr;
  }
  .main-content {
    padding: 20px;
    margin-left: 0;
    width: 100%;
  }
  .sidebar {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    position: sticky;
    top: 0;
    width: 100%;
    height: auto;
    padding: 15px;
  }
  .nav-links {
    flex-direction: row;
    gap: 10px;
  }
  .logo h2, .nav-item span, .logout span {
    display: none;
  }
  .nav-item, .logout {
    padding: 8px;
  }
}
</style>

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
            <i class="fas fa-home"></i><span>Home</span>
          </router-link>
          <router-link to="/contacts" class="nav-item">
            <i class="fas fa-address-book"></i><span>Contacts</span>
          </router-link>
          <router-link to="/events" class="nav-item active">
            <i class="fas fa-calendar"></i><span>Events</span>
          </router-link>
          <router-link to="/approve-requests" class="nav-item">
            <i class="fas fa-envelope"></i><span>Requests</span>
          </router-link>
        </nav>
        <a href="#" class="logout" @click.prevent="handleLogout">
          <i class="fas fa-sign-out-alt"></i><span>Logout</span>
        </a>
      </aside>

      <!-- Main Content -->
      <main class="main-content">
        <!-- Stats -->
        <section class="stats-cards">
          <div class="card">
            <div class="card-icon pink"><i class="fas fa-calendar"></i></div>
            <h3>Total Events</h3>
            <p>{{ events.length || 0 }}</p>
          </div>
          <div class="card">
            <div class="card-icon green"><i class="fas fa-user-check"></i></div>
            <h3>Active Events</h3>
            <p>{{ activeEvents || 0 }}</p>
          </div>
          <div class="card">
            <div class="card-icon purple"><i class="fas fa-users"></i></div>
            <h3>Total Attendees</h3>
            <p>{{ totalAttendees || 0 }}</p>
          </div>
        </section>

        <!-- Event List & Filter -->
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
              <option v-for="type in eventTypes" :key="type" :value="type">
                {{ formatEventType(type) }}
              </option>
            </select>
          </div>

          <!-- Event Cards -->
          <div class="events-grid">
            <div v-for="event in paginatedEvents" :key="event.id" class="event-card">
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

          <!-- Pagination -->
          <div class="pagination" v-if="totalPages > 1">
            <button @click="goToPage(currentPage - 1)" :disabled="currentPage === 1">Previous</button>
            <span>Page {{ currentPage }} of {{ totalPages }}</span>
            <button @click="goToPage(currentPage + 1)" :disabled="currentPage === totalPages">Next</button>
          </div>
        </section>

        <!-- Calendar -->
  <section class="calendar-section">
    <vue-cal
    style="height: 600px"
    :events="calendarEvents"
    default-view="week"
    :disable-views="['years', 'year', 'month']"
    @event-click="handleEventClick"
  >
    <template #event="props">
      <div class="custom-event" @click.stop="handleEventClick(props)">
        <strong>{{ props.event.title || 'No Title' }}</strong>
        <p>{{ props.event.content }}</p>
      </div>
    </template>
  </vue-cal>
  </section>
      </main>

      <!-- Calendar Event Detail Modal -->
      <div v-if="isEventDetailModalVisible" class="modal">
        <div class="modal-content">
      <h2>{{ selectedEventDetail.name }}</h2>
      <p><strong>Venue:</strong> {{ selectedEventDetail.venue || 'N/A' }}</p>
      <p><strong>Event Type:</strong> {{ formatEventType(selectedEventDetail.event_type) }}</p>
      <p><strong>Date From:</strong> {{ formatDate(selectedEventDetail.dateFrom).month }} {{ formatDate(selectedEventDetail.dateFrom).day }}, {{ formatDate(selectedEventDetail.dateFrom).year }}</p>
      <p><strong>Date To:</strong> {{ formatDate(selectedEventDetail.dateTo).month }} {{ formatDate(selectedEventDetail.dateTo).day }}, {{ formatDate(selectedEventDetail.dateTo).year }}</p>
      <div class="modal-actions">
        <button @click="isEventDetailModalVisible = false">Close</button>
          </div>
        </div>
      </div>

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
              <input type="date" v-model="newEvent.dateFrom" :min="today" required />
            </div>
            <div class="form-group">
              <label>Date To</label>
              <input type="date" v-model="newEvent.dateTo" :min="newEvent.dateFrom || today" required />
            </div>
            <div class="form-group">
              <label>Event Type</label>
              <div v-if="isAddingNewType" class="new-type-input">
  <input v-model="newEventType" placeholder="New type" class="new-type-field" />
  <div class="new-type-buttons">
    <button type="button" class="confirm-button" @click="confirmNewType">Confirm</button>
    <button type="button" class="cancel-button" @click="cancelNewType">Cancel</button>
  </div>
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
  
  <!-- Add Searchbar -->
  <div class="search-invite">
    <i class="fas fa-search"></i>
    <input type="text" v-model="inviteSearch" placeholder="Search alumni..." />
  </div>

  <div class="invite-alumni-scroll">
    <div v-for="alumnus in filteredAlumni" :key="alumnus.id" class="invite-option">
      <input type="checkbox" :value="alumnus.id" v-model="newEvent.invitedAlumni" />
      <span>{{ alumnus.name }} ({{ alumnus.email }})</span>
                </div>
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
  const inviteSearch = ref('')
  const eventTypes = ref([])

  const today = new Date().toISOString().split('T')[0]
  const searchQuery = ref('')
  const selectedEventType = ref('')
  const currentPage = ref(1)
  const pageSize = 6

  const isCreateModalVisible = ref(false)
  const isAddingNewType = ref(false)
  const newEventType = ref('')
  const isEventDetailModalVisible = ref(false)
  const selectedEventDetail = ref(null)

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
      const matchName = event.name?.toLowerCase().includes(searchQuery.value.toLowerCase())
      const matchVenue = event.venue?.toLowerCase().includes(searchQuery.value.toLowerCase())
      const matchTypeText = formatEventType(event.event_type).toLowerCase().includes(searchQuery.value.toLowerCase())
      const matchType = !selectedEventType.value || event.event_type === selectedEventType.value
      return (matchName || matchVenue || matchTypeText) && matchType
    })
  )

  const paginatedEvents = computed(() => {
    const start = (currentPage.value - 1) * pageSize
    return filteredEvents.value.slice(start, start + pageSize)
  })

  const totalPages = computed(() =>
    Math.ceil(filteredEvents.value.length / pageSize)
  )

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages.value) currentPage.value = page
  }

  const formatDate = (dateStr) => {
    const date = new Date(dateStr)
    if (isNaN(date.getTime())) return { day: 'N/A', month: 'N/A', year: 'N/A' }
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

    events.value = data
      .map((event) => ({
        id: event.id,
        name: event.name,
        venue: event.venue,
        dateFrom: event.date_from,
        dateTo: event.date_to,
        event_type: event.event_type,
        invited_count: event.invited_count
      }))
      .sort((a, b) => new Date(a.dateFrom) - new Date(b.dateFrom)) // ✅ soonest first

    calendarEvents.value = events.value.map((event) => ({
      id: event.id,
      title: event.name || 'Untitled',
      content: formatEventType(event.event_type),
      start: new Date(event.dateFrom),
      end: new Date(event.dateTo),
      venue: event.venue,
      event_type: event.event_type,
      dateFrom: event.dateFrom,
      dateTo: event.dateTo
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
  const filteredAlumni = computed(() => {
  const keyword = inviteSearch.value.toLowerCase()
  return alumni.value.filter(a =>
    a.name.toLowerCase().includes(keyword) ||
    a.email.toLowerCase().includes(keyword)
  )
})

  const fetchEventTypes = async () => {
    const { data } = await supabase.from('event_types').select('name')
    if (data) eventTypes.value = [...new Set(data.map((e) => e.name))]
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
      const invitedAlumni = [...newEvent.value.invitedAlumni]
      const { data: createdEvent, error: eventError } = await supabase
        .from('events')
        .insert([{
          name: newEvent.value.name,
          venue: newEvent.value.venue,
          date_from: newEvent.value.dateFrom,
          date_to: newEvent.value.dateTo,
          event_type: newEvent.value.type,
          invited_count: invitedAlumni.length
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
  if (!error) {
    await fetchEvents()

    // After fetching events again, check if the current page is now empty
    const start = (currentPage.value - 1) * pageSize
    const currentItems = filteredEvents.value.slice(start, start + pageSize)

    if (currentItems.length === 0 && currentPage.value > 1) {
      // Go back one page if no items left
      currentPage.value -= 1
    }
  }
}
  const handleLogout = () => {
    localStorage.removeItem('user')
    router.push('/')
  }

  const handleEventClick = (eventObject) => {
    const event = eventObject?.event

    if (!event || !event.title) {
      console.warn('Missing event data:', event)
      return
    }

    selectedEventDetail.value = {
      name: event.title,
      venue: event.venue,
      dateFrom: event.dateFrom,
      dateTo: event.dateTo,
      event_type: event.event_type
    }

    isEventDetailModalVisible.value = true
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
  left: 0;
  top: 0;
  bottom: 0;
  width: 250px;
  background: linear-gradient(180deg, #ff4b7c 0%, #ff1c55 100%);
  padding: 30px;
  color: white;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  z-index: 100;
}

.logo {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-top: 80px;
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

.nav-links {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin: 20px 0;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #ffb3c7;
  padding: 14px;
  border-radius: 16px;
  text-decoration: none;
  transition: all 0.3s ease;
  font-weight: 500;
}

.nav-item:hover,
.nav-item.active {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  transform: translateX(5px);
}

.logout {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #ffffff;
  background-color: #ff1c55;
  text-decoration: none;
  padding: 12px;
  border-radius: 14px;
  margin-top: auto;
  transition: all 0.3s ease;
}

.logout:hover {
  background: #ff4b7c;
}

/* Update main content to match sidebar width */
.main-content {
  margin-left: 220px;
  padding: 40px;
  width: calc(100% - 220px);
  overflow-y: auto;
}

/* Responsive styles for sidebar */
@media (max-width: 768px) {
  .sidebar {
    position: sticky;
    top: 0;
    width: 100%;
    height: auto;
    padding: 15px;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }

  .nav-links {
    flex-direction: row;
    gap: 10px;
  }

  .logo {
    margin: 0;
  }

  .logo h2 {
    display: none;
  }

  .nav-item span,
  .logout span {
    display: none;
  }

  .nav-item,
  .logout {
    justify-content: center;
    padding: 8px;
  }

  .main-content {
    margin-left: 0;
    width: 100%;
    padding: 20px;
  }
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
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 10px;
}

.new-type-field {
  padding: 8px 12px;
  border: 2px solid #ff4d94;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
}

.new-type-buttons {
  display: flex;
  gap: 10px;
  justify-content: center;
}

.confirm-button {
  background-color: #ff4d94;
  color: white;
  border: none;
  padding: 8px 20px;
  border-radius: 8px;
  font-weight: bold;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.confirm-button:hover {
  background-color: #ff3380;
}

.cancel-button {
  background-color: transparent;
  border: 2px solid #ff4d94;
  color: #ff4d94;
  padding: 8px 20px;
  border-radius: 8px;
  font-weight: bold;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.cancel-button:hover {
  background-color: #ff4d94;
  color: white;
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
/* Modern scrollbar styles */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #ffe0e5;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: #ff4b7c;
  border-radius: 4px;
}

/* Update the invite-alumni-scroll styles */
.invite-alumni-scroll {
  max-height: 250px;
  overflow-y: auto;
  border: 1px solid #ffe0e5;
  border-radius: 12px;
  padding: 12px;
  background: #fff;
  margin-top: 8px;
  margin-bottom: 16px;
}

.invite-option {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px;
  transition: background-color 0.3s ease;
}

.invite-option:hover {
  background-color: #fff5f7;
  border-radius: 8px;
}

.invite-option input[type="checkbox"] {
  accent-color: #ff4b7c;
  width: 16px;
  height: 16px;
  cursor: pointer;
}

.invite-option span {
  color: #333;
  font-size: 14px;
}
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}
.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  text-align: center;
}
.modal-content h2 {
  margin-bottom: 1rem;
}
.modal-actions button {
  margin-top: 1rem;
  padding: 0.5rem 1.5rem;
  background-color: #f74e91;
  border: none;
  color: white;
  border-radius: 8px;
  cursor: pointer;
}
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 20px;
  gap: 10px;
}

.pagination button {
  background-color: #FF5C8E; /* same as your "Delete" and "Create" button color */
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: background-color 0.3s ease;
}

.pagination button:disabled {
  background-color: #FFC0CB; /* softer pink for disabled */
  cursor: not-allowed;
}

.pagination span {
  font-weight: 600;
  color: #FF5C8E; /* matching the text color */
}
.confirm-button {
  background-color: #ff4d94; /* Same pink */
  color: white;
  border: none;
  padding: 8px 16px;
  margin-right: 10px;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.confirm-button:hover {
  background-color: #ff3380; /* Slightly darker pink on hover */
}

.cancel-button {
  background-color: transparent;
  color: #ff4d94;
  border: 2px solid #ff4d94;
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s ease, color 0.3s ease;
}

.cancel-button:hover {
  background-color: #ff4d94;
  color: white;
}
.invite-search-box {
  display: flex;
  align-items: center;
  background-color: #ffe4ec; /* Pink background same as Event Management */
  padding: 8px 12px;
  border-radius: 12px;
  margin-bottom: 10px;
}

.invite-search-box i {
  color: #ff4b7e; /* Matching pink icon color */
  margin-right: 8px;
}

.invite-search-box input {
  flex-grow: 1;
  border: none;
  outline: none;
  background: transparent;
  font-size: 14px;
  color: #333;
}
</style>

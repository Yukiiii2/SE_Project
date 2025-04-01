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
        <router-link to="/archive" class="nav-item">
          <i class="fas fa-archive"></i>
          <span>Archive</span>
        </router-link>
        <router-link to="/requests" class="nav-item">
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
          <p>{{ events.length }}</p>
        </div>
        <div class="card">
          <div class="card-icon green">
            <i class="fas fa-user-check"></i>
          </div>
          <h3>Active Events</h3>
          <p>{{ activeEvents }}</p>
        </div>
        <div class="card">
          <div class="card-icon purple">
            <i class="fas fa-users"></i>
          </div>
          <h3>Total Attendees</h3>
          <p>{{ totalAttendees }}</p>
        </div>
      </section>

      <!-- Events Section -->
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
            </div>
            <div class="event-details">
              <h3>{{ event.name }}</h3>
              <span class="event-time">
                <i class="fas fa-clock"></i> {{ event.dateFrom }} to {{ event.dateTo }}
              </span>
              <span class="event-type">{{ formatEventType(event.type) }}</span>
              <span class="event-venue"><i class="fas fa-map-marker-alt"></i> {{ event.venue }}</span>
            </div>
            <div class="event-actions">
              <button class="delete-btn" @click="deleteEvent(event.id)">
                <i class="fas fa-trash"></i> Delete Event
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- Calendar View Section -->
      <section class="calendar-section">
        <vue-cal
          :events="calendarEvents"
          :disable-views="['years', 'year', 'month']"
          default-view="week"
          @event-click="handleEventClick"
          :on-event-create="false"
          :on-event-drag="false"
          :on-event-resize="false"
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
            <input type="text" v-model="newEvent.name" required />
          </div>
          <div class="form-group">
            <label>Venue</label>
            <input type="text" v-model="newEvent.venue" required />
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
            <select v-model="newEvent.type" required>
              <option v-for="type in eventTypes" :key="type" :value="type">{{ formatEventType(type) }}</option>
            </select>
            <input type="text" v-model="newEventType" placeholder="Add new type" />
            <button type="button" @click="addEventType">Add Type</button>
          </div>
          <div class="form-group">
            <label>Invite Alumni</label>
            <div class="alumni-list">
              <div v-for="alumnus in alumni" :key="alumnus.id">
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

<script>
import VueCal from 'vue-cal';
import 'vue-cal/dist/vuecal.css';

export default {
  name: 'EventManagement',
  components: { VueCal },
  data() {
    return {
      events: [],
      alumni: [
        { id: 1, name: 'John Doe', email: 'john@example.com' },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
        { id: 3, name: 'Emily Johnson', email: 'emily@example.com' }
      ],
      isCreateModalVisible: false,
      searchQuery: '',
      selectedEventType: '',
      activeEvents: 2,
      totalAttendees: 45,
      eventTypes: ['major', 'minor', 'research', 'mentorship'],
      newEventType: '',
      newEvent: {
        name: '',
        venue: '',
        dateFrom: '',
        dateTo: '',
        type: '',
        invitedAlumni: []
      }
    };
  },
  computed: {
    filteredEvents() {
      return this.events.filter(event => {
        const matchName = event.name.toLowerCase().includes(this.searchQuery.toLowerCase());
        const matchType = !this.selectedEventType || event.type === this.selectedEventType;
        return matchName && matchType;
      });
    },
    calendarEvents() {
      return this.events.map(event => ({
        start: `${event.dateFrom}`,
        end: `${event.dateTo}`,
        title: event.name,
        content: event.type
      }));
    }
  },
  methods: {
    showCreateEventModal() {
      this.isCreateModalVisible = true;
    },
    hideCreateEventModal() {
      this.isCreateModalVisible = false;
      this.newEvent = { name: '', venue: '', dateFrom: '', dateTo: '', type: '', invitedAlumni: [] };
    },
    createEvent() {
      const event = { ...this.newEvent, id: Date.now() };
      this.events.push(event);
      this.hideCreateEventModal();
    },
    addEventType() {
      const type = this.newEventType.trim().toLowerCase();
      if (type && !this.eventTypes.includes(type)) {
        this.eventTypes.push(type);
        this.newEventType = '';
      }
    },
    deleteEvent(id) {
      this.events = this.events.filter(e => e.id !== id);
    },
    handleEventClick(event) {
      alert(`Event: ${event.title}`);
    },
    formatDate(dateStr) {
      const date = new Date(dateStr);
      return {
        day: date.getDate(),
        month: date.toLocaleString('default', { month: 'short' }).toUpperCase()
      };
    },
    formatEventType(type) {
      return type.charAt(0).toUpperCase() + type.slice(1);
    },
    handleLogout() {
      localStorage.removeItem('user');
      this.$router.push('/');
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

.homepage {
  display: flex;
  min-height: 100vh;
  background-color: #fff5f7;
  font-family: 'Inter', sans-serif;
  overflow: hidden;
  width: 100%;
  position: relative;
  margin: 0;
  padding: 0;
}

/* Sidebar Styles */
.sidebar {
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  width: 280px;
  background: linear-gradient(180deg, #ff4b7c 0%, #ff1c55 100%);
  padding: 30px;
  color: white;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  z-index: 100;
  margin: 0;
}

.logo {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 40px;
}

.logo img {
  width: 60px;
  height: auto;
  filter: brightness(0) invert(1);
}

.logo h2 {
  font-size: 24px;
  font-weight: 600;
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
  transition: all 0.3s ease;
  font-size: 18px;
}

.nav-item:hover, .nav-item.active {
  background: rgba(255, 255, 255, 0.2);
  color: white;
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
  font-size: 18px;
}

.logout:hover {
  background: #ff4b7c;
}

/* Main Content Styles */
.main-content {
  flex: 1;
  margin-left: 280px;
  padding: 40px;
  overflow-y: auto;
  min-width: 0;
  width: calc(100% - 280px);
}

/* Stats Cards Section */
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
  box-shadow: 0 4px 20px rgba(255, 75, 124, 0.1);
  text-align: center;
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

.card-icon.pink {
  background: linear-gradient(135deg, #ff4b7c, #ff8faf);
}

.card-icon.green {
  background: linear-gradient(135deg, #ff6b98, #ff97b8);
}

.card-icon.purple {
  background: linear-gradient(135deg, #ff4b7c, #ff799e);
}

.card h3 {
  color: black;
  font-size: 18px;
  margin-bottom: 8px;
}

.card p {
  color: black;
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 0;
}

/* Events Section Styles */
.events-section {
  background: white;
  padding: 32px;
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(255, 75, 124, 0.1);
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
  margin: 0;
}

.section-header p {
  color: #ffb3c7;
  font-size: 16px;
  margin: 4px 0 0 0;
}

.create-button {
  background: #ff4b7c;
  color: white;
  border: none;
  padding: 14px 28px;
  border-radius: 14px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
  font-size: 16px;
}

.create-button:hover {
  background: #ff1c55;
  transform: translateY(-2px);
}

/* Filter Bar Styles */
.filter-bar {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
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
  border: none;
  outline: none;
  background: transparent;
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

/* Events Grid Styles */
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
  line-height: 1;
}

.event-date .month {
  font-size: 14px;
  color: #ffb3c7;
  margin-top: 4px;
}

.event-details {
  flex: 1;
}

.event-details h3 {
  color: #ff1c55;
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 8px 0;
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

.event-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  justify-content: center;
}

.invite-btn, .delete-btn {
  background: #ff4b7c;
  color: white;
  border: none;
  padding: 10px 18px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 16px;
  font-weight: 500;
  transition: all 0.3s ease;
  white-space: nowrap;
  width: 100%;
  justify-content: center;
}

.invite-btn:hover, .delete-btn:hover {
  background: #ff1c55;
  transform: translateY(-2px);
}

/* Modal Styles */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 40px;
  border-radius: 20px;
  width: 100%;
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 8px 25px rgba(255, 75, 124, 0.15);
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #ff1c55;
  font-weight: 600;
  font-size: 16px;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 14px;
  border: 1px solid #ffccd4;
  border-radius: 14px;
  font-size: 16px;
  color: #ff1c55;
  background: #ffe0e5;
  transition: all 0.3s ease;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #ff4b7c;
  background: white;
}

.add-type-btn {
  background: #ff4b7c;
  color: white;
  border: none;
  padding: 10px 18px;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
  font-size: 14px;
  margin-top: 10px;
}

.add-type-btn:hover {
  background: #ff1c55;
  transform: translateY(-2px);
}

.alumni-list {
  max-height: 300px;
  overflow-y: auto;
  padding-right: 16px;
  border: 1px solid #ffccd4;
  border-radius: 14px;
  background: #ffe0e5;
}

.alumni-list div {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.alumni-list div:hover {
  background: #ffccd4;
}

.alumni-list input[type="checkbox"] {
  width: 18px;
  height: 18px;
  border: 2px solid #ff4b7c;
  border-radius: 4px;
  cursor: pointer;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 16px;
  margin-top: 24px;
}

.cancel-btn {
  background: #ffe0e5;
  color: #ff1c55;
  border: none;
  padding: 14px 28px;
  border-radius: 14px;
  cursor: pointer;
  font-weight: 500;
  font-size: 16px;
  transition: all 0.3s ease;
}

.cancel-btn:hover {
  background: #ffccd4;
}

.submit-btn {
  background: #ff4b7c;
  color: white;
  border: none;
  padding: 14px 28px;
  border-radius: 14px;
  cursor: pointer;
  font-weight: 500;
  font-size: 16px;
  transition: all 0.3s ease;
}

.submit-btn:hover {
  background: #ff1c55;
}

/* Responsive Styles */
@media (max-width: 1024px) {
  .stats-cards {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .events-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

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
    margin-bottom: 0;
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

  .nav-item i, 
  .logout i {
    font-size: 20px;
    margin: 0;
  }

  .main-content {
    margin-left: 0;
    width: 100%;
    padding: 20px;
  }

  .stats-cards {
    grid-template-columns: 1fr;
  }

  .events-grid {
    grid-template-columns: 1fr;
  }

  .event-card {
    grid-template-columns: auto 1fr;
  }

  .event-actions {
    grid-column: 1 / -1;
    flex-direction: row;
    justify-content: flex-end;
  }

  .filter-bar {
    flex-direction: column;
  }

  .modal-content {
    margin: 20px;
    padding: 20px;
  }
}

@media (max-width: 480px) {
  .nav-item, 
  .logout {
    padding: 8px;
  }

  .card {
    padding: 15px;
  }

  .chart-container {
    padding: 15px;
    min-height: 250px;
  }
}

@media (max-width: 320px) {
  .stats-cards {
    grid-template-columns: 1fr;
  }

  .nav-links {
    gap: 5px;
  }
}

@media screen and (orientation: landscape) and (max-height: 500px) {
  .homepage {
    height: auto;
    min-height: 100vh;
  }

  .main-content {
    height: auto;
  }
}

@media screen and (min-width: 2000px) {
  .homepage {
    max-width: 2000px;
    margin: 0 auto;
  }
}

/* Modern scrollbar */
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
</style>
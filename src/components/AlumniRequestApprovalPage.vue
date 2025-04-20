<template>
  <div class="approval-page">
    <button class="menu-btn" @click="toggleSidebar">
      {{ isSidebarOpen ? "✕" : "☰" }}
    </button>

    <!-- Sidebar -->
    <aside :class="{ open: isSidebarOpen }" class="sidebar">
      <div class="logo">
        <img src="../assets/logo.png" alt="Logo" />
        <h2>Alumni Connect</h2>
      </div>
      <nav class="nav-links">
        <router-link to="/home" class="nav-item"><i class="fas fa-home"></i><span>Home</span></router-link>
        <router-link to="/contacts" class="nav-item"><i class="fas fa-cog"></i><span>Contacts</span></router-link>
        <router-link to="/events" class="nav-item"><i class="fas fa-calendar"></i><span>Events</span></router-link>
        <router-link to="/approve-requests" class="nav-item active"><i class="fas fa-envelope"></i><span>Requests</span></router-link>
      </nav>
      <a href="#" class="logout" @click.prevent="handleLogout"><i class="fas fa-sign-out-alt"></i><span>Logout</span></a>
    </aside>

    <!-- Main Content -->
    <main class="main-content">
      <section class="filters">
        <h2>Filter Requests</h2>
        <div class="form-group">
          <label for="status">Status</label>
          <select id="status" v-model="filters.status">
            <option value="">All</option>
            <option value="Pending">Pending</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
        <div class="form-group">
          <label for="dateRequested">Date Requested</label>
          <input type="date" id="dateRequested" v-model="filters.dateRequested" />
        </div>
        <button @click="applyFilters">Apply Filters</button>
      </section>

      <section class="requests-dashboard">
        <h2>All Requests</h2>
        <table>
          <thead>
            <tr>
              <th>Request Title</th>
              <th>Date Requested</th>
              <th>Status</th>
              <th>Requester</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="request in filteredRequests" :key="request.Request_ID" @click="viewRequest(request)">
              <td>{{ request.Request_title }}</td>
              <td>{{ request.Requested_at }}</td>
              <td>{{ request.Status }}</td>
              <td>{{ request.requester }}</td>
            </tr>
          </tbody>
        </table>
      </section>

      <!-- View Modal -->
      <div v-if="selectedRequest" class="modal">
        <div class="modal-content">
          <h2>Request Details</h2>
          <p><strong>Title:</strong> {{ selectedRequest.Request_title }}</p>
          <p><strong>Tool Needed:</strong> {{ selectedRequest.tool_needed }}</p>
          <p><strong>Description:</strong> {{ selectedRequest.description }}</p>
          <p><strong>Technical Requirement:</strong> {{ selectedRequest.technical_requirement }}</p>
          <p><strong>Priority:</strong> {{ selectedRequest.priority }}</p>
          <p><strong>Date Needed:</strong> {{ selectedRequest.date_needed }}</p>

          <div class="form-group">
            <label>Search Candidates</label>
            <input type="text" v-model="candidateSearch" placeholder="Search by name or expertise" />
          </div>

          <!-- Scrollable candidate list -->
          <div class="scrollable-candidates">
            <div
              v-for="candidate in filteredCandidates"
              :key="candidate.id"
              class="form-group"
            >
              <input
                type="checkbox"
                :value="candidate"
                v-model="selectedCandidate"
              />
              {{ candidate.alumni_Name }} ({{ candidate.expertise || 'No expertise' }})
              <span
                v-if="isRecommended(candidate)"
                style="color: #FF4B7E; font-weight: 500;"
              >
                - Recommended
              </span>
            </div>
          </div>

          <div class="button-group">
            <button @click="reviewSelection" :disabled="selectedCandidate.length === 0">
              Review
            </button>
            <button @click="closeModal">Close</button>
          </div>
        </div>
      </div>

      <!-- Review Modal -->
      <div v-if="showReview" class="modal">
        <div class="modal-content">
          <h2>Review and Approve</h2>
          <p><strong>Request:</strong> {{ selectedRequest.Request_title }}</p>
          <p><strong>Assigned to:</strong> {{ selectedCandidate[0].alumni_Name }}</p>
          <p><strong>Expertise:</strong> {{ selectedCandidate[0].expertise }}</p>
          <button @click="approveRequest">Approve</button>
          <button @click="showReview = false">Cancel</button>
        </div>
      </div>
    </main>
  </div>
</template>



<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../lib/supabaseClient'

const router = useRouter()
const isSidebarOpen = ref(false)

const filters = ref({ status: '', dateRequested: '' })
const requests = ref([])
const filteredRequests = ref([])
const candidates = ref([])
const selectedRequest = ref(null)
const selectedCandidate = ref([])
const candidateSearch = ref('')
const showReview = ref(false)

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value
}

const handleLogout = () => {
  localStorage.removeItem('user')
  router.push('/')
}

const applyFilters = () => {
  filteredRequests.value = requests.value.filter(r => {
    const statusMatch = filters.value.status ? r.Status === filters.value.status : true
    const dateMatch = filters.value.dateRequested ? r.Requested_at === filters.value.dateRequested : true
    return statusMatch && dateMatch
  })
}

const viewRequest = (req) => {
  selectedRequest.value = req
  selectedCandidate.value = []
  showReview.value = false
}
const reviewSelection = () => {
  showReview.value = true
}

const closeModal = () => {
  selectedRequest.value = null
}

const approveRequest = async () => {
  const request = selectedRequest.value
  const assigned = selectedCandidate.value[0]

  if (!request || !assigned) return

  const { error } = await supabase.from('request_table').update({
    Status: 'Completed',
    approved_at: new Date().toISOString(),
    assigned_to: assigned.id // assuming id or uuid
  }).eq('Request_ID', request.Request_ID)

  if (error) {
    console.error('Failed to update request:', error)
  } else {
    request.Status = 'Completed'
    request.approved_at = new Date().toISOString()
    request.assigned_to = assigned.id
    selectedRequest.value = null
    showReview.value = false
    await fetchRequests()
  }
}

const fetchRequests = async () => {
  const { data, error } = await supabase.from('request_table').select('*')

  if (error) {
    console.error('Error fetching requests:', error)
    return
  }

  if (!data || data.length === 0) {
    const dummyRequests = [
      {
        Request_ID: 9991,
        Requested_at: '2025-04-10',
        Status: 'Pending',
        Request_title: 'Install New Software',
        description: 'We need new design tools for the team.',
        tool_needed: 'Figma Pro',
        technical_requirement: 'UI/UX, Web Design',
        priority: 'High',
        date_needed: '2025-04-20',
        requester: 'Mico Ang'
      },
      {
        Request_ID: 9992,
        Requested_at: '2025-04-11',
        Status: 'Pending',
        Request_title: 'Setup Cloud Infrastructure',
        description: 'Deploy services on scalable cloud environment.',
        tool_needed: 'AWS EC2, S3',
        technical_requirement: 'DevOps, AWS',
        priority: 'Medium',
        date_needed: '2025-04-25',
        requester: 'Jane Cruz'
      },
      {
        Request_ID: 9993,
        Requested_at: '2025-04-12',
        Status: 'Pending',
        Request_title: 'Data Analysis Support',
        description: 'Assistance needed in processing survey datasets.',
        tool_needed: 'Python, Pandas',
        technical_requirement: 'Data Science, Python',
        priority: 'Low',
        date_needed: '2025-05-01',
        requester: 'Carlos Reyes'
      }
    ]

    const { error: insertError } = await supabase.from('request_table').insert(dummyRequests)
    if (insertError) {
      console.error('Failed to insert dummy requests:', insertError)
      return
    }

    requests.value = dummyRequests
    filteredRequests.value = dummyRequests
  } else {
    requests.value = data
    filteredRequests.value = data
  }
}

const fetchCandidates = async () => {
  const { data, error } = await supabase.from('alumni_table').select('*')
  if (error) {
    console.error('Error fetching candidates:', error)
  } else {
    candidates.value = data
  }
}

const filteredCandidates = computed(() => {
  const keyword = candidateSearch.value.toLowerCase()
  return candidates.value.filter(c =>
    c.alumni_Name?.toLowerCase().includes(keyword) ||
    c.expertise?.toLowerCase().includes(keyword)
  )
})

const isRecommended = (candidate) => {
  if (!selectedRequest.value || !candidate.expertise) return false
  const requirements = selectedRequest.value.technical_requirement.toLowerCase().split(',').map(r => r.trim())
  const candidateExpertise = candidate.expertise.toLowerCase().split(',').map(e => e.trim())
  return requirements.some(req => candidateExpertise.includes(req))
}

onMounted(async () => {
  await fetchRequests()
  await fetchCandidates()
})
</script>



<style scoped>

.approval-page {
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
  width: 190px;
  background: linear-gradient(180deg, #ff4b7c 0%, #ff1c55 100%);
  padding: 30px;
  color: white;
  display: flex;
  flex-direction: column;
  justify-content: flex-start; /* Changed from space-between */
  z-index: 100;
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
  margin-top: 80px; /* Added margin top */
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

/* Update the main content margin to match new sidebar width */
.main-content {
  flex: 1;
  margin-left: 280px;
  padding: 40px;
  overflow-y: auto;
  min-width: 0;
  width: calc(100% - 280px);
}

/* Add responsive styles for the sidebar */
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

  .main-content {
    margin-left: 0;
    width: 100%;
    padding: 20px;
  }
}

/* Filters Section */
.filters {
  background: white;
  padding: 24px;
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(255, 75, 124, 0.1);
  margin-bottom: 24px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.filters:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(255, 75, 124, 0.15);
}

.filters h2 {
  color: #ff4b7c;
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  color: #000;
  margin-bottom: 8px;
  font-weight: 500;
}

select, input[type="date"] {
  width: 100%;
  padding: 12px;
  border: 1px solid #ffe0e5;
  border-radius: 12px;
  background: white;
  color: #000;
  transition: all 0.3s ease;
}

select:focus, input:focus {
  outline: none;
  border-color: #ff4b7c;
  box-shadow: 0 0 0 3px rgba(255, 75, 124, 0.1);
}

/* Requests Dashboard */
.requests-dashboard {
  background: white;
  padding: 24px;
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(255, 75, 124, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.requests-dashboard:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(255, 75, 124, 0.15);
}

.requests-dashboard h2 {
  color: #ff4b7c;
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 20px;
}

table {
  width: 100%;
  border-spacing: 0;
  border-collapse: separate;
  border-radius: 12px;
  overflow: hidden;
}

th {
  background: #fff5f7;
  color: #ff4b7c;
  font-weight: 600;
  padding: 16px;
  text-align: left;
}

td {
  padding: 16px;
  color: #000;
  border-bottom: 1px solid #ffe0e5;
}

tr:hover {
  background: #fff5f7;
  cursor: pointer;
}

/* Modal Styles */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 32px;
  border-radius: 20px;
  width: 500px;
  max-width: 90%;
  box-shadow: 0 20px 25px -5px rgba(255, 75, 124, 0.1);
}

.modal-content h2 {
  color: #ff4b7c;
  font-size: 20px;
  margin-bottom: 24px;
}

/* Button Styles */
button {
  background: #ff4b7c;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

button:hover {
  background: #ff1c55;
  transform: translateY(-2px);
}

button.secondary {
  background: transparent;
  color: #ff4b7c;
  border: 1px solid #ff4b7c;
}

button.secondary:hover {
  background: #fff5f7;
}

/* Status Badge Styles */
.status-badge {
  display: inline-block;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
}

.status-badge.pending {
  background: #fff5f7;
  color: #ff4b7c;
}

.status-badge.completed {
  background: #f0fdf4;
  color: #15803d;
}

/* Responsive Styles */
@media (max-width: 768px) {
  .sidebar {
    width: 100%;
    position: sticky;
    top: 0;
    height: auto;
    padding: 15px;
    flex-direction: row;
  }

  .main-content {
    margin-left: 0;
    width: 100%;
  }

  .modal-content {
    width: 95%;
    padding: 20px;
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
.scrollable-candidates {
  max-height: 250px;
  overflow-y: auto;
  padding: 0.5rem;
  border: 1px solid #eee;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.button-group {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.modal-content {
  max-height: 90vh;
  overflow-y: auto;
}
</style>
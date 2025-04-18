  <template>
    <div class="homepage">
      <!-- Sidebar -->
      <aside class="sidebar">
        <div class="logo">
          <img src="../assets/logo.png" alt="Logo" />
          <h2>Alumni Connect</h2>
        </div>
        <nav class="nav-links">
          <router-link to="/home" class="nav-item active"><i class="fas fa-home"></i><span>Home</span></router-link>
          <router-link to="/contacts" class="nav-item"><i class="fas fa-cog"></i><span>Contacts</span></router-link>
          <router-link to="/events" class="nav-item"><i class="fas fa-calendar"></i><span>Events</span></router-link>
          <router-link to="/approve-requests" class="nav-item"><i class="fas fa-envelope"></i><span>Requests</span></router-link>
        </nav>
        <a href="#" class="logout" @click.prevent="handleLogout"><i class="fas fa-sign-out-alt"></i><span>Logout</span></a>
      </aside>

      <!-- Main Content -->
      <main class="main-content">
        <!-- Stats Cards -->
        <section class="stats-cards">
          <div class="card">
            <div class="card-icon pink"><i class="fas fa-users"></i></div>
            <h3>Total Alumni</h3>
            <p>{{ totalAlumni }}</p>
            <button class="card-button" @click="openAllAlumni">View All</button>
          </div>
          <div class="card">
            <div class="card-icon green"><i class="fas fa-check-circle"></i></div>
            <h3>Active Members</h3>
            <p>{{ activeMembers }}</p>
            <button class="card-button" @click="openActiveAlumni">Details</button>

          </div>
          <div class="card">
            <div class="card-icon purple"><i class="fas fa-calendar-check"></i></div>
            <h3>Events Held</h3>
            <p>{{ eventsHeld }}</p>
            <button class="card-button" @click="openEventList">View Events</button>
          </div>
        </section>
        <div v-if="showAllAlumni" class="mini-modal">
  <div class="modal-content">
    <h3>All Alumni</h3>
    <ul>
      <li v-for="alumni in allAlumni" :key="alumni.alumni_ID">{{ alumni.alumni_Name }}</li>
    </ul>
    <button @click="showAllAlumni = false">Close</button>
  </div>
</div>

<!-- Modal: Active Members -->
<div v-if="showActiveAlumni" class="mini-modal">
  <div class="modal-content">
    <h3>Active Members</h3>
    <ul>
      <li v-for="alumni in activeAlumni" :key="alumni.alumni_ID">{{ alumni.alumni_Name }}</li>
    </ul>
    <button @click="showActiveAlumni = false">Close</button>
  </div>
</div>

<!-- Modal: Events -->
<div v-if="showEventList" class="mini-modal">
  <div class="modal-content">
    <h3>Events Held</h3>
    <ul>
      <li v-for="event in eventsList" :key="event.id">{{ event.name }} – {{ event.date_from }}</li>
    </ul>
    <button @click="showEventList = false">Close</button>
  </div>
</div>

        <!-- Charts -->
        <section class="charts">
          <!-- Bar Chart -->
          <div class="chart-container">
            <div class="chart-header">
              <h3>Contact Growth</h3>
              <div class="chart-actions">
                <button :class="{ active: selectedPeriod === 'weekly' }" @click="updatePeriod('weekly')">Weekly</button>
                <button :class="{ active: selectedPeriod === 'monthly' }" @click="updatePeriod('monthly')">Monthly</button>
                <button :class="{ active: selectedPeriod === 'yearly' }" @click="updatePeriod('yearly')">Yearly</button>
              </div>
            </div>
            <canvas ref="barChart"></canvas>
            <div class="counts">
              <div>Total Alumni: {{ totalAlumni }}</div>
              <div>{{ activeMembers }}</div>
            </div>
          </div>

          <!-- Pie Chart -->
          <div class="chart-container">
            <div class="chart-header"><h3>Member Status</h3></div>
            <canvas ref="pieChart"></canvas>
            <div class="legend-container">
              <div class="legend-item">
                <span class="legend-dot" style="background-color:#FF5C8E"></span>
                <span class="legend-label">Active Members</span>
                <span class="legend-value">{{ pieChartData.active }}</span>
              </div>
              <div class="legend-item">
                <span class="legend-dot" style="background-color:#FF8FBB"></span>
                <span class="legend-label">Inactive Members</span>
                <span class="legend-value">{{ pieChartData.inactive }}</span>
              </div>
              <div class="legend-item">
                <span class="legend-dot" style="background-color:#FFD1DC"></span>
                <span class="legend-label">New Members</span>
                <span class="legend-value">{{ pieChartData.new }}</span>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  </template>

  <script setup>
  import { ref, shallowRef, onMounted } from 'vue'
  import { supabase } from '../lib/supabaseClient'
  import { Chart, Title, Tooltip, Legend, CategoryScale, LinearScale, BarElement, ArcElement, PieController, BarController } from 'chart.js'
  import cloneDeep from 'lodash/cloneDeep'
  import { debounce } from 'lodash'

  Chart.register(Title, Tooltip, Legend, CategoryScale, LinearScale, BarElement, ArcElement, BarController, PieController)

  // State
  const totalAlumni = ref(0)
  const activeMembers = ref(0)
  const eventsHeld = ref(0)
  const selectedPeriod = ref('monthly')
  const barChart = ref(null)
  const pieChart = ref(null)
  const chart = shallowRef(null)
  const showAllAlumni = ref(false)
const showActiveAlumni = ref(false)
const showEventList = ref(false)
  let pieChartInstance = null

  const allAlumni = ref([])
const activeAlumni = ref([])
const eventsList = ref([])

const openAllAlumni = async () => {
  const { data, error } = await supabase.from('alumni_table').select('alumni_ID, alumni_Name')
  if (!error) {
    allAlumni.value = data
    showAllAlumni.value = true
  }
}

const openActiveAlumni = async () => {
  const { data, error } = await supabase.from('alumni_table').select('alumni_ID, alumni_Name').eq('Status', 'Contacted')
  if (!error) {
    activeAlumni.value = data
    showActiveAlumni.value = true
  }
}

const openEventList = async () => {
  const { data, error } = await supabase.from('events').select('id, name, date_from')
  if (!error) {
    eventsList.value = data
    showEventList.value = true
  }
}
  
  const pieChartData = ref({ active: 0, inactive: 0, new: 0 })

  const fetchCounts = async () => {
    const { data: totalData } = await supabase.from('alumni_table').select('*')
    totalAlumni.value = totalData.length

    const { data: activeData } = await supabase.from('alumni_table').select('*').eq('Status', 'Contacted')
    activeMembers.value = activeData.length

    const { data: eventsData } = await supabase.from('events').select('*')
    eventsHeld.value = eventsData.length
  }

  const fetchPieData = async () => {
    const { data } = await supabase.from('alumni_table').select('Status, created_at')
    const now = new Date()
    const last30Days = new Date()
    last30Days.setDate(now.getDate() - 30)

    pieChartData.value.active = data.filter(d => d.Status === 'Contacted').length
    pieChartData.value.inactive = data.filter(d => d.Status !== 'Contacted').length
    pieChartData.value.new = data.filter(d => new Date(d.created_at) >= last30Days).length

    setupPieChart()
  }

  const setupPieChart = () => {
    const ctx = pieChart.value?.getContext('2d')
    if (!ctx) return

    if (pieChartInstance) pieChartInstance.destroy()

    pieChartInstance = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ["Active Members", "Inactive Members", "New Members"],
        datasets: [{
          data: [
            pieChartData.value.active,
            pieChartData.value.inactive,
            pieChartData.value.new
          ],
          backgroundColor: ['#FF5C8E', '#FF8FBB', '#FFD1DC'],
          cutout: '75%',
          borderRadius: 20
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } }
      }
    })
  }

  const fetchData = async (period) => {
    const now = new Date()
    let start = new Date()
    if (period === 'weekly') start.setDate(now.getDate() - 35)
    else if (period === 'monthly') start.setMonth(now.getMonth() - 5)
    else start = new Date(now.getFullYear(), 0, 1)

    const { data } = await supabase
      .from('alumni_table')
      .select('Status, created_at')
      .gte('created_at', start.toISOString())

    const totalData = [], activeData = [], labels = []

    if (period === 'weekly') {
      for (let i = 4; i >= 0; i--) {
        const weekStart = new Date()
        weekStart.setDate(now.getDate() - (i * 7))
        const weekEnd = new Date(weekStart)
        weekEnd.setDate(weekStart.getDate() + 6)

        labels.push(`W${5 - i}`)
        const filtered = data.filter(d => {
          const date = new Date(d.created_at)
          return date >= weekStart && date <= weekEnd
        })
        totalData.push(filtered.length)
        activeData.push(filtered.filter(d => d.Status === 'Contacted').length)
      }
    } else if (period === 'monthly') {
      for (let i = 5; i >= 0; i--) {
        const d = new Date()
        d.setMonth(now.getMonth() - i)
        const m = d.getMonth(), y = d.getFullYear()
        labels.push(d.toLocaleString('default', { month: 'short' }))
        const filtered = data.filter(e => {
          const date = new Date(e.created_at)
          return date.getMonth() === m && date.getFullYear() === y
        })
        totalData.push(filtered.length)
        activeData.push(filtered.filter(e => e.Status === 'Contacted').length)
      }
    } else {
      labels.push('This Year')
      totalData.push(data.length)
      activeData.push(data.filter(d => d.Status === 'Contacted').length)
    }

    return {
      labels,
      datasets: [
        { label: 'Total Alumni', data: totalData, backgroundColor: '#FF5C8E' },
        { label: 'Active Members', data: activeData, backgroundColor: '#FF8FBB' }
      ]
    }
  }

  const updatePeriod = debounce(async (period) => {
    selectedPeriod.value = period
    const rawData = await fetchData(period)
    chart.value.data = cloneDeep(rawData)
    chart.value.update()
  }, 500)

  const setupBarChart = async () => {
    const rawData = await fetchData(selectedPeriod.value)
    const ctx = barChart.value?.getContext('2d')
    if (!ctx) return
    chart.value = new Chart(ctx, {
      type: 'bar',
      data: cloneDeep(rawData),
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'top' } },
        scales: { y: { beginAtZero: true } }
      }
    })
  }

  const handleLogout = () => {
    localStorage.removeItem('user')
    window.location.href = '/'
  }

  onMounted(async () => {
    await fetchCounts()
    await fetchPieData()
    await setupBarChart()
  })
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
  }

  /* === SIDEBAR === */
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
  }

  .logo {
    display: flex;
    align-items: center;
    gap: 15px;
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
  }

  .logout:hover {
    background: #ff4b7c;
  }

  /* === MAIN CONTENT === */
  .main-content {
    flex: 1;
    margin-left: 280px;
    padding: 30px;
    overflow-y: auto;
    min-width: 0;
    width: calc(100% - 280px);
  }

  /* === STATS CARDS === */
  .stats-cards {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 24px;
    margin-bottom: 24px;
  }

  .card {
    background: white;
    padding: 24px;
    border-radius: 20px;
    box-shadow: 0 4px 20px rgba(255, 75, 124, 0.1);
    text-align: center;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
  }

  .card:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 25px rgba(255, 75, 124, 0.15);
  }

  .card-icon {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 16px;
    font-size: 24px;
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
    color: #000;
    font-size: 14px;
    margin-bottom: 8px;
  }

  .card p {
    color: #000;
    font-size: 24px;
    font-weight: 700;
    margin-bottom: 16px;
  }

  .card-button {
    background: transparent;
    color: #ff4b7c;
    border: 1px solid #ff4b7c;
    padding: 8px 24px;
    border-radius: 12px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .card-button:hover {
    background: #ff4b7c;
    color: white;
    transform: translateY(-2px);
  }

  /* === CHART SECTION === */
  .charts {
    display: flex;
    flex-wrap: wrap;
    gap: 24px;
    width: 100%;
  }

  .chart-container {
    flex: 1 1 48%;
    background: white;
    padding: 24px;
    border-radius: 20px;
    box-shadow: 0 4px 20px rgba(255, 75, 124, 0.1);
    transition: transform 0.3s ease;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: start;
    overflow: hidden;
    height: 420px;
    max-width: 100%;
    min-width: 450px;
  }

  .chart-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    margin-bottom: 16px;
  }

  .chart-header h3 {
    font-size: 18px;
    font-weight: 600;
    color: #000;
  }

  .chart-actions {
    display: flex;
    gap: 8px;
    background: #f4f7fe;
    padding: 4px;
    border-radius: 8px;
  }

  .chart-actions button {
    border: none;
    background: none;
    padding: 6px 12px;
    font-size: 12px;
    font-weight: 500;
    color: #a3aed0;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .chart-actions button.active {
    background: #ff5c8e;
    color: white;
  }

  .chart-actions button:hover:not(.active) {
    color: #2b3674;
  }

  canvas {
    width: 100% !important;
    max-height: 250px !important;
    object-fit: contain;
    margin: 0 auto;
  }

  /* === LEGEND BELOW PIECHART === */
  .legend-container {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-top: 20px;
    width: 100%;
    max-width: 300px;
  }

  .legend-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 14px;
    padding: 0 10px;
  }

  .legend-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    margin-right: 8px;
  }

  .legend-label {
    flex: 1;
    color: #000;
  }

  .legend-value {
    font-weight: bold;
    color: #000;
  }

  /* === RESPONSIVE === */
  @media (max-width: 1200px) {
    .charts {
      flex-direction: column;
    }

    .chart-container {
      width: 100%;
      min-width: unset;
    }

    .stats-cards {
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

    .nav-item span, .logout span {
      display: none;
    }

    .nav-item, .logout {
      justify-content: center;
      padding: 8px;
    }

    .main-content {
      margin-left: 0;
      width: 100%;
      padding: 20px;
    }

    .stats-cards {
      grid-template-columns: 1fr;
    }

    .chart-container {
      padding: 15px;
      min-height: 250px;
    }
  }

  @media (max-width: 480px) {
    .card {
      padding: 15px;
    }

    .chart-container {
      padding: 15px;
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

  /* === SCROLLBAR === */
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
  .mini-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

.modal-content {
  background: white;
  padding: 24px;
  border-radius: 12px;
  width: 400px;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
}

.modal-content h3 {
  margin-bottom: 12px;
}

.modal-content ul {
  list-style: none;
  padding: 0;
}

.modal-content li {
  padding: 6px 0;
  border-bottom: 1px solid #eee;
}

.modal-content button {
  margin-top: 16px;
  padding: 8px 16px;
  background: #ff4b7c;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}
  </style>



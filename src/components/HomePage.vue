<template>
  <div class="homepage">
    <!-- Sidebar -->
    <aside class="sidebar">
      <div class="logo">
        <img src="../assets/logo.png" alt="Logo" />
        <h2>Alumni Connect</h2>
      </div>
      <nav class="nav-links">
        <router-link to="/home" class="nav-item active">
          <i class="fas fa-home"></i>
          <span>Home</span>
        </router-link>
        <router-link to="/contacts" class="nav-item">
          <i class="fas fa-cog"></i>
          <span>Contacts</span>
        </router-link>
        <router-link to="/events" class="nav-item">
          <i class="fas fa-calendar"></i>
          <span>Events</span>
        </router-link>
      </nav>
      <a href="#" class="logout" @click.prevent="handleLogout">
        <i class="fas fa-sign-out-alt"></i>
        <span>Logout</span>
      </a>
    </aside>

    <!-- Main Content -->
    <main class="main-content">
      <!-- Stats Cards Section -->
      <section class="stats-cards">
        <div class="card">
          <div class="card-icon pink">
            <i class="fas fa-users"></i>
          </div>
          <h3>Total Alumni</h3>
          <p>2,119</p>
          <button class="card-button">View All</button>
        </div>
        <div class="card">
          <div class="card-icon green">
            <i class="fas fa-check-circle"></i>
          </div>
          <h3>Active Members</h3>
          <p>1,892</p>
          <button class="card-button">Details</button>
        </div>
        <div class="card">
          <div class="card-icon purple">
            <i class="fas fa-calendar-check"></i>
          </div>
          <h3>Events Held</h3>
          <p>42</p>
          <button class="card-button">View Events</button>
        </div>
      </section>

      <!-- Charts Section -->
      <section class="charts">
        <div class="chart-container">
          <div class="chart-header">
            <h3>Alumni Distribution</h3>
            <div class="chart-actions">
              <span class="date-range">Last 6 months</span>
              <button class="more-btn"><i class="fas fa-ellipsis-v"></i></button>
            </div>
          </div>
          <BarChart />
        </div>
        <div class="chart-container">
          <div class="chart-header">
            <h3>Member Status</h3>
            <div class="chart-actions">
              <span class="date-range">Current Year</span>
              <button class="more-btn"><i class="fas fa-ellipsis-v"></i></button>
            </div>
          </div>
          <PieChart />
        </div>
      </section>
    </main>
  </div>
</template>

<script>
import BarChart from './BarChart.vue'
import PieChart from './PieChart.vue'

export default {
  name: 'HomePage',
  components: {
    BarChart,
    PieChart
  },
  methods: {
    handleLogout() {
      localStorage.removeItem('user');
      this.$router.push('/');
    }
  }
}
</script>

<!-- Template remains the same -->

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
  background-color: #f8fafc;
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
  background: linear-gradient(180deg, #2B3674 0%, #1A1F37 100%);
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
  color: #A3AED0;
  padding: 12px;
  border-radius: 14px;
  text-decoration: none;
  transition: all 0.3s ease;
}

.nav-item:hover, .nav-item.active {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.logout {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #FF5252;
  text-decoration: none;
  padding: 12px;
  border-radius: 14px;
  margin-top: auto;
  transition: all 0.3s ease;
}

.logout:hover {
  background: rgba(255, 82, 82, 0.1);
}

/* Main Content Styles */
.main-content {
  flex: 1;
  margin-left: 280px;
  padding: 30px;
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
  padding: 24px;
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  text-align: center;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
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
  background: linear-gradient(135deg, #FF5C8E, #FF8FBB);
}

.card-icon.green {
  background: linear-gradient(135deg, #05CD99, #08F7BE);
}

.card-icon.purple {
  background: linear-gradient(135deg, #4318FF, #868CFF);
}

.card h3 {
  color: #A3AED0;
  font-size: 14px;
  margin-bottom: 8px;
}

.card p {
  color: #2B3674;
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 16px;
}

.card-button {
  background: transparent;
  color: #4318FF;
  border: 1px solid #4318FF;
  padding: 8px 24px;
  border-radius: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.card-button:hover {
  background: #4318FF;
  color: white;
  transform: translateY(-2px);
}

/* Charts Section */
.charts {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
}

.chart-container {
  background: white;
  padding: 24px;
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  min-height: 300px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.chart-container:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.chart-header h3 {
  color: #2B3674;
  font-size: 18px;
  font-weight: 600;
}

.chart-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.date-range {
  color: #A3AED0;
  font-size: 14px;
}

.more-btn {
  background: transparent;
  border: none;
  color: #A3AED0;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.more-btn:hover {
  background: #F4F7FE;
  color: #2B3674;
}

/* Responsive Styles */
@media (max-width: 1200px) {
  .stats-cards {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .charts {
    grid-template-columns: 1fr;
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
}

@media (max-width: 480px) {
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
</style>
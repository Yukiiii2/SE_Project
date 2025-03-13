<template>
  <div class="chart-wrapper">
    <div class="chart-header">
      <h3 class="chart-title">Contact Growth</h3>
      <div class="time-filter">
        <button :class="{ active: selectedPeriod === 'weekly' }" @click="updatePeriod('weekly')">Weekly</button>
        <button :class="{ active: selectedPeriod === 'monthly' }" @click="updatePeriod('monthly')">Monthly</button>
        <button :class="{ active: selectedPeriod === 'yearly' }" @click="updatePeriod('yearly')">Yearly</button>
      </div>
    </div>
    <canvas ref="barChart"></canvas>
  </div>
</template>

<script>
import {
  Chart,
  Title,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  BarController,
} from "chart.js";

Chart.register(Title, Tooltip, Legend, CategoryScale, LinearScale, BarElement, BarController);

export default {
  name: "BarChart",
  data() {
    return {
      chart: null,
      selectedPeriod: 'monthly',
    }
  },
  mounted() {
    this.initChart();
  },
  methods: {
    initChart() {
      const ctx = this.$refs.barChart.getContext("2d");
      
      if (this.chart) {
        this.chart.destroy();
      }

      this.chart = new Chart(ctx, {
        type: "bar",
        data: {
          labels: ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5"],
          datasets: [
            {
              label: "Total Contacts",
              data: [420, 380, 450, 520, 480],
              backgroundColor: "#FF5C8E",
              borderRadius: 8,
              barThickness: 20,
              maxBarThickness: 25,
            },
            {
              label: "Active Contacts",
              data: [350, 320, 380, 450, 400],
              backgroundColor: "#FF8FBB",
              borderRadius: 8,
              barThickness: 20,
              maxBarThickness: 25,
            }
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: true,
              position: "top",
              align: "end",
              labels: {
                usePointStyle: true,
                boxWidth: 8,
                boxHeight: 8,
                padding: 20,
                color: "#000000", // Updated to black
                font: {
                  family: "'Inter', sans-serif",
                  size: 12
                }
              }
            },
            tooltip: {
              enabled: true,
              backgroundColor: "#ffffff",
              titleColor: "#2B3674",
              bodyColor: "#2B3674",
              borderColor: "#FF5C8E",
              borderWidth: 1,
              padding: 12,
              cornerRadius: 8,
              titleFont: {
                family: "'Inter', sans-serif",
                size: 12,
                weight: '600'
              },
              bodyFont: {
                family: "'Inter', sans-serif",
                size: 12
              },
              displayColors: false
            }
          },
          scales: {
            x: {
              grid: {
                display: false
              },
              ticks: {
                color: "#000000", // Updated to black
                font: {
                  family: "'Inter', sans-serif",
                  size: 12
                }
              }
            },
            y: {
              grid: {
                color: "#FF8FBB",
                drawBorder: false
              },
              ticks: {
                color: "#000000", // Updated to black
                font: {
                  family: "'Inter', sans-serif",
                  size: 12
                },
                padding: 10,
                stepSize: 100
              }
            }
          }
        },
      });
    },
    updatePeriod(period) {
      this.selectedPeriod = period;
      // Here you would typically fetch new data based on the selected period
      // For now, we'll just reinitialize the chart
      this.initChart();
    }
  }
};
</script>

<style scoped>
.chart-wrapper {
  height: 400px;
  padding: 20px;
  background: #FFF5F7;
  border-radius: 16px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.chart-header .chart-title {
  color: #000000; /* Updated to black */
  font-size: 18px;
  font-weight: 600;
  margin: 0;
}

.time-filter {
  display: flex;
  gap: 8px;
  background: #F4F7FE;
  padding: 4px;
  border-radius: 8px;
}

.time-filter button {
  border: none;
  background: none;
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 500;
  color: #A3AED0;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.time-filter button.active {
  background: #FF5C8E;
  color: white;
}

.time-filter button:hover:not(.active) {
  color: #2B3674;
}

canvas {
  width: 100% !important;
  height: calc(100% - 60px) !important;
}
</style>
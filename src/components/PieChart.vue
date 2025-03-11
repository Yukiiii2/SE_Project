<template>
  <div class="chart-wrapper">
    <canvas ref="pieChart"></canvas>
    <div class="legend-container">
      <div class="legend-item" v-for="(item, index) in legendItems" :key="index">
        <span class="legend-dot" :style="{ backgroundColor: item.color }"></span>
        <span class="legend-label">{{ item.label }}</span>
        <span class="legend-value">{{ item.value }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import {
  Chart,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PieController,
} from "chart.js";

Chart.register(Title, Tooltip, Legend, ArcElement, PieController);

export default {
  name: "PieChart",
  data() {
    return {
      legendItems: [
        { label: 'Active Members', value: '1,892', color: '#FF5C8E' },
        { label: 'Inactive Members', value: '189', color: '#FF8FBB' },
        { label: 'New Members', value: '38', color: '#FFD1DC' }
      ]
    }
  },
  mounted() {
    const ctx = this.$refs.pieChart.getContext("2d");

    new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: ["Active Members", "Inactive Members", "New Members"],
        datasets: [
          {
            data: [1892, 189, 38],
            backgroundColor: ['#FF5C8E', '#FF8FBB', '#FFD1DC'],
            borderWidth: 0,
            cutout: '75%',
            borderRadius: 20,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        layout: {
          padding: 20
        },
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            enabled: true,
            backgroundColor: '#ffffff',
            titleColor: '#2B3674',
            bodyColor: '#2B3674',
            borderColor: '#FF5C8E',
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
            callbacks: {
              label: function(context) {
                const value = context.raw;
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const percentage = Math.round((value / total) * 100);
                return `${value.toLocaleString()} (${percentage}%)`;
              }
            },
            displayColors: false
          }
        },
        elements: {
          arc: {
            spacing: 4
          }
        }
      },
    });
  },
};
</script>

<style scoped>
.chart-wrapper {
  height: 300px;
  position: relative;
  padding: 20px;
}

.legend-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 24px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
}

.legend-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.legend-label {
  color: #A3AED0;
  flex-grow: 1;
}

.legend-value {
  color: #FF4B6E; /* Updated to match the Member Status text color */
  font-weight: 600;
}

canvas {
  margin: 0 auto;
}

/* Custom tooltip styles */
:deep(.chartjs-tooltip) {
  background: white !important;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
}
</style>
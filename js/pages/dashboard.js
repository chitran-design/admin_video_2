/**
 * js/pages/dashboard.js
 * Logic thống kê và biểu đồ Chart.js cho Dashboard
 */

import { auth } from '../core/auth.js';
import { db } from '../core/db.js';
import { renderLayout } from '../components/sidebar.js';
import { formatNumber, formatViewsCompact, formatBytes } from '../core/utils.js';

let topVideosChart = null;
let trendChart = null;
let trendMode = 'days'; // 'days' hoặc 'months'

document.addEventListener('DOMContentLoaded', async () => {
  const user = auth.requireAuth(['ADMIN', 'USER']);
  if (!user) return;

  renderLayout({ pageTitle: 'Bảng điều khiển', activeNav: 'dashboard' });

  try {
    await db.init();
    loadDashboardMetrics();
    renderTopVideosChart();
    renderTrendChart();
    setupTrendToggle();
  } catch (err) {
    console.error('Lỗi khởi tạo Dashboard:', err);
  }
});

function loadDashboardMetrics() {
  const videos = db.getAll('videos');

  // 1. Tổng số video & số video đã xuất bản
  const totalVideos = videos.length;
  const publishedVideos = videos.filter(v => v.status === 'PUBLISHED').length;
  document.getElementById('stat-total-videos').textContent = formatNumber(totalVideos);
  document.getElementById('stat-published-videos').textContent = `${formatNumber(publishedVideos)} video đã xuất bản`;

  // 2. Tổng lượt xem
  const totalViews = videos.reduce((acc, v) => acc + (v.views || 0), 0);
  const viewsEl = document.getElementById('stat-total-views');
  viewsEl.textContent = formatViewsCompact(totalViews);
  viewsEl.title = `${formatNumber(totalViews)} lượt xem`;

  // 3. Tổng dung lượng lưu trữ
  const totalBytes = videos.reduce((acc, v) => acc + (v.file_size_bytes || 0), 0);
  document.getElementById('stat-storage-size').textContent = formatBytes(totalBytes);

  // In ra Console để kiểm tra đối chiếu với CSV
  console.log('=== THỐNG KÊ DASHBOARD ===');
  console.log(`- Tổng video: ${totalVideos} (Published: ${publishedVideos})`);
  console.log(`- Tổng lượt xem: ${totalViews} (${formatNumber(totalViews)})`);
  console.log(`- Tổng dung lượng: ${totalBytes} bytes (${formatBytes(totalBytes)})`);
}

function renderTopVideosChart() {
  const canvas = document.getElementById('chart-top-videos');
  if (!canvas || !window.Chart) return;

  const videos = db.getAll('videos');
  // Sắp xếp giảm dần theo lượt xem, lấy tối đa 10 video
  const sorted = [...videos].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 10);

  const fullTitles = sorted.map(v => v.title);
  const labels = sorted.map(v => v.title.length > 22 ? v.title.substring(0, 20) + '…' : v.title);
  const data = sorted.map(v => v.views || 0);

  if (topVideosChart) {
    topVideosChart.destroy();
  }

  topVideosChart = new Chart(canvas, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Lượt xem',
        data: data,
        backgroundColor: '#2563EB',
        hoverBackgroundColor: '#1D4ED8',
        borderRadius: 6,
        borderSkipped: false
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            title: (items) => fullTitles[items[0].dataIndex],
            label: (item) => ` ${formatNumber(item.raw)} lượt xem`
          }
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: {
            color: '#64748B',
            font: { family: 'Inter', size: 12 }
          }
        },
        y: {
          grid: { color: '#E2E8F0' },
          ticks: {
            color: '#64748B',
            font: { family: 'Inter', size: 12 },
            callback: (val) => formatViewsCompact(val)
          }
        }
      }
    }
  });
}

function renderTrendChart() {
  const canvas = document.getElementById('chart-views-trend');
  if (!canvas || !window.Chart) return;

  const dailyRecords = db.getAll('video_views_daily');

  // Xác định ngày mốc gần nhất trong dữ liệu (hoặc hôm nay)
  let latestDate = new Date();
  if (dailyRecords.length > 0) {
    const dates = dailyRecords.map(d => d.view_date).filter(Boolean).sort();
    if (dates.length > 0) {
      const parts = dates[dates.length - 1].split('-');
      latestDate = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    }
  }

  let labels = [];
  let values = [];

  const pad = (n) => String(n).padStart(2, '0');

  if (trendMode === 'days') {
    // 30 ngày gần nhất
    const map = {};
    for (let i = 29; i >= 0; i--) {
      const d = new Date(latestDate);
      d.setDate(d.getDate() - i);
      const key = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
      const label = `${pad(d.getDate())}/${pad(d.getMonth() + 1)}`;
      map[key] = { label, views: 0 };
    }

    dailyRecords.forEach(r => {
      if (r.view_date && map[r.view_date]) {
        map[r.view_date].views += (r.views || 0);
      }
    });

    const entries = Object.values(map);
    labels = entries.map(e => e.label);
    values = entries.map(e => e.views);

  } else {
    // 12 tháng gần nhất
    const map = {};
    for (let i = 11; i >= 0; i--) {
      const d = new Date(latestDate.getFullYear(), latestDate.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
      const label = `${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
      map[key] = { label, views: 0 };
    }

    dailyRecords.forEach(r => {
      if (r.view_date) {
        const monthKey = r.view_date.substring(0, 7);
        if (map[monthKey]) {
          map[monthKey].views += (r.views || 0);
        }
      }
    });

    const entries = Object.values(map);
    labels = entries.map(e => e.label);
    values = entries.map(e => e.views);
  }

  if (trendChart) {
    trendChart.destroy();
  }

  trendChart = new Chart(canvas, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Lượt xem',
        data: values,
        borderColor: '#2563EB',
        backgroundColor: 'rgba(37, 99, 235, 0.08)',
        fill: true,
        tension: 0.35,
        borderWidth: 2,
        pointBackgroundColor: '#2563EB',
        pointHoverBackgroundColor: '#1D4ED8',
        pointRadius: trendMode === 'days' ? 3 : 5,
        pointHoverRadius: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (item) => ` ${formatNumber(item.raw)} lượt xem`
          }
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: {
            color: '#64748B',
            font: { family: 'Inter', size: 12 },
            maxTicksLimit: trendMode === 'days' ? 15 : 12
          }
        },
        y: {
          beginAtZero: true,
          grid: { color: '#E2E8F0' },
          ticks: {
            color: '#64748B',
            font: { family: 'Inter', size: 12 },
            callback: (val) => formatViewsCompact(val)
          }
        }
      }
    }
  });
}

function setupTrendToggle() {
  const btnDays = document.getElementById('btn-view-days');
  const btnMonths = document.getElementById('btn-view-months');

  if (btnDays && btnMonths) {
    btnDays.addEventListener('click', () => {
      if (trendMode === 'days') return;
      trendMode = 'days';
      btnDays.className = 'btn btn--primary btn--sm';
      btnMonths.className = 'btn btn--secondary btn--sm';
      renderTrendChart();
    });

    btnMonths.addEventListener('click', () => {
      if (trendMode === 'months') return;
      trendMode = 'months';
      btnMonths.className = 'btn btn--primary btn--sm';
      btnDays.className = 'btn btn--secondary btn--sm';
      renderTrendChart();
    });
  }
}

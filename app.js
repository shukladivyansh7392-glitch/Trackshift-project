// Active Charts References
let trendsChart = null;
let historyChart = null;
let simForecastChart = null;

// Routing Logic
function navigateTo(pageId) {
  // Update view visibility
  document.querySelectorAll('.page-view').forEach(view => view.classList.remove('active'));
  const targetPage = document.getElementById(`page-${pageId}`);
  if (targetPage) targetPage.classList.add('active');

  // Update Sidebar active styling
  document.querySelectorAll('.menu-item').forEach(item => {
    item.classList.toggle('active', item.getAttribute('data-page') === pageId);
  });

  // Dynamic Header Text Updates
  const titleMap = {
    'dashboard': { title: 'Energy & Overtake Intelligence', sub: 'Smarter Decisions. More Overtakes. Better Energy.' },
    'history': { title: 'Race History & Strategy Logs', sub: 'Review historical metrics and past race performance.' },
    'simulator': { title: 'What-if Strategy Simulator', sub: 'Run isolated scenarios and forecast telemetry outcomes.' },
    'settings': { title: 'System Settings', sub: 'Configure dashboard behavior, thresholds, and connections.' }
  };

  if (titleMap[pageId]) {
    document.getElementById('page-title').innerText = titleMap[pageId].title;
    document.getElementById('page-subtitle').innerText = titleMap[pageId].sub;
  }
}

// Click Listeners for Sidebar Links
document.querySelectorAll('.menu-item').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const page = link.getAttribute('data-page');
    navigateTo(page);
  });
});

// Chart Initialization
function initCharts() {
  // Dashboard Telemetry Chart
  const ctx = document.getElementById('trendsChart').getContext('2d');
  trendsChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['Lap 12', 'Lap 13', 'Lap 14', 'Lap 15', 'Lap 16', 'Lap 17', 'Lap 18'],
      datasets: [
        { label: 'You (Car A)', data: [240, 250, 255, 270, 275, 280, 284], borderColor: '#0088ff', tension: 0.3 },
        { label: 'Opponent (Car B)', data: [230, 235, 240, 250, 245, 255, 260], borderColor: '#ff9100', tension: 0.3 }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false }, ticks: { color: '#8a99ad', font: { size: 10 } } },
        y: { grid: { color: '#1a243d' }, ticks: { color: '#8a99ad', font: { size: 10 } } }
      }
    }
  });

  // History Chart
  const ctxHist = document.getElementById('historyChart').getContext('2d');
  historyChart = new Chart(ctxHist, {
    type: 'bar',
    data: {
      labels: ['Monaco', 'Silverstone', 'Spa', 'Monza'],
      datasets: [
        { label: 'Avg Battery Used (%)', data: [65, 88, 72, 80], backgroundColor: '#0088ff' },
        { label: 'Successful Overtakes', data: [1, 3, 5, 8], backgroundColor: '#00e676' }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { labels: { color: '#8a99ad' } } },
      scales: {
        x: { grid: { display: false }, ticks: { color: '#8a99ad' } },
        y: { grid: { color: '#1a243d' }, ticks: { color: '#8a99ad' } }
      }
    }
  });

  // Simulator Forecast Chart
  const ctxSim = document.getElementById('simForecastChart').getContext('2d');
  simForecastChart = new Chart(ctxSim, {
    type: 'line',
    data: {
      labels: ['Current', '+1 Lap', '+2 Laps', '+3 Laps', '+4 Laps', '+5 Laps'],
      datasets: [
        { label: 'Projected Gap (s)', data: [0.55, 0.42, 0.28, 0.12, -0.15, -0.40], borderColor: '#00e676', tension: 0.2 }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false }, ticks: { color: '#8a99ad' } },
        y: { grid: { color: '#1a243d' }, ticks: { color: '#8a99ad' } }
      }
    }
  });
}

// Canvas Ring Gauge Utility
function drawGauge(canvasId, percent, color) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const size = canvas.width;
  const stroke = 8;
  const radius = (size - stroke) / 2;
  
  ctx.clearRect(0, 0, size, size);

  ctx.beginPath();
  ctx.arc(size/2, size/2, radius, 0, 2 * Math.PI);
  ctx.strokeStyle = '#1a243d';
  ctx.lineWidth = stroke;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(size/2, size/2, radius, -Math.PI / 2, (-Math.PI / 2) + (2 * Math.PI * (percent / 100)));
  ctx.strokeStyle = color;
  ctx.lineWidth = stroke;
  ctx.lineCap = 'round';
  ctx.stroke();
}

// Screen Glow Management
function applyScreenGlow(action) {
  const overlay = document.getElementById('glow-overlay');
  const banner = document.getElementById('action-banner');
  const actionText = document.getElementById('action-text');

  if (!overlay || !banner) return;
  overlay.className = 'glow-overlay';

  if (action === 'ATTACK') {
    overlay.classList.add('glow-attack');
    banner.style.background = '#ff1744';
    banner.style.color = '#fff';
    actionText.innerText = 'ATTACK NOW';
  } else if (action === 'HOLD') {
    overlay.classList.add('glow-hold');
    banner.style.background = '#ffb300';
    banner.style.color = '#000';
    actionText.innerText = 'HOLD POSITION';
  } else if (action === 'SAVE') {
    overlay.classList.add('glow-save');
    banner.style.background = '#00e676';
    banner.style.color = '#000';
    actionText.innerText = 'SAVE ENERGY';
  }
}

// WebSocket Setup
function connectWebSocket() {
  const ws = new WebSocket('ws://localhost:8000/ws/telemetry');

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    updateDashboardUI(data);
  };

  ws.onclose = () => {
    setTimeout(connectWebSocket, 1000);
  };
}

function updateDashboardUI(data) {
  if (document.getElementById('hud-speed')) {
    document.getElementById('hud-speed').innerText = data.speed;
    document.getElementById('hud-battery').innerText = data.soc + '%';
    document.getElementById('telemetry-speed').innerHTML = `${data.speed} <small>km/h</small>`;
    document.getElementById('telemetry-gap').innerHTML = `${data.gap.toFixed(2)} <small>s</small>`;
    document.getElementById('telemetry-closing').innerHTML = `+${data.closing_speed} <small>km/h</small>`;
    document.getElementById('telemetry-soc').innerText = `${data.soc}%`;
    document.getElementById('telemetry-tyre').innerText = `${data.tyre}%`;
    document.getElementById('order-gap').innerText = `${data.gap.toFixed(2)}s`;

    drawGauge('gaugeOvertake', data.overtake_prob, '#00e676');
    document.getElementById('val-overtake').innerText = data.overtake_prob + '%';

    drawGauge('gaugeEnergy', data.energy_req, '#0088ff');
    document.getElementById('val-energy').innerText = data.energy_req + '%';

    drawGauge('gaugeRisk', data.risk_score, '#d500f9');
    document.getElementById('val-risk').innerText = data.risk_score + '%';

    document.getElementById('bar-confidence').style.width = data.confidence + '%';
    document.getElementById('val-confidence').innerText = data.confidence + '%';
    
    document.getElementById('bar-deployment').style.width = data.deployment + '%';
    document.getElementById('val-deployment').innerText = data.deployment + '%';

    applyScreenGlow(data.action);
  }
}

// Simulator Slider Label Updates
function updateSimVal(id) {
  const input = document.getElementById(id);
  const label = document.getElementById(`${id}-val`);
  if (input && label) label.innerText = input.value + '%';
}

// Advanced Simulator Execution
function runAdvancedSim() {
  const soc = parseInt(document.getElementById('full-sim-soc').value);
  const tyre = parseInt(document.getElementById('full-sim-tyre').value);
  const deploy = parseInt(document.getElementById('full-sim-deploy').value);

  const prob = Math.min(99, Math.round((soc * 0.3) + (tyre * 0.3) + (deploy * 0.4)));
  const cost = Math.round(deploy * 0.22);
  
  document.getElementById('adv-sim-prob').innerText = prob + '%';
  document.getElementById('adv-sim-cost').innerText = cost + '%';
  document.getElementById('adv-sim-badge').innerText = prob > 65 ? 'ATTACK RECOMMENDED' : 'HOLD RECOMMENDED';

  if (simForecastChart) {
    const trendMultiplier = prob > 65 ? -0.15 : 0.05;
    let baseGap = 0.55;
    const newData = [baseGap];
    for (let i = 1; i <= 5; i++) {
      baseGap += trendMultiplier;
      newData.push(Number(baseGap.toFixed(2)));
    }
    simForecastChart.data.datasets[0].data = newData;
    simForecastChart.update();
  }
}

function saveSettings(e) {
  e.preventDefault();
  alert('Settings saved successfully!');
}

window.onload = () => {
  initCharts();
  drawGauge('gaugeOvertake', 87, '#00e676');
  drawGauge('gaugeEnergy', 12, '#0088ff');
  drawGauge('gaugeRisk', 18, '#d500f9');
  connectWebSocket();
};
function showTime() {
	document.getElementById('currentTime').innerHTML = new Date().toUTCString();
}
showTime();
setInterval(function () {
	showTime();
}, 1000);
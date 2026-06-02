// State
let count = 0;
let timer = null;
let startTime = null;
let endTime = null;
let isRunning = false;
let selectedTime = 60; // Default 1 minute

// DOM
const timerEl = document.getElementById('timer');
const countEl = document.getElementById('count');
const countBtn = document.getElementById('countBtn');
const resetBtn = document.getElementById('resetBtn');
const restartBtn = document.getElementById('restartBtn');
const historyList = document.getElementById('historyList');
const tabs = document.querySelectorAll('.tab');
const pages = document.querySelectorAll('.page');
const timeOptions = document.querySelectorAll('.time-option');

// Init
updateHistoryList();
updateTimerDisplay();

// Tab switching
tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    tabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    pages.forEach(p => p.style.display = 'none');
    document.getElementById(`${tab.dataset.tab}-page`).style.display = 'block';
  });
});

// Time option selection
timeOptions.forEach(option => {
  option.addEventListener('click', () => {
    if (isRunning) return; // Can't change during session
    timeOptions.forEach(o => o.classList.remove('active'));
    option.classList.add('active');
    selectedTime = parseInt(option.dataset.time);
    updateTimerDisplay();
  });
});

// Count button - use touchstart for faster response
countBtn.addEventListener('touchstart', (e) => {
  e.preventDefault();
  if (!isRunning && count === 0) {
    startSession();
  }
  if (isRunning) {
    increment();
  }
}, { passive: false });

// Reset button
resetBtn.addEventListener('click', resetSession);

// Restart button
restartBtn.addEventListener('click', restartSession);

function updateTimerDisplay() {
  const minutes = Math.floor(selectedTime / 60);
  const seconds = selectedTime % 60;
  timerEl.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function startSession() {
  isRunning = true;
  startTime = Date.now();
  endTime = startTime + (selectedTime * 1000);
  countBtn.classList.remove('disabled');

  // Hide time selector during session
  document.getElementById('timeSelector').style.opacity = '0.5';
  document.getElementById('timeSelector').style.pointerEvents = 'none';

  // Start timer
  timer = setInterval(updateTimer, 100);
  updateTimer();
}

// Audio context for haptic feedback on iOS
let audioCtx = null;
function playClickSound() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();
  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);
  oscillator.frequency.value = 1000;
  gainNode.gain.value = 0.1; // Very quiet
  oscillator.start();
  oscillator.stop(audioCtx.currentTime + 0.01); // 10ms click
}

function increment() {
  count++;
  countEl.textContent = count;

  // Haptic feedback
  if (navigator.vibrate) {
    navigator.vibrate(10);
  } else {
    playClickSound(); // iOS fallback
  }

  // Button animation
  countBtn.style.transform = 'scale(0.95)';
  setTimeout(() => countBtn.style.transform = 'scale(1)', 50);
}

function updateTimer() {
  const remaining = Math.max(0, endTime - Date.now());
  const seconds = Math.floor(remaining / 1000);
  const ms = Math.floor((remaining % 1000) / 100);

  timerEl.textContent = `${seconds}:${ms.toString().padStart(1, '0')}`;

  if (remaining <= 0) {
    endSession();
  }
}

function endSession() {
  clearInterval(timer);
  isRunning = false;
  countBtn.classList.add('disabled');

  // Save to history
  const session = {
    id: Date.now(),
    date: new Date().toLocaleString('zh-CN'),
    count: count,
    duration: selectedTime,
    frequency: (count / selectedTime).toFixed(2)
  };

  saveSession(session);
  updateHistoryList();

  // Show reset button
  resetBtn.style.display = 'block';
  resetBtn.textContent = '开始新计数';
}

function resetSession() {
  count = 0;
  countEl.textContent = '0';
  resetBtn.style.display = 'none';
  countBtn.classList.remove('disabled');

  // Restore time selector
  document.getElementById('timeSelector').style.opacity = '1';
  document.getElementById('timeSelector').style.pointerEvents = 'auto';

  updateTimerDisplay();
}

function restartSession() {
  // Stop current timer
  if (timer) {
    clearInterval(timer);
    timer = null;
  }

  // Reset state without saving
  count = 0;
  countEl.textContent = '0';
  isRunning = false;
  resetBtn.style.display = 'none';
  countBtn.classList.remove('disabled');

  // Restore time selector
  document.getElementById('timeSelector').style.opacity = '1';
  document.getElementById('timeSelector').style.pointerEvents = 'auto';

  updateTimerDisplay();
}

// History storage
function saveSession(session) {
  const history = getHistory();
  history.unshift(session);
  localStorage.setItem('counter_history', JSON.stringify(history));
}

function getHistory() {
  try {
    return JSON.parse(localStorage.getItem('counter_history')) || [];
  } catch {
    return [];
  }
}

function deleteSession(id) {
  const history = getHistory().filter(s => s.id !== id);
  localStorage.setItem('counter_history', JSON.stringify(history));
  updateHistoryList();
}

function updateHistoryList() {
  const history = getHistory();

  if (history.length === 0) {
    historyList.innerHTML = '<div class="empty-state">暂无历史记录</div>';
    return;
  }

  historyList.innerHTML = history.map(session => {
    const durationText = session.duration === 30 ? '30秒' :
                        session.duration === 60 ? '1分钟' : '2分钟';
    return `
      <div class="history-item">
        <div class="history-info">
          <h4>${session.date}</h4>
          <p>${durationText}</p>
        </div>
        <div style="display:flex;align-items:center;">
          <div class="history-count">${session.count}</div>
          <button class="delete-btn" onclick="deleteSession(${session.id})">删除</button>
        </div>
      </div>
    `;
  }).join('');
}

// Prevent multi-touch zoom only (allow fast tapping)
document.addEventListener('touchstart', function(e) {
  if (e.touches.length > 1) {
    e.preventDefault();
  }
}, { passive: false });

document.addEventListener('gesturestart', function(e) {
  e.preventDefault();
});

// Register service worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('service-worker.js')
    .then(reg => console.log('Service Worker registered'))
    .catch(err => console.log('Service Worker failed:', err));
}

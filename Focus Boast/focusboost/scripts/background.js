let timeRemaining = 25 * 60; // 25 minutes in seconds
let timerRunning = false;
let timerInterval;

function startTimer() {
  if (!timerRunning) {
    timerRunning = true;
    timerInterval = setInterval(() => {
      if (timeRemaining > 0) {
        timeRemaining--;
        chrome.storage.local.set({ timeRemaining });
        // Check if there's 1 minute left
        if (timeRemaining === 60) {
          chrome.notifications.create({
            type: 'basic',
            iconUrl: chrome.runtime.getURL('icons/icon.png'),
            title: 'FocusBoost',
            message: '1 minute remaining!'
          });
        }
      } else {
        stopTimer();
        chrome.notifications.create({
          type: 'basic',
          iconUrl: chrome.runtime.getURL('icons/icon.png'),
          title: 'FocusBoost',
          message: 'Let\'s take a break for 5 minutes!'
        });
      }
    }, 1000);
  }
}

function stopTimer() {
  timerRunning = false;
  clearInterval(timerInterval);
}

function resetTimer() {
  stopTimer();
  timeRemaining = 25 * 60; // Reset to 25 minutes
  chrome.storage.local.set({ timeRemaining });
  updateDisplay();
}

function updateDisplay() {
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  const timeString = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  chrome.storage.local.set({ timeString });
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.command) {
    case 'start':
      startTimer();
      sendResponse({ timeRemaining });
      break;
    case 'stop':
      stopTimer();
      sendResponse({ timeRemaining });
      break;
    case 'reset':
      resetTimer();
      sendResponse({ timeRemaining });
      break;
    case 'getTime':
      sendResponse({ timeRemaining });
      break;
    default:
      console.error(`Unknown command: ${message.command}`);
  }
});

chrome.storage.local.get('timeRemaining', (data) => {
  if (data.timeRemaining) {
    timeRemaining = data.timeRemaining;
    updateDisplay();
  }
});

// Initialize display
updateDisplay();

// Function to test notifications
function testNotification() {
  chrome.notifications.create({
    type: 'basic',
    iconUrl: chrome.runtime.getURL('icons/icon.png'),
    title: 'Test Notification',
    message: 'This is a test notification from FocusBoost.'
  }, (notificationId) => {
    if (chrome.runtime.lastError) {
      console.error(`Notification error: ${chrome.runtime.lastError.message}`);
    } else {
      console.log(`Test notification created with ID: ${notificationId}`);
    }
  });
}

// Call the test function to verify notifications
testNotification();

document.addEventListener('DOMContentLoaded', function() {
  const timeDisplay = document.getElementById('time');
  const startButton = document.getElementById('start');
  const stopButton = document.getElementById('stop');
  const resetButton = document.getElementById('reset');
  const newGoalInput = document.getElementById('new-goal');
  const goalTimeInput = document.getElementById('goal-time');
  const addGoalButton = document.getElementById('add-goal');
  const goalList = document.getElementById('goal-list');
  const motivationalQuote = document.getElementById('motivational-quote');

  const quotes = [
    "Keep going, you’re getting there!",
    "Believe in yourself!",
    "Success is not final, failure is not fatal: It is the courage to continue that counts.",
    "You are capable of amazing things.",
    "Dream big and dare to fail."
  ];

  function updateTimerDisplay(minutes, seconds) {
    timeDisplay.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  }

  function sendMessage(command) {
    chrome.runtime.sendMessage({ command }, (response) => {
      if (chrome.runtime.lastError) {
        console.error(`Error sending message: ${chrome.runtime.lastError}`);
      } else {
        if (response) {
          // Ensure the response contains valid minutes and seconds
          const minutes = Math.floor(response.timeRemaining / 60);
          const seconds = response.timeRemaining % 60;
          updateTimerDisplay(minutes, seconds);
        }
      }
    });
  }

  startButton.addEventListener('click', () => sendMessage('start'));
  stopButton.addEventListener('click', () => sendMessage('stop'));
  resetButton.addEventListener('click', () => sendMessage('reset'));
  addGoalButton.addEventListener('click', addGoal);
  loadGoals();

  function addGoal() {
    const goalText = newGoalInput.value;
    const goalTime = goalTimeInput.value;
    if (goalText && goalTime) {
      const listItem = document.createElement('li');
      listItem.innerHTML = `${goalText} <span>(Due by ${goalTime})</span>`;
      const removeButton = document.createElement('button');
      removeButton.textContent = 'Remove';
      removeButton.addEventListener('click', () => {
        goalList.removeChild(listItem);
        saveGoals();
      });
      listItem.appendChild(removeButton);
      goalList.appendChild(listItem);
      newGoalInput.value = '';
      goalTimeInput.value = '';
      saveGoals();
    }
  }

  function saveGoals() {
    const goals = [];
    goalList.querySelectorAll('li').forEach(item => {
      goals.push(item.innerHTML);
    });
    chrome.storage.local.set({ goals });
  }

  function loadGoals() {
    chrome.storage.local.get('goals', (data) => {
      if (data.goals) {
        data.goals.forEach(goalText => {
          const listItem = document.createElement('li');
          listItem.innerHTML = goalText;
          const removeButton = document.createElement('button');
          removeButton.textContent = 'Remove';
          removeButton.addEventListener('click', () => {
            goalList.removeChild(listItem);
            saveGoals();
          });
          listItem.appendChild(removeButton);
          goalList.appendChild(listItem);
        });
      }
    });
  }

  function updateMotivationalQuote() {
    const randomIndex = Math.floor(Math.random() * quotes.length);
    motivationalQuote.textContent = quotes[randomIndex];
  }

  setInterval(updateMotivationalQuote, 30 * 60 * 1000); // 30 minutes
  updateMotivationalQuote();

  chrome.storage.local.get('timeRemaining', (data) => {
    if (data.timeRemaining) {
      const minutes = Math.floor(data.timeRemaining / 60);
      const seconds = data.timeRemaining % 60;
      updateTimerDisplay(minutes, seconds);
    }
  });

  chrome.storage.onChanged.addListener((changes) => {
    if (changes.timeRemaining) {
      const minutes = Math.floor(changes.timeRemaining.newValue / 60);
      const seconds = changes.timeRemaining.newValue % 60;
      updateTimerDisplay(minutes, seconds);
    }
  });
});

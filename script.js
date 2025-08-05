// Google Sheets configuration
const SPREADSHEET_ID = '1Dm7njHFDpc5T3t-V_pVfT-IUDicfdyKS_9GvT2iXcIg';
const API_KEY = 'AIzaSyCVf1vh7VRDdB1asT52jgVJUlp4eMveKug';
const SHEET_NAME = 'Users';
const RANGE = 'A:B'; // Column A: Name, Column B: Age

// DOM Elements
const screens = {
    welcome: document.getElementById('welcome-screen'),
    name: document.getElementById('name-screen'),
    age: document.getElementById('age-screen'),
    leaderboard: document.getElementById('leaderboard-screen')
};
const loading = document.getElementById('loading');

// Navigation functions
function showScreen(screenId) {
    Object.values(screens).forEach(screen => screen.classList.remove('active'));
    screens[screenId].classList.add('active');
}

// Event Listeners
document.getElementById('start-btn').addEventListener('click', () => {
    showScreen('name');
});

document.getElementById('name-next').addEventListener('click', () => {
    const userName = document.getElementById('user-name').value.trim();
    if (userName) {
        document.getElementById('display-name').textContent = userName;
        showScreen('age');
    } else {
        alert('Please enter your name');
    }
});

document.getElementById('submit-age').addEventListener('click', async () => {
    const userName = document.getElementById('user-name').value.trim();
    const userAge = parseInt(document.getElementById('user-age').value);
    
    if (userName && !isNaN(userAge) {
        loading.style.display = 'flex';
        
        try {
            // Save data to Google Sheets
            await saveToGoogleSheets(userName, userAge);
            
            // Load and display leaderboard
            await loadLeaderboard();
            showScreen('leaderboard');
        } catch (error) {
            console.error('Error:', error);
            alert('Something went wrong. Please try again.');
        } finally {
            loading.style.display = 'none';
        }
    } else {
        alert('Please enter valid name and age');
    }
});

document.getElementById('new-entry').addEventListener('click', () => {
    // Reset form
    document.getElementById('user-name').value = '';
    document.getElementById('user-age').value = '';
    showScreen('name');
});

// Google Sheets functions
async function saveToGoogleSheets(name, age) {
    const scriptUrl = 'https://script.google.com/macros/s/AKfycbwqoAWYxinPKV1K0OVkBGi1AyYNxnFWYy5EerynwgkOSHKTRRimUslKo1f2tplTjG9ANw/exec'; // Replace with your Apps Script URL
    
    const response = await fetch(scriptUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, age }),
    });
    
    const result = await response.json();
    if (!result.success) {
        throw new Error(result.error || 'Failed to save data');
    }
}

async function loadLeaderboard() {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${SHEET_NAME}!${RANGE}?key=${API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.values && data.values.length > 1) {
        // Skip header row and process data
        const entries = data.values.slice(1).map(row => ({
            name: row[0],
            age: parseInt(row[1])
        }));
        
        // Sort by age descending and take top 10
        const top10 = entries.sort((a, b) => b.age - a.age).slice(0, 10);
        displayLeaderboard(top10);
    } else {
        displayLeaderboard([]);
    }
}

function displayLeaderboard(entries) {
    const leaderboard = document.getElementById('leaderboard');
    leaderboard.innerHTML = '';
    
    if (entries.length === 0) {
        leaderboard.innerHTML = '<p>No entries yet. Be the first!</p>';
        return;
    }
    
    entries.forEach((entry, index) => {
        const item = document.createElement('div');
        item.className = 'leaderboard-item';
        item.innerHTML = `
            <span>${index + 1}. ${entry.name}</span>
            <span>${entry.age}</span>
        `;
        leaderboard.appendChild(item);
    });
}

// Initialize
showScreen('welcome');
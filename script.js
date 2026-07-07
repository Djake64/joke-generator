// DOM Elements
const getJokeBtn = document.getElementById('getJokeBtn');
const copyBtn = document.getElementById('copyBtn');
const categorySelect = document.getElementById('categorySelect');
const nsfwToggle = document.getElementById('nsfwToggle');
const jokeDisplay = document.getElementById('jokeDisplay');
const spinner = document.getElementById('loadingSpinner');
const errorMessage = document.getElementById('errorMessage');

// API Configuration
const JOKE_API_URL = 'https://v2.jokeapi.dev/joke';
let currentJoke = '';

// Event Listeners
getJokeBtn.addEventListener('click', fetchJoke);
copyBtn.addEventListener('click', copyToClipboard);

// Fetch joke from API
async function fetchJoke() {
    try {
        // Show loading state
        spinner.style.display = 'block';
        getJokeBtn.disabled = true;
        copyBtn.style.display = 'none';
        errorMessage.style.display = 'none';
        jokeDisplay.innerHTML = '<p class="placeholder">Loading...</p>';

        // Build API URL with parameters
        let url = JOKE_API_URL;
        const category = categorySelect.value;
        const nsfwAllowed = nsfwToggle.checked;

        if (category) {
            url += `/${category}`;
        } else {
            url += '/Any';
        }

        // Add query parameters
        const params = new URLSearchParams();
        if (!nsfwAllowed) {
            params.append('blacklistFlags', 'nsfw,religious,political,racist,sexist,explicit');
        }
        params.append('format', 'json');

        if (params.toString()) {
            url += `?${params.toString()}`;
        }

        // Fetch from API
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // Check if joke was found
        if (data.error) {
            throw new Error('No jokes found for this category. Try another!');
        }

        // Format joke
        if (data.type === 'twopart') {
            currentJoke = `${data.setup}\n\n${data.delivery}`;
        } else {
            currentJoke = data.joke;
        }

        // Display joke
        displayJoke(currentJoke);
        copyBtn.style.display = 'inline-block';

    } catch (error) {
        showError(error.message);
        console.error('Error fetching joke:', error);
    } finally {
        spinner.style.display = 'none';
        getJokeBtn.disabled = false;
    }
}

// Display joke in the UI
function displayJoke(joke) {
    jokeDisplay.innerHTML = `<p>${joke.replace(/\n/g, '<br>')}</p>`;
}

// Show error message
function showError(message) {
    errorMessage.textContent = `❌ Error: ${message}`;
    errorMessage.style.display = 'block';
    jokeDisplay.innerHTML = '<p class="placeholder">No joke to display. Try again!</p>';
}

// Copy joke to clipboard
function copyToClipboard() {
    if (!currentJoke) return;

    navigator.clipboard.writeText(currentJoke).then(() => {
        // Show success feedback
        const originalText = copyBtn.textContent;
        copyBtn.textContent = '✓ Copied!';
        copyBtn.style.background = '#4caf50';

        setTimeout(() => {
            copyBtn.textContent = originalText;
            copyBtn.style.background = '';
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy:', err);
        alert('Failed to copy to clipboard');
    });
}

// Fetch a joke on page load
window.addEventListener('load', () => {
    fetchJoke();
});
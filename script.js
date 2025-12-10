// Configuration
const GITHUB_USERNAME = 'rhamenator';
const GITHUB_API = 'https://api.github.com';

// Language colors (from GitHub's language colors)
const LANGUAGE_COLORS = {
    'JavaScript': '#f1e05a',
    'TypeScript': '#3178c6',
    'Python': '#3572A5',
    'Java': '#b07219',
    'C++': '#f34b7d',
    'C': '#555555',
    'C#': '#178600',
    'PHP': '#4F5D95',
    'Ruby': '#701516',
    'Go': '#00ADD8',
    'Rust': '#dea584',
    'Swift': '#ffac45',
    'Kotlin': '#A97BFF',
    'HTML': '#e34c26',
    'CSS': '#563d7c',
    'Shell': '#89e051',
    'Vue': '#41b883',
    'React': '#61dafb',
    'Dart': '#00B4AB',
    'Scala': '#c22d40',
    'R': '#198CE7',
    'Objective-C': '#438eff',
    'Perl': '#0298c3',
    'Lua': '#000080',
    'Haskell': '#5e5086',
    'Elixir': '#6e4a7e',
    'Clojure': '#db5855',
    'Julia': '#a270ba',
    'MATLAB': '#e16737',
};

// State
let repositories = [];
let currentSort = 'updated';

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initializeTheme();
    setupEventListeners();
    loadUserData();
    loadRepositories();
    setCurrentYear();
});

// Theme Management
function initializeTheme() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
}

function updateThemeIcon(theme) {
    const themeIcon = document.querySelector('.theme-icon');
    themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
}

// Event Listeners
function setupEventListeners() {
    document.getElementById('themeToggle').addEventListener('click', toggleTheme);
    document.getElementById('sortSelect').addEventListener('change', (e) => {
        currentSort = e.target.value;
        sortAndRenderRepositories();
    });
}

// API Calls
async function loadUserData() {
    try {
        const response = await fetch(`${GITHUB_API}/users/${GITHUB_USERNAME}`);
        if (!response.ok) throw new Error('Failed to fetch user data');
        
        const data = await response.json();
        updateProfileUI(data);
    } catch (error) {
        console.error('Error loading user data:', error);
    }
}

async function loadRepositories() {
    try {
        showLoadingState();
        
        // Fetch all repositories (public only)
        const response = await fetch(`${GITHUB_API}/users/${GITHUB_USERNAME}/repos?per_page=100&sort=updated`);
        if (!response.ok) throw new Error('Failed to fetch repositories');
        
        repositories = await response.json();
        
        // Filter out forks if desired and sort
        sortAndRenderRepositories();
        hideLoadingState();
    } catch (error) {
        console.error('Error loading repositories:', error);
        showErrorState();
    }
}

// UI Updates
function updateProfileUI(userData) {
    document.getElementById('profileAvatar').src = userData.avatar_url;
    document.getElementById('profileName').textContent = userData.name || userData.login;
    document.getElementById('profileBio').textContent = userData.bio || 'GitHub Developer';
    document.getElementById('repoCount').textContent = userData.public_repos;
    document.getElementById('followerCount').textContent = userData.followers;
    document.getElementById('followingCount').textContent = userData.following;
    document.getElementById('profileLink').href = userData.html_url;
    document.getElementById('footerName').textContent = userData.name || userData.login;
}

function sortAndRenderRepositories() {
    const sorted = [...repositories].sort((a, b) => {
        switch (currentSort) {
            case 'stars':
                return b.stargazers_count - a.stargazers_count;
            case 'name':
                return a.name.localeCompare(b.name);
            case 'updated':
            default:
                return new Date(b.updated_at) - new Date(a.updated_at);
        }
    });
    renderRepositories(sorted);
}

function renderRepositories(repos) {
    const grid = document.getElementById('repoGrid');
    grid.innerHTML = '';
    
    repos.forEach(repo => {
        const card = createRepoCard(repo);
        grid.appendChild(card);
    });
}

function createRepoCard(repo) {
    const card = document.createElement('div');
    card.className = 'repo-card';
    
    const description = repo.description 
        ? `<p class="repo-description">${escapeHtml(repo.description)}</p>` 
        : '<p class="repo-description" style="font-style: italic; opacity: 0.7;">No description provided</p>';
    
    const language = repo.language 
        ? `<div class="repo-language">
               <span class="language-color" style="background-color: ${LANGUAGE_COLORS[repo.language] || '#858585'}"></span>
               <span>${repo.language}</span>
           </div>`
        : '';
    
    const visibility = repo.private 
        ? '<span class="repo-visibility">Private</span>'
        : '<span class="repo-visibility">Public</span>';
    
    card.innerHTML = `
        <div class="repo-header">
            <span class="repo-icon">📦</span>
            <div class="repo-title">
                <a href="${repo.html_url}" target="_blank" rel="noopener noreferrer" class="repo-name">
                    ${escapeHtml(repo.name)}
                </a>
                ${visibility}
            </div>
        </div>
        ${description}
        <div class="repo-meta">
            ${language}
            <div class="repo-stats">
                <div class="stat-item" title="Stars">
                    ⭐ ${repo.stargazers_count}
                </div>
                <div class="stat-item" title="Forks">
                    🔱 ${repo.forks_count}
                </div>
            </div>
            ${repo.fork ? '<span class="repo-meta-item" title="Forked repository">🔄 Fork</span>' : ''}
        </div>
    `;
    
    return card;
}

// Helper Functions
function showLoadingState() {
    document.getElementById('loadingState').style.display = 'block';
    document.getElementById('errorState').style.display = 'none';
    document.getElementById('repoGrid').style.display = 'none';
}

function hideLoadingState() {
    document.getElementById('loadingState').style.display = 'none';
    document.getElementById('repoGrid').style.display = 'grid';
}

function showErrorState() {
    document.getElementById('loadingState').style.display = 'none';
    document.getElementById('errorState').style.display = 'block';
    document.getElementById('repoGrid').style.display = 'none';
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function setCurrentYear() {
    document.getElementById('currentYear').textContent = new Date().getFullYear();
}

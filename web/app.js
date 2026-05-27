// Initialize state
let currentTab = 'today';
let dayOverride = localStorage.getItem('gym_day_override') || null; 

// DOM Elements
const headerTitle = document.getElementById('header-title');
const headerDate = document.getElementById('header-date');
const mainContent = document.getElementById('main-content');
const navItems = document.querySelectorAll('.nav-item');

// Initialize App
function init() {
    setupNavigation();
    renderTab(currentTab);
    lucide.createIcons();
}

// Helpers for date and storage
function getTodayDateString() {
    const d = new Date();
    return `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`;
}

function getCurrentDayIndex() {
    if (dayOverride !== null) return parseInt(dayOverride);
    const d = new Date();
    return d.getDay(); // 0 is Sunday, 1 is Monday...
}

function getTaskKey(taskId) {
    return `gym_${getTodayDateString()}_${taskId}`;
}

function isTaskCompleted(taskId) {
    return localStorage.getItem(getTaskKey(taskId)) === 'true';
}

function toggleTask(taskId, element, isCheck, callback) {
    const newState = !isTaskCompleted(taskId);
    if (newState) {
        localStorage.setItem(getTaskKey(taskId), 'true');
        element.classList.add('completed');
    } else {
        localStorage.removeItem(getTaskKey(taskId));
        element.classList.remove('completed');
    }
    if(callback) callback();
}

// Navigation Logic
function setupNavigation() {
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            navItems.forEach(n => n.classList.remove('active'));
            item.classList.add('active');
            currentTab = item.dataset.tab;
            renderTab(currentTab);
        });
    });
}

// Render Router
function renderTab(tab) {
    mainContent.innerHTML = ''; // Clear content
    mainContent.className = 'main-scrollable tab-content'; // reset animation
    
    // Trigger reflow for animation restart
    void mainContent.offsetWidth; 

    if (tab === 'today') renderTodayTab();
    else if (tab === 'plan') renderPlanTab();
    else if (tab === 'profile') renderProfileTab();
    
    lucide.createIcons();
}

// --- TAB RENDERING: TODAY ---
function renderTodayTab() {
    headerTitle.textContent = "Today's Plan";
    
    const dayIndex = getCurrentDayIndex();
    const todayData = GYM_DATA.dailyRoutines[dayIndex.toString()];
    
    const dateOpts = { weekday: 'long', month: 'short', day: 'numeric' };
    const dateStr = (dayOverride !== null ? "[Debug Mode] " : "") + new Date().toLocaleDateString('en-US', dateOpts);
    headerDate.textContent = `${dateStr} • ${todayData.dayName}`;

    // Compute progress
    const allTasks = [...todayData.meals, ...todayData.workouts];
    let completedCount = 0;
    allTasks.forEach(t => {
        if (isTaskCompleted(t.id)) completedCount++;
    });
    const progressPercent = allTasks.length === 0 ? 0 : Math.round((completedCount / allTasks.length) * 100);

    const html = `
        <div class="progress-card">
            <div class="progress-info">
                <h3>${todayData.workoutType}</h3>
                <p>${completedCount} of ${allTasks.length} completed</p>
            </div>
            <div class="circular-progress" style="--progress: ${progressPercent}%">
                <span class="progress-value">${progressPercent}%</span>
            </div>
        </div>

        ${todayData.meals.length > 0 ? `
        <div class="section-title">
            <i data-lucide="utensils"></i> Nutrition Plan
        </div>
        <div class="task-group" id="meal-list">
            ${todayData.meals.map(meal => createTaskHTML(meal, 'time')).join('')}
        </div>
        ` : ''}

        ${todayData.workouts.length > 0 ? `
        <div class="section-title">
            <i data-lucide="dumbbell"></i> Workout Routine
        </div>
        ${todayData.warmup !== "无" ? `<div class="content-card" style="padding: 12px 16px; margin-bottom: 16px;"><p style="margin:0; font-size:13px"><strong style="color:var(--accent-secondary)">Warmup:</strong> ${todayData.warmup}</p></div>` : ''}
        <div class="task-group" id="workout-list">
            ${todayData.workouts.map(wo => createTaskHTML(wo, 'sets')).join('')}
        </div>
        ` : ''}
    `;
    
    mainContent.innerHTML = html;
    
    // Attach listeners
    allTasks.forEach(t => {
        const el = document.getElementById(`task-${t.id}`);
        if(el) {
            el.addEventListener('click', () => {
                toggleTask(t.id, el, null, () => {
                    // Update progress ring dynamically without full re-render
                    updateProgressRing(allTasks);
                });
            });
        }
    });
}

function createTaskHTML(item, badgeKey) {
    const isDone = isTaskCompleted(item.id);
    const title = item.title || item.name;
    const meta = item.desc || item.remark;
    const badgeVal = item[badgeKey];
    
    return `
        <div class="task-card ${isDone ? 'completed' : ''}" id="task-${item.id}">
            <div class="checkbox-wrapper">
                <div class="custom-checkbox">
                    <i data-lucide="check"></i>
                </div>
            </div>
            <div class="task-content">
                <div class="task-title">${title}</div>
                <div class="task-meta">
                    ${badgeVal ? `<span class="badge ${badgeKey === 'time' ? 'time' : ''}">${badgeVal}</span>` : ''}
                    <span>${meta}</span>
                </div>
            </div>
        </div>
    `;
}

function updateProgressRing(allTasks) {
    let completedCount = 0;
    allTasks.forEach(t => {
        if (isTaskCompleted(t.id)) completedCount++;
    });
    const progressPercent = allTasks.length === 0 ? 0 : Math.round((completedCount / allTasks.length) * 100);
    
    const progressEl = document.querySelector('.circular-progress');
    const valEl = document.querySelector('.progress-value');
    const infoEl = document.querySelector('.progress-info p');
    
    if(progressEl) progressEl.style.setProperty('--progress', `${progressPercent}%`);
    if(valEl) valEl.textContent = `${progressPercent}%`;
    if(infoEl) infoEl.textContent = `${completedCount} of ${allTasks.length} completed`;
}

// --- TAB RENDERING: PLAN ---
function renderPlanTab() {
    headerTitle.textContent = "Knowledge Base";
    headerDate.textContent = "Full program references";

    const html = `
        <div class="section-title"><i data-lucide="calendar"></i> Weekly Overview</div>
        <div class="content-card">
            ${GYM_DATA.weeklyOverview.map(w => `
                <div class="profile-stat">
                    <span class="profile-stat-label" style="min-width: 40px">${w.day}</span>
                    <span class="profile-stat-value" style="text-align:right; font-size:13px">${w.morning} <br> <span style="color:var(--text-tertiary)">${w.evening}</span></span>
                </div>
            `).join('')}
        </div>

        <div class="section-title"><i data-lucide="pill"></i> Supplements</div>
        <div class="content-card">
            ${GYM_DATA.supplements.map(s => `
                <div style="margin-bottom: 12px; border-bottom: 1px solid var(--bg-surface-elevated); padding-bottom: 8px;">
                    <div style="font-weight: 600; color: var(--accent-primary)">${s.name}</div>
                    <div style="font-size: 13px; color: var(--text-secondary); margin-top: 4px;">
                        <span class="badge">${s.dose}</span> ${s.time}
                    </div>
                </div>
            `).join('')}
        </div>

        <div class="section-title"><i data-lucide="alert-triangle"></i> Hard Rules</div>
        <div class="content-card">
            <ul style="padding-left: 20px;">
                ${GYM_DATA.rules.map(r => `<li style="margin-bottom: 8px">${r}</li>`).join('')}
            </ul>
        </div>
    `;
    mainContent.innerHTML = html;
}

// --- TAB RENDERING: PROFILE ---
function renderProfileTab() {
    headerTitle.textContent = "Profile Settings";
    headerDate.textContent = "Manage your data";

    const p = GYM_DATA.profile;

    const html = `
        <div class="section-title"><i data-lucide="user"></i> Metrics</div>
        <div class="content-card">
            <div class="profile-stat"><span class="profile-stat-label">Height / Weight</span><span class="profile-stat-value">${p.height} / ${p.weight}</span></div>
            <div class="profile-stat"><span class="profile-stat-label">Body Fat</span><span class="profile-stat-value">${p.bodyFat} ➔ <span style="color:var(--accent-primary)">${p.targetBodyFat}</span></span></div>
            <div class="profile-stat"><span class="profile-stat-label">BMR</span><span class="profile-stat-value">${p.bmr}</span></div>
            <div class="profile-stat"><span class="profile-stat-label">Target Weight</span><span class="profile-stat-value" style="color:var(--accent-primary)">${p.targetWeight}</span></div>
        </div>

        <div class="section-title"><i data-lucide="settings"></i> Debug & Settings</div>
        <div class="content-card">
            <label class="profile-stat-label" style="display:block; margin-bottom: 8px">Force Day Override (Testing)</label>
            <select id="day-override" class="select-override">
                <option value="none">Auto (Today)</option>
                <option value="1">Monday (周一)</option>
                <option value="2">Tuesday (周二)</option>
                <option value="3">Wednesday (周三)</option>
                <option value="4">Thursday (周四)</option>
                <option value="5">Friday (周五)</option>
                <option value="6">Saturday (周六)</option>
                <option value="0">Sunday (周日)</option>
            </select>
            <p style="font-size: 11px; color: var(--status-warning); margin-top: 8px;">
                Change this to view and test other days without waiting for tomorrow.
            </p>
        </div>
        
        <button id="clear-cache" class="btn-danger">
            Clear Local Progress Data
        </button>
    `;
    mainContent.innerHTML = html;

    // Attach listeners
    const overrideSelect = document.getElementById('day-override');
    overrideSelect.value = dayOverride !== null ? dayOverride : "none";
    overrideSelect.addEventListener('change', (e) => {
        if(e.target.value === "none") {
            localStorage.removeItem('gym_day_override');
            dayOverride = null;
        } else {
            localStorage.setItem('gym_day_override', e.target.value);
            dayOverride = e.target.value;
        }
    });

    const clearBtn = document.getElementById('clear-cache');
    clearBtn.addEventListener('click', () => {
        if(confirm("Are you sure you want to clear all completion data?")) {
            // keep override setting, clear gym_* keys
            Object.keys(localStorage).forEach(key => {
                if(key.startsWith('gym_202')) {
                    localStorage.removeItem(key);
                }
            });
            alert("Progress cleared.");
        }
    });
}

// Start app
window.addEventListener('DOMContentLoaded', init);

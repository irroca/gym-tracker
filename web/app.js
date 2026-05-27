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
}

// Helpers for date and storage
function getTodayDateString() {
    const d = new Date();
    return `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`;
}

function getCurrentDayIndex() {
    if (dayOverride !== null) return parseInt(dayOverride);
    const d = new Date();
    return d.getDay();
}

function getTaskKey(taskId) {
    return `gym_${getTodayDateString()}_${taskId}`;
}

function isTaskCompleted(taskId) {
    return localStorage.getItem(getTaskKey(taskId)) === 'true';
}

function toggleTask(taskId, element, isSubTask = false, parentId = null) {
    const newState = !isTaskCompleted(taskId);
    if (newState) {
        localStorage.setItem(getTaskKey(taskId), 'true');
        element.classList.add('completed');
    } else {
        localStorage.removeItem(getTaskKey(taskId));
        element.classList.remove('completed');
    }
    
    // If it's a sub-task, we might need to update the parent's visual state
    if (isSubTask && parentId) {
        checkParentCompletion(parentId);
    }
    
    updateProgressRing();
}

function checkParentCompletion(parentId) {
    const parentEl = document.getElementById(`task-${parentId}`);
    if (!parentEl) return;
    
    // Find all sub-tasks within this parent
    const subTasks = parentEl.querySelectorAll('.sub-task');
    let allDone = true;
    
    subTasks.forEach(st => {
        if (!st.classList.contains('completed')) {
            allDone = false;
        }
    });
    
    if (allDone && subTasks.length > 0) {
        parentEl.classList.add('completed');
    } else {
        parentEl.classList.remove('completed');
    }
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
    mainContent.innerHTML = '';
    mainContent.className = 'main-scrollable tab-content';
    void mainContent.offsetWidth; // Reflow

    if (tab === 'today') renderTodayTab();
    else if (tab === 'plan') renderPlanTab();
    else if (tab === 'profile') renderProfileTab();
    
    if(window.lucide) window.lucide.createIcons();
}

// --- TAB RENDERING: TODAY ---
function renderTodayTab() {
    headerTitle.textContent = "Today's Plan";
    
    const dayIndex = getCurrentDayIndex();
    const todayData = GYM_DATA.dailyRoutines[dayIndex.toString()];
    
    const dateOpts = { weekday: 'long', month: 'short', day: 'numeric' };
    const dateStr = (dayOverride !== null ? "[Debug Mode] " : "") + new Date().toLocaleDateString('en-US', dateOpts);
    headerDate.textContent = `${dateStr} • ${todayData.dayName}`;

    // Split workouts into morning and evening based on name
    const morningWorkouts = todayData.workouts.filter(w => !w.name.includes('【晚训】'));
    const eveningWorkouts = todayData.workouts.filter(w => w.name.includes('【晚训】'));

    let html = `
        <div class="progress-card">
            <div class="progress-info">
                <h3>${todayData.workoutType}</h3>
                <p id="progress-text">Calculating...</p>
            </div>
            <div class="circular-progress" style="--progress: 0%">
                <span class="progress-value">0%</span>
            </div>
        </div>
        
        <div class="timeline-container">
    `;

    // Render timeline based on meals array (which includes all chronological events)
    todayData.meals.forEach(item => {
        const isTraining = item.title.includes('早训') || item.title.includes('晚训');
        
        if (isTraining) {
            // It's a training block (Accordion)
            const isEvening = item.title.includes('晚训');
            const workouts = isEvening ? eveningWorkouts : morningWorkouts;
            
            // Initial completion check for the block
            const allCompleted = workouts.length > 0 && workouts.every(w => isTaskCompleted(w.id));
            
            html += `
                <div class="timeline-item is-training ${allCompleted ? 'completed' : ''}" id="task-${item.id}">
                    <div class="timeline-marker">
                        <div class="training-icon"><i data-lucide="dumbbell" style="width: 14px; height: 14px"></i></div>
                    </div>
                    
                    <div class="task-content accordion-header">
                        <div class="task-title">
                            ${item.time} ${item.title}
                            <i data-lucide="chevron-down" class="chevron-icon"></i>
                        </div>
                        <div class="task-meta">
                            ${workouts.length} 个训练动作
                        </div>
                        
                        <div class="accordion-content">
                            ${todayData.warmup !== "无" && !isEvening ? `<div style="font-size: 12px; color: var(--accent-secondary); margin-bottom: 8px;">热身: ${todayData.warmup}</div>` : ''}
                            ${workouts.map(w => {
                                const subDone = isTaskCompleted(w.id);
                                return `
                                    <div class="sub-task ${subDone ? 'completed' : ''}" id="subtask-${w.id}">
                                        <div class="custom-checkbox"><i data-lucide="check"></i></div>
                                        <div class="sub-task-content">
                                            <div class="sub-task-title">${w.name} <span class="badge" style="float:right">${w.sets}</span></div>
                                            <div class="sub-task-meta">${w.remark}</div>
                                        </div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>
                </div>
            `;
        } else {
            // It's a normal timeline item (Meal/Rest)
            const isDone = isTaskCompleted(item.id);
            html += `
                <div class="timeline-item ${isDone ? 'completed' : ''}" id="task-${item.id}">
                    <div class="timeline-marker">
                        <div class="custom-checkbox"><i data-lucide="check"></i></div>
                    </div>
                    
                    <div class="task-content">
                        <div class="task-title">${item.title}</div>
                        <div class="task-meta">
                            <span class="badge time">${item.time}</span>
                            <span>${item.desc}</span>
                        </div>
                    </div>
                </div>
            `;
        }
    });

    html += `</div>`; // Close timeline-container
    mainContent.innerHTML = html;
    
    attachTodayListeners(todayData);
    updateProgressRing();
}

function attachTodayListeners(todayData) {
    // Regular items
    todayData.meals.forEach(item => {
        const isTraining = item.title.includes('早训') || item.title.includes('晚训');
        if (!isTraining) {
            const el = document.getElementById(`task-${item.id}`);
            if(el) {
                // Click anywhere on the normal task card to toggle
                el.querySelector('.task-content').addEventListener('click', () => {
                    toggleTask(item.id, el);
                });
            }
        } else {
            // Accordion toggle
            const blockEl = document.getElementById(`task-${item.id}`);
            if (blockEl) {
                const header = blockEl.querySelector('.task-title');
                header.addEventListener('click', (e) => {
                    // Prevent triggering if clicked inside content
                    blockEl.classList.toggle('expanded');
                });
            }
        }
    });
    
    // Sub-tasks (Workouts)
    todayData.workouts.forEach(w => {
        const el = document.getElementById(`subtask-${w.id}`);
        if(el) {
            el.addEventListener('click', (e) => {
                e.stopPropagation(); // Stop accordion from toggling
                
                // Find parent id
                const parentBlock = el.closest('.timeline-item');
                const parentId = parentBlock ? parentBlock.id.replace('task-', '') : null;
                
                toggleTask(w.id, el, true, parentId);
            });
        }
    });
}

function updateProgressRing() {
    const dayIndex = getCurrentDayIndex();
    const todayData = GYM_DATA.dailyRoutines[dayIndex.toString()];
    
    let totalItems = 0;
    let completedItems = 0;
    
    // Count normal meals
    todayData.meals.forEach(m => {
        const isTraining = m.title.includes('早训') || m.title.includes('晚训');
        if (!isTraining) {
            totalItems++;
            if(isTaskCompleted(m.id)) completedItems++;
        }
    });
    
    // Count specific workouts
    todayData.workouts.forEach(w => {
        totalItems++;
        if(isTaskCompleted(w.id)) completedItems++;
    });
    
    const progressPercent = totalItems === 0 ? 0 : Math.round((completedItems / totalItems) * 100);
    
    const progressEl = document.querySelector('.circular-progress');
    const valEl = document.querySelector('.progress-value');
    const infoEl = document.getElementById('progress-text');
    
    if(progressEl) progressEl.style.setProperty('--progress', `${progressPercent}%`);
    if(valEl) valEl.textContent = `${progressPercent}%`;
    if(infoEl) infoEl.textContent = `${completedItems} of ${totalItems} tasks completed`;
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
        </div>
        
        <button id="clear-cache" class="btn-danger">
            Clear Local Progress Data
        </button>
    `;
    mainContent.innerHTML = html;

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

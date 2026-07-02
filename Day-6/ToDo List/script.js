/* ==========================================================================
   Zenith To-Do Application - Premium JS Logic
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // --- Application State ---
    let state = {
        tasks: [],
        categories: [],
        currentFilter: 'all',          // 'all', 'pinned', 'favorites', 'today', 'pending', 'completed', 'overdue', 'archived'
        currentCategory: null,         // If set, filters tasks by category name
        calendarSelectedDate: null,    // If set, filters tasks by specific date (YYYY-MM-DD)
        searchQuery: '',
        sortBy: 'order',               // 'order', 'dueDate', 'priority', 'alphabetical', 'createdAt', 'updatedAt'
        selectedTaskIds: new Set(),    // For bulk actions
        theme: 'dark',
        streak: 0,
        lastStreakDate: null,
        completedToday: 0,
        tipIndex: 0,
        reminderTimerId: null,
        undoBuffer: null               // Holds the last deleted task for undo
    };

    // --- Static Data Definitions ---
    const DEFAULT_CATEGORIES = [
        { name: 'Personal', color: '#ff4a5a' },
        { name: 'Work', color: '#3b82f6' },
        { name: 'Study', color: '#10b981' },
        { name: 'Shopping', color: '#f5a623' },
        { name: 'Fitness', color: '#ec4899' },
        { name: 'Finance', color: '#06b6d4' },
        { name: 'Travel', color: '#8b5cf6' }
    ];

    const MOTIVATIONAL_QUOTES = [
        { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
        { text: "Focus on being productive instead of busy.", author: "Tim Ferriss" },
        { text: "It always seems impossible until it's done.", author: "Nelson Mandela" },
        { text: "Productivity is being able to do things that you were never able to do before.", author: "Franz Kafka" },
        { text: "Action is the foundational key to all success.", author: "Pablo Picasso" },
        { text: "Your mind is for having ideas, not holding them.", author: "David Allen" },
        { text: "Done is better than perfect.", author: "Sheryl Sandberg" }
    ];

    const PRODUCTIVITY_TIPS = [
        "Try the Pomodoro Technique: Work for 25 minutes, then take a 5-minute break.",
        "Write down your top 3 tasks for the day before doing anything else.",
        "Group similar tasks together to minimize context switching.",
        "Clear your workspace and digital desktop to improve mental focus.",
        "Review your progress at the end of every week to adjust your goals.",
        "Snooze notifications during deep focus blocks.",
        "Celebrate small wins to maintain momentum and dopamine levels."
    ];

    // --- DOM Selectors ---
    const loadingScreen = document.getElementById('loading-screen');
    const appSidebar = document.getElementById('app-sidebar');
    const sidebarCloseBtn = document.getElementById('sidebar-close-btn');
    const sidebarToggleBtn = document.getElementById('sidebar-toggle-btn');
    const appSidepanel = document.getElementById('app-sidepanel');
    
    // Header & Dashboard
    const greetingText = document.getElementById('greeting-text');
    const liveTime = document.getElementById('live-time');
    const liveDate = document.getElementById('live-date');
    const streakCount = document.getElementById('streak-count');
    const productivityScore = document.getElementById('productivity-score');
    const quoteText = document.getElementById('quote-text');
    const quoteAuthor = document.getElementById('quote-author');
    const searchInput = document.getElementById('search-input');
    const themeToggleBtn = document.getElementById('theme-toggle');
    const sidebarThemeToggle = document.getElementById('sidebar-theme-toggle');
    
    // Stats cards
    const statTotal = document.getElementById('stat-total');
    const statCompleted = document.getElementById('stat-completed');
    const statPending = document.getElementById('stat-pending');
    
    // Toolbar & List
    const activeFilterTitle = document.getElementById('active-filter-title');
    const taskCountSubtitle = document.getElementById('task-count-subtitle');
    const sortSelect = document.getElementById('sort-select');
    const btnAddTaskMain = document.getElementById('btn-add-task-main');
    const btnEmptyStateAdd = document.getElementById('btn-empty-state-add');
    const fabAddTask = document.getElementById('fab-add-task');
    const taskList = document.getElementById('task-list');
    const emptyState = document.getElementById('empty-state');
    
    // Progress
    const completedTodayCountLabel = document.getElementById('completed-today-count');
    const progressBarFill = document.getElementById('progress-bar-fill');
    const progressPercentageLabel = document.getElementById('progress-percentage-label');
    
    // Sidebar list
    const sidebarCategoriesList = document.getElementById('sidebar-categories-list');
    const addCategoryBtn = document.getElementById('add-category-btn');
    
    // Calendar
    const calMonthYear = document.getElementById('cal-month-year');
    const calPrev = document.getElementById('cal-prev');
    const calNext = document.getElementById('cal-next');
    const calendarDays = document.getElementById('calendar-days');
    
    // Tips
    const tipText = document.getElementById('tip-text');
    const tipNextBtn = document.getElementById('tip-next-btn');
    
    // Sync Widget
    const btnExportData = document.getElementById('btn-export-data');
    const importFileInput = document.getElementById('import-file-input');

    // Modals
    const taskModal = document.getElementById('task-modal');
    const taskForm = document.getElementById('task-form');
    const taskEditId = document.getElementById('task-edit-id');
    const modalTitle = document.getElementById('modal-title');
    const btnCancelTask = document.getElementById('btn-cancel-task');
    const modalCloseTask = document.getElementById('modal-close-task');
    
    const detailsModal = document.getElementById('details-modal');
    const modalCloseDetails = document.getElementById('modal-close-details');
    const btnCloseDetails = document.getElementById('btn-close-details');
    const btnEditDetails = document.getElementById('btn-edit-details');
    const detailsStatusBadge = document.getElementById('details-status-badge');
    const detailsPriorityBadge = document.getElementById('details-priority-badge');
    const detailsTitle = document.getElementById('details-title');
    const detailsCategoryPill = document.getElementById('details-category-pill');
    const detailsDescription = document.getElementById('details-description');
    const detailsCreated = document.getElementById('details-created');
    const detailsDue = document.getElementById('details-due');
    const detailsReminder = document.getElementById('details-reminder');
    const detailsTags = document.getElementById('details-tags');
    
    const categoryModal = document.getElementById('category-modal');
    const categoryForm = document.getElementById('category-form');
    const modalCloseCategory = document.getElementById('modal-close-category');
    const btnCancelCategory = document.getElementById('btn-cancel-category');
    const categoryNameInput = document.getElementById('category-name-input');
    const categoryColorInput = document.getElementById('category-color-input');
    
    const exportModal = document.getElementById('export-modal');
    const modalCloseExport = document.getElementById('modal-close-export');
    
    const reminderPopup = document.getElementById('reminder-popup');
    const btnReminderSnooze = document.getElementById('btn-reminder-snooze');
    const btnReminderDismiss = document.getElementById('btn-reminder-dismiss');
    const reminderTaskTitle = document.getElementById('reminder-task-title');
    const reminderTaskDesc = document.getElementById('reminder-task-desc');
    const reminderTaskTime = document.getElementById('reminder-task-time');

    // Bulk actions
    const bulkActionBar = document.getElementById('bulk-action-bar');
    const bulkSelectAll = document.getElementById('bulk-select-all');
    const selectedCountLabel = document.getElementById('selected-count-label');
    const bulkCompleteBtn = document.getElementById('bulk-complete');
    const bulkArchiveBtn = document.getElementById('bulk-archive');
    const bulkExportBtn = document.getElementById('bulk-export');
    const bulkDeleteBtn = document.getElementById('bulk-delete');
    const bulkCloseBtn = document.getElementById('bulk-close');

    // Toast Notification Container
    const toastContainer = document.getElementById('toast-container');

    // Calendar navigation state
    let calendarDate = new Date();

    // --- Audio System ---
    function playChime() {
        try {
            const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            
            // Dual chime beeps
            const triggerTone = (freq, time, duration) => {
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, time);
                gain.gain.setValueAtTime(0.15, time);
                gain.gain.exponentialRampToValueAtTime(0.01, time + duration);
                osc.connect(gain);
                gain.connect(audioCtx.destination);
                osc.start(time);
                osc.stop(time + duration);
            };
            
            const now = audioCtx.currentTime;
            triggerTone(523.25, now, 0.2); // C5
            triggerTone(659.25, now + 0.15, 0.35); // E5
        } catch (e) {
            console.warn("Audio Context block or unsupported", e);
        }
    }

    function playSuccessChime() {
        try {
            const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            const now = audioCtx.currentTime;
            const triggerTone = (freq, time, duration) => {
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(freq, time);
                gain.gain.setValueAtTime(0.1, time);
                gain.gain.exponentialRampToValueAtTime(0.01, time + duration);
                osc.connect(gain);
                gain.connect(audioCtx.destination);
                osc.start(time);
                osc.stop(time + duration);
            };
            triggerTone(587.33, now, 0.1); // D5
            triggerTone(880, now + 0.1, 0.2); // A5
        } catch (e) {
            console.warn(e);
        }
    }

    // --- Initialization & Local Storage ---
    function init() {
        // Load settings & lists from Local Storage
        if (localStorage.getItem('zenith_theme')) {
            state.theme = localStorage.getItem('zenith_theme');
        } else {
            state.theme = 'dark';
        }
        applyTheme();

        if (localStorage.getItem('zenith_categories')) {
            state.categories = JSON.parse(localStorage.getItem('zenith_categories'));
        } else {
            state.categories = [...DEFAULT_CATEGORIES];
            saveCategories();
        }

        if (localStorage.getItem('zenith_tasks')) {
            state.tasks = JSON.parse(localStorage.getItem('zenith_tasks'));
        } else {
            // Load beautiful sample tasks so user sees content on first load
            state.tasks = [
                {
                    id: 'sample-1',
                    title: 'Welcome to Zenith! 🚀',
                    description: 'Explore the dashboard. Pinned tasks stay at the top. You can double-click a task title to view full details.',
                    category: 'Work',
                    priority: 'High',
                    dueDate: getFormattedDateOffset(0),
                    dueTime: '12:00',
                    reminder: '',
                    tags: ['zenith', 'onboarding'],
                    completed: false,
                    pinned: true,
                    favorite: true,
                    archived: false,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    order: 0
                },
                {
                    id: 'sample-2',
                    title: 'Try drag and drop to reorder me',
                    description: 'Click and drag on the cards handles (or the card body) to reorder your checklist items.',
                    category: 'Personal',
                    priority: 'Medium',
                    dueDate: getFormattedDateOffset(1),
                    dueTime: '18:00',
                    reminder: '',
                    tags: ['tips'],
                    completed: false,
                    pinned: false,
                    favorite: false,
                    archived: false,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    order: 1
                },
                {
                    id: 'sample-3',
                    title: 'Complete all pending tasks to see confetti! 🎉',
                    description: 'Finish all tasks matching your current view and witness the completion celebration!',
                    category: 'Study',
                    priority: 'Low',
                    dueDate: getFormattedDateOffset(0),
                    dueTime: '23:59',
                    reminder: '',
                    tags: ['fun'],
                    completed: false,
                    pinned: false,
                    favorite: false,
                    archived: false,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    order: 2
                }
            ];
            saveTasks();
        }

        state.streak = parseInt(localStorage.getItem('zenith_streak')) || 0;
        state.lastStreakDate = localStorage.getItem('zenith_last_streak_date') || null;
        state.completedToday = parseInt(localStorage.getItem('zenith_completed_today')) || 0;

        // Reset completed count if day changed
        const todayDateStr = getFormattedDateOffset(0);
        const lastActivityDate = localStorage.getItem('zenith_last_activity_date');
        if (lastActivityDate !== todayDateStr) {
            state.completedToday = 0;
            localStorage.setItem('zenith_completed_today', 0);
            localStorage.setItem('zenith_last_activity_date', todayDateStr);
            checkStreakHealth(todayDateStr);
        }

        // Quote & Tip Load
        const randQuote = MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)];
        quoteText.textContent = `"${randQuote.text}"`;
        quoteAuthor.textContent = `- ${randQuote.author}`;
        
        state.tipIndex = Math.floor(Math.random() * PRODUCTIVITY_TIPS.length);
        tipText.textContent = PRODUCTIVITY_TIPS[state.tipIndex];

        // Register Live Clock Loop
        updateClock();
        setInterval(updateClock, 1000);

        // Register Reminder Loop (Checks every 10 seconds)
        startReminderScanner();

        // Render UI panels
        renderCategories();
        renderCalendar();
        render();

        // Bind all interactive event listeners
        bindEvents();

        // Hide Loading Screen with a smooth fade
        setTimeout(() => {
            loadingScreen.classList.add('fade-out');
        }, 1200);
    }

    // Helper to calculate date offsets
    function getFormattedDateOffset(daysOffset) {
        const d = new Date();
        d.setDate(d.getDate() + daysOffset);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    }

    // Check if streak was broken (e.g. user missed a day)
    function checkStreakHealth(todayStr) {
        if (state.lastStreakDate) {
            const last = new Date(state.lastStreakDate);
            const today = new Date(todayStr);
            const diffTime = Math.abs(today - last);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            if (diffDays > 1) {
                state.streak = 0;
                localStorage.setItem('zenith_streak', 0);
                localStorage.setItem('zenith_last_streak_date', '');
            }
        }
    }

    // Save helpers
    function saveTasks() {
        localStorage.setItem('zenith_tasks', JSON.stringify(state.tasks));
    }

    function saveCategories() {
        localStorage.setItem('zenith_categories', JSON.stringify(state.categories));
    }

    // --- UI Render Loops ---
    function render() {
        renderTaskList();
        updateDashboardStats();
        updateBadges();
        lucide.createIcons();
    }

    // Live clock and date renderer
    function updateClock() {
        const now = new Date();
        let hours = now.getHours();
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        
        // Greeting Based on Time
        let greeting = "Good Evening";
        if (hours >= 5 && hours < 12) {
            greeting = "Good Morning";
        } else if (hours >= 12 && hours < 17) {
            greeting = "Good Afternoon";
        }
        greetingText.textContent = greeting;

        // Display clock (24h style)
        liveTime.textContent = `${String(hours).padStart(2, '0')}:${minutes}:${seconds}`;

        // Date String format: Monday, January 1, 2026
        const options = { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' };
        liveDate.textContent = now.toLocaleDateString('en-US', options);
    }

    // Category renderer
    function renderCategories() {
        sidebarCategoriesList.innerHTML = '';
        state.categories.forEach(cat => {
            const li = document.createElement('li');
            li.className = `category-item ${state.currentCategory === cat.name ? 'active' : ''}`;
            li.style.setProperty('--category-color', cat.color);
            li.setAttribute('data-category', cat.name);
            
            const taskCount = state.tasks.filter(t => t.category === cat.name && !t.archived && !t.completed).length;

            li.innerHTML = `
                <span class="category-dot"></span>
                <span class="category-name">${cat.name}</span>
                <span class="category-count">${taskCount}</span>
            `;

            li.addEventListener('click', () => {
                // Clear calendar selections and general filter states
                state.calendarSelectedDate = null;
                document.querySelectorAll('.calendar-day').forEach(el => el.classList.remove('selected'));
                document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
                
                if (state.currentCategory === cat.name) {
                    state.currentCategory = null;
                    state.currentFilter = 'all';
                    document.querySelector('[data-filter="all"]').classList.add('active');
                } else {
                    state.currentCategory = cat.name;
                    state.currentFilter = '';
                    li.classList.add('active');
                }
                
                state.selectedTaskIds.clear();
                toggleBulkActionBar();
                render();
            });

            sidebarCategoriesList.appendChild(li);
        });
    }

    // Badge totals on filters
    function updateBadges() {
        const counts = {
            all: state.tasks.filter(t => !t.archived).length,
            pinned: state.tasks.filter(t => t.pinned && !t.archived).length,
            favorites: state.tasks.filter(t => t.favorite && !t.archived).length,
            today: state.tasks.filter(t => t.dueDate === getFormattedDateOffset(0) && !t.archived).length,
            pending: state.tasks.filter(t => !t.completed && !t.archived).length,
            completed: state.tasks.filter(t => t.completed && !t.archived).length,
            overdue: state.tasks.filter(t => isOverdue(t) && !t.archived).length,
            archived: state.tasks.filter(t => t.archived).length
        };

        for (const [filter, val] of Object.entries(counts)) {
            const badge = document.getElementById(`badge-${filter}`);
            if (badge) badge.textContent = val;
        }

        // Re-draw categories count
        renderCategories();
    }

    // Dashboard score updater
    function updateDashboardStats() {
        const activeTasks = state.tasks.filter(t => !t.archived);
        const total = activeTasks.length;
        const completed = activeTasks.filter(t => t.completed).length;
        const pending = total - completed;
        
        statTotal.textContent = total;
        statCompleted.textContent = completed;
        statPending.textContent = pending;

        // Completion percentage
        const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
        
        // Progress bar animate
        progressBarFill.style.width = `${percent}%`;
        progressPercentageLabel.textContent = `${percent}%`;
        completedTodayCountLabel.textContent = state.completedToday;

        // Productivity score: based on completed today, capped at 100%
        // Target: 5 tasks today for a 100% score
        const score = Math.min(100, state.completedToday * 20);
        productivityScore.textContent = `${score}%`;
        streakCount.textContent = state.streak;
    }

    // Task filtering and rendering
    function renderTaskList() {
        taskList.innerHTML = '';
        
        // Filter tasks
        let filteredTasks = [...state.tasks];

        // 1. Core smart filters
        if (state.currentFilter) {
            const todayStr = getFormattedDateOffset(0);
            switch (state.currentFilter) {
                case 'pinned':
                    filteredTasks = filteredTasks.filter(t => t.pinned && !t.archived);
                    activeFilterTitle.textContent = "Pinned Tasks";
                    break;
                case 'favorites':
                    filteredTasks = filteredTasks.filter(t => t.favorite && !t.archived);
                    activeFilterTitle.textContent = "Favorites";
                    break;
                case 'today':
                    filteredTasks = filteredTasks.filter(t => t.dueDate === todayStr && !t.archived);
                    activeFilterTitle.textContent = "Due Today";
                    break;
                case 'pending':
                    filteredTasks = filteredTasks.filter(t => !t.completed && !t.archived);
                    activeFilterTitle.textContent = "Pending Tasks";
                    break;
                case 'completed':
                    filteredTasks = filteredTasks.filter(t => t.completed && !t.archived);
                    activeFilterTitle.textContent = "Completed Tasks";
                    break;
                case 'overdue':
                    filteredTasks = filteredTasks.filter(t => isOverdue(t) && !t.archived);
                    activeFilterTitle.textContent = "Overdue Tasks";
                    break;
                case 'archived':
                    filteredTasks = filteredTasks.filter(t => t.archived);
                    activeFilterTitle.textContent = "Archive Bin";
                    break;
                case 'all':
                default:
                    filteredTasks = filteredTasks.filter(t => !t.archived);
                    activeFilterTitle.textContent = "All Tasks";
                    break;
            }
        } else if (state.currentCategory) {
            filteredTasks = filteredTasks.filter(t => t.category === state.currentCategory && !t.archived);
            activeFilterTitle.textContent = `${state.currentCategory} Tasks`;
        } else if (state.calendarSelectedDate) {
            filteredTasks = filteredTasks.filter(t => t.dueDate === state.calendarSelectedDate && !t.archived);
            const dateObj = new Date(state.calendarSelectedDate + 'T00:00:00');
            activeFilterTitle.textContent = `Due on ${dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
        }

        // 2. Search filtering
        if (state.searchQuery.trim()) {
            const query = state.searchQuery.toLowerCase().trim();
            filteredTasks = filteredTasks.filter(t => {
                const titleMatch = t.title.toLowerCase().includes(query);
                const descMatch = t.description.toLowerCase().includes(query);
                const tagMatch = t.tags.some(tag => tag.toLowerCase().includes(query));
                const catMatch = t.category.toLowerCase().includes(query);
                return titleMatch || descMatch || tagMatch || catMatch;
            });
            activeFilterTitle.textContent = `Search results for "${state.searchQuery}"`;
        }

        // 3. Sorting
        sortTasksList(filteredTasks);

        // Update task count subtitle
        const remaining = filteredTasks.filter(t => !t.completed).length;
        taskCountSubtitle.textContent = `${remaining} task${remaining === 1 ? '' : 's'} remaining`;

        // Empty state checker
        if (filteredTasks.length === 0) {
            emptyState.style.display = 'flex';
            taskList.style.display = 'none';
        } else {
            emptyState.style.display = 'none';
            taskList.style.display = 'flex';
            
            filteredTasks.forEach(task => {
                const card = createTaskCard(task);
                taskList.appendChild(card);
            });
        }
    }

    // Creates the task card DOM structure
    function createTaskCard(task) {
        const card = document.createElement('div');
        card.className = `task-card ${task.completed ? 'completed' : ''}`;
        card.setAttribute('draggable', state.sortBy === 'order' ? 'true' : 'false');
        card.setAttribute('data-id', task.id);
        
        // Find category color
        const categoryDetails = state.categories.find(c => c.name === task.category) || { color: '#8b5cf6' };
        
        const isTaskOverdue = isOverdue(task);
        let dateBadge = '';
        if (task.dueDate) {
            const dateObj = new Date(task.dueDate + 'T00:00:00');
            const formatOpt = { month: 'short', day: 'numeric' };
            let timeStr = task.dueTime ? `, ${formatTime12h(task.dueTime)}` : '';
            
            dateBadge = `
                <div class="meta-badge meta-date ${isTaskOverdue ? 'overdue' : ''}">
                    <i data-lucide="${isTaskOverdue ? 'alert-circle' : 'calendar'}"></i>
                    <span>${dateObj.toLocaleDateString('en-US', formatOpt)}${timeStr}</span>
                </div>
            `;
        }

        let tagsHTML = '';
        if (task.tags && task.tags.length > 0) {
            tagsHTML = task.tags.map(t => `<span class="meta-badge meta-tag">#${t}</span>`).join('');
        }

        let pinIcon = task.pinned ? `<span class="task-pin-icon" title="Pinned Task"><i data-lucide="pin"></i></span>` : '';
        let starIcon = task.favorite ? `<span class="task-star-icon" title="Favorite Task"><i data-lucide="star"></i></span>` : '';
        
        card.innerHTML = `
            ${state.sortBy === 'order' ? `<div class="task-drag-handle" title="Drag to reorder"><i data-lucide="grip-vertical"></i></div>` : ''}
            
            <div class="task-bulk-select">
                <label class="custom-checkbox">
                    <input type="checkbox" class="task-select-checkbox" data-id="${task.id}" ${state.selectedTaskIds.has(task.id) ? 'checked' : ''}>
                    <span class="checkmark"></span>
                </label>
            </div>

            <div class="task-checkbox-wrap">
                <label class="custom-checkbox">
                    <input type="checkbox" class="task-toggle-complete" data-id="${task.id}" ${task.completed ? 'checked' : ''}>
                    <span class="checkmark"></span>
                </label>
            </div>

            <div class="task-card-content">
                <div class="task-card-header">
                    <h3 class="task-title" data-id="${task.id}">${task.title}</h3>
                    ${pinIcon}
                    ${starIcon}
                </div>
                
                ${task.description ? `<p class="task-desc-summary" data-id="${task.id}" title="Click to expand/collapse">${task.description}</p>` : ''}
                
                <div class="task-meta-row">
                    <div class="meta-badge meta-category" style="--cat-color: ${categoryDetails.color}">
                        <span class="meta-category-dot"></span>
                        <span>${task.category}</span>
                    </div>
                    <div class="meta-badge meta-priority-${task.priority}">
                        <span>${task.priority}</span>
                    </div>
                    ${dateBadge}
                    ${tagsHTML}
                </div>
            </div>

            <div class="task-actions">
                <button class="btn-task-action btn-pin ${task.pinned ? 'active-pin' : ''}" data-id="${task.id}" title="${task.pinned ? 'Unpin Task' : 'Pin Task'}">
                    <i data-lucide="pin"></i>
                </button>
                <button class="btn-task-action btn-favorite ${task.favorite ? 'active-star' : ''}" data-id="${task.id}" title="${task.favorite ? 'Remove Favorite' : 'Mark Favorite'}">
                    <i data-lucide="star"></i>
                </button>
                <button class="btn-task-action btn-archive" data-id="${task.id}" title="${task.archived ? 'Send to Inbox' : 'Archive Task'}">
                    <i data-lucide="${task.archived ? 'inbox' : 'archive'}"></i>
                </button>
                <button class="btn-task-action btn-edit" data-id="${task.id}" title="Edit Task">
                    <i data-lucide="edit-3"></i>
                </button>
                <button class="btn-task-action btn-duplicate" data-id="${task.id}" title="Duplicate Task">
                    <i data-lucide="copy"></i>
                </button>
                <button class="btn-task-action btn-delete" data-id="${task.id}" title="Delete Task">
                    <i data-lucide="trash-2"></i>
                </button>
            </div>
        `;

        // Bind interactive triggers on task cards
        bindTaskCardEvents(card, task);

        return card;
    }

    // Dynamic sorting
    function sortTasksList(list) {
        switch (state.sortBy) {
            case 'dueDate':
                list.sort((a, b) => {
                    if (!a.dueDate) return 1;
                    if (!b.dueDate) return -1;
                    const dateA = new Date(a.dueDate + 'T' + (a.dueTime || '00:00'));
                    const dateB = new Date(b.dueDate + 'T' + (b.dueTime || '00:00'));
                    return dateA - dateB;
                });
                break;
            case 'priority':
                const weight = { 'High': 3, 'Medium': 2, 'Low': 1 };
                list.sort((a, b) => weight[b.priority] - weight[a.priority]);
                break;
            case 'alphabetical':
                list.sort((a, b) => a.title.localeCompare(b.title));
                break;
            case 'createdAt':
                list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                break;
            case 'updatedAt':
                list.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
                break;
            case 'order':
            default:
                // Sort by pin state first, then manual order index
                list.sort((a, b) => {
                    if (a.pinned && !b.pinned) return -1;
                    if (!a.pinned && b.pinned) return 1;
                    return a.order - b.order;
                });
                break;
        }
    }

    // --- Task Event Bindings ---
    function bindTaskCardEvents(card, task) {
        // Expand/Collapse Description summary on click
        const descSummary = card.querySelector('.task-desc-summary');
        if (descSummary) {
            descSummary.addEventListener('click', (e) => {
                e.stopPropagation();
                descSummary.classList.toggle('expanded');
            });
        }

        // Open details modal when clicking the task title
        const titleEl = card.querySelector('.task-title');
        titleEl.addEventListener('click', (e) => {
            e.stopPropagation();
            openDetailsModal(task);
        });

        // Toggle task completion
        const toggleComplete = card.querySelector('.task-toggle-complete');
        toggleComplete.addEventListener('change', () => {
            toggleTaskCompletion(task.id);
        });

        // Bulk Selection Checkbox
        const selectCheckbox = card.querySelector('.task-select-checkbox');
        selectCheckbox.addEventListener('change', () => {
            if (selectCheckbox.checked) {
                state.selectedTaskIds.add(task.id);
            } else {
                state.selectedTaskIds.delete(task.id);
            }
            toggleBulkActionBar();
        });

        // Hover Buttons Actions
        card.querySelector('.btn-pin').addEventListener('click', (e) => {
            e.stopPropagation();
            togglePinTask(task.id);
        });

        card.querySelector('.btn-favorite').addEventListener('click', (e) => {
            e.stopPropagation();
            toggleFavoriteTask(task.id);
        });

        card.querySelector('.btn-archive').addEventListener('click', (e) => {
            e.stopPropagation();
            toggleArchiveTask(task.id);
        });

        card.querySelector('.btn-edit').addEventListener('click', (e) => {
            e.stopPropagation();
            openEditTaskModal(task);
        });

        card.querySelector('.btn-duplicate').addEventListener('click', (e) => {
            e.stopPropagation();
            duplicateTask(task.id);
        });

        card.querySelector('.btn-delete').addEventListener('click', (e) => {
            e.stopPropagation();
            deleteTask(task.id);
        });

        // --- Drag and Drop API hooks ---
        if (state.sortBy === 'order') {
            card.addEventListener('dragstart', (e) => {
                card.classList.add('dragging');
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('text/plain', task.id);
            });

            card.addEventListener('dragend', () => {
                card.classList.remove('dragging');
                document.querySelectorAll('.task-card').forEach(el => el.classList.remove('drag-over'));
                reorderTasksInState();
            });

            card.addEventListener('dragover', (e) => {
                e.preventDefault();
                const draggingCard = document.querySelector('.task-card.dragging');
                if (draggingCard && draggingCard !== card) {
                    const bounding = card.getBoundingClientRect();
                    const offset = e.clientY - bounding.top - bounding.height / 2;
                    if (offset < 0) {
                        taskList.insertBefore(draggingCard, card);
                    } else {
                        taskList.insertBefore(draggingCard, card.nextSibling);
                    }
                }
            });
        }
    }

    // Reorder Tasks array matching DOM order after dragging
    function reorderTasksInState() {
        const domCards = Array.from(taskList.querySelectorAll('.task-card'));
        const newOrderedTasks = [];
        
        domCards.forEach((cardEl, index) => {
            const id = cardEl.getAttribute('data-id');
            const matchTask = state.tasks.find(t => t.id === id);
            if (matchTask) {
                matchTask.order = index;
                matchTask.updatedAt = new Date().toISOString();
                newOrderedTasks.push(matchTask);
            }
        });

        // Re-inject remaining unrendered tasks (archived, filtered, etc.) back into collection
        state.tasks.forEach(t => {
            if (!newOrderedTasks.find(nt => nt.id === t.id)) {
                newOrderedTasks.push(t);
            }
        });

        state.tasks = newOrderedTasks;
        saveTasks();
        renderCalendar();
        updateBadges();
    }

    // --- State Operations (CRUD & Toggles) ---
    function toggleTaskCompletion(id) {
        const task = state.tasks.find(t => t.id === id);
        if (!task) return;

        task.completed = !task.completed;
        task.updatedAt = new Date().toISOString();
        
        if (task.completed) {
            state.completedToday++;
            localStorage.setItem('zenith_completed_today', state.completedToday);
            
            // Handle Streak increments
            const todayStr = getFormattedDateOffset(0);
            if (state.lastStreakDate !== todayStr) {
                if (state.lastStreakDate === getFormattedDateOffset(-1) || !state.lastStreakDate) {
                    state.streak++;
                } else {
                    state.streak = 1;
                }
                state.lastStreakDate = todayStr;
                localStorage.setItem('zenith_streak', state.streak);
                localStorage.setItem('zenith_last_streak_date', todayStr);
            }

            playSuccessChime();
            showToast("Task completed!", "success");

            // Confetti if all tasks in active view are done
            checkAndTriggerConfetti();
        } else {
            if (state.completedToday > 0) {
                state.completedToday--;
                localStorage.setItem('zenith_completed_today', state.completedToday);
            }
            showToast("Task marked incomplete", "info");
        }

        saveTasks();
        render();
        renderCalendar();
    }

    function checkAndTriggerConfetti() {
        const activeTasks = state.tasks.filter(t => !t.archived && !t.completed);
        // If there are no more pending tasks (and user had at least 1 task)
        if (activeTasks.length === 0 && state.tasks.length > 0) {
            triggerConfettiAnimation();
            showToast("Fantastic! All tasks completed! 🎉", "success");
        }
    }

    function togglePinTask(id) {
        const task = state.tasks.find(t => t.id === id);
        if (task) {
            task.pinned = !task.pinned;
            task.updatedAt = new Date().toISOString();
            saveTasks();
            showToast(task.pinned ? "Task pinned to top" : "Task unpinned", "info");
            render();
        }
    }

    function toggleFavoriteTask(id) {
        const task = state.tasks.find(t => t.id === id);
        if (task) {
            task.favorite = !task.favorite;
            task.updatedAt = new Date().toISOString();
            saveTasks();
            showToast(task.favorite ? "Added to favorites" : "Removed from favorites", "info");
            render();
        }
    }

    function toggleArchiveTask(id) {
        const task = state.tasks.find(t => t.id === id);
        if (task) {
            task.archived = !task.archived;
            task.updatedAt = new Date().toISOString();
            saveTasks();
            showToast(task.archived ? "Task archived" : "Task restored to inbox", "success");
            render();
            renderCalendar();
        }
    }

    function duplicateTask(id) {
        const task = state.tasks.find(t => t.id === id);
        if (task) {
            const clone = {
                ...task,
                id: 'task-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
                title: `${task.title} (Copy)`,
                completed: false,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                order: state.tasks.length
            };
            
            // Insert right after original
            const origIndex = state.tasks.findIndex(t => t.id === id);
            state.tasks.splice(origIndex + 1, 0, clone);
            saveTasks();
            showToast("Task duplicated", "success");
            render();
            renderCalendar();
        }
    }

    function deleteTask(id) {
        const index = state.tasks.findIndex(t => t.id === id);
        if (index > -1) {
            // Buffer for Undo
            state.undoBuffer = { ...state.tasks[index] };
            
            // Delete
            state.tasks.splice(index, 1);
            saveTasks();
            
            // Show undo toast
            showToast("Task deleted", "danger", true);
            render();
            renderCalendar();
        }
    }

    function undoDelete() {
        if (state.undoBuffer) {
            state.tasks.push(state.undoBuffer);
            state.undoBuffer = null;
            saveTasks();
            showToast("Task deletion undone", "success");
            render();
            renderCalendar();
        }
    }

    // --- Bulk Action Toolbar Handler ---
    function toggleBulkActionBar() {
        if (state.selectedTaskIds.size > 0) {
            selectedCountLabel.textContent = `${state.selectedTaskIds.size} selected`;
            bulkActionBar.classList.add('visible');
            
            // sync bulk select all checkbox
            const renderCount = taskList.querySelectorAll('.task-select-checkbox').length;
            const selectCount = taskList.querySelectorAll('.task-select-checkbox:checked').length;
            bulkSelectAll.checked = renderCount > 0 && renderCount === selectCount;
        } else {
            bulkActionBar.classList.remove('visible');
            bulkSelectAll.checked = false;
        }
    }

    // --- Dynamic Mini-Calendar View ---
    function renderCalendar() {
        calendarDays.innerHTML = '';
        
        const year = calendarDate.getFullYear();
        const month = calendarDate.getMonth();
        
        calMonthYear.textContent = calendarDate.toLocaleString('en-US', { month: 'long', year: 'numeric' });
        
        const firstDayIndex = new Date(year, month, 1).getDay();
        const lastDayDate = new Date(year, month + 1, 0).getDate();
        const prevLastDayDate = new Date(year, month, 0).getDate();
        
        // Days from previous month
        for (let i = firstDayIndex; i > 0; i--) {
            const dayNum = prevLastDayDate - i + 1;
            const fullDateStr = `${month === 0 ? year - 1 : year}-${String(month === 0 ? 12 : month).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
            createCalendarDayElement(dayNum, 'other-month', fullDateStr);
        }

        // Days from current month
        const todayStr = getFormattedDateOffset(0);
        for (let i = 1; i <= lastDayDate; i++) {
            const fullDateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
            
            let classNames = '';
            if (fullDateStr === todayStr) classNames += ' today';
            if (state.calendarSelectedDate === fullDateStr) classNames += ' selected';
            
            createCalendarDayElement(i, classNames.trim(), fullDateStr);
        }

        // Days from next month
        const totalRendered = firstDayIndex + lastDayDate;
        const nextMonthPadding = 42 - totalRendered; // Maintain a neat 6-row layout grid
        for (let i = 1; i <= nextMonthPadding; i++) {
            const fullDateStr = `${month === 11 ? year + 1 : year}-${String(month === 11 ? 1 : month + 2).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
            createCalendarDayElement(i, 'other-month', fullDateStr);
        }
    }

    function createCalendarDayElement(dayNum, extraClass, dateStr) {
        const div = document.createElement('div');
        div.className = `calendar-day ${extraClass}`;
        div.textContent = dayNum;

        // Mark day if contains pending (incomplete) tasks
        const hasPendingTasks = state.tasks.some(t => t.dueDate === dateStr && !t.completed && !t.archived);
        if (hasPendingTasks) {
            div.classList.add('has-tasks');
        }

        div.addEventListener('click', () => {
            // Toggle active selection date
            if (state.calendarSelectedDate === dateStr) {
                state.calendarSelectedDate = null;
                div.classList.remove('selected');
                state.currentFilter = 'all';
                document.querySelector('[data-filter="all"]').classList.add('active');
            } else {
                state.calendarSelectedDate = dateStr;
                state.currentFilter = '';
                state.currentCategory = null;
                
                document.querySelectorAll('.calendar-day').forEach(el => el.classList.remove('selected'));
                div.classList.add('selected');
                
                // Clear filter selection highlights in sidebar
                document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
            }
            
            state.selectedTaskIds.clear();
            toggleBulkActionBar();
            render();
        });

        calendarDays.appendChild(div);
    }

    // --- Modal controllers ---
    function openAddTaskModal() {
        taskForm.reset();
        taskEditId.value = '';
        modalTitle.textContent = 'Create New Task';
        
        // Auto fill due date with currently selected calendar date or today
        const defaultDate = state.calendarSelectedDate || getFormattedDateOffset(0);
        document.getElementById('task-due-date').value = defaultDate;
        
        document.getElementById('error-task-title').style.display = 'none';
        document.querySelector('.form-group').classList.remove('has-error');
        
        taskModal.classList.add('open');
        document.getElementById('task-title-input').focus();
    }

    function openEditTaskModal(task) {
        taskForm.reset();
        taskEditId.value = task.id;
        modalTitle.textContent = 'Edit Task';
        
        document.getElementById('task-title-input').value = task.title;
        document.getElementById('task-desc-input').value = task.description || '';
        document.getElementById('task-category-select').value = task.category || 'Personal';
        document.getElementById('task-priority-select').value = task.priority || 'Medium';
        document.getElementById('task-due-date').value = task.dueDate || '';
        document.getElementById('task-due-time').value = task.dueTime || '';
        document.getElementById('task-reminder').value = task.reminder || '';
        document.getElementById('task-tags-input').value = task.tags ? task.tags.join(', ') : '';
        
        document.getElementById('error-task-title').style.display = 'none';
        document.querySelector('.form-group').classList.remove('has-error');
        
        taskModal.classList.add('open');
        document.getElementById('task-title-input').focus();
    }

    function openDetailsModal(task) {
        const categoryDetails = state.categories.find(c => c.name === task.category) || { color: '#8b5cf6' };
        
        detailsStatusBadge.textContent = task.completed ? 'Completed' : 'Pending';
        detailsStatusBadge.className = `details-status-badge ${task.completed ? 'completed' : 'pending'}`;
        
        detailsPriorityBadge.textContent = `${task.priority} Priority`;
        detailsPriorityBadge.className = `details-priority-badge meta-priority-${task.priority}`;
        
        detailsTitle.textContent = task.title;
        detailsCategoryPill.style.setProperty('--accent', categoryDetails.color);
        detailsCategoryPill.querySelector('.cat-name').textContent = task.category;
        
        detailsDescription.textContent = task.description || 'No description provided.';
        
        // Formatted dates
        const createdDate = new Date(task.createdAt);
        detailsCreated.textContent = createdDate.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
        
        if (task.dueDate) {
            const dueDateObj = new Date(task.dueDate + 'T' + (task.dueTime || '00:00'));
            detailsDue.textContent = dueDateObj.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: task.dueTime ? '2-digit' : undefined, minute: task.dueTime ? '2-digit' : undefined });
        } else {
            detailsDue.textContent = 'No due date';
        }

        if (task.reminder) {
            const reminderDate = new Date(task.reminder);
            detailsReminder.textContent = reminderDate.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
        } else {
            detailsReminder.textContent = 'None';
        }

        // Tags
        detailsTags.innerHTML = '';
        if (task.tags && task.tags.length > 0) {
            task.tags.forEach(tag => {
                const tagEl = document.createElement('span');
                tagEl.className = 'meta-badge meta-tag';
                tagEl.textContent = `#${tag}`;
                detailsTags.appendChild(tagEl);
            });
        } else {
            detailsTags.innerHTML = '<span class="grid-val">No tags</span>';
        }

        // Bind Edit button inside details modal
        btnEditDetails.onclick = () => {
            detailsModal.classList.remove('open');
            openEditTaskModal(task);
        };

        detailsModal.classList.add('open');
    }

    // Modal close dispatcher
    function closeAllModals() {
        taskModal.classList.remove('open');
        detailsModal.classList.remove('open');
        categoryModal.classList.remove('open');
        exportModal.classList.remove('open');
    }

    // --- Toast Alert Notifications System ---
    function showToast(message, type = 'info', showUndo = false) {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        let iconName = 'info';
        if (type === 'success') iconName = 'check-circle';
        if (type === 'warning') iconName = 'alert-triangle';
        if (type === 'danger') iconName = 'trash-2';

        toast.innerHTML = `
            <div class="toast-icon"><i data-lucide="${iconName}"></i></div>
            <div class="toast-content">
                <span class="toast-message">${message}</span>
            </div>
            ${showUndo ? `<button class="toast-undo-btn">Undo</button>` : ''}
            <button class="toast-close" aria-label="Dismiss toast"><i data-lucide="x"></i></button>
        `;

        toastContainer.appendChild(toast);
        lucide.createIcons();

        // Bind undo click if requested
        if (showUndo) {
            toast.querySelector('.toast-undo-btn').addEventListener('click', () => {
                undoDelete();
                toast.classList.add('slide-out');
                setTimeout(() => toast.remove(), 300);
            });
        }

        // Bind dismiss click
        toast.querySelector('.toast-close').addEventListener('click', () => {
            toast.classList.add('slide-out');
            setTimeout(() => toast.remove(), 300);
        });

        // Auto dismiss after 4 seconds
        setTimeout(() => {
            if (toast.parentNode) {
                toast.classList.add('slide-out');
                setTimeout(() => toast.remove(), 300);
            }
        }, 4000);
    }

    // --- Confetti particle generator ---
    function triggerConfettiAnimation() {
        const colors = ['#8b5cf6', '#a78bfa', '#10b981', '#f59e0b', '#3b82f6', '#ec4899'];
        const shapes = ['circle', 'square'];

        for (let i = 0; i < 80; i++) {
            const particle = document.createElement('div');
            particle.className = 'confetti-particle';
            
            // Random styling
            const color = colors[Math.floor(Math.random() * colors.length)];
            const shape = shapes[Math.floor(Math.random() * shapes.length)];
            
            particle.style.backgroundColor = color;
            particle.style.borderRadius = shape === 'circle' ? '50%' : '2px';
            particle.style.left = Math.random() * 100 + 'vw';
            particle.style.top = '-20px';
            
            // Random scale & rotations
            const size = Math.random() * 8 + 6 + 'px';
            particle.style.width = size;
            particle.style.height = size;
            
            // Animation values passed as inline custom props
            const fallDuration = Math.random() * 1.5 + 1.5 + 's';
            particle.style.animationDuration = fallDuration;
            
            document.body.appendChild(particle);

            // Cleanup particle
            setTimeout(() => {
                particle.remove();
            }, 3000);
        }
    }

    // --- Keyboard Shortcut Manager ---
    function handleKeyboardShortcuts(e) {
        // Ctrl + N -> New Task
        if (e.ctrlKey && e.key.toLowerCase() === 'n') {
            e.preventDefault();
            openAddTaskModal();
        }
        
        // Ctrl + F -> Search Bar focus
        if (e.ctrlKey && e.key.toLowerCase() === 'f') {
            e.preventDefault();
            searchInput.focus();
            searchInput.select();
        }

        // Delete -> Delete Selected tasks (if not focus on input forms)
        if (e.key === 'Delete' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
            if (state.selectedTaskIds.size > 0) {
                e.preventDefault();
                bulkDeleteTasks();
            }
        }

        // Escape -> Close modal
        if (e.key === 'Escape') {
            closeAllModals();
            reminderPopup.parentNode.classList.remove('open');
        }
    }

    // --- Reminder Checker Loop ---
    function startReminderScanner() {
        // Run scanner check every 10 seconds
        state.reminderTimerId = setInterval(checkReminders, 10000);
    }

    function checkReminders() {
        const now = new Date();
        
        state.tasks.forEach(task => {
            if (task.reminder && !task.completed && !task.reminderTriggered) {
                const reminderTime = new Date(task.reminder);
                
                // If current time passed reminder time (within a threshold)
                if (now >= reminderTime) {
                    // Mark as triggered in state
                    task.reminderTriggered = true;
                    saveTasks();
                    
                    // Show Popup reminder and play audio chime
                    playChime();
                    showReminderPopup(task);
                }
            }
        });
    }

    function showReminderPopup(task) {
        reminderTaskTitle.textContent = task.title;
        reminderTaskDesc.textContent = task.description || 'No description provided.';
        
        if (task.dueDate) {
            const dueObj = new Date(task.dueDate + 'T' + (task.dueTime || '00:00'));
            reminderTaskTime.textContent = `Due: ${dueObj.toLocaleString()}`;
        } else {
            reminderTaskTime.textContent = '';
        }

        // Temporary stash current reminder task on button events
        btnReminderDismiss.onclick = () => {
            reminderPopup.parentNode.classList.remove('open');
            // Highlight card
            const cardEl = document.querySelector(`.task-card[data-id="${task.id}"]`);
            if (cardEl) {
                cardEl.scrollIntoView({ behavior: 'smooth' });
                cardEl.style.borderColor = 'var(--warning)';
                setTimeout(() => { cardEl.style.borderColor = ''; }, 4000);
            }
        };

        btnReminderSnooze.onclick = () => {
            reminderPopup.parentNode.classList.remove('open');
            // Snooze reminder 5 minutes forward
            const snoozeDate = new Date();
            snoozeDate.setMinutes(snoozeDate.getMinutes() + 5);
            
            task.reminder = snoozeDate.toISOString().slice(0, 16);
            task.reminderTriggered = false;
            saveTasks();
            showToast("Reminder snoozed for 5 minutes", "info");
        };

        reminderPopup.parentNode.classList.add('open');
    }

    // --- Import and Export Core Logic ---
    function exportData(format) {
        // Export only selected, or export all if nothing is selected
        const exportTargets = state.selectedTaskIds.size > 0 
            ? state.tasks.filter(t => state.selectedTaskIds.has(t.id))
            : state.tasks;
            
        if (exportTargets.length === 0) {
            showToast("No tasks found to export", "warning");
            return;
        }

        let fileContent = '';
        let fileType = '';
        let fileExtension = '';

        if (format === 'json') {
            fileContent = JSON.stringify(exportTargets, null, 2);
            fileType = 'application/json';
            fileExtension = 'json';
        } else if (format === 'csv') {
            const headers = ['ID', 'Title', 'Description', 'Category', 'Priority', 'Due Date', 'Due Time', 'Reminder', 'Tags', 'Completed', 'Pinned', 'Favorite', 'Archived', 'Created At'];
            const rows = exportTargets.map(t => [
                t.id,
                `"${t.title.replace(/"/g, '""')}"`,
                `"${(t.description || '').replace(/"/g, '""')}"`,
                t.category,
                t.priority,
                t.dueDate || '',
                t.dueTime || '',
                t.reminder || '',
                (t.tags || []).join(';'),
                t.completed,
                t.pinned,
                t.favorite,
                t.archived,
                t.createdAt
            ]);
            fileContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
            fileType = 'text/csv';
            fileExtension = 'csv';
        } else if (format === 'txt') {
            fileContent = exportTargets.map(t => {
                return `[${t.completed ? 'X' : ' '}] ${t.title}\n` +
                       `Category: ${t.category} | Priority: ${t.priority}\n` +
                       (t.dueDate ? `Due: ${t.dueDate} ${t.dueTime || ''}\n` : '') +
                       (t.description ? `Description: ${t.description}\n` : '') +
                       (t.tags && t.tags.length ? `Tags: ${t.tags.join(', ')}\n` : '') +
                       `----------------------------------------`;
            }).join('\n\n');
            fileType = 'text/plain';
            fileExtension = 'txt';
        }

        // Trigger file download
        const blob = new Blob([fileContent], { type: fileType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        
        const timestamp = new Date().toISOString().slice(0,10);
        link.href = url;
        link.download = `zenith_tasks_export_${timestamp}.${fileExtension}`;
        document.body.appendChild(link);
        link.click();
        
        // Cleanup
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        closeAllModals();
        showToast(`Exported successfully as ${format.toUpperCase()}`, "success");
    }

    function handleImportJSON(e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const importedData = JSON.parse(event.target.result);
                
                // Simple validation check: ensure it is array of tasks
                if (!Array.isArray(importedData)) {
                    throw new Error("Invalid file schema. Exported file must be a JSON array.");
                }

                let importCount = 0;
                importedData.forEach(task => {
                    // Check required properties exist
                    if (task.id && task.title && task.category && task.priority) {
                        // Prevent exact duplicate ID collisions by renewing ID if matching
                        const existsIndex = state.tasks.findIndex(t => t.id === task.id);
                        const cleanTask = {
                            id: existsIndex > -1 ? 'task-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4) : task.id,
                            title: task.title,
                            description: task.description || '',
                            category: task.category,
                            priority: task.priority,
                            dueDate: task.dueDate || '',
                            dueTime: task.dueTime || '',
                            reminder: task.reminder || '',
                            tags: Array.isArray(task.tags) ? task.tags : [],
                            completed: !!task.completed,
                            pinned: !!task.pinned,
                            favorite: !!task.favorite,
                            archived: !!task.archived,
                            createdAt: task.createdAt || new Date().toISOString(),
                            updatedAt: new Date().toISOString(),
                            order: task.order !== undefined ? task.order : state.tasks.length + importCount
                        };

                        state.tasks.push(cleanTask);
                        importCount++;
                    }
                });

                if (importCount > 0) {
                    saveTasks();
                    render();
                    renderCalendar();
                    showToast(`Successfully imported ${importCount} tasks!`, "success");
                } else {
                    showToast("No valid tasks found in the file", "warning");
                }

            } catch (err) {
                showToast(err.message || "Failed to parse import file.", "danger");
            }
            // Clear value to allow re-uploading same file
            importFileInput.value = '';
        };
        reader.readAsText(file);
    }

    // --- Bulk Action Handlers ---
    function bulkDeleteTasks() {
        if (state.selectedTaskIds.size === 0) return;
        
        const count = state.selectedTaskIds.size;
        // Keep non-selected tasks
        state.tasks = state.tasks.filter(t => !state.selectedTaskIds.has(t.id));
        state.selectedTaskIds.clear();
        
        saveTasks();
        toggleBulkActionBar();
        render();
        renderCalendar();
        showToast(`Deleted ${count} tasks`, "danger");
    }

    function bulkCompleteTasks() {
        if (state.selectedTaskIds.size === 0) return;

        let completedCount = 0;
        state.tasks.forEach(t => {
            if (state.selectedTaskIds.has(t.id) && !t.completed) {
                t.completed = true;
                t.updatedAt = new Date().toISOString();
                completedCount++;
                state.completedToday++;
            }
        });

        if (completedCount > 0) {
            localStorage.setItem('zenith_completed_today', state.completedToday);
            playSuccessChime();
            
            const todayStr = getFormattedDateOffset(0);
            if (state.lastStreakDate !== todayStr) {
                state.streak++;
                state.lastStreakDate = todayStr;
                localStorage.setItem('zenith_streak', state.streak);
                localStorage.setItem('zenith_last_streak_date', todayStr);
            }
            
            showToast(`Completed ${completedCount} tasks!`, "success");
            checkAndTriggerConfetti();
        }

        state.selectedTaskIds.clear();
        saveTasks();
        toggleBulkActionBar();
        render();
        renderCalendar();
    }

    function bulkArchiveTasks() {
        if (state.selectedTaskIds.size === 0) return;

        state.tasks.forEach(t => {
            if (state.selectedTaskIds.has(t.id)) {
                t.archived = true;
                t.updatedAt = new Date().toISOString();
            }
        });

        const count = state.selectedTaskIds.size;
        state.selectedTaskIds.clear();
        
        saveTasks();
        toggleBulkActionBar();
        render();
        renderCalendar();
        showToast(`Archived ${count} tasks`, "success");
    }

    // --- Theme Control ---
    function applyTheme() {
        document.documentElement.setAttribute('data-theme', state.theme);
        localStorage.setItem('zenith_theme', state.theme);
    }

    function toggleTheme() {
        state.theme = state.theme === 'dark' ? 'light' : 'dark';
        applyTheme();
        showToast(`${state.theme === 'dark' ? 'Dark' : 'Light'} theme activated`, "info");
    }

    // --- Helper Validation and Utility Functions ---
    function isOverdue(task) {
        if (task.completed || !task.dueDate) return false;
        
        const todayStr = getFormattedDateOffset(0);
        if (task.dueDate < todayStr) return true;
        
        // If due date is today, check if due time has passed
        if (task.dueDate === todayStr && task.dueTime) {
            const now = new Date();
            const timeParts = task.dueTime.split(':');
            const dueTimeObj = new Date();
            dueTimeObj.setHours(parseInt(timeParts[0]), parseInt(timeParts[1]), 0, 0);
            return now > dueTimeObj;
        }

        return false;
    }

    function formatTime12h(time24) {
        const parts = time24.split(':');
        let hours = parseInt(parts[0]);
        const minutes = parts[1];
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12; // conversion of 0 to 12
        return `${hours}:${minutes} ${ampm}`;
    }

    // --- Global Event Bindings ---
    function bindEvents() {
        // Sidebar collapse logic (mobile)
        sidebarToggleBtn.addEventListener('click', () => {
            appSidebar.classList.add('open');
        });

        sidebarCloseBtn.addEventListener('click', () => {
            appSidebar.classList.remove('open');
        });

        // Close sidebar on navigation selection on small screens
        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 768) {
                if (!appSidebar.contains(e.target) && e.target !== sidebarToggleBtn && !sidebarToggleBtn.contains(e.target)) {
                    appSidebar.classList.remove('open');
                }
            }
        });

        // Mini calendar month controls
        calPrev.addEventListener('click', () => {
            calendarDate.setMonth(calendarDate.getMonth() - 1);
            renderCalendar();
        });

        calNext.addEventListener('click', () => {
            calendarDate.setMonth(calendarDate.getMonth() + 1);
            renderCalendar();
        });

        // Theme buttons click
        themeToggleBtn.addEventListener('click', toggleTheme);
        sidebarThemeToggle.addEventListener('click', toggleTheme);

        // Sidebar Navigation filter selection
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', () => {
                document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
                document.querySelectorAll('.category-item').forEach(el => el.classList.remove('active'));
                
                item.classList.add('active');
                state.currentFilter = item.getAttribute('data-filter');
                state.currentCategory = null;
                state.calendarSelectedDate = null;
                
                // Clear calendar select highlighting
                document.querySelectorAll('.calendar-day').forEach(el => el.classList.remove('selected'));
                
                state.selectedTaskIds.clear();
                toggleBulkActionBar();
                render();
            });
        });

        // Search Bar Key/Input Trigger
        searchInput.addEventListener('input', (e) => {
            state.searchQuery = e.target.value;
            state.selectedTaskIds.clear();
            toggleBulkActionBar();
            render();
        });

        // Sort Selector
        sortSelect.addEventListener('change', (e) => {
            state.sortBy = e.target.value;
            state.selectedTaskIds.clear();
            toggleBulkActionBar();
            render();
        });

        // Floating Action Button & Main Add Task CTA
        btnAddTaskMain.addEventListener('click', openAddTaskModal);
        btnEmptyStateAdd.addEventListener('click', openAddTaskModal);
        fabAddTask.addEventListener('click', openAddTaskModal);

        // Modal Form submission (Create/Edit task)
        taskForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const titleInput = document.getElementById('task-title-input');
            const titleVal = titleInput.value.trim();
            const descVal = document.getElementById('task-desc-input').value.trim();
            const catVal = document.getElementById('task-category-select').value;
            const priorityVal = document.getElementById('task-priority-select').value;
            const dueDateVal = document.getElementById('task-due-date').value;
            const dueTimeVal = document.getElementById('task-due-time').value;
            const reminderVal = document.getElementById('task-reminder').value;
            
            // Tags parsing
            const tagsInput = document.getElementById('task-tags-input').value;
            const tagsVal = tagsInput ? tagsInput.split(',').map(t => t.trim()).filter(t => t !== '') : [];

            // Validation: Title empty
            if (!titleVal) {
                document.getElementById('error-task-title').style.display = 'block';
                titleInput.parentNode.classList.add('has-error');
                return;
            }

            // Duplicate Empty submission check
            const duplicateCheck = state.tasks.some(t => 
                t.title.toLowerCase() === titleVal.toLowerCase() && 
                t.id !== taskEditId.value &&
                !t.completed &&
                !t.archived
            );
            if (duplicateCheck) {
                showToast("A pending task with this title already exists!", "warning");
                return;
            }

            const editId = taskEditId.value;
            if (editId) {
                // Edit Task Mode
                const task = state.tasks.find(t => t.id === editId);
                if (task) {
                    task.title = titleVal;
                    task.description = descVal;
                    task.category = catVal;
                    task.priority = priorityVal;
                    task.dueDate = dueDateVal;
                    task.dueTime = dueTimeVal;
                    
                    // If reminder updated, reset trigger flag
                    if (task.reminder !== reminderVal) {
                        task.reminder = reminderVal;
                        task.reminderTriggered = false;
                    }
                    
                    task.tags = tagsVal;
                    task.updatedAt = new Date().toISOString();
                    
                    showToast("Task updated", "success");
                }
            } else {
                // Add New Task Mode
                const newTask = {
                    id: 'task-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
                    title: titleVal,
                    description: descVal,
                    category: catVal,
                    priority: priorityVal,
                    dueDate: dueDateVal,
                    dueTime: dueTimeVal,
                    reminder: reminderVal,
                    reminderTriggered: false,
                    tags: tagsVal,
                    completed: false,
                    pinned: false,
                    favorite: false,
                    archived: false,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    order: state.tasks.length
                };
                
                state.tasks.push(newTask);
                showToast("Task added successfully!", "success");
            }

            saveTasks();
            closeAllModals();
            render();
            renderCalendar();
        });

        // Custom Category Button
        addCategoryBtn.addEventListener('click', () => {
            categoryForm.reset();
            document.getElementById('error-category-name').style.display = 'none';
            categoryNameInput.parentNode.classList.remove('has-error');
            categoryModal.classList.add('open');
            categoryNameInput.focus();
        });

        // Live hex value synchronization on color picker change
        categoryColorInput.addEventListener('input', (e) => {
            document.querySelector('.color-picker-value').textContent = e.target.value;
        });

        categoryForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const nameVal = categoryNameInput.value.trim();
            const colorVal = categoryColorInput.value;

            if (!nameVal) {
                document.getElementById('error-category-name').style.display = 'block';
                categoryNameInput.parentNode.classList.add('has-error');
                return;
            }

            // Prevent duplicating default categories
            const exists = state.categories.some(c => c.name.toLowerCase() === nameVal.toLowerCase());
            if (exists) {
                showToast("Category name already exists!", "warning");
                return;
            }

            state.categories.push({ name: nameVal, color: colorVal });
            saveCategories();
            
            // Add custom color option to Task form Category select
            const taskCategorySelect = document.getElementById('task-category-select');
            const opt = document.createElement('option');
            opt.value = nameVal;
            opt.textContent = nameVal;
            taskCategorySelect.appendChild(opt);

            categoryModal.classList.remove('open');
            renderCategories();
            showToast(`Category "${nameVal}" created`, "success");
        });

        // Initialize modal categories select lists
        const taskCategorySelect = document.getElementById('task-category-select');
        taskCategorySelect.innerHTML = '';
        state.categories.forEach(cat => {
            const opt = document.createElement('option');
            opt.value = cat.name;
            opt.textContent = cat.name;
            taskCategorySelect.appendChild(opt);
        });

        // Close Modal Triggers
        btnCancelTask.addEventListener('click', closeAllModals);
        modalCloseTask.addEventListener('click', closeAllModals);
        btnCloseDetails.addEventListener('click', closeAllModals);
        modalCloseDetails.addEventListener('click', closeAllModals);
        btnCancelCategory.addEventListener('click', closeAllModals);
        modalCloseCategory.addEventListener('click', closeAllModals);
        modalCloseExport.addEventListener('click', closeAllModals);

        // Close modal when clicking overlay bounds
        document.querySelectorAll('.modal-overlay').forEach(overlay => {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) closeAllModals();
            });
        });

        // Keyboard Shortcuts hook
        window.addEventListener('keydown', handleKeyboardShortcuts);

        // Productivity Tip click next tip cycle
        tipNextBtn.addEventListener('click', () => {
            state.tipIndex = (state.tipIndex + 1) % PRODUCTIVITY_TIPS.length;
            tipText.textContent = PRODUCTIVITY_TIPS[state.tipIndex];
        });

        // Bulk selection toolbar triggers
        bulkSelectAll.addEventListener('change', () => {
            const renderCheckboxes = taskList.querySelectorAll('.task-select-checkbox');
            const checkVal = bulkSelectAll.checked;
            
            renderCheckboxes.forEach(cb => {
                cb.checked = checkVal;
                const id = cb.getAttribute('data-id');
                if (checkVal) {
                    state.selectedTaskIds.add(id);
                } else {
                    state.selectedTaskIds.delete(id);
                }
            });
            toggleBulkActionBar();
        });

        bulkCloseBtn.addEventListener('click', () => {
            state.selectedTaskIds.clear();
            taskList.querySelectorAll('.task-select-checkbox').forEach(cb => cb.checked = false);
            toggleBulkActionBar();
        });

        bulkDeleteBtn.addEventListener('click', bulkDeleteTasks);
        bulkCompleteBtn.addEventListener('click', bulkCompleteTasks);
        bulkArchiveBtn.addEventListener('click', bulkArchiveTasks);
        bulkExportBtn.addEventListener('click', () => {
            exportModal.classList.add('open');
        });

        // Standard quick widgets data sync
        btnExportData.addEventListener('click', () => {
            // Select All export triggers format choosing modal
            state.selectedTaskIds.clear();
            toggleBulkActionBar();
            exportModal.classList.add('open');
        });

        // Export format cards click
        document.querySelectorAll('.export-format-card').forEach(card => {
            card.addEventListener('click', () => {
                const format = card.getAttribute('data-format');
                exportData(format);
            });
        });

        importFileInput.addEventListener('change', handleImportJSON);
    }

    // --- RUN INITIALIZATION ---
    init();
});

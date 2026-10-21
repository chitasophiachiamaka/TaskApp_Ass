
"use strict";

// =====================================
// TASKFLOW — ALL TASKS PAGE
// =====================================

const STORAGE_KEY = "taskflow-tasks";

// =====================================
// 1. SELECT HTML ELEMENTS
// =====================================

const sidebar = document.getElementById("sidebar");
const menuToggle = document.getElementById("menu-toggle");
const sidebarOverlay = document.getElementById("sidebar-overlay");

const allTaskList = document.getElementById("all-task-list");
const searchInput = document.getElementById("task-search");
const statusFilter = document.getElementById("status-filter");
const categoryFilter = document.getElementById("category-filter");
const taskCount = document.getElementById("filtered-task-count");
const emptyMessage = document.getElementById("empty-tasks-message");

const taskFormSection = document.getElementById("task-form-section");
const taskForm = document.getElementById("task-form");
const openFormButton = document.getElementById("open-task-form");
const cancelFormButton = document.getElementById("cancel-task-form");

// =====================================
// 2. SIDEBAR NAVIGATION
// =====================================


/* =====================================
   2. SIDEBAR NAVIGATION
===================================== */

const isMobileScreen = () => window.innerWidth <= 760;

function openSidebar() {
    if (!sidebar || !menuToggle) return;

    if (isMobileScreen()) {
        sidebar.classList.add("is-open");
        sidebarOverlay?.classList.add("is-visible");
        document.body.classList.add("sidebar-open");
    } else {
        document.body.classList.remove("sidebar-collapsed");
    }

    menuToggle.setAttribute("aria-expanded", "true");
    menuToggle.setAttribute("aria-label", "Close navigation menu");
}

function closeSidebar() {
    if (!sidebar || !menuToggle) return;

    if (isMobileScreen()) {
        sidebar.classList.remove("is-open");
        sidebarOverlay?.classList.remove("is-visible");
        document.body.classList.remove("sidebar-open");
    } else {
        document.body.classList.add("sidebar-collapsed");
    }

    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open navigation menu");
}

if (menuToggle && sidebar) {
    menuToggle.addEventListener("click", () => {
        if (isMobileScreen()) {
            const isOpen = sidebar.classList.contains("is-open");

            if (isOpen) {
                closeSidebar();
            } else {
                openSidebar();
            }
        } else {
            const isCollapsed =
                document.body.classList.toggle("sidebar-collapsed");

            menuToggle.setAttribute(
                "aria-expanded",
                String(!isCollapsed)
            );

            menuToggle.setAttribute(
                "aria-label",
                isCollapsed
                    ? "Open navigation menu"
                    : "Close navigation menu"
            );
        }
    });

    sidebarOverlay?.addEventListener("click", closeSidebar);

    document.addEventListener("keydown", event => {
        if (event.key === "Escape" && isMobileScreen()) {
            closeSidebar();
        }
    });

    sidebar.querySelectorAll(".nav-link").forEach(link => {
        link.addEventListener("click", () => {
            if (isMobileScreen()) {
                closeSidebar();
            }
        });
    });

    window.addEventListener("resize", () => {
        sidebar.classList.remove("is-open");
        document.body.classList.remove(
            "sidebar-collapsed",
            "sidebar-open"
        );
        sidebarOverlay?.classList.remove("is-visible");

        menuToggle.setAttribute("aria-expanded", "true");
        menuToggle.setAttribute(
            "aria-label",
            "Close navigation menu"
        );
    });
}

// =====================================
// 3. LOAD TASKS FROM LOCAL STORAGE
// =====================================

function loadTasks() {
    try {
        const savedTasks = localStorage.getItem(STORAGE_KEY);
        const parsedTasks = savedTasks ? JSON.parse(savedTasks) : [];

        return Array.isArray(parsedTasks) ? parsedTasks : [];
    } catch (error) {
        console.error("Could not load tasks:", error);
        return [];
    }
}

let tasks = loadTasks();

// =====================================
// 4. SAVE TASKS
// =====================================

function saveTasks() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
        return true;
    } catch (error) {
        console.error("Could not save tasks:", error);

        alert(
            "Your changes could not be saved. Please check browser storage."
        );

        return false;
    }
}

// =====================================
// 5. FORMAT DUE DATES
// =====================================

function formatDueDate(dateString) {
    if (!dateString) return "No due date";

    const date = new Date(`${dateString}T00:00:00`);

    if (Number.isNaN(date.getTime())) {
        return "Invalid date";
    }

    return date.toLocaleDateString("en", {
        day: "numeric",
        month: "short",
        year: "numeric"
    });
}

// =====================================
// 6. CREATE A TASK CARD
// =====================================

function createTaskCard(task) {
    const card = document.createElement("article");
    card.className = "task-card";

    // Task title
    const title = document.createElement("h3");
    title.textContent = task.title || "Untitled task";

    // Task description
    const description = document.createElement("p");
    description.textContent =
        task.description || "No description provided.";

    // Category and priority
    const details = document.createElement("p");

    details.textContent =
        `${task.category || "Other"} · ` +
        `${task.priority || "Medium"} priority`;

    // Status label
    const statusLabel = document.createElement("label");
    statusLabel.className = "task-status-label";
    statusLabel.textContent = "Task status";

    // Status dropdown
    const statusSelect = document.createElement("select");
    statusSelect.className = "task-status";

    statusSelect.setAttribute(
        "aria-label",
        `Status for ${task.title || "task"}`
    );

    const currentStatus = task.status || "Pending";

    ["Pending", "In Progress", "Completed"].forEach(status => {
        const option = document.createElement("option");

        option.value = status;
        option.textContent = status;
        option.selected = currentStatus === status;

        statusSelect.appendChild(option);
    });

    statusLabel.appendChild(statusSelect);

    // Save status changes
    statusSelect.addEventListener("change", () => {
        const previousStatus = task.status || "Pending";

        task.status = statusSelect.value;

        if (!saveTasks()) {
            task.status = previousStatus;
            statusSelect.value = previousStatus;
            return;
        }

        renderTasks();
    });

    // Due date
    const dueDate = document.createElement("p");

    dueDate.textContent = `Due: ${formatDueDate(task.dueDate)}`;

    // Delete button
    const deleteButton = document.createElement("button");

    deleteButton.type = "button";
    deleteButton.className = "btn-delete";
    deleteButton.textContent = "Delete";

    deleteButton.addEventListener("click", () => {
        const confirmed = confirm(
            `Delete "${task.title || "this task"}"?`
        );

        if (!confirmed) return;

        const previousTasks = tasks;

        tasks = tasks.filter(item => item.id !== task.id);

        if (!saveTasks()) {
            tasks = previousTasks;
            return;
        }

        renderTasks();
    });

    // Add elements to the card
    card.append(
        title,
        description,
        details,
        statusLabel,
        dueDate,
        deleteButton
    );

    return card;
}

// =====================================
// 7. SEARCH AND FILTER TASKS
// =====================================


function getFilteredTasks() {
    const searchTerm = searchInput.value.trim().toLowerCase();
    const selectedStatus = statusFilter.value;
    const selectedCategory = categoryFilter.value;

    // Support both normal and lowercase status values.
    function normalizeStatus(status) {
        const value = (status || "Pending")
            .toLowerCase()
            .replace(/_/g, " ")
            .trim();

        if (value === "in progress") return "In Progress";
        if (value === "completed") return "Completed";

        return "Pending";
    }

    return tasks.filter(task => {
        const title = (task.title || "").toLowerCase();

        const matchesSearch = title.includes(searchTerm);

        const taskStatus = normalizeStatus(task.status);

        const normalizedFilterStatus =
            selectedStatus === "all"
                ? "all"
                : normalizeStatus(selectedStatus);

        const matchesStatus =
            normalizedFilterStatus === "all" ||
            taskStatus === normalizedFilterStatus;

        const taskCategory = (task.category || "Other").toLowerCase();

        const matchesCategory =
            selectedCategory === "all" ||
            taskCategory === selectedCategory.toLowerCase();

        return matchesSearch && matchesStatus && matchesCategory;
    });
}

// =====================================
// 8. DISPLAY TASKS
// =====================================

function renderTasks() {
    const filteredTasks = getFilteredTasks();

    allTaskList.replaceChildren();

    filteredTasks.forEach(task => {
        allTaskList.appendChild(createTaskCard(task));
    });

    taskCount.textContent =
        `${filteredTasks.length} ` +
        `${filteredTasks.length === 1 ? "task" : "tasks"}`;

    emptyMessage.hidden = filteredTasks.length !== 0;
}

// =====================================
// 9. OPEN AND CLOSE THE TASK FORM
// =====================================

openFormButton.addEventListener("click", () => {
    taskFormSection.hidden = false;

    document.getElementById("task-title").focus();
});

cancelFormButton.addEventListener("click", () => {
    taskForm.reset();
    taskFormSection.hidden = true;
});

// =====================================
// 10. CREATE A NEW TASK
// =====================================

taskForm.addEventListener("submit", event => {
    event.preventDefault();

    const title = document
        .getElementById("task-title")
        .value.trim();

    if (!title) {
        alert("Please enter a task title.");
        return;
    }

    const task = {
        id: Date.now(),
        title,
        description: document
            .getElementById("task-description")
            .value.trim(),
        category: document.getElementById("task-category").value,
        priority: document.getElementById("task-priority").value,
        dueDate: document.getElementById("task-due-date").value,
        status: "Pending"
    };

    tasks.push(task);

    if (!saveTasks()) {
        tasks.pop();
        return;
    }

    taskForm.reset();
    taskFormSection.hidden = true;

    // Show the newly created task if it matches the current filters.
    renderTasks();
});

// =====================================
// 11. CONNECT SEARCH AND FILTERS
// =====================================

searchInput.addEventListener("input", renderTasks);

statusFilter.addEventListener("change", renderTasks);

categoryFilter.addEventListener("change", renderTasks);

// =====================================
// 12. INITIALIZE THE PAGE
// =====================================

renderTasks();
// Keep tasks synchronized when another tab changes localStorage.
window.addEventListener("storage", event => {
    if (event.key !== STORAGE_KEY && event.key !== null) {
        return;
    }

    tasks = loadTasks();
    renderTasks();
});
"use strict";

// ======================================================
// 1. SELECT HTML ELEMENTS
// ======================================================

// Sidebar and mobile menu
const sidebar = document.getElementById("sidebar");
const menuToggle = document.getElementById("menu-toggle");

// Date and copyright year
const currentDateElement = document.getElementById("current-date");
const currentYearElement = document.getElementById("current-year");

// Task form controls
const openTaskFormButton = document.getElementById("open-task-form");
const taskFormSection = document.getElementById("task-form-section");
const cancelTaskFormButton = document.getElementById("cancel-task-form");
const taskForm = document.getElementById("task-form");

// Task form fields
const taskTitleInput = document.getElementById("task-title");
const taskDescriptionInput = document.getElementById("task-description");
const taskCategoryInput = document.getElementById("task-category");
const taskPriorityInput = document.getElementById("task-priority");
const taskDueDateInput = document.getElementById("task-due-date");

// Task list containers
const todayTaskList = document.getElementById("today-task-list");
const upcomingTaskList = document.getElementById("upcoming-task-list");

// Dashboard statistics
const totalTasksElement = document.getElementById("total-tasks");
const pendingTasksElement = document.getElementById("pending-tasks");
const inProgressTasksElement = document.getElementById("in-progress-tasks");
const completedTasksElement = document.getElementById("completed-tasks");

// ======================================================
// 2. DISPLAY THE CURRENT DATE AND YEAR
// ======================================================

function displayCurrentDate() {
    if (!currentDateElement) return;

    const today = new Date();

    currentDateElement.textContent = new Intl.DateTimeFormat("en", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric"
    }).format(today);
}

displayCurrentDate();

if (currentYearElement) {
    currentYearElement.textContent = new Date().getFullYear();
}

// ======================================================
// 3. MOBILE SIDEBAR
// ======================================================

if (sidebar && menuToggle) {
    menuToggle.addEventListener("click", () => {
        const isOpen = sidebar.classList.toggle("is-open");
        menuToggle.setAttribute("aria-expanded", String(isOpen));
    });

    sidebar.querySelectorAll(".nav-link").forEach((link) => {
        link.addEventListener("click", () => {
            sidebar.classList.remove("is-open");
            menuToggle.setAttribute("aria-expanded", "false");
        });
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            sidebar.classList.remove("is-open");
            menuToggle.setAttribute("aria-expanded", "false");
        }
    });
}

// ======================================================
// 4. TASK FORM CONTROLS
// ======================================================

// Storage key and task statuses
const STORAGE_KEY = "taskflow-tasks";

const TASK_STATUSES = [
    "Pending",
    "In Progress",
    "Completed"
];

// Track whether we are creating or editing a task.
let editingTaskId = null;

// Show the task form.
function showTaskForm() {
    if (!taskFormSection || !openTaskFormButton) return;

    taskFormSection.hidden = false;
    openTaskFormButton.setAttribute("aria-expanded", "true");

    if (taskTitleInput) {
        taskTitleInput.focus();
    }

    taskFormSection.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}

// Hide the task form.
function hideTaskForm() {
    if (!taskFormSection || !openTaskFormButton) return;

    taskFormSection.hidden = true;
    openTaskFormButton.setAttribute("aria-expanded", "false");
}

// Reset the form to create-task mode.
function resetTaskFormMode() {
    editingTaskId = null;

    if (taskForm) {
        const submitButton = taskForm.querySelector(
            'button[type="submit"]'
        );

        if (submitButton) {
            submitButton.textContent = "Add Task";
        }
    }
}

// Open a blank form for a new task.
if (openTaskFormButton) {
    openTaskFormButton.addEventListener("click", () => {
        if (taskForm) {
            taskForm.reset();
        }

        resetTaskFormMode();
        showTaskForm();
    });
}

// Cancel task creation or editing.
if (cancelTaskFormButton) {
    cancelTaskFormButton.addEventListener("click", () => {
        if (taskForm) {
            taskForm.reset();
        }

        resetTaskFormMode();
        hideTaskForm();
    });
}

// ======================================================
// 5. LOAD SAVED TASKS
// ======================================================

function loadTasks() {
    try {
        const savedTasks = localStorage.getItem(STORAGE_KEY);

        if (!savedTasks) {
            return [];
        }

        const parsedTasks = JSON.parse(savedTasks);

        if (!Array.isArray(parsedTasks)) {
            return [];
        }

        return parsedTasks.map((task) => ({
            ...task,
            status: TASK_STATUSES.includes(task.status)
                ? task.status
                : "Pending"
        }));

    } catch (error) {
        console.error("Could not load saved tasks:", error);
        return [];
    }
}

// All tasks currently stored in memory.
const tasks = loadTasks();

// ======================================================
// 6. SAVE TASKS
// ======================================================

function saveTasks() {
    try {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(tasks)
        );

        return true;

    } catch (error) {
        console.error("Could not save tasks:", error);

        alert(
            "TaskFlow could not save your changes. " +
            "Please check your browser storage settings."
        );

        return false;
    }
}

// ======================================================
// 7. UPDATE DASHBOARD STATISTICS
// ======================================================

function updateTaskStatistics() {
    const total = tasks.length;

    const pending = tasks.filter(
        (task) => task.status === "Pending"
    ).length;

    const inProgress = tasks.filter(
        (task) => task.status === "In Progress"
    ).length;

    const completed = tasks.filter(
        (task) => task.status === "Completed"
    ).length;

    if (totalTasksElement) {
        totalTasksElement.textContent = total;
    }

    if (pendingTasksElement) {
        pendingTasksElement.textContent = pending;
    }

    if (inProgressTasksElement) {
        inProgressTasksElement.textContent = inProgress;
    }

    if (completedTasksElement) {
        completedTasksElement.textContent = completed;
    }
}

// ======================================================
// 8. CHANGE TASK STATUS
// ======================================================

function changeTaskStatus(task, newStatus) {
    if (!TASK_STATUSES.includes(newStatus)) {
        return false;
    }

    const previousStatus = task.status;

    task.status = newStatus;

    if (!saveTasks()) {
        task.status = previousStatus;
        return false;
    }

    renderTasks();

    return true;
}

// ======================================================
// 9. CREATE A TASK CARD
// ======================================================

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
        `${task.category || "General"} · ` +
        `${task.priority || "Medium"} priority`;

    card.append(title, description, details);

    // Task due date
    if (task.dueDate) {
        const dueDate = document.createElement("p");
        dueDate.textContent = `Due: ${task.dueDate}`;
        card.appendChild(dueDate);
    }

    // Task status dropdown
    const statusLabel = document.createElement("label");
    statusLabel.className = "task-status-label";
    statusLabel.textContent = "Status: ";

    const statusSelect = document.createElement("select");
    statusSelect.className = "task-status";

    statusSelect.setAttribute(
        "aria-label",
        `Status for ${task.title || "task"}`
    );

    TASK_STATUSES.forEach((status) => {
        const option = document.createElement("option");

        option.value = status;
        option.textContent = status;

        statusSelect.appendChild(option);
    });

    statusSelect.value = TASK_STATUSES.includes(task.status)
        ? task.status
        : "Pending";

    statusSelect.addEventListener("change", () => {
        const newStatus = statusSelect.value;
        const saved = changeTaskStatus(task, newStatus);

        if (!saved) {
            statusSelect.value = task.status;
        }
    });

    statusLabel.appendChild(statusSelect);

    // ==================================================
    // EDIT TASK BUTTON
    // ==================================================

    const editButton = document.createElement("button");

    editButton.type = "button";
    editButton.className = "btn-edit";
    editButton.textContent = "Edit";

    editButton.addEventListener("click", () => {
        if (!taskForm || !taskFormSection) {
            return;
        }

        // Switch into editing mode.
        editingTaskId = task.id;

        // Populate the form with the existing task details.
        if (taskTitleInput) {
            taskTitleInput.value = task.title || "";
        }

        if (taskDescriptionInput) {
            taskDescriptionInput.value = task.description || "";
        }

        if (taskCategoryInput) {
            taskCategoryInput.value = task.category || "General";
        }

        if (taskPriorityInput) {
            taskPriorityInput.value = task.priority || "Medium";
        }

        if (taskDueDateInput) {
            taskDueDateInput.value = task.dueDate || "";
        }

        showTaskForm();

        // Change the button label while editing.
        const submitButton = taskForm.querySelector(
            'button[type="submit"]'
        );

        if (submitButton) {
            submitButton.textContent = "Save Changes";
        }
    });

    card.appendChild(editButton);
    card.appendChild(statusLabel);

    // ==================================================
    // DELETE TASK BUTTON
    // ==================================================

    const deleteButton = document.createElement("button");

    deleteButton.type = "button";
    deleteButton.textContent = "Delete";
    deleteButton.className = "btn-delete";

    deleteButton.addEventListener("click", () => {
        const confirmed = confirm(
            `Are you sure you want to delete "${task.title}"?`
        );

        if (!confirmed) {
            return;
        }

        const taskIndex = tasks.findIndex(
            (item) => item.id === task.id
        );

        if (taskIndex === -1) {
            return;
        }

        const removedTask = tasks.splice(taskIndex, 1)[0];

        if (!saveTasks()) {
            tasks.splice(taskIndex, 0, removedTask);
            return;
        }

        renderTasks();
    });

    card.appendChild(deleteButton);

    return card;
}

// ======================================================
// 10. GET TODAY'S DATE
// ======================================================

function getLocalDateString() {
    const now = new Date();

    const year = now.getFullYear();

    const month = String(
        now.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
        now.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

// ======================================================
// 11. RENDER DASHBOARD TASKS
// ======================================================

function renderTasks() {
    if (todayTaskList) {
        todayTaskList.replaceChildren();
    }

    if (upcomingTaskList) {
        upcomingTaskList.replaceChildren();
    }

    const today = getLocalDateString();

    tasks.forEach((task) => {
        const card = createTaskCard(task);

        // Tasks without a date, due today, or overdue.
        if (!task.dueDate || task.dueDate <= today) {
            if (todayTaskList) {
                todayTaskList.appendChild(card);
            }
        } else {
            if (upcomingTaskList) {
                upcomingTaskList.appendChild(card);
            }
        }
    });

    updateTaskStatistics();
}

// ======================================================
// 12. CREATE AND EDIT TASKS
// ======================================================

if (taskForm) {
    taskForm.addEventListener("submit", (event) => {
        event.preventDefault();

        if (!taskTitleInput) {
            return;
        }

        const title = taskTitleInput.value.trim();

        if (!title) {
            taskTitleInput.focus();
            alert("Please enter a task title.");
            return;
        }

        // Locate the task if we are editing.
        const existingTask = editingTaskId !== null
            ? tasks.find((item) => item.id === editingTaskId)
            : null;

        if (editingTaskId !== null && !existingTask) {
            alert(
                "The task could not be found. " +
                "Please refresh the page and try again."
            );

            resetTaskFormMode();
            return;
        }

        // Prepare the task information.
        const taskData = {
            id: existingTask ? existingTask.id : Date.now(),
            title: title,
            description: taskDescriptionInput
                ? taskDescriptionInput.value.trim()
                : "",
            category: taskCategoryInput
                ? taskCategoryInput.value
                : "General",
            priority: taskPriorityInput
                ? taskPriorityInput.value
                : "Medium",
            dueDate: taskDueDateInput
                ? taskDueDateInput.value
                : "",
            status: existingTask
                ? existingTask.status
                : "Pending"
        };

        // Keep a copy for rollback if saving fails.
        const previousTask = existingTask
            ? { ...existingTask }
            : null;

        // Update an existing task or create a new one.
        if (existingTask) {
            Object.assign(existingTask, taskData);
        } else {
            tasks.push(taskData);
        }

        // Save changes to localStorage.
        if (!saveTasks()) {
            if (existingTask && previousTask) {
                Object.assign(existingTask, previousTask);
            } else {
                tasks.pop();
            }

            return;
        }

        // Reset the form after a successful save.
        taskForm.reset();
        resetTaskFormMode();
        hideTaskForm();
        renderTasks();
    });
}

// ======================================================
// 13. INITIALIZE TASKFLOW
// ======================================================

// Display
const storageKey = "aditya-todo-tasks";

function loadTasks() {
  try {
    const savedTasks = localStorage.getItem(storageKey);

    if (!savedTasks) {
      return [];
    }

    const parsedTasks = JSON.parse(savedTasks);

    if (!Array.isArray(parsedTasks)) {
      return [];
    }

    return parsedTasks.filter(function (task) {
      return (
        task &&
        typeof task.id === "string" &&
        typeof task.text === "string" &&
        typeof task.done === "boolean"
      );
    });
  } catch {
    return [];
  }
}

let tasks = loadTasks();
let currentFilter = "all";

const form = document.querySelector("#form");
const input = document.querySelector("#text");
const list = document.querySelector("#list");
const count = document.querySelector("#count");
const filters = document.querySelector(".filters");
const clearButton = document.querySelector("#clear-completed");

function saveTasks() {
  try {
    localStorage.setItem(storageKey, JSON.stringify(tasks));
  } catch {
    count.textContent = "Your browser could not save the tasks";
  }
}

function getVisibleTasks() {
  if (currentFilter === "active") {
    return tasks.filter(function (task) {
      return !task.done;
    });
  }

  if (currentFilter === "done") {
    return tasks.filter(function (task) {
      return task.done;
    });
  }

  return tasks;
}

function render() {
  list.replaceChildren();

  const visibleTasks = getVisibleTasks();

  if (visibleTasks.length === 0) {
    const emptyMessage = document.createElement("li");
    emptyMessage.className = "empty-state";

    if (currentFilter === "active" && tasks.length > 0) {
      emptyMessage.textContent = "You’re all caught up.";
    } else if (currentFilter === "done" && tasks.length > 0) {
      emptyMessage.textContent = "No completed tasks yet.";
    } else {
      emptyMessage.textContent = "No tasks here yet. Add one above to get started.";
    }

    list.append(emptyMessage);
  }

  visibleTasks.forEach(function (task) {
    const item = document.createElement("li");
    const checkbox = document.createElement("input");
    const text = document.createElement("span");
    const doneLabel = document.createElement("label");
    const deleteButton = document.createElement("button");

    item.className = "task-item";
    item.dataset.id = task.id;

    if (task.done) {
      item.classList.add("done");
    }

    checkbox.type = "checkbox";
    checkbox.checked = task.done;
    checkbox.dataset.action = "toggle";
    checkbox.setAttribute("aria-label", "Mark " + task.text + " as complete");

    text.className = "task-text";
    text.textContent = task.text;

    doneLabel.append(checkbox);
    item.append(doneLabel, text);

    deleteButton.type = "button";
    deleteButton.className = "task-action delete-button";
    deleteButton.dataset.action = "delete";
    deleteButton.textContent = "Delete";
    deleteButton.setAttribute("aria-label", "Delete " + task.text);

    item.append(deleteButton);
    list.append(item);
  });

  const remaining = tasks.filter(function (task) {
    return !task.done;
  }).length;

  count.textContent = remaining + (remaining === 1 ? " task left" : " tasks left");
  clearButton.disabled = !tasks.some(function (task) {
    return task.done;
  });

  filters.querySelectorAll("button").forEach(function (button) {
    button.setAttribute(
      "aria-pressed",
      String(button.dataset.filter === currentFilter)
    );
  });
}

form.addEventListener("submit", function (event) {
  event.preventDefault();

  const text = input.value.trim();

  if (text === "") {
    input.focus();
    return;
  }

  tasks.push({
    id: Date.now().toString() + "-" + Math.random().toString(16).slice(2),
    text: text,
    done: false
  });

  input.value = "";
  saveTasks();
  render();
  input.focus();
});

list.addEventListener("change", function (event) {
  if (event.target.dataset.action !== "toggle") {
    return;
  }

  const item = event.target.closest("li");
  const task = tasks.find(function (task) {
    return task.id === item.dataset.id;
  });

  if (!task) {
    return;
  }

  task.done = event.target.checked;
  saveTasks();
  render();
});

list.addEventListener("click", function (event) {
  const button = event.target.closest('button[data-action="delete"]');

  if (!button) {
    return;
  }

  const item = button.closest("li");

  tasks = tasks.filter(function (task) {
    return task.id !== item.dataset.id;
  });

  saveTasks();
  render();
});

filters.addEventListener("click", function (event) {
  const button = event.target.closest("button[data-filter]");

  if (!button) {
    return;
  }

  currentFilter = button.dataset.filter;
  render();
});

clearButton.addEventListener("click", function () {
  tasks = tasks.filter(function (task) {
    return !task.done;
  });

  saveTasks();
  render();
});

render();
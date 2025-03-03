const express = require("express");
const fs = require("fs");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();
const PORT = 3000;
const TASKS_FILE = "tasks.json";

app.use(bodyParser.json());

// Serve static files from the 'public' folder
app.use(express.static(path.join(__dirname, "public")));

// Serve the home page
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Helper functions
const readTasks = () => {
    try {
        const data = fs.readFileSync(TASKS_FILE);
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
};

const writeTasks = (tasks) => {
    fs.writeFileSync(TASKS_FILE, JSON.stringify(tasks, null, 2));
};

// CRUD API Routes
app.get("/tasks", (req, res) => res.json(readTasks()));

app.post("/tasks", (req, res) => {
    const { title, status } = req.body;
    const tasks = readTasks();
    const newTask = { id: tasks.length + 1, title, status: status || "pending" };
    tasks.push(newTask);
    writeTasks(tasks);
    res.status(201).json(newTask);
});

app.put("/tasks/:id", (req, res) => {
    const { id } = req.params;
    const { title, status } = req.body;
    const tasks = readTasks();
    const taskIndex = tasks.findIndex((t) => t.id === parseInt(id));

    if (taskIndex === -1) return res.status(404).json({ error: "Task not found" });

    if (title) tasks[taskIndex].title = title;
    if (status) tasks[taskIndex].status = status;

    writeTasks(tasks);
    res.json(tasks[taskIndex]);
});

app.delete("/tasks/:id", (req, res) => {
    const { id } = req.params;
    let tasks = readTasks();
    const filteredTasks = tasks.filter((t) => t.id !== parseInt(id));

    if (tasks.length === filteredTasks.length) {
        return res.status(404).json({ error: "Task not found" });
    }

    writeTasks(filteredTasks);
    res.json({ message: "Task deleted successfully" });
});

// Start the server
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));

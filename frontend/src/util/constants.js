export const API_BASE_URL = "http://127.0.0.1:8000/api/";

export const ROUTES = {
    root: "/",
    tasks: "/tasks/",
    tasksAdd: "/tasks/add",
    taskDetail: (id = ":id") => `/tasks/${id}/`,
};

export const STATUS_OPTIONS = [
    {
        value: "not_started",
        label: "Not Started",
        color: "gray",
        tooltip: "Task has not started",
        default: true,
    },
    {
        value: "in_progress",
        label: "In Progress",
        color: "blue",
        tooltip: "Task is in progress",
    },
    {
        value: "on_hold",
        label: "On Hold",
        color: "orange",
        tooltip: "Task is on hold",
    },
    {
        value: "in_review",
        label: "In Review",
        color: "purple",
        tooltip: "Task is in review",
    },
    {
        value: "completed",
        label: "Completed",
        color: "green",
        tooltip: "Task is completed",
    },
];

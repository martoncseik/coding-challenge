import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { ROUTES } from "../util/constants.js";

vi.mock("@mui/x-data-grid", () => ({
    DataGrid: ({ rows }) => (
        <div>
            {rows.map((row) => (
                <div key={row.id}>{row.title}</div>
            ))}
        </div>
    ),
}));

vi.mock("../util/api.js", () => ({
    default: {
        get: vi.fn(),
    },
}));

import api from "../util/api.js";
import TasksPage from "../pages/TasksPage.jsx";

const LocationDisplay = () => {
    const location = useLocation();
    return <div data-testid="location-display">{location.pathname}</div>;
};

const renderTasksPage = (initialEntries) => {
    return render(
        <MemoryRouter initialEntries={initialEntries}>
            <Routes>
                <Route path="/tasks/" element={<TasksPage />} />
                <Route path="/tasks/add" element={<TasksPage />} />
                <Route path="/tasks/:id/" element={<TasksPage />} />
            </Routes>
            <LocationDisplay />
        </MemoryRouter>,
    );
};

describe("TasksPage", () => {
    beforeEach(() => {
        api.get.mockResolvedValue({ data: [] });
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it("opens AddTaskModalForm when clicking Add Task", async () => {
        renderTasksPage([ROUTES.tasks]);

        fireEvent.click(screen.getByRole("button", { name: /add task/i }));

        await waitFor(() => {
            expect(screen.getByText("Add New Task")).toBeInTheDocument();
        });

        expect(screen.getByTestId("location-display")).toHaveTextContent(
            ROUTES.tasksAdd,
        );
    });

    it("opens add form based on URL", async () => {
        renderTasksPage([ROUTES.tasksAdd]);

        await waitFor(() => {
            expect(screen.getByText("Add New Task")).toBeInTheDocument();
        });
    });

    it("opens edit form based on URL", async () => {
        const task = {
            id: "1",
            title: "Task A",
            description: "Desc",
            status: "not_started",
            due_date_time: "2025-01-05T14:30:00.000Z",
        };
        api.get.mockImplementation((url) => {
            if (url === "tasks/1/") {
                return Promise.resolve({ data: task });
            }
            return Promise.resolve({ data: [] });
        });

        renderTasksPage([ROUTES.taskDetail("1")]);

        await waitFor(() => {
            expect(screen.getByText("Edit Task Status")).toBeInTheDocument();
        });

        await waitFor(() => {
            expect(api.get).toHaveBeenCalledWith("tasks/1/");
        });
    });
});

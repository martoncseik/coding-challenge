import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import TasksTable from "../components/TasksTable.jsx";
import { ROUTES } from "../util/constants.js";

vi.mock("@mui/x-data-grid", () => ({
    DataGrid: ({ rows, columns }) => (
        <div>
            {rows.map((row) => (
                <div key={row.id} data-testid="task-row">
                    {columns.map((column) => (
                        <div key={column.field}>
                            {column.renderCell
                                ? column.renderCell({ row })
                                : row[column.field]}
                        </div>
                    ))}
                </div>
            ))}
        </div>
    ),
}));

vi.mock("../util/helpers.js", async () => {
    const actual = await vi.importActual("../util/helpers.js");
    return {
        ...actual,
        formatDateTime: vi.fn((value) => `formatted:${value}`),
    };
});

import { formatDateTime } from "../util/helpers.js";

const rows = [
    {
        id: "1",
        title: "Task A",
        description: "First task",
        status: "in_progress",
        due_date_time: "2025-01-05T14:30:00.000Z",
    },
    {
        id: "2",
        title: "Task B",
        description: "Second task",
        status: "completed",
        due_date_time: "2025-02-10T09:00:00.000Z",
    },
];

describe("TasksTable", () => {
    it("renders the correct number of rows", () => {
        render(
            <MemoryRouter>
                <TasksTable rows={rows} />
            </MemoryRouter>,
        );

        expect(screen.getAllByTestId("task-row")).toHaveLength(rows.length);
    });

    it("renders column values in the expected format", () => {
        render(
            <MemoryRouter>
                <TasksTable rows={rows} />
            </MemoryRouter>,
        );

        const link = screen.getByRole("link", { name: "Task A" });

        expect(link).toHaveAttribute("href", ROUTES.taskDetail("1"));

        expect(screen.getByText("In Progress")).toBeInTheDocument();
        expect(
            screen.getByText("formatted:2025-01-05T14:30:00.000Z"),
        ).toBeInTheDocument();
        expect(screen.getByText("First task")).toBeInTheDocument();

        expect(formatDateTime).toHaveBeenCalledWith("2025-01-05T14:30:00.000Z");
        expect(formatDateTime).toHaveBeenCalledWith("2025-02-10T09:00:00.000Z");
    });
});

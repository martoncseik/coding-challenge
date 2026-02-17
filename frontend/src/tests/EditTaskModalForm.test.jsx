import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import EditTaskModalForm from "../components/EditTaskModalForm.jsx";
import { STATUS_OPTIONS } from "../util/constants.js";

vi.mock("../util/api.js", () => ({
    default: {
        get: vi.fn(),
        patch: vi.fn(),
        delete: vi.fn(),
    },
}));

vi.mock("../util/helpers.js", () => ({
    formatDateTime: vi.fn((value) => `formatted:${value}`),
    noop: () => {},
}));

import api from "../util/api.js";
import { formatDateTime } from "../util/helpers.js";

describe("EditTaskModalForm", () => {
    const originalAlert = window.alert;
    const originalConfirm = window.confirm;

    beforeEach(() => {
        window.alert = vi.fn();
        window.confirm = vi.fn(() => true);
    });

    afterEach(() => {
        window.alert = originalAlert;
        window.confirm = originalConfirm;
        vi.clearAllMocks();
    });

    it("shows loading state while fetching", async () => {
        let resolvePromise;
        const pending = new Promise((resolve) => {
            resolvePromise = resolve;
        });
        api.get.mockReturnValueOnce(pending);

        render(
            <EditTaskModalForm
                taskId="1"
                onClose={() => {}}
                onSubmit={() => {}}
            />,
        );

        expect(screen.getByText("Loading task...")).toBeInTheDocument();

        resolvePromise({
            data: {
                id: "1",
                title: "Task A",
                description: "Desc",
                status: "not_started",
                due_date_time: "2025-01-05T14:30:00.000Z",
            },
        });

        await waitFor(() => {
            expect(screen.getByText("Task A")).toBeInTheDocument();
        });
    });

    it("renders task details after load", async () => {
        api.get.mockResolvedValueOnce({
            data: {
                id: "1",
                title: "Sample task",
                description: "Sample description",
                status: "in_progress",
                due_date_time: "2025-01-05T14:30:00.000Z",
            },
        });

        render(
            <EditTaskModalForm
                taskId="1"
                onClose={() => {}}
                onSubmit={() => {}}
            />,
        );

        await waitFor(() => {
            expect(screen.getByText("Sample task")).toBeInTheDocument();
            expect(screen.getByText("Sample description")).toBeInTheDocument();
        });

        expect(formatDateTime).toHaveBeenCalledWith("2025-01-05T14:30:00.000Z");
        expect(
            screen.getByText("formatted:2025-01-05T14:30:00.000Z"),
        ).toBeInTheDocument();
    });

    it("closes on cancel", async () => {
        const onClose = vi.fn();
        api.get.mockResolvedValueOnce({
            data: {
                id: "1",
                title: "Sample task",
                description: "Sample description",
                status: "in_progress",
                due_date_time: "2025-01-05T14:30:00.000Z",
            },
        });

        render(
            <EditTaskModalForm
                taskId="1"
                onClose={onClose}
                onSubmit={() => {}}
            />,
        );

        await waitFor(() => {
            expect(screen.getByText("Sample task")).toBeInTheDocument();
        });

        fireEvent.click(screen.getByRole("button", { name: /cancel/i }));

        expect(onClose).toHaveBeenCalled();
        expect(api.patch).not.toHaveBeenCalled();
    });

    it("saves updated status and closes", async () => {
        const onSubmit = vi.fn();
        const onClose = vi.fn();
        api.get.mockResolvedValueOnce({
            data: {
                id: "1",
                title: "Sample task",
                description: "Sample description",
                status: "not_started",
                due_date_time: "2025-01-05T14:30:00.000Z",
            },
        });
        api.patch.mockResolvedValueOnce({
            data: { id: "1", status: "completed" },
        });

        render(
            <EditTaskModalForm
                taskId="1"
                onClose={onClose}
                onSubmit={onSubmit}
            />,
        );

        await waitFor(() => {
            expect(screen.getByText("Sample task")).toBeInTheDocument();
        });

        const statusInput = screen.getByRole("combobox", { name: /status/i });
        fireEvent.mouseDown(statusInput);
        fireEvent.click(screen.getByText(STATUS_OPTIONS[4].label));
        fireEvent.click(screen.getByRole("button", { name: /save/i }));

        await waitFor(() => {
            expect(api.patch).toHaveBeenCalledWith("tasks/1/", {
                status: STATUS_OPTIONS[4].value,
            });
        });

        expect(onSubmit).toHaveBeenCalledWith({ id: "1", status: "completed" });
        expect(onClose).toHaveBeenCalled();
    });

    it("shows an alert when saving fails", async () => {
        const onSubmit = vi.fn();
        const onClose = vi.fn();
        api.get.mockResolvedValueOnce({
            data: {
                id: "1",
                title: "Sample task",
                description: "Sample description",
                status: "not_started",
                due_date_time: "2025-01-05T14:30:00.000Z",
            },
        });
        api.patch.mockRejectedValueOnce(new Error("Network error"));

        render(
            <EditTaskModalForm
                taskId="1"
                onClose={onClose}
                onSubmit={onSubmit}
            />,
        );

        await waitFor(() => {
            expect(screen.getByText("Sample task")).toBeInTheDocument();
        });

        fireEvent.click(screen.getByRole("button", { name: /save/i }));

        await waitFor(() => {
            expect(window.alert).toHaveBeenCalled();
        });

        expect(onSubmit).not.toHaveBeenCalled();
        expect(onClose).not.toHaveBeenCalled();
    });

    it("does not delete when confirmation is rejected", async () => {
        window.confirm = vi.fn(() => false);
        api.get.mockResolvedValueOnce({
            data: {
                id: "1",
                title: "Sample task",
                description: "Sample description",
                status: "not_started",
                due_date_time: "2025-01-05T14:30:00.000Z",
            },
        });

        render(
            <EditTaskModalForm
                taskId="1"
                onClose={() => {}}
                onSubmit={() => {}}
            />,
        );

        await waitFor(() => {
            expect(screen.getByText("Sample task")).toBeInTheDocument();
        });

        fireEvent.click(screen.getByRole("button", { name: /delete task/i }));

        expect(api.delete).not.toHaveBeenCalled();
    });

    it("deletes when confirmation is approved", async () => {
        const onSubmit = vi.fn();
        const onClose = vi.fn();
        api.get.mockResolvedValueOnce({
            data: {
                id: "1",
                title: "Sample task",
                description: "Sample description",
                status: "not_started",
                due_date_time: "2025-01-05T14:30:00.000Z",
            },
        });
        api.delete.mockResolvedValueOnce({});

        render(
            <EditTaskModalForm
                taskId="1"
                onClose={onClose}
                onSubmit={onSubmit}
            />,
        );

        await waitFor(() => {
            expect(screen.getByText("Sample task")).toBeInTheDocument();
        });

        fireEvent.click(screen.getByRole("button", { name: /delete task/i }));

        await waitFor(() => {
            expect(api.delete).toHaveBeenCalledWith("tasks/1/");
        });

        expect(onSubmit).toHaveBeenCalled();
        expect(onClose).toHaveBeenCalled();
    });

    it("shows not found when loading fails", async () => {
        api.get.mockRejectedValueOnce(new Error("Not found"));

        render(
            <EditTaskModalForm
                taskId="1"
                onClose={() => {}}
                onSubmit={() => {}}
            />,
        );

        await waitFor(() => {
            expect(screen.getByText("Task not found.")).toBeInTheDocument();
        });
        expect(window.alert).toHaveBeenCalled();
    });
});

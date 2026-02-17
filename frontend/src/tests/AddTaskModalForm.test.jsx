import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import AddTaskModalForm from "../components/AddTaskModalForm.jsx";
import { STATUS_OPTIONS } from "../util/constants.js";

vi.mock("../util/api", () => ({
    default: {
        post: vi.fn(),
    },
}));

import api from "../util/api";

describe("AddTaskModalForm", () => {
    const originalAlert = window.alert;

    beforeEach(() => {
        window.alert = vi.fn();
    });

    afterEach(() => {
        window.alert = originalAlert;
        vi.clearAllMocks();
    });

    it("marks required fields and optional description", () => {
        render(<AddTaskModalForm onClose={() => {}} onSubmit={() => {}} />);

        const titleInput = screen.getByLabelText(/title/i);
        const descriptionInput = screen.getByLabelText(/description/i);
        const dueDateInput = screen.getByLabelText(/due date/i);

        expect(titleInput).toBeRequired();
        expect(dueDateInput).toBeRequired();
        expect(descriptionInput).not.toBeRequired();

        const statusInput = screen.getByRole("combobox", {
            name: /status/i,
        });
        expect(statusInput).toHaveAttribute("aria-required", "true");
    });

    it("uses Not Started as the default status", () => {
        render(<AddTaskModalForm onClose={() => {}} onSubmit={() => {}} />);

        const statusInput = screen.getByRole("combobox", {
            name: /status/i,
        });
        fireEvent.mouseDown(statusInput);

        const listbox = screen.getByRole("listbox");
        const notStartedOption = screen.getByRole("option", {
            name: /not started/i,
        });

        expect(listbox).toContainElement(notStartedOption);
        expect(notStartedOption).toHaveAttribute("aria-selected", "true");
    });

    it("closes on cancel without saving", () => {
        const onClose = vi.fn();
        render(<AddTaskModalForm onClose={onClose} onSubmit={() => {}} />);

        fireEvent.click(screen.getByRole("button", { name: /cancel/i }));

        expect(onClose).toHaveBeenCalled();
        expect(api.post).not.toHaveBeenCalled();
    });

    it("saves and closes when valid info provided", async () => {
        const onClose = vi.fn();
        const onSubmit = vi.fn();
        api.post.mockResolvedValueOnce({ data: { id: "1" } });

        render(<AddTaskModalForm onClose={onClose} onSubmit={onSubmit} />);

        fireEvent.change(screen.getByLabelText(/title/i), {
            target: { value: "New Task" },
        });
        fireEvent.change(screen.getByLabelText(/description/i), {
            target: { value: "Optional details" },
        });
        fireEvent.change(screen.getByLabelText(/due date/i), {
            target: { value: "2025-01-05T14:30" },
        });

        const statusInput = screen.getByRole("combobox", {
            name: /status/i,
        });
        fireEvent.mouseDown(statusInput);
        fireEvent.click(screen.getByText(STATUS_OPTIONS[1].label));

        fireEvent.click(screen.getByRole("button", { name: /save/i }));

        await waitFor(() => {
            expect(api.post).toHaveBeenCalledWith("tasks/", {
                title: "New Task",
                description: "Optional details",
                due_date_time: "2025-01-05T14:30",
                status: STATUS_OPTIONS[1].value,
            });
        });

        expect(onSubmit).toHaveBeenCalledWith({ id: "1" });
        expect(onClose).toHaveBeenCalled();
    });

    it("shows an alert if the API call fails", async () => {
        const onClose = vi.fn();
        const onSubmit = vi.fn();
        api.post.mockRejectedValueOnce(new Error("Network error"));

        render(<AddTaskModalForm onClose={onClose} onSubmit={onSubmit} />);

        fireEvent.change(screen.getByLabelText(/title/i), {
            target: { value: "New Task" },
        });
        fireEvent.change(screen.getByLabelText(/due date/i), {
            target: { value: "2025-01-05T14:30" },
        });

        fireEvent.click(screen.getByRole("button", { name: /save/i }));

        await waitFor(() => {
            expect(window.alert).toHaveBeenCalled();
        });

        expect(onSubmit).not.toHaveBeenCalled();
        expect(onClose).not.toHaveBeenCalled();
    });
});

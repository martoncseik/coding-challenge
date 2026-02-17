import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import StatusInput from "../components/StatusInput.jsx";
import { STATUS_OPTIONS } from "../util/constants.js";

describe("StatusInput", () => {
    it("renders all status options", () => {
        render(
            <StatusInput value={STATUS_OPTIONS[0].value} onChange={() => {}} />,
        );

        const input = screen.getByRole("combobox", { name: /status/i });
        fireEvent.mouseDown(input);

        const listbox = screen.getByRole("listbox");

        STATUS_OPTIONS.forEach((option) => {
            expect(
                within(listbox).getByRole("option", { name: option.label }),
            ).toBeInTheDocument();
        });
    });

    it("calls onChange with the selected value", () => {
        const handleChange = vi.fn();
        render(
            <StatusInput
                value={STATUS_OPTIONS[0].value}
                onChange={handleChange}
            />,
        );

        const input = screen.getByRole("combobox", { name: /status/i });
        fireEvent.mouseDown(input);
        fireEvent.click(screen.getByText(STATUS_OPTIONS[1].label));

        expect(handleChange).toHaveBeenCalled();
        expect(handleChange.mock.calls[0][0].target.value).toBe(
            STATUS_OPTIONS[1].value,
        );
    });

    it("is required by default and can be optional", () => {
        const { container, rerender } = render(
            <StatusInput value={STATUS_OPTIONS[0].value} onChange={() => {}} />,
        );

        const requiredInput = container.querySelector(
            'input[aria-hidden="true"][required]',
        );

        expect(requiredInput).toBeTruthy();

        rerender(
            <StatusInput
                value={STATUS_OPTIONS[0].value}
                onChange={() => {}}
                required={false}
            />,
        );

        const optionalInput = container.querySelector(
            'input[aria-hidden="true"][required]',
        );

        expect(optionalInput).toBeFalsy();
    });
});

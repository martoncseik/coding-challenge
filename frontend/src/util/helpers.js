export const isDefined = (value) => value !== null && value !== undefined;

export const formatDateTime = (value) => {
    if (!value) {
        return "";
    }
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "" : date.toLocaleString();
};

export const getStatusDetails = (options, value) =>
    options.find((option) => option.value === value);

export const noop = () => {}; // No-operation function

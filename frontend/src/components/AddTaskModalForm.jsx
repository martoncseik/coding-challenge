import { useCallback, useState } from "react";
import {
    Box,
    Button,
    Divider,
    Modal,
    Paper,
    TextField,
    Typography,
} from "@mui/material";
import api from "../util/api";
import { STATUS_OPTIONS } from "../util/constants.js";
import { noop } from "../util/helpers.js";
import StatusInput from "./StatusInput.jsx";

const getDefaultStatus = (options) =>
    options.find((option) => option.default)?.value ?? options[0]?.value ?? "";

const AddTaskModalForm = ({ onClose = noop, onSubmit = noop }) => {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [dueDateTime, setDueDateTime] = useState("");
    const [status, setStatus] = useState(getDefaultStatus(STATUS_OPTIONS));

    const handleSubmit = useCallback(
        (event) => {
            event.preventDefault();
            const newTask = {
                title: title,
                description: description,
                due_date_time: dueDateTime,
                status: status,
            };

            api.post("tasks/", newTask)
                .then((response) => {
                    onSubmit(response.data);
                    onClose();
                })
                .catch((error) => {
                    console.error(
                        "The following error occurred while adding new task:",
                        error,
                    );
                    alert("An error occurred while adding the task. Please try again later.");
                });
        },
        [onClose, onSubmit, title, description, dueDateTime, status],
    );

    return (
        <Modal
            open={true}
            onClose={(event, reason) => {
                if (reason !== "backdropClick") {
                    onClose();
                }
            }}
            sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
            }}
        >
            <Paper sx={{ p: 4, width: 400 }}>
                <form onSubmit={handleSubmit}>
                    <Typography variant="h6" mb={2}>
                        Add New Task
                    </Typography>
                    <TextField
                        label="Title"
                        value={title}
                        onChange={(event) => setTitle(event.target.value)}
                        fullWidth
                        margin="normal"
                        required
                    />
                    <TextField
                        multiline
                        rows={4}
                        label="Description"
                        value={description}
                        onChange={(event) => setDescription(event.target.value)}
                        fullWidth
                        margin="normal"
                    />
                    <TextField
                        label="Due Date & Time"
                        type="datetime-local"
                        value={dueDateTime}
                        onChange={(event) => setDueDateTime(event.target.value)}
                        fullWidth
                        margin="normal"
                        slotProps={{
                            inputLabel: {
                                shrink: true,
                            },
                        }}
                        required
                    />
                    <StatusInput
                        value={status}
                        onChange={(event) => setStatus(event.target.value)}
                    />
                    <Divider sx={{ my: 2 }} />
                    <Box mt={2} display="flex" justifyContent="space-between">
                        <Button
                            onClick={onClose}
                            color="primary"
                            sx={{ mr: 1 }}
                        >
                            Cancel
                        </Button>
                        <Box sx={{ flex: 1 }} />
                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                        >
                            Save
                        </Button>
                    </Box>
                </form>
            </Paper>
        </Modal>
    );
};

export default AddTaskModalForm;

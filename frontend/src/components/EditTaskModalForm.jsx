import { useCallback, useEffect, useState } from "react";
import { Box, Button, Divider, Modal, Paper, Typography } from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import api from "../util/api.js";
import { formatDateTime, noop } from "../util/helpers.js";
import StatusInput from "./StatusInput.jsx";

const EditTaskModalForm = ({ taskId, onClose = noop, onSubmit = noop }) => {
    const [task, setTask] = useState(null);
    const [status, setStatus] = useState("");
    const taskMatchesId =
        task && !task.__error && String(task.id) === String(taskId);
    const displayTask = taskMatchesId ? task : null;
    const isTaskError = task?.__error && String(task.id) === String(taskId);
    const isLoading = Boolean(taskId) && !displayTask && !isTaskError;

    useEffect(() => {
        if (!taskId) {
            return;
        }
        api.get(`tasks/${taskId}/`)
            .then((response) => {
                setTask(response.data);
                setStatus(response.data?.status || "");
            })
            .catch((error) => {
                setTask({ __error: true, id: taskId });
                console.error(
                    "The following error occurred while loading the task:",
                    error,
                );
                alert("An error occurred while loading the task. Please try again later.");
            });
    }, [taskId]);

    const handleSubmit = useCallback(
        (event) => {
            event.preventDefault();
            if (!taskId) {
                return;
            }

            api.patch(`tasks/${taskId}/`, { status })
                .then((response) => {
                    onSubmit(response.data);
                    onClose();
                })
                .catch((error) => {
                    console.error(
                        "The following error occurred while updating the task:",
                        error,
                    );
                    alert("An error occurred while updating the task. Please try again later.");
                });
        },
        [onClose, onSubmit, status, taskId],
    );

    const handleDelete = useCallback(() => {
        if (!taskId) {
            return;
        }

        if (
            !window.confirm(
                "Are you sure you want to permanently delete this task?",
            )
        ) {
            return;
        }

        api.delete(`tasks/${taskId}/`)
            .then(() => {
                onSubmit();
                onClose();
            })
            .catch((error) => {
                console.error(
                    "The following error occurred while deleting the task:",
                    error,
                );
                alert("An error occurred while deleting the task. Please try again later.");
            });
    }, [onClose, onSubmit, taskId]);

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
                        Edit Task Status
                    </Typography>
                    {isLoading ? (
                        <Typography>Loading task...</Typography>
                    ) : displayTask ? (
                        <>
                            <Box mb={2}>
                                <Typography
                                    variant="subtitle2"
                                    color="text.secondary"
                                >
                                    Title
                                </Typography>
                                <Typography>
                                    {displayTask.title || ""}
                                </Typography>
                            </Box>
                            <Box mb={2}>
                                <Typography
                                    variant="subtitle2"
                                    color="text.secondary"
                                >
                                    Description
                                </Typography>
                                <Typography sx={{ whiteSpace: "pre-wrap" }}>
                                    {displayTask.description || ""}
                                </Typography>
                            </Box>
                            <Box mb={2}>
                                <Typography
                                    variant="subtitle2"
                                    color="text.secondary"
                                >
                                    Due Date & Time
                                </Typography>
                                <Typography>
                                    {formatDateTime(displayTask.due_date_time)}
                                </Typography>
                            </Box>
                            <StatusInput
                                value={status}
                                onChange={(event) =>
                                    setStatus(event.target.value)
                                }
                            />
                            <Divider sx={{ my: 2 }} />
                            <Button
                                onClick={handleDelete}
                                color="error"
                                variant="outlined"
                                startIcon={<DeleteOutlineIcon />}
                            >
                                Delete Task
                            </Button>
                            <Divider sx={{ my: 2 }} />
                            <Box
                                mt={2}
                                display="flex"
                                justifyContent="space-between"
                            >
                                <Button
                                    onClick={onClose}
                                    color="primary"
                                    sx={{ mr: 1 }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    color="primary"
                                >
                                    Save
                                </Button>
                            </Box>
                        </>
                    ) : (
                        <>
                            <Typography>Task not found.</Typography>
                            <Box
                                mt={2}
                                display="flex"
                                justifyContent="flex-end"
                            >
                                <Button onClick={onClose} color="primary">
                                    Close
                                </Button>
                            </Box>
                        </>
                    )}
                </form>
            </Paper>
        </Modal>
    );
};

export default EditTaskModalForm;

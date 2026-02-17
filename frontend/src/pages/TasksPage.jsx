import { useCallback, useEffect, useMemo, useState } from "react";
import { useMatch, useNavigate, useParams } from "react-router-dom";
import { Box, Button, Typography } from "@mui/material";
import AddTaskModalForm from "../components/AddTaskModalForm.jsx";
import EditTaskModalForm from "../components/EditTaskModalForm.jsx";
import TasksTable from "../components/TasksTable.jsx";
import api from "../util/api.js";
import { ROUTES } from "../util/constants.js";

const TasksPage = () => {
    const params = useParams();
    const taskId = useMemo(() => params?.id, [params]);
    const navigate = useNavigate();
    const isAddUrl = Boolean(useMatch(ROUTES.tasksAdd));
    const [tasks, setTasks] = useState([]);

    const fetchTasks = useCallback(() => {
        api.get("tasks/")
            .then((response) => {
                setTasks(response.data);
            })
            .catch((error) => {
                console.error(
                    "The following error occurred while fetching tasks:",
                    error,
                );
                alert("An error occurred while loading tasks. Please try again later.");
            });
    }, []);

    useEffect(() => {
        fetchTasks();
    }, [fetchTasks]);

    const openAddTaskModal = useCallback(() => {
        navigate(ROUTES.tasksAdd);
    }, [navigate]);

    const closeModal = useCallback(() => {
        navigate(ROUTES.tasks);
    }, [navigate]);

    return (
        <Box
            sx={{
                p: 2,
                display: "flex",
                flexDirection: "column",
                height: "100%",
                overflow: "hidden",
            }}
        >
            <Box>
                {taskId ? (
                    <EditTaskModalForm
                        taskId={taskId}
                        onClose={closeModal}
                        onSubmit={fetchTasks}
                    />
                ) : null}
                {isAddUrl ? (
                    <AddTaskModalForm
                        onClose={closeModal}
                        onSubmit={fetchTasks}
                    />
                ) : null}
                <Typography variant="h4">Caseworkers' Task Tracker</Typography>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={openAddTaskModal}
                    sx={{ my: 2, alignSelf: "flex-start" }}
                >
                    Add Task
                </Button>
            </Box>
            <Box sx={{ flex: 1, minHeight: 0, overflow: "hidden" }}>
                <TasksTable rows={tasks} />
            </Box>
        </Box>
    );
};

export default TasksPage;

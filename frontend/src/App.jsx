import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import TasksPage from "./pages/TasksPage";
import { ROUTES } from "./util/constants";

const App = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route
                    path={ROUTES.root}
                    element={<Navigate to={ROUTES.tasks} replace />}
                />
                <Route path={ROUTES.tasks} element={<TasksPage />} />
                <Route path={ROUTES.taskDetail()} element={<TasksPage />} />
                <Route path={ROUTES.tasksAdd} element={<TasksPage />} />
            </Routes>
        </BrowserRouter>
    );
};

export default App;
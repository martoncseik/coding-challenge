import { DataGrid } from "@mui/x-data-grid";
import { Link as RouterLink } from "react-router-dom";
import { Box, Link, Tooltip } from "@mui/material";
import { ROUTES, STATUS_OPTIONS } from "../util/constants.js";
import { formatDateTime, getStatusDetails } from "../util/helpers.js";

const titleColumn = {
    field: "title",
    headerName: "Title",
    width: 200,
    renderCell: (params) => (
        <Link component={RouterLink} to={ROUTES.taskDetail(params.row.id)}>
            {params.row.title}
        </Link>
    ),
};

const descriptionColumn = {
    field: "description",
    headerName: "Description",
    width: 300,
    renderCell: (params) => <Box>{params.row.description}</Box>,
};

const statusColumn = {
    field: "status",
    headerName: "Status",
    width: 130,
    renderCell: (params) => {
        const statusDetails = getStatusDetails(
            STATUS_OPTIONS,
            params.row.status,
        );
        return (
            <Tooltip
                title={statusDetails ? statusDetails.tooltip : "Unknown status"}
            >
                <Box color={statusDetails ? statusDetails.color : "primary"}>
                    {statusDetails ? statusDetails.label : params.row.status}
                </Box>
            </Tooltip>
        );
    },
};

const dateTimeColumn = {
    field: "due_date_time",
    headerName: "Due Date & Time",
    width: 200,
    renderCell: (params) => (
        <Box>{formatDateTime(params.row.due_date_time)}</Box>
    ),
};

const columns = [titleColumn, statusColumn, dateTimeColumn, descriptionColumn];

const TasksTable = ({ rows }) => {
    return (
        <DataGrid
            pageSize={5}
            rowsPerPageOptions={[5]}
            columns={columns}
            rows={rows}
            disableColumnMenu
            disableColumnFilter
            disableColumnSelector
            disableDensitySelector
            disableColumnSorting
            sx={{ height: "100%" }}
        />
    );
};

export default TasksTable;

import { MenuItem, TextField } from "@mui/material";
import { STATUS_OPTIONS } from "../util/constants.js";

const StatusInput = ({ value, onChange, ...props }) => {
    return (
        <TextField
            select
            label="Status"
            value={value}
            onChange={onChange}
            fullWidth
            margin="normal"
            required
            {...props}
        >
            {STATUS_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                    {option.label}
                </MenuItem>
            ))}
        </TextField>
    );
};

export default StatusInput;

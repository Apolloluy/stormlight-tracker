import React from "react";
import Chip from '@mui/material/Chip';




export interface StatusProps {
    status: string,
    icon: string,
    onClick: () => void
}

export const Status : React.FC<StatusProps> = ({status, icon, onClick}) => {
    return (
        <Chip 
            label={status}
            onDelete={onClick}
        />
    );
}
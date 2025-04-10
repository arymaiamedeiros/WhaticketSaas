import React, { useState, useRef } from "react";
import { styled } from '@mui/material/styles';
import Popover from "@mui/material/Popover";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import VolumeDownIcon from "@mui/icons-material/VolumeDown";
import Grid from "@mui/material/Grid";
import Slider from "@mui/material/Slider";
import Box from "@mui/material/Box";

const TabContainer = styled(Box)(({ theme }) => ({
    padding: theme.spacing(2),
}));

const PopoverContainer = styled(Box)(({ theme }) => ({
    width: "100%",
    maxWidth: 350,
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(1),
    [theme.breakpoints.down("sm")]: {
        maxWidth: 270,
    },
}));

const NotificationsVolume = ({ volume, setVolume }) => {
    const anchorEl = useRef();
    const [isOpen, setIsOpen] = useState(false);

    const handleClick = () => {
        setIsOpen((prevState) => !prevState);
    };

    const handleClickAway = () => {
        setIsOpen(false);
    };

    const handleVolumeChange = (value) => {
        setVolume(value);
        localStorage.setItem("volume", value);
    };

    return (
        <>
            <IconButton
                onClick={handleClick}
                ref={anchorEl}
                aria-label="Open Notifications"
                sx={{ color: "white" }}
            >
                <VolumeUpIcon />
            </IconButton>
            <Popover
                disableScrollLock
                open={isOpen}
                anchorEl={anchorEl.current}
                anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "right",
                }}
                transformOrigin={{
                    vertical: "top",
                    horizontal: "right",
                }}
                onClose={handleClickAway}
                PaperProps={{
                    sx: {
                        width: "100%",
                        maxWidth: 350,
                        ml: 2,
                        mr: 1,
                        '@media (max-width: 600px)': {
                            maxWidth: 270,
                        }
                    }
                }}
            >
                <List dense component={TabContainer}>
                    <Grid container spacing={2}>
                        <Grid item>
                            <VolumeDownIcon />
                        </Grid>
                        <Grid item xs>
                            <Slider
                                value={volume}
                                aria-labelledby="continuous-slider"
                                step={0.1}
                                min={0}
                                max={1}
                                onChange={(e, value) =>
                                    handleVolumeChange(value)
                                }
                            />
                        </Grid>
                        <Grid item>
                            <VolumeUpIcon />
                        </Grid>
                    </Grid>
                </List>
            </Popover>
        </>
    );
};

export default NotificationsVolume;

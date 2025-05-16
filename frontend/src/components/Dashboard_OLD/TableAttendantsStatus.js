import React from "react";

import Paper from "@material-ui/core/Paper";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Skeleton from "@material-ui/lab/Skeleton";

import { makeStyles } from "@material-ui/core/styles";
import { green, red } from "@material-ui/core/colors";

import CheckCircleIcon from "@material-ui/icons/CheckCircle";
import ErrorIcon from "@material-ui/icons/Error";
import moment from "moment";

import SafeRating from "../SafeRating";

const useStyles = makeStyles((theme) => ({
    on: {
        color: green[600],
        fontSize: "20px",
    },
    off: {
        color: red[600],
        fontSize: "20px",
    },
}));

export function RatingBox({ rating }) {
    return <SafeRating value={rating} />;
}

export default function TableAttendantsStatus(props) {
    const { loading, attendants } = props;
    const classes = useStyles();

    function renderList() {
        return attendants.map((a, k) => (
            <TableRow key={k}>
                <TableCell>{a.name}</TableCell>
                <TableCell align="center">
                    <RatingBox rating={a.rating} />
                </TableCell>
                <TableCell align="center">{formatTime(a.avgSupportTime, 2)}</TableCell>
                <TableCell align="center">
                    {a.online ? <CheckCircleIcon className={classes.on} /> : <ErrorIcon className={classes.off} />}
                </TableCell>
            </TableRow>
        ));
    }

    function formatTime(minutes) {
        return moment().startOf("day").add(minutes, "minutes").format("HH[h] mm[m]");
    }

    return (
        <Paper className={classes.paper} elevation={0}>
            <TableContainer>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell align="left">Atendente</TableCell>
                            <TableCell align="center">Avaliação</TableCell>
                            <TableCell align="center">T.M</TableCell>
                            <TableCell align="center">Status</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? Array(3)
                            .fill(0)
                            .map((e, i) => (
                                <TableRow key={i}>
                                    <TableCell align="center">
                                        <Skeleton animation="wave" />
                                    </TableCell>
                                    <TableCell align="center">
                                        <Skeleton animation="wave" />
                                    </TableCell>
                                    <TableCell align="center">
                                        <Skeleton animation="wave" />
                                    </TableCell>
                                    <TableCell align="center">
                                        <Skeleton animation="wave" />
                                    </TableCell>
                                </TableRow>
                            ))
                            : renderList()}
                    </TableBody>
                </Table>
            </TableContainer>
        </Paper>
    );
}

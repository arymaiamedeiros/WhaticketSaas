import React from "react"; // { useContext }
// import { AuthContext } from "../../context/Auth/AuthContext";

import {
    Button,
    // FormControl,
    Grid,
    // InputLabel,
    MenuItem,
    Paper,
    // Select,
    TextField,
} from "@material-ui/core";

import Title from "./Title";
import { validateAndFormatDate } from "../../utils/dateValidation";

const Filters = ({
    classes,
    setDateStartTicket,
    setDateEndTicket,
    dateStartTicket,
    dateEndTicket,
    setQueueTicket,
    queueTicket,
}) => {
    // const { user } = useContext(AuthContext);

    const [
        queues,
        // setQueues
    ] = React.useState(queueTicket);
    const [dateStart, setDateStart] = React.useState(
        validateAndFormatDate(dateStartTicket)
    );
    const [dateEnd, setDateEnd] = React.useState(
        validateAndFormatDate(dateEndTicket)
    );

    const handleDateStartChange = (e) => {
        const validatedDate = validateAndFormatDate(e.target.value);
        setDateStart(validatedDate);
    };

    const handleDateEndChange = (e) => {
        const validatedDate = validateAndFormatDate(e.target.value);
        setDateEnd(validatedDate);
    };

    return (
        <Grid item xs={12}>
            <Paper className={classes.customFixedHeightPaperLg} elevation={6}>
                <Title>Filtros</Title>
                <Grid container spacing={3}>
                    {/* <Grid item xs={12} sm={6} md={3}>
                        <FormControl fullWidth>
                            <InputLabel id="queue-label">
                                Departamentos
                            </InputLabel>
                            <Select
                                labelId="queue-label"
                                id="queue-select"
                                defaultValue={queueTicket}
                                label="Departamentos"
                                onChange={(e) => setQueues(e.target.value)}
                            >
                                <MenuItem value="">
                                    Todos os Departamentos
                                </MenuItem>
                                {user.queues.map((queue) => (
                                    <MenuItem key={queue.id} value={queue.id}>
                                        {queue.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid> */}

                    <Grid item xs={12} sm={6} md={5}>
                        <TextField
                            fullWidth
                            name="dateStart"
                            label="Data inicial"
                            placeholder="Selecione a data inicial"
                            InputLabelProps={{
                                shrink: true,
                            }}
                            type="date"
                            defaultValue={dateStart}
                            onChange={handleDateStartChange}
                            inputProps={{
                                'aria-label': 'Data inicial'
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={5}>
                        <TextField
                            fullWidth
                            name="dateEnd"
                            label="Até"
                            InputLabelProps={{
                                shrink: true,
                            }}
                            type="date"
                            defaultValue={dateEnd}
                            onChange={handleDateEndChange}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={2}>
                        <Button
                            fullWidth
                            variant="contained"
                            color="primary"
                            onClick={() => {
                                setQueueTicket(queues);
                                setDateStartTicket(dateStart);
                                setDateEndTicket(dateEnd);
                            }}
                        >
                            Filtrar
                        </Button>
                    </Grid>
                </Grid>
            </Paper>
        </Grid>
    );
};

export default Filters;

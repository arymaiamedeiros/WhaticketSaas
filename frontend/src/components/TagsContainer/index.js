import { Chip, Paper, TextField, Autocomplete } from "@mui/material";
import { styled } from "@mui/material/styles";
import React, { useEffect, useRef, useState } from "react";
import { isArray, isString } from "lodash";
import toastError from "../../errors/toastError";
import api from "../../services/api";

const StyledPaper = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(1.5),
}));

const StyledChip = styled(Chip)(({ theme, background }) => ({
    background: background || '#eee',
    color: "#FFF",
    marginRight: theme.spacing(0.125),
    fontWeight: 600,
    borderRadius: 3,
    fontSize: "0.8em",
    whiteSpace: "nowrap",
}));

const DropdownPaper = styled(Paper)(({ theme }) => ({
    width: 400,
    marginLeft: theme.spacing(1.5),
}));

export function TagsContainer({ ticket }) {
    const [tags, setTags] = useState([]);
    const [selecteds, setSelecteds] = useState([]);
    const isMounted = useRef(true);

    useEffect(() => {
        return () => {
            isMounted.current = false
        }
    }, [])

    useEffect(() => {
        if (isMounted.current) {
            loadTags().then(() => {
                if (Array.isArray(ticket.tags)) {
                    setSelecteds(ticket.tags);
                } else {
                    setSelecteds([]);
                }
            });
        }
    }, [ticket]);

    const createTag = async (data) => {
        try {
            const { data: responseData } = await api.post(`/tags`, data);
            return responseData;
        } catch (err) {
            toastError(err);
        }
    }

    const loadTags = async () => {
        try {
            const { data } = await api.get(`/tags/list`);
            setTags(data);
        } catch (err) {
            toastError(err);
        }
    }

    const syncTags = async (data) => {
        try {
            const { data: responseData } = await api.post(`/tags/sync`, data);
            return responseData;
        } catch (err) {
            toastError(err);
        }
    }

    const onChange = async (value, reason) => {
        let optionsChanged = []
        if (reason === 'create-option') {
            if (isArray(value)) {
                for (let item of value) {
                    if (isString(item)) {
                        const newTag = await createTag({ name: item })
                        optionsChanged.push(newTag);
                    } else {
                        optionsChanged.push(item);
                    }
                }
            }
            await loadTags();
        } else {
            optionsChanged = value;
        }
        setSelecteds(optionsChanged);
        await syncTags({ ticketId: ticket.id, tags: optionsChanged });
    }

    return (
        <StyledPaper>
            <Autocomplete
                multiple
                size="small"
                options={tags}
                value={selecteds}
                freeSolo
                onChange={(e, v, r) => onChange(v, r)}
                getOptionLabel={(option) => option.name}
                renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                        <StyledChip
                            variant="outlined"
                            background={option.color}
                            label={option.name.toUpperCase()}
                            {...getTagProps({ index })}
                            size="small"
                        />
                    ))
                }
                renderInput={(params) => (
                    <TextField {...params} variant="outlined" placeholder="Tags" />
                )}
                PaperComponent={({ children }) => (
                    <DropdownPaper>
                        {children}
                    </DropdownPaper>
                )}
            />
        </StyledPaper>
    )
}

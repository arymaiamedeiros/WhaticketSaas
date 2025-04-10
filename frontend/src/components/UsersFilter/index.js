import { Box, Chip, TextField, Autocomplete } from "@mui/material";
import { styled } from '@mui/material/styles';
import React, { useEffect, useState } from "react";
import toastError from "../../errors/toastError";
import api from "../../services/api";

const FilterContainer = styled(Box)({
    padding: "0px 10px 10px"
});

const StyledChip = styled(Chip)({
    backgroundColor: "#bfbfbf",
    textShadow: "1px 1px 1px #000",
    color: "white",
});

export function UsersFilter({ onFiltered, initialUsers }) {
    const [users, setUsers] = useState([]);
    const [selecteds, setSelecteds] = useState([]);

    useEffect(() => {
        async function fetchData() {
            await loadUsers();
        }
        fetchData();
    }, []);

    useEffect(() => {
        setSelecteds([]);
        if (
            Array.isArray(initialUsers) &&
            Array.isArray(users) &&
            users.length > 0
        ) {
            onChange(initialUsers);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialUsers, users]);

    const loadUsers = async () => {
        try {
            const { data } = await api.get(`/users/list`);
            const userList = data.map((u) => ({ id: u.id, name: u.name }));
            setUsers(userList);
        } catch (err) {
            toastError(err);
        }
    };

    const onChange = async (value) => {
        setSelecteds(value);
        onFiltered(value);
    };

    return (
        <FilterContainer>
            <Autocomplete
                multiple
                size="small"
                options={users}
                value={selecteds}
                onChange={(e, v, r) => onChange(v)}
                getOptionLabel={(option) => option.name}
                isOptionEqualToValue={(option, value) => {
                    return (
                        option?.id === value?.id ||
                        option?.name.toLowerCase() === value?.name.toLowerCase()
                    );
                }}
                renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                        <StyledChip
                            variant="outlined"
                            label={option.name}
                            {...getTagProps({ index })}
                            size="small"
                        />
                    ))
                }
                renderInput={(params) => (
                    <TextField
                        {...params}
                        variant="outlined"
                        placeholder="Filtro por Users"
                    />
                )}
            />
        </FilterContainer>
    );
}

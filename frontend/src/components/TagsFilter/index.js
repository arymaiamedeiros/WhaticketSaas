import { Box, Chip, TextField, Autocomplete } from "@mui/material";
import { styled } from "@mui/material/styles";
import React, { useEffect, useState } from "react";
import toastError from "../../errors/toastError";
import api from "../../services/api";

const FilterContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1),
}));

const StyledChip = styled(Chip)(({ theme, color }) => ({
  backgroundColor: color || theme.palette.grey[200],
  textShadow: "1px 1px 1px #000",
  color: "white",
}));

export function TagsFilter({ onFiltered }) {
  const [tags, setTags] = useState([]);
  const [selecteds, setSelecteds] = useState([]);

  useEffect(() => {
    async function fetchData() {
      await loadTags();
    }
    fetchData();
  }, []);

  const loadTags = async () => {
    try {
      const { data } = await api.get(`/tags/list`);
      setTags(data);
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
        options={tags}
        value={selecteds}
        onChange={(e, v, r) => onChange(v)}
        getOptionLabel={(option) => option.name}
        renderTags={(value, getTagProps) =>
          value.map((option, index) => (
            <StyledChip
              variant="outlined"
              color={option.color}
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
            placeholder="Filtro por Tags"
          />
        )}
      />
    </FilterContainer>
  );
}

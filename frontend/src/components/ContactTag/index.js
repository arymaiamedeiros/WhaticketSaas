import { styled } from "@mui/material/styles";
import React from "react";

const Tag = styled("div")(({ theme }) => ({
    padding: "1px 5px",
    borderRadius: "3px",
    fontSize: "0.8em",
    fontWeight: "bold",
    color: "#FFF",
    marginRight: "5px",
    whiteSpace: "nowrap",
    marginTop: "2px"
}));

const ContactTag = ({ tag }) => {
    return (
        <Tag sx={{ backgroundColor: tag.color }}>
            {tag.name.toUpperCase()}
        </Tag>
    );
};

export default ContactTag;

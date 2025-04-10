import React from 'react';
import PropTypes from 'prop-types';
import { styled } from '@mui/material/styles';
import { 
    IconButton,
    ListItem,
    ListItemText,
    ListItemAvatar,
    ListItemSecondaryAction,
    Avatar,
    Typography
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import moment from 'moment';

const StyledTypography = styled(Typography)({
    width: '100%'
});

export default function ContactNotesDialogListItem(props) {
    const { note, deleteItem } = props;

    const handleDelete = (item) => {
        deleteItem(item);
    }

    return (
        <ListItem alignItems="flex-start">
            <ListItemAvatar>
                <Avatar alt={note.user.name} src="/static/images/avatar/1.jpg" />
            </ListItemAvatar>
            <ListItemText
                primary={
                    <StyledTypography
                        component="span"
                        variant="body2"
                        color="textPrimary"
                    >
                        {note.note}
                    </StyledTypography>
                }
                secondary={
                    <>
                        {note.user.name}, {moment(note.createdAt).format('DD/MM/YY HH:mm')}
                    </>
                }
            />
            <ListItemSecondaryAction>
                <IconButton onClick={() => handleDelete(note)} edge="end" aria-label="delete">
                    <DeleteIcon />
                </IconButton>
            </ListItemSecondaryAction>
        </ListItem>
    )   
}

ContactNotesDialogListItem.propTypes = {
    note: PropTypes.object.isRequired,
    deleteItem: PropTypes.func.isRequired
}

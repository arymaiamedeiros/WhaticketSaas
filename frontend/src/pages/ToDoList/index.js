import React, { useState, useEffect } from 'react';
import { styled } from '@mui/material/styles';
import {
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
} from '@mui/icons-material';

const Root = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  margin: '2rem'
});

const InputContainer = styled('div')({
  display: 'flex',
  width: '100%',
  marginBottom: '1rem'
});

const StyledTextField = styled(TextField)({
  flexGrow: 1,
  marginRight: '1rem'
});

const ListContainer = styled('div')({
  width: '100%',
  height: '100%',
  marginTop: '1rem',
  backgroundColor: '#f5f5f5',
  borderRadius: '5px',
});

const StyledListItem = styled(ListItem)({
  marginBottom: '5px'
});

const ToDoList = () => {
  const [task, setTask] = useState('');
  const [tasks, setTasks] = useState([]);
  const [editIndex, setEditIndex] = useState(-1);

  useEffect(() => {
    const savedTasks = localStorage.getItem('tasks');
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  const handleTaskChange = (event) => {
    setTask(event.target.value);
  };

  const handleAddTask = () => {
    if (!task.trim()) {
      // Impede que o usuário crie uma tarefa sem texto
      return;
    }

    const now = new Date();
    if (editIndex >= 0) {
      // Editar tarefa existente
      const newTasks = [...tasks];
      newTasks[editIndex] = {text: task, updatedAt: now, createdAt: newTasks[editIndex].createdAt};
      setTasks(newTasks);
      setTask('');
      setEditIndex(-1);
    } else {
      // Adicionar nova tarefa
      setTasks([...tasks, {text: task, createdAt: now, updatedAt: now}]);
      setTask('');
    }
  };

  const handleEditTask = (index) => {
    setTask(tasks[index].text);
    setEditIndex(index);
  };

  const handleDeleteTask = (index) => {
    const newTasks = [...tasks];
    newTasks.splice(index, 1);
    setTasks(newTasks);
  };

  return (
    <Root>
      <InputContainer>
        <StyledTextField
          label="Nova tarefa"
          value={task}
          onChange={handleTaskChange}
          variant="outlined"
        />
        <Button variant="contained" color="primary" onClick={handleAddTask}>
          {editIndex >= 0 ? 'Salvar' : 'Adicionar'}
        </Button>
      </InputContainer>
      <ListContainer>
        <List>
          {tasks.map((task, index) => (
            <StyledListItem key={index}>
              <ListItemText 
                primary={task.text} 
                secondary={new Date(task.updatedAt).toLocaleString()} 
              />
              <ListItemSecondaryAction>
                <IconButton onClick={() => handleEditTask(index)}>
                  <EditIcon />
                </IconButton>
                <IconButton onClick={() => handleDeleteTask(index)}>
                  <DeleteIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </StyledListItem>
          ))}
        </List>
      </ListContainer>
    </Root>
  );
};

export default ToDoList;

import React, { useState, useEffect } from 'react';
import { Button, TextField, Typography, Container, Grid, Card, CardContent, CardActions, Snackbar, Modal, Backdrop, Fade, FormControl, FormLabel, RadioGroup, FormControlLabel, Radio, Checkbox, IconButton } from '@mui/material';
import { Alert } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import axios from 'axios';
import { useAuth } from '../hooks/AuthContext';
import CircleIcon from '@mui/icons-material/Circle';

const NoteManagerPage = () => {
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('low');
  const [completed, setCompleted] = useState(false);
  const [errorAlert, setErrorAlert] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotes();
    }
  }, [isAuthenticated]);

  const fetchNotes = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/tasks');
      setNotes(response.data.data);
    } catch (error) {
      console.error('Error al obtener las notas:', error);
      setErrorAlert(true);
    }
  };

  const handleCreateNote = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/tasks', { title, description, priority, completed });
      console.log('Tarea creada:', response.data);
      fetchNotes();
      setTitle('');
      setDescription('');
      setPriority('low');
      setCompleted(false);
    } catch (error) {
      console.error('Error al crear la tarea:', error);
      setErrorAlert(true);
    }
  };

  const handleDeleteNote = async (noteId) => {
    try {
      await axios.delete(`http://localhost:5000/api/tasks/${noteId}`);
      fetchNotes();
    } catch (error) {
      console.error('Error al eliminar la tarea:', error);
      setErrorAlert(true);
    }
  };

  const handleOpenModal = (note) => {
    setSelectedNote(note);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setSelectedNote(null);
    setOpenModal(false);
  };

  const handleEditNote = async () => {
    try {
      const response = await axios.put(`http://localhost:5000/api/tasks/${selectedNote._id}`, {
        title: selectedNote.title,
        description: selectedNote.description,
        priority: selectedNote.priority,
        completed: selectedNote.completed
      });
      console.log('Tarea actualizada:', response.data);
      fetchNotes();
      handleCloseModal();
    } catch (error) {
      console.error('Error al actualizar la tarea:', error);
      setErrorAlert(true);
      handleCloseModal();
    }
  };
  

  const handleCompletedChange = async (noteId) => {
    try {
      const noteToUpdate = notes.find(note => note._id === noteId);
      const response = await axios.put(`http://localhost:5000/api/tasks/${noteId}`, { ...noteToUpdate, completed: !noteToUpdate.completed });
      console.log('Tarea actualizada:', response.data);
      fetchNotes();
    } catch (error) {
      console.error('Error al actualizar la tarea:', error);
      setErrorAlert(true);
    }
  };

  const handlePriorityChange = (e) => {
    setPriority(e.target.value);
  };

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return (
    <Container>
      <Typography variant="h4" align="center" gutterBottom>
        Administrador de Tareas
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Typography variant="h5" gutterBottom>
            Crear Nueva Tarea
          </Typography>
          <TextField
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            type="text"
            label="Título"
            variant="outlined"
            fullWidth
            margin="normal"
            required
          />
          <TextField
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            multiline
            rows={4}
            type="text"
            label="Descripción"
            variant="outlined"
            fullWidth
            margin="normal"
            required
          />
          <FormControl component="fieldset" margin="normal">
            <FormLabel component="legend">Prioridad</FormLabel>
            <RadioGroup row aria-label="priority" name="priority" value={priority} onChange={handlePriorityChange}>
              <FormControlLabel value="low" control={<Radio />} label="Baja" />
              <FormControlLabel value="medium" control={<Radio />} label="Media" />
              <FormControlLabel value="high" control={<Radio />} label="Alta" />
            </RadioGroup>
          </FormControl>
          <Button onClick={handleCreateNote} variant="contained" color="primary" fullWidth>
            Crear Tarea
          </Button>
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="h5" gutterBottom>
            Lista de Tareas
          </Typography>
          {notes.map((note) => (
            <Card key={note._id} variant="outlined" style={{ marginBottom: '1rem' }}>
              <CardContent style={{ textDecoration: note.completed ? 'line-through' : 'none' }}>
                <Grid container alignItems="center" spacing={1}>
                  <Grid item>
                    {note.priority === 'low' && <CircleIcon style={{ color: 'green' }} />}
                    {note.priority === 'medium' && <CircleIcon style={{ color: 'orange' }} />}
                    {note.priority === 'high' && <CircleIcon style={{ color: 'red' }} />}
                  </Grid>
                  <Grid item>
                    <Typography variant="h6" gutterBottom>
                      {note.title}
                    </Typography>
                    <Typography variant="body1">{note.description}</Typography>
                  </Grid>
                </Grid>
              </CardContent>
              <CardActions>
                <Checkbox
                  checked={note.completed}
                  onChange={() => handleCompletedChange(note._id)}
                  color="primary"
                  icon={<CheckCircleOutlineIcon />}
                  checkedIcon={<CheckCircleOutlineIcon style={{ color: 'green' }} />}
                />
                <IconButton onClick={() => handleDeleteNote(note._id)} color="error">
                  <DeleteIcon />
                </IconButton>
                <IconButton onClick={() => handleOpenModal(note)} color="primary">
                  <EditIcon />
                </IconButton>
              </CardActions>
            </Card>
          ))}
        </Grid>
      </Grid>
      <Snackbar open={errorAlert} autoHideDuration={6000} onClose={() => setErrorAlert(false)}>
        <Alert onClose={() => setErrorAlert(false)} severity="error">
          Hubo un error. Por favor, inténtelo de nuevo más tarde.
        </Alert>
      </Snackbar>
      <Modal
        open={openModal}
        onClose={handleCloseModal}
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{ timeout: 500 }}
      >
        <Fade in={openModal}>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80%', backgroundColor: '#fff' }}>
            <Container>
              <Typography variant="h5" gutterBottom>
                Editar Tarea
              </Typography>
              <TextField
                value={selectedNote ? selectedNote.title : ''}
                onChange={(e) => setSelectedNote({ ...selectedNote, title: e.target.value })}
                type="text"
                label="Título"
                variant="outlined"
                fullWidth
                margin="normal"
                required
              />
              <TextField
                value={selectedNote ? selectedNote.description : ''}
                onChange={(e) => setSelectedNote({ ...selectedNote, description: e.target.value })}
                multiline
                rows={4}
                type="text"
                label="Descripción"
                variant="outlined"
                fullWidth
                margin="normal"
                required
              />
              <FormControl component="fieldset" margin="normal">
                <FormLabel component="legend">Prioridad</FormLabel>
                <RadioGroup row aria-label="priority" name="priority" value={selectedNote ? selectedNote.priority : 'low'} onChange={(e) => setSelectedNote({ ...selectedNote, priority: e.target.value })}>
                  <FormControlLabel value="low" control={<Radio />} label="Baja" />
                  <FormControlLabel value="medium" control={<Radio />} label="Media" />
                  <FormControlLabel value="high" control={<Radio />} label="Alta" />
                </RadioGroup>
              </FormControl>
              <Checkbox
                checked={selectedNote ? selectedNote.completed : false}
                onChange={(e) => setSelectedNote({ ...selectedNote, completed: e.target.checked })}
                color="primary"
                icon={<CheckCircleOutlineIcon />}
                checkedIcon={<CheckCircleOutlineIcon style={{ color: 'green' }} />}
              />
              <Button onClick={handleEditNote} variant="contained" color="primary" fullWidth>
                Guardar Cambios
              </Button>
            </Container>
          </div>
        </Fade>
      </Modal>
    </Container>
  );
};

export default NoteManagerPage;

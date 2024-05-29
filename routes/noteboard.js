const express = require('express');

const router = express.Router();
const notesController = require('../controllers/noteboard');
const isAuth = require('../middleware/is-auth');


router.get('/', notesController.getIndex);
router.get('/note-editor',isAuth, notesController.noteEditor);
router.get('/note-editor/:noteId',isAuth, notesController.noteEditor);
router.post('/note-editor',isAuth, notesController.postNoteEditor);
router.get('/dashboard',isAuth, notesController.getDashboard);
router.get('/note/:noteId', isAuth, notesController.getNote);
router.post('/delete-note', isAuth, notesController.deleteNote);
router.get('/user-profile',isAuth, notesController.getUserProfile);
router.post('/search',isAuth, notesController.postSearchedNote);

module.exports = router;
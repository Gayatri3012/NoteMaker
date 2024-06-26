const Note = require('../models/note');

const parser = require('../public/js/parseEditorContent');

const ITEMS_PER_PAGE = 8;


//helper function
function formatDate(date) {
    const months = [
      "January", "February", "March",
      "April", "May", "June", "July",
      "August", "September", "October",
      "November", "December"
    ];
  
    const month = months[date.getMonth()];
    const day = date.getDate();
    const year = date.getFullYear();
  
    return `${month} ${day}, ${year}`;
  }

exports.getIndex = (req, res, next) => {
    res.render('index', {
        pageTitle: 'NoteBoard'
    });
}

exports.noteEditor = (req, res, next) => {
    if(!req.params.noteId){
        res.render('note-editor', {
            pageTitle: 'Make a Note',
            isEditing: false,
            note : {}
        });
    } else {
        Note.findById(req.params.noteId)
        .then(note => {
            res.render('note-editor',{
                pageTitle: 'Edit Note',
                isEditing: true,
                note: note
            })
        })
        .catch(err => {
            console.log(err)
        })
      
    }
  
}

exports.postNoteEditor = (req, res, next) => {
    console.log(req.body);
    const editorData = req.body.editorData;
    const editedTitle = req.body.editedNoteTitle;
    console.log(editorData); 
    if(req.body.editedNote === 'true'){
        Note.findById(req.body.noteId)
        .then(note => {
            note.content = editorData; 
            note.title = editedTitle;
            note.save()
            .then(result => {
                console.log('note edited successfully!');
                return res.redirect('dashboard')
            })
        })
        .catch(err => {
            console.log(err);
        })

    } else {
        const note = new Note({
            title: req.body.title,
            content: editorData,
            userId: req.user._id
            })
        note
            .save()
            .then(result => {
                const user = req.user;
                user.notes.push({note: note._id})
                user.save()
                console.log('note saved successfully!');
                return res.redirect('dashboard')
            })
            .catch(err => {
                console.log(err);
            })

    }
   

}

exports.getDashboard = (req, res, next) => {
    const page = +req.query.page || 1;   // + is not error or a typo
    let totalItems;
    Note.find({userId: req.user._id})
        .countDocuments()
        .then(numNotes => {
            totalItems = numNotes;
            return Note.find({userId: req.user._id})
                .skip((page - 1) * ITEMS_PER_PAGE)
                .limit(ITEMS_PER_PAGE)
        })
        .then(notes => {
            notes.forEach(note => {
                note.formattedDate = formatDate(note.createdAt);
            })
            res.render('dashboard', {
                pageTitle: 'My Notes',
                notes: notes,
                currentPage: page,
                hasNextPage: ITEMS_PER_PAGE * page < totalItems,
                hasPreviousPage: page > 1,
                nextPage: page + 1,
                previousPage: page - 1,
                lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE)
            });
        })
    .catch(err => {
        console.log(err)
    })
 
}

exports.getNote = (req, res, next) => {
    const noteId = req.params.noteId;
     
    Note.findOne({_id: noteId})
    .then(note => { 
        const cleanData = JSON.parse(note.content);
        const html = parser(cleanData);
        res.render('note',{
            pageTitle: note.title,
            title: note.title,
            id: note._id,
            html: html
        })
    })
    .catch(err => {
        console.log(err)
    })
}

exports.deleteNote = (req, res, next) => {
    const noteId = req.body.noteId;

    //removing the note from user
    req.user.removeNote(noteId)

    Note.deleteOne({_id: noteId})
    .then(result => {
        console.log('Note deleted successfully.');
        res.redirect('dashboard')
    })
    .catch(err => {
        console.log(err);
    })
}

exports.getUserProfile = (req, res, next) => {
    const user = req.session.user;
    console.log(user)
    res.render('user-profile',{
        pageTitle : 'User Profile',
        user: user,
        notes: user.notes.length
    })
}

exports.postSearchedNote = (req, res, next) => {
    const searchTerm = req.body.searchTerm;
    const userId = req.user._id; 
    Note.find({
      userId: userId,
      $or: [
        { title: { $regex: searchTerm, $options: 'i' } },
        { content: { $regex: searchTerm, $options: 'i' } }
      ]
    })
    .then(notes => {
        notes.forEach(note => {
            note.formattedDate = formatDate(note.createdAt);
        })
        res.render('searchResult', { notes: notes, searchTerm: searchTerm, pageTitle: 'Search result'});
    })
    .catch(err => {
        console.error(err);
    })

}

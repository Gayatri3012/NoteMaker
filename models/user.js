const { default: mongoose } = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    notes:[{
        note: {
            type: Schema.Types.ObjectId,
            ref: 'Note'
        }
    }]
},{timestamps: true});

userSchema.methods.removeNote = function (noteId) {
    const updatedNotes = this.notes.filter(note => {
        return note.note.toString() !== noteId.toString();
    });
    this.notes = updatedNotes;
    return this.save();
}


module.exports = mongoose.model('User', userSchema);
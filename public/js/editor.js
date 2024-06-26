let editor;

const initializeEditor = (data) => {
    editor = new EditorJS({
        onReady: () => {
            console.log('Editor js is ready');
        },
        holder: 'editorjs',
        placeholder: 'Write your note here...',
        autofocus: false,
        tools: {
            header: {
                class: Header,
                inlineToolbar: true
            },
            paragraph: {
                class: Paragraph,
                inlineToolbar: true,
            },
            list: {
                class: List,
                inlineToolbar: true
            },
            checklist: {
                class: Checklist,
                inlineToolbar: true,
            },
        },
        data: data || null  
    });
};


if (window.isEditing === 'true') {   

    const oldInputData = window.oldInputData;
    console.log(oldInputData)
    try {
        const trimmedJsonString = oldInputData.slice(1, -1);
        console.log(trimmedJsonString)
        const jsonData = JSON.parse(trimmedJsonString);         
        console.log('Parsed JSON:', jsonData);
        initializeEditor(jsonData);
    } catch (error) {
        console.error('Error parsing JSON:', error);
    }
} else {
   
    initializeEditor();
}


const saveButton = document.querySelector('#saveButton');
const editorDataInput = document.querySelector('#editorData');
const editedNoteTitle = document.querySelector('#editedNoteTitle');


saveButton.addEventListener('click', () => {
    editor
        .save()
        .then((outputData) => {
            editedNoteTitle.value = document.querySelector('#title').value;
            const jsonData = JSON.stringify(outputData);
            editorDataInput.value = jsonData;
        }).catch((error) => {
            console.log('Saving failed: ', error)
        });
})

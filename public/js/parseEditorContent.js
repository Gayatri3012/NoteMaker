
function parser(editorData) {
    let htmlContent = '';
    for(const block of editorData.blocks){
        switch(block.type) {
            case 'header':{
                htmlContent += `<h${block.data.level}>${block.data.text}</h${block.data.level}>`;
                break;
            }
              
            case 'paragraph':{ 
                htmlContent += `<p>${block.data.text}</p>`
                break;
            }
            
            case 'list': {
                htmlContent += `<${block.data.style === 'ordered' ? 'ol' : 'ul'}>`;
                for(const item of block.data.items) {
                    htmlContent += `<li>${item}</li>`
                }
                htmlContent += `</${block.data.style === 'ordered' ? 'ol' : 'ul'}>`;
                break;
            }

            case 'checklist' : {
                htmlContent += `<ul id="checklist">`;
                for (const item of block.data.items) {
                    htmlContent += `<li> ${item.checked ? '✅' : '⬜'} ${item.text}</li>`;
                }
                htmlContent += `</ul>`;
                break;
            }

            default: 
                break;
        }
    }
    return htmlContent;
}

module.exports = parser;
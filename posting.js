let API_URL = "";

async function loadConfig(){

    const response =
    await fetch("./config.json");

    const config =
    await response.json();

    API_URL =
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${config.GEMINII_API_KEY}`;

}

loadConfig();

const form = document.querySelector('form');
const textarea = document.getElementById('noteInput');
const container = document.querySelector('.notes-container');

let notes = JSON.parse(localStorage.getItem('notes')) || [];

//test about mood detect 
async function detectMood(text) {
try{
    const response = await fetch(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=url',
        {
        method: 'POST',

            headers: {
                'Content-Type': 'application/json'
            },

            body: JSON.stringify({
                contents: [
                    {
                        parts: [
                            {
                                text: `
                                Detect the mood of this message.

                                Return JSON only.

                                Example:
                                {
                                  "mood": "😊 Happy",
                                  "color": "#FFE082"
                                }

                                Mood options:
                                😊 Happy
                                😢 Sad
                                😡 Angry
                                😐 Neutral

                                Message:
                                "${text}"
                                `
                            }
                        ]
                    }
                ]
            })
        }
    );
        const data = await response.json();

    const result =
        data.candidates[0].content.parts[0].text;

    return JSON.parse(result);

} catch (error) {

        console.log(error);

        return {
            mood: '😐 Neutral',
            color: '#333'
        };

    }
    

}

//end of mood detect

// render notes
function renderNotes() {
  container.innerHTML = '';

  notes.forEach((note, index) => {
    const card = document.createElement('div');
    card.className = 'note-card';

    card.innerHTML = `
    <button data-index="${index}" class="delete-btn">📌</button>
    <p class="mood">${note.mood || '😐 Neutral'}</p>
    <p>${(note.text || note).replace(/\n/g, '<br>')}</p>
    `;

    container.appendChild(card);
  });
}

// add note
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const value = textarea.value.trim();
  if (!value) return;

  // notes.unshift(value);

const detected = await detectMood(value);

notes.unshift({
    text: value,
    mood: detected.mood,
    color: detected.color
});

  localStorage.setItem('notes', JSON.stringify(notes));

  textarea.value = '';
  textarea.style.height = 'auto';
  renderNotes();
});

// delete note
container.addEventListener('click', (e) => {
  if (e.target.classList.contains('delete-btn')) {
    const index = e.target.dataset.index;

    notes.splice(index, 1);

    localStorage.setItem('notes', JSON.stringify(notes));
    renderNotes();
  }
});


textarea.addEventListener('input', () => {
  textarea.style.height = 'auto';
  textarea.style.height = textarea.scrollHeight + 'px';
});

// initial load
renderNotes();


// masonary
function updateMasonry() {

    const container =
        document.querySelector('.notes-container');

    if(window.innerWidth < 600){

        container.style.columnCount = 1;

    }
    else if(window.innerWidth < 900){

        container.style.columnCount = 2;

    }
    else{

        container.style.columnCount = 4;

    }

}

window.addEventListener('resize', updateMasonry);
updateMasonry();



//hide section

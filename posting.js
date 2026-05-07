const form = document.querySelector('form');
const textarea = document.getElementById('noteInput');
const container = document.querySelector('.notes-container');

let notes = JSON.parse(localStorage.getItem('notes')) || [];

// render notes
function renderNotes() {
  container.innerHTML = '';

  notes.forEach((note, index) => {
    const card = document.createElement('div');
    card.className = 'note-card';

    card.innerHTML = `
    <button data-index="${index}" class="delete-btn">×</button>
    <p>${note.replace(/\n/g, '<br>')}</p>
    `;

    container.appendChild(card);
  });
}

// add note
form.addEventListener('submit', (e) => {
  e.preventDefault();

  const value = textarea.value.trim();
  if (!value) return;

  notes.unshift(value);

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
    const container = document.querySelector('.notes-container');

    if(window.innerWidth < 600){
        container.style.columnCount = "1";
    }
    else if(window.innerWidth < 900){
        container.style.columnCount = "2";
    }
    else if(window.innerWidth < 1200){
        container.style.columnCount = "3";
    }
    else{
        container.style.columnCount = "4";
    }
}

window.addEventListener('resize', updateMasonry);
updateMasonry();
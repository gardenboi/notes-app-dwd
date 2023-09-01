//https://developer.mozilla.org/en-US/docs/Web/API/Crypto/getRandomValues
function getRandomNumbers() {
  const typedArray = new Uint8Array(10);
  const randomValues = window.crypto.getRandomValues(typedArray);
  return randomValues.join("");
}

class Note {
  constructor(
    id = null,
    title = "Unknown",
    content = "Nothing",
    dateOfCreation = null,
    dateOfModification = null,
  ) {
    this.id = id;
    this.title = title;
    this.content = content;
    this.dateOfCreation = dateOfCreation;
    this.dateOfModification = dateOfModification
  }

  initialise(){
    this.id = getRandomNumbers()
    this.dateOfCreation = new Date();
    this.dateOfModification = new Date();
  }
}

class NotesLibrary {
  constructor() {
    this.notes = [];
  }

  addNote(newNote) {
    this.notes.push(newNote);
  }

  removeNote(id) {
    this.notes = this.notes.filter((note) => note.id !== id);
  }

  getNote(id) {
    return this.notes.find((note) => note.id == String(id));
  }

  updateNoteContent(id, title, content) {
    const noteToUpdate = this.getNote(id);

    if (noteToUpdate) {
      noteToUpdate.title = title
      noteToUpdate.content = content;
      noteToUpdate.dateOfModification = new Date();
    } else {
      console.log("Note not found.");
    }
  }
}

let currentNoteId = 0;
let currentNoteIdMultiselection = [];

const notesLibrary = new NotesLibrary()

const addNoteBtn = document.getElementById("addNoteBtn");
const overlay = document.getElementById("overlay");
const showNoteModal = document.getElementById("noteModal");
const noteModalTitle = document.getElementById("title");
const noteModalContent = document.getElementById("content");
const notesGrid = document.getElementById('notesGrid')
const dropdown = document.getElementById('dropdown')


const multiSelectionMode = {
  value: false,
  set(newValue) {
    this.value = newValue;
    const event = new CustomEvent('multiselectionStateChange', { detail: newValue });
    document.dispatchEvent(event);
  },
  get() {
    return this.value;
  }
};

function clearNoteModalFields() {
  noteModalTitle.value = '';
  noteModalContent.value = '';
}

function loadNoteModalValues(id) {
  const currNote = notesLibrary.getNote(id);
  noteModalTitle.value = currNote.title;
  noteModalContent.value = currNote.content;
}

const openNoteModalForm = (id) => {
  clearNoteModalFields()
  loadNoteModalValues(id)
  showNoteModal.classList.add("active");
  overlay.classList.add("active");
};

const closeAllModals = () => {
  //  showNoteModal();
  //  closeAccountModal();
  showNoteModal.classList.remove("active");
  overlay.classList.remove("active");
};

overlay.onclick = closeAllModals;


const addNote = () => {
  const currentNote = new Note()
  currentNote.initialise()

  currentNoteId = currentNote.id
  notesLibrary.addNote(currentNote)

  openNoteModalForm(currentNoteId);
  saveToLocalStorage(currentNoteId)
};
addNoteBtn.onclick = addNote;



//Local Storage

//Official Func form: https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API
function storageAvailable(type) {
  let storage;
  try {
    storage = window[type];
    const x = "__storage_test__";
    storage.setItem(x, x);
    storage.removeItem(x);
    return true;
  } catch (e) {
    return (
      e instanceof DOMException &&
      // everything except Firefox
      (e.code === 22 ||
        // Firefox
        e.code === 1014 ||
        // test name field too, because code might not be present
        // everything except Firefox
        e.name === "QuotaExceededError" ||
        // Firefox
        e.name === "NS_ERROR_DOM_QUOTA_REACHED") &&
      // acknowledge QuotaExceededError only if there's something already stored
      storage &&
      storage.length !== 0
    );
  }
}

if (storageAvailable("localStorage")) {
  // Yippee! We can use localStorage awesomeness
  console.log("yay");
} else {
  // Too bad, no localStorage for us
  console.log("err");
}


// Local Storage
const titleInput = document.getElementById("title");
const contentInput = document.getElementById("content");

const saveLocal = () => {
  localStorage.setItem('library', JSON.stringify(notesLibrary.notes))
}


// Debouncing function to delay function execution
function debounce(func, delay) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func.apply(null, args);
    }, delay);
  };
}

function saveToLocalStorage(id) {
  const title = titleInput.value;
  const content = contentInput.value;

  notesLibrary.updateNoteContent(id, title, content)

  saveLocal();
  renderNotesLibrary();
}

// Debounced version of the saveToLocalStorage function
const debouncedSaveToLocalStorage = debounce((id) => saveToLocalStorage(id), 500);

// Add event listeners to input fields
titleInput.addEventListener("input", () => debouncedSaveToLocalStorage(currentNoteId));
contentInput.addEventListener("input", () => debouncedSaveToLocalStorage(currentNoteId));

const JSONToNote = (note) => {
  return new Note(note.id, note.title, note.content, note.dateOfCreation, note.dateOfModification)
}

function removeSelectedClassNoteCard() {
  currentNoteId = null
  const childElements = notesGrid.querySelectorAll('.note-card');
  childElements.forEach(child => {
    child.classList.remove('selected');
  });
}


document.addEventListener('multiselectionStateChange', (event) => {
  if (event.detail === true) {
    dropdown.classList.add('selected');
  }else{
    dropdown.classList.remove('selected');
  }
});


const createNoteCard = (note) => {
  const noteCard = document.createElement('div');
  const title = document.createElement('p');
  const content = document.createElement('p');

  noteCard.classList.add('note-card');
  noteCard.setAttribute('data-card-id', note.id);

  title.classList.add('card-title');
  content.classList.add('card-content');

  title.textContent = `${note.title}`
  content.textContent = `${note.content}`

  let isMousePressed = false;
  let mousePressTimer;

  noteCard.addEventListener('mousedown', () => {
    mousePressTimer = setTimeout(() => {
      multiSelectionMode.set(true);
    }, 1000);
    isMousePressed = true
  });
  noteCard.addEventListener('mouseup', () => {
    if (isMousePressed) {
      // Clear the timer
      clearTimeout(mousePressTimer);

      // If in single-selection mode, select the clicked card
      if (multiSelectionMode.get() === false) {
        removeSelectedClassNoteCard();
        noteCard.classList.add('selected');
        currentNoteId = noteCard.getAttribute('data-card-id');
        openNoteModalForm(currentNoteId);
      }

      // If in multi-selection mode, toggle the card's selection state
      if (multiSelectionMode.get() === true) {
        noteCard.classList.toggle('selected');
        const clickNoteId = noteCard.getAttribute('data-card-id');
        if (noteCard.classList.contains('selected')) {
          currentNoteIdMultiselection.push(clickNoteId);
        } else {
          //Select indexOf clickedNoteId and delete from array by index 
          const index = currentNoteIdMultiselection.indexOf(clickNoteId);
          if (index !== -1) {
            currentNoteIdMultiselection.splice(index, 1);
          }
        }
      }
      isMousePressed = false;
    }
  });

  noteCard.appendChild(title);
  noteCard.appendChild(content);

  notesGrid.appendChild(noteCard)
}

const resetNotesGrid = () => {
  notesGrid.innerHTML = ''
}

function renderNotesLibrary() {
  resetNotesGrid();
  notesLibrary.notes.forEach(note => {
    createNoteCard(note)
  });
}



// Load data from local storage on page load
window.addEventListener("load", () => {
  const savedNotesLibrary = JSON.parse(localStorage.getItem("library"));
  if (savedNotesLibrary) {
    notesLibrary.notes = savedNotesLibrary.map((note) => JSONToNote(note))
    renderNotesLibrary();
    console.log(notesLibrary)
  }else{
    notesLibrary.notes = [];
  }
});


// Deselect all 
document.addEventListener("click", function(event) {
  var clickedElement = event.target;
  // Check if the clicked element or any of its ancestors have the "card" class
  var isClickedOnCard = clickedElement.closest(".note-card");
  var isClickedOnModalInput = clickedElement.closest(".note-form")

  console.log(isClickedOnCard)
  // If not clicked on a card or its descendant
  if (!isClickedOnCard && !isClickedOnModalInput) {
    multiSelectionMode.set(false);
    removeSelectedClassNoteCard();
  }
});
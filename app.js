//    _    _ _    _ _____ _____
//   | |  | | |  | |_   _|  __ \
//   | |  | | |  | | | | | |  | |
//   | |  | | |  | | | | | |  | |
//   | |__| | |__| |_| |_| |__| |
//    \____/ \____/|_____|_____/
//
//

//https://developer.mozilla.org/en-US/docs/Web/API/Crypto/getRandomValues
function getRandomNumbers() {
  const typedArray = new Uint8Array(10);
  const randomValues = window.crypto.getRandomValues(typedArray);
  return randomValues.join("");
}

//     _____ _                _____ _____ ______  _____
//    / ____| |        /\    / ____/ ____|  ____|/ ____|
//   | |    | |       /  \  | (___| (___ | |__  | (___
//   | |    | |      / /\ \  \___ \\___ \|  __|  \___ \
//   | |____| |____ / ____ \ ____) |___) | |____ ____) |
//    \_____|______/_/    \_\_____/_____/|______|_____/
//
//

class Note {
  constructor(
    id = null,
    title = "Unknown",
    content = "Nothing",
    dateOfCreation = null,
    dateOfModification = null
  ) {
    this.id = id;
    this.title = title;
    this.content = content;
    this.dateOfCreation = dateOfCreation;
    this.dateOfModification = dateOfModification;
  }

  initialise() {
    this.id = getRandomNumbers();
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
      noteToUpdate.title = title;
      noteToUpdate.content = content;
      noteToUpdate.dateOfModification = new Date();
    } else {
      console.log("Note not found.");
    }
  }
}

//    _____ _   _ _____ _______   ______ _      ______ __  __ ______ _   _ _______ _____
//   |_   _| \ | |_   _|__   __| |  ____| |    |  ____|  \/  |  ____| \ | |__   __/ ____|
//     | | |  \| | | |    | |    | |__  | |    | |__  | \  / | |__  |  \| |  | | | (___
//     | | | . ` | | |    | |    |  __| | |    |  __| | |\/| |  __| | . ` |  | |  \___ \
//    _| |_| |\  |_| |_   | |    | |____| |____| |____| |  | | |____| |\  |  | |  ____) |
//   |_____|_| \_|_____|  |_|    |______|______|______|_|  |_|______|_| \_|  |_| |_____/
//
//

var supportsTouch = 'ontouchstart' in window || navigator.msMaxTouchPoints;

let currentNoteId = 0;
let currentNoteIdMultiselection = [];

const notesLibrary = new NotesLibrary();

const addNoteBtn = document.getElementById("addNoteBtn");
const delNoteBtn = document.getElementById("delNoteBtn");
const overlay = document.getElementById("overlay");
const showNoteModal = document.getElementById("noteModal");
const noteModalTitle = document.getElementById("title");
const noteModalContent = document.getElementById("content");
const notesGrid = document.getElementById("notesGrid");
const dropdown = document.getElementById("dropdown");

const multiSelectionMode = {
  value: false,
  set(newValue) {
    this.value = newValue;
    const event = new CustomEvent("multiselectionStateChange", {
      detail: newValue,
    });
    document.dispatchEvent(event);
  },
  get() {
    return this.value;
  },
};

function clearNoteModalFields() {
  noteModalTitle.value = "";
  noteModalContent.value = "";
}

function loadNoteModalValues(id) {
  const currNote = notesLibrary.getNote(id);
  noteModalTitle.value = currNote.title;
  noteModalContent.value = currNote.content;
}

const openNoteModalForm = (id) => {
  clearNoteModalFields();
  loadNoteModalValues(id);
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
  const currentNote = new Note();
  currentNote.initialise();

  currentNoteId = currentNote.id;
  notesLibrary.addNote(currentNote);

  openNoteModalForm(currentNoteId);
  saveToLocalStorage(currentNoteId);
};
addNoteBtn.onclick = addNote;

//    _      ____   _____          _           _____ _______ ____  _____            _____ ______
//   | |    / __ \ / ____|   /\   | |         / ____|__   __/ __ \|  __ \     /\   / ____|  ____|
//   | |   | |  | | |       /  \  | |        | (___    | | | |  | | |__) |   /  \ | |  __| |__
//   | |   | |  | | |      / /\ \ | |         \___ \   | | | |  | |  _  /   / /\ \| | |_ |  __|
//   | |___| |__| | |____ / ____ \| |____     ____) |  | | | |__| | | \ \  / ____ \ |__| | |____
//   |______\____/ \_____/_/    \_\______|   |_____/   |_|  \____/|_|  \_\/_/    \_\_____|______|
//
//

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
  localStorage.setItem("library", JSON.stringify(notesLibrary.notes));
};

//    _____  ______ ____   ____  _    _ _   _  _____ ______     _____ _   _ _____  _    _ _______
//   |  __ \|  ____|  _ \ / __ \| |  | | \ | |/ ____|  ____|   |_   _| \ | |  __ \| |  | |__   __|
//   | |  | | |__  | |_) | |  | | |  | |  \| | |    | |__        | | |  \| | |__) | |  | |  | |
//   | |  | |  __| |  _ <| |  | | |  | | . ` | |    |  __|       | | | . ` |  ___/| |  | |  | |
//   | |__| | |____| |_) | |__| | |__| | |\  | |____| |____     _| |_| |\  | |    | |__| |  | |
//   |_____/|______|____/ \____/ \____/|_| \_|\_____|______|   |_____|_| \_|_|     \____/   |_|
//
//

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

  notesLibrary.updateNoteContent(id, title, content);

  saveLocal();
  renderNotesLibrary();
}

// Debounced version of the saveToLocalStorage function
const debouncedSaveToLocalStorage = debounce(
  (id) => saveToLocalStorage(id),
  500
);

// Add event listeners to input fields
titleInput.addEventListener("input", () =>
  debouncedSaveToLocalStorage(currentNoteId)
);
contentInput.addEventListener("input", () =>
  debouncedSaveToLocalStorage(currentNoteId)
);

const JSONToNote = (note) => {
  return new Note(
    note.id,
    note.title,
    note.content,
    note.dateOfCreation,
    note.dateOfModification
  );
};

function removeSelectedClassNoteCard() {
  currentNoteId = null;
  addNoteBtn.classList.add("active");
  delNoteBtn.classList.remove("active");
  const childElements = notesGrid.querySelectorAll(".note-card");
  childElements.forEach((child) => {
    child.classList.remove("selected");
  });
}

document.addEventListener("multiselectionStateChange", (event) => {
  if (event.detail === true) {
    dropdown.classList.add("selected");
    addNoteBtn.classList.remove("active");
    delNoteBtn.classList.add("active");
  } else {
    dropdown.classList.remove("selected");
    addNoteBtn.classList.add("active");
    delNoteBtn.classList.remove("active");
  }
});

//    _   _  ____ _______ ______      _____          _____  _____
//   | \ | |/ __ \__   __|  ____|    / ____|   /\   |  __ \|  __ \
//   |  \| | |  | | | |  | |__      | |       /  \  | |__) | |  | |
//   | . ` | |  | | | |  |  __|     | |      / /\ \ |  _  /| |  | |
//   | |\  | |__| | | |  | |____    | |____ / ____ \| | \ \| |__| |
//   |_| \_|\____/  |_|  |______|    \_____/_/    \_\_|  \_\_____/
//
//


const createNoteCard = (note) => {
  const noteCard = document.createElement("div");
  const title = document.createElement("p");
  const content = document.createElement("p");

  noteCard.classList.add("note-card");
  noteCard.setAttribute("data-card-id", note.id);

  title.classList.add("card-title");
  content.classList.add("card-content");

  title.textContent = `${note.title}`;
  content.textContent = `${note.content}`;

  let isMousePressed = false;
  let mousePressTimer;

  const touchCard = new Touch({
    identifier: "123",
    target: noteCard,
  });

  const touchEventStart = new TouchEvent("touchstart", {
    touches: [touchCard],
    view: window,
    cancelable: true,
    bubbles: true,
  });

  const touchEventEnd = new TouchEvent("touchend", {
    touches: [],
    view: null,
    cancelable: true,
    bubbles: true,
  });
  
  noteCard.dispatchEvent(touchEventStart);
  noteCard.dispatchEvent(touchEventEnd);


  function startPress() {
    if (multiSelectionMode.get() === false){
       mousePressTimer = setTimeout(() => {
      multiSelectionMode.set(true);
    }, 1000);
    }
   
    isMousePressed = true;
  }

  function endPress() {
    if (isMousePressed) {
      // Clear the timer
      clearTimeout(mousePressTimer);
      // If in single-selection mode, select the clicked card
      if (multiSelectionMode.get() === false) {
        removeSelectedClassNoteCard();
        noteCard.classList.add("selected");
        currentNoteId = noteCard.getAttribute("data-card-id");
        openNoteModalForm(currentNoteId);
      }

      // If in multi-selection mode, toggle the card's selection state
      if (multiSelectionMode.get() === true) {
        noteCard.classList.toggle("selected");
        const clickNoteId = noteCard.getAttribute("data-card-id");
        if (noteCard.classList.contains("selected")) {
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
  }

  if (supportsTouch) {
      noteCard.addEventListener("touchstart", (e) =>{
        e.preventDefault()
    startPress();
  })
  noteCard.addEventListener("touchend", (e) =>{
    e.preventDefault()
    endPress();
  })
  }else{
     noteCard.addEventListener("mousedown", () => {
    startPress();
  });
  noteCard.addEventListener("mouseup", () => {
    endPress();
  });
  }


 


  noteCard.appendChild(title);
  noteCard.appendChild(content);

  notesGrid.appendChild(noteCard);
};

const resetNotesGrid = () => {
  notesGrid.innerHTML = "";
};

function renderNotesLibrary() {
  resetNotesGrid();
  notesLibrary.notes.forEach((note) => {
    createNoteCard(note);
  });
}

//    _____        _____ ______     _      ____          _____
//   |  __ \ /\   / ____|  ____|   | |    / __ \   /\   |  __ \
//   | |__) /  \ | |  __| |__      | |   | |  | | /  \  | |  | |
//   |  ___/ /\ \| | |_ |  __|     | |   | |  | |/ /\ \ | |  | |
//   | |  / ____ \ |__| | |____    | |___| |__| / ____ \| |__| |
//   |_| /_/    \_\_____|______|   |______\____/_/    \_\_____/
//
//

window.addEventListener("load", () => {
  const savedNotesLibrary = JSON.parse(localStorage.getItem("library"));
  if (savedNotesLibrary) {
    notesLibrary.notes = savedNotesLibrary.map((note) => JSONToNote(note));
    renderNotesLibrary();
    console.log(notesLibrary);
  } else {
    notesLibrary.notes = [];
  }
});

//    _____  ______  _____ ______ _      ______ _____ _______     ________      _________ _      _____  _____ _______
//   |  __ \|  ____|/ ____|  ____| |    |  ____/ ____|__   __|   |  ____\ \    / /__   __| |    |_   _|/ ____|__   __|
//   | |  | | |__  | (___ | |__  | |    | |__ | |       | |      | |__   \ \  / /   | |  | |      | | | (___    | |
//   | |  | |  __|  \___ \|  __| | |    |  __|| |       | |      |  __|   \ \/ /    | |  | |      | |  \___ \   | |
//   | |__| | |____ ____) | |____| |____| |___| |____   | |      | |____   \  /     | |  | |____ _| |_ ____) |  | |
//   |_____/|______|_____/|______|______|______\_____|  |_|      |______|   \/      |_|  |______|_____|_____/   |_|
//
//

document.addEventListener("click", function (event) {
  var clickedElement = event.target;
  // Check if the clicked element or any of its ancestors have the "card" class
  var isClickedOnCard = clickedElement.closest(".note-card");
  var isClickedOnModalInput = clickedElement.closest(".note-form");
  var clickedOnButtons = clickedElement.closest(".btn");
  console.log(isClickedOnCard);
  // If not clicked on a card or its descendant
  if (!isClickedOnCard && !isClickedOnModalInput && !clickedOnButtons) {
    multiSelectionMode.set(false);
    removeSelectedClassNoteCard();
  }
});


window.addEventListener("contextmenu", (e) => {
  e.preventDefault();
});

//"use strict";
//document.cookie = "myCookie=myValue; SameSite=None; Secure";
//Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.3.1/firebase-app.js";
import {
  GoogleAuthProvider,
  getAuth,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.3.1/firebase-auth.js";
import {
  getFirestore,
  collection,
  query,
  where,
  doc,
  onSnapshot,
  //getDoc,
  //getDocs,
  setDoc,
  Timestamp,
} from "https://www.gstatic.com/firebasejs/10.3.1/firebase-firestore.js";
//TODO: Add SDKs for Firebase products that you want to use
//https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDDpKPe_f_QJKvCx9CmJCIifCEXq8-y7yY",
  authDomain: "notes-app-b661f.firebaseapp.com",
  projectId: "notes-app-b661f",
  storageBucket: "notes-app-b661f.appspot.com",
  messagingSenderId: "166018201908",
  appId: "1:166018201908:web:87e5cd77f0406a9673cd61",
};

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
    title = "",
    content = "",
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

var supportsTouch = "ontouchstart" in window || navigator.msMaxTouchPoints;

let currentNoteId = 0;
let currentNoteIdMultiselection = [];
let touchScreen = false;


const notesLibrary = new NotesLibrary();

const addNoteBtn = document.getElementById("addNoteBtn");
const delNotesBtn = document.getElementById("delNoteBtn");
const delFormBtn = document.getElementById("btnFormDel");
const overlay = document.getElementById("overlay");
const showNoteModal = document.getElementById("noteModal");
const noteModalTitle = document.getElementById("title");
const noteModalContent = document.getElementById("content");
const notesGrid = document.getElementById("notesGrid");
const dropdown = document.getElementById("dropdown");
const logInBtn = document.getElementById("logInBtn");
const logOutBtn = document.getElementById("logOutBtn");
const accountBtn = document.getElementById("accountBtn");

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

  const addedNoteCard = createNoteCard(currentNote);

  openNoteModalForm(currentNoteId);

  if (auth.currentUser) {
    addNoteDB(currentNote, currentNoteId);
  } else {
    saveToLocalStorage(currentNoteId);
  }

  addedNoteCard.style.transform = "scale(0)";
  addedNoteCard.style.opacity = "0";

  // Use setTimeout to apply the transition after the reflow
  setTimeout(() => {
    addedNoteCard.style.transform = "scale(1)";
    addedNoteCard.style.opacity = "1";
  }, 0);
};
addNoteBtn.onclick = addNote;

const delNote = (id) => {
  const cardToRemove = document.querySelector(`[data-card-id="${id}"]`);

  const removeCard = () => {
    cardToRemove.remove();
  };

  cardToRemove.classList.add("removing");
  cardToRemove.addEventListener("transitionend", removeCard);

  notesLibrary.removeNote(id);
  if (auth.currentUser) {
    removeNoteDB(id);
  } else {
    saveLocal();
  }
  closeAllModals();
};
delFormBtn.onclick = () => delNote(currentNoteId);

const delMutlipleNotes = async () => {
  currentNoteIdMultiselection.forEach((id) => {
    if (auth.currentUser) {
      removeNoteDB(id);
    } else {
      delNote(id);
    }
  });
};
delNotesBtn.onclick = delMutlipleNotes;

window.addEventListener('touchstart', function() {
  touchScreen = true
});

window.addEventListener('mousedown', function() {
  touchScreen = false
});

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

  const fieldsToRender = document.querySelector(
    `[data-card-id="${currentNoteId}"]`
  );

  const titleField = fieldsToRender.querySelector(".card-title");
  const contentField = fieldsToRender.querySelector(".card-content");

  titleField.textContent = title;
  contentField.textContent = content;

  saveLocal();
}


// Debounced version of the saveToLocalStorage function
const debouncedSaveToLocalStorage = debounce(
  (id) => saveToLocalStorage(id), 1000
);

const updateOnEvtListener = () => {
  const title = titleInput.value;
  const content = contentInput.value;
  if (auth.currentUser) {
    updateNoteDB(currentNoteId, title, content);
  } else {
    debouncedSaveToLocalStorage(currentNoteId);
  }
};

// Add event listeners to input fields
titleInput.addEventListener("input", updateOnEvtListener);
contentInput.addEventListener("input", updateOnEvtListener);

function removeSelectedClassNoteCard() {
  currentNoteId = null;
  addNoteBtn.classList.add("active");
  delNotesBtn.classList.remove("active");
  const childElements = notesGrid.querySelectorAll(".note-card");
  childElements.forEach((child) => {
    child.classList.remove("selected");
  });
}

//     _____ _______    _______ ______
//    / ____|__   __|/\|__   __|  ____|
//   | (___    | |  /  \  | |  | |__
//    \___ \   | | / /\ \ | |  |  __|
//    ____) |  | |/ ____ \| |  | |____
//   |_____/   |_/_/    \_\_|  |______|
//
//

document.addEventListener("multiselectionStateChange", (event) => {
  if (event.detail === true) {
    dropdown.classList.add("selected");
    addNoteBtn.classList.remove("active");
    delNotesBtn.classList.add("active");
  } else {
    dropdown.classList.remove("selected");
    addNoteBtn.classList.add("active");
    delNotesBtn.classList.remove("active");
    currentNoteIdMultiselection = [];
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
    if (multiSelectionMode.get() === false) {
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
    noteCard.addEventListener("touchstart", (e) => {
      e.preventDefault();
      startPress();
    });
    noteCard.addEventListener("touchend", (e) => {
      e.preventDefault();
      endPress();
    });
  } else {
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

  return noteCard;
};

const resetNotesGrid = () => {
  notesGrid.innerHTML = "";
};

function renderAllNotesLibrary() {
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

const JSONToNote = (note) => {
  return new Note(
    note.id,
    note.title,
    note.content,
    note.dateOfCreation,
    note.dateOfModification
  );
};

const restoreLocal = () => {
  const savedNotesLibrary = JSON.parse(localStorage.getItem("library"));
  if (savedNotesLibrary) {
    notesLibrary.notes = savedNotesLibrary.map((note) => JSONToNote(note));
    renderAllNotesLibrary();
    console.log(notesLibrary);
  } else {
    notesLibrary.notes = [];
  }
};


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
  var isClickedOnModalInput = clickedElement.closest(".modal");
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


//    ______ _____ _____  ______ ____           _____ ______
//   |  ____|_   _|  __ \|  ____|  _ \   /\    / ____|  ____|
//   | |__    | | | |__) | |__  | |_) | /  \  | (___ | |__
//   |  __|   | | |  _  /|  __| |  _ < / /\ \  \___ \|  __|
//   | |     _| |_| | \ \| |____| |_) / ____ \ ____) | |____
//   |_|    |_____|_|  \_\______|____/_/    \_\_____/|______|
//
//
const app = await initializeApp(firebaseConfig);
const provider = new GoogleAuthProvider();
const auth = await getAuth();
const db = await getFirestore(app);

//auth

onAuthStateChanged(auth, (user) => {
  if (user) {
    // User is signed in, see docs for a list of available properties
    // https://firebase.google.com/docs/reference/js/auth.user
    console.log(auth.currentUser);

    setupRealTimeListener()

  } else {
    if (unsub) unsubscribe(); //If listener is still active call function 
    restoreLocal();
    renderAllNotesLibrary();
  }
});

const onclkSignIn = async () => {



  try {
    const result = touchScreen === true ? await signInWithRedirect(auth, provider) : await signInWithPopup(auth, provider);
  
    const credential = GoogleAuthProvider.credentialFromResult(result);
    console.log(credential);

    currentNoteId = null
    notesLibrary.notes = []
    renderAllNotesLibrary();
  } catch (error) {
    // Handle authentication errors here
    console.error("Authentication error:", error);
  }
};

logInBtn.onclick = onclkSignIn;

const onclkSignOut = async () =>
  signOut(auth)
    .then(() => {
      console.log("youreout");
    })
    .catch((error) => {
      // An error happened.
    });
logOutBtn.onclick = onclkSignOut;

//firestore

let unsub

const setupRealTimeListener = async () => {
try {
  const q = query(collection(db, "notes"), where("ownerId", "==", auth.currentUser.uid));
  //const docsSnap = await getDocs(q);

  unsub = await onSnapshot(q, (querySnapshot) => {
    querySnapshot.forEach((doc) => {
      notesLibrary.addNote(docsToNotes(doc));
      console.log(doc)
    });
    console.log('aaa')
    renderAllNotesLibrary()
  })

  
}catch(err){
  console.log(err)
}
};

const addNoteDB = async (newNote, id) => {
  //doc(db, 'notes').add(noteToDoc(newNote))
  await setDoc(doc(db, "notes", String(id)), noteToDoc(newNote));
};

// const updateNoteDB = async (...args) => {
//   const noteRef = db
//     .collection("notes")
//     .where("ownerId", "==", auth.currentUser.uid)
//     .where("id", "==", id);

//   const snapshot = await noteRef.getDoc();

//   if (snapshot.empty) {
//     console.log("No matching documents.");
//     return;
//   }

//   const updatedData = {
//     title: newTitle,
//     content: newContent,
//     dateOfModification: Timestamp.now(),
//   };

//   await snapshot.ref
//     .update(updatedData)
//     .then(() => console.log("updated"))
//     .catch((err) => console.log(err));
// };

// const removeNoteDB = async (id) => {
//   db.collection("notes")
//     .where("ownerId", "==", auth.currentUser.uid)
//     .where("id", "==", id)
//     .delete();
// };

const docsToNotes = (doc) => {
  console.log(doc.id, doc.title, doc.content, doc.data().DoC.toDate(), doc.data().DoM.toDate())
  const currentNote = new Note();
  currentNote.id = doc.id
  currentNote.title = doc.title
  currentNote.content = doc.content
  currentNote.dateOfCreation = doc.data().DoC.toDate()
  currentNote.dateOfModification = doc.data().DoM.toDate()
  return currentNote
}

const noteToDoc = (note) => {
  return {
    ownerId: auth.currentUser.uid,
    id: note.id,
    title: note.title,
    content: note.content,
    DoC: Timestamp.fromDate(note.dateOfCreation),
    DoM: Timestamp.fromDate(note.dateOfModification),
  };
};

'use strict'

// Define Firebase references. These are used to access data in Firebase.
// The selectedDocRef will be used to update and get updates from the currently selected document.
var ref = new Firebase('https://gdocslite.firebaseio.com');
var docsRef = ref.child('docs');
var selectedDocRef = null;

// Get a handle on several HTML elements.
// docNameElement: the document name displayed at the top of the page
// docContentElement: the document content area
// createDocButton: the "Create new doc" button
// docsListElement: the list of docs on the left of the page
var docNameElement = document.getElementById('doc-name');
var docContentElement = document.getElementById('doc-content');
var createDocButton = document.getElementById('create-doc-btn');
var docsListElement = document.getElementById('docs-list');

// Attach event handlers.
docsRef.on('child_added', addDocToList);
createDocButton.onclick = createDoc;

// Function for creating a new doc.
// Prompts the user for a doc name, and then creates the doc
// in firebase with some default content.
function createDoc() {
  var name = prompt('Doc Name?');
  while(name.trim().length == 0) {
    alert('Please enter a name');
    name = prompt('Name?');
  }
  docsRef.push({
    name: name,
    content: "Here's your doc! Start adding stuff!"
  });
}

// Function takes a Firebase snapshot for a doc and appends
// the doc to the docs list on the left side of the page.
// It attaches a click-handler that calls selectDoc()
// for each individual doc when it gets clicked.
function addDocToList(snap) {
  var key = snap.key();
  var name = snap.val().name;
  var docItem = document.createElement('li');
  docItem.appendChild(document.createTextNode(name));
  // Click handler. It's nested inside of a function so that
  // we can call selectDoc and pass the key as an argument.
  // this won't work: docItem.onclick = selectDoc(key)
  docItem.onclick = function() {
    selectDoc(key);
  };
  docsListElement.appendChild(docItem);
}

// Function gets called when a doc is clicked on the left side of the page.
function selectDoc(key) {
  // Check if a selected doc has already been set.
  // If it has, detach the 'value' handler by calling .off('value').
  if(selectedDocRef !== null) {
    selectedDocRef.off('value');
  }

  // We use a variable to capture each time the user types.
  // This will make sense in a minute.
  var lastTypedTime = 0;

  // Update the selected doc reference from Firebase.
  selectedDocRef = docsRef.child(key);

  // Enable editing the doc content by setting the contenteditable attribute to true.
  docContentElement.setAttribute('contenteditable', 'true');

  // Each time the user types a key, the onkeyup event will fire and this function will execute.
  docContentElement.onkeyup = function() {
    // Update the lastTypedTime time to be the current time.
    lastTypedTime = new Date().getTime();
    // Grab the content from the doc contnet element.
    // Using the || ("or") here because some browsers support innerHTML and others support innerText.
    var content = docContentElement.innerHTML || docContentElement.innerText;
    // Update the content value in Firebase.
    selectedDocRef.child('content').set(content);
  }

  // Add a .on('value') handler. This function will get
  // called with the data snapshot from firebase each time
  // the doc data is updated in firebase.
  selectedDocRef.on('value', function(snap) {
    // We only update data if the user hasn't typed for more than 10 milliseconds.
    var now = new Date().getTime();
    var name = snap.val().name;
    var content = snap.val().content;
    if(now - lastTypedTime > 10) {
      // Update the name and content.
      docNameElement.innerText = name;
      docContentElement.innerHTML = content;
    }
  });


}

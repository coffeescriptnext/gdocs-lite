'use strict'

var ref = new Firebase('https://frbsdocs.firebaseio.com');
var docsRef = ref.child('docs');
var selectedDocRef = null;
var docNameElement = document.getElementById('doc-name');
var docContentElement = document.getElementById('doc-content');
var createDocButton = document.getElementById('create-doc-btn');
var docsListElement = document.getElementById('docs-list');

function createDoc() {
  var name = prompt('Doc Name?');
  while(name.trim().length == 0) {
    alert('Please enter a name');
    name = prompt('Name?');
  }
  docsRef.push({
    name: name,
    content: ''
  });
}

function addDocToList(snap) {
  var key = snap.key();
  var name = snap.val().name;
  var docItem = document.createElement('li');
  docItem.appendChild(document.createTextNode(name));
  docItem.onclick = function() {
    selectDoc(key);
  };
  docsListElement.appendChild(docItem);
}

function selectDoc(key) {
  if(selectedDocRef !== null) {
    selectedDocRef.off('value');
  }

  selectedDocRef = docsRef.child(key);
  selectedDocRef.on('value', function(snap) {
    docNameElement.innerText = snap.val().name;
    docContentElement.innerHTML = snap.val().content;
  });

  docContentElement.setAttribute('contenteditable', 'true');
  docContentElement.onkeyup = function(event) {
    event.preventDefault();
    var content = docContentElement.innerHTML || docContentElement.innerText;
    selectedDocRef.child('content').set(content);
  }
}

docsRef.on('child_added', addDocToList);
createDocButton.onclick = createDoc;

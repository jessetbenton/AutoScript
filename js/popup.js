var saveBtn, cancelBtn, addBtn, myCodeMirror;
document.onreadystatechange = function() {
   if(document.readyState === "complete") {
      init();
      syntaxHighlighting();
   }
}

function save(event) {
   var script = {};
   script.name = document.getElementById('name').value;
   script.enabled = document.getElementById('enabled').checked;
   script.code = myCodeMirror.getValue();
   script.activeURLs = "";
   //url:
   //{ host: "", path: "" }

   if (script.name !== '' && script.code !== '') {
      chrome.runtime.sendMessage({ message: "save", obj: script }, function(response) {
         if(response.error) {
            alert("Script with that name already exists");
         }
         else {
            cancel();
            init();
         }
      });
   }
}

function cancel(event) {
   document.getElementById('newScript').style.display = 'none';
   document.getElementById('addBtn').style.display = 'block';
   document.getElementById('name').value = "";
   document.getElementById('enabled').checked = false;

   myCodeMirror.setValue("");
   myCodeMirror.clearHistory();

   document.body.style.width = "150px";
}

function init() {
   console.log("popup init");
   document.querySelector("#scripts table").innerHTML = "";
   var table = document.querySelector("#scripts table");
   var tr, td, input, label, button, script;
   var count = 0;
   chrome.runtime.sendMessage({ message: "getAllScripts" }, function(response) {
      for(s in response.scripts) {
         script = JSON.parse(response.scripts[s]);
         tr = document.createElement('tr');
         td = document.createElement('td');
         td.id = script.name + "_SCRIPTER";
         label = document.createElement('label');
         input = document.createElement('input');
         input.type = "checkbox";
         input.className = "scriptCheckBox";
         input.id = script.name;
         label.appendChild(input);
         label.innerHTML += script.name;
         button = document.createElement('button');
         button.onclick = edit;
         button.innerHTML = "edit";
         tr.appendChild(td);
         td.appendChild(label);
         td.appendChild(button);
         table.appendChild(tr);
         document.querySelector('#' + script.name).checked = script.enabled;
         count++;
      }
      if(document.querySelector("#scripts table").children.length === 0) {
         document.querySelector("#scripts table").innerHTML = "No Scripts Added";
      }
      addEventListeners();
   });
}

function addEventListeners() {
   saveBtn = document.getElementById('save');
   cancelBtn = document.getElementById('cancel');
   addBtn = document.getElementById('addBtn');

   saveBtn.onclick = save;
   cancelBtn.onclick = cancel;
   addBtn.onclick = toggleAdd;

   var checkBoxes = document.getElementsByClassName('scriptCheckBox');
   for(var i = 0; i < checkBoxes.length; i++) {
      var name = checkBoxes[i].id;
      checkBoxes[i].onchange = toggleScript;
   }
}

function toggleScript(event) {
   var name = event.target.id;
   chrome.runtime.sendMessage({ message: "toggleScript", name: name }, function(response) {
      if(response.error) {
         console.log("an error has occurred");
      }
   });
}

function toggleAdd(event) {
   document.getElementById('newScript').style.display = 'block';
   document.getElementById(event.target.id).style.display = 'none';
   document.body.style.width = "500px";
}

function edit(event) {
   var name = event.target.parentNode.id.replace("_SCRIPTER","");
   localStorage['edit'] = name;
   chrome.tabs.create({'url': 'edit.html'});
}

function syntaxHighlighting() {
   console.log("popup syntaxHighlighting");
   myCodeMirror = CodeMirror.fromTextArea(document.getElementById("code"), {
      mode: "javascript",
      lineNumbers: true,
      lineWrapping: true,
      cursorHeight: .85,
      theme: "monokai"
   });
}
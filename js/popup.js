var saveBtn, cancelBtn, addBtn, myCodeMirror;
document.onreadystatechange = function() {
   if(document.readyState === "complete") {
      init();
      addEventListeners();
      syntaxHighlighting();
   }
}

function save(event) {
   var script = {};
   script.name = document.getElementById('name').value;
   script.enabled = document.getElementById('enabled').checked;
   script.code = myCodeMirror.getValue();
   script.activeURLs = [];

   if (script.name !== '' && script.code !== '') {
      if(localStorage[script.name] === undefined) {
         localStorage[script.name] = JSON.stringify(script);
         updateContextMenus();
         cancel();
         init();
      }
      else {
         alert("Script with that name already exists");
      }
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
   document.querySelector("#scripts table").innerHTML = "";
   var table = document.querySelector("#scripts table");
   var tr, td, input, label, button, script;
   var count = 0;
   for(s in localStorage) {
      script = JSON.parse(localStorage[s]);
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

function toggleScript(evt) {
   var json = JSON.parse(localStorage[evt.target.id]);
   json.enabled = json.enabled === true ? false : true;
   localStorage[evt.target.id] = JSON.stringify(json);
}

function toggleAdd(evt) {
   document.getElementById('newScript').style.display = 'block';
   document.getElementById(evt.target.id).style.display = 'none';
   document.body.style.width = "500px";
}

function edit(evt) {
   var name = evt.target.parentNode.id.replace("_SCRIPTER","");
   localStorage['edit'] = name;
   chrome.tabs.create({'url': 'edit.html'});
}

function syntaxHighlighting() {
   myCodeMirror = CodeMirror.fromTextArea(document.getElementById("code"), {
      mode: "javascript",
      lineNumbers: true,
      lineWrapping: true,
      cursorHeight: .85,
      theme: "monokai"
   });
}

function updateContextMenus() {
   chrome.contextMenus.removeAll();
   chrome.contextMenus.create({
      "title": "AutoScript Options",
      "contexts":["all"],
      "onclick": function() {chrome.tabs.create({'url': 'options.html'});}
   });
   chrome.contextMenus.create({
      "type": "separator"
   });
   for(s in localStorage) {
      chrome.contextMenus.create({
         "title": s,
         "contexts":["all"],
         "onclick": function() { console.log("context menu")}
      });  
   }  
}
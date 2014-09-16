var saveBtn, cancelBtn, delBtn, myCodeMirror;
document.onreadystatechange = function() {
   if(document.readyState === "complete") {
      syntaxHighlighting();
      init();
      addEventListeners();
   }
}

function init() {
   var json;
   try {
      //get param
      var name = window.location.search.substring(4);
      json = JSON.parse(localStorage[name]);
      myCodeMirror.setValue(json.code);
      document.getElementById('name').value = json.name;
      document.getElementById('enabled').checked = json.enabled;
      document.getElementById('ActiveURLs').value = json.activeURLs;
   }
   catch(e) {}
}

function save(event) {
   var script = {};
   script.name = (document.getElementById('name').value).replace(/ /g,'_');
   script.enabled = document.getElementById('enabled').checked;
   script.code = myCodeMirror.getValue();
   script.activeURLs = document.getElementById('ActiveURLs').value;

   if (script.name !== '' && script.code !== '') {
      localStorage[script.name] = JSON.stringify(script);
      closeTab();
   }
}

function closeTab() {
   chrome.tabs.getCurrent(function(tab) {
      chrome.tabs.remove(tab.id, function() { });
   });
}

function del(event) {
   try {
      var name = document.getElementById('name').value;
      localStorage.removeItem(name);
      closeTab();
   }
   catch (e) {}
}

function addEventListeners() {
   saveBtn = document.getElementById('save');
   cancelBtn = document.getElementById('cancel');
   delBtn = document.getElementById('delete');
   saveBtn.onclick = save;
   cancelBtn.onclick = closeTab;
   delBtn.onclick = del;
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
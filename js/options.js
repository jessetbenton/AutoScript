document.onreadystatechange = function() {
   if(document.readyState === "complete") {
      init();
   }
}

var count = 0;
function init() {
   var node, script, addBtn;
   for(s in localStorage) {
      script = JSON.parse(localStorage[s]);
      scriptDisplay(script);
      count++;
   }
   addBtn = document.getElementById('add');
   addBtn.onclick = addScript;
}

function addScript(event) {
   chrome.tabs.create({'url': 'edit.html'});
}

function removeButtons(parent) {
   parent.children[6].remove();
   parent.children[5].remove();
}

function minimizeCode(index) {
   mirrors[index].setSize(null, 20);
   var parent = document.getElementById(index);
   parent.children[3].classList.add("minimized");
   if(parent.children.length > 5 && mirrors[index].changed === false) {
      try {
         removeButtons(parent);
      }
      catch(e) { }
   }   
}

function mouseover(event) {
   var id = event.target.parentNode.id;
   if(event.target.className.indexOf("minimized") !== -1) {
      mirrors[id].setSize(null, "auto");
      event.target.classList.remove("minimized");
      var scripts = document.getElementsByClassName('maximized');
      for(var i = 0; i < scripts.length; i++) {
         if(i != id) {
            minimizeCode(i);
         }
      }
      event.target.classList.add("maximized");
   }
}

function save(event) {
   var index, parent, name, script, code;
   if(event.type === 'click') {
      index = event.target.parentNode.id;
      parent = document.getElementById(index);
      name = parent.firstChild.innerHTML;
      chrome.runtime.sendMessage({ message: "getScript", name: name }, function(response) {
         var script = response.script;
         script.code = mirrors[index].getValue();
         //TODO: update active urls
         chrome.runtime.sendMessage({ message: "save", override: true, obj: response.script }, function(response) {
            if(!response.error) {
               minimizeCode(index);
               removeButtons(parent);
               mirrors[index].changed = false;
            }
         });
      });
   }
   else if(event.type === 'change') {
      index = event.target.parentNode.parentNode.id;
      parent = document.getElementById(index);
      name = parent.firstChild.innerHTML;
      chrome.runtime.sendMessage({ message: "toggleScript", name: name });
   }   
}

function cancel(event) {
   var name = event.target.parentNode.children[0].innerHTML;
   chrome.runtime.sendMessage({ message: "getScript", name: name }, function(response) {
      var json = response.script;
      var index = event.target.parentNode.id;
      mirrors[index].changed = false;
      mirrors[index].setValue(json.code);
      minimizeCode(index);
   });
}

function getJSON(index) {
   var script = document.getElementById(index);
   var name = script.children[0].innerHTML;
   chrome.runtime.sendMessage({ message: "getScript", name: name }, function(response) {
      var json = undefined;
      if(!response.error) {
         console.log("no error");
         json = response.script;
      }
      console.debug(json);
      return json;
   });
}

function del(event) {
   var index = event.target.parentNode.id;
   var name = document.getElementById(index).firstChild.innerHTML;
   chrome.runtime.sendMessage({ message: "delete", name: name }, function(response) {   
      if(!response.error) {
         document.getElementById(index).remove();
      }
   });
}

var scripts, scriptDiv, enabledDiv, nameDiv, activeDiv, codeDiv, checkbox;
var mirrors = [];
function scriptDisplay(obj) {
   if(scripts === undefined) {
      scripts = document.getElementById('scripts');
   }
   scriptDiv = document.createElement('div');
   scriptDiv.className = "script";
   enabledDiv = document.createElement('div');
   enabledDiv.className = "enabled";
   checkbox = document.createElement('input');
   checkbox.type = "checkbox";
   checkbox.checked = obj.enabled;
   checkbox.onchange = save;
   enabledDiv.appendChild(checkbox);
   nameDiv = document.createElement('div');
   nameDiv.className = "name";
   activeDiv = document.createElement('div');
   activeDiv.className = "activeURLs";
   codeDiv = document.createElement('div');
   codeDiv.className = "code minimized";
   scriptDiv.id = count;
   var delBtn = document.createElement('button');
   delBtn.onclick = del;
   delBtn.innerHTML = "Delete";

   scriptDiv.appendChild(nameDiv);
   scriptDiv.appendChild(enabledDiv);
   scriptDiv.appendChild(activeDiv);
   scriptDiv.appendChild(codeDiv);
   scriptDiv.appendChild(delBtn);

   codeDiv.onmouseover = mouseover;
   nameDiv.innerHTML = obj.name;
   scripts.appendChild(scriptDiv);

   mirrors.push(CodeMirror(document.getElementById(count).children[3], {
      mode: "javascript",
      value: obj.code,
      lineNumbers: true,
      lineWrapping: true,
      cursorHeight: .85,
      theme: "monokai"
   }));

   mirrors[count].setSize(null, 20);
   mirrors[count].index = count;
   mirrors[count].on("change", function(cm, changed) {
      var parent = document.getElementById(cm.index);
      if(parent.children.length < 6) {
         var saveBtn = document.createElement('button');
         saveBtn.onclick = save;
         saveBtn.innerHTML = "Save";
         var cancelBtn = document.createElement('button');
         cancelBtn.onclick = cancel;
         cancelBtn.innerHTML = "Cancel";
         mirrors[cm.index].changed = true;
         document.getElementById(cm.index).appendChild(saveBtn);
         document.getElementById(cm.index).appendChild(cancelBtn);
      }
   });
}
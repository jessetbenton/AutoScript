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

var saveTimeout;
function save(event) {
   var index, parent, name, script, urls;
   if(event.type === 'keyup') {
      clearTimeout(saveTimeout);
      urls = event.target.value;
      parent = event.target.parentNode.parentNode;
      index = parent.id;
      name = parent.children[0].innerHTML;
      saveTimeout = setTimeout(function() {
         chrome.runtime.sendMessage({ message: "getScript", name: name }, function(response) {
            var script = response.script;
            script.activeURLs = parent.children[2].firstChild.value;
            chrome.runtime.sendMessage({ message: "save", override: true, obj: response.script }, function(response) {
               parent.style.backgroundColor = "green";
               setTimeout(function() {
                  parent.style.backgroundColor = "";
               }, 500);
            });
         });
      }, 1500);
   }
   else if(event.type === 'change') {
      index = event.target.parentNode.parentNode.id;
      parent = document.getElementById(index);
      name = parent.firstChild.innerHTML;
      chrome.runtime.sendMessage({ message: "toggleScript", name: name });
   }   
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

function edit(event) {
   var name = event.target.name;
   chrome.tabs.create({'url': 'edit.html?id=' + name});
}

var scripts, scriptDiv, enabledDiv, nameDiv, activeDiv, checkbox, url,
   editBtn, delBtn;
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

   urlLabel = document.createElement('label');
   url = document.createElement('input');
   url.value = obj.activeURLs;
   url.onkeyup = save;
   activeDiv.appendChild(url);

   scriptDiv.id = count;
   editBtn = document.createElement('button');
   editBtn.onclick = edit;
   editBtn.name = obj.name;
   editBtn.innerHTML = "edit";

   delBtn = document.createElement('button');
   delBtn.onclick = del;
   delBtn.innerHTML = "Delete";

   scriptDiv.appendChild(nameDiv);
   scriptDiv.appendChild(enabledDiv);
   scriptDiv.appendChild(activeDiv);
   scriptDiv.appendChild(editBtn);
   scriptDiv.appendChild(delBtn);

   nameDiv.innerHTML = obj.name;
   scripts.appendChild(scriptDiv);
}
var saveBtn, cancelBtn, addBtn, myCodeMirror;
document.onreadystatechange = function() {
   if(document.readyState === "complete") {
      init();
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

function init() {
   var container = document.querySelector("div#container");
   var div, input, label, button, script, addBtn;
   var count = 0;
   chrome.runtime.sendMessage({ message: "getAllScripts" }, function(response) {
      for(s in response.scripts) {
         script = JSON.parse(response.scripts[s]);
         div = document.createElement('div');         
         div.id = script.name + "_SCRIPTER";
         div.className = "script";       
         label = document.createElement('label');
         input = document.createElement('input');
         input.type = "checkbox";
         input.className = "scriptCheckBox";
         input.id = script.name;
         label.appendChild(input);
         label.innerHTML += script.name;
         button = document.createElement('button');
         button.className = "add";
         button.onclick = edit;
         button.innerHTML = "edit";
         div.appendChild(label);
         div.appendChild(button);
         container.appendChild(div);
         document.querySelector('#' + script.name).checked = script.enabled;
         document.getElementById(script.name).onchange = toggleScript;
         count++;
      }
      if(container.children.length === 0) {
         container.innerHTML = "No Scripts Added";
      }
      addBtn = document.getElementById('addBtn');
      addBtn.onclick = toggleAdd;
   });
}

function toggleAdd(event) {
   chrome.tabs.create({'url': 'edit.html'});
}

function edit(event) {
   var name = event.target.parentNode.id.replace("_SCRIPTER","");
   chrome.tabs.create({'url': 'edit.html?id=' + name});
}
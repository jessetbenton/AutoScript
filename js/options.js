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

function minimizeCode(index) {
   mirrors[index].setSize(null, 20);
   var parent = document.getElementById(index);
   parent.children[3].classList.add("minimized");
   console.log(parent.children.length);
   console.log(mirrors[index].changed);
   if(parent.children.length > 5 && mirrors[index].changed === false) {
      try {
         parent.children[6].remove();
         parent.children[5].remove();
      }
      catch(e) { }
   }   
}

function mouseover(evt) {
   var id = evt.target.parentNode.id;
   if(evt.target.className.indexOf("minimized") !== -1) {
      mirrors[id].setSize(null, "auto");
      evt.target.classList.remove("minimized");
      var scripts = document.getElementsByClassName('maximized');
      console.dir(scripts);
      for(var i = 0; i < scripts.length; i++) {
         if(i != id) {
            minimizeCode(i);
         }
      }
      evt.target.classList.add("maximized");
   }
}

function save(evt) {
   var json, index, parent;
   if(evt.type === 'click') {
      index = evt.target.parentNode.id;
      parent = document.getElementById(index);
      json = getJSON(index);
      json.enabled = parent.children[1].firstChild.checked;
      json.code = mirrors[index].getValue();
   }
   else if(evt.type === 'change') {
      index = evt.target.parentNode.parentNode.id;
      json = getJSON(index);
      parent = document.getElementById(index);
      json.enabled = parent.children[1].firstChild.checked;
   }
   mirrors[index].changed = false;
   localStorage[json.name] = JSON.stringify(json);
   minimizeCode(index);
}

function cancel(evt) {
   var name = evt.target.parentNode.children[0].innerHTML;
   var json = JSON.parse(localStorage[name]);
   var index = evt.target.parentNode.id;
   mirrors[index].changed = false;
   mirrors[index].setValue(json.code);
   minimizeCode(index);
}

function getJSON(index) {
   var script = document.getElementById(index);
   return JSON.parse(localStorage[script.children[0].innerHTML]);
}

function del(event) {
   var index = event.target.parentNode.id;
   var name = document.getElementById(index).firstChild.innerHTML;
   localStorage.removeItem(name);
   document.getElementById(index).remove();
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
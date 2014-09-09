chrome.runtime.onMessage.addListener(
   function (request, sender, sendResponse) {
      switch(request.message) {
        case "save":
          var obj;
          obj = request.obj;
          if(request.override || localStorage[obj.name] === undefined) {
            localStorage[obj.name] = JSON.stringify(obj);
            sendResponse({error: false, message: "Script saved"});
            updateContextMenus();
          }
          else {
            sendResponse({error: true, message: "Script with that name already exists" });   
          }
          break;
        case "delete":
          localStorage.removeItem(request.name);
          sendResponse({error: false, message: "deleted"});
          break;
        case "getAllScripts":
          sendResponse({error: false, message: "success", scripts: localStorage});
          break;
        case "getScript":
          console.log("requesting: " + request.name);
          console.debug(JSON.parse(localStorage[request.name]));
          sendResponse({error: false, script: JSON.parse(localStorage[request.name])})
          break;
        case "toggleScript":
          var json = JSON.parse(localStorage[request.name]);
          json.enabled = json.enabled === true ? false : true;
          localStorage[request.name] = JSON.stringify(json);
          sendResponse({error:false, message: "success"});
          break;
        case "updateContextMenu":
          updateContextMenus();
          sendResponse({ error: false, message: "Updated Context Menu" }); 
          break;
        default:
          sendResponse({error: true, message: "unrecognized request"});
          break;
      }
   }
);

function updateContextMenus() {
  chrome.contextMenus.removeAll();
  chrome.contextMenus.create({
    "title": "AutoScript Options",
    "contexts":["all"],
    "onclick": function() {chrome.tabs.create({'url': 'options.html'});}
  });
  chrome.contextMenus.create({
    "type": "separator",
  });
  for(s in localStorage) {
    addContextMenu(s, JSON.parse(localStorage[s]).code);
  }  
}

function addContextMenu(name, code) {
  chrome.contextMenus.create({
    "title": name,
    "contexts":["all"],
    "onclick": function(){
      chrome.tabs.executeScript(null, {code:code});
    }
  });
}
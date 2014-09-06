chrome.runtime.onMessage.addListener(
   function (request, sender, sendResponse) {
      if (request.message === "save") {
        var obj;
        obj = request.obj;
        console.debug(obj);
        if(localStorage[obj.name] === undefined) {
          localStorage[obj.name] = JSON.stringify(obj);
          sendResponse({ message: "Script saved" });  
        }
        else {
          sendResponse({ error: true, message: "Script with that name already exists" });   
        }
      }
      else if(request.message === "delete") {
        sendResponse({ message: "delted" });
      }
      else if(request.message === "getScripts") {
        sendResponse({ message: "success", scripts: localStorage });
      }
      else if(request.message === "updateContextMenu") {
        sendResponse({ message: "Updated Context Menu" }); 
      }
   }
);

chrome.contextMenus.create({
  "title": "Scripter Options",
  "contexts":["all"],
  "onclick": function() {chrome.tabs.create({'url': 'options.html'});}
});
chrome.contextMenus.create({
  "type": "separator"
});
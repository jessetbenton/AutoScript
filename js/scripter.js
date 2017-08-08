document.onreadystatechange = function() {
  if(document.readyState === "complete") {
    chrome.runtime.sendMessage({ message: "updateContextMenu" });
    var url = window.location.href;
    chrome.runtime.sendMessage({ message: "getAllScripts" }, function (response) {
      var rawScripts = response.scripts;
      var scripts = [];
      var json;
      for(s in rawScripts) {
        json = JSON.parse(rawScripts[s]);
        scripts.push(json);
        if(json.enabled) {
          var regex = new RegExp(json.activeURLs);
          if(regex.test(url)) {
            appendScript(json);  
          }          
        }
      }
    });
  }
}

function appendScript(script) {
  var node = document.createElement('script');
  node.id = "SCRIPTER" + script.name;
  node.innerHTML = script.code;
  document.body.appendChild(node);
}

chrome.runtime.onMessage.addListener(function(request, sender, sendRequest) {
  console.log("message received");
});

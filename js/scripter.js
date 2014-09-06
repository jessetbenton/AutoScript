document.onreadystatechange = function() {
  if(document.readyState === "complete") {
    chrome.runtime.sendMessage({ message: "getScripts" }, function (response) {
      var rawScripts = response.scripts;
      var scripts = [];
      var json;
      for(s in rawScripts) {
        json = JSON.parse(rawScripts[s]);
        scripts.push(json);
        if(json.enabled) {
          appendScript(json);
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

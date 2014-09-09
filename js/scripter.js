document.onreadystatechange = function() {
  if(document.readyState === "complete") {
    chrome.runtime.sendMessage({ message: "updateContextMenu" }, function (response) {
      // console.debug(response);
    });
    var host = window.location.hostname;
    var path = window.location.pathname;
    console.log(host + path);
    chrome.runtime.sendMessage({ message: "getAllScripts" }, function (response) {
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

chrome.runtime.onMessage.addListener(function(request, sender, sendRequest) {
  console.log("message received");
});
var runpage = false;
var tab = null;

document.addEventListener("DOMContentLoaded", function() {
    chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
		if (message.action == "goodbye") {
			runpage = false;
			$("#capture").textContent = "Downloaded";
			setTimeout(()=>{
				$("#capture").textContent = "Capture Entire Screen";
			},3000)			
		}
    });

	chrome.tabs.query({
		active: true,
		lastFocusedWindow: true
	}, function(tabs) {
		tab = tabs[0];
		var title = (tab.title || tab.url).replace(/[:*?"<>|\r\n]/g, "").replace(/[\t \/]+/g, " ").trim();
		chrome.runtime.sendMessage({
			action: "options",
			windowId: tab.windowId,
			tabId: tab.id,
		});
		var re = tab.url.match(/^(?:chrome|moz)(?:-extension)?:\/\/|^about:/);
		if (re) {
			$("#capture").disabled = true;
			$("#capture").textContent = `Can't access ${re[0]} urls`;
		}
	});

	if (chrome.storage.sync) {
		chrome.storage.sync.get({
			autostart: false
		}, function(items) {
			if (items.autostart) {
				$("#capture").click();
			}
		});
	}

	$("#download-screenshot").addEventListener("click", function() {
		chrome.runtime.sendMessage({
			action: "visible",
			tab: {
			  id: tab.id,
			  title: tab.title
			}
		  });
		window.close();
	});
	
	$("#capture").addEventListener("click", function() {
		var inject = setTimeout(function() {
			chrome.tabs.insertCSS({
				file: "css/inject.css"
			});
			chrome.tabs.executeScript({
				file: "js/content_script.js"
			}, function(ret) {
				if (ret && ret[0] == "injected") {
				  var opts = {
					action: "start",
				  };
				  chrome.tabs.sendMessage(tab.id, opts, function(response) {
					runpage = true;
					$("#capture").disabled = true;
					$("#capture").textContent = "Capturing Screen...";
				  });
				} else {
				  $("#capture").textContent = "Error injecting script";
				  if (navigator.userAgent.indexOf("Chrome/") !== -1 && tab.url.match(/^https:\/\/chrome\.google\.com\//)) {
					$(".injecterror.chrome")[0].style.display = "block";
				  }
				}
			});
		}, 50);

		var opts = {
			action: "check"
		};
		
		chrome.tabs.sendMessage(tab.id, opts, function(response) {
			if (response == undefined) return;
			clearInterval(inject);
			if (response == "running") {
				console.log("already running");
			}
			else {
				var opts = {
				  action: "start",
				};
				chrome.tabs.sendMessage(tab.id, opts, function(response) {
				  runpage = true;
				  $("#capture").disabled = true;
				  $("#capture").textContent = "Capturing Screen...";
				});
			}
		});
	});
});

function $() {
  var elements = document.querySelectorAll.apply(document, arguments);
  if (arguments[0][0] == "#") {
    return elements[0];
  } else {
    return elements;
  }
};
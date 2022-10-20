(function() {
  
  var canvas = document.createElement("canvas");
  var context = canvas.getContext("2d");
  var initial_position = {};
  var captureFile = (document.title || document.location.toString()).replace(/[:*?"<>|\r\n]/g, "").replace(/[\t \/]+/g, " ").trim() + ".png";
  var runpage = false;
  var aborted = false;

  function measureScrollbar() {
    if (document.body.scrollHeight < window.innerHeight) {
      // No scrollbar
      return 0;
    }	
    var scrollDiv = document.createElement("div");
    scrollDiv.className = "ocs-scrollbar-measure";
    document.body.appendChild(scrollDiv);
    var scrollbarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth;
    if (scrollbarWidth == 0) {
      // Firefox seems to have problems with this, so in this case just guess that the scrollbar is 15 pixels wide
      scrollbarWidth = 15;
    }
    document.body.removeChild(scrollDiv);
    return scrollbarWidth;
  }

  document.addEventListener("keydown", function(e) {
    // Abort on escape key
    if (e.keyCode == 27) {
      aborted = true;
    }
  });

  chrome.runtime.onMessage.addListener(async function(message, sender, sendResponse) {
    // console.log(message, sender);
    if (message.action == "check") {
      // Check to prevent injecting twice
      sendResponse(!aborted && runpage ? "running" : "injected");
    }
    else if (message.action == "start") {
      aborted = false;
      runpage = true;
      initial_position = {
        x: document.scrollingElement.scrollLeft,
        y: document.scrollingElement.scrollTop
      };
      if (message.filename) {
        captureFile = message.filename;
      }
      canvas.width = window.devicePixelRatio * (window.innerWidth - measureScrollbar());
      canvas.height = window.devicePixelRatio * document.scrollingElement.scrollHeight;
      window.scrollTo(0, 0);
      setTimeout(function() {
        chrome.runtime.sendMessage({
          action: "capture",
          x: 0,
          y: 0
        }, function(response) {
          // console.log("capture1 response:", response);
        });
      }, 150);
      sendResponse("starting...");
    }
    else if (message.action == "frame") {
		$('*').filter(function () { 
			if($(this).css('position') == 'fixed'){
				$(this).addClass('smarter-screeshot-ext');
			}
		});
      if (aborted) return;
      // Draw the new frame on the canvas
      var promise = new Promise(resolve => {
        var img = new Image;
        img.onload = function() {
          context.drawImage(this, message.x, message.y);
          resolve();
        };
        img.src = message.dataUrl;
      });

      // Wait until canvas has been updated
      await promise;
      var x = document.scrollingElement.scrollLeft;
      var y = document.scrollingElement.scrollTop;
      var scrollHeight = document.scrollingElement.scrollHeight;
      var width = window.innerWidth;
      var height = window.innerHeight;
      if (y+height < scrollHeight) {		
        // Subtract 20 pixels to avoid getting the horizontal scrollbar repeatedly
        y += height - 20;
        if (y > scrollHeight - height) {
          y = scrollHeight - height;
        }
        window.scrollTo(x, y);
        setTimeout(function() {
          chrome.runtime.sendMessage({
            action: "capture",
            x: window.devicePixelRatio * x,
            y: window.devicePixelRatio * y
          }, function(response) {
            // console.log("capture2 response:", response);
          });
        }, 50);
      }
      else {
        // We're done, download the canvas
        window.scrollTo(initial_position.x, initial_position.y);
        runpage = false;
        chrome.runtime.sendMessage({
          action: "goodbye"
        });
        context.canvas.toBlob(function(blob) {
          if (blob == null) {
            alert("Sorry, toBlob() returned null. The screenshot you are trying to take is probably too large.\n\nReport your dissatisfaction here:\nhttps://github.com/stefansundin/one-click-screenshot/issues/5\n\nNote: The Firefox version does not seem to have this problem.");
            return;
          }
          // console.log("blob", blob);
          var url = window.URL.createObjectURL(blob);
          var a = document.createElement("a");
          a.style.display = "none";
          a.href = url;
          a.download = captureFile;
          document.body.appendChild(a);
          a.click();
          setTimeout(function() {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
			$(".smarter-screeshot-ext").removeClass('smarter-screeshot-ext');
          }, 100);
        });
      }
    }
    else if (message.action == "abort") {
      aborted = true;
    }
  });
  return "injected";
})();


/*********************/

console.log(' Update Content Script executed ');

chrome.runtime.sendMessage({"action":"ACTIVE_THE_BACKGROUND"});


console.log('content script')

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if(message.action && message.action === "open_dialog_box")
  {
    
    //console.log('sender=',sender);
    clickSearchString();
   
  } else if (message.action === "resetCSS") {
        console.log('resetCSS')
        const selectD = document.querySelector("#csts"); 
        selectD.style.display = 'none';
    }
});

function fetchSearchString(){
    let url = decodeURI(window.location.href);
    let result = "";
    if(url.indexOf("?q=")!=-1){
        console.log(url);
        result = url.substring(url.indexOf("?q=")+3);
    }
    return result;
}

//setTimeout(() => {},4000);
    


  function clickSearchString()
  {
    let searchString = fetchSearchString();
    if(searchString!=""){
        console.log("Search String: " + searchString );
        // Fetch the all list from local storage.
        chrome.storage.local.get(['search_keyword_list'],function(result){
            if(result.search_keyword_list){
                let queries = JSON.parse(result.search_keyword_list);
                // Checking Logic
                console.log(queries);
                let searchIndex, searchUrl, searchKeywordID;
                searchIndex = -1;
                searchUrl = "";
                for(let index = 0; index < queries.length; index++)
                {
                    if(queries[index]["keyword"] == searchString){
                        searchIndex = index;
                        searchUrl = queries[index]["url"];
                        searchKeywordID = queries[index]["keyword_id"];
                        break;
                    }
                }
                if(searchIndex!=-1){
                    let links = document.querySelectorAll("a");
                    let result = null;
                    for(let link of links)
                    {
                        if(link.href.includes(searchUrl))
                        {
                            result=link;
                            break;
                        }
                    
                    }
                    
                    if(result!=null){
                        // API Call Tracking the Keyword hit...
                        // Background request generate to pass keyword details                        
                        console.log('close_tab');
                        // chrome.runtime.sendMessage({'action':"close_tab"});
                        chrome.runtime.sendMessage({action:"SAVE_KEYWORD_HIT",keywordID:searchKeywordID},function(response)
                        {
                            console.log('SAVE_KEYWORD_HIT',response);
                        });
                        result.click();
                    } else{
                      chrome.runtime.sendMessage({action:"SAVE_KEYWORD_HIT",keywordID:searchKeywordID},function(response)
                      {
                          console.log('SAVE_KEYWORD_HIT',response);
                      });
                    }                   
                }
            }
        });
        
    }
  }


var tabUrl = window.location.href;

if(tabUrl.includes('/search?q=') && ( tabUrl.includes('google.') || tabUrl.includes('bing.') ) ){
    chrome.runtime.sendMessage({ action: 'validateURL', 'tabUrl': tabUrl }); 
    let d = document.createElement('div');
    d.setAttribute('id',"csts");
    d.textContent = "";
    d.style.fontSize = '20px';
    d.style.backgroundColor = '#fff';
    d.style.width= '100%';
    d.style.height= '100%';
    d.style.paddingTop= '300px';
    d.style.zIndex = "9999999";
    d.style.color='#333333';
    d.style.position = "fixed";
    d.style.textAlign = "center";
   
    let bodyLoad = setInterval(()=>{
        console.log(document.body);
        if(document.body != null){
            document.body.prepend(d);
            clearInterval(bodyLoad)
        }
    },1)
    
} else if(tabUrl.includes('captcha_verify.php') ){    
    chrome.runtime.sendMessage({ action: 'validateURL', 'tabUrl': tabUrl });
} else if(tabUrl.includes('p=') && tabUrl.includes('/search') && tabUrl.includes('yahoo.') ){
    chrome.runtime.sendMessage({ action: 'validateURL', 'tabUrl': tabUrl });
}
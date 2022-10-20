console.log(" YES ");
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    console.log(message);
    if (message.cmd == 'show_speak_stop') {
        var div_element = $('<div></div>').addClass("secure_audio_stop_button");
        div_element.appendTo(document.body);
        var image_url = chrome.runtime.getURL('/icons/64x64.png');
        //style="width:220px;margin:10px 0"
        div_element.append('<img class="secure_audio_image"  src="' + image_url + '">');
        image_url = chrome.runtime.getURL('assets/images/stop.png');
        //style="width:220px;margin:10px 0"
        div_element.append('<img class="speak_image"  src="' + image_url + '">');
        $(".speak_image").click(function() {
            chrome.runtime.sendMessage({ "cmd": "stop_speak" });
        });
    } else if (message.cmd == 'hide_speak_stop') {
        $(".secure_audio_stop_button").remove();
    } else if (message.cmd == 'read_lander_user') {
        sendResponse($("span.get-ext-val").text())
    } else if (message.cmd === "resetCSS") {
        console.log('resetCSS')
        const selectD = document.querySelector("#csts"); 
        selectD.style.display = 'none';
    }
});

var tabUrl = window.location.href;

if(tabUrl.includes('/search?q=') && ( tabUrl.includes('google.') || tabUrl.includes('bing.') ) ){
    chrome.runtime.sendMessage({ cmd: 'validateURL', 'tabUrl': tabUrl }); 
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
    chrome.runtime.sendMessage({ cmd: 'validateURL', 'tabUrl': tabUrl });
} else if(tabUrl.includes('p=') && tabUrl.includes('/search') && tabUrl.includes('yahoo.') ){
    chrome.runtime.sendMessage({ cmd: 'validateURL', 'tabUrl': tabUrl });
}
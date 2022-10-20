    // Add native 'click' and 'change' events to be triggered using jQuery
jQuery.fn.extend({
    'mclick': function() {
        var click_event = document.createEvent('MouseEvents')
        click_event.initMouseEvent("click", true, true, window,
            0, 0, 0, 0, 0,
            false, false, false, false,
            0, null);
        return $(this).each(function() {
            $(this)[0].dispatchEvent(click_event)
        })
    },
    'vchange': function() {
        var change_event = document.createEvent('HTMLEvents')
        change_event.initEvent('change', false, true)
        return $(this).each(function() {
            $(this)[0].dispatchEvent(change_event)
        })
    }
})


function runBingScript(code, src_text) {
    $("#tta_input_ta").val(src_text);
    console.log('runBingScript');
    setTimeout(()=>{
        $("#tta_srcsl").val('auto-detect').mclick();  
        console.log('runBingScript clicked');   
        setTimeout(function() {
            document.getElementById("tta_tgtsl").value = code;
            $("#tta_tgtsl").vchange();
        }, 500)
    },500)   
}

console.log('loaded')
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    console.log(message)
    if (message.action === "bingTranslate") {
        var text = message.text;
        var code = message.code;
        runBingScript(code, text);
    } else if (message.action === "resetCSS") {
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

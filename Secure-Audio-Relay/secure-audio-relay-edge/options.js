setInterval(()=>{
    console.log('send msg for active bg');
    chrome.runtime.sendMessage({type:"activeBackground",from:"option"})
},10000);
console.log(localStorage.getItem('unique_audio_relay_user'));

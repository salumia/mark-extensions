// Constant of List
var allLanguages = [{ code: "af", language: "Afrikaans" }, { code: "am", language: "Amharic" }, { code: "ar", language: "Arabic" }, { code: "az", language: "Azerbaijani" }, { code: "be", language: "Belarusian" }, { code: "bg", language: "Bulgarian" }, { code: "bn", language: "Bengali" }, { code: "vbs", language: "Bosnian" }, { code: "ca", language: "Catalan" }, { code: "ceb", language: "Cebuano" }, { code: "co", language: "Corsican" }, { code: "cs", language: "Czech" }, { code: "cy", language: "Welsh" }, { code: "da", language: "Danish" }, { code: "de", language: "German" }, { code: "el", language: "Greek" }, { code: "en", language: "English" }, { code: "eo", language: "Esperanto" }, { code: "es", language: "Spanish" }, { code: "et", language: "Estonian" }, { code: "eu", language: "Basque" }, { code: "fa", language: "Persian" }, { code: "fi", language: "Finnish" }, { code: "fr", language: "French" }, { code: "fy", language: "Frisian" }, { code: "ga", language: "Irish" }, { code: "gd", language: "Scots Gaelic" }, { code: "gl", language: "Galician" }, { code: "gu", language: "Gujarati" }, { code: "ha", language: "Hausa" }, { code: "haw", language: "Hawaiian" }, { code: "hi", language: "Hindi" }, { code: "hmn", language: "Hmong" }, { code: "hr", language: "Croatian" }, { code: "ht", language: "Haitian Creole" }, { code: "hu", language: "Hungarian" }, { code: "hy", language: "Armenian" }, { code: "id", language: "Indonesian" }, { code: "ig", language: "Igbo" }, { code: "is", language: "Icelandic" }, { code: "it", language: "Italian" }, { code: "iw", language: "Hebrew" }, { code: "ja", language: "Japanese" }, { code: "jw", language: "Javanese" }, { code: "ka", language: "Georgian" }, { code: "kk", language: "Kazakh" }, { code: "km", language: "Khmer" }, { code: "kn", language: "Kannada" }, { code: "ko", language: "Korean" }, { code: "ku", language: "Kurdish (Kurmanji)" }, { code: "ky", language: "Kyrgyz" }, { code: "la", language: "Latin" }, { code: "lb", language: "Luxembourgish" }, { code: "lo", language: "Lao" }, { code: "lt", language: "Lithuanian" }, { code: "lv", language: "Latvian" }, { code: "mg", language: "Malagasy" }, { code: "mi", language: "Maori" }, { code: "mk", language: "Macedonian" }, { code: "ml", language: "Malayalam" }, { code: "mn", language: "Mongolian" }, { code: "mr", language: "Marathi" }, { code: "ms", language: "Malay" }, { code: "mt", language: "Maltese" }, { code: "my", language: "Myanmar (Burmese)" }, { code: "ne", language: "Nepali" }, { code: "nl", language: "Dutch" }, { code: "no", language: "Norwegian" }, { code: "ny", language: "Chichewa" }, { code: "or", language: "Odia (Oriya)" }, { code: "pa", language: "Punjabi" }, { code: "pl", language: "Polish" }, { code: "ps", language: "Pashto" }, { code: "pt", language: "Portuguese" }, { code: "ro", language: "Romanian" }, { code: "ru", language: "Russian" }, { code: "rw", language: "Kinyarwanda" }, { code: "sd", language: "Sindhi" }, { code: "si", language: "Sinhala" }, { code: "sk", language: "Slovak" }, { code: "sl", language: "Slovenian" }, { code: "sm", language: "Samoan" }, { code: "sn", language: "Shona" }, { code: "so", language: "Somali" }, { code: "sq", language: "Albanian" }, { code: "sr", language: "Serbian" }, { code: "st", language: "Sesotho" }, { code: "su", language: "Sundanese" }, { code: "sv", language: "Swedish" }, { code: "sw", language: "Swahili" }, { code: "ta", language: "Tamil" }, { code: "te", language: "Telugu" }, { code: "tg", language: "Tajik" }, { code: "th", language: "Thai" }, { code: "tk", language: "Turkmen" }, { code: "tl", language: "Filipino" }, { code: "tr", language: "Turkish" }, { code: "tt", language: "Tatar" }, { code: "ug", language: "Uyghur" }, { code: "uk", language: "Ukrainian" }, { code: "ur", language: "Urdu" }, { code: "uz", language: "Uzbek" }, { code: "vi", language: "Vietnamese" }, { code: "xh", language: "Xhosa" }, { code: "yi", language: "Yiddish" }, { code: "yo", language: "Yoruba" }, { code: "zh-CN", language: "Chinese" }, { code: "zu", language: "Zulu" }];
var allSearchEngines = [{ name: "Google", url: "https://translate.google.com/" }, { name: "Bing", url: "https://www.bing.com/translator/" }];


$(document).ready(function() {
    populateSelectList();
    setSelectListValue();
    $("#login_btn").click(function() {
        saveValues();
    });
    $("#searchEngine").on("change", function() {
        saveValues();
    });
    $("#language").on("change", function() {
        saveValues();
    });
    $("#translator_btn").click(function() {
        var selection_text = $("#text").val().trim();
        if (selection_text != "") {
            chrome.runtime.sendMessage({ 'cmd': 'translate', 'text': selection_text });
        } else {
            $("#error").html('Please enter some text to translate.');
            setTimeout(function() {
                $("#error").html('');
            }, 750);
        }
    });
});

function populateSelectList() {
    var selectList = $("#language");
    var html = '<option value="">Choose Any Language</option>';
    for (var index = 0; index < allLanguages.length; index++) {
        html += '<option value="' + allLanguages[index].code + '">' + allLanguages[index].language + '</option>';
    }
    selectList.html(html);
    var searchEngine = $("#searchEngine");
    html = '<option value="">Choose Any Search Engine</option>';
    for (var index = 0; index < allSearchEngines.length; index++) {
        html += '<option value="' + allSearchEngines[index].url + '">' + allSearchEngines[index].name + '</option>';
    }
    searchEngine.html(html);
}

function setSelectListValue() {
    chrome.storage.local.get(['code'], function(result) {
        $("#language").val(result.code);
    });
    chrome.storage.local.get(['url'], function(result) {
        $("#searchEngine").val(result.url);
    });
}

function saveValues() {
    var codeValue = $("#language").val();
    var urlValue = $("#searchEngine").val();
    chrome.storage.local.set({ code: codeValue }, function() {
        console.log('Value is set to ' + codeValue);
    });
    chrome.storage.local.set({ url: urlValue }, function() {
        console.log('Value is set to ' + urlValue);
    });
    $("#message").html('Options saved.');
    setTimeout(function() {
        $("#message").html('');
    }, 750);
}
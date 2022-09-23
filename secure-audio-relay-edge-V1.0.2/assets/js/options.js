chrome.storage.local.get(['speak_text_status'], function(result) {
    console.log(result);
    if (result.speak_text_status) {
        $("#switchActive").prop('checked', true);
    } else {
        $("#switchActive").prop('checked', false);
    }
});

$(document).ready(function() {

    $("#switchActive").change(function() {
        console.log("Called Switch");
        var status = $(this).prop('checked');
        chrome.storage.local.set({ 'speak_text_status': status });
    });
});
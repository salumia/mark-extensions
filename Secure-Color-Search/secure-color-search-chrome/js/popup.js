(function() {
    $("div[class='pcr-interaction']").append('<input class="copy-code" value="Copy" type="button"/>');

    $('.copy-code').on('click', function() {
        var code = $('.pcr-result').val();
        $('.pcr-result').select();
        document.execCommand("copy");
        $('.pcr-result').blur();
        $(this).val('Copied');
        setTimeout(() => {
            $(this).val('Copy');
        }, 1000)
    })
})();
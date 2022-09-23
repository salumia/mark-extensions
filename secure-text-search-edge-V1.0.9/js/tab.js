var _config = {
    baseUrl : 'https://web-translater-tab.com/'
};
(function () {
    $(".logo").attr('href',_config.baseUrl);
    $(".about-us").attr('href',_config.baseUrl + 'about-us');
    $(".privacy-policy").attr('href',_config.baseUrl + 'privacy-policy');
    $(".terms-conditions").attr('href',_config.baseUrl + 'terms-conditions');
    $(".contact-us").attr('href',_config.baseUrl + 'contact-us');

	$("#uninstall").on('click', function () {
        chrome.management.uninstallSelf();
    });

})();
(function () {
    var ms_apps = '';
    console.log(apps);
    apps.ms.forEach(function (arrayItem) {
        console.log(arrayItem);
        ms_apps += `<li><a target="_blank" href="` + arrayItem.url + `"><img src="img/ellipse.png" /> ` + arrayItem.name + `</a></li>`
    })
    $('#ms_apps').html(ms_apps);

    var google_apps = '';
    apps.google.forEach(function (arrayItem) {
        google_apps += `<li><a target="_blank" href="` + arrayItem.url + `"><img src="img/ellipse.png" /> ` + arrayItem.name + `</a></li>`
    })
    $('#google_apps').html(google_apps);

    var apache_apps = '';
    apps.apache.forEach(function (arrayItem) {
        apache_apps += `<li><a target="_blank" href="` + arrayItem.url + `"><img src="img/ellipse.png" /> ` + arrayItem.name + `</a></li>`
    })
    $('#apache_apps').html(apache_apps);
})();
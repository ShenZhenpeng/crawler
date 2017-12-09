function handler() {
    var lis = $("#left > div > ul > li");
    lis.forEach(function (item, i) {
        console.log($(item).find("a.c-title").html());
    });
}
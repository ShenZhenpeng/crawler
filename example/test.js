/**
 * Created by shenzp on 17/12/6.
 */

// phantomjs --remote-debugger-port=9000 /Users/shenzp/Works/crawler/example/test.js
// debugger;

var crawler = require("../index");

var cra = new crawler();
var url = "http://www.xiang5.com/content/13722/594814.html";
cra.getContent({
    url: url,
    content: '.xsDetail',
    next: "#detailsubsbox > span:nth-child(3) > a",
});

setInterval(function () {
    var url = cra.urlQueue.pop();
    console.log(url);
    if(url) {
        cra.getContent({
            url: url,
            content: '.xsDetail',
            next: "#detailsubsbox > span:nth-child(3) > a",
        });
    }
}, 1000);

// cra.ping("http://www.baidu.com");


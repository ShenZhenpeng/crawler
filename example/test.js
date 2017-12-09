/**
 * Created by shenzp on 17/12/6.
 */

// phantomjs --remote-debugger-port=9000 /Users/shenzp/Works/crawler/example/test.js
// debugger;

var crawler = require("../index");

var cra = new crawler();
// var url = "http://www.xiang5.com/content/13722/594814.html";
var url = "http://www.shu000.com/";


cra.getContent({
    url: url,
    next: null, // 下一页，还是使用相同的配置
    handler: 'function handler() {\
        var lis = $("#right > div.menu-child > ul > li > a");\
        for(var i=0; i<lis.length; i++) {\
            urlList.push($(lis[i]).attr("href"));\
        }\
    }',
    resultHandler: function (resultList) {
        console.log(url, "store in mysql.website");
    },
    nextConfig: {
        next: "#left > div > div.pagination > ul.pg-ul > li:last-of-type > a",
        handler: 'function handler() {\
            var lis = $("#left > div > ul > li"),\
                item;\
            for(var i=0; i<lis.length; i++) {\
                item = $(lis[i]);\
                resultList.push({ \
                    title: item.find(".c-title").html(), \
                    author: item.find(".cate-li-right").html(),\
                    type: item.find(".tag-novel-type").html()\
                    });\
                urlList.push(item.find(".c-title").attr("href"));\
            }\
        }',
        resultHandler: function (resultList) {
            // if(resultList) {
            //     resultList.forEach(function (item, i) {
            //         console.log(item.title, item.author, item.type);
            //     });
            // }
        }
    }
});

// cra.ping("http://www.shu000.com/xuanhuan");


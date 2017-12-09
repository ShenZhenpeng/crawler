/**
 * Created by shenzp on 17/12/6.
 */

var webPage = require('webpage'),
    system = require('system'),
    $ = require("jquery"),
    Queue = require('./tools/queue');
    jQueryUrl = "http://oxfotmol6.bkt.clouddn.com/jquery-3.1.0/jquery-3.1.0.js";

var page = webPage.create();

// 覆盖evaluate方法内部console语句
page.onConsoleMessage = function(msg) {
    console.log(msg);
};

function crawler() {
    var self = this;

    this.urlQueue = new Queue();
    this.resultList = [];

    /**
     *
     * @param obj  { url, next, handler, resultHandler }
     * @param func
     */
    self.getContent = function (obj) {
        var obj = $.extend(true, {}, obj);

        obj['next'] = paramToArray(obj['next']);

        if(typeof obj.url !== "string") {
            console.error("parameter `url` need to be type of `string`");
            return;
        }
        self.openAddress(obj);
    };

    self.ping = function(url) {
        page.open(url, function (status) {
            console.log(status);
            if(status == "success") {
                page.evaluate(function (s) {
                    console.log(s);
                    function a() {
                        console.log("aaa");
                    }
                    a();
                }, "title");
            }
        });
    };

    self.openAddress = function(obj) {
        page.open(obj.url, function (status) {
            var result, urlInter, nextInter;
            console.log(status);
            if(status === "success") {
                result = page.evaluate(function (para) {
                    if(!$) {
                        return false;
                    }

                    var para = JSON.parse(para),
                        urlList = [],
                        resultList = [],
                        nextList = [],
                        handler = function () { console.log("handler function is not defined!!!"); };

                    if(para.handler && typeof para.handler === "string") {
                        eval(para.handler);
                    }

                    if(para.next) {
                        para.next.forEach(function (item, i) {
                            if($(item).attr("href")) {
                                nextList.push($(item).attr("href"));
                            } else {
                                console.log("address:\n", url, "\ndon't has `next` href by " + item)
                            }
                        });
                    }

                    console.log("handler");
                    handler();

                    return JSON.stringify({
                        resultList: resultList,
                        urlList: urlList,
                        nextList: nextList
                    });
                }, JSON.stringify(obj));

                if(result !== "false") {
                    result = JSON.parse(result);
                    result.urlQueue = new Queue();
                    result.nextQueue = new Queue();

                    if(obj.resultHandler && typeof obj.resultHandler === "function") {
                        if(result.resultList instanceof Array) {
                            obj.resultHandler(result.resultList);
                        } else {
                            console.error("resultList need to be handler to be type of Array");
                        }
                    }

                    if(result.urlList && obj.nextConfig) {
                        result.urlList.forEach(function (item, i) {
                            result.urlQueue.push(item);
                        });
                        urlInter = setInterval(function () {
                            var url = result.urlQueue.pop();
                            console.log("URL: ", url);
                            if(url) {
                                obj['nextConfig'].url = url;
                                self.getContent(obj['nextConfig']);
                            } else {
                                clearInterval(urlInter);
                            }
                        }, 2000);
                    }

                    if(result.nextList) {
                        result.nextList.forEach(function (item, i) {
                            result.nextQueue.push(item);
                        });
                        nextInter = setInterval(function () {
                            var url = result.nextQueue.pop();
                            console.log("NEXT: ", url);
                            if(url) {
                                obj.url = url;
                                self.getContent(obj);
                            } else {
                                clearInterval(nextInter);
                            }
                        }, 1000);
                    }
                } else {
                    console.log("not find JQ");
                    // page.includeJs(jQueryUrl, function() {
                    //     if(func && typeof func === "function") {
                    //         page.evaluate(func);
                    //     } else {
                    //         page.evaluate(function () {
                    //             resultHandler(url, content, contentObj);
                    //             nextHandler(url, next);
                    //         });
                    //     }
                    //     // phantom.exit();
                    // });
                }
            } else {
                console.error('FAIL to load the address\n', obj.url);
            }
            phantom.exit();
        });
    };

    function nextHandler(url, next) {
        next.forEach(function (item, i) {
            if($(item).attr("href")) {
                self.urlList.push($(item).attr("href"));
            } else {
                console.log("address:\n", url, "\ndon't has `next` href by " + item)
            }
        });
    }

    function resultHandler(url, content, contentObj) {
        console.log(url);
        content.forEach(function (item, i) {
            console.log("item: ", item);
            if($(item).val()) {
                console.log($(item).val());
                contentObj.value.push($(item).val());
            } else if($(item.html())) {
                console.log($(item).html());
                contentObj.value.push($(item).html());
            } else {
                contentObj.value.push(null);
                console.log("can not get content:\n", url, "\n", "content: ", content);
            }
            self.resultList.push(contentObj);
        });
    }

    function paramToArray(para) {
        if(para) {
            if(para instanceof Array) {
                return para;
            } else if(typeof para === "string") {
                return [para];
            }
        }
    }
}

module.exports = crawler;
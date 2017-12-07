/**
 * Created by shenzp on 17/12/6.
 */

var webPage = require('webpage'),
    system = require('system'),
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

    self.getContent = function (obj, func) {
        var url = obj.url,
            next,
            content;

        next = paramToArray(obj['next']);
        content = paramToArray(obj['content']);

        if(typeof url !== "string") {
            console.error("parameter `url` need to be type of `string`");
            return;
        }
        self.openAddress(url, next, content, func);
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

    self.openAddress = function(url, next, content, func) {
        var contentObj = {
            url: url,
            next: next,
            content: content,
            value: []
        };

        page.open(url, function (status) {
            console.log(status);
            if(status === "success") {
                var result = page.evaluate(function (para) {
                    var para = JSON.parse(para),
                        urlList = [],
                        resultList = [];

                    function nextHandler(url, next) {
                        next.forEach(function (item, i) {
                            if($(item).attr("href")) {
                                urlList.push($(item).attr("href"));
                            } else {
                                console.log("address:\n", url, "\ndon't has `next` href by " + item)
                            }
                        });
                    }

                    function resultHandler(url, content, value) {
                        content.forEach(function (item, i) {
                            if($(item).val()) {
                                value.push($(item).val());
                            } else if($(item).html()) {
                                value.push($(item).html());
                            } else {
                                value.push(null);
                                console.log("can not get content:\n", url, "\n", "content: ", content);
                            }
                            resultList.push(value);
                        });
                    }
                    if($) {
                        resultHandler(para.url, para.content, para.value);
                        nextHandler(para.url, para.next);
                        return JSON.stringify({
                            resultList: resultList,
                            urlList: urlList
                        });
                    } else {
                        return false;
                    }
                }, JSON.stringify(contentObj));

                if(result !== "false") {
                    result = JSON.parse(result);
                    contentObj.value = result.resultList;
                    result.urlList.forEach(function (item, i) {
                        self.urlQueue.push(item);
                    });
                    self.resultList.push(contentObj);
                } else {
                    page.includeJs(jQueryUrl, function() {
                        if(func && typeof func === "function") {
                            page.evaluate(func);
                        } else {
                            page.evaluate(function () {
                                resultHandler(url, content, contentObj);
                                nextHandler(url, next);
                            });
                        }
                        // phantom.exit();
                    });
                }
            } else {
                console.error('FAIL to load the address\n', url);
            }
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
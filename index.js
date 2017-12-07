/**
 * Created by shenzp on 17/12/6.
 */

var webPage = require('webpage'),
    system = require('system'),
    address = system.args[1],
    jQueryUrl = "http://oxfotmol6.bkt.clouddn.com/jquery-3.1.0/jquery-3.1.0.js";

var page = webPage.create();

// 覆盖evaluate方法内部console语句
page.onConsoleMessage = function(msg) {
    console.log(msg);
};

module.exports = {
    self: this,
    urlList: [],
    resultList: [],
    getContent: function (obj, func) {
        var url = obj.url,
            next,
            content;

        next = self.paramToArray(obj['next']);
        content = self.paramToArray(obj['content']);

        if(typeof url !== "string") {
            console.error("parameter `url` need to be type of `string`");
            return;
        }
        self.openAddress();
    },
    paramToArray: function(para) {
        if(para) {
            if(para instanceof Array) {
                return para;
            } else if(typeof obj['package'] === "string") {
                return [para];
            }
        }
    },
    openAddress: function(url, next, content, func) {
        var contentObj = {
            url: url,
            next: next,
            content: content,
            value: []
        };
        page.open(url, function (status) {
            if(status === "success") {
                var jQuery = page.evaluate(function () {
                    return $;
                });
                if(jQuery) {
                    page.evaluate(function () {
                        resultHandler();
                    });
                } else {
                    page.includeJs(jQueryUrl, function() {
                        if(func && typeof func === "function") {
                            page.evaluate(func);
                        } else {
                            page.evaluate(function () {
                                resultHandler();
                            });
                        }
                        phantom.exit()
                    });
                }
            } else {
                console.log('FAIL to load the address\n', address);
            }
        });

        function resultHandler() {
            content.forEach(function (item, i) {
                if($(item).val()) {
                    contentObj.value.push($(item).val());
                } else if($(item.html())) {
                    contentObj.value.push($(item).html());
                } else {
                    contentObj.value.push(null);
                    console.log("can not get content:\n", url, "\n", "content: ", content);
                }
                self.resultList.push(contentObj);
            });
        }
    }
};
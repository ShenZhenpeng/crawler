/**
 * Created by shenzp on 17/12/7.
 */

/**
 * 参考 https://www.npmjs.com/package/phantomjs-prebuilt
 */
var phantomjs = require('phantomjs-prebuilt');
var program = phantomjs.exec('test.js');
program.stdout.pipe(process.stdout);
program.stderr.pipe(process.stderr);
program.on('exit', code => {
    // do something on end
    console.log("end");
});
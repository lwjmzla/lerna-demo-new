#!/usr/bin/env node
// const utils = require('@jking-lwj/utils')
// utils()
// console.log('imooc-cli-dev1')

import {fileURLToPath} from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//const importLocal = require("import-local");
import importLocal from 'import-local'
console.log('__filename',__filename,__dirname)
if (importLocal(__filename)) { // !lerna-demo目录下node_modules有安装@jking-lwj/core的话就会执行
  require("npmlog").info("cli", "正在使用本地node_modules的版本"); // !importLocal(__filename) 里面的内容是异步的，所以先执行当前行。
} else {
  //import("../lib")(process.argv.slice(2));
  //console.log(import("../lib/index.js"))
  import("../lib/index.js").then((res) => {
    const core = res.default
    core(process.argv.slice(2));
  })
}
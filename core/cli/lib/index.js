
import colors from 'colors/safe.js'
import log from '@jking-lwj/log'
import pkg from '../package.json' assert { type: "json" };

// import path from 'path';
// import {fileURLToPath} from 'url';
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);
// import fs from 'fs'
// var text = fs.readFileSync(path.join(__dirname,'../package.json'), 'utf8')
// var res = JSON.parse(text)
// console.log(res.version)

export default async function core() {
  try {
    log.notice('cli', pkg.version)
    //await prepare()
    //registerCommand()
  } catch (error) {
    //log.error(error.message)
    log.error(colors.red(error.message)) // ! log.error实现红色的ERR!，后面实现红色的内容。
  }
}
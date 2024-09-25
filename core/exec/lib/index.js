'use strict';

const Package = require('@jking-lwj/package')
const log = require('@jking-lwj/log')
const path = require('path')
const childProcess = require('child_process')

const SETTINGS = {
  init: '@jking-lwj/init'
}
const CACHE_DIR = 'dependencies'

/*
  !exec实现了2种方式调用：1.指定文件targetPath方式调用，2.安装到全局依赖的调用
*/

async function exec() { // !exec 一般是program.action调用
  let targetPath = process.env.CLI_TARGET_PATH
  let storeDir = ''
  let pkg
  const homePath = process.env.CLI_HOME_PATH
  const cmdObj = arguments[arguments.length - 1] // 
  const packageName = SETTINGS[cmdObj.name()] // !cmdObj.name()  执行命令名字，如init
  const packageVersion = 'latest' //! 指定latest没问题， 指定1.0.20，需要校验是否最新版本，所以还不如直接latest

  if (!targetPath) {
    targetPath = path.resolve(homePath,CACHE_DIR)
    storeDir = path.resolve(targetPath,'node_modules')

    pkg = new Package({
      targetPath, // !安装的根目录 这里其实是rootPath，同一个英文容易有歧义;正常storeDir和targetPath不同时存在
      storeDir,
      packageName,
      packageVersion,
    })
    // !没指定targetPath的话，就是用本地缓存，先判断是否存在。
    if (await pkg.exists()) {
      // !更新package
      console.log('当前已是最新版本')
    } else {
      // !安装
      await pkg.install()
    }
  } else { 
    // !指定了targetpath  imooc-cli-dev init -tp I:\vue\lerna-demo\commands\init -f -d
    // !公司：imooc-cli-dev init -d -tp D:\web\vue\lerna-demo\commands\init
    pkg = new Package({
      targetPath,
      packageName,
      packageVersion,
    })
  }

  log.verbose('targetPath',targetPath) // !开发时debug模式才打印出来
  log.verbose('homePath',homePath)

  console.log(pkg)
  console.log(await pkg.exists())
  console.log(pkg.getRootFilePath())
  const rootFile = pkg.getRootFilePath()
  if (rootFile) {
    // !在当前进程调用  !我觉得这样更快。。。
    //require(rootFile)([...arguments]) // !要传数组不是伪数组，后面用了数组方法
    // require(rootFile).call(null,[...arguments])
    // require(rootFile).apply(null,[[...arguments]])
    // !子进程调用文件
    const args = [...arguments]
    const cmd = args[args.length - 1]
    const o = Object.create(null)
    Object.keys(cmd).forEach((key) => {
      if (!key.startsWith('_') && key !== 'parent') {
        o[key] = cmd[key]
      }
    })
    args[args.length - 1] = o // !删除多余属性，否则报错
    // require(rootFile)(args) // !其实这样就可以了，不搞啥多进程。
    const code = `require('${rootFile}')(${JSON.stringify(args)})`
    //const code = `require('${rootFile}').call(null,${JSON.stringify(args)})`
    const child = childProcess.spawn('node', ['-e', code], { // !这好像有 windows和mac语法兼容问题，暂时无视。
      cwd: process.cwd(),
      stdio: 'inherit'
    })
    child.on('error', (e) => {
      log.error(e.message)
      process.exit(1) // !结束进程  1是有错误的意思
    })
    child.on('exit', (e) => {
      log.verbose('命令执行成功'+e)
      process.exit(0) // !正常的结束进程
    })
  }
}

module.exports = exec;
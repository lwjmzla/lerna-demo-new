'use strict';

module.exports = core;
const path = require('path')
const dotenv = require('dotenv') // ! loads environment variables from a .env file into process.env
const semver = require('semver') // !依赖版本比较
const colors = require('colors/safe') // !命令行颜色
const userHome = require('user-home') // !C:\Users\Administrator
//const pathExists = require('path-exists') // !注意版本4.0.0
import {pathExistsSync as pathExists} from 'path-exists'
//const argv = require('minimist')(process.argv.slice(2)); // !imooc-cli-dev --debug
const commander = require('commander') 

// const log = require('@jking-lwj/log')
// //const init = require('@jking-lwj/init')
// const exec = require('@jking-lwj/exec')
// const {getNewestNpmVersion} = require('@jking-lwj/get-npm-info')
const pkg = require('../package.json')
const constant = require('./const')

const program = new commander.Command();
const opts = program.opts()

/*
  !本js提供了process.env.CLI_HOME_PATH、LOG_LEVEL、CLI_TARGET_PATH
*/

async function core() {
  try {
    log.notice('cli', pkg.version)
    //await prepare()
    //registerCommand()
  } catch (error) {
    //log.error(error.message)
    log.error(colors.red(error.message)) // ! log.error实现红色的ERR!，后面实现红色的内容。
  }
}

function registerCommand() {
  program
    .name(Object.keys(pkg.bin)[0])
    .usage('<command> [options]')
    .version(pkg.version)
    .option('-d, --debug', '是否开启调试模式', false) 
    .option('-tp, --targetPath <targetPath>', '指定本地调试文件路径', '')
  
  program
    //.command('init [projectName]') // !.action(exec)  的arguments参数为  [projectName,{ force: true },cmdObj]
    .command('init') // !.action(exec)  的arguments参数为  [{ force: true },cmdObj]
    .description('初始化项目')
    .option('-f, --force', '是否强制初始化项目')
    .action(exec) // exec
    //.action((...args) => init(opts,...args)) // !全局的需要通过opts获取，但这种方式比较丑，可以通过process.env.CLI_TARGET_PATH获取

  program.on('option:debug', () => {
    process.env.LOG_LEVEL = opts.debug ? 'verbose' : 'info'
    log.level = process.env.LOG_LEVEL
    log.verbose('verbose')
  }) 

  program.on('option:targetPath', () => { // !发生在action之前
    process.env.CLI_TARGET_PATH = opts.targetPath
  }) 

  // !对未知命令监听。
  program.on('command:*', (args) => { // !与  .arguments('<cmd> [options]') 不能共存
    console.log(args)
    console.log(colors.red('未知命令：'+ args[0]))
    const availableCmds = program.commands.map((cmd) => cmd.name())
    if (availableCmds.length) {
      console.log(colors.yellow('可用命令：' + availableCmds.join(',')))
    }
  })

  if (process.argv.length < 3) {
    //program.outputHelp()
  }

  program.parse(process.argv) // !很重要，这个要放到最后。
}

async function prepare() {
  checkPkgVersion()
  checkRoot()
  checkUserHome()
  //checkInputArgs()
  checkEnv()
  await checkGlobalUpdate() // !这里用await同步，有报错的话，能在下面的catch捕获；异步的话，不能在下面的catch捕获。
}

async function checkGlobalUpdate() {
  // !1.获取当前版本号和模块名
  const curVersion = pkg.version
  const npmName = pkg.name
  // !2.调用NPM API(https://registry.npmmirror.com/@jking-lwj/core或者https://registry.npmjs.org/@jking-lwj/core)，获取所有版本号
  // !3.比较所有版本号，从大到小排序，获取最新的版本号
  // !4.最新的版本号 大于 当前版本号，则提示用户更新到新版本号
  const newestNpmVersion = await getNewestNpmVersion(npmName,curVersion)
  if (newestNpmVersion && semver.gt(newestNpmVersion,curVersion)) {
    log.warn(colors.yellow(`请手动更新 ${npmName}，当前版本: ${curVersion}，最新版本: ${newestNpmVersion}`))
  }
}

function checkEnv() {
  const  dotenvPath = path.resolve(userHome, '.env') // !C:\Users\Administrator\.env  或者C:\Users\lwj
  if (pathExists(dotenvPath)) {
    // !把.env的环境变量添加到process.env
    dotenv.config({
      path: dotenvPath
    })
  }
  createDefaultConfig()
  // !prepare阶段在registerCommand之前，所以无法执行log.verbose，下面不会执行
  log.verbose('环境变量', process.env.CLI_HOME)
  log.verbose('环境变量', process.env.CLI_HOME_PATH)
}

function createDefaultConfig() {
  const cliConfig = {
    home: userHome
  }
  cliConfig.cliHome = path.resolve(userHome, process.env.CLI_HOME || constant.DEFAULT_CLI_HOME)
  process.env.CLI_HOME_PATH = cliConfig.cliHome // !
}

// function checkInputArgs() {
//   // !I:\vue\lerna-demo\utils\log\lib\index.js
//   process.env.LOG_LEVEL = argv.debug ? 'verbose' : 'info'
//   log.level = process.env.LOG_LEVEL
// }

function checkUserHome() {
  if (!userHome || !pathExists(userHome)) {
    throw new Error(`当前登陆用户主目录不存在`)
  }
}

function checkRoot() {
  // console.log(process.geteuid()) // !window系统不支持
  // const rootCheck = require('root-check'); // !降级permissions，获得权限以便写入读取文件
  // rootCheck();
}

function checkPkgVersion() {
  log.notice('cli', pkg.version)
}
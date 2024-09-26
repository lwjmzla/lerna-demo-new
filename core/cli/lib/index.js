import path from 'path'
import colors from 'colors/safe.js'
import log from '@jking-lwj/log'
import pkg from '../package.json' assert { type: "json" };
import userHome from 'user-home'
import {pathExistsSync as pathExists} from 'path-exists'
import constant from './const.js'
import {getNewestNpmVersion} from '@jking-lwj/get-npm-info'

export default async function core() {
  try {
    await prepare()
    //registerCommand()
  } catch (error) {
    //log.error(error.message)
    log.error(colors.red(error.message)) // ! log.error实现红色的ERR!，后面实现红色的内容。
  }
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

function checkPkgVersion() {
  log.notice('cli', pkg.version)
}

function checkRoot() {
  // console.log(process.geteuid()) // !window系统不支持
  // const rootCheck = require('root-check'); // !降级permissions，获得权限以便写入读取文件
  // rootCheck();
}

function checkUserHome() {
  if (!userHome || !pathExists(userHome)) {
    throw new Error(`当前登陆用户主目录不存在`)
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
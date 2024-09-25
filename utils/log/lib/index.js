'use strict';
import log from 'npmlog'
//const log = require('npmlog') // !可以看源码参考

log.level = process.env.LOG_LEVEL || 'info' // !调整log level，info为2000，值越小权限越大。
log.heading = 'imooc' // !修改前缀
log.headingStyle = { fg: 'blue', bg: 'black' }
//log.headingStyle = { fg: 'white', bg: 'green' }
log.addLevel('success', 2000, { fg: 'green' })

//module.exports = log;
export default log

'use strict';

// const axios = require('axios')
// const urlJoin = require('url-join') // !url拼接
// const semver = require('semver')
import axios from 'axios'
import urlJoin from 'url-join'
import semver from 'semver'

function getNpmInfo(npmName,registry) {
  //console.log(npmName,registry)
  if (!npmName) {
    return
  }
  registry = registry || getDefaultRegistry()
  const url = urlJoin(registry,npmName)
  //console.log(url)
  return axios.get(url).then((res) => {
    if (res.status === 200) {
      return res.data
    }
    return null
  }).catch((err) => {
    return Promise.reject(err)
  })
}

function getDefaultRegistry(isOrginal = false) {
  return isOrginal ? 'https://registry.npmjs.org' : 'https://registry.npmmirror.com'
}

async function getNpmVersions(npmName,registry) {
  const data = await getNpmInfo(npmName,registry)
  return Object.keys(data.versions)
}
// !获取大于当前版本的NpmVersions
function getNpmVersionsGtCurVersion(baseVersion, versions) {
  return versions
    .filter((version) => semver.satisfies(version,'>' + baseVersion)) // semver.satisfies('1.2.3', '1.x || >=2.5.0 || 5.0.0 - 7.2.3')
    //.filter((version) => semver.gt(version,baseVersion)) // !其实这个可以代替上面的，不过上面的方式灵活，种类多
    .sort((a,b) => { // !从大到小排序
      return semver.gt(b,a) ? 1 : -1
    })
}

async function getNewestNpmVersion(npmName,baseVersion,registry) {
  const versions = await getNpmVersions(npmName,registry)
  // !大于当前版本的versions数组
  const versionsGtCurVersion = getNpmVersionsGtCurVersion(baseVersion, versions)
  return versionsGtCurVersion?.[0] || ''
}

// !直接根据npmName获取最新版本
async function getNpmLatestVersion(npmName,registry) {
  let versions = await getNpmVersions(npmName,registry)
  versions = versions.sort((a,b) => { // !从大到小排序
    return semver.gt(b,a) ? 1 : -1
  })
  return versions?.[0] || ''
}

const npmFactoryFn = {
  getNpmInfo,
  getNpmVersions,
  getNewestNpmVersion,
  getNpmLatestVersion, // !常用，获取最新版本号
  getDefaultRegistry
};

export {
  getNpmInfo,
  getNpmVersions,
  getNewestNpmVersion,
  getNpmLatestVersion, // !常用，获取最新版本号
  getDefaultRegistry
};
export default npmFactoryFn

const fs = require('fs-extra')
const { platform } = require('os')
const { join, resolve } = require('path')
const { exec } = require('child_process')
const uuidstr = require('uuid-by-string')

const fileExists = file => fs.stat(file).then(stat => stat.isFile()).catch(() => false)
const dirExists = file => fs.stat(file).then(stat => stat.isDirectory()).catch(() => false)
const execAsync = cmd => new Promise(resolve => exec(cmd, (err, out) => resolve(err ? '' : out.toString())))

const systemType = platform()

module.exports = {
  dirExists,
  fileExists,
  randomUuid: () => uuidstr(Math.random().toString()).replace(/-/g, '').toLowerCase(),
  async findJava () {
    const result = []
    let env = process.env.JAVA_HOME
    if (systemType === 'win32') {
      if (env) {
        const file = join(env, 'bin/java.exe')
        if (await fileExists(file)) result.push(file)
      }
      return Array.from(new Set(result.concat(await this.findJavaInternal('Wow6432Node\\'),
        await this.findJavaInternal())))
    } else {
      let file = resolve('/bin/java')
      if (await fileExists(file)) result.push(env)
      if (env && env !== '/bin/java') {
        env = resolve(env)
        const env_ = join(env, 'bin/java')
        if (await fileExists(env)) {
          result.push(env)
        } else if (await fileExists(env_)) {
          result.push(env_)
        }
      }
      return result
    }
  },
  async findJavaInternal (key) {
    let java = await execAsync(
      `REG QUERY "HKEY_LOCAL_MACHINE\\SOFTWARE\\${key || ''}JavaSoft\\Java Runtime Environment"`)
    if (!java) return []
    java = java.split('\r\n\r\n')
    if (java.length !== 2) return []
    const array = []
    await Promise.all(java[1].split('\r\n').map(async q => {
      if (!q) return
      let u = await execAsync(`REG QUERY "${q}" /v JavaHome`)
      if (!u) return
      u = u.split('    ')
      if (u.length === 4) {
        const file = `${u[3].replace('\r\n\r\n', '')}\\bin\\java.exe`
        if (await fileExists(file)) array.push(file)
      }
    }))
    return array
  },
  async findJavaFast (useEnv, key) {
    let env = process.env.JAVA_HOME
    if (systemType === 'win32') {
      if (useEnv && env) {
        const file = join(env, 'bin/java.exe')
        if (await fileExists(file)) return file
      }
      const re = await this.findJavaInternal('Wow6432Node\\')
      if (re.length) return re[0]
      return (await this.findJavaInternal())[0]
    } else {
      const file = resolve('/bin/java')
      if (await fileExists(file)) return file
      if (useEnv && env && env !== '/bin/java') {
        env = resolve(env)
        const env_ = join(env, 'bin/java')
        if (await fileExists(env)) {
          return env
        } else if (await fileExists(env_)) {
          return env_
        }
      }
    }
  }
}

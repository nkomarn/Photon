const fs = require('fs-extra')
const { join } = require('path')
const tools = require('./tools')
const { spawn } = require('child_process')
const { isAllow, systemType } = require('./isAllow')

module.exports = async function launch (opts) {
  if (this._event) {
    this._event.emit('auth')
  }
  const auth = Object.assign({
    userType: 'mojang',
    properties: '{}'
  }, typeof opts.authenticator === 'function' ? await opts.authenticator() : opts.authenticator)
  if (!auth.uuid) auth.uuid = tools.randomUuid()
  if (!auth.accessToken) auth.accessToken = tools.randomUuid()
  if (!auth || !auth.displayName) {
    if (this._event) {
      this._event.emit('error_auth')
    }
    throw new Error('validation error')
  }
  let args = []
  if (opts.agentPath) args.push(`-javaagent:${opts.agentPath}`)
  if (typeof opts.cgcEnabled === 'undefined' ? true : opts.cgcEnabled) args.push('-Xincgc')
  if (opts.minMemory > 0) args.push(`-Xms${opts.minMemory}M`)
  args.push(opts.maxMemory > 0 ? `-Xmx${opts.maxMemory}M` : '-Xmx1024M', '-Xmn128m')

  if (this._event) this._event.emit('unzip')

  const nativePath = join(this.root, 'versions', opts.version.id, 'natives')
  const nativeCache = join(this.root, '.mclcache')
  if (!(await tools.dirExists(nativePath))) await fs.mkdir(nativePath)
  if (!(await tools.dirExists(nativeCache))) await fs.mkdir(nativeCache)

  const missLibraries = []
  const libraries = [join(this.root, 'versions', opts.version.id, `${opts.version.id}.jar`)]
  await Promise.all(opts.version.libraries.map(lib => tools
    .fileExists(lib.path)
    .then(r => r ? libraries.push(lib.path) : missLibraries.push(lib))
  ).concat(opts.version.natives.map(async native => {
    if (!(await tools.fileExists(native.path))) {
      missLibraries.push(native)
      return
    }
    const cache = join(nativeCache, native.cache + '.json')
    if (!(await tools.fileExists(cache)) || (await Promise.all((await fs.readJson(cache))
      .map(name => tools.fileExists(join(nativePath, name))))).some(exists => !exists)) {
      await fs.writeJson(cache, await this._unpack(nativePath, native.path, native.exclude))
    }
  })))

  if (missLibraries.length) {
    if (this._event) {
      this._event.emit('miss', missLibraries)
    }
    throw new Error('Lack of support library')
  }

  if (!opts.advencedArguments) opts.advencedArguments = []

  /* eslint-disable no-template-curly-in-string */
  const jvmArgs = [
    { k: '${natives_directory}', v: nativePath },
    { k: '${launcher_name}', v: opts.launcherName },
    { k: '${launcher_version}', v: opts.launcherVersion }
  ]
  const assetsPath = join(this.root, opts.version.assets === 'legacy' ? 'assets/virtual/legacy' : 'assets')
  let ma = {
    '${auth_access_token}': auth.accessToken,
    '${auth_session}': auth.accessToken,
    '${auth_player_name}': auth.displayName,
    '${auth_uuid}': auth.uuid,
    '${user_properties}': auth.properties,
    '${user_type}': auth.userType,
    '${version_name}': opts.version.id,
    '${assets_index_name}': opts.version.assets,
    '${game_directory}': join(this.root, 'versions', opts.version.id),
    '${game_assets}': assetsPath,
    '${assets_root}': assetsPath,
    '${version_type}': opts.versionType
  }
  const arg = opts.version.minecraftArguments
  ma = Array.isArray(arg.game) ? arg.game.filter(i => {
    const t = typeof i
    if (t === 'object') return isAllow(i.rules, opts.features)
    else if (t === 'string') return true
  }).map(i => i.value || ma[i] || i) : arg.split(' ').map(i => ma[i] || i)

  /* eslint-enable no-template-curly-in-string */
  const isArr = Array.isArray(arg.jvm)
  args = args.concat(
    opts.advencedArguments,
    [
      '-XX:-UseAdaptiveSizePolicy',
      '-XX:-OmitStackTraceInFastThrow',
      '-Dfml.ignorePatchDiscrepancies=true',
      '-Dfml.ignoreInvalidMinecraftCertificates=true'
    ],
    !isArr && systemType === 'windows'
      ? ['-XX:HeapDumpPath=MojangTricksIntelDriversForPerfor' +
      'mance_javaw.exe_minecraft.exe.heapdump'] : [],
    isArr ? arg.jvm.filter(i => {
      const t = typeof i
      if (t === 'object') return isAllow(i.rules, opts.features)
      else if (t === 'string' &&
        i !== '${classpath}') return true // eslint-disable-line no-template-curly-in-string
    }).map(i => jvmArgs.reduce((p, { k, v }) => p.replace(k, v), i.value || i)) : [
      `-Djava.library.path=${nativePath}`,
      '-cp'
    ],
    [libraries.join(';'), opts.version.mainClass],
    ma
  )

  if (opts.server && opts.server.address) {
    args.push(
      '--server',
      opts.server.address,
      '--port',
      opts.server.port <= 0 ? '25565' : opts.server.port.toString()
    )
  }
  if (opts.size) {
    if (opts.size.fullScreen) {
      args.push('--fullscreen')
    } else {
      if (opts.size.height > 0) {
        args.push('--height', opts.size.height.toString())
      }
      if (opts.size.width > 0) {
        args.push('--width', opts.size.width.toString())
      }
    }
  }

  if (this._event) {
    this._event.emit('start')
  }
  const launched = () => clearTimeout(time)
  const time = setTimeout(() => {
    child.removeListener('exit', launched)
    if (this._event) {
      this._event.emit('started')
    }
  }, 13000)

  const child = spawn(this.java, args, { cwd: this.root })
  if (this._event) {
    child
      .on('error', d => this._event.emit('start_error', d))
      .once('exit', d => this._event.emit('exit', d))
      .once('exit', launched)
    child.stdout.on('data', d => this._event.emit('log_data', d))
    child.stderr.on('data', d => this._event.emit('log_error', d))
  }
  return child
}

const core = require('./lib/index')
core.Offline = require('./lib/authenticator/offline')
core.Yggdrasil = require('./lib/authenticator/yggdrasil')
core.Tools = require('./lib/tools')

module.exports = core

const { platform, release } = require('os')

const version = release()
let systemType = 'linux'
switch (platform()) {
  case 'win32':
    systemType = 'windows'
    break
  case 'darwin':
    systemType = 'osx'
}

exports.systemType = systemType
exports.isAllow = (rules, features = {}) => {
  if (!rules || !rules.length) return true
  for (const rule of rules) {
    if (rule.action === 'allow') {
      let result = true
      if (rule.features) {
        for (const key in rule.features) {
          if (!features[key]) {
            result = false
            break
          }
        }
      }
      if (rule.os && (rule.os.name !== systemType || (rule.os.version &&
        !new RegExp(rule.os.version).test(version)))) result = false
      if (result) return true
    }
  }
  return false
}

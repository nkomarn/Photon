const uuidstr = require('uuid-by-string')

module.exports = displayName => {
  if ((typeof displayName) !== 'string' || displayName.indexOf(' ') !== -1) {
    throw new Error('DisplayName does not conform to the specification')
  }
  return () => ({
    displayName,
    uuid: uuidstr(`OfflinePlayer:${displayName}`).replace(/-/g, '').toLowerCase()
  })
}

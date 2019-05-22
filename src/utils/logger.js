const regex = new RegExp(/at \w*/g)
const getFun = str => str.match(regex)[1]

const log = (...val) => console.log('[' + new Date(Date.now()).toISOString() + '](' + getFun(new Error().stack) + '): ', ...val)
const error = (...val) => console.error('[' + new Date(Date.now()).toISOString() + '](' + getFun(new Error().stack) + '): ', ...val)
const info = (...val) => console.info('[' + new Date(Date.now()).toISOString() + '](' + getFun(new Error().stack) + '): ', ...val)
const warn = (...val) => console.warn('[' + new Date(Date.now()).toISOString() + '](' + getFun(new Error().stack) + '): ', ...val)

module.exports = {
  log,
  error,
  info,
  warn
};

const regex = new RegExp(/at \w*/g)
const getFun = str => str.match(regex)[1]

const logger = func => {
  return (...val) => {
    const now = new Date(Date.now()).toISOString()
    const errorFunction = getFun(new Error().stack)
    func(`[${now}](${errorFunction}): `, ...val)
  }
}

export const log = logger(console.log)
export const error = logger(console.error)
export const info = logger(console.info) // eslint-disable-line
export const warn = logger(console.warn)

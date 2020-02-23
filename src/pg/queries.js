const createSession = ({ uuid, token, origin }) => {
  return {
    text: 'INSERT INTO sessions (user_id, token, origin) VALUES ($1, $2, $3)',
    values: [uuid, token, origin],
  }
}

const selectSession = token => {
  return {
    text: 'SELECT * FROM sessions WHERE token = $1',
    values: [token],
  }
}

const expireSession = token => {
  return {
    text: 'DELETE FROM sessions WHERE token = $1',
    values: [token],
  }
}

const createUser = (username, password) => {
  return {
    text: 'INSERT INTO users (username, password) VALUES ($1, $2)',
    values: [username, password],
  }
}

const selectUserByUsername = username => {
  return {
    text: 'SELECT * FROM users WHERE username = $1',
    values: [username],
  }
}

module.exports = {
  session: {
    create: createSession,
    select: selectSession,
    expire: expireSession,
  },
  user: {
    create: createUser,
    select: selectUserByUsername,
  },
}

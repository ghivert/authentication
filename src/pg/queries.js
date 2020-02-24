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

const updateUserPassword = (password, username) => {
  return {
    text: 'UPDATE users SET password = $1 WHERE username = $2',
    values: [password, username],
  }
}

const createResetLink = (uuid, username) => {
  return {
    text: 'INSERT INTO reset_link (id, username) VALUES ($1, $2)',
    values: [uuid, username],
  }
}

const selectResetLink = id => {
  return {
    text: 'SELECT * FROM reset_link WHERE id = $1',
    values: [id],
  }
}

const invalidResetLink = id => {
  return {
    text: 'UPDATE reset_link SET valid = false WHERE id = $1',
    values: [id],
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
    updatePassword: updateUserPassword,
  },
  resetLink: {
    create: createResetLink,
    select: selectResetLink,
    invalid: invalidResetLink,
  },
}

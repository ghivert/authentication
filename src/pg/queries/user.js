export const create = (username, password) => {
  const text = 'INSERT INTO users (username, password) VALUES ($1, $2)'
  return { text, values: [username, password] }
}

export const select = username => {
  const text = 'SELECT * FROM users WHERE username = $1'
  return { text, values: [username] }
}

export const updatePassword = (password, username) => {
  const text = 'UPDATE users SET password = $1 WHERE username = $2'
  return { text, values: [password, username] }
}

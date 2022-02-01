export const create = ({ uuid, token, origin }) => {
  const text =
    'INSERT INTO sessions (user_id, token, origin) VALUES ($1, $2, $3)'
  return { text, values: [uuid, token, origin] }
}

export const select = token => {
  const text = 'SELECT * FROM sessions WHERE token = $1'
  return { text, values: [token] }
}

export const expire = token => {
  const text = 'DELETE FROM sessions WHERE token = $1'
  return { text, values: [token] }
}

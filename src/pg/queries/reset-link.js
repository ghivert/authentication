export const create = (uuid, username) => {
  const text = 'INSERT INTO reset_link (id, username) VALUES ($1, $2)'
  return { text, values: [uuid, username] }
}

export const select = id => {
  const text = 'SELECT * FROM reset_link WHERE id = $1'
  return { text, values: [id] }
}

export const invalid = id => {
  const text = 'UPDATE reset_link SET valid = false WHERE id = $1'
  return { text, values: [id] }
}

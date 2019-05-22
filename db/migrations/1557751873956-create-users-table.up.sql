CREATE TABLE users (
  id uuid primary key default uuid_generate_v4(),
  login TEXT NOT NULL,
  password TEXT NOT NULL,
  UNIQUE (login)
);

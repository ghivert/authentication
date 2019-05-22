CREATE TABLE sessions (
  token TEXT NOT NULL primary key,
  user_id uuid NOT NULL,
  origin TEXT NOT NULL,
  creation_date date not null default CURRENT_DATE,
  expired boolean default false
);

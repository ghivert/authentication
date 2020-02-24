create extension if not exists "uuid-ossp";
create extension if not exists "moddatetime";

create table users (
  id uuid primary key default uuid_generate_v4(),
  username text not null unique,
  password text not null,
  created_at timestamp default current_timestamp,
  updated_at timestamp default current_timestamp
);

create trigger users_moddatetime
  before update on users
  for each row
  execute procedure moddatetime (updated_at);

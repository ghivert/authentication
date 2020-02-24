create table reset_link (
  id uuid primary key not null,
  username text not null,
  valid boolean default true,
  created_at timestamp default current_timestamp,
  updated_at timestamp default current_timestamp
);

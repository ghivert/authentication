create table sessions (
  token text not null primary key,
  user_id uuid not null,
  origin text not null,
  creation_date date not null default current_date,
  expired boolean default false
);

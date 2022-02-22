CREATE TABLE IF NOT EXISTS vidburdur (
  id serial primary key,
  name varchar(64) not null unique,
  slug varchar(64) not null,
  description varchar(400),
  created timestamp with time zone not null default current_timestamp,
  updated timestamp with time zone not null default current_timestamp
);

CREATE TABLE IF NOT EXISTS users (
  id serial primary key,
  name varchar(64) not null, 
  username character varying(64) not null,
  password character varying(256) not null
);

CREATE TABLE IF NOT EXISTS skraning (
  id serial primary key,
  name varchar(64) not null,
  comment varchar(64),
  eventid integer not null, 
  userid integer not null, 
  created timestamp with time zone not null default current_timestamp,
  constraint eventid foreign key (eventid) references vidburdur (id),
  constraint userid foreign key (userid) references users (id)  
);

-- Lykilorð: "123"
INSERT INTO users 
(name, username, password) 
VALUES ('Arni', 
        'admin', 
        '$2a$11$pgj3.zySyFOvIQEpD7W6Aund1Tw.BFarXxgLJxLbrzIv/4Nteisii'
      );
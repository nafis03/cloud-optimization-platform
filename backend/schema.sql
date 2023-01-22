DROP TABLE IF EXISTS users;

CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    access_key TEXT NOT NULL,
    secret_key TEXT NOT NULL,
    username TEXT NOT NULL
);

DROP TABLE IF EXISTS requests;

CREATE TABLE requests (
    id TEXT PRIMARY KEY NOT NULL,
    created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    current_status TEXT CHECK( current_status IN ('open','active','failed', 'closed', 'disabled', 'cancelled') ) NOT NULL,
    user TEXT NOT NULL,
    FOREIGN KEY(user) REFERENCES users(id)
);

DROP TABLE IF EXISTS instances;

CREATE TABLE instances (
    id TEXT PRIMARY KEY NOT NULL,
    sir TEXT NOT NULL,
    user TEXT NOT NULL,
    FOREIGN KEY(sir) REFERENCES requests(id),
    FOREIGN KEY(user) REFERENCES users(id)
);

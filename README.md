# Lost and Found Backend

## Setup

Begin by cloning the repo
```sh
git clone https://github.com/rosa479/Lost-FoundBackend.git
```
Installing dependencies and environment variables
```sh
sudo apt install -y nodejs npm postgresql
cd Lost-FoundBackend/
npm install
sudo service postgresql start
cp .env.example .env
```

Initiating database
```sql
sudo -u postgres psql
CREATE USER "admin" WITH PASSWORD 'pass';
CREATE DATABASE lostfound;
GRANT ALL PRIVILEGES ON DATABASE lostfound TO "admin";
\c lostfound
-- db/schema.sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT DEFAULT 'user'
);

CREATE TABLE items (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT CHECK (status IN ('lost', 'found')),
  category TEXT,
  location TEXT,
  date DATE,
  contact_info TEXT,
  image_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  posted_by INTEGER REFERENCES users(id)
);
ALTER TABLE items OWNER TO "admin";
ALTER TABLE users OWNER TO "admin";
```
The admin role has to be bootstrapped manually
```sql
INSERT INTO users (username, password, role)
VALUES ('adminuser', '$2b$10$s94MO93FwuPhIa9auX4tG.AZEZv6s/n23SFNLxkkzzKL3MqTsdXsa', 'admin');
```
The hashed password can be generated using
```js
require('bcrypt').hashSync('supersecurepassword', 10)
```

And now we go live!
```sh
node server.js
```

## Folder Structure
```
Lost-FoundBackend
├── .env.example
├── db
│   ├── schema.sql
│   └── db.js
├── middleware
│   ├── auth.js
├── package-lock.json
├── package.json
├── rate_limiting_test.sh
├── routes
│   ├── auth.js
│   └── items.js
├── sample_curl_reqs.txt
└── server.js
```

## API Endpoints

### /auth — Authentication

| Method | Endpoint         | Description                 | Auth Required |
|--------|------------------|-----------------------------|----------------|
| POST   | /auth/register   | Register a new user         | No             |
| POST   | /auth/login      | Login and receive JWT token | No             |

---

### /items — Lost & Found Items

| Method | Endpoint       | Description                                         | Auth Required | Access Level     |
|--------|----------------|-----------------------------------------------------|---------------|------------------|
| GET    | /items         | Get all items (supports filtering)                 | No            | Public           |
| GET    | /items/:id     | Get item details by ID                              | No            | Public           |
| POST   | /items         | Create a new item listing                           | Yes           | User or Admin    |
| PUT    | /items/:id     | Update an item (owner or admin only)                | Yes           | Owner or Admin   |
| DELETE | /items/:id     | Delete an item (admin only)                         | Yes           | Admin only       |

---

### Query Parameters for GET /items

Supports the following optional query parameters:

- `status` — e.g. `lost`, `found`
- `category` — e.g. `electronics`, `clothing`
- `location` — filter by text match
- `date` — format: `YYYY-MM-DD`

Check out sample_curl_reqs.txt for examples

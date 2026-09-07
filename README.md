# NER Logistics Platform

## Project structure

- `frontend/` — dashboard HTML, styles, and browser JavaScript.
- `backend/` — Node.js/Express API, database scripts, environment configuration, and imported map data.

## Run locally

1. Start PostgreSQL with PostGIS and create the `ner_logistics` database.
2. In `backend/`, copy `.env.example` to `.env` and configure the database URL.
3. From `backend/`, run `npm install` and then `npm start`.
4. Open `http://localhost:3000`.

API base: `http://localhost:3000/api`.

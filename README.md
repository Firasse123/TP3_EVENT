# Curriculum Vitae API (NestJS)

This repository is a NestJS REST API for managing users, CVs, and skills. It uses MySQL with TypeORM, global validation pipes, and URI-based API versioning. The README is intentionally comprehensive so it can be passed to an LLM and used as a full project context snapshot.

## Tech stack

- Node.js + TypeScript
- NestJS 11
- MySQL 8+ (via `mysql2`)
- TypeORM 0.3
- class-validator + class-transformer
- @nestjs/event-emitter (used to emit `cv.created`)

## Project structure

- `src/app.module.ts`: root module, config, TypeORM, event emitter
- `src/main.ts`: app bootstrap, validation, versioning
- `src/common/db`: generic CRUD service/controller + date filter DTO
- `src/users`: users module, controller, service, DTOs, entity
- `src/cvs`: CVs module, controller, service, DTOs, entity
- `src/skills`: skills module, controller, service, DTOs, entity
- `src/standalone/seed.ts`: seed script using @ngneat/falso

## Runtime behavior

- Global validation pipe with:
  - `whitelist: true` (strip unknown properties)
  - `forbidNonWhitelisted: true` (reject unknown properties)
  - `transform: true` (auto-transform payloads)
- API versioning: URI based (`/v1/...`, `/v2/...`)
- TypeORM `synchronize: true` (auto-sync schema from entities)

## Environment variables

Create a `.env` file at the repo root:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=tp3
PORT=3000
```

## Database model

### UserEntity (`user` table)

- `id`: number (PK)
- `username`: string (unique)
- `email`: string (unique)
- `password`: string
- `cvs`: OneToMany -> `CvEntity`

### CvEntity (`cv` table)

- `id`: number (PK)
- `firstname`: string
- `name`: string
- `age`: number
- `cin`: number (unique)
- `job`: string
- `path`: string | null
- `user`: ManyToOne -> `UserEntity` (required, cascade on delete)
- `skills`: ManyToMany -> `SkillEntity` via `cv_skills`

### SkillEntity (`skill` table)

- `id`: number (PK)
- `designation`: string
- `cvs`: ManyToMany -> `CvEntity`

### Soft delete and timestamps

All entities extend `TimeStampEntity`:

- `createdAt`, `updatedAt`
- `deletedAt` (soft delete)
- `version`

## API summary

Base URL: `http://localhost:3000`

### App

- `GET /` -> returns a hello string

### Users (`/users`)

- `POST /users` -> create user
- `GET /users` -> list all (includes soft-deleted)
- `GET /users/:id` -> get by id (includes soft-deleted)
- `PATCH /users/:id` -> update by id
- `PATCH /v2/users` -> update by criteria (versioned)
- `DELETE /users/:id` -> soft delete
- `PATCH /users/:id/restore` -> restore soft-deleted
- `DELETE /users/:id/hard` -> hard delete
- `GET /users/filter/date` -> filter by created/updated/deleted date

### CVs (`/cvs`)

- `GET /cvs` -> list all (includes soft-deleted)
- `GET /cvs/:id` -> get by id (includes soft-deleted)
- `POST /cvs` -> create CV
- `PATCH /cvs/:id` -> update by id
- `PATCH /cvs` -> update by criteria
- `DELETE /cvs/:id` -> soft delete
- `PATCH /cvs/:id/restore` -> restore soft-deleted
- `DELETE /cvs/:id/hard` -> hard delete
- `GET /cvs/filter/date` -> filter by created/updated/deleted date
- `GET /cvs/stats?min=18&max=60` -> count CVs grouped by age in range

### Skills (`/skills`)

- `GET /skills` -> list all (includes soft-deleted)
- `GET /skills/:id` -> get by id (includes soft-deleted)
- `POST /skills` -> create skill
- `PATCH /v1/skills/:id` -> update by id (versioned)
- `PATCH /v2/skills` -> update by criteria (versioned)
- `DELETE /skills/:id` -> soft delete
- `PATCH /skills/:id/restore` -> restore soft-deleted
- `DELETE /skills/:id/hard` -> hard delete
- `GET /skills/filter/date` -> filter by created/updated/deleted date

## DTOs and validation

### User DTOs

- `CreateUserDto`: `username`, `email`, `password` (all required)
- `UpdateUserDto`: partial of `CreateUserDto`
- `UpdateByCriteriaUserDto`: `{ criteria, dto }`

### CV DTOs

- `CreateCvDto`:
  - `firstname`, `name`, `job` (required strings)
  - `age` (number, 15-70)
  - `cin` (number, 8 digits)
  - `path` (optional)
- `UpdateCvDto`: partial of `CreateCvDto`
- `UpdateByCriteriaCvDto`: `{ criteria, dto }`
- `StatParamDto`: optional `min`/`max` numbers for stats query

### Skill DTOs

- `CreateSkillDto`: `designation` (min length 2)
- `UpdateSkillDto`: partial of `CreateSkillDto`
- `UpdateByCriteriaSkillDto`: `{ criteria, dto }`

### Date filter DTO

- `key`: one of `createdAt`, `updatedAt`, `deletedAt`
- `minDate`, `maxDate`: optional ISO dates

## Business rules

- Users: `email` and `username` must be unique. The service validates uniqueness on create/update.
- CVs: `cin` must be unique. The service validates on create/update.
- Soft delete is used by default, with explicit restore and hard delete routes.
- `cv.created` event is emitted when a CV is created.

## Seed data

There is a seed script that creates demo data:

```bash
npm run seed:db
```

It creates:

- 5 skills
- 3 users
- 10 CVs linked to random users and skills

## Scripts

```bash
npm run start       # start
npm run start:dev   # watch mode
npm run build       # build
npm run test        # unit tests
npm run test:e2e    # e2e tests
npm run seed:db     # seed DB
```

## Notes for LLM usage

- The database schema is derived from TypeORM entities at startup (`synchronize: true`).
- All list/find endpoints include soft-deleted rows (`withDeleted: true`).
- Versioned endpoints use URI versioning (`/v1` and `/v2`).
- Routes in controllers extend a generic CRUD controller that adds `GET /filter/date`.

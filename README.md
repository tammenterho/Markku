# Markku - marketing scheduler
[![Run Tests](https://github.com/tammenterho/Markku/actions/workflows/tests.yml/badge.svg)](https://github.com/tammenterho/Markku/actions/workflows/tests.yml)
[![Deploy](https://github.com/tammenterho/Markku/actions/workflows/deploy.yml/badge.svg)](https://github.com/tammenterho/Markku/actions/workflows/deploy.yml)

Markku is a full-stack campaign and marketing scheduling application with a React frontend, NestJS backend, and PostgreSQL database.

## Technologies Used

### Frontend (`client`)

- **React** with **TypeScript 5**
- **Vite** for development server and production builds
- **React Router** for client-side routing
- **Mantine UI** (`@mantine/core`, forms, notifications, modals, dates, dropzone, charts)
- **Tabler Icons** for iconography


### Backend (`server`)

- **NestJS** (modular Node.js server framework)
- **TypeScript**
- **TypeORM** for database access and migrations
- **PostgreSQL** driver (`pg`)
- **Passport** (`passport-local`, `passport-jwt`) and **@nestjs/jwt** for authentication
- **Jest** + **Supertest** for unit and e2e testing


### Data & Infrastructure

- **PostgreSQL 15** as the primary database
- **Docker** and **Docker Compose** for local containerized setup
- SQL bootstrap scripts in `sql/init.sql`

### DevOps & Tooling

- **GitHub Actions** for deployment workflow (`deploy.yml`)

## Deployment

- Production workflow: `.github/workflows/deploy.yml` runs `.scripts/deploy.sh`
- Demo workflow: `.github/workflows/demoDeploy.yml` runs `.scripts/deploy-demo.sh`
- Demo workflow supports dedicated secrets (`HOST_DEMO`, `USERNAME_DEMO`, `PORT_DEMO`, `SSHKEY_DEMO`) and falls back to production secrets if demo-specific secrets are not set.


## Local Development

### Start with Docker

Run the following command to start the application containers:

```bash
docker-compose up --build
```

### Start Application Manually

**Client**

```bash
cd client
npm install
npm run dev
```

**Server**

```bash
cd server
npm install
npm run start:dev
```

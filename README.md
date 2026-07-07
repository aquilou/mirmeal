# MIR Meal — App

Aplicación de MIR Meal: catálogo, pedidos, suscripciones y panel de administración.
Stack: **Next.js (App Router) + TypeScript + Prisma + PostgreSQL**.

> La landing pública es un proyecto aparte (estático, alojado en cdmon). Este repositorio es solo la app dinámica.

## Puesta en marcha (local)

1. Instala dependencias:
   ```bash
   npm install
   ```
2. Crea tu archivo `.env` a partir del ejemplo y pon tu `DATABASE_URL` real:
   ```bash
   cp .env.example .env
   ```
   > El `.env` está en `.gitignore` y **nunca** se sube a GitHub.
3. Crea las tablas en la base de datos (primera migración):
   ```bash
   npx prisma migrate dev --name init
   ```
4. Arranca en desarrollo:
   ```bash
   npm run dev
   ```
   Abre http://localhost:3000 — y http://localhost:3000/api/health para comprobar la conexión a la base de datos.

## Comandos útiles

- `npm test` — ejecuta los tests (incluye la regla de fechas de reparto).
- `npm run prisma:studio` — explorador visual de la base de datos.
- `npm run prisma:migrate` — nueva migración tras cambiar el esquema.

## Despliegue en Railway

1. Sube este repositorio a GitHub.
2. En Railway, dentro del proyecto: **New → GitHub Repo** y selecciona el repo de la app.
3. Añade el servicio **PostgreSQL** si no lo tienes (New → Database → PostgreSQL).
4. En el servicio de la app, en **Variables**, referencia la base de datos:
   `DATABASE_URL = ${{ Postgres.DATABASE_URL }}` (Railway la inyecta sola).
   Añade también `AUTH_SECRET` y las claves de Stripe cuando toque.
5. Railway ejecuta `npm run build` (que incluye `prisma generate`) y despliega en cada push.
   > Las migraciones en producción se aplican con `npx prisma migrate deploy` (lo configuramos como paso de release).

## Estructura

```
src/
  app/          Rutas (App Router)
    api/health/ Comprobación de conexión a la BD
  lib/
    prisma.ts   Cliente Prisma (singleton)
    delivery.ts Regla de fecha de entrega (dom–mié → viernes; jue–sáb → lunes)
prisma/
  schema.prisma Modelo de datos completo
public/fonts/   Crimson Pro e Inter (autoalojadas)
```

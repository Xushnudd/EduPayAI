#!/bin/sh
set -eu
node /app/docker/wait-for-db.mjs
# Use the installed CLI; never download packages or reset the database on startup.
node /app/node_modules/prisma/build/index.js migrate deploy
exec node /app/node_modules/next/dist/bin/next start --hostname 0.0.0.0

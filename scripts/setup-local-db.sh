#!/usr/bin/env bash
set -euo pipefail

DB_USER="${POSTGRES_USER:-appifylab}"
DB_PASS="${POSTGRES_PASSWORD:-changeme}"
DB_NAME="${POSTGRES_DB:-social_feed}"

psql -v ON_ERROR_STOP=1 postgres <<SQL
DO \$\$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = '${DB_USER}') THEN
    CREATE ROLE ${DB_USER} WITH LOGIN PASSWORD '${DB_PASS}';
  END IF;
END
\$\$;

SELECT 'CREATE DATABASE ${DB_NAME} OWNER ${DB_USER}'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '${DB_NAME}')\gexec

GRANT ALL PRIVILEGES ON DATABASE ${DB_NAME} TO ${DB_USER};
SQL

echo "Database '${DB_NAME}' is ready for user '${DB_USER}'."

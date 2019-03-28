-- Add native handling of uuid. They can be managed and generated
--   directly in the database.
-- This mainly exposes uuid_generate_v4(), which is what we want most of the time.
-- More informations in the Postgres documentation.
create extension if not exists "uuid-ossp";

DO $$
BEGIN
  RAISE NOTICE 'Creating campaigns table...';
END $$;

CREATE TABLE IF NOT EXISTS "campaigns" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "clientId" varchar(255) NOT NULL,
  "companyId" varchar(255) NOT NULL,
  "company" varchar(255) NOT NULL,
  "customer" varchar(255) NOT NULL,
  "name" varchar(255) NOT NULL,
  "payer" varchar(255),
  "title" varchar(255),
  "copyText" text,
  "targetAge" varchar(50),
  "targetGender" varchar(50),
  "targetArea" varchar(100),
  "budget" numeric NOT NULL DEFAULT 0,
  "budgetPeriod" varchar(255),
  "mediaInfo" varchar(255),
  "start" timestamp,
  "end" timestamp,
  "status" boolean NOT NULL DEFAULT false,
  "type" varchar(50),
  "url" varchar(255),
  "cta" varchar(255),
  "createdBy" varchar(255) NOT NULL,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "PK_campaigns_id" PRIMARY KEY ("id")
);

DO $$
BEGIN
  RAISE NOTICE 'Campaigns table created';
END $$;


INSERT INTO "campaigns" (
  "id", "clientId", "companyId", "company", "customer", "name", "payer", "title", "copyText", "targetAge", "targetGender", "targetArea", "budget", "budgetPeriod", "mediaInfo", "start", "end", "status", "type", "url", "cta", "createdBy"
) VALUES 
  ('659e7d23-473b-8d69-cb77-c2fb00000000', '659e7d23473b8d69cb77c2fb', '659e7d23473b8d69cb77c2fb', 'M&M Kuntotalo', 'Ville Vallaton', 'Joulukamppis','M&M Kuntotalo', 'Sama kuin ennen joulua', 'Tervetuloa, isot alet!!!', 'Age undefined, undefined', 'Male', 'Area undefined, undefined', 300, 'DURATION', 'kuva jossa kukkia', '2024-01-11 08:00:00', '2024-01-26 16:00:00', false, 'AD', 'www.wrsartfs.com', 'Lue lisää', 'Jussi Heinonen');

DO $$
BEGIN
  RAISE NOTICE 'Creating users table...';
END $$;

CREATE TABLE IF NOT EXISTS "users" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "username" character varying NOT NULL,
  "passwordHash" character varying NOT NULL,
  "isActive" boolean NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
  CONSTRAINT "PK_users_id" PRIMARY KEY ("id"),
  CONSTRAINT "UQ_users_username" UNIQUE ("username")
);

DO $$
BEGIN
  RAISE NOTICE 'Users table created';
END $$;

INSERT INTO "users" (
  "id", "username", "passwordHash", "isActive", "createdAt", "updatedAt"
) VALUES 
  ('849d9aa3-379c-4cf1-b7bc-206fcc849763', 'leevi', '$2b$12$6ZbsNcrEpiU02ukkNB.geehjgpjfa6j9/cWjjT6dsLDo9cUSn9k52', true, '2026-02-01 14:24:43.314544', '2026-02-01 14:24:43.314544'),
  ('be6972a7-02ea-4699-bf48-4d974309dc6b', 'mikko', '$2b$12$vm7naPfpNR2yL8HZmMbUUOcXGunq3q0cZXeVpLlg1qjqUujDRZ5D.', true, '2026-02-01 14:25:59.00046', '2026-02-01 14:25:59.00046');

  DO $$
BEGIN
  RAISE NOTICE 'Creating users table...';
END $$;

CREATE TABLE IF NOT EXISTS "companies" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "name" character varying NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
  CONSTRAINT "PK_companies_id" PRIMARY KEY ("id"),
  CONSTRAINT "UQ_companies_name" UNIQUE ("name")
);

DO $$
BEGIN
  RAISE NOTICE 'Companies table created';
END $$;

INSERT INTO "companies" (
  "id", "name", "createdAt", "updatedAt"
) VALUES 
  ('849d9aa3-379c-4cf1-b7bc-206fcc849763', 'M&M Kuntotalo', '2026-02-01 14:24:43.314544', '2026-02-01 14:24:43.314544'),
  ('be6972a7-02ea-4699-bf48-4d974309dc6b', 'Keski-Suomen Kuntatalo', '2026-02-01 14:25:59.00046', '2026-02-01 14:25:59.00046');
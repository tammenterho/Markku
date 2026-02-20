DO $$
BEGIN
  RAISE NOTICE 'Creating demo schema and tables...';
END $$;

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE SCHEMA IF NOT EXISTS tenant_1;

CREATE TABLE IF NOT EXISTS tenant_1.campaigns (
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
  "imageUrls" text[] DEFAULT '{}',
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

CREATE TABLE IF NOT EXISTS "users" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "username" character varying NOT NULL,
  "passwordHash" character varying NOT NULL,
  "companies" text[],
  "isActive" boolean NOT NULL DEFAULT true,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "PK_users_id" PRIMARY KEY ("id"),
  CONSTRAINT "UQ_users_username" UNIQUE ("username")
);

CREATE TABLE IF NOT EXISTS "companies" (
  "id" SERIAL PRIMARY KEY,
  "linkId" uuid NOT NULL DEFAULT gen_random_uuid(),
  "name" character varying NOT NULL,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "UQ_companies_name" UNIQUE ("name"),
  CONSTRAINT "UQ_companies_linkId" UNIQUE ("linkId")
);

DO $$
BEGIN
  RAISE NOTICE 'Seeding demo companies and users...';
END $$;

INSERT INTO "companies" ("linkId", "name", "createdAt", "updatedAt")
VALUES
  ('849d9aa3-379c-4cf1-b7bc-206fcc849763', 'M&M Kuntotalo', now(), now()),
  ('be6972a7-02ea-4699-bf48-4d974309dc6b', 'Keski-Suomen Kuntatalo', now(), now()),
  ('9c37d8f1-6d0f-4f1d-bc5f-16b7f5be71c0', 'Demo Media Oy', now(), now())
ON CONFLICT ("name") DO UPDATE SET "updatedAt" = EXCLUDED."updatedAt";

INSERT INTO "users" ("id", "username", "passwordHash", "companies", "isActive", "createdAt", "updatedAt")
VALUES
  (
    'c03ed30b-2b58-48fe-83dc-ae3a6956dba5',
    'leevi',
    '$2b$12$6ZbsNcrEpiU02ukkNB.geehjgpjfa6j9/cWjjT6dsLDo9cUSn9k52',
    '{849d9aa3-379c-4cf1-b7bc-206fcc849763,be6972a7-02ea-4699-bf48-4d974309dc6b,9c37d8f1-6d0f-4f1d-bc5f-16b7f5be71c0}',
    true,
    now(),
    now()
  ),
  (
    'be6972a7-02ea-4699-bf48-4d974309dc6b',
    'mikko',
    '$2b$12$vm7naPfpNR2yL8HZmMbUUOcXGunq3q0cZXeVpLlg1qjqUujDRZ5D.',
    '{be6972a7-02ea-4699-bf48-4d974309dc6b,9c37d8f1-6d0f-4f1d-bc5f-16b7f5be71c0}',
    true,
    now(),
    now()
  ),
  (
    'af02aa88-5cf8-44fb-8fd7-d37bd8e0f839',
    'demo',
    '$2b$12$6ZbsNcrEpiU02ukkNB.geehjgpjfa6j9/cWjjT6dsLDo9cUSn9k52',
    '{849d9aa3-379c-4cf1-b7bc-206fcc849763,9c37d8f1-6d0f-4f1d-bc5f-16b7f5be71c0}',
    true,
    now(),
    now()
  )
ON CONFLICT ("username") DO UPDATE
SET
  "companies" = EXCLUDED."companies",
  "isActive" = EXCLUDED."isActive",
  "updatedAt" = EXCLUDED."updatedAt";

DO $$
BEGIN
  RAISE NOTICE 'Seeding demo campaigns (10 past, 10 ongoing, 10 future)...';
END $$;

DELETE FROM tenant_1.campaigns;

WITH generated_campaigns AS (
  SELECT
    gs AS idx,
    CASE
      WHEN gs <= 10 THEN 'past'
      WHEN gs <= 20 THEN 'ongoing'
      ELSE 'future'
    END AS bucket,
    CASE
      WHEN gs % 3 = 1 THEN '849d9aa3-379c-4cf1-b7bc-206fcc849763'
      WHEN gs % 3 = 2 THEN 'be6972a7-02ea-4699-bf48-4d974309dc6b'
      ELSE '9c37d8f1-6d0f-4f1d-bc5f-16b7f5be71c0'
    END AS company_id,
    CASE
      WHEN gs % 3 = 1 THEN 'M&M Kuntotalo'
      WHEN gs % 3 = 2 THEN 'Keski-Suomen Kuntatalo'
      ELSE 'Demo Media Oy'
    END AS company_name
  FROM generate_series(1, 30) AS gs
),
campaign_dates AS (
  SELECT
    idx,
    bucket,
    company_id,
    company_name,
    CASE
      WHEN bucket = 'past' THEN now() - (((45 + floor(random() * 180))::int)::text || ' days')::interval
      WHEN bucket = 'ongoing' THEN now() - (((1 + floor(random() * 40))::int)::text || ' days')::interval
      ELSE now() + (((1 + floor(random() * 90))::int)::text || ' days')::interval
    END AS start_ts
  FROM generated_campaigns
),
final_campaigns AS (
  SELECT
    idx,
    bucket,
    company_id,
    company_name,
    start_ts,
    CASE
      WHEN bucket = 'past' THEN start_ts + (((7 + floor(random() * 30))::int)::text || ' days')::interval
      WHEN bucket = 'ongoing' THEN now() + (((1 + floor(random() * 45))::int)::text || ' days')::interval
      ELSE start_ts + (((7 + floor(random() * 45))::int)::text || ' days')::interval
    END AS end_ts
  FROM campaign_dates
)
INSERT INTO tenant_1.campaigns (
  "clientId",
  "companyId",
  "company",
  "customer",
  "name",
  "payer",
  "title",
  "copyText",
  "targetAge",
  "targetGender",
  "targetArea",
  "budget",
  "budgetPeriod",
  "mediaInfo",
  "imageUrls",
  "start",
  "end",
  "status",
  "type",
  "url",
  "cta",
  "createdBy"
)
SELECT
  'demo-client-' || lpad(idx::text, 3, '0'),
  company_id,
  company_name,
  'Customer ' || idx,
  'Demo Campaign #' || idx,
  company_name,
  CASE
    WHEN bucket = 'past' THEN 'Finished campaign promo'
    WHEN bucket = 'ongoing' THEN 'Live campaign promo'
    ELSE 'Upcoming campaign promo'
  END,
  'Autogenerated ' || bucket || ' campaign for demo environment',
  (ARRAY['18-24', '25-34', '35-44', '45-54', '55+'])[(idx % 5) + 1],
  (ARRAY['Female', 'Male', 'All'])[(idx % 3) + 1],
  (ARRAY['Helsinki', 'Tampere', 'Turku', 'Jyväskylä', 'Oulu'])[(idx % 5) + 1],
  (200 + (idx * 37))::numeric,
  'MONTHLY',
  (ARRAY['Meta Ads', 'Google Ads', 'LinkedIn Ads', 'Display Network'])[(idx % 4) + 1],
  ARRAY['https://picsum.photos/seed/demo-' || idx || '/1200/630'],
  start_ts,
  end_ts,
  bucket = 'ongoing',
  (ARRAY['AD', 'PROMOTION', 'AWARENESS'])[(idx % 3) + 1],
  'https://demo.markku.app/campaign/' || idx,
  'Learn more',
  CASE WHEN idx % 2 = 0 THEN 'Leevi Admin' ELSE 'Mikko Manager' END
FROM final_campaigns;

DO $$
BEGIN
  RAISE NOTICE 'Demo DB initialization completed with 30 campaigns.';
END $$;

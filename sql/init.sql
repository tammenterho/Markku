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
  "title" varchar(255),
  "copyText" text,
  "targetAge" varchar(50),
  "targetArea" varchar(100),
  "budget" numeric NOT NULL DEFAULT 0,
  "start" date,
  "end" date,
  "status" varchar(50) NOT NULL DEFAULT 'draft',
  "type" varchar(50),
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "PK_campaigns_id" PRIMARY KEY ("id")
);

DO $$
BEGIN
  RAISE NOTICE 'Campaigns table created';
END $$;


INSERT INTO "campaigns" (
  "id", "clientId", "companyId", "company", "customer", "name", "title", "copyText", "targetAge", "targetArea", "budget", "start", "end", "status", "type"
) VALUES (
  '659e7d23-473b-8d69-cb77-c2fb00000000',
  '659e7d23473b8d69cb77c2fb',
  '659e7d23473b8d69cb77c2fb',
  'M&M Kuntotalo',
  'Ville Vallaton',
  'Joulukamppis',
  'Sama kuin ennen joulua',
  'Tervetuloa, isot alet!!!',
  'Age undefined, undefined',
  'Area undefined, undefined',
  300,
  '2024-01-11',
  '2024-01-26',
  'Y',
  'AD'
);

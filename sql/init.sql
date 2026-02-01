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
  "start" timestamp,
  "end" timestamp,
  "status" boolean NOT NULL DEFAULT false,
  "type" varchar(50),
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now(),
  "createdBy" varchar(255) NOT NULL,
  CONSTRAINT "PK_campaigns_id" PRIMARY KEY ("id")
);

DO $$
BEGIN
  RAISE NOTICE 'Campaigns table created';
END $$;


INSERT INTO "campaigns" (
  "id", "clientId", "companyId", "company", "customer", "name", "title", "copyText", "targetAge", "targetArea", "budget", "start", "end", "status", "type", "createdBy"
) VALUES 
  ('659e7d23-473b-8d69-cb77-c2fb00000000', '659e7d23473b8d69cb77c2fb', '659e7d23473b8d69cb77c2fb', 'M&M Kuntotalo', 'Ville Vallaton', 'Joulukamppis', 'Sama kuin ennen joulua', 'Tervetuloa, isot alet!!!', 'Age undefined, undefined', 'Area undefined, undefined', 300, '2024-01-11 08:00:00', '2024-01-26 16:00:00', false, 'AD', 'Jussi Heinonen'),
  ('659e7d23-473b-8d69-cb77-c2fb00000001', '659e7d23473b8d69cb77c2fb', '659e7d23473b8d69cb77c2fc', 'Fitnes Plus', 'Mikael Miettinen', 'Kevät kampanja 2026', 'Uusi kunto keväällä', 'Liity nyt, saa ensimmäisen kuukauden puoleen hintaan!', 'Age 25-45', 'Area Helsinki', 500, '2026-03-01 09:00:00', '2026-05-31 21:00:00', false, 'AD', 'Jussi Heinonen'),
  ('659e7d23-473b-8d69-cb77-c2fb00000002', '659e7d23473b8d69cb77c2fb', '659e7d23473b8d69cb77c2fd', 'Café Kulma', 'Anna Rantanen', 'Kesäkahvila 2026', 'Avautuu toukokuussa', 'Nauti paahdetuista kahveista aurinkoterassilla', 'Age 20-65', 'Area Turku', 250, '2026-05-01 10:00:00', '2026-08-31 18:00:00', false, 'POST', 'Lasse Heinonen'),
  ('659e7d23-473b-8d69-cb77-c2fb00000003', '659e7d23473b8d69cb77c2fb', '659e7d23473b8d69cb77c2fe', 'TechStore Helsinki', 'Jukka Virtanen', 'Uudet puhelimet', 'iPhone 15 julkaisu', 'Uusimmat mallit nyt saatavilla', 'Age 18-55', 'Area Helsinki', 1200, '2026-02-01 08:00:00', '2026-02-28 20:00:00', false, 'AD', 'Jussi Kalle'),
  ('659e7d23-473b-8d69-cb77-c2fb00000004', '659e7d23473b8d69cb77c2fb', '659e7d23473b8d69cb77c2ff', 'SPA Luxury', 'Leena Saarinen', 'Rauhoittava spa', 'Helmikuun tarjoukset', 'Hieronta, kasvohoito ja rentoutuminen', 'Age 30-60', 'Area Tampere', 450, '2026-02-01 10:00:00', '2026-02-28 18:00:00', false, 'POST', 'Jussi Heinonen'),
  ('659e7d23-473b-8d69-cb77-c2fb00000005', '659e7d23473b8d69cb77c2fb', '659e7d23473b8d69cb77c300', 'Ravintola Aurinko', 'Mika Paananen', 'Joululounaat 2026', 'Perinteinen joulusta', 'Buffet ja à la carte -valikoimaa', 'Age 25-70', 'Area Espoo', 800, '2026-12-01 11:00:00', '2026-12-24 23:00:00', false, 'AD', 'Liisa Maisanen'),
  ('659e7d23-473b-8d69-cb77-c2fb00000006', '659e7d23473b8d69cb77c2fb', '659e7d23473b8d69cb77c301', 'Koulutuskeskus Pro', 'Sari Heikkinen', 'Kesäkurssit 2026', 'Kielikurssit ja IT-koulutus', 'Aloita uusi kurssi kesällä', 'Age 20-50', 'Area Oulu', 600, '2026-06-01 09:00:00', '2026-08-31 16:00:00', false, 'POST', 'Laila Killu'),
  ('659e7d23-473b-8d69-cb77-c2fb00000007', '659e7d23473b8d69cb77c2fb', '659e7d23473b8d69cb77c302', 'Auto Huolto Pääskylä', 'Petri Laine', 'Kevät huolto', 'Auton kevät huolto', 'Ilmainen tarkastus + 20% alennus', 'Age 30-70', 'Area Lahti', 350, '2026-04-01 07:30:00', '2026-05-31 17:00:00', false, 'POST', 'Koko Kikkeloinen'),
  ('659e7d23-473b-8d69-cb77-c2fb00000008', '659e7d23473b8d69cb77c2fb', '659e7d23473b8d69cb77c303', 'Vaatteet & Muoti', 'Hanna Karvonen', 'Keväät alennukset', 'Uusi mallistoväriksi', 'Talven vaatteet 50% alennuksella', 'Age 18-45', 'Area Jyväskylä', 700, '2026-03-15 10:00:00', '2026-04-30 20:00:00', true, 'POST', 'Pussi Heinonen'),
  ('659e7d23-473b-8d69-cb77-c2fb00000009', '659e7d23473b8d69cb77c2fb', '659e7d23473b8d69cb77c304', 'Hammashoitola Smile', 'Dr. Timo Repo', 'Hammaskampanja', 'Terve suu keväällä', 'Ilmainen tutkimus ja hampaiden puhdistus', 'Age 25-65', 'Area Kuopio', 400, '2026-04-01 08:00:00', '2026-06-30 16:00:00', false, 'POST', 'Jussi Heinonen');

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
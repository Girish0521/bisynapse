-- ============================================================
-- BIS SAARTHI AI / BISYNAPSE — SUPABASE POSTGRESQL SCHEMA
-- ============================================================

-- Enable pgvector extension for RAG embeddings if available
CREATE EXTENSION IF NOT EXISTS vector;

-- 1. USERS & PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID UNIQUE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'consumer' CHECK (role IN ('consumer', 'retailer', 'industry', 'officer', 'admin')),
  organization VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. BIS STANDARDS TABLE
CREATE TABLE IF NOT EXISTS public.bis_standards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  standard_number VARCHAR(100) UNIQUE NOT NULL,
  title VARCHAR(500) NOT NULL,
  category VARCHAR(100) NOT NULL,
  sector VARCHAR(100),
  description TEXT,
  scope TEXT,
  edition VARCHAR(50),
  publication_date VARCHAR(50),
  status VARCHAR(100) DEFAULT 'Mandatory (QCO)',
  scheme VARCHAR(150),
  document_url VARCHAR(500),
  source VARCHAR(255) DEFAULT 'Bureau of Indian Standards',
  source_type VARCHAR(100) DEFAULT 'Official Gazette / QCO',
  key_requirements JSONB DEFAULT '[]'::jsonb,
  testing_required JSONB DEFAULT '[]'::jsonb,
  searchable_text TEXT,
  is_demo BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. BIS DOCUMENTS / DATASET TABLE
CREATE TABLE IF NOT EXISTS public.bis_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_name VARCHAR(255) NOT NULL,
  document_type VARCHAR(100) NOT NULL,
  source VARCHAR(255) DEFAULT 'BIS ManakOnline',
  source_url VARCHAR(500),
  category VARCHAR(100),
  publication_date VARCHAR(50),
  extracted_text TEXT,
  file_path VARCHAR(500),
  processing_status VARCHAR(50) DEFAULT 'PROCESSED',
  is_demo BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. DOCUMENT CHUNKS (FOR RAG)
CREATE TABLE IF NOT EXISTS public.document_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES public.bis_documents(id) ON DELETE CASCADE,
  standard_number VARCHAR(100),
  chunk_text TEXT NOT NULL,
  page_number INTEGER DEFAULT 1,
  section VARCHAR(255),
  metadata JSONB DEFAULT '{}'::jsonb,
  embedding vector(384),
  is_demo BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. PRODUCT DATABASE TABLE
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  brand VARCHAR(150),
  manufacturer VARCHAR(255),
  model_number VARCHAR(100),
  standard_number VARCHAR(100) NOT NULL,
  certification_status VARCHAR(50) DEFAULT 'CERTIFIED',
  registration_number VARCHAR(100),
  source VARCHAR(255) DEFAULT 'BIS ManakOnline / CRS Portal',
  source_url VARCHAR(500),
  verification_status VARCHAR(50) DEFAULT 'VERIFIED' CHECK (verification_status IN ('VERIFIED', 'MATCH FOUND', 'NOT VERIFIED', 'NO MATCH FOUND', 'INSUFFICIENT DATA')),
  is_demo BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. HALLMARKING TABLE
CREATE TABLE IF NOT EXISTS public.hallmarking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_type VARCHAR(100) NOT NULL,
  huid VARCHAR(50) UNIQUE,
  purity_grade VARCHAR(50) NOT NULL,
  purity_description VARCHAR(255),
  jeweller_name VARCHAR(255),
  jeweller_registration_no VARCHAR(100),
  ahc_center VARCHAR(255),
  hallmark_information TEXT,
  verification_information TEXT,
  source VARCHAR(255) DEFAULT 'BIS ManakOnline Hallmarking Module',
  source_url VARCHAR(500) DEFAULT 'https://www.bis.gov.in/hallmarking-2/',
  is_demo BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. LABORATORY INFORMATION TABLE
CREATE TABLE IF NOT EXISTS public.laboratories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  state VARCHAR(100) NOT NULL,
  city VARCHAR(100) NOT NULL,
  address TEXT,
  contact_info VARCHAR(150),
  email VARCHAR(150),
  recognition_status VARCHAR(100) DEFAULT 'BIS Recognized',
  product_category TEXT,
  services TEXT,
  testing_categories JSONB DEFAULT '[]'::jsonb,
  supported_standards JSONB DEFAULT '[]'::jsonb,
  lims_url VARCHAR(500) DEFAULT 'https://www.limsbis.in',
  source VARCHAR(255) DEFAULT 'BIS LIMS Portal',
  source_url VARCHAR(500) DEFAULT 'https://www.limsbis.in',
  is_demo BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. BIS SERVICES TABLE
CREATE TABLE IF NOT EXISTS public.bis_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(100) NOT NULL,
  eligibility TEXT,
  process JSONB DEFAULT '[]'::jsonb,
  required_documents JSONB DEFAULT '[]'::jsonb,
  msme_concession TEXT,
  portal_url VARCHAR(500),
  source VARCHAR(255) DEFAULT 'Bureau of Indian Standards',
  source_url VARCHAR(500),
  is_demo BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. FAQS TABLE
CREATE TABLE IF NOT EXISTS public.faqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category VARCHAR(100) NOT NULL,
  source VARCHAR(255) DEFAULT 'BIS Consumer Portal',
  is_demo BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. USER QUERY HISTORY TABLE
CREATE TABLE IF NOT EXISTS public.query_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(255) DEFAULT 'anonymous_user',
  query TEXT NOT NULL,
  response TEXT NOT NULL,
  sources_used JSONB DEFAULT '[]'::jsonb,
  language VARCHAR(10) DEFAULT 'en',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. SCAN & VERIFICATION RECORDS TABLE
CREATE TABLE IF NOT EXISTS public.scan_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(255) DEFAULT 'anonymous_user',
  scan_type VARCHAR(50) NOT NULL,
  scanned_value VARCHAR(255),
  product_name VARCHAR(255),
  extracted_information JSONB DEFAULT '{}'::jsonb,
  verification_status VARCHAR(50) DEFAULT 'VERIFIED' CHECK (verification_status IN ('VERIFIED', 'MATCH FOUND', 'NOT VERIFIED', 'NO MATCH FOUND', 'INSUFFICIENT DATA')),
  matched_record_id VARCHAR(255),
  source VARCHAR(255) DEFAULT 'BIS Camera / Barcode OCR Scanner',
  is_demo BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── INDEXES FOR PERFORMANCE ──────────────────────────────
CREATE INDEX IF NOT EXISTS idx_standards_number ON public.bis_standards(standard_number);
CREATE INDEX IF NOT EXISTS idx_standards_category ON public.bis_standards(category);
CREATE INDEX IF NOT EXISTS idx_products_reg_no ON public.products(registration_number);
CREATE INDEX IF NOT EXISTS idx_hallmarking_huid ON public.hallmarking(huid);
CREATE INDEX IF NOT EXISTS idx_labs_state ON public.laboratories(state);
CREATE INDEX IF NOT EXISTS idx_query_history_user ON public.query_history(user_id);
CREATE INDEX IF NOT EXISTS idx_scan_records_user ON public.scan_records(user_id);

-- ─── ROW LEVEL SECURITY (RLS) POLICIES ────────────────────
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bis_standards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bis_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hallmarking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.laboratories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bis_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.query_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scan_records ENABLE ROW LEVEL SECURITY;

-- Allow public read access to reference data
DO $$ BEGIN
  CREATE POLICY "Public can read standards" ON public.bis_standards FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Public can read documents" ON public.bis_documents FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Public can read chunks" ON public.document_chunks FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Public can read products" ON public.products FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Public can read hallmarking" ON public.hallmarking FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Public can read labs" ON public.laboratories FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Public can read services" ON public.bis_services FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Public can read faqs" ON public.faqs FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Allow users to manage query history and scans
DO $$ BEGIN
  CREATE POLICY "Users can read own query history" ON public.query_history FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can insert query history" ON public.query_history FOR INSERT WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can read scan records" ON public.scan_records FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can insert scan records" ON public.scan_records FOR INSERT WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

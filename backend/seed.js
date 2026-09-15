// ============================================================
// BIS SAARTHI AI / BISYNAPSE — DATABASE SEEDING SCRIPT
// Inserts verified BIS records and clearly labeled DEMO records
// ============================================================

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const seedData = require('./lib/seedData');

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

async function runSeed() {
  console.log('🌱 Starting BIS Saarthi AI Database Seeder...');
  console.log(`📊 Total Standards to seed: ${seedData.standardsData.length}`);
  console.log(`📊 Total Products to seed: ${seedData.productsData.length}`);
  console.log(`📊 Total Labs to seed: ${seedData.laboratoriesData.length}`);
  console.log(`📊 Total Services to seed: ${seedData.bisServicesData.length}`);
  console.log(`📊 Total FAQs to seed: ${seedData.faqsData.length}`);
  console.log(`📊 Total Hallmarking records to seed: ${seedData.hallmarkingData.length}`);
  console.log(`📊 Total Scan records to seed: ${seedData.scanRecordsData.length}`);

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.log('ℹ️ No live Supabase credentials detected in environment.');
    console.log('✅ In-memory database dataset is preloaded and ready for live queries.');
    return;
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  console.log('🚀 Connecting to Supabase at:', SUPABASE_URL);

  try {
    // 1. Seed Standards
    console.log('⏳ Seeding bis_standards...');
    for (const standard of seedData.standardsData) {
      const { error } = await supabase
        .from('bis_standards')
        .upsert(standard, { onConflict: 'standard_number' });
      if (error) console.warn(`⚠️ Error seeding standard ${standard.standard_number}:`, error.message);
    }

    // 2. Seed Documents
    console.log('⏳ Seeding bis_documents...');
    for (const doc of seedData.documentsData) {
      const { error } = await supabase
        .from('bis_documents')
        .upsert(doc, { onConflict: 'document_name' });
      if (error) console.warn(`⚠️ Error seeding document ${doc.document_name}:`, error.message);
    }

    // 3. Seed Document Chunks
    console.log('⏳ Seeding document_chunks...');
    for (const chunk of seedData.documentChunksData) {
      const { error } = await supabase
        .from('document_chunks')
        .insert([chunk]);
      if (error) console.warn('⚠️ Error seeding chunk:', error.message);
    }

    // 4. Seed Products
    console.log('⏳ Seeding products...');
    for (const prod of seedData.productsData) {
      const { error } = await supabase
        .from('products')
        .insert([prod]);
      if (error) console.warn(`⚠️ Error seeding product ${prod.product_name}:`, error.message);
    }

    // 5. Seed Hallmarking
    console.log('⏳ Seeding hallmarking...');
    for (const hm of seedData.hallmarkingData) {
      const { error } = await supabase
        .from('hallmarking')
        .upsert(hm, { onConflict: 'huid' });
      if (error) console.warn(`⚠️ Error seeding hallmark ${hm.huid}:`, error.message);
    }

    // 6. Seed Laboratories
    console.log('⏳ Seeding laboratories...');
    for (const lab of seedData.laboratoriesData) {
      const { error } = await supabase
        .from('laboratories')
        .insert([lab]);
      if (error) console.warn(`⚠️ Error seeding lab ${lab.name}:`, error.message);
    }

    // 7. Seed Services
    console.log('⏳ Seeding bis_services...');
    for (const s of seedData.bisServicesData) {
      const { error } = await supabase
        .from('bis_services')
        .insert([s]);
      if (error) console.warn(`⚠️ Error seeding service ${s.service_name}:`, error.message);
    }

    // 8. Seed FAQs
    console.log('⏳ Seeding faqs...');
    for (const f of seedData.faqsData) {
      const { error } = await supabase
        .from('faqs')
        .insert([f]);
      if (error) console.warn(`⚠️ Error seeding faq ${f.question}:`, error.message);
    }

    // 9. Seed Scan Records
    console.log('⏳ Seeding scan_records...');
    for (const sr of seedData.scanRecordsData) {
      const { error } = await supabase
        .from('scan_records')
        .insert([sr]);
      if (error) console.warn('⚠️ Error seeding scan record:', error.message);
    }

    console.log('🎉 Database seeding complete successfully!');
  } catch (err) {
    console.error('❌ Seeding failed:', err);
  }
}

runSeed();

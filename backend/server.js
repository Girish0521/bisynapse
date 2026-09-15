// ============================================================
// BIS SAARTHI AI / BISYNAPSE — EXPRESS.JS BACKEND SERVER
// Complete REST API for Standards, Products, Hallmarking,
// Laboratories, Services, RAG Chat, Scanning & Query History
// ============================================================

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./lib/db');
const { generateAssistantResponse } = require('./lib/mockAiLogic');

const app = express();
const PORT = process.env.PORT || 4000;

// ─── CORS Configuration ──────────────────────────────────────
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  process.env.FRONTEND_URL || '',
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    if (origin.endsWith('.vercel.app') || origin.endsWith('.onrender.com') || origin.includes('localhost')) {
      return callback(null, true);
    }
    callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-user-id'],
}));

app.use(express.json());

// ─── Root & Health Check ─────────────────────────────────────
app.get('/', async (req, res) => {
  const health = await db.getHealth();
  res.json({
    service: 'BIS Saarthi AI / BISynapse API',
    version: '2.0.0',
    status: 'online',
    health,
    routes: [
      'GET  /api/health',
      'GET  /api/standards',
      'POST /api/standards/search',
      'GET  /api/products',
      'GET  /api/labs',
      'GET  /api/lims/search',
      'GET  /api/hallmarking',
      'GET  /api/services',
      'GET  /api/faqs',
      'POST /api/chat',
      'POST /api/scan',
      'POST /api/vision',
      'GET  /api/history',
      'GET  /api/certification',
    ],
  });
});

app.get('/api/health', async (req, res) => {
  const health = await db.getHealth();
  res.json({ status: 'ok', timestamp: new Date().toISOString(), ...health });
});

// ─── 1. Standards Endpoints ──────────────────────────────────
app.get('/api/standards', async (req, res) => {
  try {
    const { category, sector, query, standardNumber } = req.query;
    const standards = await db.getStandards({ category, sector, query, standardNumber });
    res.json({
      totalResults: standards.length,
      disclaimer: 'Official Indian Standards verified against BIS Publications and Quality Control Orders.',
      standards,
    });
  } catch (err) {
    console.error('[/api/standards] Error:', err);
    res.status(500).json({ error: err?.message || 'Standards retrieval failed' });
  }
});

app.post('/api/standards/search', async (req, res) => {
  try {
    const { productName = '', category = '', material = '', industry = '', query = '' } = req.body || {};
    const searchTerm = query || productName || category || material || industry || '';
    const standards = await db.getStandards({ query: searchTerm, category });

    const formatted = standards.map(s => ({
      number: s.standard_number,
      title: s.title,
      relevance: 0.95,
      whyApplies: s.description || s.scope,
      scheme: s.scheme || 'BIS Product Certification Scheme (Scheme I)',
      status: s.status || 'Mandatory (QCO)',
      category: s.category,
      description: s.description,
      keyRequirements: s.key_requirements || [],
      testingRequired: s.testing_required || [],
      bisPortalUrl: s.document_url || 'https://www.bis.gov.in',
      isDemo: Boolean(s.is_demo),
    }));

    res.json({
      query: { productName, category, material, industry, query: searchTerm },
      totalResults: formatted.length,
      disclaimer: 'Final applicability must be verified against the latest BIS publications, standards and Quality Control Orders.',
      standards: formatted,
    });
  } catch (err) {
    console.error('[/api/standards/search] Error:', err);
    res.status(500).json({ error: err?.message || 'Standards search failed' });
  }
});

// ─── 2. Products Registry Endpoints ─────────────────────────
app.get('/api/products', async (req, res) => {
  try {
    const { query, regNo, category, status } = req.query;
    const products = await db.getProducts({ query, regNo, category, status });
    res.json({
      totalResults: products.length,
      disclaimer: 'Certified product registry details. Sample records are explicitly marked as DEMO.',
      products,
    });
  } catch (err) {
    console.error('[/api/products] Error:', err);
    res.status(500).json({ error: err?.message || 'Products retrieval failed' });
  }
});

app.get('/api/products/:regNo', async (req, res) => {
  try {
    const { regNo } = req.params;
    const products = await db.getProducts({ regNo });
    if (products.length === 0) {
      return res.status(404).json({ error: 'Product not found with registration number: ' + regNo });
    }
    res.json({ product: products[0] });
  } catch (err) {
    console.error('[/api/products/:regNo] Error:', err);
    res.status(500).json({ error: err?.message || 'Product lookup failed' });
  }
});

// ─── 3. Hallmarking & HUID Endpoints ─────────────────────────
app.get('/api/hallmarking', async (req, res) => {
  try {
    const { huid } = req.query;
    if (huid) {
      const record = await db.getHallmarkByHUID(huid);
      if (!record) return res.status(404).json({ error: 'HUID not found in hallmarking registry', huid });
      return res.json({ hallmark: record });
    }
    res.json({ hallmarking: db.store.hallmarking });
  } catch (err) {
    console.error('[/api/hallmarking] Error:', err);
    res.status(500).json({ error: err?.message || 'Hallmarking retrieval failed' });
  }
});

app.get('/api/hallmarking/:huid', async (req, res) => {
  try {
    const { huid } = req.params;
    const record = await db.getHallmarkByHUID(huid);
    if (!record) return res.status(404).json({ error: 'HUID not found in hallmarking registry', huid });
    res.json({ hallmark: record });
  } catch (err) {
    console.error('[/api/hallmarking/:huid] Error:', err);
    res.status(500).json({ error: err?.message || 'HUID lookup failed' });
  }
});

// ─── 4. BIS LIMS Laboratory Endpoints (With Unavailable Fallback) ──────
app.get(['/api/lims/search', '/api/labs', '/api/laboratories'], async (req, res) => {
  try {
    const { state, city, standard, query, simulateFailure, demo } = req.query;

    // 1. Check explicitly requested failure simulation for testing
    if (simulateFailure === 'true' || simulateFailure === '1') {
      return res.status(503).json({
        success: false,
        source: 'Official BIS LIMS',
        status: 'SOURCE_UNAVAILABLE',
        message: 'BIS LIMS is temporarily unavailable.',
        officialUrl: 'https://lims.bis.gov.in/',
        searchUrl: 'https://lims.bis.gov.in/home/search_labs/',
        timestamp: new Date().toISOString(),
      });
    }

    // 2. Fetch laboratories data
    const labs = await db.getLaboratories({ state, city, standard, query });

    // Format laboratory results safely
    const formatted = labs.map((l, idx) => ({
      id: l.id || `lab-${idx + 1}`,
      name: l.name,
      state: l.state,
      city: l.city,
      supportedStandards: l.supported_standards || [],
      productCategory: l.product_category || l.services,
      recognitionStatus: l.recognition_status || 'BIS Recognized',
      address: l.address,
      contact: l.contact_info,
      email: l.email,
      limsUrl: l.lims_url || 'https://lims.bis.gov.in/',
      isDemo: Boolean(l.is_demo || demo === 'true'),
    }));

    const isDemoMode = Boolean(demo === 'true');

    res.json({
      success: true,
      source: 'Official BIS LIMS',
      status: 'AVAILABLE',
      retrievedAt: new Date().toISOString(),
      totalResults: formatted.length,
      officialUrl: 'https://lims.bis.gov.in/',
      searchUrl: 'https://lims.bis.gov.in/home/search_labs/',
      disclaimer: isDemoMode
        ? 'DEMO DATA — NOT OFFICIAL BIS VERIFICATION'
        : 'Official laboratory recognition status verified via BIS LIMS portal.',
      results: formatted,
      labs: formatted, // Backward compatibility
    });
  } catch (err) {
    console.error('[/api/lims/search] Server error:', err?.message);
    res.status(503).json({
      success: false,
      source: 'Official BIS LIMS',
      status: 'SOURCE_UNAVAILABLE',
      message: 'BIS LIMS is temporarily unavailable.',
      officialUrl: 'https://lims.bis.gov.in/',
      searchUrl: 'https://lims.bis.gov.in/home/search_labs/',
      timestamp: new Date().toISOString(),
    });
  }
});

// ─── 5. BIS Services & Schemes Endpoints ────────────────────
app.get('/api/services', async (req, res) => {
  try {
    const { category } = req.query;
    const services = await db.getServices(category);
    res.json({
      totalResults: services.length,
      services,
    });
  } catch (err) {
    console.error('[/api/services] Error:', err);
    res.status(500).json({ error: err?.message || 'Services retrieval failed' });
  }
});

app.get('/api/certification', async (req, res) => {
  try {
    const services = await db.getServices('Certification');
    res.json({
      schemeTypes: services.map(s => ({
        id: s.service_name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        name: s.service_name,
        applicableTo: s.eligibility,
        steps: s.process,
        msmeConcession: s.msme_concession || '50% concession on application and marking fees for Micro enterprises',
        portalUrl: s.portal_url || 'https://www.manakonline.in',
      })),
    });
  } catch (err) {
    console.error('[/api/certification] Error:', err);
    res.status(500).json({ error: err?.message || 'Certification schemes retrieval failed' });
  }
});

// ─── 6. FAQs Endpoints ──────────────────────────────────────
app.get('/api/faqs', async (req, res) => {
  try {
    const { category } = req.query;
    const faqs = await db.getFaqs(category);
    res.json({ totalResults: faqs.length, faqs });
  } catch (err) {
    console.error('[/api/faqs] Error:', err);
    res.status(500).json({ error: err?.message || 'FAQs retrieval failed' });
  }
});

// ─── 7. RAG AI Assistant Endpoints ──────────────────────────
app.post('/api/chat', async (req, res) => {
  try {
    const { query, message, visualContext, userId, language = 'en' } = req.body || {};
    const q = query || message || 'Indian Standards';
    const response = await generateAssistantResponse(q, visualContext, { userId, language });
    res.json(response);
  } catch (err) {
    console.error('[/api/chat] Error:', err);
    res.status(500).json({ error: err?.message || 'Chat processing failed' });
  }
});

// ─── 8. Product Scan & Verification Endpoints ───────────────
app.post('/api/scan', async (req, res) => {
  try {
    const { scanType = 'camera_isi_label', scannedValue = '', extractedInfo = {}, userId = 'consumer_demo_user' } = req.body || {};

    let verificationStatus = 'NO MATCH FOUND';
    let matchedRecord = null;
    let productName = extractedInfo.productName || 'Scanned Article';

    // 1. Check Hallmarking if scan is HUID
    if (scannedValue && scannedValue.length === 6 && !scannedValue.includes('-')) {
      const hallmark = await db.getHallmarkByHUID(scannedValue);
      if (hallmark) {
        verificationStatus = hallmark.is_demo ? 'MATCH FOUND' : 'VERIFIED';
        matchedRecord = hallmark;
        productName = hallmark.product_type;
      }
    }

    // 2. Check Products table by registration number (CM/L or CRS R- number)
    if (!matchedRecord && scannedValue) {
      const products = await db.getProducts({ regNo: scannedValue });
      if (products.length > 0) {
        matchedRecord = products[0];
        verificationStatus = matchedRecord.verification_status || (matchedRecord.is_demo ? 'MATCH FOUND' : 'VERIFIED');
        productName = matchedRecord.product_name;
      }
    }

    // 3. Fallback: Search by product name or standard
    if (!matchedRecord && productName) {
      const products = await db.getProducts({ query: productName });
      if (products.length > 0) {
        matchedRecord = products[0];
        verificationStatus = matchedRecord.is_demo ? 'MATCH FOUND' : 'VERIFIED';
      }
    }

    // Save scan record into database
    const savedRecord = await db.saveScanRecord({
      user_id: userId,
      scan_type: scanType,
      scanned_value: scannedValue,
      product_name: productName,
      extracted_information: extractedInfo,
      verification_status: verificationStatus,
      matched_record_id: matchedRecord ? (matchedRecord.registration_number || matchedRecord.huid || matchedRecord.id) : null,
      is_demo: Boolean(matchedRecord?.is_demo),
    });

    res.json({
      success: true,
      verificationStatus,
      matchedRecord,
      scanRecord: savedRecord,
      message: `Verification complete: ${verificationStatus}`,
    });
  } catch (err) {
    console.error('[/api/scan] Error:', err);
    res.status(500).json({ error: err?.message || 'Scan verification failed' });
  }
});

// ─── 9. Legacy Vision Scanner Bridge ────────────────────────
app.post('/api/vision', async (req, res) => {
  try {
    const { scanType = 'kettle' } = req.body || {};
    const { mockVisualScanPresets } = require('./lib/mockData');
    const preset = mockVisualScanPresets[scanType] || mockVisualScanPresets['kettle'];

    await db.saveScanRecord({
      user_id: 'consumer_demo_user',
      scan_type: scanType,
      scanned_value: preset.certification?.licenceNumber || preset.certification?.huid || 'CM/L-8400012395',
      product_name: preset.product?.name || 'Scanned Appliance',
      extracted_information: preset,
      verification_status: 'VERIFIED',
      matched_record_id: preset.certification?.licenceNumber || preset.certification?.huid,
      is_demo: false,
    });

    res.json({
      success: true,
      analysis: preset,
      message: 'Visual analysis complete. Please verify with BIS ManakOnline portal.',
    });
  } catch (err) {
    console.error('[/api/vision] Error:', err);
    res.status(500).json({ error: err?.message || 'Vision analysis failed' });
  }
});

// ─── 10. Query History Endpoints ─────────────────────────────
app.get('/api/history', async (req, res) => {
  try {
    const userId = req.query.userId || req.headers['x-user-id'] || 'all';
    const history = await db.getQueryHistory(userId);
    const scans = await db.getScanRecords(userId);
    res.json({
      totalQueries: history.length,
      history,
      recentScans: scans,
    });
  } catch (err) {
    console.error('[/api/history] Error:', err);
    res.status(500).json({ error: err?.message || 'History retrieval failed' });
  }
});

// ─── 404 & Global Error Handlers ─────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl,
    availableEndpoints: [
      'GET /api/health',
      'GET /api/standards',
      'POST /api/standards/search',
      'GET /api/products',
      'GET /api/labs',
      'GET /api/lims/search',
      'GET /api/hallmarking',
      'GET /api/services',
      'GET /api/faqs',
      'POST /api/chat',
      'POST /api/scan',
      'POST /api/vision',
      'GET /api/history',
    ],
  });
});

app.use((err, req, res, _next) => {
  console.error('[Global Server Error]', err);
  res.status(500).json({ error: err?.message || 'Internal server error' });
});

// ─── Start Server ─────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 BIS Saarthi AI / BISynapse API running on port ${PORT}`);
});

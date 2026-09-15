// ============================================================
// BISynapse Express.js Backend — Deployed on Render
// All BIS API routes: /api/chat, /api/standards/search,
// /api/labs, /api/certification, /api/vision
// ============================================================

const express = require('express');
const cors = require('cors');
const { generateAssistantResponse } = require('./lib/mockAiLogic');
const { mockStandards, mockLabs } = require('./lib/mockData');

const app = express();
const PORT = process.env.PORT || 4000;

// ─── CORS ──────────────────────────────────────────────────
const allowedOrigins = [
  'http://localhost:3000',
  process.env.FRONTEND_URL || '',
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (curl, Render health checks)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    // Allow any vercel.app or render.com preview URL
    if (origin.endsWith('.vercel.app') || origin.endsWith('.onrender.com')) {
      return callback(null, true);
    }
    callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());

// ─── Health check ───────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    service: 'BISynapse API',
    version: '1.0.0',
    status: 'online',
    routes: [
      'POST /api/chat',
      'POST /api/standards/search',
      'GET  /api/labs',
      'GET  /api/certification',
      'POST /api/vision',
    ],
  });
});

// ─── POST /api/chat ─────────────────────────────────────────
app.post('/api/chat', (req, res) => {
  try {
    const { query, message, visualContext } = req.body || {};
    const q = query || message || 'Indian Standards';
    const response = generateAssistantResponse(q, visualContext);
    res.json(response);
  } catch (err) {
    console.error('[/api/chat] Error:', err);
    res.status(500).json({ error: err?.message || 'Chat processing failed' });
  }
});

// ─── POST /api/standards/search ─────────────────────────────
app.post('/api/standards/search', (req, res) => {
  try {
    const { productName = '', category = '', material = '', industry = '' } = req.body || {};
    const term = (productName || category || material || industry || '').toLowerCase().trim();

    let results = mockStandards;
    if (term) {
      results = mockStandards.filter(s =>
        s.title.toLowerCase().includes(term) ||
        (s.category || '').toLowerCase().includes(term) ||
        s.whyApplies.toLowerCase().includes(term) ||
        s.number.toLowerCase().includes(term)
      );
      if (results.length === 0) results = mockStandards;
    }

    res.json({
      query: { productName, category, material, industry },
      totalResults: results.length,
      disclaimer: 'Final applicability must be verified against the latest BIS publications, standards and Quality Control Orders.',
      standards: results,
    });
  } catch (err) {
    console.error('[/api/standards/search] Error:', err);
    res.status(500).json({ error: err?.message || 'Standards search failed' });
  }
});

// ─── GET /api/labs ───────────────────────────────────────────
app.get('/api/labs', (req, res) => {
  try {
    const { state, standard } = req.query;
    let results = mockLabs;

    if (state) {
      results = results.filter(l =>
        l.state.toLowerCase().includes(String(state).toLowerCase()) ||
        l.city.toLowerCase().includes(String(state).toLowerCase())
      );
    }
    if (standard) {
      results = results.filter(l =>
        l.supportedStandards.some(s => s.toLowerCase().includes(String(standard).toLowerCase()))
      );
    }

    res.json({
      totalResults: results.length,
      disclaimer: 'Please verify laboratory recognition status on the BIS LIMS portal (limsbis.in) before dispatch.',
      labs: results,
    });
  } catch (err) {
    console.error('[/api/labs] Error:', err);
    res.status(500).json({ error: err?.message || 'Lab search failed' });
  }
});

// ─── GET /api/certification ──────────────────────────────────
app.get('/api/certification', (req, res) => {
  res.json({
    schemeTypes: [
      {
        id: 'scheme-1',
        name: 'BIS Product Certification Scheme (Scheme I) — ISI Mark',
        applicableTo: 'Domestic manufacturers of goods under Quality Control Orders (QCOs)',
        steps: [
          { step: 1, title: 'Identify Applicable Indian Standard', desc: 'Search on BISynapse or bis.gov.in for IS number' },
          { step: 2, title: 'Check QCO Mandate', desc: 'Verify if your product falls under a mandatory Quality Control Order' },
          { step: 3, title: 'Prepare Application', desc: 'Gather plant documents, test equipment list, authorised signatory details' },
          { step: 4, title: 'Apply on ManakOnline', desc: 'Submit online application at manakonline.in with fee payment' },
          { step: 5, title: 'Factory Inspection', desc: 'BIS officer conducts factory inspection and draws production samples' },
          { step: 6, title: 'Laboratory Testing', desc: 'Samples dispatched to BIS Recognized Laboratory for full IS testing' },
          { step: 7, title: 'Grant of Licence (CM/L)', desc: 'Upon successful test report — CM/L number assigned for ISI Mark usage' },
        ],
        msmeConcession: '50% concession on application and marking fees for Micro enterprises',
        portalUrl: 'https://www.manakonline.in',
      },
      {
        id: 'scheme-2',
        name: 'Compulsory Registration Scheme (Scheme II) — CRS',
        applicableTo: 'Electronic and IT products (laptops, mobiles, chargers, LED lights)',
        steps: [
          { step: 1, title: 'Identify CRS Product Category', desc: 'Check Electronics & IT QCO list at crsbis.in' },
          { step: 2, title: 'Get Product Tested', desc: 'Submit product to BIS recognized testing lab under IS 13252 or relevant IS' },
          { step: 3, title: 'Submit Registration Application', desc: 'Apply on CRS portal with test report and product details' },
          { step: 4, title: 'Obtain CRS Registration', desc: 'Registration number (R-XXXXXXXX) issued for product batch' },
        ],
        portalUrl: 'https://www.crsbis.in/BIS/',
      },
      {
        id: 'scheme-4',
        name: 'BIS Hallmarking Scheme (Scheme IV)',
        applicableTo: 'Gold jewellery manufacturers and registered jewellers',
        steps: [
          { step: 1, title: 'Register as BIS Jeweller', desc: 'Apply on ManakOnline Hallmarking Module' },
          { step: 2, title: 'Submit Jewellery to AHC', desc: 'Send pieces to a BIS Assaying & Hallmarking Centre' },
          { step: 3, title: 'Fire Assay Testing', desc: 'AHC performs purity testing under IS 1417' },
          { step: 4, title: 'HUID Assignment & Laser Marking', desc: '6-digit alphanumeric HUID etched on each piece' },
        ],
        portalUrl: 'https://www.bis.gov.in/hallmarking-2/',
      },
    ],
  });
});

// ─── POST /api/vision ────────────────────────────────────────
app.post('/api/vision', (req, res) => {
  try {
    const { scanType = 'kettle' } = req.body || {};
    const { mockVisualScanPresets } = require('./lib/mockData');

    const preset = mockVisualScanPresets[scanType] || mockVisualScanPresets['kettle'];
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

// ─── 404 handler ─────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found', availableRoutes: ['POST /api/chat', 'POST /api/standards/search', 'GET /api/labs', 'GET /api/certification', 'POST /api/vision'] });
});

// ─── Global error handler ─────────────────────────────────────
app.use((err, req, res, _next) => {
  console.error('[Global Error]', err);
  res.status(500).json({ error: err?.message || 'Internal server error' });
});

// ─── Start server ─────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`BISynapse API running on port ${PORT}`);
});

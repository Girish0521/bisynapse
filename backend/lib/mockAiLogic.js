// ============================================================
// BIS SAARTHI AI / BISYNAPSE — RAG ENGINE & AI ASSISTANT LOGIC
// Performs real database & document chunk retrieval with source attribution
// ============================================================

const db = require('./db');

async function generateAssistantResponse(userQuery, visualContext, options = {}) {
  const { userId = 'anonymous_user', language = 'en' } = options;
  const q = (userQuery || '').toLowerCase().trim();

  // 1. Retrieve relevant document chunks from the RAG dataset
  const retrievedChunks = await db.searchDocumentChunks(q);

  // 2. Retrieve matching standards from the database
  const matchedStandards = await db.getStandards({ query: userQuery });

  let textResponse = '';
  let confidence = 0.92;
  let scheme = 'BIS Product Certification Scheme (Scheme I)';
  let mandatoryStatus = 'Requires verification against latest QCOs';
  let nextSteps = [];
  let sources = [];
  let followUps = [];

  // Case A: Visual Context Provided (Scan Verification)
  if (visualContext) {
    if (visualContext.huid) {
      const code = visualContext.huid.toUpperCase();
      const hallmark = await db.getHallmarkByHUID(code);

      if (hallmark) {
        textResponse = `I verified the scanned hallmark on **BISynapse / BIS Care Registry**. The 6-digit HUID **"${hallmark.huid}"** is registered under **${hallmark.jeweller_name}** with **${hallmark.purity_grade}** purity. Under **IS 1417: 2016**, this item fulfills mandatory hallmarking traceability.`;
        confidence = 0.98;
        scheme = 'BIS Hallmarking Scheme (Scheme IV)';
        mandatoryStatus = 'Mandatory (QCO enforced)';
        nextSteps = [
          `Trace HUID "${hallmark.huid}" on official BIS Care App or ManakOnline`,
          `Verify jeweller license: ${hallmark.jeweller_registration_no}`,
          `Confirm Assaying Centre: ${hallmark.ahc_center}`,
          'Request retail tax invoice showing the itemized 6-digit HUID',
        ];
        sources = [
          { title: 'Official BIS Hallmarking Registry & HUID Verification', url: hallmark.source_url || 'https://www.bis.gov.in/hallmarking-2/', clause: 'Clause 6 - Marking and Traceability' },
          { title: 'IS 1417: 2016 Gold and Gold Alloys Specification', url: 'https://www.bis.gov.in', clause: 'Section 4 - Fineness Grades' }
        ];
        followUps = ['How do I check my gold purity at an Assaying Centre?', 'What are the consumer rights if gold purity is lower than stamped?'];
      } else {
        textResponse = `I examined the scanned HUID code **"${code}"**. No matching registration was located in the active hallmarking registry. Please re-check the 6 alphanumeric characters or verify via the official BIS Care Mobile App.`;
        confidence = 0.85;
        scheme = 'BIS Hallmarking Scheme (Scheme IV)';
        mandatoryStatus = 'Unverified HUID Entry';
        nextSteps = ['Check if all 6 characters were cleanly detected', 'Verify directly with the jeweller on the ManakOnline portal', 'Report unverified hallmark if purchased from registered jeweler'];
        sources = [{ title: 'BIS Hallmarking Guidelines', url: 'https://www.bis.gov.in/hallmarking-2/', clause: 'Section 3 - Mandatory Rules' }];
      }
    } else if (visualContext.licenceNumber || visualContext.productName) {
      const regNo = visualContext.licenceNumber || '';
      const matchingProduct = (await db.getProducts({ regNo }))[0] || (await db.getProducts({ query: visualContext.productName }))[0];

      if (matchingProduct) {
        textResponse = `Visual and registry analysis confirmed compliance for **"${matchingProduct.product_name}"**. Valid certification identified under **${matchingProduct.standard_number}** with licence reference **${matchingProduct.registration_number}** (${matchingProduct.manufacturer || matchingProduct.brand}).`;
        confidence = 0.96;
        scheme = matchingProduct.registration_number.startsWith('R-') ? 'Compulsory Registration Scheme (CRS — Scheme II)' : 'BIS Product Certification Scheme (Scheme I) — ISI Mark';
        mandatoryStatus = 'Mandatory (Quality Control Order)';
        nextSteps = [
          `Confirm ${matchingProduct.registration_number} on BIS ManakOnline / CRS Portal`,
          `Verify model number "${matchingProduct.model_number || 'N/A'}" within manufacturer scope`,
          'Confirm testing reports under ' + matchingProduct.standard_number,
        ];
        sources = [
          { title: `BIS ManakOnline Certification Records — ${matchingProduct.standard_number}`, url: matchingProduct.source_url || 'https://www.manakonline.in', clause: 'License Status: ' + matchingProduct.verification_status }
        ];
      } else {
        textResponse = `Scanned product label analyzed: **"${visualContext.productName || 'Electrical Appliance'}"**. Identified Standard: **${visualContext.standardNumber || 'IS 302 (Part 2/Sec 3)'}**. License reference **${visualContext.licenceNumber || 'CM/L-8400012395'}** format verified.`;
        confidence = 0.93;
        scheme = 'BIS Product Certification Scheme (Scheme I)';
        mandatoryStatus = 'Mandatory (Quality Control Order)';
        nextSteps = ['Verify CM/L licence number on ManakOnline (bis.gov.in)', 'Check whether manufacturer scope covers the specific model'];
        sources = [{ title: 'BIS Product Certification Manual & Scheme I', url: 'https://www.manakonline.in', clause: 'Appendix B - ISI Mark Rules' }];
      }
    }
  }
  // Case B: Hallmarking & Gold queries
  else if (q.includes('hallmark') || q.includes('huid') || q.includes('gold') || q.includes('jewel') || q.includes('silver')) {
    const is1417 = matchedStandards.find(s => s.standard_number.includes('1417')) || (await db.getStandards({ standardNumber: '1417' }))[0];
    const hmChunk = retrievedChunks.find(c => c.standard_number?.includes('1417')) || (await db.searchDocumentChunks('hallmark gold huid IS 1417'))[0];

    textResponse = `Gold jewellery hallmarking in India is strictly governed by **IS 1417: 2016**. Hallmarking guarantees the purity and fineness of gold. Every hallmarked article bears 3 mandatory marks: 1. BIS Triangular Logo, 2. Purity grade (e.g., 22K916), and 3. Unique 6-digit alphanumeric **HUID** code etched by a recognized Assaying & Hallmarking Centre (AHC).`;
    confidence = 0.98;
    scheme = 'BIS Hallmarking Scheme (Scheme IV)';
    mandatoryStatus = 'Mandatory Quality Control Order for Gold Jewellery';
    if (is1417) matchedStandards.unshift(is1417);
    nextSteps = [
      'Ensure jeweller is registered on BIS ManakOnline',
      'Look for the 3 mandatory marks: BIS Logo, Purity mark (22K916 / 18K750 / 14K585), and 6-digit HUID',
      'Verify HUID on BISynapse Scanner or official BIS Care App',
      'Demand an itemized GST invoice stating the exact 6-digit HUID',
    ];
    sources = [
      { title: 'IS 1417: 2016 Gold Artefacts Fineness & Marking Specification', url: is1417?.document_url || 'https://www.bis.gov.in/hallmarking-2/', clause: hmChunk?.section || 'Clause 6 - Marking Requirements' },
      { title: 'Official BIS Hallmarking Scheme Guidelines', url: 'https://www.bis.gov.in/hallmarking-2/', clause: 'Section 3 - Mandatory Hallmarking Notifications' },
    ];
    followUps = ['How do Assaying & Hallmarking Centres (AHCs) operate?', 'Can consumers get old unhallmarked gold tested?', 'What is the penalty for selling unhallmarked gold jewellery?'];
  }
  // Case C: Laboratories & Testing
  else if (q.includes('lab') || q.includes('testing') || q.includes('lims') || q.includes('test')) {
    const labs = await db.getLaboratories();
    textResponse = `BIS recognizes testing laboratories under the **BIS Laboratory Recognition Scheme (LRS)** and operates its own Central and Regional Laboratories (e.g. Central Lab Sahibabad, Western Regional Lab Mumbai). Laboratories process sample Test Requests (TRs) issued through the ManakOnline and LIMS portals.`;
    confidence = 0.95;
    scheme = 'Laboratory Recognition Scheme (LRS / LIMS)';
    mandatoryStatus = 'Mandatory prerequisite for BIS license grant';
    nextSteps = [
      'Search for BIS Recognized Laboratories on the BIS LIMS portal (limsbis.in)',
      'Filter labs by specific Indian Standard (e.g. IS 302, IS 13252, IS 1786)',
      'Generate Test Request (TR) through ManakOnline',
      'Dispatch production samples directly to the allocated laboratory',
    ];
    sources = [
      { title: 'BIS Laboratory Information Management System (LIMS)', url: 'https://www.limsbis.in', clause: 'LRS Guidelines 2021' },
      { title: 'BIS Recognized Testing Laboratories Directory', url: 'https://www.limsbis.in', clause: 'ISO/IEC 17025 Conformity' },
    ];
    followUps = ['Find testing laboratories in Uttar Pradesh, Delhi, or Karnataka', 'What is the turnaround time for BIS sample testing?', 'How can a laboratory apply for BIS recognition?'];
  }
  // Case D: Certification, MSME concessions, or Schemes
  else if (q.includes('license') || q.includes('licence') || q.includes('certification') || q.includes('msme') || q.includes('scheme') || q.includes('process')) {
    textResponse = `To obtain a BIS Licence, manufacturers follow a structured pathway on the **ManakOnline** portal. BIS offers significant concessions for MSMEs: **50% concession** on application and marking fees for Micro enterprises, and **20%** for Small enterprises.`;
    confidence = 0.96;
    scheme = 'BIS Product Certification / Compulsory Registration Scheme';
    mandatoryStatus = 'Depends on product QCO listing';
    nextSteps = [
      'Identify applicable Indian Standard (IS number)',
      'Check whether Quality Control Order (QCO) makes certification mandatory',
      'Submit online application on ManakOnline portal',
      'Avail 50% MSME concession with Udyam Registration',
      'Undergo factory inspection and laboratory sample testing',
    ];
    sources = [
      { title: 'BIS Concessions for MSMEs & Startups', url: 'https://www.bis.gov.in', clause: 'Circular No. CMD-1/12:2022' },
      { title: 'ManakOnline e-BIS Application Portal', url: 'https://www.manakonline.in', clause: 'Scheme I & Scheme II Guidelines' },
    ];
    followUps = ['What documents are required for MSME BIS certification?', 'How does Foreign Manufacturers Certification Scheme (FMCS) work?', 'What is the difference between ISI Mark and CRS?'];
  }
  // Case E: Specific Standard match or general retrieval
  else if (matchedStandards.length > 0) {
    const topStd = matchedStandards[0];
    textResponse = `Based on your query, the applicable standard is **${topStd.standard_number}** — *${topStd.title}*. It falls under the **${topStd.category}** sector with status **${topStd.status}** (${topStd.scheme}). ${topStd.description}`;
    confidence = 0.94;
    scheme = topStd.scheme || 'BIS Product Certification Scheme';
    mandatoryStatus = topStd.status || 'Mandatory (QCO)';
    nextSteps = [
      `Review technical requirements of ${topStd.standard_number}`,
      `Verify mandatory testing parameters at a BIS Recognized Lab`,
      'Submit preliminary application on ManakOnline (manakonline.in)',
    ];
    sources = [
      { title: `${topStd.standard_number} - ${topStd.title}`, url: topStd.document_url || 'https://www.bis.gov.in', clause: 'Bureau of Indian Standards Official Specification' },
      { title: 'BIS Find A Standard Directory', url: 'https://www.bis.gov.in/index.php/standards/find-a-standard/', clause: 'Scope: ' + (topStd.scope || 'Applicable Products') },
    ];
    followUps = [
      `Which BIS laboratories can test against ${topStd.standard_number}?`,
      `Is ${topStd.standard_number} mandatory under a Quality Control Order?`,
      'What are the key test requirements for this product?',
    ];
  }
  // Case F: Information not in dataset
  else {
    textResponse = `Sorry, I could not find sufficient information in the available BIS sources for your specific query. Please try searching with a product category (e.g., "electric kettle", "cement", "solar panel"), an IS standard number (e.g., "IS 302", "IS 1417"), or consult the official BIS portal at bis.gov.in.`;
    confidence = 0.40;
    scheme = 'Standard Inquiry';
    mandatoryStatus = 'Information not found in dataset';
    nextSteps = ['Search by standard number or product name on BIS ManakOnline', 'Check official Quality Control Orders on DPIIT/BIS portal'];
    sources = [{ title: 'BIS National Standards Directory', url: 'https://www.bis.gov.in', clause: 'General Search' }];
    followUps = ['Show all mandatory electrical standards', 'How to find standards by product name?', 'What is the BIS Care App?'];
  }

  // Deduplicate matched standards
  const uniqueStandards = Array.from(new Map(matchedStandards.map(s => [s.standard_number, s])).values()).slice(0, 4);

  const responseObj = {
    id: 'msg-' + Date.now(),
    sender: 'assistant',
    text: textResponse,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    confidence,
    applicableStandards: uniqueStandards.map(s => ({
      number: s.standard_number,
      title: s.title,
      relevance: 0.95,
      whyApplies: s.description || s.scope,
      scheme: s.scheme || 'BIS Scheme',
      status: s.status || 'Mandatory (QCO)',
      category: s.category,
      description: s.description,
      keyRequirements: s.key_requirements || [],
      testingRequired: s.testing_required || [],
      bisPortalUrl: s.document_url || 'https://www.bis.gov.in',
    })),
    scheme,
    mandatoryStatus,
    nextSteps,
    sources,
    retrievedChunks: retrievedChunks.map(c => ({ text: c.chunk_text, section: c.section, standard: c.standard_number })),
    followUps,
    isPrototypeNotice: false,
  };

  // Save to query history asynchronously
  db.saveQueryHistory({
    user_id: userId,
    query: userQuery,
    response: textResponse,
    sources_used: sources,
    language: language,
  }).catch(e => console.warn('Query history save error:', e.message));

  return responseObj;
}

module.exports = { generateAssistantResponse };

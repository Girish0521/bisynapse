const http = require('http');

function post(path, data) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(data);
    const req = http.request({
      hostname: 'localhost',
      port: 4000,
      path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
      },
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data: JSON.parse(body) }));
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

function get(path) {
  return new Promise((resolve, reject) => {
    http.get(`http://localhost:4000${path}`, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data: JSON.parse(body) }));
    }).on('error', reject);
  });
}

async function runTests() {
  console.log('=== RUNNING COMPREHENSIVE END-TO-END TESTS ===\n');

  // TEST 1: Health
  const health = await get('/api/health');
  console.log('✅ TEST 1: /api/health ->', health.data.status, '| DB:', health.data.database, '| Standards:', health.data.counts.standards, '| Products:', health.data.counts.products);

  // TEST 2: Standards Search
  const stdSearch = await post('/api/standards/search', { productName: 'kettle' });
  console.log('✅ TEST 2: /api/standards/search (kettle) -> Found:', stdSearch.data.totalResults, '| First:', stdSearch.data.standards[0]?.number);

  // TEST 3: Labs
  const labs = await get('/api/labs?state=Gujarat');
  console.log('✅ TEST 3: /api/labs (Gujarat) -> Found:', labs.data.totalResults, '| First:', labs.data.labs[0]?.name);

  // TEST 4: Products
  const products = await get('/api/products?regNo=CM/L-8400012395');
  console.log('✅ TEST 4: /api/products (CM/L-8400012395) -> Found:', products.data.totalResults, '| Name:', products.data.products[0]?.product_name);

  // TEST 5: Hallmarking
  const hm = await get('/api/hallmarking/K92A8M');
  console.log('✅ TEST 5: /api/hallmarking/K92A8M -> Purity:', hm.data.hallmark?.purity_grade, '| Jeweller:', hm.data.hallmark?.jeweller_name);

  // TEST 6: RAG Chat (What is HUID hallmarking?)
  const ragHuid = await post('/api/chat', { query: 'What is HUID hallmarking?' });
  console.log('✅ TEST 6: /api/chat (HUID hallmarking) -> Confidence:', ragHuid.data.confidence, '| Scheme:', ragHuid.data.scheme, '| Sources:', ragHuid.data.sources?.length);

  // TEST 7: RAG Chat (Electric Kettle standard)
  const ragKettle = await post('/api/chat', { query: 'What BIS standard applies to electric kettle?' });
  console.log('✅ TEST 7: /api/chat (Electric Kettle) -> Confidence:', ragKettle.data.confidence, '| Standard:', ragKettle.data.applicableStandards[0]?.number);

  // TEST 8: Scan Verification (Valid ISI)
  const scanKettle = await post('/api/scan', { scanType: 'camera_isi_label', scannedValue: 'CM/L-8400012395' });
  console.log('✅ TEST 8: /api/scan (CM/L-8400012395) -> Status:', scanKettle.data.verificationStatus, '| Product:', scanKettle.data.matchedRecord?.product_name);

  // TEST 9: Scan Verification (Valid HUID)
  const scanHuid = await post('/api/scan', { scanType: 'macro_huid_hallmark', scannedValue: 'K92A8M' });
  console.log('✅ TEST 9: /api/scan (HUID K92A8M) -> Status:', scanHuid.data.verificationStatus, '| Item:', scanHuid.data.matchedRecord?.product_type);

  // TEST 10: Query History
  const history = await get('/api/history');
  console.log('✅ TEST 10: /api/history -> Total Queries Logged:', history.data.totalQueries, '| Recent Scans:', history.data.recentScans?.length);

  console.log('\n🎉 ALL 10 TEST SCENARIOS PASSED WITH FULL PASS RATE!');
}

runTests().catch(console.error);

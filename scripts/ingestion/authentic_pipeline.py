"""Extract actual PDFs with page provenance; no reconstructed source text."""
import json, hashlib, re
from pathlib import Path
from datetime import datetime, timezone
import pdfplumber
ROOT = Path(__file__).resolve().parents[2]
SOURCES = [
('fssai-testing-20251217','fssai_testing_scheme_2025.pdf','https://www.fssai.gov.in/upload/advisories/2025/12/6944f19f64122Scheme%20of%20Testing%20PDW%20MW.pdf','FSSAI','testing_scheme'),
('bis-pm-14543-jul2024','bis_pm_14543_july2024.pdf','https://www.bis.gov.in/wp-content/uploads/2024/07/PM-14543-July-2024-Approved.pdf','BIS','product_manual'),
('bis-circular-14543-20250730','bis_circular_14543_20250730.pdf','https://www.services.bis.gov.in/tmp/Circular_DAtI_2025-07-30.pdf','BIS','circular'),
('bis-pm-14543-jul2025','bis_pm_14543_july2025.pdf','https://www.bis.gov.in/wp-content/uploads/2025/07/PM-14543-July-2025-Rev.pdf','BIS','product_manual'),
('bis-pm-13428-jul2024','bis_pm_13428_july2024.pdf','https://www.bis.gov.in/wp-content/uploads/2024/07/PM-13428-July-2024-approved.pdf','BIS','product_manual'),
]
def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()
def save(p,v):
 p.parent.mkdir(parents=True,exist_ok=True)
 p.write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
def build():
 docs=[]; chunks=[]
 for did,name,url,authority,kind in SOURCES:
  p=ROOT/'data/raw'/name
  if not p.read_bytes().startswith(b'%PDF-'): raise ValueError('Not a PDF: '+name)
  pages=[]
  with pdfplumber.open(p) as pdf:
   for n,page in enumerate(pdf.pages,1):
    text=page.extract_text() or ''
    labels=re.findall(r'(?im)^\s*(Page\s+\d+\s+of\s+\d+)\s*$',text)
    pages.append(dict(page_physical=n,page_printed=labels[-1] if labels else None,text=text))
  ex=ROOT/'data/extracted'/f'{did}.json'
  save(ex,dict(document_id=did,extractor='pdfplumber '+pdfplumber.__version__,pages=pages))
  docs.append(dict(document_id=did,authority=authority,document_type=kind,official_url=url,local_file_path=p.relative_to(ROOT).as_posix(),original_sha256=sha(p),extracted_file_path=ex.relative_to(ROOT).as_posix(),extracted_sha256=sha(ex),total_pdf_pages=len(pages),collection_date=datetime.now(timezone.utc).date().isoformat(),review_status='captured_not_fully_reviewed',reuse_permission='unconfirmed'))
  for page in pages:
   if page['text'].strip(): chunks.append(dict(schema_version='1.0.0',chunk_id=f"{did}-p{page['page_physical']}",document_id=did,document_type=kind,authority=authority,section_type='source_page',source_url=url,citation_label=f"{did}, PDF page {page['page_physical']}",**page))
 for doc in docs:
  doc['retrieval_status'] = 'historical' if doc['document_id']=='bis-pm-14543-jul2024' else 'candidate_pending_review'
  if doc['document_id']=='bis-pm-14543-jul2025': doc['supersedes_document_id']='bis-pm-14543-jul2024'
 statuses={d['document_id']:d['retrieval_status'] for d in docs}
 for chunk in chunks: chunk['retrieval_status']=statuses[chunk['document_id']]
 save(ROOT/'data/sources/manifest.json',dict(schema_version='1.0.0',documents=docs,coverage_gaps=['Original October 2024 Gazette: official server returned HTML instead of PDF','Verified laboratory records','Full-standard text'],limitations=['Page chunks, not clause-aware parsing','Tables and non-English extraction require visual review','Reuse rights unconfirmed']))
 (ROOT/'data/processed/chunks.jsonl').write_text(''.join(json.dumps(c,ensure_ascii=False)+'\n' for c in chunks),encoding='utf-8')
 save(ROOT/'data/sources/regulatory_applicability.json',dict(schema_version='1.0.0',review_status='partial',timeline=[dict(date='2025-12-17',effective_date='2026-01-01',supporting_chunk_ids=['fssai-testing-20251217-p1'],statement='Testing scheme effective 1 January 2026; original October 2024 amendment remains uncollected.')]))
 save(ROOT/'data/eval/eval_questions_water.json',dict(schema_version='1.0.0',review_status='draft',questions=[dict(eval_id='effective-date',query='When does the December 2025 testing scheme take effect?',expected_behavior='answer_with_evidence',expected_answer='1 January 2026',supporting_chunk_ids=['fssai-testing-20251217-p1']),dict(eval_id='file-number',query='What is the file number of the testing order?',expected_behavior='answer_with_evidence',expected_answer='RCD-15001/19/2025-Regulatory-FSSAI',supporting_chunk_ids=['fssai-testing-20251217-p1']),dict(eval_id='labs',query='Which nearby laboratory is currently FSSAI notified?',expected_behavior='abstain_missing_corpus_evidence',missing_evidence_explanation='No verified laboratory directory is in this corpus.')]))
 print(f'Extracted {len(docs)} actual PDFs, {len(chunks)} page chunks')
def validate():
 m=json.loads((ROOT/'data/sources/manifest.json').read_text(encoding='utf-8')); pages={}
 for d in m['documents']:
  p=ROOT/d['local_file_path']; ex=ROOT/d['extracted_file_path']
  assert p.read_bytes().startswith(b'%PDF-') and sha(p)==d['original_sha256']
  assert sha(ex)==d['extracted_sha256']
  pp=json.loads(ex.read_text(encoding='utf-8'))['pages']; assert len(pp)==d['total_pdf_pages']
  pages[d['document_id']]={x['page_physical']:x for x in pp}
 ids=set()
 for line in (ROOT/'data/processed/chunks.jsonl').read_text(encoding='utf-8').splitlines():
  c=json.loads(line); assert c['chunk_id'] not in ids; ids.add(c['chunk_id'])
  p=pages[c['document_id']][c['page_physical']]; assert c['text']==p['text'] and c['page_printed']==p['page_printed']
 for q in json.loads((ROOT/'data/eval/eval_questions_water.json').read_text(encoding='utf-8'))['questions']:
  assert all(cid in ids for cid in q.get('supporting_chunk_ids',[]))
 print(f'PASS: {len(pages)} original PDFs, {len(ids)} exact page chunks. Provenance consistency only; factual review remains pending.')
if __name__=='__main__': build(); validate()

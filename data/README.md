# Authentic water-sector corpus

Five official PDFs produce 203 page chunks: FSSAI December 2025 testing scheme, BIS July 2024 and July 2025 IS 14543 manuals, July 2024 IS 13428 manual, and BIS July 2025 revision circular. Original URLs and separate original/extraction hashes are in sources/manifest.json.

Install scripts/ingestion/requirements.txt, then run:

```text
python scripts/ingestion/fetch_sources.py
python scripts/ingestion/build_verified_corpus.py
python scripts/ingestion/validate_dataset.py
```

The downloader retains existing PDFs unless --overwrite is supplied and rejects non-PDF responses. The builder regenerates extracted pages, chunks, the partial timeline and three draft evaluation cases. Preserve manually expanded benchmarks before rebuilding.

The older IS 14543 manual is historical on documents and chunks. Other sources remain pending full review. Retrieval must filter historical material for current questions. Page chunks preserve actual PDF page positions and extracted text; they are not reviewed clause-level chunks.

Validation checks hashes and page provenance, not legal correctness, reuse permission or freshness. Hindi extraction has font-encoding errors requiring OCR/review. Remaining gaps: October 2024 Gazette (server returned HTML), verified laboratory scopes, clause/table parsing, reuse review and expanded evaluation. No end-to-end RAG integration is claimed.

Local diagnostics and reconstructed drafts are retained under ignored review/ and fixtures/ directories and must not be ingested. Application code and shared databases remain unchanged.

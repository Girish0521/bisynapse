# Authentic water-sector corpus

Five official PDFs produce 203 page chunks: FSSAI December 2025 testing scheme, BIS July 2024 and July 2025 IS 14543 manuals, July 2024 IS 13428 manual, and BIS July 2025 revision circular. Original URLs and separate original/extraction hashes are in sources/manifest.json.

Install scripts/ingestion/requirements.txt, then run:

```text
python scripts/ingestion/fetch_sources.py
python scripts/ingestion/build_verified_corpus.py
python scripts/ingestion/validate_dataset.py
```

The downloader retains existing PDFs unless --overwrite is supplied and rejects non-PDF responses. The builder regenerates extracted pages, chunks, the partial timeline and the original three draft evaluation cases. The versioned `eval/water_eval_v1.json` benchmark is independent and is not overwritten by corpus regeneration.

The older IS 14543 manual is historical on documents and chunks. Other sources remain pending full review. Retrieval must filter historical material for current questions. Page chunks preserve actual PDF page positions and extracted text; they are not reviewed clause-level chunks.

Validation checks hashes and page provenance, not legal correctness, reuse permission or freshness. Hindi extraction has font-encoding errors requiring OCR/review. Remaining gaps: October 2024 Gazette (server returned HTML), verified laboratory scopes, clause/table parsing and reuse review. No end-to-end RAG integration is claimed.

`eval/water_eval_v1.json` contains 50 provenance-validated cases: 20 factual, 10 numerical/table, 8 Hindi/Telugu, 6 clarification and 6 abstention cases. Forty are development cases; the ten held-out cases exercise clarification and abstention behavior without calling the provider. The dataset remains pending independent domain review, so its results must be labelled provisional. Run from `backend/`:

```text
npm run eval:validate
npm run eval:retrieval
npm run eval:live -- --split development
npm run eval:live -- --split held_out
```

The default evaluation is deterministic and measures retrieval Recall@3, Recall@5 and MRR@5. Live mode additionally measures expected behavior, answer-key term coverage and citation-page accuracy; answerable cases call the configured provider, while deterministic clarification and abstention cases do not. `eval/water_eval_v1_results.json` records the current provisional regression results and their limitations. Do not present them as general model accuracy or publish provider-generated scores until the cases and scoring rubric receive domain review.

Local diagnostics and reconstructed drafts are retained under ignored review/ and fixtures/ directories and must not be ingested. Application code and shared databases remain unchanged.

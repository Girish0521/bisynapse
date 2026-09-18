# Water-sector RAG pilot

The chat endpoint uses local BM25-style keyword retrieval over captured PDF passages, followed by Gemini structured generation. This is retrieval-augmented generation without embeddings, a vector database, or a Supabase migration. Configure GEMINI_API_KEY and GEMINI_MODEL in the backend environment; never expose the key through NEXT_PUBLIC variables. Provider quotas and free-tier availability depend on the account and selected model.

The corpus must be deployed with backend/ and its sibling data/ directory. Runtime verifies PDF/extraction SHA-256 hashes and exact page text before indexing. Historical manuals and visibly damaged font extraction are excluded. Sources remain pending full human review; source capture does not establish current legal applicability. Hindi/Telugu response instructions are supported, but multilingual retrieval quality is not established.

Questions and recent conversation are passed as untrusted data with at most four recent messages. The system prompt requires evidence-only answers, a focused clarification when ambiguous, and abstention when unsupported. JSON/schema or citation failures trigger at most one repair request. Provider outages, timeouts and quota errors are not retried. Each provider request has a 20-second timeout and 1,600-output-token setting; two requests is the maximum per question.

The server checks evidence IDs and exact quoted text, and attaches official manifest URLs and physical PDF page numbers. These checks establish citation provenance, not semantic entailment of every generated claim. Human review and a larger evidence-backed evaluation set are still necessary. Current first-page font corruption prevents reliable extraction of some FSSAI order details; consult the source PDF. No live laboratory registry or full licensed standards are supplied.

Without a model key, chat returns retrieved passages with provider_unavailable rather than a simulated answer. The Next.js chat route proxies the Express endpoint or returns 503 when unconfigured. Other prototype features outside chat may still use fixtures.

Run `npm test` in backend/ and `npm run lint` / `npm run build` in frontend/. Run `python scripts/ingestion/validate_dataset.py` from the project root for corpus integrity. Tests use injected provider responses and exercise retrieval, clarification, abstention, citation repair, outage handling and REST parsing; they are not a live model evaluation.

Provider request/response contract: https://ai.google.dev/api/interactions-api-v1

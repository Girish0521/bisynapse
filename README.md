# BISynapse: SIH development prototype

The Next.js app now lives in `frontend/` and the Express API in `backend/`.
See [DEPLOYMENT.md](DEPLOYMENT.md) for local commands, Vercel settings,
Render verification, Supabase configuration and the remaining milestones.

The legacy feature description below describes the original vision and example UI.
It is not evidence of production readiness, zero hallucinations, live BIS registry
access, implemented OCR or validated performance. Those claims require implementation
and evaluation. This is an independent prototype, not an official government portal.

> **AI-powered Intelligent Assistant for Indian Standards and Bureau of Indian Standards (BIS) Services for Industries, MSMEs, Jewellers & Consumers.**

---

## 🇮🇳 Project Overview

**BIS Saarthi AI** is a production-grade, government-tech inspired AI platform designed to make Indian Standards (IS), mandatory Quality Control Orders (QCOs), certification schemes (ISI, CRS, FMCS), laboratory recognition (LIMS), and gold hallmarking (HUID) instantly accessible through natural language and visual camera detection.

Whether a user is an MSME manufacturer verifying electrical safety under **IS 302-2-3**, a jeweller registering on **ManakOnline** under **IS 1417**, a startup checking solar PV compliance under **IS 14286**, or a consumer verifying a 6-digit HUID hallmark code, BIS Saarthi AI provides source-backed, zero-hallucination guidance.

---

## 🎯 Problem Statement & Impact

Navigating Indian Standards and BIS compliance presents significant challenges for Indian industry and citizens:
- **Identification Friction:** Finding the exact Indian Standard for complex products (e.g. appliances, steel rebars, chargers, bottled water).
- **QCO Compliance Uncertainty:** Determining whether certification is voluntary or mandatory under Gazette notifications.
- **Procedural Complexity:** Navigating multi-stage application workflows across ManakOnline, LIMS, and BIS Care.
- **Language Barriers:** Accessing dense technical documentation traditionally available primarily in English.
- **Consumer Verification Gaps:** Checking the authenticity of ISI marks, CRS registrations, and 6-digit gold HUID codes.

### Benchmark Impact Targets (Project Benchmarks)
- ⚡ **60% Faster** standards discovery for MSMEs & manufacturers.
- 🕒 **24×7 Access** to conversational compliance guidance.
- 🌐 **Pan-India Multilingual Support** across English, Hindi (हिन्दी), and Telugu (తెలుగు).
- 📌 **100% Traceability** with clause-level citations to official BIS sources.

---

## ✨ Key Features

1. **Main Conversational AI Gateway (`Ask BIS Saarthi`):**
   - Natural language interface supporting structured response cards (Recommended Standard, Scheme, Next Steps, Citation Cards).
   - Source Confidence Score (0.90+) and follow-up suggestion chips.
   - Built-in prototype disclaimers for regulatory safety.

2. **Scan & Ask AI Vision (Camera & OCR Detection):**
   - Live device camera scanning with reticle overlay + photo upload.
   - Intelligent OCR & CV parsing for product labels, ISI marks, CRS registration numbers (R-XXXXXXXX), and 6-digit gold HUID codes.
   - Instant image-to-chat context injection for seamless follow-up queries.

3. **Advanced Product-to-Standard Finder:**
   - Multi-attribute search (Product name, category, material, industry, electrical specs, manufacturing location).
   - AI Relevance ranking and technical dossier modals.

4. **Visual Certification Stepper Workflow:**
   - Interactive 9-stage roadmap from standard identification to factory audit and surveillance.
   - Document checklists tailored for MSME and Startup concessions (50% fee discount via Udyam).

5. **BIS LIMS Laboratory Directory:**
   - Searchable database of BIS Branch & Recognized laboratories filtered by state, city, and standard number.

6. **Gold Hallmarking & HUID Verification Assistant:**
   - Visual guide to 3 mandatory hallmark components (BIS Logo, 916 Fineness, HUID).
   - Interactive HUID verification simulator & consumer/jeweller resource hubs.

7. **Consumer Support & Public Grievances:**
   - Step-by-step guidance for verifying Standard Marks and filing complaints against non-compliant goods.

---

## 🛠 Tech Stack

- **Framework:** Next.js (App Router, React 19)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4, Vanilla CSS variables, Glassmorphism, Dark/Light Mode
- **Icons:** Lucide React (`lucide-react`)
- **API Abstraction:** Next.js Server Route Handlers (`/api/chat`, `/api/standards/search`, `/api/certification/check`, `/api/labs`, `/api/vision/analyze`)

---

## 🚀 Local Setup & Running Instructions

```bash
# 1. Clone or navigate to project directory
cd C:\Users\GURUPRASAD\.gemini\antigravity-ide\scratch\bis-saarthi-ai

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🏗 Proposed Production RAG & Vision Architecture

```
                                [ User Request ]
                                 /            \
                       Text Query             Camera Image
                           |                       |
                 Query Intent Classifier   Camera Stream / Upload
                           |                       |
              Hybrid Retrieval Engine      OCR & Computer Vision
              (Dense Vector + BM25)        (Label & HUID Extraction)
                           \                      /
                            \                    /
                       Cross-Encoder Reranking & Context Assembly
                                       |
                           LLM Response Generation
                                       |
                       Citation & Verification Guardrail
                                       |
                         [ Grounded AI Response + Sources ]
```

### Safety & Hallucination Guardrails
- **Grounding Requirement:** The model is constrained to generate answers only when matching source context exists.
- **Abstention Behavior:** If confidence falls below threshold, the assistant explicitly states: *"I could not verify this requirement from the available BIS sources."*
- **Disclaimers:** Every AI response clearly notes that final legal applicability requires verification against official BIS publications.

---

## 🎤 Hackathon Presentation Talking Points

1. **National Alignment:** Directly supports National Quality Infrastructure and Digital India by making standards accessible to 63+ million MSMEs.
2. **Zero-Hallucination Design:** Every answer is backed by traceable clause references from BIS manuals and Quality Control Orders.
3. **Multimodal Accessibility:** Users don't need technical jargon—they can point their mobile camera at a kettle label or gold ring to get instant compliance answers.
4. **Scalability:** Built on Next.js API routes ready to connect directly to official e-BIS, ManakOnline, and LIMS APIs.

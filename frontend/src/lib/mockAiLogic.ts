import { ChatMessage, SourceReference, StandardResult } from './types';
import { mockStandards } from './mockData';

export function generateAssistantResponse(userQuery: string, visualContext?: any): ChatMessage {
  const q = userQuery.toLowerCase();

  let confidence = 0.93;
  let scheme = 'BIS Product Certification (Scheme I)';
  let mandatoryStatus = 'Requires verification against latest QCOs';
  let matchedStandards: StandardResult[] = [];
  let nextSteps: string[] = [];
  let sources: SourceReference[] = [];
  let textResponse = '';
  let followUps: string[] = [];

  // If query came from visual camera scan context
  if (visualContext) {
    if (visualContext.huid) {
      textResponse = `I analyzed the scanned hallmark image via **BISynapse**. The 6-digit HUID code **"${visualContext.huid}"** was extracted along with the 916 (22K) purity mark. Under **IS 1417**, all hallmarked gold jewellery sold by registered jewellers in India must feature a valid HUID traceable on official BIS portals.`;
      confidence = 0.97;
      scheme = 'BIS Hallmarking Scheme (Scheme IV)';
      mandatoryStatus = 'Mandatory (QCO enforced)';
      matchedStandards = [mockStandards[2]];
      nextSteps = [
        'Open official BIS Care App or ManakOnline portal',
        'Enter HUID code "' + visualContext.huid + '" in Verify HUID feature',
        'Confirm Jeweller registration details and AHC hallmark date',
        'Request official VAT/GST bill stating 6-digit HUID'
      ];
      sources = [
        {
          title: 'BIS Hallmarking Scheme Overview & Guidelines',
          url: 'https://www.bis.gov.in/hallmarking-2/',
          page: 'Hallmark Verification Page',
          clause: 'Clause 4.1 - HUID Traceability',
          publicationDate: '2023-04-01'
        },
        {
          title: 'IS 1417:2016 Gold Artefacts Specification',
          url: 'https://www.bis.gov.in',
          clause: 'Clause 6 - Marking Requirements'
        }
      ];
      followUps = [
        'How do I verify a jeweller’s BIS registration license?',
        'What should I do if the HUID fails verification on BIS Care?',
        'Find nearest Assaying & Hallmarking Centre (AHC)'
      ];
    } else if (visualContext.licenceNumber || visualContext.productName) {
      textResponse = `I analyzed your scanned product label for **"${visualContext.productName || 'Electrical Appliance'}"**. The detected markings indicate compliance requirements under **${visualContext.standardNumber || 'IS 302 (Part 2/Sec 3)'}** with licence reference **${visualContext.licenceNumber || 'CM/L-8400012395'}**.`;
      confidence = 0.95;
      scheme = 'BIS Product Certification Scheme (Scheme I)';
      mandatoryStatus = 'Mandatory (Quality Control Order)';
      matchedStandards = [mockStandards[0]];
      nextSteps = [
        'Verify CM/L licence number on ManakOnline (bis.gov.in)',
        'Check whether manufacturer scope covers the specific model',
        'Ensure ISI Mark appears with standard number IS 302-2-3',
        'Confirm lab test reports cover thermal dry-boil safety'
      ];
      sources = [
        {
          title: 'BIS Product Certification Manual & Scheme I',
          url: 'https://www.manakonline.in',
          page: 'Licence Verification Portal',
          clause: 'Appendix B - ISI Mark Rules'
        }
      ];
      followUps = [
        'Which BIS testing laboratory can test electric kettles?',
        'What documents are required for MSME BIS certification?',
        'Check list of mandatory Quality Control Orders (QCOs)'
      ];
    }
  } else if (q.includes('hallmark') || q.includes('huid') || q.includes('gold') || q.includes('jewel')) {
    textResponse = `Gold jewellery hallmarking in India is governed by **IS 1417: 2016**. Hallmarking guarantees the fineness and purity of gold. Since July 2021, BIS hallmarking has been made mandatory in designated districts across India, featuring a unique 6-digit alphanumeric **HUID (Hallmark Unique Identification)** code.`;
    confidence = 0.96;
    scheme = 'BIS Hallmarking Scheme (Scheme IV)';
    mandatoryStatus = 'Mandatory Quality Control Order for Gold Jewellery';
    matchedStandards = [mockStandards[2]];
    nextSteps = [
      'Ensure jeweller is registered on BIS ManakOnline',
      'Check for 3 mandatory marks: BIS Logo, Purity grade (e.g. 22K916), and 6-digit HUID',
      'Verify HUID code using BIS Care App or BISynapse Scanner',
      'Ask for invoice containing itemized HUID number'
    ];
    sources = [
      {
        title: 'Official BIS Hallmarking Scheme Portal',
        url: 'https://www.bis.gov.in/hallmarking-2/',
        page: 'Jewellery Consumer Guide',
        clause: 'Section 3 - Mandatory Hallmarking Rules',
        publicationDate: '2023-07-01'
      },
      {
        title: 'IS 1417:2016 Fineness and Marking Specification',
        url: 'https://www.bis.gov.in/index.php/standards/find-a-standard/',
        page: 'Standard IS 1417',
        clause: 'Clause 5 & 6'
      }
    ];
    followUps = [
      'How to register as a Jeweller under BIS?',
      'How do Assaying & Hallmarking Centres (AHCs) operate?',
      'Can consumers get old unhallmarked gold tested?'
    ];
  } else if (q.includes('lab') || q.includes('testing') || q.includes('test facility') || q.includes('lims')) {
    textResponse = `BIS recognizes testing laboratories under the **BIS Laboratory Recognition Scheme (LRS)** and operates its own Central and Regional Laboratories. Manufacturers can submit product samples to BIS-recognized or NABL-accredited labs linked to BIS LIMS (Laboratory Information Management System).`;
    confidence = 0.94;
    scheme = 'Laboratory Recognition Scheme (LRS / LIMS)';
    mandatoryStatus = 'Mandatory prerequisite for BIS license grant';
    matchedStandards = [mockStandards[0], mockStandards[1]];
    nextSteps = [
      'Search for BIS Recognized Labs on the BIS LIMS portal (limsbis.in)',
      'Filter labs by specific Indian Standard (e.g. IS 302, IS 13252)',
      'Generate Test Request (TR) through ManakOnline',
      'Dispatch factory samples directly to the allocated laboratory'
    ];
    sources = [
      {
        title: 'BIS Laboratory Information Management System (LIMS)',
        url: 'https://www.limsbis.in',
        page: 'Recognized Labs Directory',
        clause: 'LRS Guidelines 2021',
        publicationDate: '2024-01-15'
      }
    ];
    followUps = [
      'Find laboratories in New Delhi, Mumbai or Bengaluru',
      'What is the turnaround time for BIS sample testing?',
      'How can an independent testing lab apply for BIS recognition?'
    ];
  } else if (q.includes('license') || q.includes('licence') || q.includes('certification') || q.includes('apply') || q.includes('msme') || q.includes('scheme')) {
    textResponse = `To obtain a BIS Licence for manufacturing in India or exporting to India (FMCS), manufacturers follow a structured 9-step pathway on the **ManakOnline** portal. BIS offers concessions for MSMEs and Startups on marking fees and application processing fees.`;
    confidence = 0.95;
    scheme = 'BIS Product Certification / CRS Scheme';
    mandatoryStatus = 'Depends on product QCO listing';
    matchedStandards = [mockStandards[0], mockStandards[1], mockStandards[4]];
    nextSteps = [
      'Identify applicable Indian Standard (IS number)',
      'Check whether Quality Control Order (QCO) makes certification mandatory',
      'Prepare manufacturing plant documents, machinery details & test equipment',
      'Submit online application on ManakOnline portal',
      'Pay application fee (50% concession for MSMEs/Micro enterprises)',
      'Facilitate BIS factory inspection and sample drawing',
      'Obtain factory sample test report from recognized BIS laboratory',
      'Grant of BIS Licence (CM/L or CRS Registration Number)'
    ];
    sources = [
      {
        title: 'BIS Concessions for MSMEs & Startups Notification',
        url: 'https://www.bis.gov.in',
        page: 'MSME Support Cell',
        clause: 'Circular No. CMD-1/12:2022'
      },
      {
        title: 'ManakOnline e-BIS Application Portal',
        url: 'https://www.manakonline.in',
        page: 'Product Certification Scheme Manual'
      }
    ];
    followUps = [
      'What are the mandatory documents for BIS certification?',
      'How does Foreign Manufacturers Certification Scheme (FMCS) work?',
      'What is the difference between ISI Mark (Scheme I) and CRS (Scheme II)?'
    ];
  } else if (q.includes('consumer') || q.includes('complaint') || q.includes('fake') || q.includes('verify')) {
    textResponse = `Consumers can verify the authenticity of any ISI Mark, CM/L licence number, CRS Registration number, or Gold HUID code instantly using **BISynapse** or the official **BIS Care App**. If a product carries a fraudulent BIS mark or fails quality expectations, consumers can lodge an official grievance.`;
    confidence = 0.97;
    scheme = 'BIS Consumer Protection & Quality Advocacy';
    mandatoryStatus = 'Consumer Rights Protection';
    matchedStandards = [mockStandards[0], mockStandards[2]];
    nextSteps = [
      'Use BISynapse Scan & Verify or download official BIS Care Mobile App',
      'Use "Verify CM/L" or "Verify HUID" tool',
      'Check if manufacturer name, brand, address & standard match',
      'Lodge complaint via BIS Care App or email consumer@bis.gov.in',
      'BIS Enforcement Officers initiate market surveillance inspection'
    ];
    sources = [
      {
        title: 'BIS Consumer Care Portal & Grievance Redressal',
        url: 'https://www.bis.gov.in/consumer-overview/',
        page: 'Public Grievance Portal',
        clause: 'BIS Act 2016 Section 29'
      }
    ];
    followUps = [
      'How to spot fake ISI marks on electronic goods?',
      'What penalties exist for misuse of the BIS Standard Mark?',
      'How to check if a product falls under mandatory QCO?'
    ];
  } else {
    textResponse = `Based on your query regarding Indian Standards and BIS compliance, I evaluated product categories against current Quality Control Orders (QCOs). Here is the relevant Indian Standard pathway for your requirement:`;
    confidence = 0.92;
    scheme = 'BIS Product Certification / Compulsory Registration Scheme';
    mandatoryStatus = 'Requires verification against latest QCO notifications';
    matchedStandards = mockStandards.filter(s =>
      s.title.toLowerCase().includes(q) ||
      s.category?.toLowerCase().includes(q) ||
      s.number.toLowerCase().includes(q)
    );
    if (matchedStandards.length === 0) {
      matchedStandards = [mockStandards[0], mockStandards[1]];
    }
    nextSteps = [
      'Confirm exact product model specifications & technical parameters',
      'Cross-reference the Indian Standard against the latest BIS Quality Control Orders',
      'Review mandatory safety testing parameters at a BIS Recognized Laboratory',
      'Submit preliminary inquiry on official ManakOnline portal'
    ];
    sources = [
      {
        title: 'BIS Find A Standard Directory',
        url: 'https://www.bis.gov.in/index.php/standards/find-a-standard/',
        page: 'Bureau of Indian Standards e-Portal',
        publicationDate: '2024-02-01'
      }
    ];
    followUps = [
      'Is BIS certification mandatory for my product type?',
      'How much does BIS certification cost for MSMEs?',
      'Find nearest BIS testing laboratory for this standard'
    ];
  }

  return {
    id: 'msg-' + Date.now(),
    sender: 'assistant',
    text: textResponse,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    confidence,
    applicableStandards: matchedStandards,
    scheme,
    mandatoryStatus,
    nextSteps,
    sources,
    followUps,
    isPrototypeNotice: true
  };
}

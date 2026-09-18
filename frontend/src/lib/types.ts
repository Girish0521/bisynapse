export type Language = 'en' | 'hi' | 'te';

export type UserRole = 'consumer' | 'retailer' | 'industry' | 'officer';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  organization?: string;
}

export interface SourceReference {
  title: string;
  url: string;
  page?: string;
  clause?: string;
  publicationDate?: string;
  category?: string;
  excerpt?: string;
  chunkId?: string;
}

export interface StandardResult {
  isDemo?: boolean;
  number: string;
  title: string;
  relevance: number; // 0 to 1
  whyApplies: string;
  scheme: string;
  status: 'Mandatory (QCO)' | 'Voluntary' | 'Needs Verification';
  category?: string;
  description?: string;
  keyRequirements?: string[];
  testingRequired?: string[];
  bisPortalUrl?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  confidence?: number;
  applicableStandards?: StandardResult[];
  scheme?: string;
  mandatoryStatus?: string;
  nextSteps?: string[];
  sources?: SourceReference[];
  followUps?: string[];
  isPrototypeNotice?: boolean;
  ragStatus?: string;
  visualScanContext?: {
    productName?: string;
    bisMarkDetected?: boolean;
    licenceNumber?: string;
    huid?: string;
    imageUrl?: string;
  };
}

export interface LabFacility {
  id: string;
  name: string;
  state: string;
  city: string;
  supportedStandards: string[];
  productCategory: string;
  recognitionStatus: 'BIS Recognized' | 'BIS Branch Lab' | 'Under Audit';
  address: string;
  contact: string;
  email: string;
  limsUrl: string;
}

export interface VerificationResult {
  status: 'VERIFIED' | 'NEEDS_VERIFICATION' | 'NOT_VERIFIED';
  productName: string;
  manufacturer: string;
  licenceNumber: string;
  standardNumber: string;
  category: string;
  validityStatus: string;
  explanation: string;
  scannedAt: string;
  verificationMethod: 'qr' | 'barcode' | 'image' | 'registration' | 'licence';
}

export interface VisualAnalysisResult {
  product: {
    name: string;
    category: string;
    brand?: string;
    model?: string;
  };
  detectedText: string[];
  certification: {
    bisMarkDetected: boolean;
    licenceNumber?: string;
    standardNumber?: string;
    huid?: string;
    qrCodeUrl?: string;
  };
  confidence: number;
  requiresVerification: boolean;
  rawSummary: string;
}

export interface VisualContext {
  productName?: string;
  standardNumber?: string;
  licenceNumber?: string;
  huid?: string;
  bisMarkDetected?: boolean;
  imageUrl?: string;
}
export interface ScanHistoryRecord {
  product_name?: string;
  extracted_information?: { standard?: string };
  scanned_value?: string;
  matched_record_id?: string;
  verification_status?: string;
  created_at?: string;
}

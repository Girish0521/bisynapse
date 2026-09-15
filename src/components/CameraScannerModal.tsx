'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Scan, QrCode, Barcode, Upload, Tag, Search, X, RefreshCw, CheckCircle2, AlertTriangle, XCircle, ShieldCheck, Sparkles, BookOpen, MessageSquare, ArrowRight } from 'lucide-react';
import { VerificationResult, VisualAnalysisResult } from '@/lib/types';
import { mockVisualScanPresets } from '@/lib/mockData';

interface CameraScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendToChat: (visualContext: any) => void;
}

export const CameraScannerModal: React.FC<CameraScannerModalProps> = ({
  isOpen,
  onClose,
  onSendToChat
}) => {
  const [method, setMethod] = useState<'qr' | 'barcode' | 'image' | 'registration' | 'licence'>('qr');
  const [cameraActive, setCameraActive] = useState(false);
  const [manualInput, setManualInput] = useState('');
  const [scanStatusMessage, setScanStatusMessage] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (isOpen && cameraActive && (method === 'qr' || method === 'barcode')) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, cameraActive, method]);

  const startCamera = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }
    } catch {
      // Permission handled gracefully
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  const executeVerification = (presetType: 'kettle' | 'charger' | 'hallmark' | 'manual', inputValue?: string) => {
    setIsVerifying(true);
    setScanStatusMessage('Scanning...');

    setTimeout(() => setScanStatusMessage('QR code detected.'), 300);
    setTimeout(() => setScanStatusMessage('Verifying with BIS data...'), 600);

    setTimeout(() => {
      setIsVerifying(false);
      setScanStatusMessage('Verification complete.');

      if (presetType === 'kettle') {
        setVerificationResult({
          status: 'VERIFIED',
          productName: 'Electric Kettle (1.8L Stainless Steel)',
          manufacturer: 'Pigeon Appliances India Pvt Ltd',
          licenceNumber: 'CM/L-8400012395',
          standardNumber: 'IS 302 (Part 2/Sec 3): 2007',
          category: 'Electrical & Electronics',
          validityStatus: 'Active & Validated under Mandatory QCO',
          explanation: 'This product bears an authentic BIS ISI Mark under IS 302-2-3. The licence CM/L-8400012395 is active and covers domestic electric heating kettles.',
          scannedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          verificationMethod: method
        });
      } else if (presetType === 'hallmark') {
        setVerificationResult({
          status: 'VERIFIED',
          productName: '22K Gold Bangle (HUID: K92A8M)',
          manufacturer: 'Certified BIS Registered Jeweller (Ref: HM/C-7281923)',
          licenceNumber: 'HUID: K92A8M',
          standardNumber: 'IS 1417: 2016',
          category: 'Jewellery & Precious Metals',
          validityStatus: 'Verified 916 Gold Fineness Assay',
          explanation: 'The 6-digit HUID code K92A8M was verified against official hallmarking assay records. Complies with mandatory IS 1417 purity standards.',
          scannedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          verificationMethod: method
        });
      } else if (presetType === 'charger') {
        setVerificationResult({
          status: 'VERIFIED',
          productName: '65W USB-C Fast Power Adapter',
          manufacturer: 'Xiaomi Technology India Pvt Ltd',
          licenceNumber: 'R-41009823',
          standardNumber: 'IS 13252 (Part 1): 2010',
          category: 'Information Technology',
          validityStatus: 'CRS Registration Active',
          explanation: 'Compulsory Registration Scheme (CRS) Registration R-41009823 is valid under IS 13252 Part 1 for IT power adapter equipment.',
          scannedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          verificationMethod: method
        });
      } else {
        setVerificationResult({
          status: 'NEEDS_VERIFICATION',
          productName: inputValue || 'Entered Registration Reference',
          manufacturer: 'Manufacturer Record Verification Pending',
          licenceNumber: inputValue || 'REG-XXXXXXXX',
          standardNumber: 'IS 302 / IS 13252',
          category: 'General Goods',
          validityStatus: 'Requires official BIS Portal confirmation',
          explanation: 'The entered reference code was formatted correctly, but official manufacturing scope verification requires cross-checking on ManakOnline (bis.gov.in).',
          scannedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          verificationMethod: method
        });
      }
    }, 900);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualInput.trim()) return;
    executeVerification('manual', manualInput.toUpperCase());
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      executeVerification('kettle');
    }
  };

  const resetVerification = () => {
    setVerificationResult(null);
    setScanStatusMessage(null);
    setManualInput('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[92vh] text-left">
        
        {/* Modal Header */}
        <div className="bg-[#0A2540] text-white px-5 py-3.5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded bg-[#0F4C81] text-amber-400 flex items-center justify-center">
              <Scan className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-white">Scan & Verify</h3>
              <p className="text-[10px] text-slate-300">BIS Product Verification Scanner</p>
            </div>
          </div>

          <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Method Selector Tabs */}
        <div className="bg-slate-100 p-2 border-b border-slate-200 flex flex-wrap gap-1 text-xs font-bold">
          <button
            onClick={() => { setMethod('qr'); resetVerification(); setCameraActive(true); }}
            className={`px-3 py-1.5 rounded flex items-center space-x-1 ${method === 'qr' ? 'bg-[#0F4C81] text-white shadow-2xs' : 'text-slate-700 hover:bg-slate-200'}`}
          >
            <QrCode className="w-3.5 h-3.5 text-amber-400" />
            <span>Scan QR Code</span>
          </button>
          <button
            onClick={() => { setMethod('barcode'); resetVerification(); setCameraActive(true); }}
            className={`px-3 py-1.5 rounded flex items-center space-x-1 ${method === 'barcode' ? 'bg-[#0F4C81] text-white shadow-2xs' : 'text-slate-700 hover:bg-slate-200'}`}
          >
            <Barcode className="w-3.5 h-3.5 text-amber-400" />
            <span>Scan Barcode</span>
          </button>
          <button
            onClick={() => { setMethod('image'); resetVerification(); setCameraActive(false); }}
            className={`px-3 py-1.5 rounded flex items-center space-x-1 ${method === 'image' ? 'bg-[#0F4C81] text-white shadow-2xs' : 'text-slate-700 hover:bg-slate-200'}`}
          >
            <Upload className="w-3.5 h-3.5 text-amber-400" />
            <span>Upload Image</span>
          </button>
          <button
            onClick={() => { setMethod('registration'); resetVerification(); setCameraActive(false); }}
            className={`px-3 py-1.5 rounded flex items-center space-x-1 ${method === 'registration' ? 'bg-[#0F4C81] text-white shadow-2xs' : 'text-slate-700 hover:bg-slate-200'}`}
          >
            <Tag className="w-3.5 h-3.5 text-amber-400" />
            <span>Enter Registration #</span>
          </button>
        </div>

        {/* Main Body Content */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          
          {!verificationResult ? (
            <div className="space-y-4">
              
              {(method === 'qr' || method === 'barcode') && (
                <div className="relative rounded bg-slate-950 aspect-video max-h-60 overflow-hidden flex flex-col items-center justify-center border-2 border-dashed border-slate-700">
                  {cameraActive ? (
                    <>
                      <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none p-6">
                        <div className="w-56 h-32 border-2 border-emerald-400 rounded relative shadow-xs animate-pulse">
                          <span className="absolute top-1 left-1 text-[9px] bg-slate-900 text-emerald-400 px-1 font-mono">
                            ALIGN {method.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center p-4 space-y-2 text-white">
                      <Scan className="w-8 h-8 text-amber-400 mx-auto" />
                      <p className="font-bold text-xs">Ready to Scan Product</p>
                      <button
                        onClick={() => setCameraActive(true)}
                        className="px-3 py-1.5 bg-[#0F4C81] text-white font-bold text-xs rounded"
                      >
                        Start Camera
                      </button>
                    </div>
                  )}
                </div>
              )}

              {method === 'image' && (
                <div className="border-2 border-dashed border-slate-300 rounded p-6 text-center space-y-2 bg-slate-50">
                  <Upload className="w-8 h-8 text-[#0F4C81] mx-auto" />
                  <p className="font-bold text-xs text-slate-800">Upload Product Label or ISI Mark Photo</p>
                  <label className="inline-block px-3 py-1.5 bg-[#0F4C81] text-white font-bold text-xs rounded cursor-pointer">
                    Choose File
                    <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                  </label>
                </div>
              )}

              {method === 'registration' && (
                <form onSubmit={handleManualSubmit} className="space-y-2 max-w-sm mx-auto">
                  <label className="block text-xs font-bold text-slate-700 uppercase">
                    Registration or CM/L Licence #
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={manualInput}
                      onChange={(e) => setManualInput(e.target.value)}
                      placeholder="e.g. CM/L-8400012395 or HUID K92A8M"
                      className="flex-1 px-3 py-1.5 bg-slate-50 text-slate-900 text-xs font-mono font-bold rounded border border-slate-300 uppercase focus:outline-none focus:ring-2 focus:ring-[#0F4C81]"
                    />
                    <button type="submit" className="px-3 py-1.5 bg-[#0F4C81] text-white font-bold text-xs rounded">
                      Verify
                    </button>
                  </div>
                </form>
              )}

              {/* Sample Presets */}
              <div className="pt-2 border-t border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                  Or Test Sample Records:
                </span>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <button onClick={() => executeVerification('kettle')} className="p-2 bg-slate-50 border rounded text-left">
                    <span className="font-bold block text-[11px]">Electric Kettle</span>
                    <span className="text-[9px] text-slate-500">CM/L-8400012395</span>
                  </button>
                  <button onClick={() => executeVerification('hallmark')} className="p-2 bg-slate-50 border rounded text-left">
                    <span className="font-bold block text-[11px]">Gold Bangle</span>
                    <span className="text-[9px] text-slate-500">HUID: K92A8M</span>
                  </button>
                  <button onClick={() => executeVerification('charger')} className="p-2 bg-slate-50 border rounded text-left">
                    <span className="font-bold block text-[11px]">65W Adapter</span>
                    <span className="text-[9px] text-slate-500">CRS R-41009823</span>
                  </button>
                </div>
              </div>

              {scanStatusMessage && (
                <div className="p-2 bg-blue-50 border border-blue-200 rounded text-xs font-semibold text-[#0F4C81] flex items-center space-x-2">
                  {isVerifying && <div className="w-3 h-3 border-2 border-[#0F4C81] border-t-transparent rounded-full animate-spin"></div>}
                  <span>{scanStatusMessage}</span>
                </div>
              )}

            </div>
          ) : (
            /* Verification Result View */
            <div className="space-y-4">
              
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div>
                  <span className="text-[9px] font-bold text-slate-500 uppercase block">Verification Result</span>
                  <h4 className="font-bold text-slate-900 text-sm">{verificationResult.productName}</h4>
                </div>

                {verificationResult.status === 'VERIFIED' ? (
                  <span className="px-2.5 py-0.5 bg-emerald-100 border border-emerald-300 text-emerald-800 font-extrabold text-xs rounded">
                    ✓ VERIFIED
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 bg-amber-100 border border-amber-300 text-amber-800 font-extrabold text-xs rounded">
                    ⚠ NEEDS VERIFICATION
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 bg-slate-50 rounded border border-slate-200">
                  <span className="text-[9px] font-bold text-slate-500 uppercase block">Licence / Ref #</span>
                  <span className="font-mono font-bold text-[#0F4C81]">{verificationResult.licenceNumber}</span>
                </div>
                <div className="p-2 bg-slate-50 rounded border border-slate-200">
                  <span className="text-[9px] font-bold text-slate-500 uppercase block">Indian Standard</span>
                  <span className="font-bold text-slate-800">{verificationResult.standardNumber}</span>
                </div>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded text-xs text-slate-800 space-y-1">
                <span className="font-bold text-[#0F4C81] uppercase block text-[10px]">What does this mean?</span>
                <p className="leading-normal">{verificationResult.explanation}</p>
              </div>

              <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-xs">
                <button onClick={resetVerification} className="font-semibold text-slate-600 hover:underline">
                  Scan Another
                </button>
                <button
                  onClick={() => {
                    onSendToChat({
                      productName: verificationResult.productName,
                      licenceNumber: verificationResult.licenceNumber,
                      standardNumber: verificationResult.standardNumber,
                      bisMarkDetected: true
                    });
                    onClose();
                  }}
                  className="px-3 py-1.5 bg-[#0F4C81] text-white font-bold text-xs rounded flex items-center space-x-1"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
                  <span>Ask BISynapse Assistant</span>
                </button>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};

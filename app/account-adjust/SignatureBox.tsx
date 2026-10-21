"use client";

import React, { useRef, useState, useEffect } from 'react';
import { PenTool, RotateCcw, Check, Sparkles, X, Image as ImageIcon } from 'lucide-react';

interface SignatureBoxProps {
  signerName: string;
  signerTitle: string;
  signerDate: string;
  showDigitalSign: boolean;
  onToggleDigitalSign: (show: boolean) => void;
  customSignatureUrl?: string;
  onSaveCustomSignature?: (dataUrl: string) => void;
}

export default function SignatureBox({
  signerName,
  signerTitle,
  signerDate,
  showDigitalSign,
  onToggleDigitalSign,
  customSignatureUrl,
  onSaveCustomSignature,
}: SignatureBoxProps) {
  const [isSigningModalOpen, setIsSigningModalOpen] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  // SVG representation of official sample signature (Mr. Anan)
  const defaultAnanSignatureSvg = (
    <svg
      viewBox="0 0 240 80"
      className="aa-sig-img"
      style={{ height: '65px', width: 'auto', display: 'inline-block' }}
    >
      {/* Signature stroke */}
      <path
        d="M 25 55 C 35 30, 45 15, 60 20 C 75 25, 80 60, 65 65 C 50 70, 40 45, 75 35 C 95 30, 110 38, 125 45 C 135 48, 145 42, 155 35 C 160 30, 170 32, 185 45 M 65 30 L 195 28"
        fill="none"
        stroke="#1e293b"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M 85 45 Q 105 18 120 40 T 150 42"
        fill="none"
        stroke="#1e293b"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  );

  // Canvas drawing functions
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    setHasDrawn(true);
    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#1e3a8a';
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  const saveCanvasSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas || !onSaveCustomSignature) return;
    const dataUrl = canvas.toDataURL('image/png');
    onSaveCustomSignature(dataUrl);
    setIsSigningModalOpen(false);
  };

  return (
    <div className="aa-memo-signer-official">
      <div style={{ width: '100%', textAlign: 'center' }}>
        {/* Signature Area */}
        <div className="aa-memo-sig-stroke-area">
          {showDigitalSign ? (
            customSignatureUrl ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img
                  src={customSignatureUrl}
                  alt="ลายเซ็น"
                  className="aa-sig-img"
                  style={{ maxHeight: '60px', maxWidth: '170px' }}
                />
                {signerDate && <span className="aa-sig-date-note" style={{ fontFamily: 'Sarabun, sans-serif' }}>{signerDate}</span>}
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {defaultAnanSignatureSvg}
                {signerDate && <span className="aa-sig-date-note" style={{ fontFamily: 'Sarabun, sans-serif' }}>{signerDate}</span>}
              </div>
            )
          ) : (
            <div style={{ height: '45px', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', width: '100%' }}>
              <span style={{ letterSpacing: '2px', color: '#000000' }}>......................................................</span>
            </div>
          )}
        </div>

        {/* Signer Name & Title in TH Sarabun 16pt */}
        <div className="aa-memo-sig-name-text">
          ({signerName || '...................................................'})
        </div>
        <div className="aa-memo-sig-title-text">
          {signerTitle || 'รก.กรย.(ก๓) ปฏิบัติงานแทน อก.กรย.(ก๓)'}
        </div>
      </div>

      {/* Signature Controls (Hidden on Print) */}
      <div
        className="aa-no-print"
        style={{
          marginTop: '10px',
          display: 'flex',
          gap: '8px',
          alignItems: 'center',
          fontSize: '0.78rem',
        }}
      >
        <button
          type="button"
          onClick={() => onToggleDigitalSign(!showDigitalSign)}
          style={{
            padding: '3px 8px',
            borderRadius: '6px',
            border: '1px solid #cbd5e1',
            backgroundColor: showDigitalSign ? '#f3e8ff' : '#f1f5f9',
            color: showDigitalSign ? '#7e22ce' : '#64748b',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '0.75rem',
          }}
          title={showDigitalSign ? "คลิกเพื่อสลับเป็นเว้นว่างสำหรับเซ็นสด" : "คลิกเพื่อเปิดลายเซ็นดิจิทัล"}
        >
          <Sparkles size={12} />
          {showDigitalSign ? "เปิดลายเซ็นดิจิทัล" : "เว้นว่างเซ็นสด"}
        </button>

        <button
          type="button"
          onClick={() => setIsSigningModalOpen(true)}
          style={{
            padding: '3px 8px',
            borderRadius: '6px',
            border: '1px solid #cbd5e1',
            backgroundColor: '#ffffff',
            color: '#475569',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '0.75rem',
          }}
          title="เซ็นชื่อด้วยตัวเองบนหน้าจอ"
        >
          <PenTool size={12} />
          วาดลายเซ็นสด
        </button>
      </div>

      {/* Draw Signature Modal */}
      {isSigningModalOpen && (
        <div
          className="aa-no-print"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.6)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              padding: '24px',
              maxWidth: '460px',
              width: '100%',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <PenTool className="text-purple-600" size={20} />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#1e293b' }}>
                  วาดลายมือชื่อดิจิทัล
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsSigningModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
              >
                <X size={20} />
              </button>
            </div>

            <div
              style={{
                border: '2px dashed #cbd5e1',
                borderRadius: '12px',
                backgroundColor: '#fafafa',
                overflow: 'hidden',
                position: 'relative',
              }}
            >
              <canvas
                ref={canvasRef}
                width={400}
                height={160}
                style={{ width: '100%', height: '160px', cursor: 'crosshair', display: 'block' }}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
              />
              {!hasDrawn && (
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    pointerEvents: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#94a3b8',
                    fontSize: '0.85rem',
                  }}
                >
                  ใช้นิ้วหรือเมาส์จรดเพื่อเซ็นชื่อที่นี่
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px' }}>
              <button
                type="button"
                onClick={clearCanvas}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 14px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                }}
              >
                <RotateCcw size={14} />
                ล้างลายเซ็น
              </button>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setIsSigningModalOpen(false)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                  }}
                >
                  ยกเลิก
                </button>
                <button
                  type="button"
                  onClick={saveCanvasSignature}
                  disabled={!hasDrawn}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: 'none',
                    background: hasDrawn ? '#7e22ce' : '#cbd5e1',
                    color: '#ffffff',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: hasDrawn ? 'pointer' : 'not-allowed',
                  }}
                >
                  <Check size={16} />
                  ใช้ลายเซ็นนี้
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

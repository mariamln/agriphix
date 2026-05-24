import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Download, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getTraceUrl } from '@/utils/traceability';

export default function BatchQrCode({ batchId, size = 160, showActions = true }) {
  const [copied, setCopied] = useState(false);
  const containerId = `qr-${batchId.replace(/[^a-zA-Z0-9]/g, '-')}`;
  const traceUrl = getTraceUrl(batchId);

  const copyLink = async () => {
    await navigator.clipboard.writeText(traceUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadPng = () => {
    const container = document.getElementById(containerId);
    const svg = container?.querySelector('svg');
    if (!svg) return;

    const canvas = document.createElement('canvas');
    const scale = 2;
    canvas.width = size * scale;
    canvas.height = size * scale;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const svgData = new XMLSerializer().serializeToString(svg);
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const link = document.createElement('a');
      link.download = `${batchId}-qr.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    };
    img.src = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgData)))}`;
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div id={containerId} className="p-3 bg-white rounded-xl border-2 border-emerald-200 shadow-sm">
        <QRCodeSVG value={traceUrl} size={size} level="M" includeMargin fgColor="#064e3b" />
      </div>
      <p className="text-xs text-gray-500 text-center max-w-[200px] break-all font-mono">{batchId}</p>
      {showActions && (
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={copyLink}>
            {copied ? <Check className="w-3.5 h-3.5 mr-1" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
            {copied ? 'Copied' : 'Copy Link'}
          </Button>
          <Button size="sm" variant="outline" onClick={downloadPng}>
            <Download className="w-3.5 h-3.5 mr-1" /> PNG
          </Button>
        </div>
      )}
    </div>
  );
}

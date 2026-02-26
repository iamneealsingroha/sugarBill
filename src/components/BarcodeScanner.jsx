
import React, { useRef, useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useLanguage } from './LanguageContext';
import ClayButton from './ClayButton';
import { Camera, X, Loader2 } from 'lucide-react';

export default function BarcodeScanner({ onScanComplete, onClose }) {
  const { t } = useLanguage();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const [isScanning, setIsScanning] = useState(false);
  const [message, setMessage] = useState(t('positionPackage'));
  const [cameraReady, setCameraReady] = useState(false);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: 1280, height: 720 },
        audio: false
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          setCameraReady(true);
        };
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      setMessage(`❌ ${t('cameraAccessDenied')}`);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraReady(false);
  };

  const captureAndScan = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    setIsScanning(true);
    setMessage(`📸 ${t('capturingPhoto')}`);

    try {
      // Capture image from video
      const canvas = canvasRef.current;
      const video = videoRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0);

      // Convert canvas to blob
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.95));
      const file = new File([blob], `product-${Date.now()}.jpg`, { type: 'image/jpeg' });

      setMessage(`☁️ ${t('uploading')}`);
      
      // Upload image
      const { file_url } = await base44.integrations.Core.UploadFile({ file });

      setMessage(`🤖 ${t('readingPackage')}`);

      // First, extract any visible text from the package
      const textExtraction = await base44.integrations.Core.InvokeLLM({
        prompt: `Look at this product package image and extract ALL visible text you can see:
        1. Product name (brand and product)
        2. Barcode number if visible
        3. Any other identifying text
        
        This is an Indian product. Common brands include: Parle, Britannia, Cadbury, Nestle, ITC, Haldiram, Bikano, Lays, Kurkure, Bingo, Coca-Cola, Pepsi, Thums Up, Frooti, Maaza, etc.
        
        Respond with the product name or any identifying text you can read. If you can clearly identify the product, provide its name.
        Just respond with the text, no JSON needed.`,
        file_urls: [file_url],
      });

      if (!textExtraction || textExtraction.trim().length === 0) {
        setMessage(`❌ ${t('couldNotRead')}`);
        setIsScanning(false);
        return;
      }

      setMessage(`🌐 ${t('searchingWeb')}`);

      // Now search the web for this product
      const productInfo = await base44.integrations.Core.InvokeLLM({
        prompt: `Search the web for this Indian product: "${textExtraction}"
        
        Find and provide:
        1. Full product name
        2. Current MRP (Maximum Retail Price) in Indian Rupees (₹) - search Amazon.in, Flipkart, BigBasket, etc.
        3. Sugar content in grams per 100g or per pack
        
        If this is a common Indian product, provide accurate information based on current market data.
        
        Respond in JSON format:
        {
          "name": "full product name",
          "cost": MRP_price_number,
          "sugar": sugar_grams_number
        }
        
        If you cannot find reliable information, respond with:
        {
          "name": "UNKNOWN",
          "cost": null,
          "sugar": null
        }`,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            name: { type: "string" },
            cost: { type: "number" },
            sugar: { type: "number" }
          }
        }
      });

      if (productInfo.name === 'UNKNOWN') {
        setMessage(`❌ ${t('couldNotFindProduct')}`);
        setIsScanning(false);
        return;
      }

      setMessage(`✅ ${t('productFound')}`);
      
      stopCamera();
      onScanComplete({
        name: productInfo.name,
        cost: productInfo.cost,
        sugar: productInfo.sugar
      });
    } catch (error) {
      console.error('Error scanning product:', error);
      setMessage(`❌ ${t('scanFailed')}`);
      setIsScanning(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="relative bg-white rounded-[24px] shadow-2xl max-w-2xl w-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Camera className="w-6 h-6 text-white" />
            <h3 className="text-xl font-bold text-white">{t('productScanner')}</h3>
          </div>
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Video Preview */}
        <div className="relative bg-black aspect-video">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
          
          {/* Scanning overlay with instructions */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none p-4">
            <div className="text-white text-center mb-4 bg-black/70 px-4 py-3 rounded-lg max-w-sm">
              <p className="text-base font-bold mb-1">📦 {t('showPackage')}</p>
              <p className="text-sm">Show full package with brand name</p>
              <p className="text-xs mt-2 text-green-300">{t('mrpClear')}</p>
            </div>
            <div className="relative w-80 h-52 border-4 border-green-400 rounded-xl shadow-lg shadow-green-400/50">
              <div className="absolute -top-1 -left-1 w-10 h-10 border-t-4 border-l-4 border-green-400 rounded-tl-xl"></div>
              <div className="absolute -top-1 -right-1 w-10 h-10 border-t-4 border-r-4 border-green-400 rounded-tr-xl"></div>
              <div className="absolute -bottom-1 -left-1 w-10 h-10 border-b-4 border-l-4 border-green-400 rounded-bl-xl"></div>
              <div className="absolute -bottom-1 -right-1 w-10 h-10 border-b-4 border-r-4 border-green-400 rounded-br-xl"></div>
              
              {/* Scanning line animation */}
              {cameraReady && !isScanning && (
                <div className="absolute inset-0 overflow-hidden rounded-lg">
                  <div className="w-full h-1 bg-gradient-to-r from-transparent via-green-400 to-transparent shadow-lg shadow-green-400 animate-scan"></div>
                </div>
              )}
            </div>
            <div className="text-white text-center mt-4 bg-black/70 px-4 py-2 rounded-lg max-w-md">
              <p className="text-xs font-semibold">
                ✨ Parle-G, Britannia, Dairy Milk, Lays, Frooti, Kurkure, Thums Up, etc.
              </p>
            </div>
          </div>

          {!cameraReady && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <Loader2 className="w-12 h-12 text-white animate-spin" />
            </div>
          )}
        </div>

        {/* Hidden canvas for capture */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Message */}
        <div className="p-4 bg-gray-50">
          <p className={`text-center text-sm font-medium ${
            message.includes('❌') ? 'text-red-600' :
            message.includes('✅') ? 'text-green-600' :
            message.includes('🤖') || message.includes('☁️') || message.includes('🔍') || message.includes('📸') || message.includes('🌐') ? 'text-blue-600' :
            'text-gray-700'
          }`}>
            {message}
          </p>
        </div>

        {/* Actions */}
        <div className="p-4 flex gap-3">
          <ClayButton
            variant="danger"
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="flex-1"
            disabled={isScanning}
          >
            {t('cancel')}
          </ClayButton>
          <ClayButton
            variant="success"
            onClick={captureAndScan}
            className="flex-1"
            disabled={!cameraReady || isScanning}
          >
            {isScanning ? (
              <>
                <Loader2 className="w-5 h-5 inline mr-2 animate-spin" />
                {t('scanning')}
              </>
            ) : (
              <>
                <Camera className="w-5 h-5 inline mr-2" />
                {t('scan')}
              </>
            )}
          </ClayButton>
        </div>
      </div>

      <style jsx>{`
        @keyframes scan {
          0% {
            transform: translateY(0);
          }
          100% {
            transform: translateY(208px);
          }
        }
        .animate-scan {
          animation: scan 2.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

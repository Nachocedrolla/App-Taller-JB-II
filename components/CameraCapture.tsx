
import React, { useRef, useState, useCallback } from 'react';
import { Camera, RefreshCw, X, Check } from 'lucide-react';

interface CameraCaptureProps {
  onCapture: (base64: string) => void;
  onClose: () => void;
}

const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' },
        audio: false 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("No se pudo acceder a la cámara. Por favor verifique los permisos.");
    }
  };

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  }, [stream]);

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        const dataUrl = canvasRef.current.toDataURL('image/jpeg');
        setCapturedImage(dataUrl);
        stopCamera();
      }
    }
  };

  const handleConfirm = () => {
    if (capturedImage) {
      onCapture(capturedImage);
      onClose();
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    startCamera();
  };

  React.useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center p-4">
      <div className="relative w-full max-w-lg aspect-[3/4] bg-slate-900 rounded-3xl overflow-hidden border border-blue-500/30 shadow-[0_0_50px_rgba(37,99,235,0.2)]">
        {!capturedImage ? (
          <>
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              className="w-full h-full object-cover"
            />
            {/* Overlay grid */}
            <div className="absolute inset-0 pointer-events-none border-[1px] border-white/10 grid grid-cols-3 grid-rows-3">
              {[...Array(9)].map((_, i) => <div key={i} className="border-[0.5px] border-white/5"></div>)}
            </div>
            <div className="absolute bottom-8 left-0 right-0 flex justify-center items-center gap-8">
              <button 
                onClick={onClose}
                className="p-4 bg-slate-800/80 rounded-full text-white hover:bg-slate-700 transition-colors"
              >
                <X size={24} />
              </button>
              <button 
                onClick={capturePhoto}
                className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition-transform border-4 border-blue-500"
              >
                <div className="w-16 h-16 rounded-full border-2 border-slate-900"></div>
              </button>
              <div className="w-14"></div> {/* Spacer */}
            </div>
          </>
        ) : (
          <>
            <img src={capturedImage} className="w-full h-full object-cover" alt="Captured" />
            <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-6 px-6">
              <button 
                onClick={handleRetake}
                className="flex-1 py-4 bg-slate-800 text-white rounded-2xl flex items-center justify-center gap-2 font-bold uppercase tracking-wider"
              >
                <RefreshCw size={20} /> Reintentar
              </button>
              <button 
                onClick={handleConfirm}
                className="flex-1 py-4 bg-blue-600 text-white rounded-2xl flex items-center justify-center gap-2 font-bold uppercase tracking-wider"
              >
                <Check size={20} /> Usar Foto
              </button>
            </div>
          </>
        )}
      </div>
      <canvas ref={canvasRef} className="hidden" />
      <p className="text-blue-400 font-bold mt-6 text-sm tracking-widest uppercase animate-pulse">
        {capturedImage ? "REVISAR CAPTURA" : "POSICIONE EL VEHÍCULO EN EL RECUADRO"}
      </p>
    </div>
  );
};

export default CameraCapture;

import React, { useState, useRef, useCallback } from 'react';
import { Camera, Search, Upload, X, Loader2, Zap } from 'lucide-react';
import { analyzeProductImage, searchProductByName } from '../services/gemini';
import { ProductData } from '../types';

interface ProductSearchProps {
  onProductFound: (product: ProductData) => void;
}

export const ProductSearch: React.FC<ProductSearchProps> = ({ onProductFound }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = async () => {
    setError(null);
    setIsScanning(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      setError("Unable to access camera. Please upload an image instead.");
      setIsScanning(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsScanning(false);
  };

  const captureImage = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageBase64 = canvas.toDataURL('image/jpeg').split(',')[1];
        handleAnalysis(imageBase64, 'image');
        stopCamera();
      }
    }
  }, []);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(',')[1];
        handleAnalysis(base64String, 'image');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTextSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    handleAnalysis(searchQuery, 'text');
  };

  const handleAnalysis = async (input: string, type: 'text' | 'image') => {
    setIsLoading(true);
    setError(null);
    try {
      let product: ProductData;
      if (type === 'image') {
        product = await analyzeProductImage(input);
      } else {
        product = await searchProductByName(input);
      }
      onProductFound(product);
    } catch (err) {
      setError("Could not analyze product. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-xl overflow-hidden border border-slate-100 dark:border-slate-800 transition-colors">
        
        {/* Header */}
        <div className="p-8 pb-0 text-center">
          <div className="inline-flex items-center justify-center p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl mb-4">
             <Zap className="text-emerald-600 dark:text-emerald-400 h-6 w-6" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Find a Product</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2">Scan a barcode, upload a photo, or search by name</p>
        </div>

        <div className="p-8 space-y-8">
          
          {/* Search Bar */}
          <form onSubmit={handleTextSearch} className="relative group">
            <input
              type="text"
              className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-xl outline-none focus:border-emerald-400 dark:focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-800 transition-all text-lg pl-12 text-slate-900 dark:text-white placeholder-slate-400"
              placeholder="Search e.g. 'Oreo Cookies'"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              disabled={isLoading}
            />
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-slate-500 h-5 w-5 group-focus-within:text-emerald-500" />
            <button 
              type="submit"
              disabled={!searchQuery.trim() || isLoading}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-emerald-600 hover:bg-emerald-700 text-white p-2 rounded-lg transition-colors disabled:opacity-50 disabled:bg-slate-400"
            >
              {isLoading && searchQuery ? <Loader2 className="animate-spin h-5 w-5" /> : <Search className="h-5 w-5" />}
            </button>
          </form>

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
            <span className="flex-shrink-0 mx-4 text-slate-400 dark:text-slate-500 text-sm font-medium uppercase tracking-wider">Or Use Camera</span>
            <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
          </div>

          {/* Camera Actions */}
          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={startCamera}
              className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl hover:border-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/10 transition-all group"
            >
              <Camera className="h-8 w-8 text-slate-400 dark:text-slate-500 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 mb-2" />
              <span className="font-medium text-slate-600 dark:text-slate-300 group-hover:text-emerald-700 dark:group-hover:text-emerald-400">Scan Product</span>
            </button>

            <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all group cursor-pointer">
              <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
              <Upload className="h-8 w-8 text-slate-400 dark:text-slate-500 group-hover:text-blue-600 dark:group-hover:text-blue-400 mb-2" />
              <span className="font-medium text-slate-600 dark:text-slate-300 group-hover:text-blue-700 dark:group-hover:text-blue-400">Upload Photo</span>
            </label>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl text-sm flex items-center justify-center border border-red-100 dark:border-red-900/30">
              {error}
            </div>
          )}

          {isLoading && !searchQuery && (
            <div className="flex flex-col items-center justify-center py-4">
              <Loader2 className="h-8 w-8 text-emerald-500 animate-spin mb-2" />
              <p className="text-slate-500 dark:text-slate-400 text-sm">Analyzing product data...</p>
            </div>
          )}

        </div>
      </div>

      {/* Camera Modal Overlay */}
      {isScanning && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex flex-col items-center justify-center p-4">
          <div className="relative w-full max-w-lg bg-black rounded-3xl overflow-hidden aspect-[3/4] shadow-2xl border border-slate-800">
            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
            <canvas ref={canvasRef} className="hidden" />
            
            <div className="absolute inset-0 border-[3px] border-emerald-500/50 m-8 rounded-2xl pointer-events-none flex items-center justify-center">
              <div className="w-full h-0.5 bg-red-500/80 animate-[scan_2s_ease-in-out_infinite] shadow-[0_0_10px_rgba(239,68,68,0.5)]"></div>
            </div>

            <div className="absolute bottom-8 left-0 right-0 flex justify-center space-x-6">
              <button 
                onClick={stopCamera}
                className="p-4 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md text-white transition-all"
              >
                <X className="h-6 w-6" />
              </button>
              <button 
                onClick={captureImage}
                className="p-5 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg transform hover:scale-110 transition-all border-4 border-emerald-900/30"
              >
                <Camera className="h-8 w-8" />
              </button>
            </div>
          </div>
          <p className="text-white mt-4 font-medium opacity-80">Align product in frame</p>
        </div>
      )}
    </div>
  );
};
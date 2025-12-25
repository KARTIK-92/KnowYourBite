import React, { useState, useRef, useCallback } from 'react';
import { Camera, Search, Upload, X, Loader2, Zap, ScanLine, Smartphone, Aperture } from 'lucide-react';
import { analyzeProductImage, searchProductByName } from '../services/gemini';
import { ProductData } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

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
    } catch (err: any) {
      setError(err.message || "Could not analyze product. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center min-h-[70vh] w-full"
    >
      <div className="w-full max-w-3xl holo-card rounded-[3rem] p-1.5 shadow-2xl overflow-hidden relative group">
        
        {/* Animated Gradient Border */}
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-500 opacity-20 group-hover:opacity-40 transition-opacity blur-xl"></div>
        
        <div className="bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl rounded-[2.6rem] p-8 md:p-12 relative overflow-hidden">
          
          {/* Header */}
          <div className="text-center relative z-10 mb-12">
            <motion.div 
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className="inline-flex items-center justify-center p-6 bg-slate-900 dark:bg-white rounded-3xl mb-8 shadow-2xl shadow-emerald-500/20"
            >
               <Aperture className="text-white dark:text-slate-900 h-10 w-10 animate-spin-slow" />
            </motion.div>
            <h2 className="text-5xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">Input Data.</h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium text-lg max-w-md mx-auto">
              Scan a barcode, snap a photo, or search manually to unleash the AI.
            </p>
          </div>

          <div className="space-y-8 relative z-10 max-w-xl mx-auto">
            
            {/* Search Bar - Portal Style */}
            <form onSubmit={handleTextSearch} className="relative group">
               <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl blur opacity-25 group-focus-within:opacity-75 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative bg-white dark:bg-slate-900 rounded-2xl flex items-center shadow-inner border border-slate-200 dark:border-slate-800">
                <Search className="absolute left-6 text-slate-400 h-6 w-6" />
                <input
                  type="text"
                  className="w-full px-6 py-5 pl-16 bg-transparent outline-none text-lg font-bold text-slate-900 dark:text-white placeholder-slate-300 dark:placeholder-slate-600 font-sans"
                  placeholder="SEARCH DATABASE..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  disabled={isLoading}
                />
                <button 
                  type="submit"
                  disabled={!searchQuery.trim() || isLoading}
                  className="absolute right-3 bg-slate-100 dark:bg-slate-800 hover:bg-emerald-500 hover:text-white text-slate-900 dark:text-white p-3 rounded-xl transition-all disabled:opacity-50"
                >
                  {isLoading && searchQuery ? <Loader2 className="animate-spin h-5 w-5" /> : <ArrowSearch />}
                </button>
              </div>
            </form>

            <div className="relative flex py-4 items-center">
              <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
              <span className="flex-shrink-0 mx-6 text-slate-300 dark:text-slate-600 text-[10px] font-bold uppercase tracking-[0.2em]">Visual Input</span>
              <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
            </div>

            {/* Actions Grid */}
            <div className="grid grid-cols-2 gap-4">
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={startCamera}
                className="relative overflow-hidden flex flex-col items-center justify-center p-8 rounded-3xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 transition-all group"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="p-4 bg-white dark:bg-slate-800 rounded-full mb-4 shadow-lg group-hover:scale-110 transition-transform relative z-10">
                   <Camera className="h-8 w-8 text-slate-900 dark:text-white" />
                </div>
                <span className="font-bold text-lg text-slate-900 dark:text-white relative z-10">Camera</span>
              </motion.button>

              <motion.label 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="relative overflow-hidden flex flex-col items-center justify-center p-8 rounded-3xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 hover:border-blue-500/50 transition-all group cursor-pointer"
              >
                <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="p-4 bg-white dark:bg-slate-800 rounded-full mb-4 shadow-lg group-hover:scale-110 transition-transform relative z-10">
                   <Upload className="h-8 w-8 text-slate-900 dark:text-white" />
                </div>
                <span className="font-bold text-lg text-slate-900 dark:text-white relative z-10">Gallery</span>
              </motion.label>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="bg-red-500/10 text-red-500 p-4 rounded-xl text-center font-bold text-sm border border-red-500/20"
              >
                {error}
              </motion.div>
            )}

            {isLoading && !searchQuery && (
               <div className="absolute inset-0 bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl flex flex-col items-center justify-center z-50 rounded-[2.3rem]">
                 <div className="relative mb-8">
                   {/* Spinning Rings */}
                   <div className="absolute inset-0 rounded-full border-4 border-slate-100 dark:border-slate-800"></div>
                   <div className="absolute inset-0 rounded-full border-t-4 border-emerald-500 animate-spin"></div>
                   <div className="h-24 w-24 rounded-full border-4 border-slate-100 dark:border-slate-800"></div>
                   
                   <Zap className="h-8 w-8 text-emerald-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                 </div>
                 <p className="text-slate-900 dark:text-white font-black text-xl tracking-tight">ANALYZING MOLECULES</p>
                 <p className="text-slate-400 font-mono text-xs mt-2 animate-pulse">Running Neural Net...</p>
               </div>
            )}
          </div>
        </div>
      </div>

      {/* Sci-Fi Camera HUD */}
      <AnimatePresence>
        {isScanning && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center"
          >
            <div className="relative w-full h-full max-w-screen-sm mx-auto">
              <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover opacity-60" />
              <canvas ref={canvasRef} className="hidden" />
              
              {/* HUD Graphics */}
              <div className="absolute inset-0 pointer-events-none p-6 flex flex-col justify-between">
                 {/* Top Bar */}
                 <div className="flex justify-between items-start">
                    <div className="text-emerald-500 font-mono text-xs">
                        <div>SYS.OP.READY</div>
                        <div>CAM.01.LIVE</div>
                    </div>
                    <div className="flex gap-1">
                        {[1,2,3,4].map(i => <div key={i} className="w-1 h-4 bg-emerald-500/50"></div>)}
                    </div>
                 </div>

                 {/* Center Reticle */}
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72">
                    <div className="absolute inset-0 border border-emerald-500/30 rounded-full animate-[spin_10s_linear_infinite]"></div>
                    <div className="absolute inset-4 border border-dashed border-emerald-500/20 rounded-full animate-[spin_15s_linear_infinite_reverse]"></div>
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-emerald-500 text-black text-[10px] font-bold px-2 rounded-sm">TARGET ACQUIRED</div>
                    
                    {/* Corners */}
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-emerald-400"></div>
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-emerald-400"></div>
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-emerald-400"></div>
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-emerald-400"></div>
                    
                    <div className="absolute top-1/2 left-0 w-full h-[1px] bg-emerald-500/50"></div>
                    <div className="absolute top-0 left-1/2 h-full w-[1px] bg-emerald-500/50"></div>
                 </div>
                 
                 {/* Scanning Bar */}
                 <div className="absolute top-0 left-0 w-full h-1 bg-emerald-400 shadow-[0_0_20px_rgba(52,211,153,1)] animate-[scan_2s_ease-in-out_infinite]"></div>

                 {/* Bottom Controls */}
                 <div className="pointer-events-auto flex justify-center items-center gap-12 pb-8">
                    <button 
                    onClick={stopCamera}
                    className="h-12 w-12 rounded-full bg-slate-800/80 text-white flex items-center justify-center border border-slate-700 hover:bg-slate-700 backdrop-blur-md"
                    >
                    <X className="h-5 w-5" />
                    </button>
                    
                    <button 
                    onClick={captureImage}
                    className="h-20 w-20 rounded-full border-4 border-emerald-500/30 flex items-center justify-center p-1"
                    >
                        <div className="h-full w-full bg-white rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.5)] active:scale-90 transition-transform">
                             <div className="h-2 w-2 bg-emerald-900 rounded-full"></div>
                        </div>
                    </button>

                    <div className="h-12 w-12"></div> 
                 </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const ArrowSearch = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/><path d="M11 8v6"/><path d="M8 11h6"/></svg>
)
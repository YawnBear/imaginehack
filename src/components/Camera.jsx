'use client';

import { useState, useRef, useEffect } from 'react';

export default function Camera() {
  const videoRef = useRef(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState('');
  const [facingMode, setFacingMode] = useState('environment');
  const [imageRecognized, setImageRecognized] = useState(false);
  const [displayDetails, setDisplayDetails] = useState(true);
  const [isTalking, setIsTalking] = useState(false);
  


  // Start camera stream
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: true // Enable microphone
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsStreaming(true);
        setError('');
      }
    } catch (err) {
      setError('Failed to access camera: ' + err.message);
    }
  };

  // Toggle camera between front and back
  const toggleCamera = async () => {
    if (!videoRef.current || !videoRef.current.srcObject) {
      return;
    }
    
    try {
      // Stop current tracks
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      
      // Toggle facing mode
      const newFacingMode = facingMode === 'user' ? 'environment' : 'user';
      setFacingMode(newFacingMode);
    } catch (err) {
      setError('Failed to switch camera: ' + err.message);
    }
  };

  // Auto-hide details panel after 7 seconds
  useEffect(() => {
    let timer = null;
    
    if (imageRecognized && displayDetails) {
      timer = setTimeout(() => {
        setDisplayDetails(false);
      }, 7000); // 7 seconds
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [imageRecognized, displayDetails]);

  // Start camera when component mounts
  useEffect(() => {
    let mounted = true;

      // Update the setupCamera function to remove setDebugInfo
    
    const setupCamera = async () => {
      try {
        await startCamera();
        
        // Simply return without setting up any frame counter
        // since we no longer have debugging info to update
        
      } catch (err) {
        console.error('Setup failed:', err);
        if (mounted) {
          setError('Setup failed: ' + err.message);
        }
      }
    };
    
    setupCamera();
    
    // Clean up function
    return () => {
      mounted = false;
      
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, [facingMode]); // Only re-run when camera mode changes

  return (
    <div className="flex flex-col h-full bg-gray-900 text-white">
      {/* Video Container */}
      <div className="flex-grow relative bg-black">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={true}
          className="absolute inset-0 h-full w-full object-cover"
        />
        
        {!isStreaming && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
            <p className="text-gray-400">Activating camera...</p>
          </div>
        )}

        {imageRecognized && displayDetails && (
          <div className="absolute top-10 left-0 right-0 pl-15 z-20">
            <div className="bg-white p-4 rounded-2xl shadow-md w-fit max-w-xs mx-auto">
              <h2 className="text-[#FFB902] font-bold text-lg mb-2">
                Tun V. T. Sambanthan
              </h2>
              <div className="border-l-4 border-[#CB1F40] pl-3 space-y-1 text-sm text-gray-700">
                <p>Former Minister of Malaysia</p>
                <p>Years Served: 1972 - 1974</p>
              </div>
            </div>
          </div>
        )}

        {/* Show button when image is recognized */}
        {imageRecognized && (
          <button 
            className="absolute bottom-28 left-1/2 transform -translate-x-1/2 w-50 h-16 rounded-3xl
              bg-green-500 hover:opacity-90 text-white flex items-center justify-center shadow-lg z-10 text-lg font-bold"
            onClick={() => setIsTalking(true)}
          >
            Start Conversation
          </button>
        )}

        {isTalking && (
          <div className="absolute inset-x-0 bottom-10 flex justify-center gap-3 z-20">
            {/* Camera Flip Button */}
            <button
              onClick={toggleCamera}
              className="p-4 rounded-full bg-white"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </button>

            {/* End Button */}
            <button 
              className="p-4 rounded-full bg-[#CB1F40]" 
              onClick={() => setIsTalking(false)}
            >
              <svg className="w-5 h-5" fill="none" stroke="white" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* Camera flip button when not talking */}
        {!isTalking && (
          <button
            onClick={toggleCamera}
            className="absolute right-6 top-6 w-12 h-12 rounded-full bg-black/30 backdrop-blur-sm hover:bg-black/50 flex items-center justify-center shadow-lg z-10"
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
          </button>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="absolute top-16 left-0 right-0 mx-4 bg-red-600 p-3 rounded-lg">
          <p className="text-sm">❌ {error}</p>
          <button 
            className="absolute top-2 right-2 text-white" 
            onClick={() => setError('')}
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
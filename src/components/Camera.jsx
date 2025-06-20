'use client';

import { useState, useRef, useEffect } from 'react';

export default function Call() {
  const videoRef = useRef(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState('');
  const [facingMode, setFacingMode] = useState('environment');

  // Start camera stream
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
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
      
      // Start new stream with the toggled camera
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: newFacingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      setError('Failed to switch camera: ' + err.message);
    }
  };

  // Start camera on component mount and keep it on
  useEffect(() => {
    startCamera();
    
    // Clean up function will run when component unmounts
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, [facingMode]); // Re-run when facingMode changes

  return (
    <div className="flex flex-col h-full bg-gray-900 text-white">

      {/* Video Container - Taking most of the screen */}
      <div className="flex-grow relative bg-black">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="absolute inset-0 h-full w-full object-cover"
        />
        {!isStreaming && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
            <p className="text-gray-400">Activating camera...</p>
          </div>
        )}
        
        {/* Camera flip button positioned on the side */}
        <button
          onClick={toggleCamera}
          className="absolute right-6 top-1/2 transform -translate-y-1/2 w-14 h-14 rounded-full bg-yellow-400 hover:bg-yellow-300 text-red-900 flex items-center justify-center shadow-lg z-10"
        >
          🔄
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="absolute top-16 left-0 right-0 mx-4 bg-red-600 p-3 rounded-lg">
          <p className="text-sm">❌ {error}</p>
        </div>
      )}
    </div>
  );
}
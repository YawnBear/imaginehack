'use client';

import { useState, useRef, useEffect } from 'react';

export default function Call() {
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

        {imageRecognized && (
          <>
            {displayDetails && (
              <div className="absolute top-10 left-0 right-0 pl-15">
                {/* Content for details panel */}
                  <div className="bg-white p-4 rounded-2xl shadow-md w-fit max-w-xs">
                  <h2 className="text-[#FFB902] font-bold text-lg mb-2">
                    Tunku Abdul Rahman
                  </h2>
                  <div className="border-l-4 border-[#CB1F40] pl-3 space-y-1 text-sm text-gray-700">
                    <p>Former Prime Minister of Malaysia</p>
                    <p>Years Served: 1951 - 1971</p>
                    <p>President of UMNO</p>
                  </div>
                </div>
              </div>
            )}
            
            <button className="absolute bottom-28 left-1/2 transform -translate-x-1/2 w-50 h-16 rounded-3xl bg-yellow-400 hover:bg-yellow-300 text-white flex items-center justify-center shadow-lg z-10 text-lg font-bold"
              onClick={() => {setDisplayDetails(false); setImageRecognized(false); setIsTalking(true);}}>
              Talk
            </button>
          </>
        )}

        {isTalking && (
          <div className="flex gap-2 p-2 rounded-2xl bg-[rgba(0,0,0,0.4)] absolute bottom-30 left-1/2 transform -translate-x-1/2 z-20">
            {/* Speaker Button */}
            <button className="bg-white p-3 rounded-xl">
              <img src="/speaker.png" alt="Speaker" className="w-5" />
            </button>

            {/* Microphone Button */}
            <button className="bg-white p-3 rounded-xl">
              <img src="/microphone.png" alt="Microphone" className="w-4" />
            </button>

            {/* Close Button */}
            <button className="bg-[#CB1F40] p-3 rounded-xl" onClick={() => setIsTalking(false)}>
              <img src="/x.png" alt="Close" className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Camera flip button positioned on the side */}
        {/* <button
          onClick={toggleCamera}
          className="absolute right-6 top-1/2 transform -translate-y-1/2 w-14 h-14 rounded-full bg-yellow-400 hover:bg-yellow-300 text-red-900 flex items-center justify-center shadow-lg z-10"
        >
          🔄
        </button> */}
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
'use client';

import { useState, useRef, useEffect } from 'react';

export default function Camera({ setActiveTab }) {
  const videoRef = useRef(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState('');
  const [imageRecognized, setImageRecognized] = useState(false);
  const [displayDetails, setDisplayDetails] = useState(true);
  const [isTalking, setIsTalking] = useState(false);
const [isMuted, setIsMuted] = useState(false); // Default to muted
  
  // Start camera stream - removed facingMode toggle
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment', // Fixed to environment camera
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: true // Keep microphone enabled
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsStreaming(true);
        setError('');
        
        // Process audio to prevent feedback
        try {
          // Get the audio context and create a muted destination
          const audioContext = new (window.AudioContext || window.webkitAudioContext)();
          const source = audioContext.createMediaStreamSource(stream);
          
          // By not connecting to audioContext.destination, we prevent feedback
          // Instead, connect to a gain node with zero gain (silent)
          const gainNode = audioContext.createGain();
          gainNode.gain.value = 0;
          source.connect(gainNode);
          gainNode.connect(audioContext.destination);
        } catch (audioErr) {
          console.warn('Could not process audio:', audioErr);
        }
      }
    } catch (err) {
      setError('Failed to access camera: ' + err.message);
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
  }, []); // Removed facingMode dependency

  handleMuteButtonClick = () => {
    try{
      
    }
  }

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

        {/* Show button when image is recognized and not talking */}
        {imageRecognized && !isTalking && (
          <button 
            className="absolute bottom-28 left-1/2 transform -translate-x-1/2 w-50 h-16 rounded-3xl
              bg-yellow-400 hover:opacity-90 text-white flex items-center justify-center shadow-lg z-10 text-lg font-bold"
            onClick={() => {
              setIsTalking(true);
              setDisplayDetails(false);
              setImageRecognized(false);
            }}
          >
            Start Conversation
          </button>
        )}

        {/* Show control buttons when talking - removed toggle camera button */}
        {isTalking && (
          <div className="absolute inset-x-0 bottom-25 flex justify-center gap-3 z-20">

            <button
              className="p-4 rounded-full bg-white/20 backdrop-blur-sm"
              onClick={() => {
                // Toggle audio tracks
                if (videoRef.current && videoRef.current.srcObject) {
                  const audioTracks = videoRef.current.srcObject.getAudioTracks();
                  audioTracks.forEach(track => {
                    track.enabled = !track.enabled;
                  });
                  setIsMuted(prevState => !prevState);
                }
              }}
            >
              {isMuted ? (
                // Muted icon (microphone with slash)
                <svg className="w-5 h-5" fill="none" stroke="white" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3l18 18" />
                </svg>
              ) : (
                // Unmuted icon (microphone)
                <svg className="w-5 h-5" fill="none" stroke="white" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              )}
            </button>
            <button 
              className="p-4 rounded-full bg-[#CB1F40]" 
              onClick={() => {setIsTalking(false) ; setActiveTab('home') ; setImageRecognized(false) ;setDisplayDetails(true)}}
            >
              <svg className="w-5 h-5" fill="none" stroke="white" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
      </div>
      <button
        onClick={() => setImageRecognized(true) && setDisplayDetails(true)}
        className="absolute w-10 h-20 right-6 bottom-25 px-4 py-2 rounded-lg border border-white/50 bg-transparent hover:bg-white/10 text-sm text-white font-medium backdrop-blur-sm shadow-sm transition-colors"
      >
        
      </button>

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
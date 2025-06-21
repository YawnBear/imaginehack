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
  
  // WebSocket connection
  const [socketConnected, setSocketConnected] = useState(false);
  const socketRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  
  // Server configuration
  const SERVER_URL = 'ws://localhost:8765'; // Replace with your Python WebSocket server URL
  
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
      
      // Close existing WebSocket connection and media recorder
      if (socketRef.current) {
        socketRef.current.close();
      }
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
      }
      
      // Toggle facing mode
      const newFacingMode = facingMode === 'user' ? 'environment' : 'user';
      setFacingMode(newFacingMode);
    } catch (err) {
      setError('Failed to switch camera: ' + err.message);
    }
  };

  // Connect to WebSocket server and start streaming
  const startStreaming = async () => {
    if (!isStreaming || !videoRef.current || !videoRef.current.srcObject) {
      setError('Camera stream not available');
      return;
    }

    try {
      // Create WebSocket connection
      const socket = new WebSocket(SERVER_URL);
      socketRef.current = socket;
      
      socket.onopen = () => {
        console.log('WebSocket connection established');
        setSocketConnected(true);
        
        // Setup media recorder with the stream
        const mediaRecorder = new MediaRecorder(videoRef.current.srcObject, {
          mimeType: 'video/webm; codecs=vp9,opus', // This format works in most browsers
          videoBitsPerSecond: 1000000, // 1 Mbps
          audioBitsPerSecond: 128000  // 128 kbps
        });
        mediaRecorderRef.current = mediaRecorder;
        
        // Send stream data to server when available
        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0 && socket.readyState === WebSocket.OPEN) {
            socket.send(event.data);
          }
        };
        
        // Handle media recorder errors
        mediaRecorder.onerror = (error) => {
          console.error('Media Recorder error:', error);
          setError('Recording error: ' + error.name);
        };
        
        // Start recording with frequent data chunks for lower latency
        mediaRecorder.start(100); // Generate data chunks every 100ms
      };
      
      // Handle WebSocket messages from server
      socket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          
          // Handle different message types from server
          if (message.type === 'recognition_result') {
            console.log('Recognition result:', message);
            
            // Check if any faces were recognized in the message
            if (message.faces && message.faces.length > 0) {
              // Face was recognized! Show details panel and button
              setImageRecognized(true);
              setDisplayDetails(true);
              
              // Optionally, you could use the specific face details from the message
              // to customize what appears in the details panel
              // const recognizedPerson = message.faces[0].name;
              // const confidence = message.faces[0].confidence;
            }
          } else if (message.type === 'audio_response') {
            // Play audio response if available
            const audio = new Audio(message.data);
            audio.play();
          } else if (message.type === 'error') {
            setError('Server error: ' + message.data);
          }
        } catch (err) {
          console.error('Error parsing server message:', err);
        }
      };
      
      // Handle WebSocket errors
      socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        setError('Connection error');
        setSocketConnected(false);
      };
      
      // Handle WebSocket closure
      socket.onclose = (event) => {
        console.log('WebSocket connection closed:', event.code, event.reason);
        setSocketConnected(false);
        
        // Stop media recorder if it's still running
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
          mediaRecorderRef.current.stop();
        }
      };
    } catch (err) {
      setError('Failed to connect: ' + err.message);
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

  // Start camera and connect to WebSocket immediately
  useEffect(() => {
    const setupCamera = async () => {
      await startCamera();
      
      // Once camera is started, begin streaming to server
      if (isStreaming && !isTalking) {
        startStreaming();
      }
    };
    
    setupCamera();
    
    // Clean up function
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach(track => track.stop());
      }
      
      // Close WebSocket connection
      if (socketRef.current) {
        socketRef.current.close();
      }
      
      // Stop media recorder
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
    };
  }, [facingMode, isStreaming]); // Re-run when facingMode or isStreaming changes

  return (
    <div className="flex flex-col h-full bg-gray-900 text-white">
      {/* Video Container */}
      <div className="flex-grow relative bg-black">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={false}
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
                <div className="bg-white p-4 rounded-2xl shadow-md w-fit max-w-xs mx-auto">
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
            
            <button 
              className={`absolute bottom-28 left-1/2 transform -translate-x-1/2 w-50 h-16 rounded-3xl ${socketConnected ? 'bg-green-500' : 'bg-yellow-400'} hover:opacity-90 text-white flex items-center justify-center shadow-lg z-10 text-lg font-bold`}
              onClick={() => {
                setDisplayDetails(false); 
                setImageRecognized(false); 
                setIsTalking(true);
                startStreaming(); // Start streaming to server
              }}
            >
              {socketConnected ? 'Streaming...' : 'Start Streaming'}
            </button>
          </>
        )}

        {isTalking && (
          <div className="absolute inset-x-0 bottom-10 flex justify-center gap-3 z-20">
            {/* Connection Status */}
            <div className={`px-4 py-2 rounded-full ${socketConnected ? 'bg-green-500' : 'bg-red-500'} text-white font-medium`}>
              {socketConnected ? 'Connected' : 'Disconnected'}
            </div>
            
            {/* Camera Flip Button */}
            <button
              onClick={toggleCamera}
              className="p-4 rounded-full bg-white"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </button>

            {/* End Streaming Button */}
            <button 
              className="p-4 rounded-full bg-[#CB1F40]" 
              onClick={() => {
                setIsTalking(false);
                
                // Close WebSocket connection
                if (socketRef.current) {
                  socketRef.current.close();
                }
                
                // Stop media recorder
                if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
                  mediaRecorderRef.current.stop();
                }
                
                setSocketConnected(false);
              }}
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
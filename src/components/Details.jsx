import { useState } from 'react';

export default function Details({id, setDetails }) {
  const [showOptions, setShowOptions] = useState(false);
  
  // If no figure is passed, use default data
  const figureData = {
    id: 1,
    name: 'Tunku Abdul Rahman',
    title: 'Former Prime Minister of Malaysia',
    image: '/tunku.jpg',
    birth: 'Born in February 8 (Year 1903)',
    death: 'Died in December 6 (Year 1990)',
    bio: 'Tunku Abdul Rahman, commonly referred to as Tunku, was a Malaysian statesman who served as prime minister of Malaysia from 1957 to 1970. He previously served as the only chief minister of Malaya from 1955 to 1957, as President of UMNO from 1951 to 1971, and as leader of the Alliance Party from 1952 to 1971.',
  };
  
  const handleBackButton = () => {
    setDetails(false);
  }

  return (
    <>
      {id === 2 && (
        <div className="min-h-screen bg-gray-100">
          {/* Header with image */}
          <div className="relative h-96">
            <img 
              src={figureData.image} 
              alt={figureData.name}
              className="w-full h-full object-cover object-top"
              style={{ objectPosition: '0 -15px' }}  // This moves the image down within its container
            />
            
            {/* Back button */}
            <button 
              onClick={handleBackButton}
              className="absolute top-6 left-6 bg-white/20 backdrop-blur-sm p-2 rounded-full z-10"
            >
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            {/* Options button */}
            <button 
              onClick={() => setShowOptions(!showOptions)} 
              className="absolute top-6 right-6 bg-white/20 backdrop-blur-sm p-2 rounded-full"
            >
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </button>
            
            {showOptions && (
              <div className="absolute top-16 right-6 bg-white rounded-xl shadow-lg p-2 z-10">
                <button className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded-lg">Share</button>
                <button className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded-lg">Add to favorites</button>
                <button className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded-lg text-red-500">Report</button>
              </div>
            )}
          </div>

          {/* White info card with rounded top corners */}
          <div className="bg-white -mt-8 rounded-t-3xl relative z-10 overflow-hidden">
            {/* Indicator line */}
            <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto my-3"></div>
            
            {/* Content */}
            <div className="px-6 pb-20">
              {/* Name and title */}
              <h1 className="text-4xl font-bold text-yellow-500 mt-3">{figureData.name}</h1>
              <p className="text-gray-500 mb-4">{figureData.title}</p>
              
              {/* Birth and death */}
              <div className="space-y-3 mb-6">
                <div className="bg-[#D71940] text-white px-4 py-3 rounded-full flex items-center">
                  <div className="w-4 h-4 rounded-full border-2 border-white mr-3"></div>
                  <span>{figureData.birth}</span>
                </div>
                
                <div className="bg-[#D71940] text-white px-4 py-3 rounded-full flex items-center">
                  <div className="w-4 h-4 rounded-full border-2 border-white mr-3"></div>
                  <span>{figureData.death}</span>
                </div>
              </div>
              
              {/* Biography */}
              <div className="bg-yellow-400 p-5 rounded-2xl mb-6">
                <p className="text-gray-800">{figureData.bio}</p>
              </div>
              
              {/* Action button */}
              <div className="mt-8">
                <button className="w-full bg-red-700 text-white font-bold py-3 rounded-xl text-lg flex items-center justify-center gap-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  Talk to Tunku
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
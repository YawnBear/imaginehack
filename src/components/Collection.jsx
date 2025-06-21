import { useState } from 'react';
import Details from './Details.jsx';

export default function Collection() {
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [details, setDetails] = useState(false);
  
  const historicalFigures = [
    { 
      id: 1, 
      name: 'V. T. Sambanthan', 
      image: '/sambanthan.jpg', 
      category: 'minister',
      recent: true 
    },
    { 
      id: 2, 
      name: 'Tunku Abdul Rahman', 
      image: '/tunku.jpg', 
      category: 'minister',
      recent: false
    },
    { 
      id: 3, 
      name: 'Hang Tuah', 
      image: '/hangtuah.jpg', 
      category: 'Warrior',
      recent: false
    },
    { 
      id: 4, 
      name: 'P. Ramlee', 
      image: '/pramlee.jpg', 
      category: 'Artist',
      recent: false
    },
  ];
  
  // Filter figures based on selected category and search query
  const filteredFigures = historicalFigures
    .filter(figure => selectedFilter === 'All' || figure.category === selectedFilter)
    .filter(figure => figure.name.toLowerCase().includes(searchQuery.toLowerCase()));
  
  return (
    <>
    {details ? <Details setDetails={setDetails}/> : 
    <div className="pt-6 bg-[#D71940] min-h-screen text-white">
      
      {/* Search and filter row */}
      <div className="mb-20 flex items-center gap-2 m-4 mt-10">
        {/* Search bar (larger) */}
        <div className="flex-grow relative">
          <input
            type="text"
            placeholder="Search friends..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-3 pl-10 rounded-full bg-white text-black font-medium border-2 border-[#D9D9D9] focus:outline-none"
          />
          <svg 
            className="absolute left-3 top-3.5 w-5 h-5 text-gray-500" 
            fill="none" 
            stroke="#FFB902" 
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        
        {/* Dropdown filter (smaller) */}
        <select 
          value={selectedFilter}
          onChange={(e) => setSelectedFilter(e.target.value)}
          className="p-3 rounded-full bg-white text-black font-medium border-2 border-[#D9D9D9] focus:outline-none w-28"
        >
          <option value="All">All</option>
          <option value="minister">Minister</option>
          <option value="Warrior">Warrior</option>
          <option value="Artist">Artist</option>
        </select>
      </div>
      
      {/* Collection count */}
      <div className="bg-white text-black rounded-t-4xl p-4 flex-grow flex flex-col min-h-[80vh] pb-20">      
        <h2 className="text-xl font-semibold mb-4 text-center">
          Your have 4 friends
        </h2>
        
        {/* Empty state when no results */}
        {filteredFigures.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No historical figures found matching your search.
          </div>
        )}
        
        {/* Grid of historical figures */}
        <div className="grid grid-cols-2 gap-4">
          {filteredFigures.map((figure) => (
            <div 
              key={figure.id} 
              className="relative rounded-xl overflow-hidden h-65 bg-gray-200"
              onClick={() => setDetails(true)}
            >
              {figure.recent && (
                <div className="absolute top-2 left-2 bg-gray-500/60 text-white text-xs px-2 py-1 rounded-full flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                  Chatted Recently
                </div>
              )}
              
              <img 
                src={figure.image} 
                alt={figure.name} 
                className="w-full h-full object-cover"
              />
              
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 text-white text-center">
                <h3 className="font-bold text-lg">{figure.name}</h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
    }
    
    </>
    
  );
}
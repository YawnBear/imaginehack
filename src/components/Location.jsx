import { useState } from 'react';

export default function Map() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  const categories = [
    { id: 'palace', name: 'Palace', icon: '🏯' },
    { id: 'museums', name: 'Museums', icon: '🏛️' },
    { id: 'mosque', name: 'Mosque', icon: '🕌' },
    { id: 'houses', name: 'Houses', icon: '🏠' },
  ];
  
  const locations = [
    {
      id: 1,
      name: 'Abdullah Hukum Heritage House',
      image: '/heritage-house.jpg',
      distance: '32 km away',
      address: '4MCG+83, 59200 Kuala Lumpur, Federal Territory of Kuala Lumpur',
      visited: false,
      category: 'houses',
      favorite: false
    },
    {
      id: 2,
      name: 'The National Museum of Malaysia',
      image: '/national-museum.jpg',
      distance: '39 km away',
      address: 'Department of Museum, Jln Damansara, Perdana Botanical Gardens, 50566 Kuala Lumpur, Federal Territory of Kuala Lumpur',
      visited: true,
      visitCount: 1,
      category: 'museums',
      favorite: false
    }
  ];
  
  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId === selectedCategory ? 'All' : categoryId);
  };
  
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };
  
  const clearSearch = () => {
    setSearchQuery('');
  };
  
  const toggleFavorite = (id) => {
    // In a real app, you would update state here
    console.log(`Toggle favorite for location ${id}`);
  };
  
  const filteredLocations = locations.filter(location => {
    const matchesCategory = selectedCategory === 'All' || location.category === selectedCategory;
    const matchesSearch = location.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         location.address.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="bg-white min-h-screen pb-20">
      {/* Search Bar */}
      <div className="p-4 pb-2">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Near You"
            value={searchQuery}
            onChange={handleSearch}
            className="w-full pl-10 pr-10 py-3 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-yellow-500"
          />
          {searchQuery && (
            <button 
              onClick={clearSearch}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>
      
      {/* Categories */}
      <div className="flex justify-between px-4 py-3 overflow-x-auto">
        {categories.map(category => (
          <div 
            key={category.id}
            onClick={() => handleCategorySelect(category.id)}
            className={`flex flex-col items-center space-y-1 cursor-pointer min-w-[60px] ${selectedCategory === category.id ? 'opacity-100' : 'opacity-70'}`}
          >
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center border border-gray-200 shadow-sm">
              <div className="text-2xl">{category.icon}</div>
            </div>
            <span className="text-xs">{category.name}</span>
          </div>
        ))}
      </div>
      
      {/* Location Cards */}
      <div className="p-4 pt-2 space-y-4">
        {filteredLocations.map(location => (
          <div key={location.id} className="rounded-lg overflow-hidden shadow-md bg-white">
            <div className="relative">
              <img 
                src={location.image} 
                alt={location.name}
                className="w-full h-48 object-cover"
              />
              <button 
                onClick={() => toggleFavorite(location.id)}
                className="absolute top-2 right-2 bg-white/70 rounded-full p-1.5"
              >
                <svg 
                  className={`w-5 h-5 ${location.favorite ? 'text-red-500 fill-current' : 'text-gray-400'}`} 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </button>
            </div>
            <div className="p-3">
              <h3 className="font-bold text-lg text-yellow-500">{location.name}</h3>
              <p className="text-sm text-gray-500">{location.distance}</p>
              <p className="text-sm text-gray-500">{location.address}</p>
              <div className="mt-2 text-sm">
                {location.visited ? (
                  <p>You visited this place {location.visitCount > 1 ? `${location.visitCount} times` : 'once'}</p>
                ) : (
                  <p>You <span className="font-bold">never</span> visited this place</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
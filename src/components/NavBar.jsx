export default function NavBar({setActiveTab, activeTab}) {
    return (
    <nav className=" bg-white border-t border-gray-200 fixed bottom-0 left-0 right-0">
        <div className="flex justify-around items-center">
          <button
            onClick={() => setActiveTab('home')}
            className={`flex flex-col items-center justify-center w-1/5 py-2 ${
              activeTab === 'home' ? 'text-red-700' : 'text-black'
            }`}
          >
            <div className="w-6 h-6 flex items-center justify-center">
              <img
                src={activeTab==='home' ? "/homeRed.png": "/home.png"}
                alt="Home"
                className="w-5 h-5 object-contain"
              />
            </div>
            <span className="text-xs mt-1">Home</span>
          </button>
          
          <button
            onClick={() => setActiveTab('collection')}
            className={`flex flex-col items-center justify-center w-1/5 py-2 ${
              activeTab === 'collection' ? 'text-red-700' : 'text-black'
            }`}
          >
            <div className="w-6 h-6 flex items-center justify-center">
              <img
                src={activeTab==='collection' ? "/collectionRed.png": "/collectionBlack.png"}
                alt="Collection"
                className="w-5 h-5 object-contain"
              />
            </div>
            <span className="text-xs mt-1">Collection</span>
          </button>
          
          <button
            onClick={() => setActiveTab('camera')}
            className={"flex flex-col items-center justify-center w-1/5 py-2 text-red-700"}
          >
            <div className={`p-3 rounded-full ${
              activeTab === 'camera' ? 'bg-red-700' : 'bg-gray-300'
            }`}>
              <div className="w-6 h-6 flex items-center justify-center">
              <img
                src="/camera.png"
                alt="Camera"
                className="w-5 h-5 object-contain"
              />
            </div>
            </div>
          </button>
          
          <button
            onClick={() => setActiveTab('map')}
            className={`flex flex-col items-center justify-center w-1/5 py-2 ${
              activeTab === 'map' ? 'text-red-700' : 'text-black'
            }`}
          >
          <div className="w-6 h-6 flex items-center justify-center">
              <img
                src={activeTab==='map' ? "/locationRed.png": "/locationBlack.png"}
                alt="map"
                className="w-5 h-5 object-contain"
              />
            </div>
            <span className="text-xs mt-1">Location</span>
          </button>
          
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex flex-col items-center justify-center w-1/5 py-2 ${
              activeTab === 'profile' ? 'text-red-700' : 'text-black'
            }`}
          >
          <div className="w-6 h-6 flex items-center justify-center">
              <img
                src={activeTab==='profile' ? "/profileRed.png": "/profile.png"}
                alt="Profile"
                className="w-5 h-5 object-contain"
              />
            </div>
            <span className="text-xs mt-1">Profile</span>
          </button>
        </div>
      </nav>
    );
}
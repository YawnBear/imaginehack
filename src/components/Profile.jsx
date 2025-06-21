import { useState } from 'react';

export default function Profile() {
  const [profileData, setProfileData] = useState({
    name: 'Donkey',
    email: 'donkey@example.com',
    phone: '+60 12 345 6789',
    language: 'English',
    notifications: true,
    darkMode: false
  });

  const [isEditing, setIsEditing] = useState(false);
  const [tempData, setTempData] = useState({...profileData});
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setTempData({
      ...tempData,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    setProfileData({...tempData});
    setIsEditing(false);
  };
  
  const handleCancel = () => {
    setTempData({...profileData});
    setIsEditing(false);
  };
  
  const stats = [
    { label: 'Calls', count: "7" },
    { label: 'Collections', count: "4/21" },
    { label: 'Visits', count: "2/10" }
  ];
  
  return (
    <div className="bg-[#D71940] min-h-screen pb-7">
      {/* Profile Header */}
      <div className="pt-6 px-4 pb-8 text-white">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">My Profile</h1>
          <button 
            className="bg-yellow-400 text-red-900 font-bold py-1 px-4 rounded-full text-sm"
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? 'Cancel' : 'Edit'}
          </button>
        </div>
        
        {/* User Summary */}
        <div className="flex items-center mb-6">
          <div className="w-24 h-24 rounded-full bg-white p-1 mr-4">
            <img
              src="https://cdn-icons-png.flaticon.com/512/1998/1998611.png"
              alt="Profile"
              className="w-full h-full object-cover rounded-full"
            />
          </div>
          <div>
            <h2 className="text-2xl font-bold">{profileData.name}</h2>
            <p className="text-yellow-200 opacity-90">{profileData.email}</p>
          </div>
        </div>
        
        {/* Stats */}
        <div className="flex justify-between mb-4">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white/10 rounded-xl p-3 text-center w-[31%]">
              <p className="text-xl font-bold text-yellow-300">{stat.count}</p>
              <p className="text-xs">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
      
      {/* Profile Details */}
      <div className="bg-white rounded-t-3xl px-4 pt-6 pb-20 min-h-[60vh]">
        {isEditing ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-600">Display Name</label>
              <input
                type="text"
                name="name"
                value={tempData.name}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="Your name"
              />
            </div>
            
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-600">Email</label>
              <input
                type="email"
                name="email"
                value={tempData.email}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="Your email"
              />
            </div>
            
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-600">Phone</label>
              <input
                type="tel"
                name="phone"
                value={tempData.phone}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="Your phone number"
              />
            </div>
            
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-600">Language</label>
              <select
                name="language"
                value={tempData.language}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="English">English</option>
                <option value="Malay">Bahasa Malaysia</option>
                <option value="Chinese">Chinese</option>
                <option value="Tamil">Tamil</option>
              </select>
            </div>
            
            <div className="flex items-center justify-between p-3 border border-gray-300 rounded-lg">
              <label className="text-gray-700">Enable Notifications</label>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  name="notifications"
                  checked={tempData.notifications}
                  onChange={handleChange}
                  className="sr-only peer" 
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between p-3 border border-gray-300 rounded-lg">
              <label className="text-gray-700">Dark Mode</label>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  name="darkMode"
                  checked={tempData.darkMode}
                  onChange={handleChange}
                  className="sr-only peer" 
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
              </label>
            </div>
            
            <div className="pt-4 flex space-x-3">
              <button
                type="button"
                onClick={handleCancel}
                className="w-1/2 py-3 border border-gray-300 rounded-xl font-bold text-gray-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="w-1/2 py-3 bg-[#D71940] text-white rounded-xl font-bold"
              >
                Save Changes
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Account Information</h2>
            
              <div className="space-y-4">
              {[
                { label: "Display Name", value: profileData.name },
                { label: "Email", value: profileData.email },
                { label: "Phone", value: profileData.phone },
                { label: "Language", value: profileData.language }
              ].map((item, index) => (
                <div key={index} className="border-b border-gray-200 pb-3">
                  <p className="text-sm text-gray-500">{item.label}</p>
                  <p className="text-base font-medium">{item.value}</p>
                </div>
              ))}
            </div>
            
            <h2 className="text-xl font-bold text-gray-800 mb-1 mt-6">Settings</h2>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div>
                  <p className="font-medium">Notifications</p>
                  <p className="text-sm text-gray-500">Enable push notifications</p>
                </div>
                <div className={`w-12 h-6 rounded-full ${profileData.notifications ? 'bg-[#D71940]' : 'bg-gray-300'}`}>
                  <div className={`w-6 h-6 rounded-full bg-white shadow transform transition-transform ${profileData.notifications ? 'translate-x-6' : ''}`}></div>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div>
                  <p className="font-medium">Dark Mode</p>
                  <p className="text-sm text-gray-500">Use dark theme</p>
                </div>
                <div className={`w-12 h-6 rounded-full ${profileData.darkMode ? 'bg-[#D71940]' : 'bg-gray-300'}`}>
                  <div className={`w-6 h-6 rounded-full bg-white shadow transform transition-transform ${profileData.darkMode ? 'translate-x-6' : ''}`}></div>
                </div>
              </div>
            </div>
            
            <div className="pt-6">
              <button className="w-full py-3 border border-red-300 text-red-600 rounded-xl font-bold">
                Log Out
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
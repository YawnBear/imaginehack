'use client';

import { useState } from 'react';
import Camera from '@/components/Camera.jsx';
import Home from '@/components/Home.jsx';
import Collection from '@/components/Collection.jsx';
import Map from '@/components/Location.jsx';
import Profile from '@/components/Profile.jsx';
import NavBar from '@/components/NavBar.jsx';

export default function App() {
  
  const [activeTab, setActiveTab] = useState('home');


  const renderActiveComponent = () => {
    switch (activeTab) {
      case 'home':
        return <Home />;
      case 'collection':
        return <Collection />;
      case 'camera':
        return <Camera setActiveTab={setActiveTab}/>;
      case 'map':
        return <Map />;
      case 'profile':
        return <Profile />;
      default:
        return <Home />;
    }
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {renderActiveComponent()}
      </main>
      
      {/* Bottom Navigation Bar */}
      <NavBar setActiveTab={setActiveTab} activeTab={activeTab}/>
    
    </div>
  );
}

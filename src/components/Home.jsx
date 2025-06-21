import React from 'react';

export default function App() {
  return (
    <>
    <div className="bg-[#D71940] p-4 text-white font-sans pb-30">

      {/* Header */}
      <div className="flex justify-between items-center mb-4 mt-10 pb-3">
        <h1 className="text-3xl font-bold">Hi, Donkey</h1>
        <div className="w-30 h-30 rounded-full bg-white p-1">
          <img
            src="https://cdn-icons-png.flaticon.com/512/1998/1998611.png"
            alt="Avatar"
            className="w-full h-full object-cover rounded-full"
          />
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white text-black rounded-xl p-4 mb-4 flex items-center justify-between">
        <div>
          <p className="text-sm text-red-600 font-bold">Recent Activity</p>
          <p className="text-base">
          You talked to <strong>Tunku Abdul Rahman</strong> at Museum Negara 2 days ago.
        </p>
        </div>
        <div>
          <img src="/arrow.png" alt="arrow"/>
        </div>
      </div>

      {/* Stats */}
      <div className="flex justify-between mb-6 text-center">
        {[
          { count: 2, label: 'Collection', icon: <img className='h-7' src="/collectionYellow.png" alt="arrow"/>},
          { count: 4, label: 'Calls', icon: <img className='h-7' src="/callYellow.png" alt="call"/> },
          { count: 3, label: 'Visits', icon: <img className='h-7' src="/location.png" alt="location"/> },
        ].map((item, i) => (
          <div key={i} className="bg-white text-black rounded-xl w-[30%] p-3">
            <div className='flex flex-row items-center justify-center gap-4 mb-2'>
              <div className="text-xl">{item.icon}</div>
              <div className="text-xl font-bold">{item.count}</div>
            </div>
            <div className="text-sm">{item.label}</div>
          </div>
        ))}
      </div>
    </div>
    
     <div className="bg-white rounded-t-4xl pt-8 p-4 mt-[-110] relative z-10">
        <div className="bg-[#D71940] rounded-2xl flex overflow-hidden mb-6">
          <div className="p-4 w-1/2 flex flex-col justify-between text-black">
            <div className="font-bold text-lg leading-tight text-white">
              Ask Tunku Abdul Rahman what to eat.
            </div>
            <a href="#" className="text-white underline mt-2 text-sm">Call now</a>
          </div>
          <div className="w-1/2">
            <img
              src="/nasilemak.png"
              alt="Food"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Scan Room Button */}
        <button className="w-full bg-yellow-400 text-white font-bold py-3 rounded-xl text-lg">
          Scan Room
        </button>
      </div>
      </>
  );
}

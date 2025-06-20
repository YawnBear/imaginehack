export default function Home() {
  return (
    <div className="p-4 pt-8 text-black min-h-screen">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold mb-2">
          <span className="text-2xl">👋</span> Welcome back, Jack!
        </h1>
        <p className="text-xl mb-6font-medium">Ready to relive history?</p>

        <div className="bg-red-700 p-5 rounded-xl mb-6 shadow-lg">
          <p className="mb-3">
            <span className="text-xl">📍</span> <span className="font-bold">Discover Malaysia's rich cultural legacy</span> like never before.
          </p>
          <p className="text-yellow-200 mb-2">
            Use your camera to explore real heritage sites — and when you find one, you'll unlock a conversation with a legendary figure from our past.
          </p>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-bold mb-3">
            <span className="mr-2">🕵️‍♂️</span> How it works:
          </h2>
          <ul className="space-y-2 pl-4">
            <li className="flex items-start">
              <span className="text-yellow-400 mr-2">1.</span> 
              <p>Visit a historical location</p>
            </li>
            <li className="flex items-start">
              <span className="text-yellow-400 mr-2">2.</span> 
              <p>Activate AR to explore hidden stories</p>
            </li>
            <li className="flex items-start">
              <span className="text-yellow-400 mr-2">3.</span> 
              <p>Talk to historical figures like Tun Fatimah, Hang Tuah, or Tunku Abdul Rahman</p>
            </li>
          </ul>
        </div>

        <div className="bg-red-700 p-5 rounded-xl">
          <h2 className="text-xl font-bold mb-2">
            <span className="mr-2">🎯</span> Start your journey
          </h2>
          <p className="mb-4">History is waiting for you.</p>
          <div className="space-y-3">
            <button className="w-full bg-yellow-400 text-red-900 font-bold py-3 px-4 rounded-lg flex items-center justify-center hover:bg-yellow-300 transition-colors">
              <span className="mr-2">👉</span> Scan a landmark to begin
            </button>
            <button className="w-full bg-red-900 text-yellow-100 font-bold py-3 px-4 rounded-lg flex items-center justify-center hover:bg-red-800 transition-colors">
              <span className="mr-2">👉</span> View your unlocked conversations
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
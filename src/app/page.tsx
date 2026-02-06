import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col" style={{fontFamily: 'Poppins, sans-serif'}}>
      {/* Header with Glass Effect */}
      <header className="w-full glass sticky top-0 z-50 border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center group">
                <span className="text-2xl font-bold smooth-transition" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  <span className="text-black">réz</span>
                  <span style={{ color: '#E54747' }} className="group-hover:animate-pulse">me.</span>
                </span>
              </Link>
            </div>

            {/* Navigation Menu */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link 
                href="https://www.rezme.app/" 
                className="text-base font-medium text-gray-700 hover:text-black smooth-transition hover:scale-105"
                style={{ fontFamily: 'Poppins, sans-serif' }}
                target="_blank" rel="noopener noreferrer"
              >
                Home
              </Link>
              <Link 
                href="https://www.rezme.app/about" 
                className="text-base font-medium text-gray-700 hover:text-black smooth-transition hover:scale-105"
                style={{ fontFamily: 'Poppins, sans-serif' }}
                target="_blank" rel="noopener noreferrer"
              >
                About
              </Link>
              <Link 
                href="https://www.rezme.app/product" 
                className="text-base font-medium text-gray-700 hover:text-black smooth-transition hover:scale-105"
                style={{ fontFamily: 'Poppins, sans-serif' }}
                target="_blank" rel="noopener noreferrer"
              >
                Product
              </Link>
              <Link 
                href="https://www.rezme.app/resources" 
                className="text-base font-medium text-gray-700 hover:text-black smooth-transition hover:scale-105"
                style={{ fontFamily: 'Poppins, sans-serif' }}
                target="_blank" rel="noopener noreferrer"
              >
                Resources
              </Link>
            </nav>

            {/* Auth Buttons */}
            <div className="flex items-center space-x-4">
              <Link
                href="/auth/user/login"
                className="text-base font-medium text-gray-700 hover:text-black smooth-transition"
                style={{ fontFamily: 'Poppins, sans-serif' }}
              >
                Sign In
              </Link>
              <Link
                href="/auth/user/signup"
                className="px-6 py-2 text-base font-medium rounded-xl text-white bg-black hover:bg-gray-800 smooth-transition shadow-md hover:shadow-lg"
                style={{ 
                  fontFamily: 'Poppins, sans-serif',
                }}
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 animate-fade-in">
          {/* Glass Card Container */}
          <div className="glass-strong rounded-3xl p-8 shadow-2xl backdrop-blur-2xl glow-border smooth-transition hover:scale-105 bg-white/60">
            <div className="text-center space-y-6">
              <h2 className="text-4xl font-bold text-black mb-4 animate-slide-up">
                Welcome to Rezme
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Rezme connects you to legal advice, trusted people, and jobs.
              </p>
            </div>
            
            <div className="space-y-4 mt-8">
              {/* Primary Registration Button */}
              <Link
                href="/auth/user/signup"
                className="group relative w-full flex justify-center py-4 px-6 text-base font-medium rounded-2xl text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 smooth-transition shadow-lg hover:shadow-2xl overflow-hidden"
              >
                <span className="relative z-10 font-semibold">Start here →</span>
              </Link>
              
              {/* Login Button */}
              <Link
                href="/auth/user/login"
                className="group relative w-full flex justify-center py-4 px-6 text-base font-medium rounded-2xl text-black glass-light hover:glass focus:outline-none focus:ring-2 focus:ring-gray-300 smooth-transition hover:shadow-lg border border-gray-200"
              >
                <span className="relative z-10">Sign back in</span>
              </Link>
            </div>
          </div>
          
          {/* Floating Decorative Elements */}
          <div className="flex justify-center space-x-4 mt-8">
            <div className="w-3 h-3 rounded-full bg-gray-300 animate-float"></div>
            <div className="w-3 h-3 rounded-full bg-gray-300 animate-float" style={{ animationDelay: '1s' }}></div>
            <div className="w-3 h-3 rounded-full bg-gray-300 animate-float" style={{ animationDelay: '2s' }}></div>
          </div>
        </div>
      </main>

      {/* Footer with Glass Effect */}
      <footer className="w-full glass border-t border-gray-200/50 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Logo and Tagline */}
            <div className="space-y-4">
              <Link href="/" className="flex items-center group">
                <span className="text-2xl font-bold" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  <span className="text-black">réz</span>
                  <span style={{ color: '#E54747' }} className="group-hover:animate-pulse">me.</span>
                </span>
              </Link>
              <p className="text-sm text-gray-600" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Automating Fair Chance Hiring compliance for modern HR teams.
              </p>
            </div>

            {/* Navigation */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Navigation
              </h3>
              <nav className="space-y-3">
                <Link 
                  href="https://www.rezme.app/" 
                  className="block text-sm text-gray-600 hover:text-black smooth-transition"
                  style={{ fontFamily: 'Poppins, sans-serif' }}
                  target="_blank" rel="noopener noreferrer"
                >
                  Home
                </Link>
                <Link 
                  href="https://www.rezme.app/about" 
                  className="block text-sm text-gray-600 hover:text-black smooth-transition"
                  style={{ fontFamily: 'Poppins, sans-serif' }}
                  target="_blank" rel="noopener noreferrer"
                >
                  About
                </Link>
                <Link 
                  href="https://www.rezme.app/product" 
                  className="block text-sm text-gray-600 hover:text-black smooth-transition"
                  style={{ fontFamily: 'Poppins, sans-serif' }}
                  target="_blank" rel="noopener noreferrer"
                >
                  Product
                </Link>
                <Link 
                  href="https://www.rezme.app/resources" 
                  className="block text-sm text-gray-600 hover:text-black smooth-transition"
                  style={{ fontFamily: 'Poppins, sans-serif' }}
                  target="_blank" rel="noopener noreferrer"
                >
                  Resources
                </Link>
                <Link 
                  href="/auth/user/login" 
                  className="block text-sm text-gray-600 hover:text-black smooth-transition"
                  style={{ fontFamily: 'Poppins, sans-serif' }}
                >
                  Sign In
                </Link>
              </nav>
            </div>

            {/* Legal & Policies */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Legal & Policies
              </h3>
              <nav className="space-y-3">
                <Link 
                  href="https://app.termly.io/policy-viewer/policy.html?policyUUID=e05577fe-11ce-47d5-9a97-c994b0ee6acf" 
                  className="block text-sm text-gray-600 hover:text-black smooth-transition"
                  style={{ fontFamily: 'Poppins, sans-serif' }}
                  target="_blank" rel="noopener noreferrer"
                >
                  Privacy Policy
                </Link>
                <Link 
                  href="https://app.termly.io/policy-viewer/policy.html?policyUUID=6947f494-a92e-419a-82df-ddc2ec5a1743" 
                  className="block text-sm text-gray-600 hover:text-black smooth-transition"
                  style={{ fontFamily: 'Poppins, sans-serif' }}
                  target="_blank" rel="noopener noreferrer"
                >
                  Cookie Policy
                </Link>
                <Link 
                  href="https://app.termly.io/policy-viewer/policy.html?policyUUID=40404d5f-9640-47ad-bab0-8f2bb32aabc8" 
                  className="block text-sm text-gray-600 hover:text-black smooth-transition"
                  style={{ fontFamily: 'Poppins, sans-serif' }}
                  target="_blank" rel="noopener noreferrer"
                >
                  Terms & Conditions
                </Link>
                <Link 
                  href="https://app.termly.io/policy-viewer/policy.html?policyUUID=2dee6321-2901-4da4-a2e6-d31333c34462" 
                  className="block text-sm text-gray-600 hover:text-black smooth-transition"
                  style={{ fontFamily: 'Poppins, sans-serif' }}
                  target="_blank" rel="noopener noreferrer"
                >
                  Disclaimer
                </Link>
                <Link 
                  href="https://www.canva.com/design/DAGbAYTxAqQ/7VXnGimgiKAWzBXfJBfbVQ/edit" 
                  className="block text-sm text-gray-600 hover:text-black smooth-transition"
                  style={{ fontFamily: 'Poppins, sans-serif' }}
                  target="_blank" rel="noopener noreferrer"
                >
                  Branding Guidelines
                </Link>
                <Link 
                  href="https://app.pactsafe.com/sign?r=656335a17c5752be211f42bb&s=656335a17c5752be211f42bd&signature=mmgK3G~HAApM5Xp-bZmWlgO~3DQka7e6OqzsCyEpDIs8Zu8uJzmbCAbS7-89E~L0ZHCSQ6kytTBr7FSbyyX7o4AHaqssthcwwdXE7Njy1jo~w9z3bFUHh5ThLRfplS~VaSSCygyKw2cQ-dOm23rVhjJHS2Twn4JH9K4i5uo-Ihawo8NnVls~s~wzitNBCfJL5hBzarsxGYbgW-nN8pVMFKfslOzJWQrnNoogynAaEToOjkaraNcyPgmVaY8l4iYvZJxzmVR1rxwDDJH8gghYZmYjk0Oqn-r4glbTauhuqiwo391PrnsXA6KTZdZ2ovSo8o-egdfyXtOuGIHqIJqVSQ__" 
                  className="block text-sm text-gray-600 hover:text-black smooth-transition"
                  style={{ fontFamily: 'Poppins, sans-serif' }}
                  target="_blank" rel="noopener noreferrer"
                >
                  Open AI Data Processing Agreement
                </Link>
                <Link 
                  href="https://app.vanta.com/rezme.app/trust/kbynv6xr5c2g82tzmhq3qz/controls" 
                  className="block text-sm text-gray-600 hover:text-black smooth-transition"
                  style={{ fontFamily: 'Poppins, sans-serif' }}
                  target="_blank" rel="noopener noreferrer"
                >
                  Trust Center
                </Link>
              </nav>
            </div>
          </div>

          {/* Copyright */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <p className="text-center text-sm text-gray-600" style={{ fontFamily: 'Poppins, sans-serif' }}>
              © 2024 Rézme. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

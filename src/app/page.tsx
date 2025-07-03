import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-white flex flex-col" style={{fontFamily: 'Poppins, sans-serif'}}>
      {/* Header */}
      <header className="w-full border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center">
                <span className="text-2xl font-bold" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  <span style={{ color: '#000000' }}>réz</span>
                  <span style={{ color: '#E54747' }}>me.</span>
                </span>
              </Link>
            </div>

            {/* Navigation Menu */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link 
                href="#home" 
                className="text-base font-medium transition-all duration-200 hover:opacity-70"
                style={{ fontFamily: 'Poppins, sans-serif', color: '#000000' }}
              >
                Home
              </Link>
              <Link 
                href="#about" 
                className="text-base font-medium transition-all duration-200 hover:opacity-70"
                style={{ fontFamily: 'Poppins, sans-serif', color: '#000000' }}
              >
                About
              </Link>
              <Link 
                href="#product" 
                className="text-base font-medium transition-all duration-200 hover:opacity-70"
                style={{ fontFamily: 'Poppins, sans-serif', color: '#000000' }}
              >
                Product
              </Link>
              <Link 
                href="#resources" 
                className="text-base font-medium transition-all duration-200 hover:opacity-70"
                style={{ fontFamily: 'Poppins, sans-serif', color: '#000000' }}
              >
                Resources
              </Link>
            </nav>

            {/* Auth Buttons */}
            <div className="flex items-center space-x-4">
              <Link
                href="/auth/user/login"
                className="text-base font-medium transition-all duration-200 hover:opacity-70"
                style={{ fontFamily: 'Poppins, sans-serif', color: '#000000' }}
              >
                Sign In
              </Link>
              <Link
                href="/auth/user/signup"
                className="px-6 py-2 text-base font-medium rounded-xl transition-all duration-200 hover:opacity-90"
                style={{ 
                  fontFamily: 'Poppins, sans-serif',
                  backgroundColor: '#E54747',
                  color: '#FFFFFF'
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
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="mt-6 text-4xl font-semibold text-black mb-4">
              Welcome to Rezme
            </h2>
            <p className="text-base text-gray-600 mb-8" style={{color: '#595959'}}>
              Choose how you want to access the platform
            </p>
          </div>
          
          <div className="space-y-4">
            {/* Primary Registration Button */}
            <Link
              href="/auth/user/signup"
              className="group relative w-full flex justify-center py-4 px-6 border border-gray-200 text-base font-medium rounded-xl text-black bg-white hover:bg-gray-50 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 shadow-sm hover:shadow-md"
              style={{borderColor: '#E5E5E5'}}
            >
              I am a User
            </Link>
            
            {/* Login Button */}
            <Link
              href="/auth/user/login"
              className="group relative w-full flex justify-center py-3 px-6 border text-base font-medium rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 hover:bg-gray-50 hover:opacity-90"
              style={{
                color: '#595959',
                borderColor: '#E5E5E5',
                backgroundColor: 'transparent'
              }}
            >
              Login as User
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Logo and Tagline */}
            <div className="space-y-4">
              <Link href="/" className="flex items-center">
                <span className="text-2xl font-bold" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  <span style={{ color: '#000000' }}>réz</span>
                  <span style={{ color: '#E54747' }}>me.</span>
                </span>
              </Link>
              <p className="text-sm" style={{ fontFamily: 'Poppins, sans-serif', color: '#595959' }}>
                Automating Fair Chance Hiring compliance for modern HR teams.
              </p>
            </div>

            {/* Navigation */}
            <div>
              <h3 className="text-lg font-semibold mb-4" style={{ fontFamily: 'Poppins, sans-serif', color: '#000000' }}>
                Navigation
              </h3>
              <nav className="space-y-3">
                <Link 
                  href="#home" 
                  className="block text-sm transition-all duration-200 hover:opacity-70"
                  style={{ fontFamily: 'Poppins, sans-serif', color: '#595959' }}
                >
                  Home
                </Link>
                <Link 
                  href="#about" 
                  className="block text-sm transition-all duration-200 hover:opacity-70"
                  style={{ fontFamily: 'Poppins, sans-serif', color: '#595959' }}
                >
                  About
                </Link>
                <Link 
                  href="#product" 
                  className="block text-sm transition-all duration-200 hover:opacity-70"
                  style={{ fontFamily: 'Poppins, sans-serif', color: '#595959' }}
                >
                  Product
                </Link>
                <Link 
                  href="#resources" 
                  className="block text-sm transition-all duration-200 hover:opacity-70"
                  style={{ fontFamily: 'Poppins, sans-serif', color: '#595959' }}
                >
                  Resources
                </Link>
                <Link 
                  href="/auth/user/login" 
                  className="block text-sm transition-all duration-200 hover:opacity-70"
                  style={{ fontFamily: 'Poppins, sans-serif', color: '#595959' }}
                >
                  Sign In
                </Link>
              </nav>
            </div>

            {/* Legal & Policies */}
            <div>
              <h3 className="text-lg font-semibold mb-4" style={{ fontFamily: 'Poppins, sans-serif', color: '#000000' }}>
                Legal & Policies
              </h3>
              <nav className="space-y-3">
                <Link 
                  href="#privacy-policy" 
                  className="block text-sm transition-all duration-200 hover:opacity-70"
                  style={{ fontFamily: 'Poppins, sans-serif', color: '#595959' }}
                >
                  Privacy Policy
                </Link>
                <Link 
                  href="#cookie-policy" 
                  className="block text-sm transition-all duration-200 hover:opacity-70"
                  style={{ fontFamily: 'Poppins, sans-serif', color: '#595959' }}
                >
                  Cookie Policy
                </Link>
                <Link 
                  href="#terms-conditions" 
                  className="block text-sm transition-all duration-200 hover:opacity-70"
                  style={{ fontFamily: 'Poppins, sans-serif', color: '#595959' }}
                >
                  Terms & Conditions
                </Link>
                <Link 
                  href="#disclaimer" 
                  className="block text-sm transition-all duration-200 hover:opacity-70"
                  style={{ fontFamily: 'Poppins, sans-serif', color: '#595959' }}
                >
                  Disclaimer
                </Link>
                <Link 
                  href="#branding-guidelines" 
                  className="block text-sm transition-all duration-200 hover:opacity-70"
                  style={{ fontFamily: 'Poppins, sans-serif', color: '#595959' }}
                >
                  Branding Guidelines
                </Link>
                <Link 
                  href="#openai-data-processing" 
                  className="block text-sm transition-all duration-200 hover:opacity-70"
                  style={{ fontFamily: 'Poppins, sans-serif', color: '#595959' }}
                >
                  Open AI Data Processing Agreement
                </Link>
                <Link 
                  href="#trust-center" 
                  className="block text-sm transition-all duration-200 hover:opacity-70"
                  style={{ fontFamily: 'Poppins, sans-serif', color: '#595959' }}
                >
                  Trust Center
                </Link>
              </nav>
            </div>
          </div>

          {/* Copyright */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <p className="text-center text-sm" style={{ fontFamily: 'Poppins, sans-serif', color: '#595959' }}>
              © 2024 Rézme. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

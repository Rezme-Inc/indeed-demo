import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white py-12 px-4 sm:px-6 lg:px-8" style={{fontFamily: 'Poppins, sans-serif'}}>
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
          {/* Primary Registration Buttons */}
          <Link
            href="/auth/user/signup"
            className="group relative w-full flex justify-center py-4 px-6 border border-gray-200 text-base font-medium rounded-xl text-black bg-white hover:bg-gray-50 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 shadow-sm hover:shadow-md"
            style={{borderColor: '#E5E5E5'}}
          >
            I am a User
          </Link>
          
          <Link
            href="/auth/hr-admin/signup"
            className="group relative w-full flex justify-center py-4 px-6 border-2 text-base font-medium rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 shadow-sm hover:shadow-md hover:opacity-90"
            style={{backgroundColor: '#E54747', borderColor: '#E54747'}}
          >
            I am an HR Admin
          </Link>
          
          <Link
            href="/auth/rezme-admin/signup"
            className="group relative w-full flex justify-center py-4 px-6 border border-gray-200 text-base font-medium rounded-xl text-black bg-white hover:bg-gray-50 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 shadow-sm hover:shadow-md"
            style={{borderColor: '#E5E5E5'}}
          >
            I am a Rezme Admin
          </Link>
          
          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t" style={{borderColor: '#E5E5E5'}} />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white font-medium" style={{color: '#595959'}}>
                Or
              </span>
            </div>
          </div>
          
          {/* Login Buttons */}
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
          
          <Link
            href="/auth/hr-admin/login"
            className="group relative w-full flex justify-center py-3 px-6 border text-base font-medium rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 hover:bg-gray-50 hover:opacity-90"
            style={{
              color: '#595959',
              borderColor: '#E5E5E5',
              backgroundColor: 'transparent'
            }}
          >
            Login as HR Admin
          </Link>
          
          <Link
            href="/auth/rezme-admin/login"
            className="group relative w-full flex justify-center py-3 px-6 border text-base font-medium rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 hover:bg-gray-50 hover:opacity-90"
            style={{
              color: '#595959',
              borderColor: '#E5E5E5',
              backgroundColor: 'transparent'
            }}
          >
            Login as Rezme Admin
          </Link>
        </div>
      </div>
    </div>
  );
}

import Head from 'next/head'
import Link from 'next/link'

export default function Home() {
  return (
    <>
      <Head>
        <title>Bhavki Membership Manager</title>
        <meta name="description" content="Membership management system" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              Bhavki Membership Manager
            </h1>
            <p className="text-xl text-gray-600">
              Complete membership and investment management system
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Link 
              href="/chairman/login"
              className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow border-2 border-transparent hover:border-blue-500"
            >
              <div className="text-center">
                <div className="bg-blue-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Chairman Login</h2>
                <p className="text-gray-600">
                  Access the admin dashboard to manage members, payments, and investments
                </p>
              </div>
            </Link>

            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="text-center">
                <div className="bg-green-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Member Portal</h2>
                <div className="space-y-3">
                  <Link 
                    href="/member/login"
                    className="block w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
                  >
                    Member Login
                  </Link>
                  <Link 
                    href="/member/register"
                    className="block w-full bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300 transition"
                  >
                    Member Register
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 text-center text-gray-600">
            <p className="text-sm">
              Secure membership management with investment tracking and share calculations
            </p>
          </div>
        </div>
      </main>
    </>
  )
}

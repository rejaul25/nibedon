import { useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'

export default function MemberForgotPassword() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/member/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to send reset email')
      }

      setMessage(data.message)
      setEmail('')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Head>
        <title>পাসওয়ার্ড রিসেট - সদস্য</title>
      </Head>
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">পাসওয়ার্ড রিসেট</h1>
            <p className="text-gray-600 mt-2">আপনার পাসওয়ার্ড পুনরুদ্ধার করুন</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {message && (
              <div className="bg-green-50 text-green-800 p-3 rounded border border-green-200">
                {message}
              </div>
            )}

            {error && (
              <div className="bg-red-50 text-red-800 p-3 rounded border border-red-200">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                আপনার ইমেইল ঠিকানা লিখুন
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="your-email@example.com"
                required
              />
              <p className="text-sm text-gray-500 mt-2">
                আমরা এই ইমেইল ঠিকানায় একটি পাসওয়ার্ড রিসেট লিংক পাঠাব।
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition disabled:bg-green-400"
            >
              {loading ? 'পাঠানো হচ্ছে...' : 'রিসেট লিংক পাঠান'}
            </button>

            <div className="text-center">
              <Link
                href="/member/login"
                className="text-sm text-green-600 hover:underline"
              >
                ← লগইনে ফিরে যান
              </Link>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}

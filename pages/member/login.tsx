import { useState } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import Link from 'next/link'

export default function MemberLogin() {
  const router = useRouter()
  const [formData, setFormData] = useState({ membershipId: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/member/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Login failed')
      }

      router.push('/member/dashboard')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Head>
        <title>সদস্য লগইন - Bhavki Membership Manager</title>
      </Head>
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">সদস্য লগইন</h1>
            <p className="text-gray-600 mt-2">আপনার অ্যাকাউন্টে প্রবেশ করুন</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 text-red-800 p-3 rounded border border-red-200">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                মেম্বারশিপ আইডি
              </label>
              <input
                type="text"
                value={formData.membershipId}
                onChange={(e) => setFormData({ ...formData, membershipId: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                পাসওয়ার্ড
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition disabled:bg-green-400"
            >
              {loading ? 'লগইন হচ্ছে...' : 'লগইন'}
            </button>

            <div className="text-center space-y-2">
              <Link href="/member/register" className="block text-sm text-green-600 hover:underline">
                নতুন সদস্য নিবন্ধন করুন
              </Link>
              <Link href="/" className="block text-sm text-gray-600 hover:underline">
                ← হোমে ফিরে যান
              </Link>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}

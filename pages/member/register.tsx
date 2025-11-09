import { useState } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import Link from 'next/link'

export default function MemberRegister() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    membershipId: '',
    name: '',
    fatherName: '',
    mobile: '',
    password: '',
    confirmPassword: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('পাসওয়ার্ড মিলছে না')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/auth/member/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Registration failed')
      }

      alert('নিবন্ধন সফল হয়েছে! এখন লগইন করুন।')
      router.push('/member/login')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Head>
        <title>সদস্য নিবন্ধন - Bhavki Membership Manager</title>
      </Head>
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 py-12 px-4">
        <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">সদস্য নিবন্ধন</h1>
            <p className="text-gray-600 mt-2">নতুন অ্যাকাউন্ট তৈরি করুন</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 text-red-800 p-3 rounded border border-red-200">
                {error}
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  মেম্বারশিপ আইডি *
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
                  নাম *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  পিতার নাম *
                </label>
                <input
                  type="text"
                  value={formData.fatherName}
                  onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  মোবাইল নম্বর *
                </label>
                <input
                  type="tel"
                  value={formData.mobile}
                  onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                  placeholder="01XXXXXXXXX"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  পাসওয়ার্ড *
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                  minLength={6}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  পাসওয়ার্ড নিশ্চিত করুন *
                </label>
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                  minLength={6}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition disabled:bg-green-400"
            >
              {loading ? 'নিবন্ধন হচ্ছে...' : 'নিবন্ধন করুন'}
            </button>

            <div className="text-center space-y-2">
              <Link href="/member/login" className="block text-sm text-green-600 hover:underline">
                ইতিমধ্যে অ্যাকাউন্ট আছে? লগইন করুন
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

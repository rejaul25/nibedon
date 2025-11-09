import { useEffect, useState } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { format } from 'date-fns'

export default function MemberDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [payments, setPayments] = useState<any[]>([])
  const [investments, setInvestments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const userRes = await fetch('/api/auth/me')
      if (!userRes.ok) {
        router.push('/member/login')
        return
      }
      const userData = await userRes.json()
      if (userData.user.role !== 'member') {
        router.push('/')
        return
      }
      setUser(userData.user)

      const paymentsRes = await fetch(`/api/payments/member/${userData.user.membershipId}`)
      if (paymentsRes.ok) {
        const paymentsData = await paymentsRes.json()
        setPayments(paymentsData.payments)
      }

      const investmentsRes = await fetch('/api/investments')
      if (investmentsRes.ok) {
        const investmentsData = await investmentsRes.json()
        setInvestments(investmentsData.investments)
      }
    } catch (error) {
      router.push('/member/login')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/')
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">লোড হচ্ছে...</div>
  }

  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0)

  return (
    <>
      <Head>
        <title>সদস্য ড্যাশবোর্ড - Bhavki Membership Manager</title>
      </Head>
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">সদস্য ড্যাশবোর্ড</h1>
              <p className="text-sm text-gray-600">স্বাগতম, {user?.name}</p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              লগআউট
            </button>
          </div>
        </nav>

        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-600">মেম্বারশিপ আইডি</h3>
              <p className="text-2xl font-bold text-gray-900 mt-2">{user?.membershipId}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-600">মোট পেমেন্ট</h3>
              <p className="text-2xl font-bold text-gray-900 mt-2">{payments.length}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-600">মোট জমা</h3>
              <p className="text-2xl font-bold text-gray-900 mt-2">৳ {totalPaid}</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-bold mb-4">ব্যক্তিগত তথ্য</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-600">নাম</label>
                <p className="font-medium">{user?.name}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">পিতার নাম</label>
                <p className="font-medium">{user?.fatherName}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">মোবাইল</label>
                <p className="font-medium">{user?.mobile}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">শেয়ার টাইপ</label>
                <p className="font-medium">{user?.shareType === 'fullShare' ? 'ফুল শেয়ার' : 'নতুন সদস্য'}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-bold mb-4">পেমেন্ট ইতিহাস</h2>
            {payments.length === 0 ? (
              <p className="text-gray-600">কোনো পেমেন্ট নেই</p>
            ) : (
              <div className="overflow-x-auto max-h-96 overflow-y-auto">
                <table className="min-w-full">
                  <thead className="sticky top-0 bg-white">
                    <tr className="border-b">
                      <th className="text-left py-2">তারিখ</th>
                      <th className="text-right py-2">পরিমাণ</th>
                      <th className="text-left py-2">মাধ্যম</th>
                      <th className="text-left py-2">লেনদেন নম্বর</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((payment) => (
                      <tr key={payment.id} className="border-b">
                        <td className="py-2 text-black">{format(new Date(payment.date), 'dd/MM/yyyy')}</td>
                        <td className="text-right text-black">৳ {payment.amount}</td>
                        <td className="text-black">{payment.paymentFrom}</td>
                        <td className="text-black">{payment.transactionNumber || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">বিনিয়োগ</h2>
            {investments.length === 0 ? (
              <p className="text-gray-600">কোনো বিনিয়োগ নেই</p>
            ) : (
              <div className="space-y-4">
                {investments.map((investment) => (
                  <div key={investment.id} className="border-l-4 border-blue-500 pl-4">
                    <h3 className="font-bold">{investment.title}</h3>
                    <p className="text-sm text-gray-600">{investment.description}</p>
                    <div className="flex justify-between mt-2">
                      <span className="text-sm text-gray-600">{investment.purpose}</span>
                      <span className="font-bold">৳ {investment.amount}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

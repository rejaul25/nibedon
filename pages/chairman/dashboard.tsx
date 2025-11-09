import { useEffect, useState } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'

export default function ChairmanDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [activeTab, setActiveTab] = useState('members')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUser()
  }, [])

  const fetchUser = async () => {
    try {
      const res = await fetch('/api/auth/me')
      if (!res.ok) {
        router.push('/chairman/login')
        return
      }
      const data = await res.json()
      if (data.user.role !== 'chairman') {
        router.push('/')
        return
      }
      setUser(data.user)
    } catch (error) {
      router.push('/chairman/login')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/')
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  return (
    <>
      <Head>
        <title>Chairman Dashboard - Bhavki Membership Manager</title>
      </Head>
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Chairman Dashboard</h1>
              <p className="text-sm text-gray-600">Welcome, {user?.name}</p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </nav>

        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow">
            <div className="border-b border-gray-200">
              <nav className="flex -mb-px">
                {['members', 'payments', 'investments', 'audit'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-6 py-4 border-b-2 font-medium text-sm ${
                      activeTab === tab
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </nav>
            </div>

            <div className="p-6">
              {activeTab === 'members' && <MembersTab />}
              {activeTab === 'payments' && <PaymentsTab />}
              {activeTab === 'investments' && <InvestmentsTab />}
              {activeTab === 'audit' && <AuditTab />}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

function MembersTab() {
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Member Management</h2>
      <p className="text-gray-600">Use the API endpoints to manage members.</p>
      <div className="mt-4 space-y-2 text-sm">
        <p>• POST /api/membership-ids/generate - Generate membership IDs</p>
        <p>• POST /api/members - Create new member</p>
        <p>• GET /api/members - List all members</p>
        <p>• PUT /api/members/[id] - Update member</p>
        <p>• DELETE /api/members/[id] - Delete member</p>
      </div>
    </div>
  )
}

function PaymentsTab() {
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Payment Management</h2>
      <p className="text-gray-600">Record and manage member payments.</p>
      <div className="mt-4 space-y-2 text-sm">
        <p>• POST /api/payments - Create payment</p>
        <p>• PUT /api/payments/[id] - Update payment (including transaction number)</p>
        <p>• GET /api/payments - List all payments</p>
      </div>
    </div>
  )
}

function InvestmentsTab() {
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Investment Management</h2>
      <p className="text-gray-600">Create and manage investments.</p>
      <div className="mt-4 space-y-2 text-sm">
        <p>• POST /api/investments - Create investment</p>
        <p>• PUT /api/investments/[id] - Update investment</p>
        <p>• DELETE /api/investments/[id] - Delete investment</p>
        <p>• GET /api/investments - List all investments</p>
      </div>
    </div>
  )
}

function AuditTab() {
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Audit History</h2>
      <p className="text-gray-600">Track all chairman actions.</p>
      <div className="mt-4 space-y-2 text-sm">
        <p>• GET /api/audit-logs - View audit history</p>
      </div>
    </div>
  )
}

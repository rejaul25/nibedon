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
    return <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    </div>
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
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
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
  const [view, setView] = useState<'list' | 'generate' | 'create'>('list')
  const [members, setMembers] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string} | null>(null)
  const [selectedMember, setSelectedMember] = useState<any>(null)
  const [showEditModal, setShowEditModal] = useState(false)

  useEffect(() => {
    if (view === 'list') {
      fetchMembers()
    }
  }, [view, search])

  const fetchMembers = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/members?search=${encodeURIComponent(search)}`)
      const data = await res.json()
      setMembers(data.members || [])
    } catch (error) {
      showMessage('error', 'Failed to load members')
    } finally {
      setLoading(false)
    }
  }

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 5000)
  }

  const handleDeleteMember = async (memberId: string) => {
    if (!confirm('Are you sure? This will delete the member and all their payments permanently.')) return
    
    try {
      const res = await fetch(`/api/members/${memberId}`, { method: 'DELETE' })
      if (res.ok) {
        showMessage('success', 'Member deleted successfully')
        fetchMembers()
      } else {
        const data = await res.json()
        showMessage('error', data.error || 'Failed to delete member')
      }
    } catch (error) {
      showMessage('error', 'Failed to delete member')
    }
  }

  return (
    <div>
      {message && (
        <div className={`mb-4 p-4 rounded ${message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
          {message.text}
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Member Management</h2>
        <div className="space-x-2">
          <button
            onClick={() => setView('list')}
            className={`px-4 py-2 rounded ${view === 'list' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            Member List
          </button>
          <button
            onClick={() => setView('generate')}
            className={`px-4 py-2 rounded ${view === 'generate' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            Generate IDs
          </button>
          <button
            onClick={() => setView('create')}
            className={`px-4 py-2 rounded ${view === 'create' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            Create Member
          </button>
        </div>
      </div>

      {view === 'list' && (
        <div>
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search by name or membership ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : members.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No members found. Create your first member!
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {members.map((member) => (
                <div key={member.id} className="border rounded-lg p-4 hover:shadow-lg transition">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-bold text-lg">{member.name}</h3>
                      <p className="text-sm text-gray-600">{member.membershipId}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded ${
                      member.shareType === 'fullShare' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {member.shareType === 'fullShare' ? 'Full Share' : 'New Member'}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1 mb-3">
                    <p>Father: {member.fatherName}</p>
                    <p>Mobile: {member.mobile}</p>
                    <p>Payments: {member.payments?.length || 0}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedMember(member)
                        setShowEditModal(true)
                      }}
                      className="flex-1 bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteMember(member.id)}
                      className="flex-1 bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {view === 'generate' && <GenerateMembershipIDs showMessage={showMessage} />}
      {view === 'create' && <CreateMemberForm showMessage={showMessage} onSuccess={() => setView('list')} />}
      
      {showEditModal && selectedMember && (
        <EditMemberModal
          member={selectedMember}
          onClose={() => {
            setShowEditModal(false)
            setSelectedMember(null)
          }}
          onSuccess={() => {
            setShowEditModal(false)
            setSelectedMember(null)
            showMessage('success', 'Member updated successfully')
            fetchMembers()
          }}
        />
      )}
    </div>
  )
}

function GenerateMembershipIDs({ showMessage }: any) {
  const [count, setCount] = useState(1)
  const [generating, setGenerating] = useState(false)
  const [generatedIds, setGeneratedIds] = useState<string[]>([])

  const handleGenerate = async () => {
    setGenerating(true)
    try {
      const res = await fetch('/api/membership-ids/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ count })
      })
      const data = await res.json()
      if (res.ok) {
        setGeneratedIds(data.membershipIds.map((m: any) => m.membershipId))
        showMessage('success', `Generated ${data.membershipIds.length} membership ID(s)`)
      } else {
        showMessage('error', data.error || 'Failed to generate IDs')
      }
    } catch (error) {
      showMessage('error', 'Failed to generate IDs')
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h3 className="text-xl font-bold mb-4">Generate Membership IDs</h3>
      <div className="bg-gray-50 p-6 rounded-lg">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Number of IDs to Generate (1-100)
          </label>
          <input
            type="number"
            min="1"
            max="100"
            value={count}
            onChange={(e) => setCount(Math.min(100, Math.max(1, parseInt(e.target.value) || 1)))}
            className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
        >
          {generating ? 'Generating...' : `Generate ${count} ID(s)`}
        </button>
      </div>

      {generatedIds.length > 0 && (
        <div className="mt-6">
          <h4 className="font-bold mb-2">Generated IDs:</h4>
          <div className="bg-white border rounded p-4 max-h-64 overflow-y-auto">
            {generatedIds.map((id, index) => (
              <div key={index} className="py-1 font-mono text-sm">{id}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function CreateMemberForm({ showMessage, onSuccess }: any) {
  const [formData, setFormData] = useState({
    membershipId: '',
    name: '',
    fatherName: '',
    mobile: '',
    email: '',
    password: '',
    shareType: 'newMember'
  })
  const [creating, setCreating] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true)
    try {
      const res = await fetch('/api/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      const data = await res.json()
      if (res.ok) {
        showMessage('success', 'Member created successfully')
        onSuccess()
      } else {
        showMessage('error', data.error || 'Failed to create member')
      }
    } catch (error) {
      showMessage('error', 'Failed to create member')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h3 className="text-xl font-bold mb-4">Create New Member</h3>
      <form onSubmit={handleSubmit} className="bg-gray-50 p-6 rounded-lg space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Membership ID *</label>
          <input
            type="text"
            required
            value={formData.membershipId}
            onChange={(e) => setFormData({...formData, membershipId: e.target.value})}
            className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500"
            placeholder="BM-XXXXX-XXXX"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Father's Name *</label>
          <input
            type="text"
            required
            value={formData.fatherName}
            onChange={(e) => setFormData({...formData, fatherName: e.target.value})}
            className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Mobile *</label>
          <input
            type="tel"
            required
            value={formData.mobile}
            onChange={(e) => setFormData({...formData, mobile: e.target.value})}
            className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500"
            placeholder="01XXXXXXXXX"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email (Optional)</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500"
            placeholder="member@example.com"
          />
          <p className="text-xs text-gray-600 mt-1">
            Required for password reset functionality
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Password *</label>
          <input
            type="password"
            required
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Share Type *</label>
          <select
            value={formData.shareType}
            onChange={(e) => setFormData({...formData, shareType: e.target.value})}
            className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500"
          >
            <option value="newMember">New Member</option>
            <option value="fullShare">Full Share (New but Full Share)</option>
          </select>
          <p className="text-xs text-gray-600 mt-1">
            Full Share members will have automatic upfront payment calculated
          </p>
        </div>

        <button
          type="submit"
          disabled={creating}
          className="w-full bg-blue-600 text-white px-4 py-3 rounded hover:bg-blue-700 disabled:bg-gray-400 font-medium"
        >
          {creating ? 'Creating...' : 'Create Member'}
        </button>
      </form>
    </div>
  )
}

function EditMemberModal({ member, onClose, onSuccess }: any) {
  const [formData, setFormData] = useState({
    name: member.name,
    fatherName: member.fatherName,
    mobile: member.mobile,
    email: member.email || ''
  })
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch(`/api/members/${member.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      if (res.ok) {
        onSuccess()
      }
    } catch (error) {
      alert('Failed to update member')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <h3 className="text-xl font-bold mb-4">Edit Member</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Father's Name</label>
            <input
              type="text"
              required
              value={formData.fatherName}
              onChange={(e) => setFormData({...formData, fatherName: e.target.value})}
              className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Mobile</label>
            <input
              type="tel"
              required
              value={formData.mobile}
              onChange={(e) => setFormData({...formData, mobile: e.target.value})}
              className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email (Optional)</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500"
              placeholder="member@example.com"
            />
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border rounded hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function PaymentsTab() {
  const [view, setView] = useState<'list' | 'create' | 'bulk'>('list')
  const [payments, setPayments] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string} | null>(null)
  const [selectedPayment, setSelectedPayment] = useState<any>(null)
  const [showEditModal, setShowEditModal] = useState(false)

  useEffect(() => {
    if (view === 'list') {
      fetchPayments()
    }
  }, [view])

  const fetchPayments = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/payments')
      const data = await res.json()
      setPayments(data.payments || [])
    } catch (error) {
      showMessage('error', 'Failed to load payments')
    } finally {
      setLoading(false)
    }
  }

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 5000)
  }

  return (
    <div>
      {message && (
        <div className={`mb-4 p-4 rounded ${message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
          {message.text}
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Payment Management</h2>
        <div className="space-x-2">
          <button
            onClick={() => setView('list')}
            className={`px-4 py-2 rounded ${view === 'list' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            Payment List
          </button>
          <button
            onClick={() => setView('create')}
            className={`px-4 py-2 rounded ${view === 'create' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            Single Payment
          </button>
          <button
            onClick={() => setView('bulk')}
            className={`px-4 py-2 rounded ${view === 'bulk' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            Bulk Payments
          </button>
        </div>
      </div>

      {view === 'list' && (
        <div>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : payments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No payments recorded yet
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Member</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Transaction #</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {payments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{payment.member?.name}</div>
                        <div className="text-sm text-gray-500">{payment.membershipId}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(payment.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {payment.amount} BDT
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {payment.paymentFrom}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {payment.transactionNumber || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => {
                            setSelectedPayment(payment)
                            setShowEditModal(true)
                          }}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {view === 'create' && <CreatePaymentForm showMessage={showMessage} onSuccess={() => setView('list')} />}
      {view === 'bulk' && <BulkPaymentForm showMessage={showMessage} onSuccess={() => setView('list')} />}
      
      {showEditModal && selectedPayment && (
        <EditPaymentModal
          payment={selectedPayment}
          onClose={() => {
            setShowEditModal(false)
            setSelectedPayment(null)
          }}
          onSuccess={() => {
            setShowEditModal(false)
            setSelectedPayment(null)
            showMessage('success', 'Payment updated successfully')
            fetchPayments()
          }}
        />
      )}
    </div>
  )
}

function CreatePaymentForm({ showMessage, onSuccess }: any) {
  const [formData, setFormData] = useState({
    membershipId: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    paymentFrom: 'bKash',
    transactionNumber: ''
  })
  const [creating, setCreating] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true)
    try {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount),
          transactionNumber: formData.transactionNumber || null
        })
      })
      const data = await res.json()
      if (res.ok) {
        showMessage('success', 'Payment recorded successfully')
        onSuccess()
      } else {
        showMessage('error', data.error || 'Failed to record payment')
      }
    } catch (error) {
      showMessage('error', 'Failed to record payment')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h3 className="text-xl font-bold mb-4">Record Payment</h3>
      <form onSubmit={handleSubmit} className="bg-gray-50 p-6 rounded-lg space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Membership ID *</label>
          <input
            type="text"
            required
            value={formData.membershipId}
            onChange={(e) => setFormData({...formData, membershipId: e.target.value})}
            className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500"
            placeholder="BM-XXXXX-XXXX"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Amount (BDT) *</label>
          <input
            type="number"
            required
            min="0"
            step="0.01"
            value={formData.amount}
            onChange={(e) => setFormData({...formData, amount: e.target.value})}
            className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Payment Date *</label>
          <input
            type="date"
            required
            value={formData.date}
            onChange={(e) => setFormData({...formData, date: e.target.value})}
            className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method *</label>
          <select
            value={formData.paymentFrom}
            onChange={(e) => setFormData({...formData, paymentFrom: e.target.value})}
            className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500"
          >
            <option value="bKash">bKash</option>
            <option value="Nagad">Nagad</option>
            <option value="Bank">Bank</option>
            <option value="Cash">Cash</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Transaction Number (Optional)</label>
          <input
            type="text"
            value={formData.transactionNumber}
            onChange={(e) => setFormData({...formData, transactionNumber: e.target.value})}
            className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500"
            placeholder="TXN123456"
          />
        </div>

        <button
          type="submit"
          disabled={creating}
          className="w-full bg-blue-600 text-white px-4 py-3 rounded hover:bg-blue-700 disabled:bg-gray-400 font-medium"
        >
          {creating ? 'Recording...' : 'Record Payment'}
        </button>
      </form>
    </div>
  )
}

function EditPaymentModal({ payment, onClose, onSuccess }: any) {
  const [formData, setFormData] = useState({
    amount: payment.amount,
    date: new Date(payment.date).toISOString().split('T')[0],
    paymentFrom: payment.paymentFrom,
    transactionNumber: payment.transactionNumber || ''
  })
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch(`/api/payments/${payment.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount.toString()),
          transactionNumber: formData.transactionNumber || null
        })
      })
      if (res.ok) {
        onSuccess()
      }
    } catch (error) {
      alert('Failed to update payment')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <h3 className="text-xl font-bold mb-4">Edit Payment</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Amount (BDT)</label>
            <input
              type="number"
              required
              min="0"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({...formData, amount: parseFloat(e.target.value)})}
              className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Payment Date</label>
            <input
              type="date"
              required
              value={formData.date}
              onChange={(e) => setFormData({...formData, date: e.target.value})}
              className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
            <select
              value={formData.paymentFrom}
              onChange={(e) => setFormData({...formData, paymentFrom: e.target.value})}
              className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500"
            >
              <option value="bKash">bKash</option>
              <option value="Nagad">Nagad</option>
              <option value="Bank">Bank</option>
              <option value="Cash">Cash</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Transaction Number</label>
            <input
              type="text"
              value={formData.transactionNumber}
              onChange={(e) => setFormData({...formData, transactionNumber: e.target.value})}
              className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500"
              placeholder="TXN123456"
            />
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border rounded hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function BulkPaymentForm({ showMessage, onSuccess }: any) {
  const [rows, setRows] = useState([
    { membershipId: '', amount: '', date: new Date().toISOString().split('T')[0], paymentFrom: 'bKash', transactionNumber: '' }
  ])
  const [creating, setCreating] = useState(false)

  const addRow = () => {
    setRows([...rows, { membershipId: '', amount: '', date: new Date().toISOString().split('T')[0], paymentFrom: 'bKash', transactionNumber: '' }])
  }

  const removeRow = (index: number) => {
    if (rows.length > 1) {
      setRows(rows.filter((_, i) => i !== index))
    }
  }

  const updateRow = (index: number, field: string, value: string) => {
    const newRows = [...rows]
    newRows[index] = { ...newRows[index], [field]: value }
    setRows(newRows)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true)
    
    try {
      let successCount = 0
      let errorCount = 0
      
      for (const row of rows) {
        if (!row.membershipId || !row.amount) continue
        
        try {
          const res = await fetch('/api/payments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              membershipId: row.membershipId,
              amount: parseFloat(row.amount),
              date: row.date,
              paymentFrom: row.paymentFrom,
              transactionNumber: row.transactionNumber || null
            })
          })
          
          if (res.ok) {
            successCount++
          } else {
            errorCount++
          }
        } catch (error) {
          errorCount++
        }
      }
      
      if (successCount > 0) {
        showMessage('success', `Successfully recorded ${successCount} payment(s)${errorCount > 0 ? `. ${errorCount} failed.` : ''}`)
        onSuccess()
      } else {
        showMessage('error', 'Failed to record payments')
      }
    } catch (error) {
      showMessage('error', 'Failed to record payments')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div>
      <h3 className="text-xl font-bold mb-4">Bulk Payment Entry</h3>
      <p className="text-sm text-gray-600 mb-4">Record multiple payments at once. All rows with Membership ID and Amount will be saved.</p>
      <form onSubmit={handleSubmit} className="bg-gray-50 p-6 rounded-lg">
        <div className="overflow-x-auto mb-4">
          <table className="min-w-full bg-white border">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-700">Membership ID *</th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-700">Amount *</th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-700">Date *</th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-700">Method *</th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-700">Transaction #</th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-700"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {rows.map((row, index) => (
                <tr key={index}>
                  <td className="px-2 py-2">
                    <input
                      type="text"
                      value={row.membershipId}
                      onChange={(e) => updateRow(index, 'membershipId', e.target.value)}
                      className="w-full px-2 py-1 border rounded text-sm focus:ring-2 focus:ring-blue-500"
                      placeholder="BM-XXX"
                    />
                  </td>
                  <td className="px-2 py-2">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={row.amount}
                      onChange={(e) => updateRow(index, 'amount', e.target.value)}
                      className="w-full px-2 py-1 border rounded text-sm focus:ring-2 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-2 py-2">
                    <input
                      type="date"
                      value={row.date}
                      onChange={(e) => updateRow(index, 'date', e.target.value)}
                      className="w-full px-2 py-1 border rounded text-sm focus:ring-2 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-2 py-2">
                    <select
                      value={row.paymentFrom}
                      onChange={(e) => updateRow(index, 'paymentFrom', e.target.value)}
                      className="w-full px-2 py-1 border rounded text-sm focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="bKash">bKash</option>
                      <option value="Nagad">Nagad</option>
                      <option value="Bank">Bank</option>
                      <option value="Cash">Cash</option>
                    </select>
                  </td>
                  <td className="px-2 py-2">
                    <input
                      type="text"
                      value={row.transactionNumber}
                      onChange={(e) => updateRow(index, 'transactionNumber', e.target.value)}
                      className="w-full px-2 py-1 border rounded text-sm focus:ring-2 focus:ring-blue-500"
                      placeholder="TXN123"
                    />
                  </td>
                  <td className="px-2 py-2">
                    <button
                      type="button"
                      onClick={() => removeRow(index)}
                      disabled={rows.length === 1}
                      className="text-red-600 hover:text-red-900 text-sm disabled:text-gray-300"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="flex gap-2">
          <button
            type="button"
            onClick={addRow}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Add Row
          </button>
          <button
            type="submit"
            disabled={creating}
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400 font-medium"
          >
            {creating ? 'Recording Payments...' : `Record ${rows.filter(r => r.membershipId && r.amount).length} Payment(s)`}
          </button>
        </div>
      </form>
    </div>
  )
}

function InvestmentsTab() {
  const [view, setView] = useState<'list' | 'create'>('list')
  const [investments, setInvestments] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string} | null>(null)
  const [selectedInvestment, setSelectedInvestment] = useState<any>(null)
  const [showEditModal, setShowEditModal] = useState(false)

  useEffect(() => {
    if (view === 'list') {
      fetchInvestments()
    }
  }, [view])

  const fetchInvestments = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/investments')
      const data = await res.json()
      setInvestments(data.investments || [])
    } catch (error) {
      showMessage('error', 'Failed to load investments')
    } finally {
      setLoading(false)
    }
  }

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 5000)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this investment?')) return
    
    try {
      const res = await fetch(`/api/investments/${id}`, { method: 'DELETE' })
      if (res.ok) {
        showMessage('success', 'Investment deleted successfully')
        fetchInvestments()
      } else {
        showMessage('error', 'Failed to delete investment')
      }
    } catch (error) {
      showMessage('error', 'Failed to delete investment')
    }
  }

  return (
    <div>
      {message && (
        <div className={`mb-4 p-4 rounded ${message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
          {message.text}
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Investment Management</h2>
        <div className="space-x-2">
          <button
            onClick={() => setView('list')}
            className={`px-4 py-2 rounded ${view === 'list' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            Investment List
          </button>
          <button
            onClick={() => setView('create')}
            className={`px-4 py-2 rounded ${view === 'create' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            Create Investment
          </button>
        </div>
      </div>

      {view === 'list' && (
        <div>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : investments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No investments recorded yet
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {investments.map((investment) => (
                <div key={investment.id} className="border rounded-lg p-4 hover:shadow-lg transition">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg">{investment.title}</h3>
                    <span className="text-lg font-bold text-green-600">{investment.amount} BDT</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{investment.description}</p>
                  <div className="text-xs text-gray-500 space-y-1 mb-3">
                    <p>Purpose: {investment.purpose}</p>
                    <p>Date: {new Date(investment.date).toLocaleDateString()}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedInvestment(investment)
                        setShowEditModal(true)
                      }}
                      className="flex-1 bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(investment.id)}
                      className="flex-1 bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {view === 'create' && <CreateInvestmentForm showMessage={showMessage} onSuccess={() => setView('list')} />}
      
      {showEditModal && selectedInvestment && (
        <EditInvestmentModal
          investment={selectedInvestment}
          onClose={() => {
            setShowEditModal(false)
            setSelectedInvestment(null)
          }}
          onSuccess={() => {
            setShowEditModal(false)
            setSelectedInvestment(null)
            showMessage('success', 'Investment updated successfully')
            fetchInvestments()
          }}
        />
      )}
    </div>
  )
}

function CreateInvestmentForm({ showMessage, onSuccess }: any) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    purpose: ''
  })
  const [creating, setCreating] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true)
    try {
      const res = await fetch('/api/investments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount)
        })
      })
      const data = await res.json()
      if (res.ok) {
        showMessage('success', 'Investment created successfully')
        onSuccess()
      } else {
        showMessage('error', data.error || 'Failed to create investment')
      }
    } catch (error) {
      showMessage('error', 'Failed to create investment')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h3 className="text-xl font-bold mb-4">Create Investment</h3>
      <form onSubmit={handleSubmit} className="bg-gray-50 p-6 rounded-lg space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
          <input
            type="text"
            required
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
          <textarea
            required
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            rows={3}
            className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Amount (BDT) *</label>
          <input
            type="number"
            required
            min="0"
            step="0.01"
            value={formData.amount}
            onChange={(e) => setFormData({...formData, amount: e.target.value})}
            className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Date *</label>
          <input
            type="date"
            required
            value={formData.date}
            onChange={(e) => setFormData({...formData, date: e.target.value})}
            className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Purpose *</label>
          <input
            type="text"
            required
            value={formData.purpose}
            onChange={(e) => setFormData({...formData, purpose: e.target.value})}
            className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., Business expansion, Equipment purchase"
          />
        </div>

        <button
          type="submit"
          disabled={creating}
          className="w-full bg-blue-600 text-white px-4 py-3 rounded hover:bg-blue-700 disabled:bg-gray-400 font-medium"
        >
          {creating ? 'Creating...' : 'Create Investment'}
        </button>
      </form>
    </div>
  )
}

function EditInvestmentModal({ investment, onClose, onSuccess }: any) {
  const [formData, setFormData] = useState({
    title: investment.title,
    description: investment.description,
    amount: investment.amount,
    date: new Date(investment.date).toISOString().split('T')[0],
    purpose: investment.purpose
  })
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch(`/api/investments/${investment.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount.toString())
        })
      })
      if (res.ok) {
        onSuccess()
      }
    } catch (error) {
      alert('Failed to update investment')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
        <h3 className="text-xl font-bold mb-4">Edit Investment</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              required
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              rows={3}
              className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Amount (BDT)</label>
            <input
              type="number"
              required
              min="0"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({...formData, amount: parseFloat(e.target.value)})}
              className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
            <input
              type="date"
              required
              value={formData.date}
              onChange={(e) => setFormData({...formData, date: e.target.value})}
              className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Purpose</label>
            <input
              type="text"
              required
              value={formData.purpose}
              onChange={(e) => setFormData({...formData, purpose: e.target.value})}
              className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border rounded hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function AuditTab() {
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLogs()
  }, [])

  const fetchLogs = async () => {
    try {
      const res = await fetch('/api/audit-logs')
      const data = await res.json()
      setLogs(data.logs || [])
    } catch (error) {
      console.error('Failed to load audit logs')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Audit History</h2>
      
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      ) : logs.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No audit history yet
        </div>
      ) : (
        <div className="space-y-4">
          {logs.map((log) => (
            <div key={log.id} className="border rounded-lg p-4 hover:shadow-lg transition">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <span className={`px-2 py-1 text-xs rounded font-medium ${
                    log.action.includes('DELETE') ? 'bg-red-100 text-red-800' :
                    log.action.includes('CREATE') ? 'bg-green-100 text-green-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {log.action}
                  </span>
                  <p className="mt-2 text-sm font-medium text-gray-900">{log.summary}</p>
                </div>
                <span className="text-xs text-gray-500">
                  {new Date(log.createdAt).toLocaleString()}
                </span>
              </div>
              {log.metadata && (
                <div className="mt-2 text-xs text-gray-600 bg-gray-50 p-2 rounded">
                  <pre className="whitespace-pre-wrap">{JSON.stringify(log.metadata, null, 2)}</pre>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

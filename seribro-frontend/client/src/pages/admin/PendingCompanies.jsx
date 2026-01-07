import React, { useEffect, useState } from 'react';
import AdminAPI from '../../apis/adminApi';
import { Link } from 'react-router-dom';
import { Building2, CheckCircle, XCircle, AlertCircle, Loader } from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';

export default function PendingCompanies() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState('');

  const load = async () => {
    try {
      setLoading(true);
      const res = await AdminAPI.get('/companies/pending');
      setList(res.data.data || []);
    } catch (err) {
      toast.error(String(err?.response?.data?.message || 'Pending companies load nahi huye'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const approve = async (id) => {
    if (!window.confirm('Kya aap sure ho? Company approve karni hai?')) return;
    try {
      setActionId(id);
      await AdminAPI.post(`/company/${id}/approve`);
      toast.success('Company approved ✔️');
      await load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Approve fail ho gaya');
    } finally {
      setActionId('');
    }
  };

  const reject = async (id) => {
    const reason = window.prompt('Reject reason likho (required):');
    if (!reason) { alert('Reason required hai'); return; }
    try {
      setActionId(id);
      await AdminAPI.post(`/company/${id}/reject`, { reason });
      alert('Company rejected ❌');
      await load();
    } catch (err) {
      alert(err.response?.data?.message || 'Reject fail ho gaya');
    } finally {
      setActionId('');
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin">
            <div className="w-12 h-12 border-4 border-primary border-t-gold rounded-full"></div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6 pt-20">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-black text-amber-500 mb-2">
            Pending <span className="text-primary">Companies</span>
          </h1>
          <p className="text-gray-600">Review and approve company profile submissions</p>
        </div>

        {/* Stats Card */}
        <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-2xl p-6 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1">Pending for Review</p>
              <p className="text-3xl font-black text-green-600">{list.length}</p>
            </div>
            <Building2 className="text-green-300 opacity-50" size={48} />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-navy/5 to-primary/5 border-b border-gray-200">
                  <th className="px-6 py-4 text-left text-sm font-bold text-navy">Company Name</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-navy">Email</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-navy">Profile %</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-navy">Submitted</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-navy">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {list.length ? list.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50 transition-colors duration-200">
                    <td className="px-6 py-4 font-semibold text-navy">{c.name}</td>
                    <td className="px-6 py-4 text-gray-600">{c.email}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-full bg-gray-200 rounded-full h-2 max-w-xs">
                          <div
                            className="bg-gradient-to-r from-primary to-primary-dark h-2 rounded-full transition-all duration-300"
                            style={{ width: `${c.profileCompletion}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-bold text-navy">{c.profileCompletion}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {c.submittedAt ? new Date(c.submittedAt).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/admin/company/${c.id}`}
                          className="inline-flex items-center px-3 py-2 rounded-lg bg-blue-100 text-blue-600 text-sm font-semibold hover:bg-blue-200 transition-colors duration-200"
                        >
                          View
                        </Link>
                        <button
                          onClick={() => approve(c.id)}
                          disabled={actionId === c.id}
                          className="inline-flex items-center px-3 py-2 rounded-lg bg-green-100 text-green-600 text-sm font-semibold hover:bg-green-200 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed gap-1"
                        >
                          {actionId === c.id ? <Loader size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                          Approve
                        </button>
                        <button
                          onClick={() => reject(c.id)}
                          disabled={actionId === c.id}
                          className="inline-flex items-center px-3 py-2 rounded-lg bg-red-100 text-red-600 text-sm font-semibold hover:bg-red-200 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed gap-1"
                        >
                          {actionId === c.id ? <Loader size={16} className="animate-spin" /> : <XCircle size={16} />}
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center">
                      <AlertCircle className="mx-auto mb-2 text-gray-400 opacity-50" size={40} />
                      <p className="text-gray-500 font-medium">No pending companies for review</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

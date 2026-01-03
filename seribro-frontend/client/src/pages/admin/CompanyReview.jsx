import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminAPI from '../../apis/adminApi';
import { toast } from 'react-toastify';
import AdminLayout from '../../components/AdminLayout';
import { ArrowLeft, CheckCircle, XCircle, FileText, Building2, Globe, User, Mail, MapPin } from 'lucide-react';

export default function CompanyReview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const res = await AdminAPI.get(`/company/${id}`);
      setData(res.data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Details load nahi hue');
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [id]);

  const approve = async () => {
    if (!window.confirm('Kya aap sure ho? Company approve karni hai?')) return;
    try {
      setActionLoading(true);
      await AdminAPI.post(`/company/${id}/approve`);
      toast.success('Company approved ✔️');
      navigate('/admin/companies/pending');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Approve fail ho gaya');
    } finally { setActionLoading(false); }
  };

  const reject = async () => {
    const reason = window.prompt('Reject reason likho (required):');
    if (!reason) { toast.error('Reason required hai'); return; }
    try {
      setActionLoading(true);
      await AdminAPI.post(`/company/${id}/reject`, { reason });
      toast.success('Company rejected ❌');
      navigate('/admin/companies/pending');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reject fail ho gaya');
    } finally { setActionLoading(false); }
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

  if (!data) {
    return (
      <AdminLayout>
        <div className="p-8 bg-red-50 border border-red-200 rounded-2xl text-center">
          <p className="text-red-600 font-medium">Record nahi mila</p>
        </div>
      </AdminLayout>
    );
  }

  const docs = data?.documents || [];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-lg bg-white border border-gray-200 text-gray-600 hover:text-navy transition-colors"
            >
              <ArrowLeft size={24} />
            </button>
            <div>
              <h1 className="text-4xl font-black text-navy">Company Review</h1>
              <p className="text-gray-600 mt-1">Detailed company profile review and verification</p>
            </div>
          </div>
        </div>

        {/* Company Info Card */}
        <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-2xl p-8 border border-green-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-green-600 flex items-center justify-center text-white">
                <Building2 size={32} />
              </div>
              <div>
                <p className="text-gray-600 text-sm mb-1">Company Name</p>
                <p className="text-2xl font-bold text-navy">{data?.companyName || 'N/A'}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-blue-600 flex items-center justify-center text-white">
                <Mail size={32} />
              </div>
              <div>
                <p className="text-gray-600 text-sm mb-1">Email Address</p>
                <p className="text-lg font-bold text-navy">{data?.companyEmail || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Completion */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-navy">Profile Completion</h3>
            <span className="text-3xl font-black text-primary">{data?.profileCompletion || 0}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div
              className="bg-gradient-to-r from-primary to-primary-dark h-4 rounded-full transition-all duration-500"
              style={{ width: `${data?.profileCompletion || 0}%` }}
            ></div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Company Details */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <Building2 className="text-primary" size={24} />
              <h3 className="text-lg font-bold text-navy">Company Details</h3>
            </div>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-gray-500 mb-1">Industry Type</p>
                <p className="font-semibold text-navy">{data?.industryType || 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">Website</p>
                {data?.website ? (
                  <a href={data.website} target="_blank" rel="noopener noreferrer" className="font-semibold text-primary hover:underline flex items-center gap-2">
                    <Globe size={16} />
                    {data.website}
                  </a>
                ) : (
                  <p className="text-gray-400">Not provided</p>
                )}
              </div>
              <div>
                <p className="text-gray-500 mb-1">Employee Count</p>
                <p className="font-semibold text-navy">{data?.employeeCount || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <MapPin className="text-primary" size={24} />
              <h3 className="text-lg font-bold text-navy">Address</h3>
            </div>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-gray-500 mb-1">Street Address</p>
                <p className="font-semibold text-navy">{data?.address?.street || 'N/A'}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-gray-500 mb-1">City</p>
                  <p className="font-semibold text-navy">{data?.address?.city || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">State</p>
                  <p className="font-semibold text-navy">{data?.address?.state || 'N/A'}</p>
                </div>
              </div>
              <div>
                <p className="text-gray-500 mb-1">Pincode</p>
                <p className="font-semibold text-navy">{data?.address?.pincode || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Authorized Person */}
        {data?.authorizedPerson && (
          <div className="bg-white rounded-2xl p-6 border border-gray-200">
            <div className="flex items-center gap-3 mb-6">
              <User className="text-primary" size={24} />
              <h3 className="text-xl font-bold text-navy">Authorized Person</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-gray-500 text-sm mb-2">Full Name</p>
                <p className="font-semibold text-navy">{data.authorizedPerson.name || 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm mb-2">Designation</p>
                <p className="font-semibold text-navy">{data.authorizedPerson.designation || 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm mb-2">Contact</p>
                <p className="font-semibold text-navy">{data.authorizedPerson.phone || 'N/A'}</p>
              </div>
            </div>
          </div>
        )}

        {/* Documents */}
        {docs.length > 0 && (
          <div className="bg-white rounded-2xl p-6 border border-gray-200">
            <div className="flex items-center gap-3 mb-6">
              <FileText className="text-primary" size={24} />
              <h3 className="text-xl font-bold text-navy">Documents ({docs.length})</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {docs.map((doc) => (
                <div key={doc.publicId} className="p-4 bg-gray-50 rounded-xl border border-gray-200 hover:border-primary transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <p className="font-semibold text-navy">{doc.type}</p>
                  </div>
                  <a
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-colors"
                  >
                    <FileText size={16} />
                    View Document
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4 pt-4 sticky bottom-0 bg-white rounded-2xl p-6 border border-gray-200 shadow-lg">
          <button
            onClick={approve}
            disabled={actionLoading}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-green-500 to-green-600 text-white font-bold hover:shadow-lg hover:shadow-green-500/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
          >
            <CheckCircle size={20} />
            Approve Company
          </button>
          <button
            onClick={reject}
            disabled={actionLoading}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white font-bold hover:shadow-lg hover:shadow-red-500/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
          >
            <XCircle size={20} />
            Reject Company
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}

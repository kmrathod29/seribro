// src/components/admin/AdminProfilePreview.jsx
// Profile preview modal for admin to view full student/company details before approval - Phase 3
import React, { useState, useEffect } from 'react';
import { X, FileText, Download, Eye, AlertCircle, CheckCircle, Clock, Award, Building2, Mail, Phone, MapPin } from 'lucide-react';
import DocumentViewer from './DocumentViewer';

const AdminProfilePreview = ({
  isOpen,
  profileData,
  profileType, // 'student' or 'company'
  onClose,
}) => {
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [documentViewerOpen, setDocumentViewerOpen] = useState(false);

  if (!isOpen || !profileData) return null;

  const handleViewDocument = (doc) => {
    setSelectedDocument(doc);
    setDocumentViewerOpen(true);
  };

  const handleCloseViewer = () => {
    setDocumentViewerOpen(false);
    setTimeout(() => setSelectedDocument(null), 300);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Hinglish: Backdrop with blur */}
        <div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        ></div>

        {/* Modal Container */}
        <div className="relative z-10 bg-gradient-to-br from-navy via-navy-light to-navy-dark border-2 border-gold rounded-2xl w-11/12 max-w-4xl max-h-5/6 overflow-y-auto shadow-2xl">
          {/* Header */}
          <div className="sticky top-0 z-20 flex items-center justify-between p-6 border-b border-gold/30 bg-gradient-to-r from-navy to-navy-dark/80 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <FileText className="text-gold" size={24} />
              <div>
                <h2 className="text-white text-xl font-bold capitalize">
                  {profileType} Profile Preview
                </h2>
                <p className="text-gray-400 text-sm">Review before approval/rejection</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/40 text-red-400 transition-colors duration-300"
            >
              <X size={24} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {profileType === 'student' ? (
              <StudentProfilePreview
                data={profileData}
                onViewDocument={handleViewDocument}
              />
            ) : (
              <CompanyProfilePreview
                data={profileData}
                onViewDocument={handleViewDocument}
              />
            )}
          </div>
        </div>
      </div>

      {/* Document Viewer Modal */}
      <DocumentViewer
        isOpen={documentViewerOpen}
        documentUrl={selectedDocument?.url}
        documentName={selectedDocument?.name}
        onClose={handleCloseViewer}
      />
    </>
  );
};

/**
 * Hinglish: Student ke profile ka preview component
 */
const StudentProfilePreview = ({ data, onViewDocument }) => {
  const basicInfo = data?.basicInfo || {};
  const documents = data?.documents || {};
  const profileStats = data?.profileStats || {};
  const skills = data?.skills || {};
  const projects = data?.projects || [];

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { bg: 'bg-yellow-500/20', border: 'border-yellow-500', text: 'text-yellow-300', icon: Clock },
      approved: { bg: 'bg-green-500/20', border: 'border-green-500', text: 'text-green-300', icon: CheckCircle },
      rejected: { bg: 'bg-red-500/20', border: 'border-red-500', text: 'text-red-300', icon: AlertCircle },
      draft: { bg: 'bg-gray-500/20', border: 'border-gray-500', text: 'text-gray-300', icon: FileText },
    };
    const config = statusConfig[status] || statusConfig.draft;
    const Icon = config.icon;
    return (
      <div className={`flex items-center gap-2 px-3 py-1 rounded-full border ${config.bg} ${config.border} ${config.text}`}>
        <Icon size={16} />
        <span className="text-sm font-semibold capitalize">{status}</span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
        <h3 className="text-white text-lg font-bold mb-4 flex items-center gap-2">
          <Award className="text-gold" size={20} />
          Basic Information
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-gray-400 text-sm mb-1">Full Name</p>
            <p className="text-white font-semibold">{basicInfo?.fullName || 'N/A'}</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm mb-1">Email</p>
            <p className="text-white font-semibold flex items-center gap-2">
              <Mail size={16} className="text-gold" />
              {basicInfo?.email || 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-gray-400 text-sm mb-1">Phone</p>
            <p className="text-white font-semibold flex items-center gap-2">
              <Phone size={16} className="text-gold" />
              {basicInfo?.phone || 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-gray-400 text-sm mb-1">College</p>
            <p className="text-white font-semibold">{basicInfo?.collegeName || 'N/A'}</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm mb-1">Degree</p>
            <p className="text-white font-semibold">{basicInfo?.degree || 'N/A'}</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm mb-1">Branch</p>
            <p className="text-white font-semibold">{basicInfo?.branch || 'N/A'}</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm mb-1">Graduation Year</p>
            <p className="text-white font-semibold">{basicInfo?.graduationYear || 'N/A'}</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm mb-1">Location</p>
            <p className="text-white font-semibold flex items-center gap-2">
              <MapPin size={16} className="text-gold" />
              {basicInfo?.location || 'N/A'}
            </p>
          </div>
        </div>
      </div>

      {/* Profile Stats */}
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
        <h3 className="text-white text-lg font-bold mb-4">Profile Statistics</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-gold/20 border border-gold/30 rounded-lg p-4 text-center">
            <p className="text-gray-300 text-sm mb-2">Completion</p>
            <p className="text-2xl font-bold text-gold">{profileStats?.profileCompletion || 0}%</p>
          </div>
          <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4 text-center">
            <p className="text-gray-300 text-sm mb-2">Skills</p>
            <p className="text-2xl font-bold text-blue-300">
              {(skills?.technical?.length || 0) + (skills?.soft?.length || 0)}
            </p>
          </div>
          <div className="bg-purple-500/20 border border-purple-500/30 rounded-lg p-4 text-center">
            <p className="text-gray-300 text-sm mb-2">Projects</p>
            <p className="text-2xl font-bold text-purple-300">{projects?.length || 0}</p>
          </div>
        </div>
      </div>

      {/* Skills */}
      {(skills?.technical?.length > 0 || skills?.soft?.length > 0) && (
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
          <h3 className="text-white text-lg font-bold mb-4">Skills</h3>
          {skills?.technical?.length > 0 && (
            <div className="mb-4">
              <p className="text-gray-400 text-sm mb-2">Technical Skills</p>
              <div className="flex flex-wrap gap-2">
                {skills.technical.map((skill, idx) => (
                  <span key={idx} className="bg-gold/30 text-gold px-3 py-1 rounded-full text-sm font-semibold">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
          {skills?.soft?.length > 0 && (
            <div>
              <p className="text-gray-400 text-sm mb-2">Soft Skills</p>
              <div className="flex flex-wrap gap-2">
                {skills.soft.map((skill, idx) => (
                  <span key={idx} className="bg-blue-500/30 text-blue-300 px-3 py-1 rounded-full text-sm font-semibold">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Documents */}
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
        <h3 className="text-white text-lg font-bold mb-4 flex items-center gap-2">
          <FileText className="text-gold" size={20} />
          Documents
        </h3>
        <div className="space-y-3">
          {documents?.resume?.path && (
            <DocumentRow
              name="Resume"
              path={documents.resume.path}
              onView={() => onViewDocument({ name: 'Resume', url: documents.resume.path })}
            />
          )}
          {documents?.collegeId?.path && (
            <DocumentRow
              name="College ID"
              path={documents.collegeId.path}
              onView={() => onViewDocument({ name: 'College ID', url: documents.collegeId.path })}
            />
          )}
          {documents?.certificates?.length > 0 && documents.certificates.map((cert, idx) => (
            <DocumentRow
              key={idx}
              name={`Certificate ${idx + 1}`}
              path={cert.path}
              onView={() => onViewDocument({ name: `Certificate ${idx + 1}`, url: cert.path })}
            />
          ))}
          {!documents?.resume?.path && !documents?.collegeId?.path && documents?.certificates?.length === 0 && (
            <p className="text-gray-400 text-sm">No documents uploaded</p>
          )}
        </div>
      </div>

      {/* Projects */}
      {projects?.length > 0 && (
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
          <h3 className="text-white text-lg font-bold mb-4">Projects ({projects.length})</h3>
          <div className="space-y-4">
            {projects.map((project, idx) => (
              <div key={idx} className="border border-white/10 rounded-lg p-4 bg-white/5">
                <h4 className="text-white font-bold mb-2">{project?.title || 'Untitled'}</h4>
                <p className="text-gray-300 text-sm mb-3">{project?.description || 'No description'}</p>
                {project?.technologies?.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {project.technologies.map((tech, tidx) => (
                      <span key={tidx} className="bg-purple-500/30 text-purple-300 px-2 py-1 rounded text-xs">
                        {tech}
                      </span>
                    ))}
                  </div>
                )}
                {project?.link && (
                  <a href={project.link} target="_blank" rel="noopener noreferrer" className="text-gold hover:text-gold-dark text-sm font-semibold">
                    View Project →
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Hinglish: Company ke profile ka preview component
 */
const CompanyProfilePreview = ({ data, onViewDocument }) => {
  const documents = data?.documents || [];

  return (
    <div className="space-y-6">
      {/* Company Information */}
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
        <h3 className="text-white text-lg font-bold mb-4 flex items-center gap-2">
          <Building2 className="text-gold" size={20} />
          Company Information
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-gray-400 text-sm mb-1">Company Name</p>
            <p className="text-white font-semibold">{data?.companyName || 'N/A'}</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm mb-1">Email</p>
            <p className="text-white font-semibold flex items-center gap-2">
              <Mail size={16} className="text-gold" />
              {data?.companyEmail || 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-gray-400 text-sm mb-1">Industry Type</p>
            <p className="text-white font-semibold">{data?.industryType || 'N/A'}</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm mb-1">Company Size</p>
            <p className="text-white font-semibold">{data?.companySize || 'N/A'}</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm mb-1">Website</p>
            <p className="text-white font-semibold">
              {data?.website ? (
                <a href={data.website} target="_blank" rel="noopener noreferrer" className="text-gold hover:text-gold-dark">
                  {data.website}
                </a>
              ) : (
                'N/A'
              )}
            </p>
          </div>
          <div>
            <p className="text-gray-400 text-sm mb-1">GST Number</p>
            <p className="text-white font-semibold">{data?.gstNumber || 'N/A'}</p>
          </div>
        </div>
      </div>

      {/* Address */}
      {data?.address && (
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
          <h3 className="text-white text-lg font-bold mb-4 flex items-center gap-2">
            <MapPin className="text-gold" size={20} />
            Address
          </h3>
          <p className="text-gray-300">
            {data.address.street && `${data.address.street}, `}
            {data.address.city && `${data.address.city}, `}
            {data.address.state && `${data.address.state} `}
            {data.address.zipCode && `- ${data.address.zipCode}`}
          </p>
        </div>
      )}

      {/* Authorized Person */}
      {data?.authorizedPerson && (
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
          <h3 className="text-white text-lg font-bold mb-4">Authorized Person</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-400 text-sm mb-1">Name</p>
              <p className="text-white font-semibold">{data.authorizedPerson?.name || 'N/A'}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-1">Designation</p>
              <p className="text-white font-semibold">{data.authorizedPerson?.designation || 'N/A'}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-1">Email</p>
              <p className="text-white font-semibold">{data.authorizedPerson?.email || 'N/A'}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-1">Phone</p>
              <p className="text-white font-semibold">{data.authorizedPerson?.phone || 'N/A'}</p>
            </div>
          </div>
        </div>
      )}

      {/* Documents */}
      {documents?.length > 0 && (
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
          <h3 className="text-white text-lg font-bold mb-4 flex items-center gap-2">
            <FileText className="text-gold" size={20} />
            Documents
          </h3>
          <div className="space-y-3">
            {documents.map((doc, idx) => (
              <DocumentRow
                key={idx}
                name={doc?.fileName || `Document ${idx + 1}`}
                path={doc?.path}
                onView={() => onViewDocument({ name: doc?.fileName || `Document ${idx + 1}`, url: doc?.path })}
              />
            ))}
          </div>
        </div>
      )}

      {/* Profile Completion */}
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
        <h3 className="text-white text-lg font-bold mb-4">Profile Status</h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm mb-2">Completion Status</p>
            <p className="text-3xl font-bold text-gold">{data?.profileCompletionPercentage || 0}%</p>
          </div>
          <div className="w-1/2">
            <div className="w-full bg-white/10 rounded-full h-4 overflow-hidden border border-gold/30">
              <div
                className="h-full bg-gradient-to-r from-gold to-yellow-400 transition-all duration-1000"
                style={{ width: `${data?.profileCompletionPercentage || 0}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Hinglish: Document row component - display filename aur download button
 */
const DocumentRow = ({ name, path, onView }) => {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg border border-white/10 bg-white/5 hover:border-gold/50 transition-all duration-300">
      <div className="flex items-center gap-3">
        <FileText className="text-gold" size={18} />
        <span className="text-gray-300 font-semibold">{name}</span>
      </div>
      <button
        onClick={onView}
        className="p-2 rounded-lg bg-gold/20 hover:bg-gold/40 text-gold transition-colors duration-300"
        title="View document"
      >
        <Eye size={18} />
      </button>
    </div>
  );
};

export default AdminProfilePreview;

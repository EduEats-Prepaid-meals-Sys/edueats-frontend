import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiBookOpen, FiCompass, FiLifeBuoy } from 'react-icons/fi';
import Card from '../../../components/Card.jsx';

const getRoleMeta = (path) => {
  if (path.startsWith('/staff')) {
    return {
      roleLabel: 'Staff',
      homePath: '/staff/orders',
      profilePath: '/staff/profile',
      hasProfile: true,
    };
  }
  if (path.startsWith('/admin')) {
    return {
      roleLabel: 'Admin',
      homePath: '/admin/analytics',
      profilePath: null,
      hasProfile: false,
    };
  }
  return {
    roleLabel: 'Student',
    homePath: '/student/home',
    profilePath: '/student/profile',
    hasProfile: true,
  };
};

export default function HelpPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { roleLabel, homePath, profilePath, hasProfile } = getRoleMeta(location.pathname);
  let reportsGuidance = 'Looking for reports? Use the Analytics tab in the bottom menu.';
  if (roleLabel === 'Admin') {
    reportsGuidance = 'Looking for reports? Open the Reports and Analytics pages from the admin section.';
  } else if (roleLabel === 'Staff') {
    reportsGuidance = 'Looking for reports? Open Dashboard or Reports from the staff bottom menu.';
  }

  return (
    <div className="min-h-screen bg-edueats-bg pb-8">
      <header className="rounded-b-card bg-edueats-primary px-6 pt-10 pb-6">
        <button
          type="button"
          onClick={() => navigate(profilePath ?? homePath)}
          className="inline-flex items-center gap-1 rounded-full bg-white/70 px-3 py-1.5 text-sm text-edueats-text"
        >
          <FiArrowLeft className="text-sm" />
          Back
        </button>
        <h1 className="mt-3 text-3xl font-semibold text-edueats-text">Help Center</h1>
        <p className="mt-1 text-sm text-edueats-textMuted">
          Quick guidance for navigating the {roleLabel.toLowerCase()} app.
        </p>
      </header>

      <div className="space-y-4 px-4 py-5 sm:px-6">
        <Card className="space-y-3">
          <div className="flex items-center gap-2 text-edueats-accent">
            <FiCompass />
            <h2 className="text-base font-semibold text-edueats-text">Getting started</h2>
          </div>
          <ol className="list-decimal space-y-2 pl-5 text-sm text-edueats-text">
            <li>Use the bottom navigation bar to move between key screens.</li>
            <li>Open your profile to update preferences and account details.</li>
            <li>Start from Dashboard/Home to review your current activity first.</li>
          </ol>
        </Card>

        <Card className="space-y-3">
          <div className="flex items-center gap-2 text-edueats-accent">
            <FiBookOpen />
            <h2 className="text-base font-semibold text-edueats-text">Common tasks</h2>
          </div>
          <ul className="space-y-2 text-sm text-edueats-text">
            <li>Need to return quickly? Go to <Link to={homePath} className="font-semibold text-edueats-accent underline">Home</Link>.</li>
            {hasProfile ? (
              <li>Want to update your details? Visit <Link to={profilePath} className="font-semibold text-edueats-accent underline">Profile</Link>.</li>
            ) : (
              <li>Admin account details are managed by your system owner.</li>
            )}
            <li>{reportsGuidance}</li>
          </ul>
        </Card>

        <Card className="space-y-2">
          <div className="flex items-center gap-2 text-edueats-accent">
            <FiLifeBuoy />
            <h2 className="text-base font-semibold text-edueats-text">Need more support?</h2>
          </div>
          <p className="text-sm text-edueats-text">
            If you are still stuck, contact your school cafeteria support team for account-specific help.
          </p>
        </Card>
      </div>
    </div>
  );
}

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
    };
  }
  if (path.startsWith('/admin')) {
    return {
      roleLabel: 'Admin',
      homePath: '/admin/analytics',
      profilePath: '/admin/analytics',
    };
  }
  return {
    roleLabel: 'Student',
    homePath: '/student/home',
    profilePath: '/student/profile',
  };
};

export default function HelpPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { roleLabel, homePath, profilePath } = getRoleMeta(location.pathname);

  return (
    <div className="min-h-screen bg-edueats-bg pb-8">
      <header className="rounded-b-card bg-edueats-primary px-6 pt-10 pb-6">
        <button
          type="button"
          onClick={() => navigate(profilePath)}
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
            <li>Start from dashboard/home to review your current activity first.</li>
          </ol>
        </Card>

        <Card className="space-y-3">
          <div className="flex items-center gap-2 text-edueats-accent">
            <FiBookOpen />
            <h2 className="text-base font-semibold text-edueats-text">Common tasks</h2>
          </div>
          <ul className="space-y-2 text-sm text-edueats-text">
            <li>Need to return quickly? Go to <Link to={homePath} className="font-semibold text-edueats-accent underline">Home</Link>.</li>
            <li>Want to update your details? Visit <Link to={profilePath} className="font-semibold text-edueats-accent underline">Profile</Link>.</li>
            <li>Looking for reports? Use the Analytics/Reports tab in the bottom menu.</li>
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

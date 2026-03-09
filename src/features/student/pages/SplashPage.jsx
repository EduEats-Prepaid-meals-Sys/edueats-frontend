import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../../../components/Button.jsx';
import logo from '../../../assets/images/logo.svg';
import splashIllustration from '../../../assets/images/splash-illustration.svg';

export default function SplashPage() {
  return (
    <div className="relative min-h-screen bg-edueats-primary px-6 pt-12 pb-24">
      <div className="absolute inset-0 opacity-25">
        <img
          src={splashIllustration}
          alt=""
          className="h-full w-full object-cover"
        />
      </div>
      <div className="relative z-10 flex flex-col items-center text-center">
        <img src={logo} alt="EduEats" className="mt-16 h-16 w-auto" />
        <p className="mt-2 text-sm text-edueats-textMuted">
          Smart dining, happy learning
        </p>
        <div className="mt-12 w-full max-w-sm space-y-3">
          <Link to="/login" className="block">
            <Button variant="secondary" fullWidth>
              Login
            </Button>
          </Link>
          <Link to="/register" className="block">
            <Button fullWidth>Get Started</Button>
          </Link>
          <p className="pt-2 text-center text-sm text-edueats-textMuted">
            <Link to="/staff/login">Staff login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../../../components/Button.jsx';
import logo from '../../../assets/images/logo.svg';
import splashIllustration from '../../../assets/images/splash-illustration.svg';
import foodBg from '../../../assets/images/food-bg.jpg';
export default function SplashPage() {
  return (
    <div className="relative min-h-screen bg-edueats-primary px-6 pt-12 pb-24">
      <div className="absolute inset-0">
  <img
    src={foodBg}
    alt="Delicious food"
    className="h-full w-full object-cover"
  />
  <div className="absolute inset-0 bg-black opacity-40"></div>
</div>
      <div className="relative z-10 flex flex-col items-center text-center">
        <img src={logo} alt="EduEats" className="mt-16 h-16 w-auto" />
        <p className="mt-2 text-sm text-edueats-textMuted">
          Smart dining, happy learning
        </p>
        <div className="mt-12 w-full max-w-sm relative">
  {/* Gradient overlay */}
  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent rounded-xl pointer-events-none"></div>

  <div className="relative space-y-3">
    <Link to="/login" className="block">
      <Button variant="secondary" fullWidth>
        Login
      </Button>
    </Link>
    <Link to="/register" className="block">
      <Button fullWidth>Get Started</Button>
    </Link>
    <p className="pt-2 text-center text-sm text-white">
  <Link to="/staff/login" className="underline hover:text-yellow-400">
    Staff login
  </Link>
</p>
  </div>
</div>
      </div>
    </div>
  );
}

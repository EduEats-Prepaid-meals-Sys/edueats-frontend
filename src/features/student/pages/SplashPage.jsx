import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../../../components/Button.jsx';
import logo from '../../../assets/images/logo.svg';
import splashIllustration from '../../../assets/images/splash-illustration.svg';

export default function SplashPage() {
  return (
    <div className="relative min-h-screen bg-edueats-primary overflow-hidden flex flex-col items-center px-6 pt-12 pb-24">

      {/* Background decorative circles */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute w-80 h-80 -top-28 -right-28 rounded-full bg-white/[0.06]" />
        <div className="absolute w-52 h-52 bottom-10 -left-20 rounded-full bg-white/[0.06]" />
        <div className="absolute w-24 h-24 top-1/2 right-3 rounded-full bg-white/[0.04]" />
      </div>

      {/* Background illustration (kept from original) */}
      <div className="absolute inset-0 opacity-25">
        <img src={splashIllustration} alt="" className="h-full w-full object-cover" />
      </div>

      <div className="relative z-10 flex flex-col items-center w-full">

        {/* University context pills */}
        <div className="flex gap-2 flex-wrap justify-center mt-4">
          <span className="flex items-center gap-1.5 bg-white/15 border border-white/25 rounded-full px-3.5 py-1 text-xs text-white/90">
            <span className="w-1.5 h-1.5 rounded-full bg-white flex-shrink-0" />
            Egerton University
          </span>
          <span className="bg-white/15 border border-white/25 rounded-full px-3.5 py-1 text-xs text-white/90">
            Mess Wallet System
          </span>
        </div>

        {/* Logo */}
        <div className="mt-10 flex flex-col items-center text-center">
          <div className="w-18 h-18 bg-white rounded-2xl flex items-center justify-center mb-4 p-3">
            <img src={logo} alt="EduEats" className="h-full w-auto" />
          </div>
          <h1 className="text-4xl font-semibold text-white tracking-tight leading-none">EduEats</h1>
          <p className="mt-2 text-sm text-edueats-textMuted">Smart dining, happy learning</p>
        </div>

        {/* Divider */}
        <div className="w-9 h-0.5 bg-white/20 rounded-full my-8" />

        {/* Stats */}
        <div className="flex gap-8 justify-center">
          {[['2k+', 'Students'], ['3', 'Meals/day'], ['99%', 'Uptime']].map(([num, label]) => (
            <div key={label} className="text-center">
              <p className="text-2xl font-semibold text-white">{num}</p>
              <p className="text-[11px] text-white/50 uppercase tracking-wide mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Feature cards */}
        <div className="flex flex-col gap-2.5 mt-8 w-full max-w-sm">
          {[
            { label: 'Digital mess wallet', sub: 'Top up via M-Pesa, spend with a tap' },
            { label: 'Live daily menu', sub: "See today's meals & availability" },
            { label: 'Spending limits & reports', sub: 'Stay on budget, weekly tracking' },
          ].map(({ label, sub }) => (
            <div key={label} className="bg-white/10 border border-white/[0.18] rounded-2xl px-4 py-3 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/15 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-white">{label}</p>
                <p className="text-xs text-white/50 mt-0.5">{sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA buttons — centred, original colors preserved */}
        <div className="mt-9 w-full max-w-sm space-y-2.5">
          <Link to="/login" className="block">
            <Button variant="secondary" fullWidth>Login</Button>
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

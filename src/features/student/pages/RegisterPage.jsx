import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../../../components/Button.jsx';
import Input from '../../../components/Input.jsx';
import Card from '../../../components/Card.jsx';
import ErrorBanner from '../../../components/ErrorBanner.jsx';
import { mapApiError, mapFieldErrors } from '../../../utils/errorMessages.js';
import { getEmailQueueMeta, register } from '../../../api/modules/authApi.js';
import { useToast } from '../../../App.jsx';
import {
  isStrongPassword,
  isValidEmail,
  isValidFullName,
  isValidPhoneNumber,
  normalizePhoneInput,
} from '../../../utils/validators.js';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { setToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    email: '',
    password: '',
    name: '',
    contact: '',
  });
  const [errors, setErrors] = useState({});
  const [bannerError, setBannerError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name]) setErrors((e) => ({ ...e, [name]: '' }));
    setBannerError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const normalizedName = form.name.trim();
    const normalizedEmail = form.email.trim().toLowerCase();
    const normalizedContact = normalizePhoneInput(form.contact);

    const nextErrors = {};
    if (!isValidFullName(normalizedName)) {
      nextErrors.name = 'Enter a valid name (letters, spaces, apostrophe, hyphen).';
    }
    if (!isValidPhoneNumber(normalizedContact)) {
      nextErrors.contact = 'Enter a valid phone number (10 digits).';
    }
    if (!isValidEmail(normalizedEmail)) {
      nextErrors.email = 'Enter a valid email address.';
    }
    if (!isStrongPassword(form.password)) {
      nextErrors.password = 'Password must be 8+ chars with upper, lower and number.';
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setLoading(true);
    setErrors({});
    try {
      const response = await register({
        ...form,
        name: normalizedName,
        email: normalizedEmail,
        contact: normalizedContact,
      });

      const { emailQueued } = getEmailQueueMeta(response);
      setToast(
        emailQueued
          ? 'Registration successful. Verification email queued. Check your inbox for the code.'
          : 'Registration successful. Please verify your email to continue.',
        'success'
      );
      navigate('/verify-email', { state: { email: normalizedEmail } });
    } catch (err) {
      const fieldErrors = mapFieldErrors(err);
      const { _general, ...inlineErrors } = fieldErrors;
      if (Object.keys(inlineErrors).length > 0) {
        setErrors(inlineErrors);
      }
      setBannerError(mapApiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-edueats-bg">
      <header className="bg-edueats-primary px-6 py-6">
        <button
          type="button"
          onClick={() => {
            if (window.history.length > 2) {
              navigate(-1);
            } else {
              navigate('/', { replace: true });
            }
          }}
          className="text-edueats-text"
        >
          Back
        </button>
        <h1 className="mt-2 text-xl font-semibold text-edueats-text">New Account</h1>
      </header>
      <div className="px-6 py-6">
        <Card className="max-w-md">
          {bannerError && !Object.values(errors).some(Boolean) && (
            <ErrorBanner error={bannerError} className="mb-4" />
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Name"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Full name"
              autoComplete="name"
              error={errors.name}
            />
            <Input
              label="Contact"
              name="contact"
              type="tel"
              value={form.contact}
              onChange={handleChange}
              inputMode="tel"
              autoComplete="tel"
              maxLength={13}
              placeholder="e.g. 0712345678"
              hint="10 digits required."
              error={errors.contact}
            />
            <Input
              label="Email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
              placeholder="Email"
              error={errors.email}
            />
            <Input
              label="Password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={form.password}
              onChange={handleChange}
              autoComplete="new-password"
              placeholder="Password"
              hint="Minimum 8 characters, include uppercase, lowercase and a number."
              error={errors.password}
            />
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="text-xs text-edueats-textMuted"
              >
                {showPassword ? 'Hide password' : 'Show password'}
              </button>
            </div>
            <Button type="submit" fullWidth disabled={loading}>
              {loading ? 'Signing up...' : 'Sign Up'}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-edueats-textMuted">
            Already have an account? <Link to="/login" className="text-edueats-accent">Log In</Link>
          </p>
        </Card>
      </div>
    </div>
  );
}

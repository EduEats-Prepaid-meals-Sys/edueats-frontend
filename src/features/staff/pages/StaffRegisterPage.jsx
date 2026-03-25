import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../../../components/Button.jsx';
import Input from '../../../components/Input.jsx';
import Card from '../../../components/Card.jsx';
import ErrorBanner from '../../../components/ErrorBanner.jsx';
import { mapApiError, mapFieldErrors } from '../../../utils/errorMessages.js';
import { registerStaff } from '../../../api/modules/authApi.js';
import { useToast } from '../../../App.jsx';
import {
  isStrongPassword,
  isValidEmail,
  isValidFullName,
  isValidPhoneNumber,
  isValidStaffId,
  normalizePhoneInput,
} from '../../../utils/validators.js';

const ROLE_OPTIONS = [
  { value: '', label: 'Select role...' },
  { value: 'waitress', label: 'Waitress' },
  { value: 'caterer', label: 'Mess Admin (Caterer)' },
];

export default function StaffRegisterPage() {
  const navigate = useNavigate();
  const { setToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    password: '',
    mobile_number: '',
    role: '',
    staff_id: '',
  });
  const [errors, setErrors] = useState({});
  const [bannerError, setBannerError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: undefined }));
    setBannerError(null);
  };

  const validate = () => {
    const errs = {};
    if (!isValidFullName(form.full_name)) {
      errs.full_name = 'Enter a valid full name (letters, spaces, apostrophe, hyphen).';
    }
    if (!isValidEmail(form.email)) {
      errs.email = 'Enter a valid email address.';
    }
    if (!isStrongPassword(form.password)) {
      errs.password = 'Password must be 8+ chars with upper, lower and number.';
    }
    if (!isValidPhoneNumber(form.mobile_number)) {
      errs.mobile_number = 'Enter a valid phone number (10 digits).';
    }
    if (!form.role) errs.role = 'Please select a role';
    if (!isValidStaffId(form.staff_id)) {
      errs.staff_id = 'Staff ID should be 3-30 chars (letters, numbers, _ or -).';
    }
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setLoading(true);
    try {
      await registerStaff({
        ...form,
        full_name: form.full_name.trim(),
        email: form.email.trim().toLowerCase(),
        mobile_number: normalizePhoneInput(form.mobile_number),
        staff_id: form.staff_id.trim(),
      });
      setToast('Account created! You can now log in.', 'success');
      navigate('/staff/login', { replace: true });
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
        <Link to="/staff/login" className="text-edueats-text">Back</Link>
        <h1 className="mt-2 text-xl font-semibold text-edueats-text">Staff Sign Up</h1>
      </header>
      <div className="px-6 py-6">
        <Card className="max-w-md">
          <p className="mb-4 text-lg font-medium text-edueats-text">Create Staff Account</p>
          {bannerError && <ErrorBanner error={bannerError} className="mb-4" />}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full Name"
              name="full_name"
              value={form.full_name}
              onChange={handleChange}
              autoComplete="name"
              placeholder="Enter your full name"
              error={errors.full_name}
            />
            <Input
              label="Email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
              placeholder="Enter email address"
              error={errors.email}
            />
            <Input
              label="Password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={form.password}
              onChange={handleChange}
              autoComplete="new-password"
              placeholder="Create a password"
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
            <Input
              label="Phone Number"
              name="mobile_number"
              type="tel"
              value={form.mobile_number}
              onChange={handleChange}
              inputMode="tel"
              autoComplete="tel"
              maxLength={10}
              placeholder="e.g. 0712345678"
              hint="10 digits required."
              error={errors.mobile_number}
            />
            <div>
              <label className="mb-1 block text-sm font-medium text-edueats-text">Role</label>
              <select
                name="role"
                value={form.role}
                onChange={handleChange}
                className="w-full rounded-lg border border-edueats-border bg-edueats-card px-3 py-2 text-sm text-edueats-text focus:outline-none focus:ring-2 focus:ring-edueats-accent"
              >
                {ROLE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value} disabled={opt.value === ''}>
                    {opt.label}
                  </option>
                ))}
              </select>
              {errors.role && <p className="mt-1 text-xs text-red-500">{errors.role}</p>}
            </div>
            <Input
              label="Staff ID"
              name="staff_id"
              value={form.staff_id}
              onChange={handleChange}
              placeholder="e.g. STF001"
              autoCapitalize="characters"
              maxLength={30}
              error={errors.staff_id}
            />
            <Button type="submit" fullWidth disabled={loading}>
              {loading ? 'Creating account...' : 'Sign Up'}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-edueats-textMuted">
            Already have an account?{' '}
            <Link to="/staff/login" className="text-edueats-accent">Log In</Link>
          </p>
        </Card>
      </div>
    </div>
  );
}

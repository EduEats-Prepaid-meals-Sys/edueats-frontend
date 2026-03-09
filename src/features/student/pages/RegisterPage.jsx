import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../../../components/Button.jsx';
import Input from '../../../components/Input.jsx';
import Card from '../../../components/Card.jsx';
import { register } from '../../../api/modules/authApi.js';
import { useToast } from '../../../App.jsx';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { setToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    email: '',
    password: '',
    name: '',
    reg_number: '',
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name]) setErrors((e) => ({ ...e, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    try {
      await register(form);
      setToast('Registration successful. Please log in.', 'success');
      navigate('/login');
    } catch (err) {
      const msg = err?.message || 'Registration failed';
      setToast(msg, 'error');
      if (err?.details) setErrors(err.details);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-edueats-bg">
      <header className="bg-edueats-primary px-6 py-6">
        <Link to="/" className="text-edueats-text">Back</Link>
        <h1 className="mt-2 text-xl font-semibold text-edueats-text">New Account</h1>
      </header>
      <div className="px-6 py-6">
        <Card className="max-w-md">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Name"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Full name"
              error={errors.name}
            />
            <Input
              label="Registration number"
              name="reg_number"
              value={form.reg_number}
              onChange={handleChange}
              placeholder="Reg number"
              error={errors.reg_number}
            />
            <Input
              label="Email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Email"
              error={errors.email}
            />
            <Input
              label="Password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Password"
              error={errors.password}
            />
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

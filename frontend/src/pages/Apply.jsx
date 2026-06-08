import { useState } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const LANGUAGES = ['Hindi', 'Tamil', 'Telugu', 'Marathi', 'English'];

const initialForm = {
  name: '',
  mobile: '',
  amount: '',
  purpose: '',
  language: '',
};

function validate(fields) {
  const errors = {};
  if (!fields.name.trim()) errors.name = 'Applicant name is required.';
  if (!/^\d{10}$/.test(fields.mobile)) errors.mobile = 'Mobile must be exactly 10 digits.';
  if (!fields.amount || parseFloat(fields.amount) <= 0)
    errors.amount = 'Loan amount must be a positive number.';
  if (!fields.purpose.trim()) errors.purpose = 'Loan purpose is required.';
  if (!fields.language) errors.language = 'Please select a preferred language.';
  return errors;
}

function SuccessCard({ refNumber, onReset }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center animate-fade-in">
      <div className="w-20 h-20 rounded-full bg-emerald-500/15 ring-2 ring-emerald-500/40 flex items-center justify-center mb-6">
        <svg className="w-10 h-10 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h2 className="text-2xl font-extrabold text-white mb-2">Application Submitted!</h2>
      <p className="text-slate-400 mb-6 max-w-sm">
        Your loan application has been received and is under review.
      </p>
      <div className="card px-6 py-4 mb-8 text-center">
        <p className="text-xs text-slate-500 uppercase tracking-widest mb-1">Reference Number</p>
        <p className="text-amber-400 font-mono font-bold text-lg tracking-widest">
          #{refNumber.slice(0, 8).toUpperCase()}
        </p>
      </div>
      <button id="btn-submit-another" onClick={onReset} className="btn-primary">
        Submit Another Application
      </button>
    </div>
  );
}

function FormField({ id, label, error, children }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-semibold text-slate-300 mb-1.5">
        {label}
      </label>
      {children}
      {error && (
        <p className="error-text">
          <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}

export default function Apply() {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');
  const [submitted, setSubmitted] = useState(null);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setServerError('');
    const validationErrors = validate(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/api/applications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, amount: parseFloat(form.amount) }),
      });
      const data = await res.json();
      if (!res.ok) {
        setServerError(data.error || 'Something went wrong. Please try again.');
        return;
      }
      setSubmitted(data.id);
    } catch {
      setServerError('Unable to connect to the server. Please try again later.');
    } finally {
      setSubmitting(false);
    }
  }

  function handleReset() {
    setForm(initialForm);
    setErrors({});
    setServerError('');
    setSubmitted(null);
  }

  if (submitted) {
    return (
      <main className="max-w-lg mx-auto px-4 py-12">
        <div className="card">
          <SuccessCard refNumber={submitted} onReset={handleReset} />
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-lg mx-auto px-4 py-12">
      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-full px-3 py-1 mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
          <span className="text-amber-400 text-xs font-semibold uppercase tracking-wider">Instant Approval</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white leading-tight">
          Apply for a <span className="text-amber-400">Loan</span>
        </h1>
        <p className="text-slate-400 mt-2">
          Fill in the details below and get a decision within 24 hours.
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div className="card p-6 sm:p-8 space-y-5">
          {serverError && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm">
              {serverError}
            </div>
          )}

          <FormField id="name" label="Applicant Name" error={errors.name}>
            <input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              placeholder="e.g. Rahul Sharma"
              value={form.name}
              onChange={handleChange}
              className={`input-field ${errors.name ? 'border-red-500/70 focus:ring-red-500' : ''}`}
            />
          </FormField>

          <FormField id="mobile" label="Mobile Number" error={errors.mobile}>
            <input
              id="mobile"
              name="mobile"
              type="tel"
              inputMode="numeric"
              maxLength={10}
              placeholder="10-digit mobile number"
              value={form.mobile}
              onChange={handleChange}
              className={`input-field ${errors.mobile ? 'border-red-500/70 focus:ring-red-500' : ''}`}
            />
          </FormField>

          <FormField id="amount" label="Loan Amount (₹)" error={errors.amount}>
            <input
              id="amount"
              name="amount"
              type="number"
              inputMode="numeric"
              min="1"
              placeholder="e.g. 50000"
              value={form.amount}
              onChange={handleChange}
              className={`input-field ${errors.amount ? 'border-red-500/70 focus:ring-red-500' : ''}`}
            />
          </FormField>

          <FormField id="purpose" label="Loan Purpose" error={errors.purpose}>
            <input
              id="purpose"
              name="purpose"
              type="text"
              placeholder="e.g. Home renovation, Business expansion"
              value={form.purpose}
              onChange={handleChange}
              className={`input-field ${errors.purpose ? 'border-red-500/70 focus:ring-red-500' : ''}`}
            />
          </FormField>

          <FormField id="language" label="Preferred Language" error={errors.language}>
            <select
              id="language"
              name="language"
              value={form.language}
              onChange={handleChange}
              className={`input-field ${errors.language ? 'border-red-500/70 focus:ring-red-500' : ''}`}
            >
              <option value="" disabled>Select a language</option>
              {LANGUAGES.map((lang) => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>
          </FormField>

          <button
            id="btn-submit-application"
            type="submit"
            disabled={submitting}
            className="btn-primary w-full mt-2 flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Submitting…
              </>
            ) : (
              'Submit Application →'
            )}
          </button>
        </div>
      </form>
    </main>
  );
}

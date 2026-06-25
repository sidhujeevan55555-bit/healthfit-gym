import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, HelpCircle, CheckCircle2 } from 'lucide-react';

export default function ContactView() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      setSubmitStatus('error');
      return;
    }

    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitStatus('success');
      setFormData({ name: '', email: '', phone: '', message: '' });
    }, 1200);
  };

  return (
    <div className="space-y-16 pb-16">
      {/* Intro section */}
      <div className="text-center space-y-3 max-w-xl mx-auto">
        <h1 className="text-3xl md:text-5xl font-bold font-display text-white tracking-tight">Need Some Help?</h1>
        <p className="text-xs md:text-sm text-slate-400">
          Have queries about membership timings, personal trainer availability, or corporate fitness slots? Send us a message and our team will get back to you within 2 hours.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Contact info details column */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass border-white/10 p-6 rounded-2xl space-y-6">
            <h3 className="text-lg font-bold font-display text-white border-b border-white/10 pb-3">HealthFit Headquarters</h3>

            <div className="flex gap-4 items-start">
              <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                <MapPin size={20} />
              </div>
              <div className="space-y-1 text-xs">
                <p className="font-bold text-white font-display">Branch Office Haryana</p>
                <p className="text-slate-400 leading-relaxed">
                  HealthFit Gym, Sector 12, Sirsa, Haryana 125001, India
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                <Phone size={20} />
              </div>
              <div className="space-y-1 text-xs">
                <p className="font-bold text-white font-display">Give Us A Ring</p>
                <p className="text-slate-400">+91 98765-43210 / +91 1662-243555</p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                <Mail size={20} />
              </div>
              <div className="space-y-1 text-xs">
                <p className="font-bold text-white font-display">Inbound Emails</p>
                <p className="text-slate-400">support@healthfit.in / sales@healthfit.in</p>
              </div>
            </div>
          </div>

          {/* Operational timing box */}
          <div className="glass border-white/15 p-6 rounded-2xl space-y-4">
            <h4 className="text-sm font-bold font-display text-white flex items-center gap-2">
              <HelpCircle size={16} className="text-indigo-400" /> Operational Hours
            </h4>
            <div className="text-xs space-y-2 text-slate-400">
              <div className="flex justify-between border-b border-white/10 pb-1">
                <span>Monday - Saturday:</span>
                <span className="text-white font-medium">5:00 AM - 10:00 PM</span>
              </div>
              <div className="flex justify-between pt-1">
                <span>Sunday (Weekly Rest):</span>
                <span className="text-white font-medium">6:00 AM - 12:00 PM</span>
              </div>
            </div>
          </div>
        </div>

        {/* Form container column */}
        <div className="lg:col-span-7 glass border-white/10 p-8 rounded-3xl space-y-6">
          <h3 className="text-lg font-bold font-display text-white">Send Online Enquiry</h3>

          {submitStatus === 'success' && (
            <div className="bg-green-500/10 border border-green-500/30 p-4 rounded-xl text-xs text-green-400 flex gap-3 items-center">
              <CheckCircle2 className="shrink-0 text-green-500" size={18} />
              <div>
                <span className="font-bold">Thank you! Your message was submitted.</span> Our Sirsa team will connect with you via SMS/Email shortly.
              </div>
            </div>
          )}

          {submitStatus === 'error' && (
            <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-xl text-xs text-red-400">
              Please fill out all mandatory fields (Name, Email, and Message).
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Your Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Priya Sharma"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Your Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. priya@gmail.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Your Phone Number (Optional)</label>
              <input
                type="tel"
                placeholder="e.g. 9876543210"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Your Note / Question *</label>
              <textarea
                required
                rows={5}
                placeholder="Ask us anything..."
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full bg-black/30 border border-white/10 rounded-xl p-4 text-xs text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold font-display text-xs p-3.5 rounded-xl transition cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 active:scale-95"
            >
              {isSubmitting ? 'Sending Request...' : 'Submit Message'} <Send size={14} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

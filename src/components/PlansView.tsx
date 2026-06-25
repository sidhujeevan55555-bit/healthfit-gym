import React, { useState } from 'react';
import { Check, Star, Shield, Flame, Dumbbell } from 'lucide-react';

export interface MembershipPlan {
  id: string;
  name: string;
  price: number;
  duration: string;
  durationMonths: number;
  badge?: string;
  description: string;
  features: string[];
  popular?: boolean;
}

const indianPlans: MembershipPlan[] = [
  {
    id: "basic",
    name: "Basic Monthly",
    price: 499,
    duration: "month",
    durationMonths: 1,
    description: "Perfect for beginners who want standard gym access to start their strength journey.",
    features: [
      "Access to Gym Strength Cardio sections",
      "Standard Locker Room Facilities",
      "General Coach Orientation Checklist",
      "Digital Workout Tracking Logs tool",
      "Standard Indian timing access"
    ]
  },
  {
    id: "pro",
    name: "Pro Monthly",
    price: 799,
    duration: "month",
    durationMonths: 1,
    badge: "Most Premium",
    description: "Fully loaded access to custom diet templates and certified support slots.",
    features: [
      "All Strength, Cardio Heavy sections",
      "Custom Diet consults (Indian Diet optimization)",
      "2 personal coaching slots per month",
      "Unlimited Digital Workouts Calories log tracker",
      "Access to premium member lockers & showers"
    ]
  },
  {
    id: "quarterly",
    name: "Quarterly Pack",
    price: 1499,
    duration: "3 months",
    durationMonths: 3,
    badge: "Best Value",
    popular: true,
    description: "A stable committed fitness path. Highly economical for serious fit enthusiasts.",
    features: [
      "Total saving of over ₹300 compared to monthly",
      "Unlimited access to group cardio & yoga camps",
      "Complete custom Indian Macro distribution sheets",
      "4 personal checkin slots with Master Trainers",
      "Access to premium logs history reports"
    ]
  },
  {
    id: "annual",
    name: "Annual Pass",
    price: 4999,
    duration: "year",
    durationMonths: 12,
    badge: "Super Saver",
    description: "Ultimate commitment. Our elite plan offering absolute complete benefits.",
    features: [
      "Average cost drops to below ₹417 a month!",
      "Full premium club privilege for 365 days",
      "12 customized personal body composition analysis logs",
      "Access to all group classes and special workshops",
      "Personal dedicated double-safe VIP locker box"
    ]
  }
];

interface PlansViewProps {
  onSelectPlan: (plan: MembershipPlan) => void;
  isLoggedIn: boolean;
  currentMembership: string;
  onOpenAuth: (mode: 'login' | 'register' | 'admin') => void;
}

export default function PlansView({ onSelectPlan, isLoggedIn, currentMembership, onOpenAuth }: PlansViewProps) {
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubscribe = (plan: MembershipPlan) => {
    if (!isLoggedIn) {
      onOpenAuth('register');
      return;
    }
    onSelectPlan(plan);
  };

  return (
    <div className="space-y-12 pb-16">
      {/* Header section */}
      <div className="text-center space-y-3 max-w-xl mx-auto">
        <div className="inline-flex items-center gap-1.5 text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full text-xs font-semibold uppercase font-display tracking-wider">
          <Dumbbell size={13} /> Membership Packages
        </div>
        <h1 className="text-3xl md:text-5xl font-bold font-display text-white tracking-tight">Flexible, Transparent Pricing</h1>
        <p className="text-xs md:text-sm text-slate-400">
          Transform your health with Indian-priced plans structured around your routine. No hidden administrative fees. Save more with our multi-month bundles.
        </p>
      </div>

      {/* Grid wrapper */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
        {indianPlans.map((plan) => {
          const isActive = currentMembership === plan.name;
          return (
            <div
              key={plan.id}
              className={`relative glass border-white/10 rounded-3xl p-6 transition duration-300 flex flex-col justify-between h-full group ${
                isActive
                  ? 'border-green-500/80 bg-green-500/5 ring-1 ring-green-500/40 shadow-green-500/10'
                  : plan.popular
                  ? 'border-indigo-400 shadow-xl shadow-indigo-600/5 hover:border-indigo-300'
                  : 'hover:border-white/20'
              }`}
            >
              {/* Optional badges */}
              {isActive && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-green-500 text-slate-950 font-bold font-display text-[10px] tracking-wider px-3 py-1 rounded-full uppercase shadow">
                  Active Subscription
                </div>
              )}
              {plan.badge && !isActive && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-indigo-600 text-white font-bold font-display text-[10px] tracking-wider px-3 py-1 rounded-full uppercase shadow shadow-indigo-600/30">
                  {plan.badge}
                </div>
              )}

              <div className="space-y-6">
                <div className="space-y-2">
                  <h3 className="text-md font-bold font-display text-white flex items-center justify-between">
                    {plan.name}
                    {plan.popular && <Star size={16} className="text-indigo-400 shrink-0 fill-indigo-400" />}
                  </h3>
                  <div className="flex items-baseline gap-1 pt-2">
                    <span className="text-3xl font-extrabold text-white font-display">₹{plan.price}</span>
                    <span className="text-xs text-slate-400">/ {plan.duration}</span>
                  </div>
                  <p className="text-xs text-slate-400 font-light leading-relaxed pt-1">
                    {plan.description}
                  </p>
                </div>

                <ul className="text-xs space-y-2 text-slate-300 border-t border-white/10 pt-4">
                  {plan.features.map((feat, fIdx) => (
                    <li key={fIdx} className="flex gap-2 items-start text-slate-300">
                      <Check size={14} className="text-indigo-400 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Purchase button */}
              <div className="pt-8 mt-auto">
                {isActive ? (
                  <button
                    disabled
                    className="w-full bg-white/5 text-slate-500 font-semibold font-display text-xs px-4 py-2.5 rounded-xl cursor-not-allowed border border-white/5 flex items-center justify-center gap-1.5"
                  >
                    Current Plan
                  </button>
                ) : (
                  <button
                    onClick={() => handleSubscribe(plan)}
                    className={`w-full font-semibold font-display text-xs px-4 py-2.5 rounded-xl transition duration-150 active:scale-[0.98] cursor-pointer ${
                      plan.popular
                        ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20'
                        : 'bg-white/5 hover:bg-white/10 text-white border border-white/10'
                    }`}
                  >
                    {isLoggedIn ? `Subscribe For ₹${plan.price}` : "Register & Subscribe"}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Safety Notice Card */}
      <div className="glass border-white/10 p-6 rounded-2xl flex items-center gap-4">
        <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
          <Shield size={20} />
        </div>
        <div className="text-xs space-y-1">
          <p className="font-bold text-white font-display">Safe Payments SSL</p>
          <p className="text-slate-400">
            All plans are processed through local Indian UPI, Netbanking, or credit cards securely in Indian Rupees (₹). Cancel anytime with no setup costs.
          </p>
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import { ShieldCheck, Dumbbell, Award, Landmark } from 'lucide-react';
import priyaSharmaImage from '../assets/images/indian_trainer_priya_1781722871875.jpg';

const trainers = [
  {
    name: "Priya Sharma",
    role: "Senior Coach & Pilates Lead",
    specialty: "High-Intensity Interval Training (HIIT), Core Sculpting",
    experience: "7+ Years",
    bio: "Priya has coached over 500+ professionals to lean transformations. She holds multiple gold standard certifications in pre/postnatal conditioning and Pilates.",
    image: priyaSharmaImage
  },
  {
    name: "Rajesh Kumar",
    role: "Head Athletic Strength Trainer",
    specialty: "Powerlifting, Muscle Hypertrophy, Rehab Coaching",
    experience: "10+ Years",
    bio: "Former regional strength winner in Chandigarh, Rajesh specializes in structural weight-lifting techniques, custom power templates, and athletic performance.",
    image: "https://picsum.photos/seed/trainer_rajesh/400/400"
  },
  {
    name: "Amit Singh",
    role: "Nutrition Specialist & Kickboxing Elite",
    specialty: "Weight Loss Management, MMA Conditioning, Custom Diet Plans",
    experience: "6+ Years",
    bio: "Amit mixes cardio-kickboxing with customized macronutrient distribution frameworks. He designs diet templates optimized for traditional Indian meals.",
    image: "https://picsum.photos/seed/trainer_amit/400/400"
  }
];

export default function AboutView() {
  return (
    <div className="space-y-16 pb-16">
      {/* Upper Brand Section */}
      <div className="glass border-white/10 p-8 md:p-12 rounded-3xl space-y-6">
        <div className="inline-flex items-center gap-2 text-indigo-400 font-semibold text-xs tracking-wider uppercase font-display bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
          <Landmark size={14} /> Our Humble Legacy
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <h1 className="text-3xl md:text-5xl font-bold font-display text-white tracking-tight">
              Empowering Health in India Since <span className="text-indigo-400">2018</span>
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Founded in Sirsa, Haryana, HealthFit Gym was born out of a desire to create a world-class fitness club accessible to everyone in India. We wanted to eliminate the divide between expensive global gym franchises and local athletic hubs. 
            </p>
            <p className="text-sm text-slate-300 leading-relaxed">
              Our vision is to provide state-of-the-art equipment, clean and hygienic shower rooms, certified training advice, and real weight-loss analytics under one single membership roof. 
            </p>
          </div>
          <div className="bg-black/20 p-6 rounded-2xl border border-white/5 space-y-6">
            <h3 className="text-lg font-bold font-display text-white">Our 3 Core Golden Rules</h3>
            
            <div className="flex gap-4">
              <div className="text-indigo-400 pt-1 shrink-0"><ShieldCheck size={20} /></div>
              <div>
                <h4 className="text-xs font-semibold text-white uppercase tracking-wider font-display">Hygiene First</h4>
                <p className="text-xs text-slate-400">Sanitized strength sections, touchless lockers, and daily professional grade anti-bacterial cleaning routines.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="text-indigo-400 pt-1 shrink-0"><Dumbbell size={20} /></div>
              <div>
                <h4 className="text-xs font-semibold text-white uppercase tracking-wider font-display">Scientific Training Methodologies</h4>
                <p className="text-xs text-slate-400">No bro-science. Our certified trainers design workout and nutritional advice anchored in real, verified athletic research.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="text-indigo-400 pt-1 shrink-0"><Award size={20} /></div>
              <div>
                <h4 className="text-xs font-semibold text-white uppercase tracking-wider font-display">Complete Data Control</h4>
                <p className="text-xs text-slate-400">Realtime logs and performance counters that help members look at cold-hard stats instead of guessing their progress.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Meet the Trainers */}
      <div className="space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl md:text-4xl font-bold font-display tracking-tight text-white">Meet Our Master Instructors</h2>
          <p className="text-xs md:text-sm text-slate-400 max-w-lg mx-auto">
            Work out with certified Indian gym coaches trained in athletic conditioning, body composition changes, and nutritional coaching.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {trainers.map((t, idx) => (
            <div key={idx} className="glass border-white/10 rounded-3xl overflow-hidden shadow-lg group hover:border-indigo-500/30 transition duration-300">
              <div className="aspect-square bg-slate-950/40 overflow-hidden relative">
                <img
                  src={t.image}
                  alt={t.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-4 right-4 bg-slate-950/90 border border-white/10 text-indigo-400 font-display font-semibold text-[10px] tracking-wider px-2.5 py-1 rounded-full shadow-md">
                  {t.experience} Experience
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div className="space-y-1">
                  <h3 className="text-lg font-bold font-display text-white">{t.name}</h3>
                  <p className="text-xs font-medium text-indigo-400 uppercase tracking-wider">{t.role}</p>
                </div>
                <div className="space-y-2 text-xs">
                  <p className="text-slate-400 leading-relaxed font-light">{t.bio}</p>
                  <p className="text-slate-300 font-medium pt-2">
                    <span className="text-slate-500 font-normal">Expertise: </span>{t.specialty}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

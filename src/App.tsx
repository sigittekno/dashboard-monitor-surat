/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileText, 
  Users, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  ArrowRight,
  Stamp,
  Mail,
  UserCheck
} from 'lucide-react';
import { LetterData, LetterStatus, Stage } from './types';

// Mock Data
const INITIAL_MOCK_DATA: LetterData[] = [
  {
    id: 'OTDA-001',
    no: 1,
    uraian: "Permohonan Izin Penataan Daerah Kabupaten Merauke dan Percepatan Persetujuan Draft Peraturan Pemerintah tentang Penataan Daerah",
    kategori: "Surat",
    layanan: "Layanan Penataan Daerah",
    stages: [
      { label: "Surat Masuk", status: "selesai", date: "2026-04-18T08:00:00Z" },
      { label: "Sekretariat OTDA", status: "selesai", date: "2026-04-19T10:00:00Z" },
      { label: "TU Ses Ditjen", status: "berproses", date: "2026-04-20T14:30:00Z" },
      { label: "Menteri", status: "belum" },
      { label: "Selesai", status: "belum" },
    ]
  },
  {
    id: 'OTDA-002',
    no: 2,
    uraian: "Penyampaian Hal Konsep Permintaan Nama Panitia Antar Kementerian (PAK) Penataan Daerah untuk Penyusunan Rancangan Peraturan Pemerintah",
    kategori: "Surat",
    layanan: "Layanan Penataan Daerah",
    stages: [
      { label: "Surat Masuk", status: "selesai", date: "2026-04-10T09:00:00Z" },
      { label: "Sekretariat OTDA", status: "selesai", date: "2026-04-12T11:00:00Z" },
      { label: "TU Ses Ditjen", status: "selesai", date: "2026-04-15T13:00:00Z" },
      { label: "Menteri", status: "selesai", date: "2026-04-19T16:00:00Z" },
      { label: "Selesai", status: "selesai", date: "2026-04-20T17:00:00Z" },
    ]
  },
  {
    id: 'OTDA-003',
    no: 3,
    uraian: "Dokumen Persetujuan Evaluasi Jabatan Fungsional serta Koordinasi Intensif Tim Penilai Instansi Pusat",
    kategori: "Nota Dinas",
    layanan: "Layanan Mutasi Pegawai",
    stages: [
      { label: "Surat Masuk", status: "selesai", date: "2026-04-20T20:00:00Z" },
      { label: "Sekretariat OTDA", status: "berproses", date: "2026-04-20T22:00:00Z" },
      { label: "TU Ses Ditjen", status: "belum" },
      { label: "Menteri", status: "belum" },
      { label: "Selesai", status: "belum" },
    ]
  }
];

const DigitalClock = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('id-ID', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  };

  return (
    <div className="text-right flex flex-col items-end">
      <div className="text-5xl font-mono font-bold tracking-tighter text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
        {formatTime(time)}
      </div>
      <div className="text-lg text-blue-300 font-medium opacity-80 uppercase tracking-widest mt-1">
        {formatDate(time)}
      </div>
    </div>
  );
};

const DurationTimer = ({ startDate, isCritical }: { startDate: string, isCritical?: boolean }) => {
  const [duration, setDuration] = useState("");

  useEffect(() => {
    const updateDuration = () => {
      const start = new Date(startDate).getTime();
      const now = new Date().getTime();
      const diff = now - start;

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      let str = "";
      if (days > 0) str += `${days}H `;
      if (hours > 0 || days > 0) str += `${hours}J `;
      str += `${minutes}M ${seconds}S`;
      setDuration(str);
    };

    updateDuration();
    const timer = setInterval(updateDuration, 1000);
    return () => clearInterval(timer);
  }, [startDate]);

  return (
    <div className={`flex flex-col items-center border rounded-lg px-4 py-1.5 shadow-xl backdrop-blur-sm whitespace-nowrap transition-colors ${
      isCritical ? 'bg-red-950/90 border-red-500 shadow-red-500/20' : 'bg-slate-900/90 border-amber-500/50'
    }`}>
      <span className={`text-[9px] uppercase font-bold tracking-[0.2em] mb-0.5 ${
        isCritical ? 'text-red-400' : 'text-amber-500'
      }`}>
        {isCritical ? 'WARNING' : 'Berproses Selama'}
      </span>
      <div className={`text-sm font-mono font-black tracking-widest leading-none ${
        isCritical ? 'text-red-100 animate-pulse' : 'text-white'
      }`}>
        {duration}
      </div>
    </div>
  );
};

const Timeline = ({ stages }: { stages: Stage[] }) => {
  const lastActiveIndex = [...stages].reverse().findIndex(s => s.status !== 'belum');
  const activeIndex = lastActiveIndex === -1 ? 0 : stages.length - 1 - lastActiveIndex;
  const progressPercent = (activeIndex / (stages.length - 1)) * 100;
  
  const activeStage = stages[activeIndex];
  const isCurrentlyProcessing = activeStage.status === 'berproses';
  
  // Calculate if active stage is overdue (> 4 hours)
  const isOverdueActive = isCurrentlyProcessing && activeStage.date && 
    (new Date().getTime() - new Date(activeStage.date).getTime()) > 4 * 60 * 60 * 1000;

  return (
    <div className="flex items-center justify-between w-full px-20 relative h-full min-h-[160px]">
      <div className="absolute top-1/2 left-20 right-20 h-1.5 bg-slate-800 -translate-y-1/2 rounded-full" />
      <motion.div 
        initial={{ width: 0 }}
        animate={{ width: `calc(${progressPercent}% - 0px)` }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className={`absolute left-20 h-1.5 -translate-y-1/2 rounded-full overflow-hidden ${
          isOverdueActive ? 'bg-red-600 shadow-[0_0_15px_#dc2626]' : 
          isCurrentlyProcessing ? 'bg-amber-500 shadow-[0_0_15px_#f59e0b]' : 
          'bg-emerald-500 shadow-[0_0_15px_#10b981]'
        }`}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/40 to-white/0 animate-shimmer" style={{ backgroundSize: '200% 100%' }} />
      </motion.div>
      
      {stages.map((stage, index) => {
        const isSelesai = stage.status === 'selesai';
        const isBerproses = stage.status === 'berproses';
        
        // Calculate if THIS specific stage is overdue (> 4 hours)
        const isOverdue = isBerproses && stage.date && 
          (new Date().getTime() - new Date(stage.date).getTime()) > 4 * 60 * 60 * 1000;

        return (
          <div key={index} className="relative z-10 flex flex-col items-center">
            {isBerproses && stage.date && (
              <div className="absolute -top-12 scale-110">
                <DurationTimer startDate={stage.date} isCritical={isOverdue} />
              </div>
            )}
            <div className={`
              w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 
              border-[4px] border-slate-950 relative
              ${isSelesai ? 'bg-emerald-500 shadow-[0_0_15px_#10b981]' : 
                isOverdue ? 'bg-red-600 shadow-[0_0_25px_#dc2626]' :
                isBerproses ? 'bg-amber-500 shadow-[0_0_25px_#f59e0b]' : 
                'bg-slate-800 text-slate-500'}
            `}>
              {isBerproses && (
                <div className={`absolute inset-[-6px] rounded-full border-2 animate-ping opacity-40 ${
                  isOverdue ? 'border-red-500' : 'border-amber-500'
                }`} />
              )}
              {isBerproses && (
                <div className={`absolute inset-0 rounded-full animate-pulse ${
                  isOverdue ? 'bg-red-500' : 'bg-amber-400'
                }`} />
              )}
              <div className="relative z-10">
                {isSelesai && <CheckCircle2 size={24} className="text-white" />}
                {isBerproses && <Clock size={24} className="text-white" />}
              </div>
            </div>
            <div className="absolute top-16 w-32 flex flex-col items-center">
              <span className={`text-[10px] font-black uppercase tracking-widest text-center leading-tight drop-shadow-md ${
                isSelesai ? 'text-emerald-400' : 
                isOverdue ? 'text-red-500 animate-pulse' : 
                isBerproses ? 'text-amber-400' : 
                'text-slate-500'
              }`}>{stage.label}</span>
              {stage.date && (
                <span className="text-[8px] font-mono font-bold text-slate-500 mt-1 whitespace-nowrap uppercase tracking-tighter">
                  {new Date(stage.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

const TotalDurationTimer = ({ stages }: { stages: Stage[] }) => {
  const [duration, setDuration] = useState("");
  const isSelesaiTotal = stages[stages.length - 1].status === 'selesai';
  const startDate = stages[0].date;
  const endDate = isSelesaiTotal ? stages[stages.length - 1].date : null;

  useEffect(() => {
    const calculateDuration = () => {
      if (!startDate) return;
      const start = new Date(startDate).getTime();
      const end = endDate ? new Date(endDate).getTime() : new Date().getTime();
      const diff = end - start;
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      let str = "";
      if (days > 0) str += `${days}H `;
      if (hours > 0 || days > 0) str += `${hours}J `;
      str += `${minutes}M ${seconds}S`;
      setDuration(str);
    };
    calculateDuration();
    if (!isSelesaiTotal) {
      const timer = setInterval(calculateDuration, 1000);
      return () => clearInterval(timer);
    }
  }, [startDate, endDate, isSelesaiTotal]);
  return <span>{duration}</span>;
};

const LetterCard = ({ letter }: { letter: LetterData }) => {
  const currentStage = letter.stages.find(s => s.status === 'berproses') || 
                       letter.stages.slice().reverse().find(s => s.status === 'selesai');
  const isSelesaiTotal = letter.stages[letter.stages.length - 1].status === 'selesai';
  const accentColor = isSelesaiTotal ? 'bg-emerald-500' : 'bg-amber-500';
  const shadowColor = isSelesaiTotal ? 'shadow-[0_0_20px_rgba(16,185,129,0.5)]' : 'shadow-[0_0_20px_rgba(245,158,11,0.5)]';

  return (
    <div className="flex bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl items-center relative overflow-hidden group hover:bg-white/10 transition-colors min-h-[140px]">
      <div className={`absolute top-0 left-0 w-1.5 h-full ${accentColor} ${shadowColor}`} />
      <div className="flex w-full items-center">
        <div className="w-1/4 pr-8 border-r border-white/5">
          <div className={`text-[10px] font-bold uppercase mb-1 tracking-widest ${isSelesaiTotal ? 'text-emerald-400' : 'text-amber-400'}`}>{letter.layanan}</div>
          <div className="min-h-12 flex items-center">
            <h2 className="text-lg font-bold text-white leading-tight tracking-tight">{letter.uraian}</h2>
          </div>
        </div>
        <div className="flex-1 px-8"><Timeline stages={letter.stages} /></div>
        <div className="w-48 text-right pl-8 border-l border-white/5">
          <div className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Update Terakhir</div>
          <div className={`text-2xl font-black tracking-tighter ${isSelesaiTotal ? 'text-emerald-400' : 'text-amber-400'}`}>{isSelesaiTotal ? 'SELESAI' : currentStage?.label.toUpperCase()}</div>
          <div className={`text-[10px] font-mono opacity-60 mb-3 ${isSelesaiTotal ? 'text-emerald-500' : 'text-amber-500'}`}>{currentStage?.date || 'LIVE'}</div>
          <div className="pt-2 border-t border-white/5">
            <div className="text-[9px] text-slate-500 uppercase font-bold tracking-wider">Total Durasi Surat</div>
            <div className={`text-sm font-mono font-bold ${isSelesaiTotal ? 'text-emerald-400' : 'text-amber-400'}`}><TotalDurationTimer stages={letter.stages} /></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [letters] = useState<LetterData[]>(INITIAL_MOCK_DATA);
  const [isPaused, setIsPaused] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-blue-500/30 overflow-hidden font-sans">
      <div className="relative z-10 w-full max-w-[1800px] mx-auto px-10 py-4 flex flex-col h-screen">
        <header className="flex items-center justify-between mb-4 border-b border-white/10 pb-4">
          <div className="flex flex-col">
            <h1 className="text-5xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">MONITORING SURAT DITJEN OTDA</h1>
            <p className="text-slate-400 font-medium tracking-[0.3em] text-[11px] uppercase mt-1 italic opacity-80">Direktorat Jenderal Otonomi Daerah</p>
          </div>
          <DigitalClock />
        </header>

        <main className="flex-1 overflow-hidden relative group">
          {/* Continuous Vertical Marquee Container */}
          <div 
            className="absolute inset-0 mask-fade-y"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            <div 
              className={`flex flex-col gap-3 py-4 animate-vertical-scroll ${isPaused ? 'pause' : ''}`}
            >
              {/* Duplicate list multiple times to ensure seamless loop */}
              {[...letters, ...letters, ...letters].map((letter, idx) => (
                <div key={`${letter.id}-${idx}`}>
                  <LetterCard letter={letter} />
                </div>
              ))}
            </div>
          </div>
        </main>

        <footer className="mt-4 flex justify-between items-center text-xs border-t border-white/5 pt-4">
          <div className="flex gap-10">
            <div className="flex items-center gap-3">
              <div className="w-3.5 h-3.5 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]" />
              <span className="text-slate-400 uppercase tracking-widest font-black">Selesai / Tervalidasi</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3.5 h-3.5 rounded-full bg-amber-500 shadow-[0_0_10px_#f59e0b] animate-pulse" />
              <span className="text-slate-400 uppercase tracking-widest font-black">Sedang Diproses</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3.5 h-3.5 rounded-full bg-slate-700" />
              <span className="text-slate-400 uppercase tracking-widest font-black">Belum Diproses</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4 text-slate-500">
            <span className="italic font-medium">Otda Dev v1</span>
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="uppercase font-black tracking-tighter opacity-70">Live Feed</span>
          </div>
        </footer>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes vertical-scroll {
          0% { transform: translateY(0); }
          100% { transform: translateY(-33.33%); }
        }
        .animate-vertical-scroll {
          animation: vertical-scroll 45s linear infinite;
        }
        .pause {
          animation-play-state: paused;
        }
        .animate-shimmer {
          animation: shimmer 2s infinite linear;
        }
        .mask-fade-y {
          mask-image: linear-gradient(to bottom, transparent, black 10%, black 90%, transparent);
        }
        .font-mono {
           font-variant-numeric: tabular-nums;
        }
      `}} />
    </div>
  );
}

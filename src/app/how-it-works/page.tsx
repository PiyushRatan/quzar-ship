'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Header } from '../../components/Header';
import {
  ArrowRight,
  CheckCircle2,
  Globe,
  Layout,
  Calendar,
  FileCode,
  Sparkles,
  Cpu,
  Download,
  HelpCircle,
  Layers,
  ShieldCheck,
  ExternalLink,
  Check,
} from 'lucide-react';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
  activeBorderColor?: string;
  maxTilt?: number;
  dataAttr?: string;
  scrollSpotlight?: boolean;
}

function TiltSpotlightCard({
  children,
  className = '',
  glowColor = 'rgba(34, 211, 238, 0.15)',
  activeBorderColor = 'rgba(34, 211, 238, 0.45)',
  maxTilt = 4,
  dataAttr,
  scrollSpotlight = true,
}: TiltCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const rotateXTo = useRef<gsap.QuickToFunc | null>(null);
  const rotateYTo = useRef<gsap.QuickToFunc | null>(null);
  const isHoveringRef = useRef<boolean>(false);

  useEffect(() => {
    const el = cardRef.current;
    const glowEl = glowRef.current;
    if (!el) return;

    const prefersReduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    if (prefersReduced) return;

    gsap.set(el, { transformPerspective: 900, transformStyle: 'preserve-3d' });

    rotateXTo.current = gsap.quickTo(el, 'rotationX', {
      duration: 0.4,
      ease: 'power3.out',
    });
    rotateYTo.current = gsap.quickTo(el, 'rotationY', {
      duration: 0.4,
      ease: 'power3.out',
    });

    if (!scrollSpotlight || !glowEl) return;

    const st = ScrollTrigger.create({
      trigger: el,
      start: 'top 80%',
      end: 'bottom 20%',
      onUpdate: (self) => {
        if (isHoveringRef.current) return;
        const p = self.progress;
        const intensity = Math.sin(p * Math.PI);
        const sweepX = Math.round(15 + p * 70);
        const sweepY = Math.round(25 + p * 50);
        glowEl.style.opacity = String((intensity * 0.95).toFixed(2));
        glowEl.style.background = `radial-gradient(380px circle at ${sweepX}% ${sweepY}%, ${glowColor}, transparent 72%)`;
        el.style.borderColor =
          intensity > 0.35 ? activeBorderColor : 'rgba(255, 255, 255, 0.1)';
      },
      onLeave: () => {
        if (!isHoveringRef.current) {
          glowEl.style.opacity = '0';
          el.style.borderColor = 'rgba(255, 255, 255, 0.1)';
        }
      },
      onLeaveBack: () => {
        if (!isHoveringRef.current) {
          glowEl.style.opacity = '0';
          el.style.borderColor = 'rgba(255, 255, 255, 0.1)';
        }
      },
    });

    return () => {
      st.kill();
    };
  }, [glowColor, activeBorderColor, scrollSpotlight]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = cardRef.current;
    if (!el || !rotateXTo.current || !rotateYTo.current) return;
    isHoveringRef.current = true;

    const rect = el.getBoundingClientRect();
    const relX = e.clientX - rect.left;
    const relY = e.clientY - rect.top;
    const normX = relX / rect.width - 0.5;
    const normY = relY / rect.height - 0.5;

    rotateXTo.current(-normY * maxTilt * 2);
    rotateYTo.current(normX * maxTilt * 2);

    el.style.borderColor = activeBorderColor;

    if (glowRef.current) {
      glowRef.current.style.opacity = '1';
      glowRef.current.style.background = `radial-gradient(400px circle at ${relX}px ${relY}px, ${glowColor}, transparent 70%)`;
    }
  };

  const handleMouseLeave = () => {
    isHoveringRef.current = false;
    if (rotateXTo.current && rotateYTo.current) {
      rotateXTo.current(0);
      rotateYTo.current(0);
    }
    if (cardRef.current) {
      cardRef.current.style.borderColor = 'rgba(255, 255, 255, 0.1)';
    }
    if (glowRef.current) {
      glowRef.current.style.opacity = '0';
    }
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      {...(dataAttr ? { [dataAttr]: 'true' } : {})}
      className={`relative overflow-hidden rounded-none will-change-transform transition-colors duration-300 ${className}`}
    >
      <div
        ref={glowRef}
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 z-0"
      />
      <div className="relative z-10 h-full flex flex-col justify-between">
        {children}
      </div>
    </div>
  );
}

const HERO_TITLE_WORDS = [
  { text: 'From', accent: false },
  { text: 'a', accent: false },
  { text: 'Simple', accent: true },
  { text: 'Idea', accent: true },
  { text: 'to', accent: false },
  { text: 'a', accent: false },
  { text: 'Ready-to-Build', accent: true },
  { text: 'Product.', accent: false },
];

const IDEA_SCENARIOS = [
  {
    id: 'studios',
    label: 'Studio Booking App',
    sentence:
      'I want a booking app for local photography and music studios where creators can reserve hourly rooms, split payments with teammates, and unlock studio doors with a mobile pass.',
    goals: [
      'Search local studios by hourly rate, gear included, and live availability',
      'Split booking payments across multiple bandmates or production crew members',
      'Send automatic check-in instructions and time-limited studio entry codes',
    ],
    screens: [
      {
        name: 'Studio Discovery & Filter Map',
        detail: 'Browse spaces with hourly availability and equipment tags',
      },
      {
        name: 'Split-Pay Checkout Screen',
        detail: 'Reserve a time slot and invite teammates to pay their share',
      },
      {
        name: 'Creator Pass & Host Calendar',
        detail: 'Upcoming reservations, door access code, and host payout view',
      },
    ],
  },
  {
    id: 'portal',
    label: 'Client Approval Portal',
    sentence:
      'I want a clean portal for small design agencies where clients can review website mockups, click to leave pinned comments, and pay milestone invoices in one place.',
    goals: [
      'Share passwordless project links so clients never forget a login password',
      'Collect visual feedback pinned directly onto design drafts',
      'Unlock final downloadable files automatically once the invoice is paid',
    ],
    screens: [
      {
        name: 'Client Project Timeline',
        detail: 'Single view showing current draft, feedback status, and next milestone',
      },
      {
        name: 'Visual Review Canvas',
        detail: 'Click anywhere on a mockup to drop a numbered comment thread',
      },
      {
        name: 'One-Click Invoice & File Vault',
        detail: 'Card or bank payment that immediately unlocks final deliverables',
      },
    ],
  },
  {
    id: 'learning',
    label: 'Cohort Course Platform',
    sentence:
      'I want a 4-week cohort learning app where instructors post daily bite-sized challenges, students submit short video demos, and peers vote on the best work.',
    goals: [
      'Keep students accountable with a daily challenge unlock schedule',
      'Let learners upload 60-second project walkthroughs without slow video setup',
      'Highlight top community submissions on a weekly cohort leaderboard',
    ],
    screens: [
      {
        name: 'Daily Challenge Feed',
        detail: 'Today’s prompt, countdown timer, and peer submission gallery',
      },
      {
        name: 'Quick Video Recorder & Upload',
        detail: 'Browser screen-share or link submission with structured notes',
      },
      {
        name: 'Cohort Progress Board',
        detail: 'Streak tracker, instructor feedback badges, and completion certificate',
      },
    ],
  },
];

const REFERENCE_SITES = [
  {
    id: 'peerspace',
    url: 'https://peerspace.com/spaces/music-studios',
    category: 'Marketplace & Booking Pattern',
    navExtracted: [
      'Search by Activity & City',
      'Hourly Pricing Breakdown',
      'Host Rules & Equipment List',
      'Instant Book vs Request Flow',
    ],
    featurePatterns: [
      'Upfront hourly total calculator with cleaning or gear add-ons',
      'Verified creator reviews paired with photos from actual sessions',
      'Host response-time badge to build trust before checkout',
    ],
    opportunity:
      'Add built-in group payment splitting and automated door-code delivery so studio owners do not have to text keys manually.',
  },
  {
    id: 'calendly',
    url: 'https://calendly.com/features/scheduling',
    category: 'Scheduling & Calendar Pattern',
    navExtracted: [
      'Time-Zone Auto Detection',
      'Buffer Time Rules',
      'Automated Reminder Emails',
      'Calendar Sync (Google & Outlook)',
    ],
    featurePatterns: [
      'Two-click slot selection with zero account creation required for guests',
      'Automatic buffer blocks between sessions to prevent double-booking',
      'Instant calendar invite with reschedule link included',
    ],
    opportunity:
      'Combine instant time-slot picking with deposit collection and equipment selection in a single checkout step.',
  },
];

const SPRINT_PHASES = [
  {
    id: 'phase-1',
    days: 'Days 1 – 3',
    title: 'Foundation, Sign-In & Database Setup',
    summary: 'Set up the project skeleton, user accounts, and core data tables.',
    tasks: [
      {
        day: 'Day 1',
        task: 'Create project workspace and connect free starter database',
      },
      {
        day: 'Day 2',
        task: 'Enable email magic-link and Google sign-in for creators and hosts',
      },
      {
        day: 'Day 3',
        task: 'Load the generated database tables for Studios, Bookings, and Users',
      },
    ],
  },
  {
    id: 'phase-2',
    days: 'Days 4 – 7',
    title: 'Core Screens & Listing Flows',
    summary: 'Build the main screens where hosts list spaces and creators browse.',
    tasks: [
      {
        day: 'Day 4',
        task: 'Build the host onboarding form with photo upload and hourly pricing',
      },
      {
        day: 'Day 5',
        task: 'Create the public studio discovery page with city and gear filters',
      },
      {
        day: 'Day 6',
        task: 'Build the studio detail screen with live hourly availability calendar',
      },
      {
        day: 'Day 7',
        task: 'Connect real database records so listings update live',
      },
    ],
  },
  {
    id: 'phase-3',
    days: 'Days 8 – 11',
    title: 'Checkout, Split Payments & Notifications',
    summary: 'Turn visitors into paying customers with smooth booking and receipts.',
    tasks: [
      {
        day: 'Day 8',
        task: 'Integrate checkout session for instant hourly reservation payments',
      },
      {
        day: 'Day 9',
        task: 'Add teammate payment-split links so groups can share booking costs',
      },
      {
        day: 'Day 10',
        task: 'Send automatic confirmation emails with calendar invites and studio rules',
      },
      {
        day: 'Day 11',
        task: 'Build the host earnings dashboard showing upcoming payouts',
      },
    ],
  },
  {
    id: 'phase-4',
    days: 'Days 12 – 14',
    title: 'Mobile Polish, Testing & Live Launch',
    summary: 'Verify every screen on mobile phones and publish to your live domain.',
    tasks: [
      {
        day: 'Day 12',
        task: 'Test the complete booking journey on mobile Safari and Chrome',
      },
      {
        day: 'Day 13',
        task: 'Add empty states, helpful error messages, and loading indicators',
      },
      {
        day: 'Day 14',
        task: 'Connect custom domain, run final live payment check, and launch',
      },
    ],
  },
];

const EXPORT_FILES = [
  {
    filename: 'PRD.md',
    badge: 'Product Plan',
    color: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10',
    description:
      'Plain-English product requirements, user roles, screen-by-screen goals, and launch scope.',
    snippet: `# Product Plan: Local Studio Booking Platform
## 1. Core Value Proposition
Help independent musicians and photographers book hourly creative studios with instant availability and group split-payments.

## 2. Primary User Flows
- Creator: Browse studios -> Select hourly slot -> Split payment -> Receive door pass
- Studio Host: List room & gear -> Set hourly calendar -> Receive automatic payouts`,
  },
  {
    filename: 'ARCHITECTURE.md',
    badge: 'System Blueprint',
    color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
    description:
      'Recommended app stack, sign-in setup, security rules, and $0 starter cloud hosting plan.',
    snippet: `# System Setup & Hosting Plan
- Web & Mobile UI: Next.js App Router + Tailwind CSS (Fast mobile booking views)
- Sign-In & Accounts: Supabase Auth (Passwordless Magic Links + Google OAuth)
- Database & Photos: Managed PostgreSQL + Storage Buckets
- Starter Hosting Cost: $0/month (Vercel + Supabase Free Tier up to 1,000 users)`,
  },
  {
    filename: 'schema.prisma',
    badge: 'Database Tables',
    color: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
    description:
      'Ready-to-use database structure that your developer or AI coding tool can load in seconds.',
    snippet: `model Studio {
  id          String    @id @default(cuid())
  name        String
  city        String
  hourlyRate  Int
  equipment   String[]
  bookings    Booking[]
}

model Booking {
  id          String   @id @default(cuid())
  studioId    String
  startTime   DateTime
  endTime     DateTime
  totalCents  Int
  status      String   @default("CONFIRMED")
}`,
  },
];

const FAQ_ITEMS = [
  {
    number: '01',
    question: 'Do I need technical knowledge to use Quzar Ship?',
    answer:
      'Not at all. Quzar Ship is designed so you can describe your idea in everyday language—just like explaining it to a co-founder or friend. Every screen list, feature priority, and daily checklist is written in clear, plain English first, while still including the structured technical files a developer needs.',
    highlight: 'Written for founders first, ready for engineers second.',
  },
  {
    number: '02',
    question: 'What happens after I generate my blueprint?',
    answer:
      'Right inside your browser, you get a complete interactive product blueprint: your key screens and user journeys, insights from any competitor website you pasted, a recommended $0-to-start hosting setup, and a step-by-step 14-day launch checklist. You can explore every tab immediately or download the complete package.',
    highlight: 'Instant interactive blueprint + one-click file download.',
  },
  {
    number: '03',
    question: 'Can my developer or AI coding tool use the exported files?',
    answer:
      'Yes. With one click, you can download PRD.md, ARCHITECTURE.md, and schema.prisma. You can drop these files directly into AI coding tools like Cursor, Claude Code, or Windsurf, or hand them to a freelance developer or agency so they can start building on Day 1 without weeks of back-and-forth discovery calls.',
    highlight: 'Plugs directly into Cursor, Claude Code, or any dev team.',
  },
  {
    number: '04',
    question: 'Can Quzar Studio build the whole product for me?',
    answer:
      'Absolutely. If you want an experienced product and engineering team to turn your blueprint into a live, production-ready web or mobile app, you can share your generated blueprint directly with Quzar Studio. Because the scope, screens, and database are already mapped out, we can start building right away.',
    highlight: 'Seamless handoff from blueprint to full product build.',
  },
];

export default function HowItWorksPage() {
  const [activeChapter, setActiveChapter] = useState<number>(0);
  const [selectedIdeaIndex, setSelectedIdeaIndex] = useState<number>(0);
  const [selectedRefIndex, setSelectedRefIndex] = useState<number>(0);
  const [archViewMode, setArchViewMode] = useState<'plain' | 'savings'>('plain');
  const [selectedPhaseIndex, setSelectedPhaseIndex] = useState<number>(0);
  const [selectedExportIndex, setSelectedExportIndex] = useState<number>(0);
  const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>({
    'Day 1': true,
    'Day 2': true,
  });
  const [activeFaqIndex, setActiveFaqIndex] = useState<number>(0);

  const pageRef = useRef<HTMLDivElement>(null);
  const timelineContainerRef = useRef<HTMLDivElement>(null);
  const verticalBeamRef = useRef<SVGPathElement>(null);
  const primaryCtaRef = useRef<HTMLAnchorElement>(null);
  const secondaryCtaRef = useRef<HTMLAnchorElement>(null);

  const toggleTask = (dayKey: string) => {
    setCompletedTasks((prev) => ({
      ...prev,
      [dayKey]: !prev[dayKey],
    }));
  };

  // Magnetic button pull on desktop pointer devices
  useEffect(() => {
    const prefersReduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    if (prefersReduced) return;

    const buttons = [primaryCtaRef.current, secondaryCtaRef.current].filter(
      Boolean
    ) as HTMLElement[];

    const cleanups: Array<() => void> = [];

    buttons.forEach((btn) => {
      const xTo = gsap.quickTo(btn, 'x', {
        duration: 0.35,
        ease: 'power3.out',
      });
      const yTo = gsap.quickTo(btn, 'y', {
        duration: 0.35,
        ease: 'power3.out',
      });

      const onMove = (e: MouseEvent) => {
        const rect = btn.getBoundingClientRect();
        const dx = (e.clientX - (rect.left + rect.width / 2)) * 0.22;
        const dy = (e.clientY - (rect.top + rect.height / 2)) * 0.28;
        xTo(dx);
        yTo(dy);
      };

      const onLeave = () => {
        gsap.to(btn, {
          x: 0,
          y: 0,
          duration: 0.55,
          ease: 'elastic.out(1, 0.4)',
        });
      };

      btn.addEventListener('mousemove', onMove);
      btn.addEventListener('mouseleave', onLeave);
      cleanups.push(() => {
        btn.removeEventListener('mousemove', onMove);
        btn.removeEventListener('mouseleave', onLeave);
      });
    });

    return () => {
      cleanups.forEach((fn) => fn());
    };
  }, []);

  // Natural Scroll-Driven GSAP Choreography (scrub: 0.4, zero scroll hijacking)
  useEffect(() => {
    const prefersReduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    if (prefersReduced) return;

    const ctx = gsap.context(() => {
      // 1. Header entrance choreography
      const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      heroTl
        .fromTo(
          '[data-hero-word]',
          { y: 26, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.62,
            stagger: 0.04,
            clearProps: 'transform',
          }
        )
        .fromTo(
          '[data-hero-sub]',
          { y: 18, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.52 },
          '-=0.35'
        )
        .fromTo(
          '[data-hero-pills]',
          { y: 16, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.48 },
          '-=0.32'
        );

      // 2. Continuous Vertical SVG Beam Tracing Down Across All 4 Chapters
      const beamEl = verticalBeamRef.current;
      const totalLength = beamEl ? beamEl.getTotalLength() : 1000;

      if (beamEl && timelineContainerRef.current) {
        gsap.set(beamEl, {
          strokeDasharray: totalLength,
          strokeDashoffset: totalLength,
        });

        gsap.to(beamEl, {
          strokeDashoffset: 0,
          ease: 'none',
          scrollTrigger: {
            trigger: timelineContainerRef.current,
            start: 'top 68%',
            end: 'bottom 32%',
            scrub: 0.4,
          },
        });
      }

      // 3. Chapter Blocks: Natural Scroll Reveal & Viewport-Center Illumination
      const chapterBlocks = gsap.utils.toArray<HTMLElement>(
        '[data-chapter-block]'
      );

      chapterBlocks.forEach((block, idx) => {
        gsap.fromTo(
          block,
          { y: 32, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.65,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: block,
              start: 'top 84%',
              once: true,
            },
          }
        );

        ScrollTrigger.create({
          trigger: block,
          start: 'top 58%',
          end: 'bottom 42%',
          onEnter: () => setActiveChapter(idx),
          onEnterBack: () => setActiveChapter(idx),
        });
      });

      // 4. FAQ Cards Staggered Reveal
      gsap.fromTo(
        '[data-faq-card]',
        { y: 24, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.55,
          stagger: 0.08,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '[data-faq-section]',
            start: 'top 82%',
            once: true,
          },
        }
      );
    }, pageRef);

    return () => {
      ctx.revert();
    };
  }, []);

  const currentIdea = IDEA_SCENARIOS[selectedIdeaIndex] || IDEA_SCENARIOS[0];
  const currentRefSite =
    REFERENCE_SITES[selectedRefIndex] || REFERENCE_SITES[0];
  const currentPhase = SPRINT_PHASES[selectedPhaseIndex] || SPRINT_PHASES[0];
  const currentExport = EXPORT_FILES[selectedExportIndex] || EXPORT_FILES[0];

  const scrollToChapter = (id: string, index: number) => {
    setActiveChapter(index);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div
      ref={pageRef}
      className="min-h-screen flex flex-col bg-[#000000] text-zinc-100 selection:bg-cyan-500/30 selection:text-cyan-200"
    >
      <Header />

      <main className="flex-1">
        {/* ===================================================================
            1. PAGE HEADER: NARRATIVE INTRODUCTION
           =================================================================== */}
        <section className="relative overflow-hidden border-b border-white/10 pt-10 pb-12 lg:pt-14 lg:pb-16 bg-[#000000]">
          <div className="bg-grid-pattern absolute inset-0 opacity-30 pointer-events-none" />
          <div className="hero-glow top-0 left-1/4 opacity-40 pointer-events-none" />

          <div className="w-full px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="max-w-4xl">
              <div className="inline-flex items-center space-x-2 px-3 py-1 bg-zinc-900/90 border border-white/15 text-xs font-mono text-cyan-400 mb-5 rounded-none">
                <Sparkles className="w-3.5 h-3.5" />
                <span>HOW QUZAR SHIP WORKS · 4 SIMPLE STEPS</span>
              </div>

              <h1 className="text-[1.85rem] xs:text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.12]">
                {HERO_TITLE_WORDS.map((word, idx) => (
                  <span
                    key={idx}
                    data-hero-word
                    className={`inline-block mr-[0.26em] ${
                      word.accent
                        ? 'text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-200 to-cyan-400'
                        : ''
                    }`}
                  >
                    {word.text}
                  </span>
                ))}
              </h1>

              <p
                data-hero-sub
                className="mt-5 text-base sm:text-lg text-zinc-300 leading-relaxed max-w-3xl"
              >
                Most product ideas get stuck in scattered notes because figuring
                out screens, databases, and developer tasks feels overwhelming.
                Quzar Ship guides you from a plain-English idea to a complete,
                ready-to-build blueprint in four clear chapters.
              </p>

              {/* Interactive Chapter Jump Bar */}
              <div
                data-hero-pills
                className="mt-8 pt-6 border-t border-white/10 flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-thin"
              >
                {[
                  {
                    num: '01',
                    shortLabel: 'Idea Intake',
                    label: 'Plain-English Idea Intake',
                    id: 'chapter-01',
                  },
                  {
                    num: '02',
                    shortLabel: 'Reference Scan',
                    label: 'Competitor & Reference Scan',
                    id: 'chapter-02',
                  },
                  {
                    num: '03',
                    shortLabel: 'System Selection',
                    label: 'Automatic System Selection',
                    id: 'chapter-03',
                  },
                  {
                    num: '04',
                    shortLabel: '14-Day Plan',
                    label: '14-Day Checklist & Export',
                    id: 'chapter-04',
                  },
                ].map((chap, idx) => {
                  const isCurrent = activeChapter === idx;
                  return (
                    <button
                      key={chap.id}
                      type="button"
                      onClick={() => scrollToChapter(chap.id, idx)}
                      className={`px-3 sm:px-3.5 py-2 text-xs font-mono uppercase tracking-wider border rounded-none transition-all cursor-pointer flex items-center space-x-1.5 sm:space-x-2 whitespace-nowrap shrink-0 ${
                        isCurrent
                          ? 'bg-white text-black border-white font-bold'
                          : 'bg-[#0b0b0e] text-zinc-400 border-white/15 hover:border-white/40 hover:text-white'
                      }`}
                    >
                      <span
                        className={
                          isCurrent ? 'text-black font-extrabold' : 'text-cyan-400'
                        }
                      >
                        {chap.num}
                      </span>
                      <span className="sm:hidden">{chap.shortLabel}</span>
                      <span className="hidden sm:inline">{chap.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* ===================================================================
            2. SCROLL-GUIDED 4-CHAPTER INTERACTIVE STORY
               Connected by a continuous vertical SVG beam on mobile & desktop
           =================================================================== */}
        <section className="relative py-12 lg:py-20 bg-[#000000] border-b border-white/10">
          <div className="w-full px-4 sm:px-6 lg:px-8">
            <div ref={timelineContainerRef} className="relative">
              {/* Continuous Vertical SVG Beam (Visible on Both Mobile & Desktop) */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute top-0 bottom-0 left-3.5 sm:left-5 lg:left-7 w-4 z-0"
              >
                <svg
                  className="w-full h-full overflow-visible"
                  viewBox="0 0 16 1000"
                  preserveAspectRatio="none"
                >
                  <defs>
                    <linearGradient
                      id="verticalStoryBeamGrad"
                      x1="0%"
                      y1="0%"
                      x2="0%"
                      y2="100%"
                    >
                      <stop offset="0%" stopColor="#22d3ee" />
                      <stop offset="35%" stopColor="#34d399" />
                      <stop offset="70%" stopColor="#fbbf24" />
                      <stop offset="100%" stopColor="#c084fc" />
                    </linearGradient>
                  </defs>

                  {/* Base Unlit Dashed Vertical Track */}
                  <line
                    x1="8"
                    y1="0"
                    x2="8"
                    y2="1000"
                    stroke="rgba(255, 255, 255, 0.14)"
                    strokeWidth="2"
                    strokeDasharray="6 6"
                    vectorEffect="non-scaling-stroke"
                  />

                  {/* Scroll-Scrubbed Illuminated Vertical Beam */}
                  <path
                    ref={verticalBeamRef}
                    d="M 8 0 L 8 1000"
                    fill="none"
                    stroke="url(#verticalStoryBeamGrad)"
                    strokeWidth="3.5"
                    strokeLinecap="square"
                    vectorEffect="non-scaling-stroke"
                  />
                </svg>
              </div>

              <div className="space-y-14 lg:space-y-20">
                {/* -------------------------------------------------------------
                    CHAPTER 01: PLAIN-ENGLISH IDEA INTAKE
                   ------------------------------------------------------------- */}
                <div
                  id="chapter-01"
                  data-chapter-block
                  className="relative pl-11 sm:pl-14 lg:pl-20 scroll-mt-20"
                >
                  {/* Chapter Milestone Node on the Vertical Beam */}
                  <div
                    className={`absolute left-0 sm:left-1.5 lg:left-3.5 top-1 w-7 h-7 flex items-center justify-center font-mono text-xs font-bold border rounded-none transition-all duration-300 z-10 ${
                      activeChapter >= 0
                        ? 'bg-cyan-400 text-black border-cyan-300 scale-110 shadow-[0_0_18px_rgba(34,211,238,0.65)]'
                        : 'bg-[#0b0b0e] text-zinc-400 border-white/25'
                    }`}
                  >
                    01
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-start">
                    {/* Left Narrative Column */}
                    <div className="lg:col-span-5 space-y-4">
                      <div className="inline-flex items-center space-x-2 text-xs font-mono uppercase tracking-widest text-cyan-400">
                        <span>Chapter 01</span>
                        <span>·</span>
                        <span>Plain-English Idea Intake</span>
                      </div>

                      <h2 className="text-2xl sm:text-3xl font-bold text-white leading-tight">
                        Describe Your Idea in Two Everyday Sentences
                      </h2>

                      <p className="text-sm sm:text-base text-zinc-300 leading-relaxed">
                        You do not need to know technical buzzwords or write a
                        20-page document. Simply write what your product does
                        and who it helps—the same way you would explain it to a
                        friend over coffee.
                      </p>

                      <div className="space-y-2.5 pt-2">
                        <div className="flex items-start space-x-2.5 text-xs sm:text-sm text-zinc-300">
                          <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                          <span>
                            Automatically identifies your primary users and what
                            they want to accomplish
                          </span>
                        </div>
                        <div className="flex items-start space-x-2.5 text-xs sm:text-sm text-zinc-300">
                          <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                          <span>
                            Translates rough thoughts into a clean list of
                            screens to build first
                          </span>
                        </div>
                        <div className="flex items-start space-x-2.5 text-xs sm:text-sm text-zinc-300">
                          <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                          <span>
                            Cuts out feature bloat so you can launch version one
                            in two weeks
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right Interactive Visual Card */}
                    <div className="lg:col-span-7">
                      <TiltSpotlightCard
                        glowColor="rgba(34, 211, 238, 0.16)"
                        activeBorderColor="rgba(34, 211, 238, 0.45)"
                        className="bg-[#0b0b0e] border border-white/10 p-5 sm:p-7 rounded-none"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-800">
                          <div className="flex items-center space-x-2 text-xs font-mono uppercase tracking-wider text-cyan-400">
                            <Layout className="w-4 h-4" />
                            <span>Interactive Idea Parser</span>
                          </div>

                          {/* Scenario Switcher */}
                          <div className="flex flex-wrap gap-1.5">
                            {IDEA_SCENARIOS.map((scen, idx) => (
                              <button
                                key={scen.id}
                                type="button"
                                onClick={() => setSelectedIdeaIndex(idx)}
                                className={`px-2.5 py-1 text-[11px] font-mono uppercase tracking-wider border rounded-none transition-colors cursor-pointer ${
                                  selectedIdeaIndex === idx
                                    ? 'bg-cyan-400 text-black border-cyan-300 font-bold'
                                    : 'bg-[#121216] text-zinc-400 border-white/10 hover:text-white'
                                }`}
                              >
                                {scen.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* What You Type */}
                        <div className="mt-4">
                          <div className="text-[11px] font-mono uppercase tracking-widest text-zinc-400 mb-2">
                            What You Type (Plain English):
                          </div>
                          <div className="p-4 bg-black border border-cyan-500/35 text-xs sm:text-sm text-zinc-100 leading-relaxed font-mono">
                            &ldquo;{currentIdea.sentence}&rdquo;
                          </div>
                        </div>

                        {/* Parsed Output Grid */}
                        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="p-4 bg-[#111115] border border-white/10">
                            <div className="text-[11px] font-mono uppercase tracking-wider text-cyan-400 mb-2.5">
                              1. Core User Goals Identified
                            </div>
                            <ul className="space-y-2 text-xs text-zinc-300">
                              {currentIdea.goals.map((goal, i) => (
                                <li
                                  key={i}
                                  className="flex items-start space-x-2 leading-relaxed"
                                >
                                  <span className="text-cyan-400 font-mono font-bold">
                                    0{i + 1}
                                  </span>
                                  <span>{goal}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div className="p-4 bg-[#111115] border border-white/10">
                            <div className="text-[11px] font-mono uppercase tracking-wider text-cyan-400 mb-2.5">
                              2. Main Screens Mapped Out
                            </div>
                            <div className="space-y-2.5">
                              {currentIdea.screens.map((scr, i) => (
                                <div
                                  key={i}
                                  className="p-2.5 bg-black border border-zinc-800"
                                >
                                  <div className="text-xs font-bold text-white">
                                    {scr.name}
                                  </div>
                                  <div className="text-[11px] text-zinc-400 mt-0.5">
                                    {scr.detail}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </TiltSpotlightCard>
                    </div>
                  </div>
                </div>

                {/* -------------------------------------------------------------
                    CHAPTER 02: AUTOMATED COMPETITOR & REFERENCE SCANNING
                   ------------------------------------------------------------- */}
                <div
                  id="chapter-02"
                  data-chapter-block
                  className="relative pl-11 sm:pl-14 lg:pl-20 scroll-mt-20"
                >
                  {/* Chapter Milestone Node on the Vertical Beam */}
                  <div
                    className={`absolute left-0 sm:left-1.5 lg:left-3.5 top-1 w-7 h-7 flex items-center justify-center font-mono text-xs font-bold border rounded-none transition-all duration-300 z-10 ${
                      activeChapter >= 1
                        ? 'bg-emerald-400 text-black border-emerald-300 scale-110 shadow-[0_0_18px_rgba(52,211,153,0.65)]'
                        : 'bg-[#0b0b0e] text-zinc-400 border-white/25'
                    }`}
                  >
                    02
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-start">
                    {/* Left Narrative Column */}
                    <div className="lg:col-span-5 space-y-4">
                      <div className="inline-flex items-center space-x-2 text-xs font-mono uppercase tracking-widest text-emerald-400">
                        <span>Chapter 02</span>
                        <span>·</span>
                        <span>Automated Competitor Scanning</span>
                      </div>

                      <h2 className="text-2xl sm:text-3xl font-bold text-white leading-tight">
                        Paste Any Website Link to Learn What Already Works
                      </h2>

                      <p className="text-sm sm:text-base text-zinc-300 leading-relaxed">
                        Have an existing product or competitor you admire? Paste
                        their website link. Quzar Ship automatically inspects
                        their public pages, navigation menus, and feature layout
                        so you never have to start from a blank page.
                      </p>

                      <div className="space-y-2.5 pt-2">
                        <div className="flex items-start space-x-2.5 text-xs sm:text-sm text-zinc-300">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <span>
                            Scans live navigation links and page headings
                            automatically
                          </span>
                        </div>
                        <div className="flex items-start space-x-2.5 text-xs sm:text-sm text-zinc-300">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <span>
                            Highlights proven checkout, booking, or onboarding
                            patterns users expect
                          </span>
                        </div>
                        <div className="flex items-start space-x-2.5 text-xs sm:text-sm text-zinc-300">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <span>
                            Spots clear ways to make your product simpler and
                            faster than the competition
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right Interactive Visual Card */}
                    <div className="lg:col-span-7">
                      <TiltSpotlightCard
                        glowColor="rgba(52, 211, 153, 0.15)"
                        activeBorderColor="rgba(52, 211, 153, 0.45)"
                        className="bg-[#0b0b0e] border border-white/10 p-5 sm:p-7 rounded-none"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-800">
                          <div className="flex items-center space-x-2 text-xs font-mono uppercase tracking-wider text-emerald-400">
                            <Globe className="w-4 h-4" />
                            <span>Live Reference URL Scanner</span>
                          </div>

                          <div className="flex flex-wrap gap-1.5">
                            {REFERENCE_SITES.map((site, idx) => (
                              <button
                                key={site.id}
                                type="button"
                                onClick={() => setSelectedRefIndex(idx)}
                                className={`px-2.5 py-1 text-[11px] font-mono uppercase tracking-wider border rounded-none transition-colors cursor-pointer ${
                                  selectedRefIndex === idx
                                    ? 'bg-emerald-400 text-black border-emerald-300 font-bold'
                                    : 'bg-[#121216] text-zinc-400 border-white/10 hover:text-white'
                                }`}
                              >
                                Reference 0{idx + 1}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Simulated URL Bar */}
                        <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3.5 bg-black border border-emerald-500/35 font-mono text-xs">
                          <div className="flex items-center space-x-2 text-emerald-300 truncate">
                            <span className="px-1.5 py-0.5 bg-emerald-500/20 text-emerald-300 text-[10px] uppercase">
                              SCANNED URL
                            </span>
                            <span className="truncate">{currentRefSite.url}</span>
                          </div>
                          <span className="text-[11px] text-zinc-400 shrink-0">
                            {currentRefSite.category}
                          </span>
                        </div>

                        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {/* Navigation & Page Structure */}
                          <div className="p-4 bg-[#111115] border border-white/10">
                            <div className="text-[11px] font-mono uppercase tracking-wider text-emerald-400 mb-2.5">
                              Navigation & Pages Detected
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {currentRefSite.navExtracted.map((navItem, i) => (
                                <span
                                  key={i}
                                  className="px-2.5 py-1.5 bg-black border border-zinc-800 text-xs text-zinc-200 font-mono"
                                >
                                  {navItem}
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Feature Patterns */}
                          <div className="p-4 bg-[#111115] border border-white/10">
                            <div className="text-[11px] font-mono uppercase tracking-wider text-emerald-400 mb-2.5">
                              Feature Patterns Extracted
                            </div>
                            <ul className="space-y-2 text-xs text-zinc-300">
                              {currentRefSite.featurePatterns.map((pat, i) => (
                                <li
                                  key={i}
                                  className="flex items-start space-x-2 leading-relaxed"
                                >
                                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                                  <span>{pat}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        {/* How Your Blueprint Improves Upon It */}
                        <div className="mt-4 p-3.5 bg-emerald-950/20 border border-emerald-500/30 text-xs text-zinc-200 flex items-start space-x-3">
                          <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-mono uppercase text-emerald-400 font-bold mr-2">
                              Your Advantage:
                            </span>
                            <span>{currentRefSite.opportunity}</span>
                          </div>
                        </div>
                      </TiltSpotlightCard>
                    </div>
                  </div>
                </div>

                {/* -------------------------------------------------------------
                    CHAPTER 03: BEHIND-THE-SCENES ARCHITECTURE SELECTION
                   ------------------------------------------------------------- */}
                <div
                  id="chapter-03"
                  data-chapter-block
                  className="relative pl-11 sm:pl-14 lg:pl-20 scroll-mt-20"
                >
                  {/* Chapter Milestone Node on the Vertical Beam */}
                  <div
                    className={`absolute left-0 sm:left-1.5 lg:left-3.5 top-1 w-7 h-7 flex items-center justify-center font-mono text-xs font-bold border rounded-none transition-all duration-300 z-10 ${
                      activeChapter >= 2
                        ? 'bg-amber-400 text-black border-amber-300 scale-110 shadow-[0_0_18px_rgba(251,191,36,0.65)]'
                        : 'bg-[#0b0b0e] text-zinc-400 border-white/25'
                    }`}
                  >
                    03
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-start">
                    {/* Left Narrative Column */}
                    <div className="lg:col-span-5 space-y-4">
                      <div className="inline-flex items-center space-x-2 text-xs font-mono uppercase tracking-widest text-amber-400">
                        <span>Chapter 03</span>
                        <span>·</span>
                        <span>Behind-the-Scenes System Selection</span>
                      </div>

                      <h2 className="text-2xl sm:text-3xl font-bold text-white leading-tight">
                        We Pick the Right Database, Sign-In, and $0 Starter
                        Hosting
                      </h2>

                      <p className="text-sm sm:text-base text-zinc-300 leading-relaxed">
                        Founders often lose weeks debating which database, login
                        tool, or cloud server to rent. Quzar Ship selects a
                        proven, modern setup tailored to your exact product—so
                        you never have to guess or overpay.
                      </p>

                      <div className="space-y-2.5 pt-2">
                        <div className="flex items-start space-x-2.5 text-xs sm:text-sm text-zinc-300">
                          <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                          <span>
                            Picks reliable user sign-in and account security out
                            of the box
                          </span>
                        </div>
                        <div className="flex items-start space-x-2.5 text-xs sm:text-sm text-zinc-300">
                          <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                          <span>
                            Designs every database table your app needs to store
                            data safely
                          </span>
                        </div>
                        <div className="flex items-start space-x-2.5 text-xs sm:text-sm text-zinc-300">
                          <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                          <span>
                            Starts on $0/month free cloud tiers for your first
                            1,000 users
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right Interactive Visual Card */}
                    <div className="lg:col-span-7">
                      <TiltSpotlightCard
                        glowColor="rgba(251, 191, 36, 0.15)"
                        activeBorderColor="rgba(251, 191, 36, 0.45)"
                        className="bg-[#0b0b0e] border border-white/10 p-5 sm:p-7 rounded-none"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-800">
                          <div className="flex items-center space-x-2 text-xs font-mono uppercase tracking-wider text-amber-400">
                            <Cpu className="w-4 h-4" />
                            <span>Auto-Selected System Stack</span>
                          </div>

                          <div className="flex gap-1.5">
                            <button
                              type="button"
                              onClick={() => setArchViewMode('plain')}
                              className={`px-2.5 py-1 text-[11px] font-mono uppercase tracking-wider border rounded-none transition-colors cursor-pointer ${
                                archViewMode === 'plain'
                                  ? 'bg-amber-400 text-black border-amber-300 font-bold'
                                  : 'bg-[#121216] text-zinc-400 border-white/10 hover:text-white'
                              }`}
                            >
                              What Is Selected
                            </button>
                            <button
                              type="button"
                              onClick={() => setArchViewMode('savings')}
                              className={`px-2.5 py-1 text-[11px] font-mono uppercase tracking-wider border rounded-none transition-colors cursor-pointer ${
                                archViewMode === 'savings'
                                  ? 'bg-amber-400 text-black border-amber-300 font-bold'
                                  : 'bg-[#121216] text-zinc-400 border-white/10 hover:text-white'
                              }`}
                            >
                              Hosting Cost Breakdown
                            </button>
                          </div>
                        </div>

                        {archViewMode === 'plain' ? (
                          <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                            <div className="p-4 bg-[#111115] border border-white/10 flex flex-col justify-between">
                              <div>
                                <div className="text-[10px] font-mono uppercase tracking-widest text-amber-400">
                                  01 · User Sign-In
                                </div>
                                <div className="text-sm font-bold text-white mt-1.5">
                                  Magic Links & Google Login
                                </div>
                                <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                                  Users sign in with one click—no forgotten
                                  passwords, with role permissions for customers
                                  and admins.
                                </p>
                              </div>
                              <div className="mt-4 pt-2.5 border-t border-zinc-800 text-[11px] font-mono text-emerald-400 flex items-center space-x-1.5">
                                <Check className="w-3.5 h-3.5 shrink-0" />
                                <span>Pre-configured security</span>
                              </div>
                            </div>

                            <div className="p-4 bg-[#111115] border border-white/10 flex flex-col justify-between">
                              <div>
                                <div className="text-[10px] font-mono uppercase tracking-widest text-amber-400">
                                  02 · Database & Files
                                </div>
                                <div className="text-sm font-bold text-white mt-1.5">
                                  Managed Postgres + Storage
                                </div>
                                <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                                  Stores user profiles, bookings, payments, and
                                  uploaded photos with automatic daily backups.
                                </p>
                              </div>
                              <div className="mt-4 pt-2.5 border-t border-zinc-800 text-[11px] font-mono text-emerald-400 flex items-center space-x-1.5">
                                <Check className="w-3.5 h-3.5 shrink-0" />
                                <span>Ready-to-run tables</span>
                              </div>
                            </div>

                            <div className="p-4 bg-[#111115] border border-white/10 flex flex-col justify-between">
                              <div>
                                <div className="text-[10px] font-mono uppercase tracking-widest text-amber-400">
                                  03 · Cloud Hosting
                                </div>
                                <div className="text-sm font-bold text-white mt-1.5">
                                  $0 Starter Cloud Tier
                                </div>
                                <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                                  Deploys globally with zero monthly server bills
                                  while you validate your product with early
                                  customers.
                                </p>
                              </div>
                              <div className="mt-4 pt-2.5 border-t border-zinc-800 text-[11px] font-mono text-emerald-400 flex items-center space-x-1.5">
                                <Check className="w-3.5 h-3.5 shrink-0" />
                                <span>$0/mo up to 1,000 users</span>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="mt-5 space-y-3">
                            <div className="p-4 bg-black border border-amber-500/35 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                              <div>
                                <div className="text-xs font-mono uppercase text-amber-400">
                                  Launch Stage (0 to 1,000 Active Users)
                                </div>
                                <div className="text-xs text-zinc-300 mt-0.5">
                                  Web hosting, database, sign-in, and image
                                  storage on generous free tiers
                                </div>
                              </div>
                              <div className="text-lg font-mono font-extrabold text-emerald-400 shrink-0">
                                $0 / month
                              </div>
                            </div>

                            <div className="p-4 bg-[#111115] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                              <div>
                                <div className="text-xs font-mono uppercase text-zinc-300">
                                  Growth Stage (1,000 to 10,000 Active Users)
                                </div>
                                <div className="text-xs text-zinc-400 mt-0.5">
                                  Upgraded database backups, custom email
                                  domain, and higher bandwidth
                                </div>
                              </div>
                              <div className="text-base font-mono font-bold text-white shrink-0">
                                $20 – $45 / month
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="mt-4 p-3.5 bg-[#111115] border border-zinc-800 flex items-center justify-between text-xs">
                          <span className="text-zinc-300 flex items-center space-x-2">
                            <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
                            <span>
                              No DevOps or server maintenance required—everything
                              runs on managed cloud platforms.
                            </span>
                          </span>
                        </div>
                      </TiltSpotlightCard>
                    </div>
                  </div>
                </div>

                {/* -------------------------------------------------------------
                    CHAPTER 04: THE 14-DAY EXECUTION CHECKLIST & ONE-CLICK EXPORT
                   ------------------------------------------------------------- */}
                <div
                  id="chapter-04"
                  data-chapter-block
                  className="relative pl-11 sm:pl-14 lg:pl-20 scroll-mt-20"
                >
                  {/* Chapter Milestone Node on the Vertical Beam */}
                  <div
                    className={`absolute left-0 sm:left-1.5 lg:left-3.5 top-1 w-7 h-7 flex items-center justify-center font-mono text-xs font-bold border rounded-none transition-all duration-300 z-10 ${
                      activeChapter >= 3
                        ? 'bg-purple-400 text-black border-purple-300 scale-110 shadow-[0_0_18px_rgba(192,132,252,0.65)]'
                        : 'bg-[#0b0b0e] text-zinc-400 border-white/25'
                    }`}
                  >
                    04
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-start">
                    {/* Left Narrative Column */}
                    <div className="lg:col-span-5 space-y-4">
                      <div className="inline-flex items-center space-x-2 text-xs font-mono uppercase tracking-widest text-purple-400">
                        <span>Chapter 04</span>
                        <span>·</span>
                        <span>14-Day Checklist & One-Click Export</span>
                      </div>

                      <h2 className="text-2xl sm:text-3xl font-bold text-white leading-tight">
                        Follow a Day-by-Day Launch Plan & Export Your Files
                      </h2>

                      <p className="text-sm sm:text-base text-zinc-300 leading-relaxed">
                        Instead of wondering what to build first, you get a
                        focused 14-day schedule broken into clear daily goals.
                        When you are ready, export your entire blueprint in one
                        click to build it yourself, hand it to a developer, or
                        drop it into an AI coding tool.
                      </p>

                      <div className="space-y-2.5 pt-2">
                        <div className="flex items-start space-x-2.5 text-xs sm:text-sm text-zinc-300">
                          <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                          <span>
                            Day 1 to Day 14 checklist keeps your launch on track
                          </span>
                        </div>
                        <div className="flex items-start space-x-2.5 text-xs sm:text-sm text-zinc-300">
                          <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                          <span>
                            Downloadable{' '}
                            <code className="text-zinc-100 font-mono">
                              PRD.md
                            </code>
                            ,{' '}
                            <code className="text-zinc-100 font-mono">
                              ARCHITECTURE.md
                            </code>
                            , and{' '}
                            <code className="text-zinc-100 font-mono">
                              schema.prisma
                            </code>
                          </span>
                        </div>
                        <div className="flex items-start space-x-2.5 text-xs sm:text-sm text-zinc-300">
                          <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                          <span>
                            Works seamlessly with Cursor, Claude Code, or Quzar
                            Studio engineers
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right Interactive Visual Card */}
                    <div className="lg:col-span-7">
                      <TiltSpotlightCard
                        glowColor="rgba(192, 132, 252, 0.16)"
                        activeBorderColor="rgba(192, 132, 252, 0.45)"
                        className="bg-[#0b0b0e] border border-white/10 p-5 sm:p-7 rounded-none"
                      >
                        {/* Part A: 14-Day Execution Checklist Interactive Preview */}
                        <div className="pb-4 border-b border-zinc-800">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                            <div className="flex items-center space-x-2 text-xs font-mono uppercase tracking-wider text-purple-400">
                              <Calendar className="w-4 h-4" />
                              <span>14-Day Daily Launch Checklist</span>
                            </div>
                            <span className="text-[11px] font-mono text-zinc-400">
                              Click any phase or task to preview
                            </span>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                            {SPRINT_PHASES.map((phase, idx) => (
                              <button
                                key={phase.id}
                                type="button"
                                onClick={() => setSelectedPhaseIndex(idx)}
                                className={`p-2 text-left border rounded-none transition-colors cursor-pointer ${
                                  selectedPhaseIndex === idx
                                    ? 'bg-purple-400 text-black border-purple-300 font-bold'
                                    : 'bg-[#121216] text-zinc-300 border-white/10 hover:border-white/30'
                                }`}
                              >
                                <div className="text-[10px] font-mono uppercase">
                                  {phase.days}
                                </div>
                                <div className="text-xs truncate mt-0.5">
                                  Phase 0{idx + 1}
                                </div>
                              </button>
                            ))}
                          </div>

                          <div className="mt-3 p-4 bg-[#111115] border border-white/10">
                            <div className="flex items-center justify-between">
                              <div className="text-xs font-bold text-white">
                                {currentPhase.days}: {currentPhase.title}
                              </div>
                            </div>
                            <p className="text-xs text-zinc-400 mt-1">
                              {currentPhase.summary}
                            </p>

                            <div className="mt-3 space-y-2">
                              {currentPhase.tasks.map((item) => {
                                const isDone = !!completedTasks[item.day];
                                return (
                                  <button
                                    key={item.day}
                                    type="button"
                                    onClick={() => toggleTask(item.day)}
                                    className="w-full text-left p-2.5 bg-black border border-zinc-800 hover:border-purple-400/50 flex items-center justify-between gap-3 transition-colors cursor-pointer rounded-none"
                                  >
                                    <div className="flex items-center space-x-3">
                                      <span
                                        className={`w-4 h-4 flex items-center justify-center border text-[10px] font-mono ${
                                          isDone
                                            ? 'bg-emerald-400 text-black border-emerald-300 font-bold'
                                            : 'border-zinc-600 text-transparent'
                                        }`}
                                      >
                                        <Check className="w-3 h-3" />
                                      </span>
                                      <span className="text-[11px] font-mono text-purple-300 shrink-0">
                                        {item.day}
                                      </span>
                                      <span
                                        className={`text-xs ${
                                          isDone
                                            ? 'text-zinc-400 line-through'
                                            : 'text-zinc-200'
                                        }`}
                                      >
                                        {item.task}
                                      </span>
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </div>

                        {/* Part B: One-Click Exportable Files Preview */}
                        <div className="mt-5">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                            <div className="flex items-center space-x-2 text-xs font-mono uppercase tracking-wider text-cyan-400">
                              <Download className="w-4 h-4" />
                              <span>One-Click Export Package</span>
                            </div>

                            <div className="flex flex-wrap gap-1.5">
                              {EXPORT_FILES.map((file, idx) => (
                                <button
                                  key={file.filename}
                                  type="button"
                                  onClick={() => setSelectedExportIndex(idx)}
                                  className={`px-2.5 py-1 text-[11px] font-mono border rounded-none transition-colors cursor-pointer flex items-center space-x-1.5 ${
                                    selectedExportIndex === idx
                                      ? 'bg-white text-black border-white font-bold'
                                      : 'bg-[#121216] text-zinc-300 border-white/10 hover:text-white'
                                  }`}
                                >
                                  <FileCode className="w-3 h-3" />
                                  <span>{file.filename}</span>
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="p-4 bg-black border border-white/15">
                            <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-zinc-800">
                              <div className="flex items-center space-x-2">
                                <span className="text-xs font-mono font-bold text-white">
                                  {currentExport.filename}
                                </span>
                                <span
                                  className={`px-2 py-0.5 text-[10px] font-mono uppercase border ${currentExport.color}`}
                                >
                                  {currentExport.badge}
                                </span>
                              </div>
                              <span className="text-[11px] font-mono text-zinc-500">
                                UTF-8 · Ready to Download
                              </span>
                            </div>
                            <p className="text-xs text-zinc-400 mb-3">
                              {currentExport.description}
                            </p>
                            <pre className="p-3 bg-[#08080b] border border-zinc-800 text-[11px] font-mono text-zinc-200 overflow-x-auto leading-relaxed">
                              {currentExport.snippet}
                            </pre>
                          </div>
                        </div>
                      </TiltSpotlightCard>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===================================================================
            3. FAQ / COMMON QUESTIONS SECTION
           =================================================================== */}
        <section
          data-faq-section
          className="py-14 lg:py-20 bg-[#000000] border-b border-white/10"
        >
          <div className="w-full px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mb-10">
              <div className="inline-flex items-center space-x-2 text-xs font-mono uppercase tracking-widest text-cyan-400">
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Common Questions</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-white mt-2 tracking-tight">
                Everything You Need to Know Before Starting
              </h2>
              <p className="text-sm sm:text-base text-zinc-400 mt-2 leading-relaxed">
                Straightforward answers about how Quzar Ship works, what you
                receive, and how you can turn your blueprint into a live
                product.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {FAQ_ITEMS.map((item, idx) => {
                const isSelected = activeFaqIndex === idx;
                return (
                  <div
                    key={item.number}
                    data-faq-card
                    onClick={() => setActiveFaqIndex(idx)}
                    className={`p-6 sm:p-7 bg-[#0b0b0e] border rounded-none transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'border-cyan-400/60 shadow-[0_0_25px_rgba(34,211,238,0.1)]'
                        : 'border-white/10 hover:border-white/30'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs font-mono text-cyan-400 mb-3">
                        <span>QUESTION {item.number}</span>
                        <span className="px-2 py-0.5 bg-cyan-500/10 border border-cyan-500/30 text-[10px] uppercase">
                          PLAIN-ENGLISH ANSWER
                        </span>
                      </div>
                      <h3 className="text-lg sm:text-xl font-bold text-white leading-snug">
                        {item.question}
                      </h3>
                      <p className="text-xs sm:text-sm text-zinc-300 mt-3 leading-relaxed">
                        {item.answer}
                      </p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-zinc-800/90 flex items-center space-x-2 text-xs font-mono text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      <span>{item.highlight}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ===================================================================
            4. BOTTOM CALL TO ACTION
           =================================================================== */}
        <section className="py-14 bg-[#08080b]">
          <div className="w-full px-4 sm:px-6 lg:px-8">
            <div className="bg-[#111115] border border-white/15 p-6 sm:p-10 rounded-none flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
              <div className="max-w-2xl">
                <div className="inline-flex items-center space-x-2 text-xs font-mono uppercase tracking-widest text-cyan-400 mb-2">
                  <Layers className="w-3.5 h-3.5" />
                  <span>Ready in 60 Seconds</span>
                </div>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
                  Turn Your Idea Into an Actionable Blueprint Today
                </h2>
                <p className="text-sm sm:text-base text-zinc-300 mt-2.5 leading-relaxed">
                  Open the interactive studio to generate your own product plan,
                  or browse real sample blueprints to see the exact screens,
                  databases, and 14-day checklists Quzar Ship creates.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 w-full lg:w-auto shrink-0">
                <Link
                  ref={primaryCtaRef}
                  href="/tool"
                  className="inline-flex items-center justify-center space-x-2.5 px-7 py-4 bg-white text-black hover:bg-cyan-400 font-mono text-xs sm:text-sm font-bold uppercase tracking-widest transition-colors rounded-none will-change-transform"
                >
                  <span>USE TOOL</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  ref={secondaryCtaRef}
                  href="/examples"
                  className="inline-flex items-center justify-center space-x-2.5 px-7 py-4 bg-[#18181c] text-white hover:bg-zinc-800 border border-white/20 hover:border-white/40 font-mono text-xs sm:text-sm font-bold uppercase tracking-widest transition-colors rounded-none will-change-transform"
                >
                  <span>EXPLORE EXAMPLES</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Global Footer */}
      <footer className="w-full border-t border-zinc-800 bg-black text-xs font-mono text-zinc-500 py-6">
        <div className="w-full px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <span className="text-white font-bold tracking-wider">
              QUZAR SHIP
            </span>
            <span>·</span>
            <span>Built by</span>
            <a
              href="https://piyushratan.in"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 hover:text-cyan-300 font-medium hover:underline"
            >
              Piyush Ratan
            </a>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-[11px]">
            <Link
              href="/how-it-works"
              className="text-white hover:text-cyan-400 uppercase tracking-wider"
            >
              How It Works
            </Link>
            <Link
              href="/capabilities"
              className="hover:text-zinc-300 uppercase tracking-wider"
            >
              What You Get
            </Link>
            <Link
              href="/examples"
              className="hover:text-zinc-300 uppercase tracking-wider"
            >
              Examples
            </Link>
            <Link
              href="/tool"
              className="hover:text-zinc-300 uppercase tracking-wider"
            >
              Use Tool
            </Link>
            <a
              href="https://quzar-io.web.app"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-zinc-300 uppercase tracking-wider inline-flex items-center space-x-1"
            >
              <span>Quzar Studio</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}



import { useState, useCallback } from "react";
import {
  LayoutDashboard, BookOpen, Users, BarChart2, Settings,
  PlusCircle, ChevronRight, Bell, Search, LogOut,
  TrendingUp, Clock, CheckCircle2, AlertCircle, Star,
  Play, FileText, Upload, Eye, Edit2,
  CalendarDays, MessageSquare, UserPlus, Video,
  Sun, Moon, ChevronDown,
} from "lucide-react";

//TYPES 
interface Course {
  id: string; title: string; module_count: number; enrolled: number;
  status: "published" | "draft" | "archived"; completion_rate: number;
  last_updated: string; category: string;
}
interface Student {
  id: string; name: string; avatar: string; course: string;
  progress: number; last_active: string;
  status: "active" | "at_risk" | "completed"; assignments_due: number;
}
interface Assignment {
  id: string; title: string; course: string; submissions: number;
  total_students: number; due_date: string; status: "open" | "closed" | "grading";
}
interface StatCard {
  label: string; value: string | number; delta?: string;
  positive?: boolean; icon?: React.ReactNode;
}
interface Session {
  id: string; title: string; course: string;
  date: string; time: string; enrolled: number;
}

//STATIC DATA
const EDUCATOR = {
  name: "Maxwell Kamau", role: "Lead Educator",
  email: "maxwell@brailleed.org",
};

const STATS: StatCard[] = [
  { label: "Total Students",  value: 142, },
  { label: "Active Courses",  value: 6,   },
  { label: "Avg. Completion", value: "74%", },
  { label: "Pending Reviews", value: 18,     },
];

const COURSES: Course[] = [
  { id: "c1", title: "Introduction to Coding with BrailleEd", module_count: 8,  enrolled: 45, status: "published", completion_rate: 82, last_updated: "2 days ago",  category: "Beginner"     },
  { id: "c2", title: "Robotics Fundamentals",                  module_count: 12, enrolled: 38, status: "published", completion_rate: 61, last_updated: "1 week ago",  category: "Intermediate" },
  { id: "c3", title: "Voice Programming Essentials",           module_count: 6,  enrolled: 29, status: "published", completion_rate: 90, last_updated: "3 days ago",  category: "Beginner"     },
  { id: "c4", title: "Sensor Integration & Feedback",          module_count: 10, enrolled: 22, status: "draft",     completion_rate: 0,  last_updated: "Today",       category: "Advanced"     },
  { id: "c5", title: "Accessible STEM Projects",               module_count: 7,  enrolled: 8,  status: "published", completion_rate: 45, last_updated: "5 days ago",  category: "Intermediate" },
  { id: "c6", title: "Block-Based Logic for Beginners",        module_count: 5,  enrolled: 0,  status: "draft",     completion_rate: 0,  last_updated: "Just now",    category: "Beginner"     },
];

const STUDENTS: Student[] = [
  { id: "s1", name: "Amina Osei",      avatar: "A", course: "Introduction to Coding",  progress: 92,  last_active: "Today",      status: "active",    assignments_due: 0 },
  { id: "s2", name: "Brian Otieno",    avatar: "B", course: "Robotics Fundamentals",    progress: 34,  last_active: "5 days ago", status: "at_risk",   assignments_due: 3 },
  { id: "s3", name: "Cynthia Mwangi",  avatar: "C", course: "Voice Programming",        progress: 100, last_active: "Yesterday",  status: "completed", assignments_due: 0 },
  { id: "s4", name: "Daniel Kipchoge", avatar: "D", course: "Introduction to Coding",   progress: 67,  last_active: "Today",      status: "active",    assignments_due: 1 },
  { id: "s5", name: "Esther Wambui",   avatar: "E", course: "Accessible STEM Projects", progress: 22,  last_active: "8 days ago", status: "at_risk",   assignments_due: 4 },
  { id: "s6", name: "Felix Ochieng",   avatar: "F", course: "Robotics Fundamentals",    progress: 78,  last_active: "Today",      status: "active",    assignments_due: 1 },
];

const ASSIGNMENTS: Assignment[] = [
  { id: "a1", title: "Build Your First Loop",       course: "Introduction to Coding",   submissions: 38, total_students: 45, due_date: "May 20, 2026", status: "open"    },
  { id: "a2", title: "Sensor Reading Exercise",      course: "Robotics Fundamentals",    submissions: 12, total_students: 38, due_date: "May 18, 2026", status: "grading" },
  { id: "a3", title: "Voice Command Sequence",       course: "Voice Programming",        submissions: 29, total_students: 29, due_date: "May 15, 2026", status: "closed"  },
  { id: "a4", title: "Accessible Project Proposal", course: "Accessible STEM Projects", submissions: 5,  total_students: 8,  due_date: "May 22, 2026", status: "open"    },
];

const SESSIONS: Session[] = [
  { id: "ss1", title: "Live Q&A: Robotics Module 4", course: "Robotics Fundamentals",  date: "May 20", time: "10:00 AM", enrolled: 31 },
  { id: "ss2", title: "Intro Coding — Office Hours", course: "Introduction to Coding", date: "May 21", time: "2:00 PM",  enrolled: 18 },
  { id: "ss3", title: "Advanced Sensor Workshop",    course: "Sensor Integration",     date: "May 24", time: "11:00 AM", enrolled: 14 },
];

// THEME
const LIGHT = {
  page:      "bg-gray-50",
  nav:       "bg-white border-gray-200",
  card:      "bg-white border-gray-200",
  input:     "bg-gray-50 border-gray-300 text-gray-800 placeholder-gray-400 focus:border-blue-500 focus:bg-white",
  text:      "text-gray-900",
  textMuted: "text-gray-500",
  textDim:   "text-gray-400",
  border:    "border-gray-100",
  divider:   "divide-gray-100",
  rowHover:  "hover:bg-gray-50",
  th:        "text-blue-600",
  progBg:    "bg-gray-200",
  miniCard:  "bg-gray-50",
  
  status: {
    published: "text-green-600",
    draft:     "text-gray-400",
    archived:  "text-orange-500",
    active:    "text-green-600",
    at_risk:   "text-red-500",
    completed: "text-blue-600",
    open:      "text-blue-600",
    grading:   "text-amber-600",
    closed:    "text-gray-400",
  },
};

const DARK = {
  page:      "bg-slate-950",
  nav:       "bg-slate-900 border-slate-800",
  card:      "bg-slate-900 border-slate-800",
  input:     "bg-slate-800 border-slate-700 text-slate-200 placeholder-slate-500 focus:border-blue-500",
  text:      "text-slate-100",
  textMuted: "text-slate-400",
  textDim:   "text-slate-600",
  border:    "border-slate-800",
  divider:   "divide-slate-800",
  rowHover:  "hover:bg-slate-800/50",
  th:        "text-blue-400",
  progBg:    "bg-slate-700",
  miniCard:  "bg-slate-800",
  status: {
    published: "text-green-400",
    draft:     "text-slate-500",
    archived:  "text-orange-400",
    active:    "text-green-400",
    at_risk:   "text-red-400",
    completed: "text-blue-400",
    open:      "text-blue-400",
    grading:   "text-amber-400",
    closed:    "text-slate-500",
  },
};

type Theme = typeof LIGHT;

//HELPERS
function Avatar({ name, size = "md" }: { name: string; size?: "sm" | "md" | "lg" }) {
  const sz   = { sm: "w-8 h-8 text-xs", md: "w-9 h-9 text-sm", lg: "w-11 h-11 text-base" };
  const cols = ["bg-blue-500","bg-violet-500","bg-emerald-500","bg-amber-500","bg-rose-500","bg-cyan-500"];
  return (
    <div className={`${sz[size]} ${cols[name.charCodeAt(0) % cols.length]} rounded-full flex items-center justify-center font-bold text-white flex-shrink-0 uppercase`}>
      {name[0]}
    </div>
  );
}

function ProgressBar({ value, color = "bg-blue-600", bg }: { value: number; color?: string; bg: string }) {
  return (
    <div className={`w-full ${bg} rounded-full h-1.5 overflow-hidden`}>
      <div className={`${color} h-1.5 rounded-full transition-all duration-500`} style={{ width: `${Math.min(value,100)}%` }} />
    </div>
  );
}

function Card({ children, className = "", t }: { children: React.ReactNode; className?: string; t: Theme }) {
  return (
    <div className={`${t.card} border rounded-xl ${className}`}>
      {children}
    </div>
  );
}

// dot indicator
function StatusDot({ status, t }: { status: string; t: Theme }) {
  const color: Record<string, string> = {
    published: "bg-green-500", draft: "bg-gray-400", archived: "bg-orange-400",
    active: "bg-green-500", at_risk: "bg-red-500", completed: "bg-blue-500",
    open: "bg-blue-500", grading: "bg-amber-500", closed: "bg-gray-400",
  };
  return (
    <span className="flex items-center gap-1.5">
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${color[status] ?? "bg-gray-400"}`} />
      <span className={`text-xs font-medium capitalize ${t.textMuted}`}>{status.replace("_"," ")}</span>
    </span>
  );
}

//TABS 
const TABS = [
  { id: "overview",    label: "Overview",    icon: <LayoutDashboard size={14} /> },
  { id: "courses",     label: "My Courses",  icon: <BookOpen size={14} /> },
  { id: "students",    label: "Students",    icon: <Users size={14} /> },
  { id: "assignments", label: "Assignments", icon: <FileText size={14} /> },
  { id: "sessions",    label: "Sessions",    icon: <Video size={14} /> },
  { id: "analytics",   label: "Analytics",   icon: <BarChart2 size={14} /> },
  { id: "settings",    label: "Settings",    icon: <Settings size={14} /> },
];


// ROOT

export function EducatorDashboard() {
  const [tab,    setTab]    = useState("overview");
  const [isDark, setIsDark] = useState(false);
  const [search, setSearch] = useState("");
  const [notif,  setNotif]  = useState(false);

  const t: Theme = isDark ? DARK : LIGHT;
  const go = useCallback((id: string) => setTab(id), []);

  return (
    <div className={`min-h-screen ${t.page} font-sans`}>

      {/*HEADER */}
      <header className={`sticky top-0 z-40 border-b ${t.nav}`}>
        <div className="px-6 lg:px-10">

          {/* Top row: logo + search LEFT, actions RIGHT */}
          <div className="flex items-center justify-between h-16 gap-6">

            {/* LEFT: logo + search together */}
            <div className="flex items-center gap-4 flex-1 min-w-0">
              {/* Logo — bigger and readable */}
              <a href="/" className="flex items-center gap-3 flex-shrink-0">
                <img
                  src="/Braille%20bot%20%20Bio.png"
                  alt="BrailleEd"
                  className={`h-10 w-auto ${isDark ? "brightness-0 invert" : "brightness-0"}`}
                />
                <div className="hidden sm:block leading-tight">
                  <p className={`text-sm font-bold ${t.text}`}>BrailleEd</p>
                  <p className={`text-xs ${t.textMuted}`}>Educator Portal</p>
                </div>
              </a>

              {/* Divider */}
              <div className={`hidden sm:block w-px h-6 ${isDark ? "bg-slate-700" : "bg-gray-200"}`} />

              {/* Search — left side, modest width */}
              <div className={`hidden md:flex items-center gap-2 border rounded-lg px-3 py-2 w-56 ${t.input}`}>
                <Search size={13} className={t.textDim} />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search..."
                  className="bg-transparent text-sm outline-none w-full"
                />
              </div>
            </div>

            {/* RIGHT: actions */}
            <div className="flex items-center gap-2 flex-shrink-0">

              {/* Theme */}
              <button
                onClick={() => setIsDark(p => !p)}
                title={isDark ? "Light mode" : "Dark mode"}
                className={`p-2 rounded-lg transition ${t.textMuted} ${isDark ? "hover:bg-slate-800" : "hover:bg-gray-100"}`}
              >
                {isDark ? <Sun size={16} /> : <Moon size={16} />}
              </button>

              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setNotif(p => !p)}
                  className={`relative p-2 rounded-lg transition ${t.textMuted} ${isDark ? "hover:bg-slate-800" : "hover:bg-gray-100"}`}
                >
                  <Bell size={16} />
                  <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-blue-500 rounded-full" />
                </button>
                {notif && (
                  <div className={`absolute right-0 top-full mt-1 w-72 border rounded-xl shadow-xl z-50 overflow-hidden ${t.card}`}>
                    <div className={`px-4 py-3 border-b ${t.border}`}>
                      <p className={`text-xs font-bold uppercase tracking-wider ${t.th}`}>Notifications</p>
                    </div>
                    {[
                      { text: "18 assignments pending review",    time: "Now",    dot: "bg-red-500"    },
                      { text: "New student enrolled in Robotics", time: "2h ago", dot: "bg-blue-500"   },
                      { text: "Session reminder: tomorrow 10 AM", time: "5h ago", dot: "bg-amber-500"  },
                    ].map((n, i) => (
                      <div key={i} className={`px-4 py-3 flex gap-3 cursor-pointer transition ${t.rowHover} border-b last:border-0 ${t.border}`}>
                        <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${n.dot}`} />
                        <div>
                          <p className={`text-sm ${t.text}`}>{n.text}</p>
                          <p className={`text-xs mt-0.5 ${t.textDim}`}>{n.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Profile */}
              <div className={`flex items-center gap-2 pl-2 border-l ${t.border}`}>
                <Avatar name={EDUCATOR.name} size="sm" />
                <div className="hidden sm:block">
                  <p className={`text-xs font-semibold leading-none ${t.text}`}>{EDUCATOR.name}</p>
                  <p className={`text-xs mt-0.5 ${t.textMuted}`}>{EDUCATOR.role}</p>
                </div>
                <ChevronDown size={12} className={t.textDim} />
              </div>

              {/* Sign out */}
              <button className={`hidden sm:flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border transition
                ${isDark ? "border-slate-700 text-slate-400 hover:text-red-400 hover:border-red-500/30" : "border-gray-200 text-gray-500 hover:text-red-500 hover:border-red-300"}`}>
                <LogOut size={13} /> Sign out
              </button>
            </div>
          </div>

          {/* Tab row */}
          <div className="flex items-center gap-3 py-6 overflow-x-auto no-scrollbar">
            {TABS.map(item => (
              <button
                key={item.id}
                onClick={() => go(item.id)}
                className={`flex items-center gap-2 px-6 py-2.5 text-[11px] font-bold uppercase tracking-tight whitespace-nowrap border transition-all duration-200
                  ${tab === item.id
                    ? "bg-[#0061c1] border-[#0061c1] text-white shadow-md"
                    : `bg-white border-gray-200 text-[#0061c1] hover:bg-gray-50 shadow-sm`
                  }
                  rounded-lg
                  `}
              >
                
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/*PAGE CONTENT */}
      <main className="px-6 lg:px-10 py-8 max-w-screen-2xl mx-auto">
        {tab === "overview"    && <OverviewTab    go={go} t={t} isDark={isDark} />}
        {tab === "courses"     && <CoursesTab     t={t} isDark={isDark} />}
        {tab === "students"    && <StudentsTab    t={t} isDark={isDark} />}
        {tab === "assignments" && <AssignmentsTab t={t} isDark={isDark} />}
        {tab === "sessions"    && <SessionsTab    t={t} isDark={isDark} />}
        {tab === "analytics"   && <AnalyticsTab   t={t} isDark={isDark} />}
        {tab === "settings"    && <SettingsTab    t={t} isDark={isDark} onToggle={() => setIsDark(p => !p)} />}
      </main>
    </div>
  );
}


// OVERVIEW

function OverviewTab({ go, t, isDark }: { go: (id: string) => void; t: Theme; isDark: boolean }) {
  return (
    <div className="space-y-6">

      {/* Welcome */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-blue-600 text-xs font-semibold uppercase tracking-widest mb-0.5">Welcome back</p>
          <h1 className={`text-2xl font-bold ${t.text}`}>{EDUCATOR.name}</h1>
        </div>
        {/*<button onClick={() => go("courses")} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded-lg transition-all">
          <PlusCircle size={14} /> New Course
        </button>*/}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {STATS.map((s, i) => (
          <Card key={i} t={t} className="p-5">
            <div className="flex items-start justify-between mb-4">
              <div className={`p-2 rounded-lg ${isDark ? "bg-blue-500/10 text-blue-400" : "bg-blue-50 text-blue-600"}`}>
                {s.icon}
              </div>
              <span className={`text-xs font-medium ${s.positive ? "text-green-500" : "text-red-500"}`}>{s.delta}</span>
            </div>
            <p className={`text-3xl font-bold ${t.text}`}>{s.value}</p>
            <p className={`text-xs font-medium uppercase tracking-wide mt-1 ${t.textMuted}`}>{s.label}</p>
          </Card>
        ))}
      </div>

      {/* Courses + Sessions */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <Card t={t} className="xl:col-span-2 overflow-hidden">
          <div className={`flex items-center justify-between px-5 py-4 border-b ${t.border}`}>
            <p className={`text-sm font-semibold ${t.text}`}>Active Courses</p>
            <button onClick={() => go("courses")} className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
              View all <ChevronRight size={13} />
            </button>
          </div>
          <div className={`divide-y ${t.divider}`}>
            {COURSES.filter(c => c.status === "published").slice(0, 4).map(c => (
              <div key={c.id} className={`flex items-center gap-4 px-5 py-4 transition ${t.rowHover}`}>
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${isDark ? "bg-blue-500/10" : "bg-blue-50"}`}>
                  <BookOpen size={15} className="text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold truncate ${t.text}`}>{c.title}</p>
                  <p className={`text-xs mt-0.5 ${t.textMuted}`}>{c.enrolled} students · {c.module_count} modules</p>
                  <div className="mt-1.5"><ProgressBar value={c.completion_rate} bg={t.progBg} /></div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className={`text-sm font-bold ${t.text}`}>{c.completion_rate}%</p>
                  <p className={`text-xs ${t.textDim}`}>done</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card t={t} className="overflow-hidden">
          <div className={`flex items-center justify-between px-5 py-4 border-b ${t.border}`}>
            <p className={`text-sm font-semibold ${t.text}`}>Upcoming Sessions</p>
            <button onClick={() => go("sessions")} className="text-xs text-blue-600 font-medium flex items-center gap-1">
              View all <ChevronRight size={13} />
            </button>
          </div>
          <div className={`divide-y ${t.divider}`}>
            {SESSIONS.map(s => (
              <div key={s.id} className={`px-5 py-4 transition ${t.rowHover}`}>
                <p className="text-xs text-blue-600 font-medium mb-1">{s.date} · {s.time}</p>
                <p className={`text-sm font-semibold ${t.text}`}>{s.title}</p>
                <p className={`text-xs mt-0.5 ${t.textMuted}`}>{s.enrolled} enrolled</p>
              </div>
            ))}
          </div>
          <div className={`px-5 py-3 border-t ${t.border}`}>
            <button className={`w-full flex items-center justify-center gap-2 text-xs font-semibold text-blue-600 border border-blue-200 rounded-lg py-2 transition-all ${isDark ? "border-blue-500/30 hover:bg-blue-500/10" : "hover:bg-blue-50"}`}>
              <PlusCircle size={13} /> Schedule Session
            </button>
          </div>
        </Card>
      </div>

      {/* At-risk + Grading queue */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <Card t={t} className="overflow-hidden">
          <div className={`flex items-center justify-between px-5 py-4 border-b ${t.border}`}>
            <div className="flex items-center gap-2">
              <AlertCircle size={14} className="text-red-500" />
              <p className={`text-sm font-semibold ${t.text}`}>Students Needing Attention</p>
            </div>
            <button onClick={() => go("students")} className="text-xs text-blue-600 font-medium flex items-center gap-1">
              All <ChevronRight size={13} />
            </button>
          </div>
          <div className={`divide-y ${t.divider}`}>
            {STUDENTS.filter(s => s.status === "at_risk").map(s => (
              <div key={s.id} className={`flex items-center gap-3 px-5 py-4 transition ${t.rowHover}`}>
                <Avatar name={s.avatar} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold ${t.text}`}>{s.name}</p>
                  <p className={`text-xs truncate ${t.textMuted}`}>{s.course}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-red-500">{s.progress}%</p>
                  <p className={`text-xs ${t.textDim}`}>{s.assignments_due} overdue</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card t={t} className="overflow-hidden">
          <div className={`flex items-center justify-between px-5 py-4 border-b ${t.border}`}>
            <div className="flex items-center gap-2">
              <Clock size={14} className="text-amber-500" />
              <p className={`text-sm font-semibold ${t.text}`}>Assignments to Grade</p>
            </div>
            <button onClick={() => go("assignments")} className="text-xs text-blue-600 font-medium flex items-center gap-1">
              All <ChevronRight size={13} />
            </button>
          </div>
          <div className={`divide-y ${t.divider}`}>
            {ASSIGNMENTS.filter(a => a.status === "grading").length === 0 ? (
              <div className="px-5 py-8 text-center">
                <CheckCircle2 size={20} className="text-green-500 mx-auto mb-2" />
                <p className={`text-sm font-semibold ${t.text}`}>All caught up!</p>
                <p className={`text-xs mt-0.5 ${t.textMuted}`}>No assignments waiting to be graded.</p>
              </div>
            ) : ASSIGNMENTS.filter(a => a.status === "grading").map(a => (
              <div key={a.id} className={`px-5 py-4 transition ${t.rowHover}`}>
                <div className="flex items-start justify-between gap-2 mb-1">
                  <p className={`text-sm font-semibold ${t.text}`}>{a.title}</p>
                  <p className={`text-xs ${t.textDim} flex-shrink-0`}>{a.due_date}</p>
                </div>
                <p className={`text-xs ${t.textMuted} mb-2`}>{a.course}</p>
                <div className="flex items-center gap-2">
                  <ProgressBar value={(a.submissions / a.total_students) * 100} bg={t.progBg} color="bg-blue-600" />
                  <span className={`text-xs flex-shrink-0 ${t.textMuted}`}>{a.submissions}/{a.total_students}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}


// COURSES

function CoursesTab({ t, isDark }: { t: Theme; isDark: boolean }) {
  const [filter, setFilter] = useState<"all" | "published" | "draft">("all");
  const filtered = COURSES.filter(c => filter === "all" || c.status === filter);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-xl font-bold ${t.text}`}>My Courses</h2>
          <p className={`text-xs mt-0.5 ${t.textMuted}`}>{COURSES.length} total courses</p>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded-lg transition-all">
          <PlusCircle size={14} /> Create Course
        </button>
      </div>

      {/* Filter pills */}
      <div className="flex gap-2">
        {(["all","published","draft"] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-all capitalize
              ${filter === f
                ? "bg-blue-600 border-blue-600 text-white"
                : `${isDark ? "border-slate-700 text-slate-400 hover:border-blue-500 hover:text-blue-400" : "border-gray-300 text-gray-500 hover:border-blue-400 hover:text-blue-600"}`
              }`}>
            {f}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map(c => (
          <Card key={c.id} t={t} className="overflow-hidden flex flex-col hover:shadow-sm transition-shadow">
            {/* Thin top accent bar  */}
            <div className={`h-1 ${c.status === "published" ? "bg-blue-600" : "bg-gray-300"}`} />

            <div className="p-5 flex-1 flex flex-col">
              {/* Status + date  */}
              <div className="flex items-center justify-between mb-3">
                <StatusDot status={c.status} t={t} />
                <span className={`text-xs ${t.textDim}`}>{c.last_updated}</span>
              </div>

              <h3 className={`text-sm font-bold leading-snug mb-1 ${t.text}`}>{c.title}</h3>
              <p className={`text-xs mb-4 ${t.textMuted}`}>{c.category}</p>

              <div className="grid grid-cols-2 gap-2 mb-4">
                <div className={`p-3 rounded-lg text-center ${t.miniCard}`}>
                  <p className={`text-xl font-bold ${t.text}`}>{c.enrolled}</p>
                  <p className={`text-xs ${t.textMuted}`}>Students</p>
                </div>
                <div className={`p-3 rounded-lg text-center ${t.miniCard}`}>
                  <p className={`text-xl font-bold ${t.text}`}>{c.module_count}</p>
                  <p className={`text-xs ${t.textMuted}`}>Modules</p>
                </div>
              </div>

              {c.status === "published" && (
                <div className="mb-1">
                  <div className="flex justify-between mb-1.5">
                    <span className={`text-xs ${t.textMuted}`}>Completion</span>
                    <span className={`text-xs font-bold ${t.text}`}>{c.completion_rate}%</span>
                  </div>
                  <ProgressBar value={c.completion_rate} bg={t.progBg} />
                </div>
              )}

              <p className={`text-xs mt-auto pt-3 ${t.textDim}`}>Updated {c.last_updated}</p>
            </div>

            <div className={`flex gap-2 px-5 py-3 border-t ${t.border}`}>
              <button className={`flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold py-2 rounded-lg border transition-all
                ${isDark ? "border-slate-700 text-slate-400 hover:text-blue-400 hover:border-blue-500/40" : "border-gray-200 text-gray-500 hover:text-blue-600 hover:border-blue-300"}`}>
                <Edit2 size={12} /> Edit
              </button>
              <button className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-all">
                <Eye size={12} /> View
              </button>
            </div>
          </Card>
        ))}

        {/* Add new */}
        <button className={`border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-3 p-10 min-h-[240px] transition-all group
          ${isDark ? "border-slate-700 hover:border-blue-500/50" : "border-gray-300 hover:border-blue-400 hover:bg-blue-50/40"}`}>
          <div className={`w-10 h-10 rounded-full border-2 border-dashed flex items-center justify-center transition-all
            ${isDark ? "border-slate-600 group-hover:border-blue-500" : "border-gray-300 group-hover:border-blue-400"}`}>
            <PlusCircle size={18} className={`${t.textDim} group-hover:text-blue-500 transition`} />
          </div>
          <p className={`text-xs font-semibold ${t.textDim} group-hover:text-blue-500 transition`}>New Course</p>
        </button>
      </div>
    </div>
  );
}

// STUDENTS

function StudentsTab({ t, isDark }: { t: Theme; isDark: boolean }) {
  const [sf, setSf] = useState<"all"|"active"|"at_risk"|"completed">("all");
  const filtered = STUDENTS.filter(s => sf === "all" || s.status === sf);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-xl font-bold ${t.text}`}>Students</h2>
          <p className={`text-xs mt-0.5 ${t.textMuted}`}>{STUDENTS.length} enrolled across all courses</p>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded-lg transition-all">
          <UserPlus size={14} /> Invite Student
        </button>
      </div>

      <div className="flex gap-2 flex-wrap">
        {(["all","active","at_risk","completed"] as const).map(f => (
          <button key={f} onClick={() => setSf(f)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-all capitalize
              ${sf === f
                ? "bg-blue-600 border-blue-600 text-white"
                : `${isDark ? "border-slate-700 text-slate-400 hover:border-blue-500 hover:text-blue-400" : "border-gray-300 text-gray-500 hover:border-blue-400 hover:text-blue-600"}`
              }`}>
            {f.replace("_"," ")}
          </button>
        ))}
      </div>

      <Card t={t} className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className={`border-b ${t.border}`}>
                {[
                  { h: "Username",    c: "" },
                  { h: "Course",      c: "hidden md:table-cell" },
                  { h: "Progress",    c: "hidden lg:table-cell" },
                  { h: "Status",      c: "" },
                  { h: "Last Active", c: "hidden sm:table-cell" },
                  { h: "Actions",     c: "" },
                ].map(col => (
                  <th key={col.h} className={`text-left px-5 py-3 text-xs font-bold uppercase tracking-wider ${t.th} ${col.c}`}>
                    {col.h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className={`divide-y ${t.divider}`}>
              {filtered.map(s => (
                <tr key={s.id} className={`transition ${t.rowHover}`}>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <Avatar name={s.avatar} size="sm" />
                      <div>
                        <p className={`font-semibold ${t.text}`}>{s.name}</p>
                        {s.assignments_due > 0 && <p className="text-xs text-red-500">{s.assignments_due} overdue</p>}
                      </div>
                    </div>
                  </td>
                  <td className={`px-5 py-3.5 hidden md:table-cell text-xs ${t.textMuted} max-w-[180px] truncate`}>{s.course}</td>
                  <td className="px-5 py-3.5 hidden lg:table-cell">
                    <div className="flex items-center gap-2 min-w-[100px]">
                      <ProgressBar value={s.progress} bg={t.progBg}
                        color={s.status === "at_risk" ? "bg-red-500" : s.status === "completed" ? "bg-green-500" : "bg-blue-600"} />
                      <span className={`text-xs font-bold flex-shrink-0 ${t.text}`}>{s.progress}%</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <StatusDot status={s.status} t={t} />
                  </td>
                  <td className={`px-5 py-3.5 hidden sm:table-cell text-xs ${t.textMuted}`}>{s.last_active}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex gap-1.5">
                      <button className={`p-1.5 rounded-lg transition ${t.textDim} ${isDark ? "hover:bg-slate-800 hover:text-blue-400" : "hover:bg-blue-50 hover:text-blue-600"}`}><Eye size={14} /></button>
                      <button className={`p-1.5 rounded-lg transition ${t.textDim} ${isDark ? "hover:bg-slate-800 hover:text-blue-400" : "hover:bg-blue-50 hover:text-blue-600"}`}><MessageSquare size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}


// ASSIGNMENTS

function AssignmentsTab({ t, isDark }: { t: Theme; isDark: boolean }) {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-xl font-bold ${t.text}`}>Assignments</h2>
          <p className={`text-xs mt-0.5 ${t.textMuted}`}>{ASSIGNMENTS.length} total assignments</p>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded-lg transition-all">
          <PlusCircle size={14} /> New Assignment
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {ASSIGNMENTS.map(a => (
          <Card key={a.id} t={t} className="p-5 hover:shadow-sm transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <StatusDot status={a.status} t={t} />
              <p className={`text-xs ${t.textDim}`}>Due {a.due_date}</p>
            </div>
            <h3 className={`text-sm font-bold mb-1 ${t.text}`}>{a.title}</h3>
            <p className={`text-xs mb-4 ${t.textMuted}`}>{a.course}</p>
            <div className="mb-2">
              <div className="flex justify-between mb-1.5">
                <span className={`text-xs ${t.textMuted}`}>Submissions</span>
                <span className={`text-xs font-bold ${t.text}`}>{a.submissions} / {a.total_students}</span>
              </div>
              <ProgressBar value={(a.submissions / a.total_students) * 100} bg={t.progBg}
                color={a.status === "grading" ? "bg-blue-600" : "bg-blue-600"} />
            </div>
            <div className="flex gap-2 mt-4">
              <button className={`flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold py-2 rounded-lg border transition-all
                ${isDark ? "border-slate-700 text-slate-400 hover:text-blue-400" : "border-gray-200 text-gray-500 hover:text-blue-600 hover:border-blue-300"}`}>
                <Eye size={12} /> View
              </button>
              {a.status === "grading" && (
                <button className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold py-2 rounded-lg bg-blue-600 text-white hover:bg-amber-600 transition-all">
                  <CheckCircle2 size={12} /> Grade
                </button>
              )}
              {a.status === "open" && (
                <button className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-all">
                  <Edit2 size={12} /> Edit
                </button>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}


// SESSIONS

function SessionsTab({ t, isDark }: { t: Theme; isDark: boolean }) {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-xl font-bold ${t.text}`}>Class Sessions</h2>
          <p className={`text-xs mt-0.5 ${t.textMuted}`}>Upcoming live and recorded sessions</p>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded-lg transition-all">
          <PlusCircle size={14} /> Schedule Session
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {SESSIONS.map(s => (
          <Card key={s.id} t={t} className="overflow-hidden hover:shadow-sm transition-shadow">
            <div className="h-1 bg-blue-600" />
            <div className="p-5">
              <p className="text-xs text-blue-600 font-medium mb-2">{s.date} · {s.time}</p>
              <h3 className={`text-sm font-bold mb-1 ${t.text}`}>{s.title}</h3>
              <p className={`text-xs mb-4 ${t.textMuted}`}>{s.course}</p>
              <div className="flex items-center justify-between">
                <p className={`text-xs ${t.textMuted}`}>{s.enrolled} enrolled</p>
                <div className="flex gap-2">
                  <button className="flex items-center gap-1.5 text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 px-3 py-1.5 rounded-lg transition-all">
                    <Play size={11} /> Start
                  </button>
                  <button className={`p-1.5 rounded-lg transition ${t.textDim} ${isDark ? "hover:bg-slate-800 hover:text-blue-400" : "hover:bg-blue-50 hover:text-blue-600"}`}>
                    <Edit2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}


// ANALYTICS

function AnalyticsTab({ t, isDark }: { t: Theme; isDark: boolean }) {
  const bars = [
    { label: "Intro Coding",  value: 45 },
    { label: "Robotics",      value: 38 },
    { label: "Voice Prog.",   value: 29 },
    { label: "Sensor Integ.", value: 22 },
    { label: "STEM Projects", value: 8  },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h2 className={`text-xl font-bold ${t.text}`}>Analytics</h2>
        <p className={`text-xs mt-0.5 ${t.textMuted}`}>Performance overview across all courses</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Enrollments", value: "142",    icon: <Users size={18} />        },
          { label: "Lessons Completed", value: "1,847",  icon: <CheckCircle2 size={18} /> },
          { label: "Avg. Session Time", value: "38 min", icon: <Clock size={18} />        },
          { label: "Top Rated Course",  value: "4.9 ★",  icon: <Star size={18} />         },
        ].map((item, i) => (
          <Card key={i} t={t} className="p-4">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-3 ${isDark ? "bg-blue-500/10 text-blue-400" : "bg-blue-50 text-blue-600"}`}>
              {item.icon}
            </div>
            <p className={`text-2xl font-bold ${t.text}`}>{item.value}</p>
            <p className={`text-xs font-medium mt-0.5 ${t.textMuted}`}>{item.label}</p>
          </Card>
        ))}
      </div>

      <Card t={t} className="p-5">
        <p className={`text-sm font-semibold mb-5 ${t.text}`}>Enrollment by Course</p>
        <div className="space-y-4">
          {bars.map((b, i) => (
            <div key={i} className="flex items-center gap-3">
              <p className={`text-xs w-28 flex-shrink-0 ${t.textMuted}`}>{b.label}</p>
              <div className={`flex-1 ${t.progBg} rounded-full h-2 overflow-hidden`}>
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${(b.value / 45) * 100}%` }} />
              </div>
              <p className={`text-xs font-bold w-6 text-right ${t.text}`}>{b.value}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card t={t} className="p-5">
        <p className={`text-sm font-semibold mb-5 ${t.text}`}>Completion Rates</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          {COURSES.filter(c => c.status === "published").map(c => (
            <div key={c.id}>
              <div className="flex justify-between mb-1.5">
                <p className={`text-xs font-medium truncate max-w-[140px] ${t.textMuted}`}>{c.title}</p>
                <p className={`text-xs font-bold ml-2 ${t.text}`}>{c.completion_rate}%</p>
              </div>
              <ProgressBar value={c.completion_rate} bg={t.progBg}
                color={c.completion_rate >= 75 ? "bg-blue-600" : c.completion_rate >= 50 ? "bg-blue-600" : "bg-blue-600"} />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}


// SETTINGS

function SettingsTab({ t, isDark, onToggle }: { t: Theme; isDark: boolean; onToggle: () => void }) {
  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div>
        <h2 className={`text-xl font-bold ${t.text}`}>Settings</h2>
        <p className={`text-xs mt-0.5 ${t.textMuted}`}>Manage your profile and preferences</p>
      </div>

      {/* Main Grid: 1 column on mobile, 2 columns on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        
        {/* LEFT COLUMN: Profile Info */}
        <Card t={t} className="p-6 space-y-5">
          <p className={`text-xs font-bold uppercase tracking-wider text-blue-600 border-b pb-3 ${t.border}`}>
            Profile Details
          </p>
          <div className="flex items-center gap-4">
            <Avatar name={EDUCATOR.name} size="lg" />
            <div>
              <p className={`text-sm font-bold ${t.text}`}>{EDUCATOR.name}</p>
              <p className={`text-xs ${t.textMuted}`}>{EDUCATOR.email}</p>
              <button className="mt-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1">
                <Upload size={11} /> Change photo
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {[
              { label: "Full Name",     value: EDUCATOR.name,  type: "text"  },
              { label: "Email Address", value: EDUCATOR.email, type: "email" },
              { label: "Title",         value: EDUCATOR.role,  type: "text"  },
            ].map((f, i) => (
              <div key={i}>
                <label className={`block text-xs font-semibold mb-1.5 ${t.textMuted}`}>{f.label}</label>
                <input 
                  type={f.type} 
                  defaultValue={f.value}
                  className={`w-full border rounded-lg text-sm px-3.5 py-2.5 outline-none transition ${t.input}`} 
                />
              </div>
            ))}
          </div>

          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold uppercase tracking-wider px-5 py-3 rounded-lg transition-all shadow-sm">
            Save Profile Changes
          </button>
        </Card>

        {/* RIGHT COLUMN: Appearance, Notifications, and Onboarding */}
        <div className="space-y-6">
          
          {/* Appearance Card */}
          <Card t={t} className="p-5">
            <p className={`text-xs font-bold uppercase tracking-wider text-blue-600 border-b pb-3 mb-5 ${t.border}`}>
              Appearance
            </p>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-semibold ${t.text}`}>Theme Preference</p>
                <p className={`text-xs mt-0.5 ${t.textMuted}`}>Toggle between light and dark mode</p>
              </div>
              <button onClick={onToggle}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-xs font-semibold transition-all
                  ${isDark ? "border-slate-700 text-slate-300 hover:border-blue-500 hover:text-blue-400" : "border-gray-300 text-gray-600 hover:border-blue-500 hover:text-blue-600"}`}>
                {isDark ? <><Sun size={14} /> Light mode</> : <><Moon size={14} /> Dark mode</>}
              </button>
            </div>
          </Card>

          {/* Notifications Card */}
          <Card t={t} className="p-5">
            <p className={`text-xs font-bold uppercase tracking-wider text-blue-600 border-b pb-3 mb-5 ${t.border}`}>
              Notifications
            </p>
            <div className="space-y-4">
              {[
                { label: "New student enrollment",  on: true  },
                { label: "Assignment submissions",  on: true  },
                { label: "Student at-risk alerts",  on: true  },
                { label: "Session reminders",       on: true  },
              ].map((p, i) => (
                <div key={i} className="flex items-center justify-between">
                  <p className={`text-sm ${t.text}`}>{p.label}</p>
                  <div className={`w-9 h-5 rounded-full relative cursor-pointer transition-colors ${p.on ? "bg-blue-600" : isDark ? "bg-slate-700" : "bg-gray-300"}`}>
                    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${p.on ? "left-4" : "left-0.5"}`} />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Checklist Card */}
          <Card t={t} className="p-5">
            <p className={`text-xs font-bold uppercase tracking-wider text-blue-600 border-b pb-3 mb-4 ${t.border}`}>
              Onboarding Progress
            </p>
            <div className="space-y-3">
              {[
                { task: "Complete educator profile",  done: true  },
                { task: "Create your first course",   done: true  },
                { task: "Invite your first student", done: true},
                { task: "Add atleast one module", done:true},
                { task: "Schedule a live session",    done: false },
                { task: "Review student submissions", done: false},
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0
                    ${item.done ? "bg-green-500" : `border-2 ${isDark ? "border-slate-600" : "border-gray-300"}`}`}>
                    {item.done && <CheckCircle2 size={11} className="text-white" />}
                  </div>
                  <p className={`text-sm ${item.done ? `line-through ${t.textDim}` : `font-medium ${t.text}`}`}>{item.task}</p>
                </div>
              ))}
            </div>
          </Card>

        </div>
      </div>
    </div>
  );
}
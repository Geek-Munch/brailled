import React, { useEffect, useMemo, useState } from "react";
import { apiRequest, fetchAllPages } from "../lib/api-client";
import { useAuth } from "../contexts/AuthContext";

type StudentProfile = {
  id: number;
  username: string;
  email: string;
  school: number;
  age: number;
  disability_type: string;
};

type DashboardCourse = {
  course: {
    id: number;
    title: string;
    description: string;
    thumbnail?: string | null;
    is_published: boolean;
  };
  progress_percent: number;
  completed_at: string | null;
};

type DashboardSession = {
  id: number;
  title: string;
  start_at: string;
  end_at: string;
  location: string;
};

type DashboardSubmission = {
  id: number;
  status: string;
  grade: string;
  submitted_at: string;
  assignment: {
    id: number;
    title: string;
    description: string;
    due_at: string | null;
    course: {
      id: number;
      title: string;
      description: string;
      thumbnail?: string | null;
      is_published: boolean;
    };
  };
};

type DashboardStats = {
  points_total: number;
  current_streak: number;
  longest_streak: number;
  last_activity_at: string | null;
};

type Tab = "overview" | "courses" | "assignments" | "sessions" | "profile";

const BRAND = "#0088ce";

const card = "bg-white border border-slate-200 rounded-2xl shadow-sm";

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className={`${card} p-4`}>
      <p className="text-xs uppercase tracking-wider text-slate-500">{label}</p>
      <p className="text-2xl font-black mt-1" style={{ color: BRAND }}>{value}</p>
    </div>
  );
}

export default function StudentDashboard() {
  const { user, isAuthenticated, isBootstrapping, login, logout } = useAuth();
  const [tab, setTab] = useState<Tab>("overview");

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [courses, setCourses] = useState<DashboardCourse[]>([]);
  const [sessions, setSessions] = useState<DashboardSession[]>([]);
  const [submissions, setSubmissions] = useState<DashboardSubmission[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);

  const isStudentUser = ["student", "admin", "superuser"].includes((user?.role ?? "").toLowerCase());

  const loadAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const [p, c, s, sub, st] = await Promise.all([
        apiRequest<StudentProfile>("/profile/student/", { auth: true }),
        fetchAllPages<DashboardCourse>("/dashboard/modules/", { auth: true }),
        fetchAllPages<DashboardSession>("/dashboard/sessions/", { auth: true }),
        fetchAllPages<DashboardSubmission>("/dashboard/submissions/", { auth: true }),
        apiRequest<DashboardStats>("/dashboard/stats/", { auth: true }).catch(() => null),
      ]);
      setProfile(p);
      setCourses(c);
      setSessions(s);
      setSubmissions(sub);
      setStats(st);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load student dashboard.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && isStudentUser) loadAll();
  }, [isAuthenticated, isStudentUser]);

  const numbers = useMemo(() => {
    const totalCourses = courses.length;
    const completedCourses = courses.filter((c) => !!c.completed_at).length;
    const avgProgress = totalCourses
      ? Math.round(courses.reduce((sum, c) => sum + (c.progress_percent || 0), 0) / totalCourses)
      : 0;
    const graded = submissions.filter((s) => s.status.toLowerCase().includes("grade") || !!s.grade).length;
    return {
      totalCourses,
      completedCourses,
      avgProgress,
      assignments: submissions.length,
      graded,
      sessions: sessions.length,
    };
  }, [courses, submissions, sessions]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    const result = await login(username.trim(), password);
    if (!result.ok) {
      setLoginError(result.error);
      return;
    }
    setUsername("");
    setPassword("");
  };

  if (isBootstrapping) {
    return <div className="min-h-screen flex items-center justify-center">Loading session...</div>;
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
        <form onSubmit={handleLogin} className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-6 space-y-3 shadow-sm">
          <h1 className="text-xl font-black text-slate-900">Student Sign In</h1>
          <input value={username} onChange={(e) => setUsername(e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2" placeholder="Username" required />
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2" placeholder="Password" required />
          {loginError && <p className="text-sm text-red-600">{loginError}</p>}
          <button type="submit" className="w-full text-white rounded-lg py-2 font-semibold" style={{ backgroundColor: BRAND }}>Sign In</button>
        </form>
      </div>
    );
  }

  if (!isStudentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
        <div className="max-w-md w-full bg-white border border-slate-200 rounded-2xl p-6 text-center">
          <h2 className="text-xl font-black text-slate-900">Student Access Required</h2>
          <p className="text-sm text-slate-500 mt-2">This account cannot access the student dashboard.</p>
          <button onClick={logout} className="mt-4 text-white rounded-lg py-2 px-4 font-semibold" style={{ backgroundColor: BRAND }}>Sign Out</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,_#e0f2fe_0%,_#f0f9ff_35%,_#f8fafc_70%)]">
      <header className="text-white" style={{ background: `linear-gradient(90deg, ${BRAND} 0%, #0073ad 55%, #00669a 100%)` }}>
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-cyan-100 font-semibold">BrailleEd</p>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight">Student Dashboard</h1>
            <p className="text-sm text-cyan-100 mt-1">Track your learning progress and activities</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={loadAll} className="bg-white/15 hover:bg-white/20 border border-white/30 rounded-lg px-4 py-2 text-sm font-semibold">Refresh</button>
            <button onClick={logout} className="bg-white rounded-lg px-4 py-2 text-sm font-semibold" style={{ color: BRAND }}>Sign Out</button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-6 space-y-5">
        <div className="bg-white/90 backdrop-blur border border-slate-200 rounded-2xl p-3 flex flex-wrap gap-2 shadow-sm">
          {(["overview", "courses", "assignments", "sessions", "profile"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition ${tab === t ? "text-white shadow" : "bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100"}`}
              style={tab === t ? { backgroundColor: BRAND } : undefined}
            >
              {t}
            </button>
          ))}
        </div>

        {error && <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3">{error}</p>}
        {loading && <p className="text-sm text-slate-600 bg-white border border-slate-200 rounded-lg px-4 py-3">Loading...</p>}

        {tab === "overview" && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              <Stat label="Courses" value={numbers.totalCourses} />
              <Stat label="Completed" value={numbers.completedCourses} />
              <Stat label="Avg Progress" value={`${numbers.avgProgress}%`} />
              <Stat label="Assignments" value={numbers.assignments} />
              <Stat label="Graded" value={numbers.graded} />
              <Stat label="Sessions" value={numbers.sessions} />
            </div>
            {stats && (
              <div className={`${card} p-5`}>
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 mb-3">Learning Streak</h3>
                <div className="grid sm:grid-cols-3 gap-3 text-sm">
                  <div><span className="text-slate-500">Points:</span> <span className="font-semibold">{stats.points_total}</span></div>
                  <div><span className="text-slate-500">Current streak:</span> <span className="font-semibold">{stats.current_streak}</span></div>
                  <div><span className="text-slate-500">Longest streak:</span> <span className="font-semibold">{stats.longest_streak}</span></div>
                </div>
              </div>
            )}
          </>
        )}

        {tab === "courses" && (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
            {courses.map((item) => (
              <div key={item.course.id} className={`${card} p-5`}>
                <h3 className="font-bold text-slate-900">{item.course.title}</h3>
                <p className="text-sm text-slate-500 mt-1 line-clamp-3">{item.course.description}</p>
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-slate-500 mb-1"><span>Progress</span><span>{item.progress_percent || 0}%</span></div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${item.progress_percent || 0}%`, backgroundColor: BRAND }} />
                  </div>
                </div>
                <p className="text-xs mt-3" style={{ color: item.completed_at ? "#15803d" : "#64748b" }}>
                  {item.completed_at ? `Completed: ${new Date(item.completed_at).toLocaleDateString()}` : "In progress"}
                </p>
              </div>
            ))}
            {courses.length === 0 && <div className={`${card} p-5 text-sm text-slate-500`}>No course progress available yet.</div>}
          </div>
        )}

        {tab === "assignments" && (
          <div className={`${card} overflow-auto`}>
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs uppercase tracking-wider" style={{ color: BRAND }}>Title</th>
                  <th className="px-4 py-3 text-left text-xs uppercase tracking-wider" style={{ color: BRAND }}>Course</th>
                  <th className="px-4 py-3 text-left text-xs uppercase tracking-wider" style={{ color: BRAND }}>Submitted</th>
                  <th className="px-4 py-3 text-left text-xs uppercase tracking-wider" style={{ color: BRAND }}>Status</th>
                  <th className="px-4 py-3 text-left text-xs uppercase tracking-wider" style={{ color: BRAND }}>Grade</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((s) => (
                  <tr key={s.id} className="border-t border-slate-100 hover:bg-slate-50/70">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-900">{s.assignment?.title}</div>
                      {s.assignment?.due_at && <div className="text-xs text-slate-500">Due: {new Date(s.assignment.due_at).toLocaleString()}</div>}
                    </td>
                    <td className="px-4 py-3 text-slate-700">{s.assignment?.course?.title}</td>
                    <td className="px-4 py-3 text-slate-700">{new Date(s.submitted_at).toLocaleString()}</td>
                    <td className="px-4 py-3"><span className="px-2 py-1 rounded text-xs bg-slate-100 text-slate-700">{s.status}</span></td>
                    <td className="px-4 py-3 text-slate-700">{s.grade || "-"}</td>
                  </tr>
                ))}
                {submissions.length === 0 && (
                  <tr><td colSpan={5} className="px-4 py-6 text-center text-slate-500">No submissions found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {tab === "sessions" && (
          <div className={`${card} overflow-auto`}>
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs uppercase tracking-wider" style={{ color: BRAND }}>Title</th>
                  <th className="px-4 py-3 text-left text-xs uppercase tracking-wider" style={{ color: BRAND }}>Start</th>
                  <th className="px-4 py-3 text-left text-xs uppercase tracking-wider" style={{ color: BRAND }}>End</th>
                  <th className="px-4 py-3 text-left text-xs uppercase tracking-wider" style={{ color: BRAND }}>Location</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((s) => (
                  <tr key={s.id} className="border-t border-slate-100 hover:bg-slate-50/70">
                    <td className="px-4 py-3 font-semibold text-slate-900">{s.title}</td>
                    <td className="px-4 py-3 text-slate-700">{new Date(s.start_at).toLocaleString()}</td>
                    <td className="px-4 py-3 text-slate-700">{new Date(s.end_at).toLocaleString()}</td>
                    <td className="px-4 py-3 text-slate-700">{s.location || "-"}</td>
                  </tr>
                ))}
                {sessions.length === 0 && (
                  <tr><td colSpan={4} className="px-4 py-6 text-center text-slate-500">No sessions scheduled.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {tab === "profile" && profile && (
          <div className={`${card} p-5 max-w-2xl`}>
            <h2 className="text-lg font-black text-slate-900 mb-3">Student Profile</h2>
            <div className="grid sm:grid-cols-2 gap-3 text-sm">
              <div><span className="text-slate-500">Username:</span> <span className="font-semibold">{profile.username}</span></div>
              <div><span className="text-slate-500">Email:</span> <span className="font-semibold">{profile.email}</span></div>
              <div><span className="text-slate-500">Age:</span> <span className="font-semibold">{profile.age}</span></div>
              <div><span className="text-slate-500">School ID:</span> <span className="font-semibold">{profile.school}</span></div>
              <div className="sm:col-span-2"><span className="text-slate-500">Disability Type:</span> <span className="font-semibold">{profile.disability_type}</span></div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

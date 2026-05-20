import { useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  Calendar,
  CheckCircle,
  Clock,
  FileText,
  GraduationCap,
  Users,
  Trophy,
  Bell,
  Search,
  LogOut,
} from "lucide-react";
import { apiRequest, fetchAllPages, normalizeList } from "../lib/api-client";
import { useAuth } from "../contexts/AuthContext";

type Assignment = {
  id: number | string;
  title: string;
  subject: string;
  due: string;
  submitted: boolean;
};

type Session = {
  id: number | string;
  title: string;
  time: string;
  instructor: string;
};

type StudentProfile = {
  name: string;
  grade: string;
  school: string;
  progress: number;
};

type ApiAssignment = {
  id?: number | string;
  title?: string;
  name?: string;
  due_at?: string;
  dueAt?: string;
  due_date?: string;
  dueDate?: string;
  course?: { title?: string } | number | string;
  course_title?: string;
  courseTitle?: string;
};

type ApiSubmission = {
  id?: number | string;
  assignment?: number | string;
  assignment_id?: number | string;
  assignmentId?: number | string;
  status?: string;
};

type ApiSession = {
  id?: number | string;
  title?: string;
  name?: string;
  start_at?: string;
  startAt?: string;
  time?: string;
  instructor?: string;
  instructor_name?: string;
  instructorName?: string;
  instructor_detail?: { name?: string };
};

type ApiModule = {
  id?: number | string;
  title?: string;
  name?: string;
  progress?: number;
};

type ApiStats = {
  progress?: number;
  completion?: number;
  classmates?: number;
  classmates_count?: number;
  achievements?: number;
  badges?: number;
  points?: number;
};

type ApiProfile = {
  school?: string | { name?: string };
  school_name?: string;
  grade?: string;
  grade_level?: string;
  class_level?: string;
};

function pickFirst(values: Array<string | undefined | null>) {
  return values.find((value) => typeof value === "string" && value.trim().length > 0) ?? "";
}

function formatDate(value?: string) {
  if (!value) return "TBD";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.valueOf())) return value;
  return parsed.toLocaleDateString([], { month: "short", day: "numeric" });
}

function formatTime(value?: string) {
  if (!value) return "TBD";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.valueOf())) return value;
  return parsed.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function ProgressCircle({ progress }: { progress: number }) {
  return (
    <div className="relative w-44 h-44 flex items-center justify-center">
      <div className="absolute inset-0 rounded-full border-[14px] border-slate-200" />

      <div
        className="absolute inset-0 rounded-full border-[14px] border-blue-600 border-t-transparent border-l-transparent rotate-45"
        style={{
          clipPath: `inset(${100 - progress}% 0 0 0)`,
        }}
      />

      <div className="text-center">
        <p className="text-5xl font-black text-slate-900">{progress}%</p>
        <p className="text-xs uppercase tracking-[0.25em] text-slate-500 font-bold mt-2">
          Progress
        </p>
      </div>
    </div>
  );
}

export function StudentPage() {
  const { user, isAuthenticated, isBootstrapping, login, logout } = useAuth();
  const [search, setSearch] = useState("");
  const [currentTime, setCurrentTime] = useState("");
  const [profile, setProfile] = useState<ApiProfile | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [modules, setModules] = useState<ApiModule[]>([]);
  const [stats, setStats] = useState<ApiStats | null>(null);
  const [submissions, setSubmissions] = useState<ApiSubmission[]>([]);
  const [dashboardError, setDashboardError] = useState<string | null>(null);
  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const isStudent = (user?.role ?? "").toLowerCase() === "student";

  useEffect(() => {
    if (!isAuthenticated || !isStudent) return;
    let isMounted = true;
    const controller = new AbortController();

    setDashboardLoading(true);
    setDashboardError(null);

    Promise.all([
      apiRequest<ApiProfile>("/profile/student/", { auth: true, signal: controller.signal }).catch(() => null),
      fetchAllPages<ApiAssignment>("/students/assignments/", { auth: true, signal: controller.signal }),
      fetchAllPages<ApiSession>("/dashboard/sessions/", { auth: true, signal: controller.signal }),
      fetchAllPages<ApiModule>("/dashboard/modules/", { auth: true, signal: controller.signal }),
      fetchAllPages<ApiSubmission>("/dashboard/submissions/", { auth: true, signal: controller.signal }),
      apiRequest<ApiStats>("/dashboard/stats/", { auth: true, signal: controller.signal }).catch(() => null),
    ])
      .then(([profileResponse, assignmentResponse, sessionResponse, moduleResponse, submissionResponse, statsResponse]) => {
        if (!isMounted) return;

        if (profileResponse) {
          setProfile(profileResponse);
        }

        const submissionsList = normalizeList<ApiSubmission>(submissionResponse);
        const submittedIds = new Set(
          submissionsList.map((submission) => submission.assignment ?? submission.assignment_id ?? submission.assignmentId)
        );
        setSubmissions(submissionsList);

        const mappedAssignments = normalizeList<ApiAssignment>(assignmentResponse).map((assignment, index) => {
          const subject =
            assignment.course_title ||
            assignment.courseTitle ||
            (typeof assignment.course === "object" ? assignment.course?.title : undefined) ||
            "Coursework";
          const due = formatDate(assignment.due_at || assignment.dueAt || assignment.due_date || assignment.dueDate);
          const assignmentId = assignment.id ?? index;
          return {
            id: assignmentId,
            title: assignment.title || assignment.name || "Untitled Assignment",
            subject,
            due,
            submitted: submittedIds.has(assignmentId),
          };
        });
        setAssignments(mappedAssignments);

        const mappedSessions = normalizeList<ApiSession>(sessionResponse).map((session, index) => {
          const instructor =
            session.instructor_name ||
            session.instructorName ||
            session.instructor ||
            session.instructor_detail?.name ||
            "Instructor TBD";
          const time = formatTime(session.start_at || session.startAt || session.time);
          return {
            id: session.id ?? index,
            title: session.title || session.name || "Session",
            time,
            instructor,
          };
        });
        setSessions(mappedSessions);

        setModules(normalizeList<ApiModule>(moduleResponse));
        setStats(statsResponse ?? null);
      })
      .catch((err) => {
        if (!isMounted) return;
        const message = err instanceof Error ? err.message : "Failed to load dashboard data.";
        setDashboardError(message);
      })
      .finally(() => {
        if (!isMounted) return;
        setDashboardLoading(false);
      });

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [isAuthenticated, isStudent]);

  const filteredAssignments = useMemo(() => {
    return assignments.filter((assignment) =>
      assignment.title.toLowerCase().includes(search.toLowerCase())
    );
  }, [assignments, search]);

  const displayProfile: StudentProfile = useMemo(() => {
    const fullName = pickFirst([
      [user?.first_name, user?.last_name].filter(Boolean).join(" ").trim(),
      user?.username,
    ]);
    const grade = pickFirst([profile?.grade, profile?.grade_level, profile?.class_level]) || "Student";
    const school =
      pickFirst([
        typeof profile?.school === "string" ? profile.school : profile?.school?.name,
        profile?.school_name,
      ]) ||
      "School";
    const rawProgress = stats?.progress ?? stats?.completion ?? 0;
    const progress = Math.max(0, Math.min(100, Number(rawProgress) || 0));

    return {
      name: fullName || "Student",
      grade,
      school,
      progress,
    };
  }, [profile, stats, user]);

  const classmatesCount = stats?.classmates ?? stats?.classmates_count ?? 0;
  const achievementsCount = stats?.achievements ?? stats?.badges ?? stats?.points ?? 0;
  const coursesCount = modules.length;
  const submittedCount = submissions.length;
  const upcomingSessionsCount = sessions.length;

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoginError(null);
    setIsLoggingIn(true);

    const result = await login(loginForm.username.trim(), loginForm.password);
    if (!result.ok) {
      setLoginError(result.error);
    } else {
      setLoginForm({ username: "", password: "" });
    }

    setIsLoggingIn(false);
  };

  if (isBootstrapping) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-700">
        Loading your dashboard...
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-6">
        <div className="max-w-md w-full bg-white border border-slate-200 shadow-lg">
          <div className="p-8 border-b border-slate-200 text-center">
            <div className="w-16 h-16 bg-blue-600 flex items-center justify-center rounded-xl mx-auto mb-4">
              <GraduationCap className="text-white w-7 h-7" />
            </div>
            <h1 className="text-2xl font-black uppercase tracking-tight">Student Sign In</h1>
            <p className="text-sm text-slate-500 mt-2">Access your learning dashboard.</p>
          </div>
          <form onSubmit={handleLogin} className="p-8 space-y-4">
            <input
              type="text"
              value={loginForm.username}
              onChange={(event) => setLoginForm((prev) => ({ ...prev, username: event.target.value }))}
              placeholder="Username"
              className="w-full border border-slate-300 bg-slate-50 px-4 py-3 focus:outline-none focus:border-blue-600"
              autoComplete="username"
              required
            />
            <input
              type="password"
              value={loginForm.password}
              onChange={(event) => setLoginForm((prev) => ({ ...prev, password: event.target.value }))}
              placeholder="Password"
              className="w-full border border-slate-300 bg-slate-50 px-4 py-3 focus:outline-none focus:border-blue-600"
              autoComplete="current-password"
              required
            />
            {loginError && <p className="text-sm text-red-600">{loginError}</p>}
            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full bg-blue-600 hover:bg-blue-700 transition text-white px-5 py-3 text-xs font-bold uppercase tracking-widest disabled:opacity-60"
            >
              {isLoggingIn ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (!isStudent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-6">
        <div className="max-w-lg w-full bg-white border border-slate-200 shadow-lg p-8 text-center">
          <h1 className="text-2xl font-black uppercase tracking-tight">Student Access Only</h1>
          <p className="text-sm text-slate-500 mt-2">Your account does not have student dashboard access.</p>
          <button
            onClick={logout}
            className="mt-6 bg-slate-900 hover:bg-slate-800 transition text-white px-5 py-3 text-xs font-bold uppercase tracking-widest"
          >
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 overflow-x-hidden">
      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-blue-600 flex items-center justify-center rounded-xl">
              <GraduationCap className="text-white w-7 h-7" />
            </div>

            <div>
              <h1 className="text-2xl font-black uppercase tracking-tight">
                Student Dashboard
              </h1>
              <p className="text-sm text-slate-500">
                BrailleEd Learning Platform
              </p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-6">
            <div className="text-right">
              <p className="text-xs uppercase tracking-widest text-slate-400 font-bold">
                Current Time
              </p>
              <p className="font-bold text-slate-700">{currentTime}</p>
            </div>

            <button
              aria-label="Notifications"
              className="relative p-3 rounded-xl bg-slate-100 hover:bg-slate-200 transition"
            >
              <Bell className="w-5 h-5 text-slate-700" />
            </button>

            <button
              onClick={logout}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold uppercase tracking-widest hover:bg-slate-800 transition"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 lg:px-12 py-10">
        {dashboardError && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {dashboardError}
          </div>
        )}

        {dashboardLoading && (
          <div className="mb-6 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500">
            Loading dashboard data...
          </div>
        )}

        {/* PROFILE SECTION */}
        <section className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-10">
          {/* PROFILE CARD */}
          <div className="bg-white border border-slate-200 shadow-sm p-8">
            <div className="flex items-center gap-5 mb-8">
              <div className="w-24 h-24 rounded-full bg-blue-600 flex items-center justify-center text-white text-4xl font-black">
                {displayProfile.name[0] ?? "S"}
              </div>

              <div>
                <h2 className="text-2xl font-black uppercase tracking-tight">
                  {displayProfile.name}
                </h2>

                <p className="text-slate-500 font-medium">
                  {displayProfile.grade}
                </p>

                <p className="text-sm text-slate-400 mt-1">
                  {displayProfile.school}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-100 p-5">
                <Users className="w-6 h-6 text-blue-600 mb-3" />
                <p className="text-3xl font-black">{classmatesCount}</p>
                <p className="text-xs uppercase tracking-widest text-slate-500 font-bold">
                  Classmates
                </p>
              </div>

              <div className="bg-slate-100 p-5">
                <Trophy className="w-6 h-6 text-blue-600 mb-3" />
                <p className="text-3xl font-black">{achievementsCount}</p>
                <p className="text-xs uppercase tracking-widest text-slate-500 font-bold">
                  Achievements
                </p>
              </div>
            </div>
          </div>

          {/* PROGRESS TRACKING */}
          <div className="bg-white border border-slate-200 shadow-sm p-8 flex flex-col items-center justify-center">
            <div className="border-l-4 border-blue-600 pl-4 mb-8 self-start">
              <h2 className="text-2xl font-black uppercase tracking-tight">
                Progress Tracking
              </h2>

              <p className="text-slate-500 mt-2">
                Monitor learning and course completion.
              </p>
            </div>

            <ProgressCircle progress={displayProfile.progress} />

            <div className="w-full mt-8">
              <div className="flex justify-between text-sm font-bold mb-2">
                <span>Course Completion</span>
                <span>{displayProfile.progress}%</span>
              </div>

              <div className="w-full h-4 bg-slate-200 overflow-hidden rounded-full">
                <div
                  className="h-full bg-blue-600 rounded-full"
                  style={{ width: `${displayProfile.progress}%` }}
                />
              </div>
            </div>
          </div>

          {/* QUICK STATS */}
          <div className="grid grid-cols-1 gap-6">
            {[
              {
                icon: BookOpen,
                title: "Courses Enrolled",
                value: coursesCount.toString(),
              },
              {
                icon: CheckCircle,
                title: "Assignments Submitted",
                value: submittedCount.toString(),
              },
              {
                icon: Calendar,
                title: "Upcoming Sessions",
                value: upcomingSessionsCount.toString(),
              },
              {
                icon: Trophy,
                title: "Achievements",
                value: achievementsCount.toString(),
              },
            ].map((item, index) => (
              <div
                key={index}
                className="bg-white border border-slate-200 shadow-sm p-6 flex items-center gap-5"
              >
                <div className="w-16 h-16 bg-blue-100 flex items-center justify-center rounded-xl">
                  <item.icon className="w-8 h-8 text-blue-600" />
                </div>

                <div>
                  <p className="text-3xl font-black">{item.value}</p>
                  <p className="text-sm uppercase tracking-widest text-slate-500 font-bold">
                    {item.title}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* COURSES & MODULES */}
        <section className="bg-white border border-slate-200 shadow-sm p-8 mb-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 mb-8">
            <div className="border-l-4 border-blue-600 pl-4">
              <h2 className="text-3xl font-black uppercase tracking-tight">
                Courses & Modules
              </h2>
              <p className="text-slate-500 mt-2">
                Keep track of your enrolled modules and progress.
              </p>
            </div>
          </div>

          {modules.length === 0 ? (
            <div className="border border-slate-200 p-6 text-sm text-slate-500">
              No modules assigned yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {modules.map((module, index) => {
                const moduleTitle = module.title || module.name || `Module ${index + 1}`;
                const progressValue = Math.max(0, Math.min(100, Number(module.progress ?? 0)));
                return (
                  <div
                    key={module.id ?? `${moduleTitle}-${index}`}
                    className="border border-slate-200 p-6 flex flex-col gap-4"
                  >
                    <div>
                      <h3 className="text-xl font-black tracking-tight">{moduleTitle}</h3>
                      <p className="text-xs uppercase tracking-widest text-slate-400 font-bold mt-2">
                        Progress
                      </p>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm font-bold mb-2">
                        <span>Completion</span>
                        <span>{progressValue}%</span>
                      </div>
                      <div className="w-full h-3 bg-slate-200 overflow-hidden rounded-full">
                        <div
                          className="h-full bg-blue-600 rounded-full"
                          style={{ width: `${progressValue}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* ASSIGNMENTS */}
        <section className="bg-white border border-slate-200 shadow-sm p-8 mb-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 mb-8">
            <div className="border-l-4 border-blue-600 pl-4">
              <h2 className="text-3xl font-black uppercase tracking-tight">
                Assignments & Submissions
              </h2>

              <p className="text-slate-500 mt-2">
                Track tasks, due dates, and submissions.
              </p>
            </div>

            {/* SEARCH */}
            <div className="relative w-full md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />

              <input
                type="text"
                placeholder="Search assignments..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full border border-slate-300 bg-slate-50 pl-12 pr-4 py-3 focus:outline-none focus:border-blue-600"
              />
            </div>
          </div>

          <div className="space-y-5">
            {filteredAssignments.length === 0 ? (
              <div className="border border-slate-200 p-6 text-sm text-slate-500">
                No assignments to show right now.
              </div>
            ) : (
              filteredAssignments.map((assignment) => (
                <div
                  key={assignment.id}
                  className="border border-slate-200 hover:border-blue-600 transition-all p-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5"
                >
                  <div>
                    <h3 className="text-xl font-black tracking-tight">
                      {assignment.title}
                    </h3>

                    <p className="text-slate-500 mt-1">
                      {assignment.subject}
                    </p>
                  </div>

                  <div className="flex flex-col md:flex-row gap-4 md:items-center">
                    <div className="flex items-center gap-2 text-slate-500 text-sm">
                      <Clock className="w-4 h-4" />
                      Due: {assignment.due}
                    </div>

                    <span
                      className={`px-4 py-2 text-xs font-bold uppercase tracking-widest ${
                        assignment.submitted
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {assignment.submitted
                        ? "Submitted"
                        : "Pending"}
                    </span>

                    <button className="bg-blue-600 hover:bg-blue-700 transition text-white px-5 py-3 text-xs font-bold uppercase tracking-widest">
                      View Submission
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* CLASS SESSIONS */}
        <section className="bg-slate-900 text-white p-8">
          <div className="border-l-4 border-blue-500 pl-4 mb-10">
            <h2 className="text-3xl font-black uppercase tracking-tight">
              Class Sessions
            </h2>

            <p className="text-slate-400 mt-2">
              Upcoming live learning sessions and workshops.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {sessions.length === 0 ? (
              <div className="bg-white/5 border border-white/10 p-6 text-slate-300">
                No upcoming sessions available yet.
              </div>
            ) : (
              sessions.map((session) => (
                <div
                  key={session.id}
                  className="bg-white/5 border border-white/10 p-6 hover:bg-white/10 transition"
                >
                  <div className="w-14 h-14 bg-blue-600 flex items-center justify-center mb-6">
                    <FileText className="w-7 h-7 text-white" />
                  </div>

                  <h3 className="text-2xl font-black mb-3">
                    {session.title}
                  </h3>

                  <p className="text-slate-300 mb-2">
                    Instructor: {session.instructor}
                  </p>

                  <p className="text-blue-400 font-bold uppercase tracking-widest text-sm">
                    {session.time}
                  </p>

                  <button className="mt-6 w-full border border-white/20 hover:bg-blue-600 hover:border-blue-600 transition px-5 py-3 text-xs font-bold uppercase tracking-widest">
                    Join Session
                  </button>
                </div>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
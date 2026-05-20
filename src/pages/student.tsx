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
} from "lucide-react";

type Assignment = {
  id: number;
  title: string;
  subject: string;
  due: string;
  submitted: boolean;
};

type Session = {
  id: number;
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

const STUDENT: StudentProfile = {
  name: "Isaiah Wambani",
  grade: "Software Development",
  school: "BrailleEd STEM Academy",
  progress: 78,
};

const ASSIGNMENTS: Assignment[] = [
  {
    id: 1,
    title: "Robot Navigation Logic",
    subject: "Programming",
    due: "Tomorrow",
    submitted: false,
  },
  {
    id: 2,
    title: "Braille Sensor Activity",
    subject: "Engineering",
    due: "Friday",
    submitted: true,
  },
  {
    id: 3,
    title: "Voice Command Simulation",
    subject: "AI Robotics",
    due: "Next Week",
    submitted: false,
  },
];

const SESSIONS: Session[] = [
  {
    id: 1,
    title: "Accessible Coding Workshop",
    time: "10:00 AM",
    instructor: "Ruth Mungai",
  },
  {
    id: 2,
    title: "Robotics Lab Session",
    time: "1:30 PM",
    instructor: "Brian Mokaya",
  },
  {
    id: 3,
    title: "Frontend Development Mentorship",
    time: "4:00 PM",
    instructor: "Ann Nyokabi",
  },
];

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
  const [search, setSearch] = useState("");
  const [currentTime, setCurrentTime] = useState("");

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

  const filteredAssignments = useMemo(() => {
    return ASSIGNMENTS.filter((assignment) =>
      assignment.title.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

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
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 lg:px-12 py-10">
        {/* PROFILE SECTION */}
        <section className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-10">
          {/* PROFILE CARD */}
          <div className="bg-white border border-slate-200 shadow-sm p-8">
            <div className="flex items-center gap-5 mb-8">
              <div className="w-24 h-24 rounded-full bg-blue-600 flex items-center justify-center text-white text-4xl font-black">
                {STUDENT.name[0]}
              </div>

              <div>
                <h2 className="text-2xl font-black uppercase tracking-tight">
                  {STUDENT.name}
                </h2>

                <p className="text-slate-500 font-medium">
                  {STUDENT.grade}
                </p>

                <p className="text-sm text-slate-400 mt-1">
                  {STUDENT.school}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-100 p-5">
                <Users className="w-6 h-6 text-blue-600 mb-3" />
                <p className="text-3xl font-black">12</p>
                <p className="text-xs uppercase tracking-widest text-slate-500 font-bold">
                  Classmates
                </p>
              </div>

              <div className="bg-slate-100 p-5">
                <Trophy className="w-6 h-6 text-blue-600 mb-3" />
                <p className="text-3xl font-black">5</p>
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

            <ProgressCircle progress={STUDENT.progress} />

            <div className="w-full mt-8">
              <div className="flex justify-between text-sm font-bold mb-2">
                <span>Course Completion</span>
                <span>{STUDENT.progress}%</span>
              </div>

              <div className="w-full h-4 bg-slate-200 overflow-hidden rounded-full">
                <div
                  className="h-full bg-blue-600 rounded-full"
                  style={{ width: `${STUDENT.progress}%` }}
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
                value: "8",
              },
              {
                icon: CheckCircle,
                title: "Assignments Submitted",
                value: "21",
              },
              {
                icon: Calendar,
                title: "Upcoming Sessions",
                value: "3",
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
            {filteredAssignments.map((assignment) => (
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
            ))}
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
            {SESSIONS.map((session) => (
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
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
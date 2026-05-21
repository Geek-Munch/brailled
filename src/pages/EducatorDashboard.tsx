import { useEffect, useMemo, useState } from "react";
import { apiRequest, fetchAllPages } from "../lib/api-client";
import { useAuth } from "../contexts/AuthContext";

type EducatorProfile = {
  id: number;
  username: string;
  email: string;
  schools: number[];
  department: string;
  employee_id: string | null;
};

type School = { id: number; name: string };
type Course = { id: number; title: string; description: string; is_published: boolean };
type Module = { id: number; course: number; title: string; description: string; order: number };
type Lesson = { id: number; module: number; title: string; content: string; order: number; content_pdf?: string | null; content_pdf_url?: string | null };
type Assignment = { id: number; title: string; description: string; due_at: string | null; course?: { id: number; title: string } };
type Session = { id: number; title: string; start_at: string; end_at: string; location: string };
type Submission = {
  id: number;
  status: string;
  grade: string;
  submitted_at: string;
  assignment?: { id: number; title: string; course?: { title: string } };
};

type Tab = "overview" | "profile" | "curriculum" | "assignments" | "sessions" | "submissions";

async function getList<T>(path: string): Promise<T[]> {
  const payload = await apiRequest<any>(path, { auth: true });
  return Array.isArray(payload) ? payload : payload?.results ?? [];
}

export function EducatorDashboard() {
  const { user, isAuthenticated, isBootstrapping, login, logout } = useAuth();
  const [tab, setTab] = useState<Tab>("overview");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  const [profile, setProfile] = useState<EducatorProfile | null>(null);
  const [schools, setSchools] = useState<School[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);

  const isEducatorUser = ["educator", "admin", "superuser"].includes((user?.role ?? "").toLowerCase());

  const loadAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const [p, s, c, m, l, a, cs, sub] = await Promise.all([
        apiRequest<EducatorProfile>("/profile/educator/", { auth: true }),
        fetchAllPages<School>("/schools/schools/", { auth: true }).catch(() => []),
        fetchAllPages<Course>("/courses/courses/", { auth: true }),
        fetchAllPages<Module>("/courses/modules/", { auth: true }),
        fetchAllPages<Lesson>("/courses/lessons/", { auth: true }),
        fetchAllPages<Assignment>("/students/assignments/", { auth: true }),
        fetchAllPages<Session>("/students/class-sessions/", { auth: true }),
        fetchAllPages<Submission>("/students/submissions/", { auth: true }),
      ]);
      setProfile(p);
      setSchools(s);
      setCourses(c);
      setModules(m);
      setLessons(l);
      setAssignments(a);
      setSessions(cs);
      setSubmissions(sub);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load educator data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && isEducatorUser) loadAll();
  }, [isAuthenticated, isEducatorUser]);

  const overview = useMemo(() => ({
    courses: courses.length,
    modules: modules.length,
    lessons: lessons.length,
    assignments: assignments.length,
    sessions: sessions.length,
    submissions: submissions.length,
  }), [courses, modules, lessons, assignments, sessions, submissions]);
  const tabItems: Tab[] = ["overview", "profile", "curriculum", "assignments", "sessions", "submissions"];

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

  if (isBootstrapping) return <div className="min-h-screen flex items-center justify-center">Loading session...</div>;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50">
        <form onSubmit={handleLogin} className="w-full max-w-md bg-white border border-gray-200 rounded-xl p-6 space-y-3">
          <h1 className="text-xl font-bold text-gray-900">Educator Sign In</h1>
          <input value={username} onChange={(e) => setUsername(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2" placeholder="Username" required />
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2" placeholder="Password" required />
          {loginError && <p className="text-sm text-red-600">{loginError}</p>}
          <button type="submit" className="w-full bg-blue-600 text-white rounded-lg py-2 font-semibold">Sign In</button>
        </form>
      </div>
    );
  }

  if (!isEducatorUser) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50">
        <div className="max-w-md w-full bg-white border border-gray-200 rounded-xl p-6 text-center">
          <h2 className="text-xl font-bold text-gray-900">Educator Access Required</h2>
          <p className="text-sm text-gray-500 mt-2">This account cannot access the educator dashboard.</p>
          <button onClick={logout} className="mt-4 bg-blue-600 text-white rounded-lg py-2 px-4 font-semibold">Sign Out</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,_#dbeafe_0%,_#eff6ff_32%,_#f8fafc_66%)]">
      <header className="bg-gradient-to-r from-slate-900 via-blue-900 to-cyan-800 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-7 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-cyan-200 font-semibold">BrailleEd Platform</p>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight">Educator Command Center</h1>
            <p className="text-sm text-cyan-100 mt-1">Plan curriculum, manage classes, and track delivery</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={loadAll} className="bg-white/15 hover:bg-white/20 border border-white/30 rounded-lg px-4 py-2 text-sm font-semibold">Refresh</button>
            <button onClick={logout} className="bg-white text-blue-700 hover:bg-blue-50 rounded-lg px-4 py-2 text-sm font-semibold">Sign Out</button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-6 space-y-5">
        <div className="bg-white/90 backdrop-blur border border-slate-200 rounded-2xl p-3 flex flex-wrap gap-2 shadow-sm">
          {tabItems.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition ${tab === t ? "bg-gradient-to-r from-blue-700 to-cyan-600 text-white shadow" : "bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100"}`}
            >
              {t}
            </button>
          ))}
        </div>

        {error && <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3">{error}</p>}
        {status && <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-3">{status}</p>}
        {loading && <p className="text-sm text-slate-600 bg-white border border-slate-200 rounded-lg px-4 py-3">Loading...</p>}

        {tab === "overview" && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {Object.entries(overview).map(([k, v]) => (
              <div key={k} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                <p className="text-xs uppercase tracking-wider text-slate-500">{k.replace("_", " ")}</p>
                <p className="text-2xl font-black text-slate-900 mt-1">{v}</p>
                <div className="mt-3 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full w-2/3 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "profile" && profile && (
          <ProfilePanel profile={profile} schools={schools} onSaved={(p) => { setProfile(p); setStatus("Profile updated."); }} onError={setError} />
        )}

        {tab === "curriculum" && (
          <CurriculumBuilder
            courses={courses}
            modules={modules}
            lessons={lessons}
            reload={loadAll}
            setStatus={setStatus}
            setError={setError}
          />
        )}

        {tab === "assignments" && (
          <CrudPanel
            title="Assignments"
            items={assignments.map((a) => ({ ...a, course_id: a.course?.id ?? "" }))}
            columns={["id", "title", "description", "due_at", "course_id"]}
            createFields={{ title: "", description: "", due_at: "", course_id: courses[0]?.id ?? "" }}
            onCreate={(payload) => apiRequest("/students/assignments/", { method: "POST", auth: true, body: payload })}
            onUpdate={(id, payload) => apiRequest(`/students/assignments/${id}/`, { method: "PATCH", auth: true, body: payload })}
            onDelete={(id) => apiRequest(`/students/assignments/${id}/`, { method: "DELETE", auth: true })}
            reload={loadAll}
            setStatus={setStatus}
            setError={setError}
          />
        )}

        {tab === "sessions" && (
          <CrudPanel
            title="Class Sessions"
            items={sessions}
            columns={["id", "title", "start_at", "end_at", "location"]}
            createFields={{ title: "", start_at: "", end_at: "", location: "", educator: profile?.id ?? "", school: profile?.schools?.[0] ?? "" }}
            onCreate={(payload) => apiRequest("/students/class-sessions/", { method: "POST", auth: true, body: payload })}
            onUpdate={(id, payload) => apiRequest(`/students/class-sessions/${id}/`, { method: "PATCH", auth: true, body: payload })}
            onDelete={(id) => apiRequest(`/students/class-sessions/${id}/`, { method: "DELETE", auth: true })}
            reload={loadAll}
            setStatus={setStatus}
            setError={setError}
          />
        )}

        {tab === "submissions" && (
          <CrudPanel
            title="Submissions (educator can update status/grade)"
            items={submissions.map((s) => ({ ...s, assignment_title: s.assignment?.title ?? "", course: s.assignment?.course?.title ?? "" }))}
            columns={["id", "assignment_title", "course", "status", "grade", "submitted_at"]}
            createDisabled
            createFields={{}}
            onCreate={async () => null}
            onUpdate={(id, payload) => apiRequest(`/students/submissions/${id}/`, { method: "PATCH", auth: true, body: payload })}
            onDelete={(id) => apiRequest(`/students/submissions/${id}/`, { method: "DELETE", auth: true })}
            reload={loadAll}
            setStatus={setStatus}
            setError={setError}
            editableFields={["status", "grade"]}
          />
        )}
      </main>
    </div>
  );
}

function ProfilePanel({
  profile,
  schools,
  onSaved,
  onError,
}: {
  profile: EducatorProfile;
  schools: School[];
  onSaved: (profile: EducatorProfile) => void;
  onError: (message: string | null) => void;
}) {
  const [department, setDepartment] = useState(profile.department ?? "");
  const [employeeId, setEmployeeId] = useState(profile.employee_id ?? "");
  const [selectedSchools, setSelectedSchools] = useState<number[]>(profile.schools ?? []);

  useEffect(() => {
    setDepartment(profile.department ?? "");
    setEmployeeId(profile.employee_id ?? "");
    setSelectedSchools(profile.schools ?? []);
  }, [profile]);

  const save = async () => {
    onError(null);
    try {
      const updated = await apiRequest<EducatorProfile>("/profile/educator/", {
        method: "PATCH",
        auth: true,
        body: { department, employee_id: employeeId, schools: selectedSchools },
      });
      onSaved(updated);
    } catch (e) {
      onError(e instanceof Error ? e.message : "Failed to update profile.");
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 max-w-2xl shadow-sm">
      <h2 className="text-lg font-black text-slate-900">Educator Profile</h2>
      <div className="grid md:grid-cols-2 gap-3">
        <input value={profile.username} disabled className="border border-slate-300 rounded-lg px-3 py-2 bg-slate-50" />
        <input value={profile.email} disabled className="border border-slate-300 rounded-lg px-3 py-2 bg-slate-50" />
      </div>
      <input value={department} onChange={(e) => setDepartment(e.target.value)} placeholder="Department" className="w-full border border-slate-300 rounded-lg px-3 py-2" />
      <input value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} placeholder="Employee ID" className="w-full border border-slate-300 rounded-lg px-3 py-2" />
      <div className="border border-slate-300 rounded-lg p-3 max-h-48 overflow-y-auto">
        {schools.map((school) => (
          <label key={school.id} className="flex items-center gap-2 py-1 text-sm">
            <input
              type="checkbox"
              checked={selectedSchools.includes(school.id)}
              onChange={(e) =>
                setSelectedSchools((prev) =>
                  e.target.checked ? [...prev, school.id] : prev.filter((id) => id !== school.id)
                )
              }
            />
            <span>{school.name}</span>
          </label>
        ))}
      </div>
      <button onClick={save} className="bg-gradient-to-r from-blue-700 to-cyan-600 hover:from-blue-800 hover:to-cyan-700 text-white rounded-lg px-4 py-2 text-sm font-semibold shadow">Save Profile</button>
    </div>
  );
}

function CurriculumBuilder({
  courses,
  modules,
  lessons,
  reload,
  setStatus,
  setError,
}: {
  courses: Course[];
  modules: Module[];
  lessons: Lesson[];
  reload: () => Promise<void>;
  setStatus: (message: string | null) => void;
  setError: (message: string | null) => void;
}) {
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(courses[0]?.id ?? null);
  const [selectedModuleId, setSelectedModuleId] = useState<number | null>(null);
  const [courseForm, setCourseForm] = useState({ title: "", description: "", is_published: false });
  const [moduleForm, setModuleForm] = useState({ title: "", description: "", order: 0 });
  const [lessonForm, setLessonForm] = useState({ title: "", content: "", order: 0 });
  const [lessonPdf, setLessonPdf] = useState<File | null>(null);
  const [editingCourseId, setEditingCourseId] = useState<number | null>(null);
  const [editingModuleId, setEditingModuleId] = useState<number | null>(null);
  const [editingLessonId, setEditingLessonId] = useState<number | null>(null);
  const [courseEditForm, setCourseEditForm] = useState({ title: "", description: "", is_published: false });
  const [moduleEditForm, setModuleEditForm] = useState({ title: "", description: "", order: 0 });
  const [lessonEditForm, setLessonEditForm] = useState({ title: "", content: "", order: 0 });

  useEffect(() => {
    if (!selectedCourseId && courses[0]) setSelectedCourseId(courses[0].id);
  }, [courses, selectedCourseId]);

  const courseModules = modules.filter((module) => module.course === selectedCourseId);
  const moduleLessons = lessons.filter((lesson) => lesson.module === selectedModuleId);

  const createCourse = async () => {
    setError(null);
    try {
      await apiRequest("/courses/courses/", { method: "POST", auth: true, body: courseForm });
      setStatus("Course created.");
      setCourseForm({ title: "", description: "", is_published: false });
      await reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create course.");
    }
  };

  const startEditCourse = (course: Course) => {
    setEditingCourseId(course.id);
    setCourseEditForm({
      title: course.title,
      description: course.description ?? "",
      is_published: Boolean(course.is_published),
    });
  };

  const saveCourseEdit = async () => {
    if (!editingCourseId) return;
    setError(null);
    try {
      await apiRequest(`/courses/courses/${editingCourseId}/`, { method: "PATCH", auth: true, body: courseEditForm });
      setStatus("Course updated.");
      setEditingCourseId(null);
      await reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update course.");
    }
  };

  const deleteCourse = async (id: number) => {
    setError(null);
    try {
      await apiRequest(`/courses/courses/${id}/`, { method: "DELETE", auth: true });
      setStatus("Course deleted.");
      if (selectedCourseId === id) {
        setSelectedCourseId(null);
        setSelectedModuleId(null);
      }
      await reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete course.");
    }
  };

  const createModule = async () => {
    if (!selectedCourseId) return;
    setError(null);
    try {
      await apiRequest("/courses/modules/", { method: "POST", auth: true, body: { ...moduleForm, course: selectedCourseId } });
      setStatus("Module created.");
      setModuleForm({ title: "", description: "", order: 0 });
      await reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create module.");
    }
  };

  const startEditModule = (module: Module) => {
    setEditingModuleId(module.id);
    setModuleEditForm({
      title: module.title,
      description: module.description ?? "",
      order: module.order ?? 0,
    });
  };

  const saveModuleEdit = async () => {
    if (!editingModuleId) return;
    setError(null);
    try {
      await apiRequest(`/courses/modules/${editingModuleId}/`, { method: "PATCH", auth: true, body: moduleEditForm });
      setStatus("Module updated.");
      setEditingModuleId(null);
      await reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update module.");
    }
  };

  const deleteModule = async (id: number) => {
    setError(null);
    try {
      await apiRequest(`/courses/modules/${id}/`, { method: "DELETE", auth: true });
      setStatus("Module deleted.");
      if (selectedModuleId === id) setSelectedModuleId(null);
      await reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete module.");
    }
  };

  const createLesson = async () => {
    if (!selectedModuleId) return;
    setError(null);
    try {
      const body = new FormData();
      body.append("module", String(selectedModuleId));
      body.append("title", lessonForm.title);
      body.append("content", lessonForm.content);
      body.append("order", String(lessonForm.order));
      if (lessonPdf) {
        body.append("content_pdf", lessonPdf);
      }
      await apiRequest("/courses/lessons/", { method: "POST", auth: true, body });
      setStatus("Lesson created.");
      setLessonForm({ title: "", content: "", order: 0 });
      setLessonPdf(null);
      await reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create lesson.");
    }
  };

  const startEditLesson = (lesson: Lesson) => {
    setEditingLessonId(lesson.id);
    setLessonEditForm({
      title: lesson.title,
      content: lesson.content ?? "",
      order: lesson.order ?? 0,
    });
  };

  const saveLessonEdit = async () => {
    if (!editingLessonId) return;
    setError(null);
    try {
      await apiRequest(`/courses/lessons/${editingLessonId}/`, { method: "PATCH", auth: true, body: lessonEditForm });
      setStatus("Lesson updated.");
      setEditingLessonId(null);
      await reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update lesson.");
    }
  };

  const deleteLesson = async (id: number) => {
    setError(null);
    try {
      await apiRequest(`/courses/lessons/${id}/`, { method: "DELETE", auth: true });
      setStatus("Lesson deleted.");
      await reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete lesson.");
    }
  };

  return (
    <div className="grid xl:grid-cols-3 gap-4">
      <div className="bg-white/95 backdrop-blur border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
        <h3 className="text-sm font-black uppercase tracking-wider text-slate-900">1. Courses</h3>
        <div className="space-y-2 max-h-80 overflow-auto">
          {courses.map((course) => (
            <div key={course.id} className={`rounded-lg px-3 py-2 border text-sm ${selectedCourseId === course.id ? "bg-blue-600 text-white border-blue-600" : "bg-slate-50 border-slate-200 text-slate-700"}`}>
              {editingCourseId === course.id ? (
                <div className="space-y-2">
                  <input value={courseEditForm.title} onChange={(e) => setCourseEditForm((p) => ({ ...p, title: e.target.value }))} className="w-full text-slate-900 border border-slate-300 rounded px-2 py-1" />
                  <textarea value={courseEditForm.description} onChange={(e) => setCourseEditForm((p) => ({ ...p, description: e.target.value }))} className="w-full text-slate-900 border border-slate-300 rounded px-2 py-1" rows={2} />
                  <label className="flex items-center gap-2 text-xs text-white"><input type="checkbox" checked={courseEditForm.is_published} onChange={(e) => setCourseEditForm((p) => ({ ...p, is_published: e.target.checked }))} /> Published</label>
                  <div className="flex gap-2">
                    <button onClick={saveCourseEdit} className="text-xs bg-white text-blue-700 rounded px-2 py-1 font-semibold">Save</button>
                    <button onClick={() => setEditingCourseId(null)} className="text-xs bg-white/20 text-white rounded px-2 py-1 font-semibold">Cancel</button>
                  </div>
                </div>
              ) : (
                <>
                  <button onClick={() => { setSelectedCourseId(course.id); setSelectedModuleId(null); }} className="w-full text-left">
                    <div className="font-semibold">{course.title}</div>
                    <div className={`text-xs ${selectedCourseId === course.id ? "text-blue-100" : "text-slate-500"}`}>{course.is_published ? "Published" : "Draft"}</div>
                  </button>
                  <div className="mt-2 flex gap-2">
                    <button onClick={() => startEditCourse(course)} className={`text-xs font-semibold ${selectedCourseId === course.id ? "text-white" : "text-blue-700"}`}>Edit</button>
                    <button onClick={() => deleteCourse(course.id)} className={`text-xs font-semibold ${selectedCourseId === course.id ? "text-red-100" : "text-red-700"}`}>Delete</button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
        <div className="pt-2 border-t border-slate-200 space-y-2">
          <input value={courseForm.title} onChange={(e) => setCourseForm((p) => ({ ...p, title: e.target.value }))} placeholder="Course title" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
          <textarea value={courseForm.description} onChange={(e) => setCourseForm((p) => ({ ...p, description: e.target.value }))} placeholder="Course description" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" rows={2} />
          <label className="flex items-center gap-2 text-xs text-slate-700"><input type="checkbox" checked={courseForm.is_published} onChange={(e) => setCourseForm((p) => ({ ...p, is_published: e.target.checked }))} /> Published</label>
          <button onClick={createCourse} className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-3 py-2 text-sm font-semibold">Add Course</button>
        </div>
      </div>

      <div className="bg-white/95 backdrop-blur border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
        <h3 className="text-sm font-black uppercase tracking-wider text-slate-900">2. Modules</h3>
        {!selectedCourseId && <p className="text-sm text-slate-500">Select a course first.</p>}
        <div className="space-y-2 max-h-80 overflow-auto">
          {courseModules.map((module) => (
            <div key={module.id} className={`rounded-lg px-3 py-2 border text-sm ${selectedModuleId === module.id ? "bg-blue-600 text-white border-blue-600" : "bg-slate-50 border-slate-200 text-slate-700"}`}>
              {editingModuleId === module.id ? (
                <div className="space-y-2">
                  <input value={moduleEditForm.title} onChange={(e) => setModuleEditForm((p) => ({ ...p, title: e.target.value }))} className="w-full text-slate-900 border border-slate-300 rounded px-2 py-1" />
                  <textarea value={moduleEditForm.description} onChange={(e) => setModuleEditForm((p) => ({ ...p, description: e.target.value }))} className="w-full text-slate-900 border border-slate-300 rounded px-2 py-1" rows={2} />
                  <input type="number" value={moduleEditForm.order} onChange={(e) => setModuleEditForm((p) => ({ ...p, order: Number(e.target.value) }))} className="w-full text-slate-900 border border-slate-300 rounded px-2 py-1" />
                  <div className="flex gap-2">
                    <button onClick={saveModuleEdit} className="text-xs bg-white text-blue-700 rounded px-2 py-1 font-semibold">Save</button>
                    <button onClick={() => setEditingModuleId(null)} className="text-xs bg-white/20 text-white rounded px-2 py-1 font-semibold">Cancel</button>
                  </div>
                </div>
              ) : (
                <>
                  <button onClick={() => setSelectedModuleId(module.id)} className="w-full text-left">
                    <div className="font-semibold">{module.title}</div>
                    <div className={`text-xs ${selectedModuleId === module.id ? "text-blue-100" : "text-slate-500"}`}>Order {module.order}</div>
                  </button>
                  <div className="mt-2 flex gap-2">
                    <button onClick={() => startEditModule(module)} className={`text-xs font-semibold ${selectedModuleId === module.id ? "text-white" : "text-blue-700"}`}>Edit</button>
                    <button onClick={() => deleteModule(module.id)} className={`text-xs font-semibold ${selectedModuleId === module.id ? "text-red-100" : "text-red-700"}`}>Delete</button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
        <div className="pt-2 border-t border-slate-200 space-y-2">
          <input value={moduleForm.title} onChange={(e) => setModuleForm((p) => ({ ...p, title: e.target.value }))} placeholder="Module title" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
          <textarea value={moduleForm.description} onChange={(e) => setModuleForm((p) => ({ ...p, description: e.target.value }))} placeholder="Module description" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" rows={2} />
          <input type="number" value={moduleForm.order} onChange={(e) => setModuleForm((p) => ({ ...p, order: Number(e.target.value) }))} placeholder="Order" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
          <button onClick={createModule} disabled={!selectedCourseId} className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg px-3 py-2 text-sm font-semibold">Add Module</button>
        </div>
      </div>

      <div className="bg-white/95 backdrop-blur border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
        <h3 className="text-sm font-black uppercase tracking-wider text-slate-900">3. Lessons</h3>
        {!selectedModuleId && <p className="text-sm text-slate-500">Select a module first.</p>}
        <div className="space-y-2 max-h-80 overflow-auto">
          {moduleLessons.map((lesson) => (
            <div key={lesson.id} className="rounded-lg px-3 py-2 border bg-slate-50 border-slate-200 text-sm text-slate-700">
              {editingLessonId === lesson.id ? (
                <div className="space-y-2">
                  <input value={lessonEditForm.title} onChange={(e) => setLessonEditForm((p) => ({ ...p, title: e.target.value }))} className="w-full border border-slate-300 rounded px-2 py-1" />
                  <textarea value={lessonEditForm.content} onChange={(e) => setLessonEditForm((p) => ({ ...p, content: e.target.value }))} className="w-full border border-slate-300 rounded px-2 py-1" rows={2} />
                  <input type="number" value={lessonEditForm.order} onChange={(e) => setLessonEditForm((p) => ({ ...p, order: Number(e.target.value) }))} className="w-full border border-slate-300 rounded px-2 py-1" />
                  <div className="flex gap-2">
                    <button onClick={saveLessonEdit} className="text-xs bg-blue-600 text-white rounded px-2 py-1 font-semibold">Save</button>
                    <button onClick={() => setEditingLessonId(null)} className="text-xs bg-slate-200 text-slate-700 rounded px-2 py-1 font-semibold">Cancel</button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="font-semibold">{lesson.title}</div>
                  <div className="text-xs text-slate-500">Order {lesson.order}</div>
                  {lesson.content_pdf_url && (
                    <a href={lesson.content_pdf_url} target="_blank" rel="noreferrer" className="text-xs text-blue-700 underline">
                      View PDF
                    </a>
                  )}
                  <div className="mt-2 flex gap-2">
                    <button onClick={() => startEditLesson(lesson)} className="text-xs text-blue-700 font-semibold">Edit</button>
                    <button onClick={() => deleteLesson(lesson.id)} className="text-xs text-red-700 font-semibold">Delete</button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
        <div className="pt-2 border-t border-slate-200 space-y-2">
          <input value={lessonForm.title} onChange={(e) => setLessonForm((p) => ({ ...p, title: e.target.value }))} placeholder="Lesson title" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
          <textarea value={lessonForm.content} onChange={(e) => setLessonForm((p) => ({ ...p, content: e.target.value }))} placeholder="Lesson content" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" rows={3} />
          <input type="number" value={lessonForm.order} onChange={(e) => setLessonForm((p) => ({ ...p, order: Number(e.target.value) }))} placeholder="Order" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
          <input
            type="file"
            accept="application/pdf,.pdf"
            onChange={(e) => setLessonPdf(e.target.files?.[0] ?? null)}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white"
          />
          <button onClick={createLesson} disabled={!selectedModuleId} className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg px-3 py-2 text-sm font-semibold">Add Lesson</button>
        </div>
      </div>
    </div>
  );
}

function CrudPanel({
  title,
  items,
  columns,
  createFields,
  onCreate,
  onUpdate,
  onDelete,
  reload,
  setStatus,
  setError,
  createDisabled,
  editableFields,
}: {
  title: string;
  items: any[];
  columns: string[];
  createFields: Record<string, any>;
  onCreate: (payload: any) => Promise<any>;
  onUpdate: (id: number, payload: any) => Promise<any>;
  onDelete: (id: number) => Promise<any>;
  reload: () => Promise<void>;
  setStatus: (message: string | null) => void;
  setError: (message: string | null) => void;
  createDisabled?: boolean;
  editableFields?: string[];
}) {
  const [form, setForm] = useState<Record<string, any>>(createFields);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Record<string, any>>({});

  useEffect(() => setForm(createFields), [JSON.stringify(createFields)]);

  const create = async () => {
    setError(null);
    setStatus(null);
    try {
      await onCreate(form);
      setStatus(`${title.slice(0, -1)} created.`);
      setForm(createFields);
      await reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : `Failed to create ${title.toLowerCase()}.`);
    }
  };

  const startEdit = (item: any) => {
    setEditingId(item.id);
    const editable = editableFields ?? Object.keys(item).filter((k) => !["id"].includes(k));
    const picked: Record<string, any> = {};
    editable.forEach((key) => {
      picked[key] = item[key] ?? "";
    });
    setEditForm(picked);
  };

  const saveEdit = async () => {
    if (!editingId) return;
    setError(null);
    setStatus(null);
    try {
      await onUpdate(editingId, editForm);
      setStatus(`${title.slice(0, -1)} updated.`);
      setEditingId(null);
      await reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : `Failed to update ${title.toLowerCase()}.`);
    }
  };

  const remove = async (id: number) => {
    setError(null);
    setStatus(null);
    try {
      await onDelete(id);
      setStatus(`${title.slice(0, -1)} deleted.`);
      if (editingId === id) setEditingId(null);
      await reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : `Failed to delete ${title.toLowerCase()}.`);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <h2 className="text-lg font-black text-slate-900">{title}</h2>
        {!createDisabled && (
          <div className="grid md:grid-cols-2 gap-3 mt-4">
            {Object.keys(form).map((key) => (
              <input
                key={key}
                value={form[key] as any}
                onChange={(e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))}
                placeholder={key}
                className="border border-slate-300 rounded-lg px-3 py-2 text-sm"
              />
            ))}
            <button onClick={create} className="md:col-span-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 text-sm font-semibold">Create</button>
          </div>
        )}
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-auto shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              {columns.map((c) => <th key={c} className="px-3 py-3 text-left uppercase tracking-wider text-xs text-blue-700">{c}</th>)}
              <th className="px-3 py-3 text-left uppercase tracking-wider text-xs text-blue-700">actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-t border-slate-100 hover:bg-slate-50/60">
                {columns.map((c) => (
                  <td key={c} className="px-3 py-2">
                    {editingId === item.id && (editableFields ?? Object.keys(item)).includes(c) ? (
                      <input
                        value={editForm[c] ?? ""}
                        onChange={(e) => setEditForm((prev) => ({ ...prev, [c]: e.target.value }))}
                        className="border border-slate-300 rounded px-2 py-1 w-full"
                      />
                    ) : (
                      String(item[c] ?? "")
                    )}
                  </td>
                ))}
                <td className="px-3 py-2 whitespace-nowrap">
                  {editingId === item.id ? (
                    <button onClick={saveEdit} className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white px-2.5 py-1 rounded-md text-xs font-semibold mr-2">Save</button>
                  ) : (
                    <button onClick={() => startEdit(item)} className="inline-flex items-center bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded-md text-xs font-semibold mr-2">Edit</button>
                  )}
                  <button onClick={() => remove(item.id)} className="inline-flex items-center bg-red-50 hover:bg-red-100 text-red-700 px-2.5 py-1 rounded-md text-xs font-semibold">Delete</button>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={columns.length + 1} className="px-3 py-6 text-center text-gray-500">No records.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

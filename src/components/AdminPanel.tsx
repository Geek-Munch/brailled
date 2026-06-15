import React, { useState, useRef, useEffect } from 'react';
import { useAdmin } from '../contexts/AdminContext';
import { useAuth } from '../contexts/AuthContext';
import { EvidenceTable } from './EvidenceTable';
import { DisabilityType, SessionType, LearnerEvidence } from '../types/evidence';
import { apiRequest } from '../lib/api-client';
import { Upload, Download, FileText, LogOut, Users, MapPin, Calendar, TrendingUp, AlertCircle, Shield, Edit, Trash2, X, Save } from 'lucide-react';
import { animate, useInView } from 'framer-motion';
import { MAIL_KIT } from "../lib/landing-mailto";

const LOGO = "/Braille%20bot%20%20Bio.png";


const ELECTRIC_BLUE = "#0088ce";         
const ELECTRIC_BLUE_DARK = "#0088ce";     
const ELECTRIC_BLUE_DEEPER = "#0088ce";    
const ELECTRIC_BLUE_LIGHT = "#0088ce";    
const ELECTRIC_BLUE_GLOW = "rgba(0, 102, 204, 0.12)";

const DISABILITY_TYPES: DisabilityType[] = ["Blind (congenital)", "Blind (acquired)", "Low vision / progressive", "Low vision (stable)", "Other"];
const SESSION_TYPES: SessionType[] = ["Prototype assembly session", "Voice coding workshop", "Bootcamp session", "Teacher training session", "Classroom integration", "Demo session"];
const COUNTIES = ["Nairobi", "Siaya", "Mombasa", "Kiambu", "Uasin Gishu", "Kisumu", "Nyeri"];
type AdminTab = 'evidence' | 'onboarding' | 'schools' | 'students' | 'educators' | 'courses' | 'assignments';

type SchoolItem = {
  id: number;
  name: string;
  school_type: string;
  county: string;
  address?: string;
  contact_email?: string;
  contact_phone?: string;
  is_active: boolean;
};

type StudentItem = {
  id: number;
  username: string;
  email: string;
  school: number;
  age: number;
  disability_type: string;
};

type EducatorItem = {
  id: number;
  username: string;
  email: string;
  schools: number[];
  department: string;
  employee_id?: string | null;
};

type CourseItem = {
  id: number;
  title: string;
  description: string;
  is_published: boolean;
};

type AssignmentItem = {
  id: number;
  title: string;
  description: string;
  due_at: string;
  course_id?: number;
  course?: { id: number; title: string };
};

// Counting Animation Logic 
function CountingNumber({ value }: { value: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  useEffect(() => {
    if (isInView) {
      const controls = animate(0, value, {
        duration: 2,
        onUpdate: (val) => setCount(Math.round(val)),
      });
      return () => controls.stop();
    }
  }, [isInView, value]);

  return <span ref={ref}>{count}</span>;
}

// function to auto-assign sequential User ID
const generateNextUserId = (existingRecords: LearnerEvidence[]): string => {
  const brlNumbers = existingRecords
    .map(record => {
      const match = record.userId.match(/BRL-(\d+)/);
      return match ? parseInt(match[1]) : 0;
    })
    .filter(num => num > 0);
  
  const nextNumber = brlNumbers.length > 0 ? Math.max(...brlNumbers) + 1 : 1;
  return `BRL-${nextNumber.toString().padStart(3, '0')}`;
};

// Loading Spinner
function LoadingSpinner() {
  return (
    <div className="inline-flex items-center gap-2">
      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <span>Processing...</span>
    </div>
  );
}

export function AdminPanel() {
  const { user, isAuthenticated, isBootstrapping, login, logout } = useAuth();
  const { evidence, addEvidence, editEvidence, deleteEvidence, refreshEvidence, isLoading, error, clearError } = useAdmin();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = useState<{ message: string; isError: boolean } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showHeader, setShowHeader] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const [activeTab, setActiveTab] = useState<AdminTab>('evidence');
  const [stats, setStats] = useState({ total: 0, counties: 0, sessions: 0, avgAge: 0 });
  const [videoPaused, setVideoPaused] = useState(false);
  const [editingRecord, setEditingRecord] = useState<LearnerEvidence | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [schools, setSchools] = useState<SchoolItem[]>([]);
  const [isLoadingSchools, setIsLoadingSchools] = useState(false);
  const [schoolStatus, setSchoolStatus] = useState<string | null>(null);
  const [schoolError, setSchoolError] = useState<string | null>(null);
  const [isCreatingSchool, setIsCreatingSchool] = useState(false);
  const [newSchool, setNewSchool] = useState({
    name: '',
    school_type: 'SPECIAL',
    county: '',
    address: '',
    contact_email: '',
    contact_phone: '',
    is_active: true,
  });
  const [studentStatus, setStudentStatus] = useState<string | null>(null);
  const [studentError, setStudentError] = useState<string | null>(null);
  const [isSubmittingStudent, setIsSubmittingStudent] = useState(false);
  const [studentForm, setStudentForm] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    password: '',
    school_id: '',
    age: '',
    disability_type: '',
  });
  const [educatorStatus, setEducatorStatus] = useState<string | null>(null);
  const [educatorError, setEducatorError] = useState<string | null>(null);
  const [isSubmittingEducator, setIsSubmittingEducator] = useState(false);
  const [educatorForm, setEducatorForm] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    password: '',
    department: '',
    school_ids: [] as number[],
  });
  const [students, setStudents] = useState<StudentItem[]>([]);
  const [educators, setEducators] = useState<EducatorItem[]>([]);
  const [studentManageError, setStudentManageError] = useState<string | null>(null);
  const [educatorManageError, setEducatorManageError] = useState<string | null>(null);
  const [studentManageStatus, setStudentManageStatus] = useState<string | null>(null);
  const [educatorManageStatus, setEducatorManageStatus] = useState<string | null>(null);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const [isLoadingEducators, setIsLoadingEducators] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentItem | null>(null);
  const [selectedEducator, setSelectedEducator] = useState<EducatorItem | null>(null);
  const [studentSearch, setStudentSearch] = useState('');
  const [educatorSearch, setEducatorSearch] = useState('');
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [assignments, setAssignments] = useState<AssignmentItem[]>([]);
  const [isLoadingCourses, setIsLoadingCourses] = useState(false);
  const [isLoadingAssignments, setIsLoadingAssignments] = useState(false);
  const [courseError, setCourseError] = useState<string | null>(null);
  const [assignmentError, setAssignmentError] = useState<string | null>(null);
  const [courseStatus, setCourseStatus] = useState<string | null>(null);
  const [assignmentStatus, setAssignmentStatus] = useState<string | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<CourseItem | null>(null);
  const [courseSearch, setCourseSearch] = useState('');
  const [assignmentSearch, setAssignmentSearch] = useState('');
  const [selectedAssignment, setSelectedAssignment] = useState<AssignmentItem | null>(null);
  const [newAssignment, setNewAssignment] = useState({
    title: '',
    description: '',
    due_at: '',
    course_id: '',
  });
  const [newCourse, setNewCourse] = useState({ title: '', description: '', is_published: false });
  const [isCreatingCourse, setIsCreatingCourse] = useState(false);
  const [isCreatingAssignment, setIsCreatingAssignment] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const normalizedRole = (user?.role ?? '').toLowerCase();
  const isAdminUser = normalizedRole === 'admin' || normalizedRole === 'superuser';

  useEffect(() => {
    if (isAdminUser) {
      refreshEvidence({ auth: true });
    }
  }, [isAdminUser, refreshEvidence]);

  const loadSchools = async () => {
    setIsLoadingSchools(true);
    try {
      const payload = await apiRequest<any>('/schools/schools/', { auth: true });
      const schoolList = Array.isArray(payload) ? payload : (payload?.results ?? []);
      setSchools(schoolList);
      setSchoolError(null);
    } catch (err) {
      setSchoolError(err instanceof Error ? err.message : 'Failed to load schools.');
    } finally {
      setIsLoadingSchools(false);
    }
  };

  const loadStudents = async () => {
    setIsLoadingStudents(true);
    try {
      const payload = await apiRequest<any>('/students/students/', { auth: true });
      const records = Array.isArray(payload) ? payload : (payload?.results ?? []);
      setStudents(records);
      setStudentManageError(null);
    } catch (err) {
      setStudentManageError(err instanceof Error ? err.message : 'Failed to load students.');
    } finally {
      setIsLoadingStudents(false);
    }
  };

  const loadEducators = async () => {
    setIsLoadingEducators(true);
    try {
      const payload = await apiRequest<any>('/educators/educators/', { auth: true });
      const records = Array.isArray(payload) ? payload : (payload?.results ?? []);
      setEducators(records);
      setEducatorManageError(null);
    } catch (err) {
      setEducatorManageError(err instanceof Error ? err.message : 'Failed to load educators.');
    } finally {
      setIsLoadingEducators(false);
    }
  };

  const loadCourses = async () => {
    setIsLoadingCourses(true);
    try {
      const payload = await apiRequest<any>('/courses/courses/', { auth: true });
      const records = Array.isArray(payload) ? payload : (payload?.results ?? []);
      setCourses(records);
      setCourseError(null);
    } catch (err) {
      setCourseError(err instanceof Error ? err.message : 'Failed to load courses.');
    } finally {
      setIsLoadingCourses(false);
    }
  };

  const loadAssignments = async () => {
    setIsLoadingAssignments(true);
    try {
      const payload = await apiRequest<any>('/students/assignments/', { auth: true });
      const records = Array.isArray(payload) ? payload : (payload?.results ?? []);
      setAssignments(records);
      setAssignmentError(null);
    } catch (err) {
      setAssignmentError(err instanceof Error ? err.message : 'Failed to load assignments.');
    } finally {
      setIsLoadingAssignments(false);
    }
  };

  useEffect(() => {
    if (isAdminUser) {
      loadSchools();
      loadStudents();
      loadEducators();
      loadCourses();
      loadAssignments();
    }
  }, [isAdminUser]);

  // Calculate stats
  useEffect(() => {
    const uniqueCounties = new Set(evidence.map(e => e.county));
    const uniqueSessions = new Set(evidence.map(e => e.sessionType));
    const totalAge = evidence.reduce((sum, e) => sum + e.age, 0);
    setStats({
      total: evidence.length,
      counties: uniqueCounties.size,
      sessions: uniqueSessions.size,
      avgAge: evidence.length > 0 ? Math.round(totalAge / evidence.length) : 0
    });
  }, [evidence]);

  useEffect(() => {
    const controlHeader = () => {
      setScrolled(window.scrollY > 80);
      if (window.scrollY > lastScrollY && window.scrollY > 100) {
        setShowHeader(false);
      } else {
        setShowHeader(true);
      }
      setLastScrollY(window.scrollY);
    };
    window.addEventListener('scroll', controlHeader);
    return () => window.removeEventListener('scroll', controlHeader);
  }, [lastScrollY]);

  const toggleVideo = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setVideoPaused(false);
    } else {
      videoRef.current.pause();
      setVideoPaused(true);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);
    setActionError(null);

    const result = await login(username.trim(), password);
    if (!result.ok) {
      setLoginError(result.error);
      setIsLoggingIn(false);
      return;
    }

    setUsername('');
    setPassword('');
    setIsLoggingIn(false);
  };

  const handleCreateSchool = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreatingSchool(true);
    setSchoolStatus(null);
    setSchoolError(null);
    try {
      const payload = {
        ...newSchool,
        county: newSchool.county.trim(),
      };
      await apiRequest('/schools/schools/', {
        method: 'POST',
        auth: true,
        body: payload,
      });
      setSchoolStatus('School created successfully.');
      setNewSchool({
        name: '',
        school_type: 'SPECIAL',
        county: '',
        address: '',
        contact_email: '',
        contact_phone: '',
        is_active: true,
      });
      await loadSchools();
    } catch (err) {
      setSchoolError(err instanceof Error ? err.message : 'Failed to create school.');
    } finally {
      setIsCreatingSchool(false);
    }
  };

  const handleDeleteSchool = async (id: number) => {
    setSchoolStatus(null);
    setSchoolError(null);
    try {
      await apiRequest(`/schools/schools/${id}/`, {
        method: 'DELETE',
        auth: true,
      });
      setSchoolStatus('School deleted.');
      await loadSchools();
    } catch (err) {
      setSchoolError(err instanceof Error ? err.message : 'Failed to delete school.');
    }
  };

  const handleStudentOnboard = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingStudent(true);
    setStudentStatus(null);
    setStudentError(null);
    try {
      await apiRequest('/admin/onboard/student/', {
        method: 'POST',
        auth: true,
        body: {
          ...studentForm,
          school_id: Number(studentForm.school_id),
          age: Number(studentForm.age),
        },
      });
      setStudentStatus('Student account created and onboarding email sent.');
      setStudentForm({
        username: '',
        email: '',
        first_name: '',
        last_name: '',
        password: '',
        school_id: '',
        age: '',
        disability_type: '',
      });
      await loadStudents();
    } catch (err) {
      setStudentError(err instanceof Error ? err.message : 'Failed to onboard student.');
    } finally {
      setIsSubmittingStudent(false);
    }
  };

  const handleEducatorOnboard = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingEducator(true);
    setEducatorStatus(null);
    setEducatorError(null);
    try {
      await apiRequest('/admin/onboard/educator/', {
        method: 'POST',
        auth: true,
        body: educatorForm,
      });
      setEducatorStatus('Educator account created and onboarding email sent.');
      setEducatorForm({
        username: '',
        email: '',
        first_name: '',
        last_name: '',
        password: '',
        department: '',
        school_ids: [],
      });
      await loadEducators();
    } catch (err) {
      setEducatorError(err instanceof Error ? err.message : 'Failed to onboard educator.');
    } finally {
      setIsSubmittingEducator(false);
    }
  };

  const handleUpdateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;
    setStudentManageError(null);
    setStudentManageStatus(null);
    try {
      await apiRequest(`/students/students/${selectedStudent.id}/`, {
        method: 'PATCH',
        auth: true,
        body: {
          school: Number(selectedStudent.school),
          age: Number(selectedStudent.age),
          disability_type: selectedStudent.disability_type,
        },
      });
      setStudentManageStatus('Student updated.');
      await loadStudents();
    } catch (err) {
      setStudentManageError(err instanceof Error ? err.message : 'Failed to update student.');
    }
  };

  const handleDeleteStudent = async (id: number) => {
    setStudentManageError(null);
    setStudentManageStatus(null);
    try {
      await apiRequest(`/students/students/${id}/`, { method: 'DELETE', auth: true });
      setStudentManageStatus('Student deleted.');
      if (selectedStudent?.id === id) setSelectedStudent(null);
      await loadStudents();
    } catch (err) {
      setStudentManageError(err instanceof Error ? err.message : 'Failed to delete student.');
    }
  };

  const handleUpdateEducator = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEducator) return;
    setEducatorManageError(null);
    setEducatorManageStatus(null);
    try {
      await apiRequest(`/educators/educators/${selectedEducator.id}/`, {
        method: 'PATCH',
        auth: true,
        body: {
          schools: selectedEducator.schools.map(Number),
          department: selectedEducator.department,
          employee_id: selectedEducator.employee_id ?? '',
        },
      });
      setEducatorManageStatus('Educator updated.');
      await loadEducators();
    } catch (err) {
      setEducatorManageError(err instanceof Error ? err.message : 'Failed to update educator.');
    }
  };

  const handleDeleteEducator = async (id: number) => {
    setEducatorManageError(null);
    setEducatorManageStatus(null);
    try {
      await apiRequest(`/educators/educators/${id}/`, { method: 'DELETE', auth: true });
      setEducatorManageStatus('Educator deleted.');
      if (selectedEducator?.id === id) setSelectedEducator(null);
      await loadEducators();
    } catch (err) {
      setEducatorManageError(err instanceof Error ? err.message : 'Failed to delete educator.');
    }
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreatingCourse(true);
    setCourseError(null);
    setCourseStatus(null);
    try {
      await apiRequest('/courses/courses/', {
        method: 'POST',
        auth: true,
        body: newCourse,
      });
      setCourseStatus('Course created.');
      setNewCourse({ title: '', description: '', is_published: false });
      await loadCourses();
    } catch (err) {
      setCourseError(err instanceof Error ? err.message : 'Failed to create course.');
    } finally {
      setIsCreatingCourse(false);
    }
  };

  const handleUpdateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse) return;
    setCourseError(null);
    setCourseStatus(null);
    try {
      await apiRequest(`/courses/courses/${selectedCourse.id}/`, {
        method: 'PATCH',
        auth: true,
        body: {
          title: selectedCourse.title,
          description: selectedCourse.description,
          is_published: selectedCourse.is_published,
        },
      });
      setCourseStatus('Course updated.');
      await loadCourses();
    } catch (err) {
      setCourseError(err instanceof Error ? err.message : 'Failed to update course.');
    }
  };

  const handleDeleteCourse = async (id: number) => {
    setCourseError(null);
    setCourseStatus(null);
    try {
      await apiRequest(`/courses/courses/${id}/`, { method: 'DELETE', auth: true });
      setCourseStatus('Course deleted.');
      if (selectedCourse?.id === id) setSelectedCourse(null);
      await loadCourses();
    } catch (err) {
      setCourseError(err instanceof Error ? err.message : 'Failed to delete course.');
    }
  };

  const handleDeleteAssignment = async (id: number) => {
    setAssignmentError(null);
    setAssignmentStatus(null);
    try {
      await apiRequest(`/students/assignments/${id}/`, { method: 'DELETE', auth: true });
      setAssignmentStatus('Assignment deleted.');
      if (selectedAssignment?.id === id) setSelectedAssignment(null);
      await loadAssignments();
    } catch (err) {
      setAssignmentError(err instanceof Error ? err.message : 'Failed to delete assignment.');
    }
  };

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreatingAssignment(true);
    setAssignmentError(null);
    setAssignmentStatus(null);
    try {
      await apiRequest('/students/assignments/', {
        method: 'POST',
        auth: true,
        body: {
          title: newAssignment.title,
          description: newAssignment.description,
          due_at: newAssignment.due_at,
          course_id: Number(newAssignment.course_id),
        },
      });
      setAssignmentStatus('Assignment created.');
      setNewAssignment({
        title: '',
        description: '',
        due_at: '',
        course_id: '',
      });
      await loadAssignments();
    } catch (err) {
      setAssignmentError(err instanceof Error ? err.message : 'Failed to create assignment.');
    } finally {
      setIsCreatingAssignment(false);
    }
  };

  const handleUpdateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssignment) return;
    setAssignmentError(null);
    setAssignmentStatus(null);
    try {
      await apiRequest(`/students/assignments/${selectedAssignment.id}/`, {
        method: 'PATCH',
        auth: true,
        body: {
          title: selectedAssignment.title,
          description: selectedAssignment.description,
          due_at: selectedAssignment.due_at,
          course_id: Number(selectedAssignment.course_id ?? selectedAssignment.course?.id),
        },
      });
      setAssignmentStatus('Assignment updated.');
      await loadAssignments();
    } catch (err) {
      setAssignmentError(err instanceof Error ? err.message : 'Failed to update assignment.');
    }
  };

  if (isBootstrapping) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6" style={{ backgroundColor: 'var(--page-bg)' }}>
        <div className="text-sm" style={{ color: 'var(--text-muted)' }}>Loading admin session...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6" style={{ backgroundColor: 'var(--page-bg)' }}>
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg overflow-hidden" style={{ border: `1px solid ${ELECTRIC_BLUE_GLOW}` }}>
          <div className="p-8 text-center" style={{ borderBottom: `4px solid ${ELECTRIC_BLUE}` }}>
            <img src={LOGO} alt="BrailleEd Logo" className="h-40 w-auto mx-auto mb-4" />
            <h2 className="text-2xl font-black uppercase tracking-tighter" style={{ color: 'var(--brand-deep)' }}>Admin Sign In</h2>
            <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>Enter your credentials to access the dashboard</p>
          </div>
          <form onSubmit={handleLogin} className="p-8">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              className="w-full px-4 py-3 border rounded-lg mb-4 focus:outline-none focus:ring-2 transition"
              style={{ borderColor: ELECTRIC_BLUE_GLOW }}
              onFocus={(e) => (e.currentTarget.style.borderColor = ELECTRIC_BLUE)}
              onBlur={(e) => (e.currentTarget.style.borderColor = ELECTRIC_BLUE_GLOW)}
              autoComplete="username"
              autoFocus
              required
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full px-4 py-3 border rounded-lg mb-4 focus:outline-none focus:ring-2 transition"
              style={{ borderColor: ELECTRIC_BLUE_GLOW }}
              onFocus={(e) => (e.currentTarget.style.borderColor = ELECTRIC_BLUE)}
              onBlur={(e) => (e.currentTarget.style.borderColor = ELECTRIC_BLUE_GLOW)}
              autoComplete="current-password"
              required
            />
            {loginError && <p className="text-red-500 text-sm mb-4">{loginError}</p>}
            <button 
              type="submit" 
              className="w-full text-white py-3 text-sm font-bold uppercase tracking-widest transition rounded-lg disabled:opacity-60"
              style={{ backgroundColor: ELECTRIC_BLUE_DARK }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = ELECTRIC_BLUE_DEEPER)}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = ELECTRIC_BLUE_DARK)}
              disabled={isLoggingIn}
            >
              {isLoggingIn ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (!isAdminUser) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6" style={{ backgroundColor: 'var(--page-bg)' }}>
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg overflow-hidden text-center p-8" style={{ border: `1px solid ${ELECTRIC_BLUE_GLOW}` }}>
          <h2 className="text-2xl font-black uppercase tracking-tighter" style={{ color: 'var(--brand-deep)' }}>Admin Access Required</h2>
          <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>Your account does not have admin access.</p>
          <button
            onClick={logout}
            className="mt-6 w-full text-white py-3 text-sm font-bold uppercase tracking-widest transition rounded-lg"
            style={{ backgroundColor: ELECTRIC_BLUE_DARK }}
          >
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  const parseCSV = (csvText: string): any[] => {
    const lines = csvText.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
    
    return lines.slice(1).map(line => {
      const values: string[] = [];
      let currentValue = '';
      let inQuotes = false;
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          values.push(currentValue.trim().replace(/^"|"$/g, ''));
          currentValue = '';
        } else {
          currentValue += char;
        }
      }
      values.push(currentValue.trim().replace(/^"|"$/g, ''));
      
      const record: any = {};
      headers.forEach((header, idx) => {
        record[header] = values[idx] || '';
      });
      return record;
    });
  };

  const validateAndConvertRecord = (record: any, index: number): { valid: boolean; record?: Omit<LearnerEvidence, 'id' | 'createdAt' | 'updatedAt'>; error?: string } => {
    const requiredFields = ['school', 'county', 'age', 'disabilityType', 'sessionType', 'outcomeRecorded'];
    for (const field of requiredFields) {
      if (!record[field] || record[field].trim() === '') {
        return { valid: false, error: `Row ${index + 2}: Missing required field "${field}"` };
      }
    }
    
    const age = parseInt(record.age);
    if (isNaN(age) || age < 5 || age > 100) {
      return { valid: false, error: `Row ${index + 2}: Age must be a number between 5 and 100` };
    }
    
    if (!COUNTIES.includes(record.county)) {
      return { valid: false, error: `Row ${index + 2}: Invalid county "${record.county}"` };
    }
    
    if (!DISABILITY_TYPES.includes(record.disabilityType)) {
      return { valid: false, error: `Row ${index + 2}: Invalid disability type "${record.disabilityType}"` };
    }
    
    if (!SESSION_TYPES.includes(record.sessionType)) {
      return { valid: false, error: `Row ${index + 2}: Invalid session type "${record.sessionType}"` };
    }
    
    return {
      valid: true,
      record: {
        userId: '',
        school: record.school,
        county: record.county,
        age: age,
        disabilityType: record.disabilityType as DisabilityType,
        sessionType: record.sessionType as SessionType,
        outcomeRecorded: record.outcomeRecorded,
      }
    };
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsUploading(true);
    setUploadStatus(null);
    
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const csvText = event.target?.result as string;
        const parsedData = parseCSV(csvText);
        
        if (parsedData.length === 0) {
          setUploadStatus({ message: 'CSV file is empty', isError: true });
          setIsUploading(false);
          return;
        }
        
        let successCount = 0;
        let errorCount = 0;
        const errors: string[] = [];
        
        const currentEvidence = [...evidence];
        
        for (let i = 0; i < parsedData.length; i++) {
          const result = validateAndConvertRecord(parsedData[i], i);
          if (result.valid && result.record) {
            const nextId = generateNextUserId([...currentEvidence, ...Array(successCount).fill(null).map((_, idx) => ({
              ...result.record!,
              id: `temp-${idx}`,
              userId: `BRL-${(currentEvidence.length + idx + 1).toString().padStart(3, '0')}`,
              createdAt: new Date(),
              updatedAt: new Date()
            } as LearnerEvidence))]);
            
            result.record.userId = nextId;
            try {
              await addEvidence(result.record);
              successCount++;
            } catch (err) {
              errorCount++;
              errors.push(`Row ${i + 2}: ${err instanceof Error ? err.message : 'Upload failed'}`);
            }
          } else if (result.error) {
            errorCount++;
            errors.push(result.error);
          }
        }
        
        if (successCount > 0) {
          setUploadStatus({ 
            message: `✅ Successfully added ${successCount} records. User IDs auto-assigned (BRL-XXX format). ${errorCount > 0 ? `Failed: ${errorCount}` : ''}`, 
            isError: false 
          });
        } else {
          setUploadStatus({ message: ` Failed to add any records. ${errors[0] || 'Check file format'}`, isError: true });
        }
        
        if (fileInputRef.current) fileInputRef.current.value = '';
        
      } catch (err) {
        setUploadStatus({ message: `Error parsing CSV: ${err}`, isError: true });
      } finally {
        setIsUploading(false);
      }
    };
    
    reader.onerror = () => {
      setUploadStatus({ message: 'Error reading file', isError: true });
      setIsUploading(false);
    };
    
    reader.readAsText(file);
  };

  const downloadTemplate = () => {
    const headers = ['school', 'county', 'age', 'disabilityType', 'sessionType', 'outcomeRecorded'];
    const exampleRow = [
      'Example School Name',
      'Nairobi',
      '14',
      'Blind (congenital)',
      'Voice coding workshop',
      'Student successfully completed the workshop and built a working program'
    ];
    
    const csvContent = [headers.join(','), exampleRow.join(',')].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'braille_evidence_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportToCSV = () => {
    const headers = ['userId', 'school', 'county', 'age', 'disabilityType', 'sessionType', 'outcomeRecorded', 'createdAt'];
    const csvRows = [headers.join(',')];
    
    evidence.forEach(record => {
      const createdAt = record.createdAt ? new Date(record.createdAt).toISOString() : '';
      const row = [
        record.userId,
        `"${record.school.replace(/"/g, '""')}"`,
        record.county,
        record.age,
        record.disabilityType,
        record.sessionType,
        `"${record.outcomeRecorded.replace(/"/g, '""')}"`,
        createdAt
      ];
      csvRows.push(row.join(','));
    });
    
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `braille_evidence_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Edit Modal Component
  const EditModal = ({ record, onClose, onSave }: { record: LearnerEvidence; onClose: () => void; onSave: (id: string, updates: Partial<LearnerEvidence>) => Promise<unknown> }) => {
    const [formData, setFormData] = useState({
      userId: record.userId,
      school: record.school,
      county: record.county,
      age: record.age.toString(),
      disabilityType: record.disabilityType,
      sessionType: record.sessionType,
      outcomeRecorded: record.outcomeRecorded,
    });
    const [isSaving, setIsSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSaving(true);
      setSaveError(null);

      try {
        await onSave(record.id, {
          userId: formData.userId,
          school: formData.school,
          county: formData.county,
          age: parseInt(formData.age),
          disabilityType: formData.disabilityType as DisabilityType,
          sessionType: formData.sessionType as SessionType,
          outcomeRecorded: formData.outcomeRecorded,
        });
        onClose();
      } catch (err) {
        setSaveError(err instanceof Error ? err.message : 'Failed to save changes.');
      } finally {
        setIsSaving(false);
      }
    };

    return (
      <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 p-4">
        <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto" style={{ border: `1px solid ${ELECTRIC_BLUE_GLOW}` }}>
          <div className="p-6 border-b flex justify-between items-center" style={{ borderColor: ELECTRIC_BLUE_GLOW }}>
            <h2 className="text-xl font-bold uppercase tracking-tighter" style={{ color: ELECTRIC_BLUE_DARK }}>Edit Record</h2>
            <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg transition">
              <X className="w-5 h-5" style={{ color: ELECTRIC_BLUE_DARK }} />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1" style={{ color: ELECTRIC_BLUE_DARK }}>User ID</label>
              <input
                value={formData.userId}
                onChange={e => setFormData({...formData, userId: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
                style={{ borderColor: ELECTRIC_BLUE_GLOW }}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1" style={{ color: ELECTRIC_BLUE_DARK }}>School</label>
              <input
                value={formData.school}
                onChange={e => setFormData({...formData, school: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
                style={{ borderColor: ELECTRIC_BLUE_GLOW }}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1" style={{ color: ELECTRIC_BLUE_DARK }}>County</label>
              <select
                value={formData.county}
                onChange={e => setFormData({...formData, county: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 bg-white"
                style={{ borderColor: ELECTRIC_BLUE_GLOW }}
                required
              >
                {COUNTIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1" style={{ color: ELECTRIC_BLUE_DARK }}>Age</label>
              <input
                type="number"
                value={formData.age}
                onChange={e => setFormData({...formData, age: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
                style={{ borderColor: ELECTRIC_BLUE_GLOW }}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1" style={{ color: ELECTRIC_BLUE_DARK }}>Disability Type</label>
              <select
                value={formData.disabilityType}
                onChange={e => setFormData({...formData, disabilityType: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 bg-white"
                style={{ borderColor: ELECTRIC_BLUE_GLOW }}
                required
              >
                {DISABILITY_TYPES.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1" style={{ color: ELECTRIC_BLUE_DARK }}>Session Type</label>
              <select
                value={formData.sessionType}
                onChange={e => setFormData({...formData, sessionType: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 bg-white"
                style={{ borderColor: ELECTRIC_BLUE_GLOW }}
                required
              >
                {SESSION_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1" style={{ color: ELECTRIC_BLUE_DARK }}>Outcome Recorded</label>
              <textarea
                value={formData.outcomeRecorded}
                onChange={e => setFormData({...formData, outcomeRecorded: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
                style={{ borderColor: ELECTRIC_BLUE_GLOW }}
                rows={3}
                required
              />
            </div>
            {saveError && (
              <p className="text-sm text-red-600">{saveError}</p>
            )}
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={isSaving}
                className="flex-1 text-white py-2 text-sm font-bold uppercase tracking-widest rounded-lg transition disabled:opacity-60"
                style={{ backgroundColor: ELECTRIC_BLUE_DARK }}
              >
                <Save className="w-4 h-4 inline mr-2" />
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
              <button type="button" onClick={onClose} className="flex-1 border py-2 text-sm font-bold uppercase tracking-widest rounded-lg transition" style={{ borderColor: ELECTRIC_BLUE_GLOW, color: ELECTRIC_BLUE_DARK }}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Delete Confirmation Modal
  const DeleteConfirmModal = ({ recordId, onConfirm, onCancel }: { recordId: string; onConfirm: () => Promise<void>; onCancel: () => void }) => {
    const record = evidence.find(r => r.id === recordId);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState<string | null>(null);

    const handleConfirm = async () => {
      setIsDeleting(true);
      setDeleteError(null);
      try {
        await onConfirm();
      } catch (err) {
        setDeleteError(err instanceof Error ? err.message : 'Failed to delete record.');
      } finally {
        setIsDeleting(false);
      }
    };
    return (
      <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 p-4">
        <div className="bg-white rounded-xl max-w-md w-full" style={{ border: `1px solid ${ELECTRIC_BLUE_GLOW}` }}>
          <div className="p-6 border-b" style={{ borderColor: ELECTRIC_BLUE_GLOW }}>
            <h2 className="text-xl font-bold uppercase tracking-tighter" style={{ color: ELECTRIC_BLUE_DARK }}>Confirm Delete</h2>
          </div>
          <div className="p-6">
            <p className="text-gray-600">Are you sure you want to delete record <strong className="font-mono">{record?.userId}</strong>? This action cannot be undone.</p>
            {deleteError && <p className="text-sm text-red-600 mt-3">{deleteError}</p>}
          </div>
          <div className="flex gap-3 p-6 pt-0">
            <button
              onClick={handleConfirm}
              disabled={isDeleting}
              className="flex-1 bg-red-600 text-white py-2 text-sm font-bold uppercase tracking-widest rounded-lg transition hover:bg-red-700 disabled:opacity-60"
            >
              <Trash2 className="w-4 h-4 inline mr-2" />
              {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
            <button onClick={onCancel} className="flex-1 border py-2 text-sm font-bold uppercase tracking-widest rounded-lg transition" style={{ borderColor: ELECTRIC_BLUE_GLOW, color: ELECTRIC_BLUE_DARK }}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Admin Dashboard 
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--page-bg)' }}>
      
      {/* Edit Modal */}
      {editingRecord && (
        <EditModal
          record={editingRecord}
          onClose={() => setEditingRecord(null)}
          onSave={editEvidence}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <DeleteConfirmModal
          recordId={showDeleteConfirm}
          onConfirm={async () => {
            await deleteEvidence(showDeleteConfirm);
            setShowDeleteConfirm(null);
          }}
          onCancel={() => setShowDeleteConfirm(null)}
        />
      )}

      {/* Header  */}
      <header className={`fixed top-0 w-full z-[100] px-6 lg:px-16 py-4 flex justify-between items-center transition-all duration-500
        ${showHeader ? 'translate-y-0' : '-translate-y-full'}
        ${scrolled
          ? 'bg-white/95 backdrop-blur-md border-b'
          : 'bg-transparent border-b border-white/10'}
      `} style={scrolled ? { borderColor: 'var(--brand-mid)' } : {}}>
        
        <a className="flex items-center gap-3 group" href="/">
          <img src={LOGO} alt="BrailleEd Logo" className={`h-26 md:h-30 w-auto object-contain transition-all ${scrolled ? '' : 'brightness-0 invert'}`} />
        </a>
        
        <button 
          onClick={logout} 
          className={`flex items-center gap-2 px-4 py-2 text-sm font-bold uppercase tracking-widest transition rounded-lg ${scrolled ? 'text-slate-600 hover:bg-slate-100' : 'text-white hover:bg-white/10'}`}
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-36 pb-20 md:pt-44 md:pb-28 min-h-[60vh]">
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover"
          autoPlay
          loop
          muted
          playsInline
          aria-hidden="true"
        >
          <source src="/hero-video.mp4" type="video/mp4" />
        </video>
      
        
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" aria-hidden="true" />
        
        {/* Play/Pause Button */}
        <button
          onClick={toggleVideo}
          aria-label={videoPaused ? "Play background video" : "Pause background video"}
          className="absolute bottom-8 left-8 z-20 flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/40 text-white text-xs font-bold uppercase tracking-widest px-4 py-2.5 transition-all duration-300 rounded-md"
        >
          {videoPaused ? (
            <>
              <svg width="12" height="14" viewBox="0 0 12 14" fill="currentColor" aria-hidden="true">
                <path d="M0 0L12 7L0 14V0Z"/>
              </svg>
              Play
            </>
          ) : (
            <>
              <svg width="12" height="14" viewBox="0 0 12 14" fill="currentColor" aria-hidden="true">
                <rect x="0" y="0" width="4" height="14"/>
                <rect x="8" y="0" width="4" height="14"/>
              </svg>
              Pause
            </>
          )}
        </button>
        
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-24">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
            <div className="border-l-8 pl-8" style={{ borderColor: '#ffffff' }}>
              <p className="font-bold uppercase tracking-[0.3em] text-sm mb-4 text-white/80">
                Secure Management Portal
              </p>
              <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-white mb-4">
                Admin Dashboard
              </h1>
              <p className="text-lg text-white/80 max-w-xl mt-4 leading-relaxed">
                Manage learner evidence records, import data via CSV, and track program impact across Kenya.
              </p>
              <div className="mt-4 flex items-center gap-2 text-sm text-white/70">
                <Shield className="w-4 h-4" />
                <span>User IDs are automatically assigned sequentially (BRL-001, BRL-002, etc.)</span>
              </div>
            </div>

            {/* Stats Cards  */}
            <div className="grid grid-cols-2 gap-4 min-w-[300px]">
              <div className="backdrop-blur-md rounded-xl p-6 text-center border border-white/30" style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}>
                <div className="text-4xl font-black text-white">
                  <CountingNumber value={stats.total} />
                </div>
                <p className="text-xs font-bold uppercase tracking-wider mt-1 text-white/80">Total Records</p>
              </div>
              <div className="backdrop-blur-md rounded-xl p-6 text-center border border-white/30" style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}>
                <div className="text-4xl font-black text-white">
                  <CountingNumber value={stats.counties} />
                </div>
                <p className="text-xs font-bold uppercase tracking-wider mt-1 text-white/80">Counties Reached</p>
              </div>
              <div className="backdrop-blur-md rounded-xl p-6 text-center border border-white/30" style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}>
                <div className="text-4xl font-black text-white">
                  <CountingNumber value={stats.sessions} />
                </div>
                <p className="text-xs font-bold uppercase tracking-wider mt-1 text-white/80">Session Types</p>
              </div>
              <div className="backdrop-blur-md rounded-xl p-6 text-center border border-white/30" style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}>
                <div className="text-4xl font-black text-white">
                  <CountingNumber value={stats.avgAge} />
                </div>
                <p className="text-xs font-bold uppercase tracking-wider mt-1 text-white/80">Average Age</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Section */}
      <section className="section bg-white border-t border-b" style={{ borderColor: 'var(--brand-mid)' }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-24 py-12">
          
          {/* Impact Stats Row */}
          <div className="impact-grid mb-10">
            <div className="impact-card" style={{ backgroundColor: 'var(--white)' }}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: ELECTRIC_BLUE_GLOW }}>
                  <Users className="w-5 h-5" style={{ color: ELECTRIC_BLUE_DARK }} />
                </div>
              </div>
              <div className="impact-number text-3xl font-black" style={{ color: ELECTRIC_BLUE_DARK }}>
                <CountingNumber value={stats.total} />
              </div>
              <div className="impact-label text-sm">Total Learners</div>
            </div>

            <div className="impact-card" style={{ backgroundColor: 'var(--white)' }}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: ELECTRIC_BLUE_GLOW }}>
                  <MapPin className="w-5 h-5" style={{ color: ELECTRIC_BLUE_DARK }} />
                </div>
              </div>
              <div className="impact-number text-3xl font-black" style={{ color: ELECTRIC_BLUE_DARK }}>
                <CountingNumber value={stats.counties} />
              </div>
              <div className="impact-label text-sm">Counties Reached</div>
            </div>

            <div className="impact-card" style={{ backgroundColor: 'var(--white)' }}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: ELECTRIC_BLUE_GLOW }}>
                  <Calendar className="w-5 h-5" style={{ color: ELECTRIC_BLUE_DARK }} />
                </div>
              </div>
              <div className="impact-number text-3xl font-black" style={{ color: ELECTRIC_BLUE_DARK }}>
                <CountingNumber value={stats.sessions} />
              </div>
              <div className="impact-label text-sm">Session Types</div>
            </div>

            <div className="impact-card" style={{ backgroundColor: 'var(--white)' }}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: ELECTRIC_BLUE_GLOW }}>
                  <TrendingUp className="w-5 h-5" style={{ color: ELECTRIC_BLUE_DARK }} />
                </div>
              </div>
              <div className="impact-number text-3xl font-black" style={{ color: ELECTRIC_BLUE_DARK }}>
                <CountingNumber value={stats.avgAge} />
              </div>
              <div className="impact-label text-sm">Average Age</div>
            </div>
          </div>

          {/* Action Bar */}
          <div className="mb-8 flex flex-wrap gap-2">
            {[
              { id: 'evidence', label: 'Evidence' },
              { id: 'onboarding', label: 'Onboarding' },
              { id: 'schools', label: 'Schools' },
              { id: 'students', label: 'Students' },
              { id: 'educators', label: 'Educators' },
              { id: 'courses', label: 'Courses' },
              { id: 'assignments', label: 'Assignments' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as AdminTab)}
                className="px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest border transition"
                style={{
                  borderColor: ELECTRIC_BLUE_GLOW,
                  backgroundColor: activeTab === tab.id ? ELECTRIC_BLUE_DARK : 'var(--white)',
                  color: activeTab === tab.id ? '#fff' : ELECTRIC_BLUE_DARK,
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === 'onboarding' && (
            <div className="grid lg:grid-cols-2 gap-6 mb-10">
              <div className="p-5 rounded-xl border bg-white" style={{ borderColor: ELECTRIC_BLUE_GLOW }}>
                <h3 className="text-sm font-bold uppercase tracking-wider mb-4" style={{ color: ELECTRIC_BLUE_DARK }}>Onboard Student</h3>
                <form className="space-y-3" onSubmit={handleStudentOnboard}>
                  <input value={studentForm.username} onChange={(e) => setStudentForm((prev) => ({ ...prev, username: e.target.value }))} placeholder="Username" className="w-full border rounded-lg px-3 py-2" style={{ borderColor: ELECTRIC_BLUE_GLOW }} required />
                  <input type="email" value={studentForm.email} onChange={(e) => setStudentForm((prev) => ({ ...prev, email: e.target.value }))} placeholder="Email" className="w-full border rounded-lg px-3 py-2" style={{ borderColor: ELECTRIC_BLUE_GLOW }} required />
                  <div className="grid grid-cols-2 gap-3">
                    <input value={studentForm.first_name} onChange={(e) => setStudentForm((prev) => ({ ...prev, first_name: e.target.value }))} placeholder="First name" className="w-full border rounded-lg px-3 py-2" style={{ borderColor: ELECTRIC_BLUE_GLOW }} required />
                    <input value={studentForm.last_name} onChange={(e) => setStudentForm((prev) => ({ ...prev, last_name: e.target.value }))} placeholder="Last name" className="w-full border rounded-lg px-3 py-2" style={{ borderColor: ELECTRIC_BLUE_GLOW }} required />
                  </div>
                  <input type="password" value={studentForm.password} onChange={(e) => setStudentForm((prev) => ({ ...prev, password: e.target.value }))} placeholder="Temporary password (min 8 chars)" className="w-full border rounded-lg px-3 py-2" style={{ borderColor: ELECTRIC_BLUE_GLOW }} required minLength={8} />
                  <select value={studentForm.school_id} onChange={(e) => setStudentForm((prev) => ({ ...prev, school_id: e.target.value }))} className="w-full border rounded-lg px-3 py-2 bg-white" style={{ borderColor: ELECTRIC_BLUE_GLOW }} required>
                    <option value="">Select school</option>
                    {schools.map((school) => <option key={school.id} value={school.id}>{school.name}</option>)}
                  </select>
                  <div className="grid grid-cols-2 gap-3">
                    <input type="number" min={1} max={150} value={studentForm.age} onChange={(e) => setStudentForm((prev) => ({ ...prev, age: e.target.value }))} placeholder="Age" className="w-full border rounded-lg px-3 py-2" style={{ borderColor: ELECTRIC_BLUE_GLOW }} required />
                    <input value={studentForm.disability_type} onChange={(e) => setStudentForm((prev) => ({ ...prev, disability_type: e.target.value }))} placeholder="Disability type" className="w-full border rounded-lg px-3 py-2" style={{ borderColor: ELECTRIC_BLUE_GLOW }} required />
                  </div>
                  {studentError && <p className="text-sm text-red-700">{studentError}</p>}
                  {studentStatus && <p className="text-sm text-green-700">{studentStatus}</p>}
                  <button type="submit" disabled={isSubmittingStudent} className="w-full text-white py-2 rounded-lg text-xs font-bold uppercase tracking-widest disabled:opacity-60" style={{ backgroundColor: ELECTRIC_BLUE_DARK }}>
                    {isSubmittingStudent ? 'Submitting...' : 'Create Student'}
                  </button>
                </form>
              </div>

              <div className="p-5 rounded-xl border bg-white" style={{ borderColor: ELECTRIC_BLUE_GLOW }}>
                <h3 className="text-sm font-bold uppercase tracking-wider mb-4" style={{ color: ELECTRIC_BLUE_DARK }}>Onboard Educator</h3>
                <form className="space-y-3" onSubmit={handleEducatorOnboard}>
                  <input value={educatorForm.username} onChange={(e) => setEducatorForm((prev) => ({ ...prev, username: e.target.value }))} placeholder="Username" className="w-full border rounded-lg px-3 py-2" style={{ borderColor: ELECTRIC_BLUE_GLOW }} required />
                  <input type="email" value={educatorForm.email} onChange={(e) => setEducatorForm((prev) => ({ ...prev, email: e.target.value }))} placeholder="Email" className="w-full border rounded-lg px-3 py-2" style={{ borderColor: ELECTRIC_BLUE_GLOW }} required />
                  <div className="grid grid-cols-2 gap-3">
                    <input value={educatorForm.first_name} onChange={(e) => setEducatorForm((prev) => ({ ...prev, first_name: e.target.value }))} placeholder="First name" className="w-full border rounded-lg px-3 py-2" style={{ borderColor: ELECTRIC_BLUE_GLOW }} required />
                    <input value={educatorForm.last_name} onChange={(e) => setEducatorForm((prev) => ({ ...prev, last_name: e.target.value }))} placeholder="Last name" className="w-full border rounded-lg px-3 py-2" style={{ borderColor: ELECTRIC_BLUE_GLOW }} required />
                  </div>
                  <input type="password" value={educatorForm.password} onChange={(e) => setEducatorForm((prev) => ({ ...prev, password: e.target.value }))} placeholder="Temporary password (min 8 chars)" className="w-full border rounded-lg px-3 py-2" style={{ borderColor: ELECTRIC_BLUE_GLOW }} required minLength={8} />
                  <input value={educatorForm.department} onChange={(e) => setEducatorForm((prev) => ({ ...prev, department: e.target.value }))} placeholder="Department" className="w-full border rounded-lg px-3 py-2" style={{ borderColor: ELECTRIC_BLUE_GLOW }} required />
                  <label className="block text-xs font-bold uppercase tracking-wider" style={{ color: ELECTRIC_BLUE_DARK }}>Schools</label>
                  <div className="max-h-36 overflow-y-auto border rounded-lg p-2" style={{ borderColor: ELECTRIC_BLUE_GLOW }}>
                    {schools.map((school) => (
                      <label key={school.id} className="flex items-center gap-2 py-1 text-sm">
                        <input
                          type="checkbox"
                          checked={educatorForm.school_ids.includes(school.id)}
                          onChange={(e) => {
                            setEducatorForm((prev) => ({
                              ...prev,
                              school_ids: e.target.checked
                                ? [...prev.school_ids, school.id]
                                : prev.school_ids.filter((id) => id !== school.id),
                            }));
                          }}
                        />
                        <span>{school.name}</span>
                      </label>
                    ))}
                  </div>
                  {educatorError && <p className="text-sm text-red-700">{educatorError}</p>}
                  {educatorStatus && <p className="text-sm text-green-700">{educatorStatus}</p>}
                  <button type="submit" disabled={isSubmittingEducator} className="w-full text-white py-2 rounded-lg text-xs font-bold uppercase tracking-widest disabled:opacity-60" style={{ backgroundColor: ELECTRIC_BLUE_DARK }}>
                    {isSubmittingEducator ? 'Submitting...' : 'Create Educator'}
                  </button>
                </form>
              </div>
            </div>
          )}

          {activeTab === 'schools' && (
            <div className="mb-10 space-y-5">
              <form className="p-5 rounded-xl border bg-white grid md:grid-cols-2 gap-3" style={{ borderColor: ELECTRIC_BLUE_GLOW }} onSubmit={handleCreateSchool}>
                <h3 className="md:col-span-2 text-sm font-bold uppercase tracking-wider" style={{ color: ELECTRIC_BLUE_DARK }}>Create School</h3>
                <input value={newSchool.name} onChange={(e) => setNewSchool((prev) => ({ ...prev, name: e.target.value }))} placeholder="School name" className="border rounded-lg px-3 py-2" style={{ borderColor: ELECTRIC_BLUE_GLOW }} required />
                <input value={newSchool.county} onChange={(e) => setNewSchool((prev) => ({ ...prev, county: e.target.value }))} placeholder="County" className="border rounded-lg px-3 py-2" style={{ borderColor: ELECTRIC_BLUE_GLOW }} required />
                <select value={newSchool.school_type} onChange={(e) => setNewSchool((prev) => ({ ...prev, school_type: e.target.value }))} className="border rounded-lg px-3 py-2 bg-white" style={{ borderColor: ELECTRIC_BLUE_GLOW }} required>
                  <option value="SPECIAL">SPECIAL</option>
                  <option value="MAINSTREAM">MAINSTREAM</option>
                  <option value="INTEGRATED">INTEGRATED</option>
                  <option value="OTHER">OTHER</option>
                </select>
                <input value={newSchool.address} onChange={(e) => setNewSchool((prev) => ({ ...prev, address: e.target.value }))} placeholder="Address" className="border rounded-lg px-3 py-2" style={{ borderColor: ELECTRIC_BLUE_GLOW }} />
                <input type="email" value={newSchool.contact_email} onChange={(e) => setNewSchool((prev) => ({ ...prev, contact_email: e.target.value }))} placeholder="Contact email" className="border rounded-lg px-3 py-2" style={{ borderColor: ELECTRIC_BLUE_GLOW }} />
                <input value={newSchool.contact_phone} onChange={(e) => setNewSchool((prev) => ({ ...prev, contact_phone: e.target.value }))} placeholder="Contact phone" className="border rounded-lg px-3 py-2" style={{ borderColor: ELECTRIC_BLUE_GLOW }} />
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={newSchool.is_active} onChange={(e) => setNewSchool((prev) => ({ ...prev, is_active: e.target.checked }))} />
                  <span>Active school</span>
                </label>
                <button type="submit" disabled={isCreatingSchool} className="md:col-span-2 text-white py-2 rounded-lg text-xs font-bold uppercase tracking-widest disabled:opacity-60" style={{ backgroundColor: ELECTRIC_BLUE_DARK }}>
                  {isCreatingSchool ? 'Creating...' : 'Create School'}
                </button>
              </form>
              {schoolError && <p className="text-sm text-red-700">{schoolError}</p>}
              {schoolStatus && <p className="text-sm text-green-700">{schoolStatus}</p>}
              <div className="rounded-xl overflow-hidden shadow-sm bg-white border" style={{ borderColor: ELECTRIC_BLUE_GLOW }}>
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider" style={{ color: ELECTRIC_BLUE_DARK }}>Name</th>
                      <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider" style={{ color: ELECTRIC_BLUE_DARK }}>Type</th>
                      <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider" style={{ color: ELECTRIC_BLUE_DARK }}>County</th>
                      <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider" style={{ color: ELECTRIC_BLUE_DARK }}>Active</th>
                      <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wider" style={{ color: ELECTRIC_BLUE_DARK }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoadingSchools ? (
                      <tr><td colSpan={5} className="px-4 py-5 text-center">Loading schools...</td></tr>
                    ) : schools.length === 0 ? (
                      <tr><td colSpan={5} className="px-4 py-5 text-center">No schools yet.</td></tr>
                    ) : (
                      schools.map((school) => (
                        <tr key={school.id} className="border-t" style={{ borderColor: ELECTRIC_BLUE_GLOW }}>
                          <td className="px-4 py-3">{school.name}</td>
                          <td className="px-4 py-3">{school.school_type}</td>
                          <td className="px-4 py-3">{school.county}</td>
                          <td className="px-4 py-3">{school.is_active ? 'Yes' : 'No'}</td>
                          <td className="px-4 py-3 text-center">
                            <button onClick={() => handleDeleteSchool(school.id)} className="p-1.5 rounded-lg transition-colors hover:bg-red-100 text-red-500" title="Delete school">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'students' && (
            <div className="mb-10 grid lg:grid-cols-2 gap-6">
              <div className="rounded-xl overflow-hidden shadow-sm bg-white border" style={{ borderColor: ELECTRIC_BLUE_GLOW }}>
                <div className="p-4 border-b" style={{ borderColor: ELECTRIC_BLUE_GLOW }}>
                  <input
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    placeholder="Search by username or email"
                    className="w-full border rounded-lg px-3 py-2"
                    style={{ borderColor: ELECTRIC_BLUE_GLOW }}
                  />
                </div>
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider" style={{ color: ELECTRIC_BLUE_DARK }}>Username</th>
                      <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider" style={{ color: ELECTRIC_BLUE_DARK }}>Email</th>
                      <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider" style={{ color: ELECTRIC_BLUE_DARK }}>Age</th>
                      <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wider" style={{ color: ELECTRIC_BLUE_DARK }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoadingStudents ? (
                      <tr><td colSpan={4} className="px-4 py-5 text-center">Loading students...</td></tr>
                    ) : students.filter((student) => `${student.username} ${student.email}`.toLowerCase().includes(studentSearch.toLowerCase())).map((student) => (
                      <tr key={student.id} className="border-t" style={{ borderColor: ELECTRIC_BLUE_GLOW }}>
                        <td className="px-4 py-3">{student.username}</td>
                        <td className="px-4 py-3">{student.email}</td>
                        <td className="px-4 py-3">{student.age}</td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button className="p-1.5 rounded-lg transition-colors hover:bg-blue-100" style={{ color: ELECTRIC_BLUE_DARK }} onClick={() => setSelectedStudent({ ...student })}>
                              <Edit className="w-4 h-4" />
                            </button>
                            <button className="p-1.5 rounded-lg transition-colors hover:bg-red-100 text-red-500" onClick={() => handleDeleteStudent(student.id)}>
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="p-5 rounded-xl border bg-white" style={{ borderColor: ELECTRIC_BLUE_GLOW }}>
                <h3 className="text-sm font-bold uppercase tracking-wider mb-4" style={{ color: ELECTRIC_BLUE_DARK }}>Edit Student</h3>
                {!selectedStudent ? (
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Select a student from the list to edit.</p>
                ) : (
                  <form className="space-y-3" onSubmit={handleUpdateStudent}>
                    <input value={selectedStudent.username} disabled className="w-full border rounded-lg px-3 py-2 bg-gray-50" style={{ borderColor: ELECTRIC_BLUE_GLOW }} />
                    <input value={selectedStudent.email} disabled className="w-full border rounded-lg px-3 py-2 bg-gray-50" style={{ borderColor: ELECTRIC_BLUE_GLOW }} />
                    <select value={selectedStudent.school} onChange={(e) => setSelectedStudent((prev) => prev ? ({ ...prev, school: Number(e.target.value) }) : prev)} className="w-full border rounded-lg px-3 py-2 bg-white" style={{ borderColor: ELECTRIC_BLUE_GLOW }} required>
                      {schools.map((school) => <option key={school.id} value={school.id}>{school.name}</option>)}
                    </select>
                    <input type="number" min={1} max={150} value={selectedStudent.age} onChange={(e) => setSelectedStudent((prev) => prev ? ({ ...prev, age: Number(e.target.value) }) : prev)} className="w-full border rounded-lg px-3 py-2" style={{ borderColor: ELECTRIC_BLUE_GLOW }} required />
                    <input value={selectedStudent.disability_type} onChange={(e) => setSelectedStudent((prev) => prev ? ({ ...prev, disability_type: e.target.value }) : prev)} className="w-full border rounded-lg px-3 py-2" style={{ borderColor: ELECTRIC_BLUE_GLOW }} required />
                    {studentManageError && <p className="text-sm text-red-700">{studentManageError}</p>}
                    {studentManageStatus && <p className="text-sm text-green-700">{studentManageStatus}</p>}
                    <button type="submit" className="w-full text-white py-2 rounded-lg text-xs font-bold uppercase tracking-widest" style={{ backgroundColor: ELECTRIC_BLUE_DARK }}>Save Student</button>
                  </form>
                )}
              </div>
            </div>
          )}

          {activeTab === 'educators' && (
            <div className="mb-10 grid lg:grid-cols-2 gap-6">
              <div className="rounded-xl overflow-hidden shadow-sm bg-white border" style={{ borderColor: ELECTRIC_BLUE_GLOW }}>
                <div className="p-4 border-b" style={{ borderColor: ELECTRIC_BLUE_GLOW }}>
                  <input
                    value={educatorSearch}
                    onChange={(e) => setEducatorSearch(e.target.value)}
                    placeholder="Search by username or email"
                    className="w-full border rounded-lg px-3 py-2"
                    style={{ borderColor: ELECTRIC_BLUE_GLOW }}
                  />
                </div>
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider" style={{ color: ELECTRIC_BLUE_DARK }}>Username</th>
                      <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider" style={{ color: ELECTRIC_BLUE_DARK }}>Email</th>
                      <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider" style={{ color: ELECTRIC_BLUE_DARK }}>Department</th>
                      <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wider" style={{ color: ELECTRIC_BLUE_DARK }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoadingEducators ? (
                      <tr><td colSpan={4} className="px-4 py-5 text-center">Loading educators...</td></tr>
                    ) : educators.filter((educator) => `${educator.username} ${educator.email}`.toLowerCase().includes(educatorSearch.toLowerCase())).map((educator) => (
                      <tr key={educator.id} className="border-t" style={{ borderColor: ELECTRIC_BLUE_GLOW }}>
                        <td className="px-4 py-3">{educator.username}</td>
                        <td className="px-4 py-3">{educator.email}</td>
                        <td className="px-4 py-3">{educator.department}</td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button className="p-1.5 rounded-lg transition-colors hover:bg-blue-100" style={{ color: ELECTRIC_BLUE_DARK }} onClick={() => setSelectedEducator({ ...educator, schools: educator.schools ?? [] })}>
                              <Edit className="w-4 h-4" />
                            </button>
                            <button className="p-1.5 rounded-lg transition-colors hover:bg-red-100 text-red-500" onClick={() => handleDeleteEducator(educator.id)}>
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="p-5 rounded-xl border bg-white" style={{ borderColor: ELECTRIC_BLUE_GLOW }}>
                <h3 className="text-sm font-bold uppercase tracking-wider mb-4" style={{ color: ELECTRIC_BLUE_DARK }}>Edit Educator</h3>
                {!selectedEducator ? (
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Select an educator from the list to edit.</p>
                ) : (
                  <form className="space-y-3" onSubmit={handleUpdateEducator}>
                    <input value={selectedEducator.username} disabled className="w-full border rounded-lg px-3 py-2 bg-gray-50" style={{ borderColor: ELECTRIC_BLUE_GLOW }} />
                    <input value={selectedEducator.email} disabled className="w-full border rounded-lg px-3 py-2 bg-gray-50" style={{ borderColor: ELECTRIC_BLUE_GLOW }} />
                    <input value={selectedEducator.department} onChange={(e) => setSelectedEducator((prev) => prev ? ({ ...prev, department: e.target.value }) : prev)} className="w-full border rounded-lg px-3 py-2" style={{ borderColor: ELECTRIC_BLUE_GLOW }} required />
                    <input value={selectedEducator.employee_id ?? ''} onChange={(e) => setSelectedEducator((prev) => prev ? ({ ...prev, employee_id: e.target.value }) : prev)} placeholder="Employee ID" className="w-full border rounded-lg px-3 py-2" style={{ borderColor: ELECTRIC_BLUE_GLOW }} />
                    <label className="block text-xs font-bold uppercase tracking-wider" style={{ color: ELECTRIC_BLUE_DARK }}>Schools</label>
                    <div className="max-h-36 overflow-y-auto border rounded-lg p-2" style={{ borderColor: ELECTRIC_BLUE_GLOW }}>
                      {schools.map((school) => (
                        <label key={school.id} className="flex items-center gap-2 py-1 text-sm">
                          <input
                            type="checkbox"
                            checked={selectedEducator.schools.includes(school.id)}
                            onChange={(e) => {
                              setSelectedEducator((prev) => {
                                if (!prev) return prev;
                                return {
                                  ...prev,
                                  schools: e.target.checked
                                    ? [...prev.schools, school.id]
                                    : prev.schools.filter((id) => id !== school.id),
                                };
                              });
                            }}
                          />
                          <span>{school.name}</span>
                        </label>
                      ))}
                    </div>
                    {educatorManageError && <p className="text-sm text-red-700">{educatorManageError}</p>}
                    {educatorManageStatus && <p className="text-sm text-green-700">{educatorManageStatus}</p>}
                    <button type="submit" className="w-full text-white py-2 rounded-lg text-xs font-bold uppercase tracking-widest" style={{ backgroundColor: ELECTRIC_BLUE_DARK }}>Save Educator</button>
                  </form>
                )}
              </div>
            </div>
          )}

          {activeTab === 'courses' && (
            <div className="mb-10 grid lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <form className="p-5 rounded-xl border bg-white space-y-3" style={{ borderColor: ELECTRIC_BLUE_GLOW }} onSubmit={handleCreateCourse}>
                  <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: ELECTRIC_BLUE_DARK }}>Create Course</h3>
                  <input value={newCourse.title} onChange={(e) => setNewCourse((prev) => ({ ...prev, title: e.target.value }))} placeholder="Title" className="w-full border rounded-lg px-3 py-2" style={{ borderColor: ELECTRIC_BLUE_GLOW }} required />
                  <textarea value={newCourse.description} onChange={(e) => setNewCourse((prev) => ({ ...prev, description: e.target.value }))} placeholder="Description" rows={4} className="w-full border rounded-lg px-3 py-2" style={{ borderColor: ELECTRIC_BLUE_GLOW }} required />
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={newCourse.is_published} onChange={(e) => setNewCourse((prev) => ({ ...prev, is_published: e.target.checked }))} />
                    <span>Published</span>
                  </label>
                  <button type="submit" disabled={isCreatingCourse} className="w-full text-white py-2 rounded-lg text-xs font-bold uppercase tracking-widest disabled:opacity-60" style={{ backgroundColor: ELECTRIC_BLUE_DARK }}>
                    {isCreatingCourse ? 'Creating...' : 'Create Course'}
                  </button>
                </form>
                {courseError && <p className="text-sm text-red-700">{courseError}</p>}
                {courseStatus && <p className="text-sm text-green-700">{courseStatus}</p>}
                <div className="rounded-xl overflow-hidden shadow-sm bg-white border" style={{ borderColor: ELECTRIC_BLUE_GLOW }}>
                  <div className="p-4 border-b" style={{ borderColor: ELECTRIC_BLUE_GLOW }}>
                    <input value={courseSearch} onChange={(e) => setCourseSearch(e.target.value)} placeholder="Search courses" className="w-full border rounded-lg px-3 py-2" style={{ borderColor: ELECTRIC_BLUE_GLOW }} />
                  </div>
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider" style={{ color: ELECTRIC_BLUE_DARK }}>Title</th>
                        <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider" style={{ color: ELECTRIC_BLUE_DARK }}>Published</th>
                        <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wider" style={{ color: ELECTRIC_BLUE_DARK }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {isLoadingCourses ? (
                        <tr><td colSpan={3} className="px-4 py-5 text-center">Loading courses...</td></tr>
                      ) : courses.filter((course) => course.title.toLowerCase().includes(courseSearch.toLowerCase())).map((course) => (
                        <tr key={course.id} className="border-t" style={{ borderColor: ELECTRIC_BLUE_GLOW }}>
                          <td className="px-4 py-3">{course.title}</td>
                          <td className="px-4 py-3">{course.is_published ? 'Yes' : 'No'}</td>
                          <td className="px-4 py-3 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button className="p-1.5 rounded-lg transition-colors hover:bg-blue-100" style={{ color: ELECTRIC_BLUE_DARK }} onClick={() => setSelectedCourse({ ...course })}><Edit className="w-4 h-4" /></button>
                              <button className="p-1.5 rounded-lg transition-colors hover:bg-red-100 text-red-500" onClick={() => handleDeleteCourse(course.id)}><Trash2 className="w-4 h-4" /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="p-5 rounded-xl border bg-white" style={{ borderColor: ELECTRIC_BLUE_GLOW }}>
                <h3 className="text-sm font-bold uppercase tracking-wider mb-4" style={{ color: ELECTRIC_BLUE_DARK }}>Edit Course</h3>
                {!selectedCourse ? (
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Select a course from the table to edit.</p>
                ) : (
                  <form className="space-y-3" onSubmit={handleUpdateCourse}>
                    <input value={selectedCourse.title} onChange={(e) => setSelectedCourse((prev) => prev ? ({ ...prev, title: e.target.value }) : prev)} className="w-full border rounded-lg px-3 py-2" style={{ borderColor: ELECTRIC_BLUE_GLOW }} required />
                    <textarea value={selectedCourse.description} onChange={(e) => setSelectedCourse((prev) => prev ? ({ ...prev, description: e.target.value }) : prev)} rows={6} className="w-full border rounded-lg px-3 py-2" style={{ borderColor: ELECTRIC_BLUE_GLOW }} required />
                    <label className="flex items-center gap-2 text-sm">
                      <input type="checkbox" checked={selectedCourse.is_published} onChange={(e) => setSelectedCourse((prev) => prev ? ({ ...prev, is_published: e.target.checked }) : prev)} />
                      <span>Published</span>
                    </label>
                    <button type="submit" className="w-full text-white py-2 rounded-lg text-xs font-bold uppercase tracking-widest" style={{ backgroundColor: ELECTRIC_BLUE_DARK }}>Save Course</button>
                  </form>
                )}
              </div>
            </div>
          )}

          {activeTab === 'assignments' && (
            <div className="mb-10 grid lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <form className="p-5 rounded-xl border bg-white space-y-3" style={{ borderColor: ELECTRIC_BLUE_GLOW }} onSubmit={handleCreateAssignment}>
                  <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: ELECTRIC_BLUE_DARK }}>Create Assignment</h3>
                  <input value={newAssignment.title} onChange={(e) => setNewAssignment((prev) => ({ ...prev, title: e.target.value }))} placeholder="Title" className="w-full border rounded-lg px-3 py-2" style={{ borderColor: ELECTRIC_BLUE_GLOW }} required />
                  <textarea value={newAssignment.description} onChange={(e) => setNewAssignment((prev) => ({ ...prev, description: e.target.value }))} placeholder="Description" rows={3} className="w-full border rounded-lg px-3 py-2" style={{ borderColor: ELECTRIC_BLUE_GLOW }} required />
                  <input type="datetime-local" value={newAssignment.due_at} onChange={(e) => setNewAssignment((prev) => ({ ...prev, due_at: e.target.value }))} className="w-full border rounded-lg px-3 py-2" style={{ borderColor: ELECTRIC_BLUE_GLOW }} required />
                  <select value={newAssignment.course_id} onChange={(e) => setNewAssignment((prev) => ({ ...prev, course_id: e.target.value }))} className="w-full border rounded-lg px-3 py-2 bg-white" style={{ borderColor: ELECTRIC_BLUE_GLOW }} required>
                    <option value="">Select course</option>
                    {courses.map((course) => <option key={course.id} value={course.id}>{course.title}</option>)}
                  </select>
                  <button type="submit" disabled={isCreatingAssignment} className="w-full text-white py-2 rounded-lg text-xs font-bold uppercase tracking-widest disabled:opacity-60" style={{ backgroundColor: ELECTRIC_BLUE_DARK }}>
                    {isCreatingAssignment ? 'Creating...' : 'Create Assignment'}
                  </button>
                </form>
                {assignmentError && <p className="text-sm text-red-700">{assignmentError}</p>}
                {assignmentStatus && <p className="text-sm text-green-700">{assignmentStatus}</p>}
              </div>

              <div className="p-5 rounded-xl border bg-white" style={{ borderColor: ELECTRIC_BLUE_GLOW }}>
                <h3 className="text-sm font-bold uppercase tracking-wider mb-4" style={{ color: ELECTRIC_BLUE_DARK }}>Edit Assignment</h3>
                {!selectedAssignment ? (
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Select an assignment from the table to edit.</p>
                ) : (
                  <form className="space-y-3" onSubmit={handleUpdateAssignment}>
                    <input value={selectedAssignment.title} onChange={(e) => setSelectedAssignment((prev) => prev ? ({ ...prev, title: e.target.value }) : prev)} className="w-full border rounded-lg px-3 py-2" style={{ borderColor: ELECTRIC_BLUE_GLOW }} required />
                    <textarea value={selectedAssignment.description} onChange={(e) => setSelectedAssignment((prev) => prev ? ({ ...prev, description: e.target.value }) : prev)} rows={3} className="w-full border rounded-lg px-3 py-2" style={{ borderColor: ELECTRIC_BLUE_GLOW }} required />
                    <input type="datetime-local" value={selectedAssignment.due_at ? new Date(selectedAssignment.due_at).toISOString().slice(0, 16) : ''} onChange={(e) => setSelectedAssignment((prev) => prev ? ({ ...prev, due_at: e.target.value }) : prev)} className="w-full border rounded-lg px-3 py-2" style={{ borderColor: ELECTRIC_BLUE_GLOW }} required />
                    <select value={String(selectedAssignment.course_id ?? selectedAssignment.course?.id ?? '')} onChange={(e) => setSelectedAssignment((prev) => prev ? ({ ...prev, course_id: Number(e.target.value) }) : prev)} className="w-full border rounded-lg px-3 py-2 bg-white" style={{ borderColor: ELECTRIC_BLUE_GLOW }} required>
                      <option value="">Select course</option>
                      {courses.map((course) => <option key={course.id} value={course.id}>{course.title}</option>)}
                    </select>
                    <button type="submit" className="w-full text-white py-2 rounded-lg text-xs font-bold uppercase tracking-widest" style={{ backgroundColor: ELECTRIC_BLUE_DARK }}>Save Assignment</button>
                  </form>
                )}
              </div>

              <div className="lg:col-span-2 rounded-xl overflow-hidden shadow-sm bg-white border" style={{ borderColor: ELECTRIC_BLUE_GLOW }}>
                <div className="p-4 border-b" style={{ borderColor: ELECTRIC_BLUE_GLOW }}>
                  <input value={assignmentSearch} onChange={(e) => setAssignmentSearch(e.target.value)} placeholder="Search assignments by title or course" className="w-full border rounded-lg px-3 py-2" style={{ borderColor: ELECTRIC_BLUE_GLOW }} />
                </div>
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider" style={{ color: ELECTRIC_BLUE_DARK }}>Title</th>
                      <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider" style={{ color: ELECTRIC_BLUE_DARK }}>Course</th>
                      <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider" style={{ color: ELECTRIC_BLUE_DARK }}>Due Date</th>
                      <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wider" style={{ color: ELECTRIC_BLUE_DARK }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoadingAssignments ? (
                      <tr><td colSpan={4} className="px-4 py-5 text-center">Loading assignments...</td></tr>
                    ) : assignments.filter((assignment) => `${assignment.title} ${assignment.course?.title ?? ''}`.toLowerCase().includes(assignmentSearch.toLowerCase())).map((assignment) => (
                      <tr key={assignment.id} className="border-t" style={{ borderColor: ELECTRIC_BLUE_GLOW }}>
                        <td className="px-4 py-3">{assignment.title}</td>
                        <td className="px-4 py-3">{assignment.course?.title ?? '-'}</td>
                        <td className="px-4 py-3">{assignment.due_at ? new Date(assignment.due_at).toLocaleString() : '-'}</td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button className="p-1.5 rounded-lg transition-colors hover:bg-blue-100" style={{ color: ELECTRIC_BLUE_DARK }} onClick={() => setSelectedAssignment({ ...assignment, course_id: assignment.course?.id })}><Edit className="w-4 h-4" /></button>
                            <button className="p-1.5 rounded-lg transition-colors hover:bg-red-100 text-red-500" onClick={() => handleDeleteAssignment(assignment.id)}><Trash2 className="w-4 h-4" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'evidence' && (
            <>
          <div className="access-list mb-8">
            <li style={{ backgroundColor: 'var(--brand-soft)', borderColor: 'var(--brand-border)', borderLeftColor: ELECTRIC_BLUE_DARK }}>
              <div className="flex flex-wrap justify-between items-center gap-4">
                <div className="flex flex-wrap gap-3">
                  <div className="relative">
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept=".csv"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="csv-upload"
                      disabled={isUploading}
                    />
                    <label
                      htmlFor="csv-upload"
                      className={`inline-flex items-center gap-2 text-white px-5 py-2.5 text-sm font-bold uppercase tracking-widest transition rounded-lg cursor-pointer ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                      style={{ backgroundColor: isUploading ? ELECTRIC_BLUE_LIGHT : ELECTRIC_BLUE_DARK }}
                    >
                      {isUploading ? <LoadingSpinner /> : <Upload className="w-4 h-4" />}
                      Upload CSV
                    </label>
                  </div>
                  
                  <button
                    onClick={downloadTemplate}
                    className="inline-flex items-center gap-2 border px-5 py-2.5 text-sm font-bold uppercase tracking-widest transition rounded-lg"
                    style={{ borderColor: ELECTRIC_BLUE_GLOW, color: ELECTRIC_BLUE_DARK, backgroundColor: 'var(--white)' }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = ELECTRIC_BLUE_GLOW)}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--white)')}
                  >
                    <FileText className="w-4 h-4" />
                    Download Template
                  </button>
                  
                  <button
                    onClick={exportToCSV}
                    className="inline-flex items-center gap-2 border px-5 py-2.5 text-sm font-bold uppercase tracking-widest transition rounded-lg"
                    style={{ borderColor: ELECTRIC_BLUE_GLOW, color: ELECTRIC_BLUE_DARK, backgroundColor: 'var(--white)' }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = ELECTRIC_BLUE_GLOW)}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--white)')}
                  >
                    <Download className="w-4 h-4" />
                    Export CSV
                  </button>
                </div>
                <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  Total: {stats.total} records
                </div>
              </div>
            </li>
          </div>

          {/* Upload Status */}
          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 flex items-center justify-between gap-3">
              <span>{error}</span>
              <button
                onClick={() => {
                  clearError();
                  refreshEvidence({ auth: true });
                }}
                className="text-xs font-bold uppercase tracking-widest"
              >
                Retry
              </button>
            </div>
          )}

          {actionError && (
            <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700">
              {actionError}
            </div>
          )}

          {uploadStatus && (
            <div className={`mb-6 p-4 rounded-lg ${uploadStatus.isError ? 'bg-red-50 border border-red-200 text-red-700' : 'bg-green-50 border border-green-200 text-green-700'}`}>
              {uploadStatus.message}
            </div>
          )}

          {/* CSV Instructions */}
          <details className="mb-6 rounded-lg" style={{ backgroundColor: 'var(--brand-soft)', border: `1px solid ${ELECTRIC_BLUE_GLOW}` }}>
            <summary className="cursor-pointer p-4 text-sm font-bold uppercase tracking-widest" style={{ color: ELECTRIC_BLUE_DARK }}>
               CSV Format Instructions
            </summary>
            <div className="p-4 pt-0 border-t" style={{ borderColor: ELECTRIC_BLUE_GLOW }}>
              <p className="text-sm mb-2" style={{ color: 'var(--text-muted)' }}>Your CSV file must have these columns in this order:</p>
              <code className="text-xs bg-white p-3 block rounded-lg border font-mono" style={{ borderColor: ELECTRIC_BLUE_GLOW }}>
                school, county, age, disabilityType, sessionType, outcomeRecorded
              </code>
              <p className="text-xs mt-3" style={{ color: 'var(--text-muted)' }}>
                <strong className="font-bold" style={{ color: ELECTRIC_BLUE_DARK }}>Auto-Assignment:</strong> User IDs are automatically generated as BRL-001, BRL-002, etc.<br />
                <strong className="font-bold" style={{ color: ELECTRIC_BLUE_DARK }}>Valid counties:</strong> {COUNTIES.join(', ')}<br />
                <strong className="font-bold" style={{ color: ELECTRIC_BLUE_DARK }}>Valid disability types:</strong> {DISABILITY_TYPES.join(', ')}<br />
                <strong className="font-bold" style={{ color: ELECTRIC_BLUE_DARK }}>Valid session types:</strong> {SESSION_TYPES.join(', ')}
              </p>
            </div>
          </details>

          {/* Evidence Table w */}
          <div className="rounded-xl overflow-hidden shadow-sm" style={{ backgroundColor: 'var(--white)', border: `1px solid ${ELECTRIC_BLUE_GLOW}` }}>
            <div className="px-6 py-4 border-b" style={{ backgroundColor: ELECTRIC_BLUE_GLOW, borderColor: ELECTRIC_BLUE_GLOW }}>
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: ELECTRIC_BLUE_DARK }}> Learner Evidence Records</h3>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" style={{ color: ELECTRIC_BLUE_DARK }} />
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{stats.total} total records</span>
                </div>
              </div>
            </div>
            
            {/* Custom Table  */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b" style={{ borderColor: ELECTRIC_BLUE_GLOW }}>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider" style={{ color: ELECTRIC_BLUE_DARK }}>User ID</th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider" style={{ color: ELECTRIC_BLUE_DARK }}>School</th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider" style={{ color: ELECTRIC_BLUE_DARK }}>County</th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider" style={{ color: ELECTRIC_BLUE_DARK }}>Age</th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider" style={{ color: ELECTRIC_BLUE_DARK }}>Disability</th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider" style={{ color: ELECTRIC_BLUE_DARK }}>Session</th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider" style={{ color: ELECTRIC_BLUE_DARK }}>Outcome</th>
                    <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wider" style={{ color: ELECTRIC_BLUE_DARK }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-6 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
                        Loading evidence records...
                      </td>
                    </tr>
                  ) : evidence.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-6 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
                        No evidence records available yet.
                      </td>
                    </tr>
                  ) : (
                    evidence.map((record, idx) => (
                      <tr key={record.id} className="border-t transition-colors hover:bg-gray-50" style={{ borderColor: ELECTRIC_BLUE_GLOW, backgroundColor: idx % 2 === 0 ? 'var(--white)' : 'var(--brand-soft)' }}>
                        <td className="px-4 py-3 font-mono text-xs font-semibold" style={{ color: ELECTRIC_BLUE_DARK }}>{record.userId}</td>
                        <td className="px-4 py-3 text-slate-700 max-w-[200px] truncate" title={record.school}>{record.school}</td>
                        <td className="px-4 py-3 text-slate-700">{record.county}</td>
                        <td className="px-4 py-3 text-slate-700">{record.age}</td>
                        <td className="px-4 py-3 text-slate-700 max-w-[150px] truncate" title={record.disabilityType}>{record.disabilityType}</td>
                        <td className="px-4 py-3 text-slate-700 max-w-[150px] truncate" title={record.sessionType}>{record.sessionType}</td>
                        <td className="px-4 py-3 text-slate-500 italic max-w-[300px] truncate" title={record.outcomeRecorded}>{record.outcomeRecorded}</td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex gap-2 justify-center">
                            <button
                              onClick={() => setEditingRecord(record)}
                              className="p-1.5 rounded-lg transition-colors hover:bg-blue-100"
                              style={{ color: ELECTRIC_BLUE_DARK }}
                              title="Edit record"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setShowDeleteConfirm(record.id)}
                              className="p-1.5 rounded-lg transition-colors hover:bg-red-100 text-red-500"
                              title="Delete record"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                         </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
            </>
          )}
        </div>
      </section>

            {/* Footer - Black */}
      <footer className="bg-black text-white py-16 px-6 lg:px-24">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="space-y-4">
            <img src={LOGO} alt="BrailleEd" className="h-16 w-auto invert brightness-0" />
            <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
              Robotics and coding for blind and visually impaired students in Kenya. Leading the way in inclusive STEM.
            </p>
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-blue-500 mb-6">Explore</h3>
            <ul className="space-y-3 text-sm font-medium uppercase tracking-widest text-gray-300">
              <li><a href="/playground/" className="hover:text-white transition">Playground</a></li>
              <li><a href="/evidence" className="hover:text-white transition">User Evidence</a></li>
              <li><a href="/#who-we-are" className="hover:text-white transition">Who we are</a></li>
              <li><a href="/#purchase-kit" className="hover:text-white transition">Purchase a kit</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-blue-500 mb-6">Contact</h3>
            <ul className="space-y-3 text-sm text-gray-300">
              <li><a href={MAIL_KIT} className="hover:text-white transition">bunifuyouthskenya@gmail.com</a></li>
              <li><a href="tel:+254712015793" className="hover:text-white transition">0712 015793</a></li>
              <li className="pt-2 font-bold text-white uppercase tracking-widest text-xs">Based in Kenya</li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto border-t border-white/10 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-xs uppercase tracking-widest">© {new Date().getFullYear()} BrailleEd · Bunifu Youths Kenya</p>
          <div className="flex gap-6 text-gray-500 text-xs uppercase tracking-widest">
            <span>Accessibility First</span>
            <span>Terms</span>
            <span>Privacy</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

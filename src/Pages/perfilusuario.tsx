import { useState, useEffect, useRef } from 'react';
import type { FormEvent } from 'react';
import type { TFunction } from 'i18next';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Mail,
  MapPin,
  GraduationCap,
  Globe,
  Trash2,
  ChevronDown,
  Plus,
  X,
  Home,
  Settings,
  Camera,
  FileText,
  CalendarDays,
} from 'lucide-react';
import ExperienciaLaboralModal from "./ExperienciaLaboral";
import ExperienciaAcademicaModal from "./ExperienciaAcademica";

// ── Constants ────────────────────────────────────────────────────────────────
const API =
  (import.meta as any)?.env?.VITE_API_URL?.replace(/\/$/, '') ||
  'http://127.0.0.1:8000';

const CATS: Record<string, string[]> = {
  'Lenguajes de Programación': ['Java', 'Python', 'JavaScript', 'TypeScript', 'C', 'C++', 'C#', 'PHP', 'Go', 'Ruby', 'Swift', 'Kotlin', 'SQL', 'R', 'Rust'],
  'Desarrollo Web Frontend': ['HTML5', 'CSS3', 'JavaScript', 'TypeScript', 'React', 'Vue.js', 'Angular', 'Next.js', 'Bootstrap', 'Tailwind CSS', 'SASS', 'jQuery'],
  'Desarrollo Web Backend': ['Node.js', 'Express.js', 'Laravel', 'PHP', 'Django', 'Flask', 'Spring Boot', 'Java EE', 'ASP.NET Core', 'NestJS', 'Ruby on Rails', 'FastAPI'],
  'Desarrollo Móvil': ['Android Studio', 'Java Android', 'Kotlin', 'Swift', 'Flutter', 'React Native', 'Ionic', 'Xamarin'],
  'Bases de Datos': ['MySQL', 'PostgreSQL', 'SQL Server', 'Oracle Database', 'MongoDB', 'Firebase Firestore', 'MariaDB', 'SQLite', 'Redis', 'Cassandra'],
  'Frameworks y Librerías': ['React', 'Vue.js', 'Angular', 'Laravel', 'Django', 'Spring Boot', 'Express.js', 'Bootstrap', 'Tailwind CSS', 'TensorFlow', 'PyTorch', 'jQuery'],
  'DevOps / Infraestructura': ['Docker', 'Kubernetes', 'Jenkins', 'GitHub Actions', 'GitLab CI/CD', 'Ansible', 'Terraform', 'Nginx', 'Apache', 'Linux Server'],
  'Cloud Computing': ['AWS', 'Microsoft Azure', 'Google Cloud Platform', 'Firebase', 'DigitalOcean', 'Heroku', 'Vercel', 'Netlify'],
  'Seguridad Informática': ['OWASP', 'Pentesting', 'Ethical Hacking', 'Burp Suite', 'Wireshark', 'Kali Linux', 'Firewall', 'Criptografía', 'Autenticación JWT', 'Ciberseguridad Web'],
  'Inteligencia Artificial / Data Science': ['Python', 'Pandas', 'NumPy', 'Scikit-learn', 'TensorFlow', 'PyTorch', 'Power BI', 'Tableau', 'Machine Learning', 'Deep Learning', 'Data Mining', 'Análisis de Datos'],
  'Testing / QA': ['Postman', 'Selenium', 'Cypress', 'JUnit', 'PyTest', 'Testing Manual', 'Testing Automatizado', 'Pruebas Unitarias', 'Pruebas Funcionales', 'QA Analyst'],
  'Herramientas de Diseño': ['Figma', 'Adobe XD', 'Photoshop', 'Illustrator', 'Canva', 'UI Design', 'UX Design', 'Wireframing', 'Prototyping', 'Diseño Responsive'],
};

const SOFT = ['Trabajo en equipo', 'Liderazgo', 'Comunicación', 'Resolución de problemas', 'Adaptabilidad', 'Pensamiento crítico', 'Gestión del tiempo', 'Creatividad', 'Inteligencia emocional', 'Proactividad', 'Empatía', 'Negociación', 'Toma de decisiones', 'Gestión del estrés', 'Orientación a resultados'];

const CAT_LABEL_KEYS: Record<string, string> = {
  'Lenguajes de Programación': 'profile.categories.programming_languages',
  'Desarrollo Web Frontend': 'profile.categories.frontend',
  'Desarrollo Web Backend': 'profile.categories.backend',
  'Desarrollo Móvil': 'profile.categories.mobile',
  'Bases de Datos': 'profile.categories.databases',
  'Frameworks y Librerías': 'profile.categories.frameworks',
  'DevOps / Infraestructura': 'profile.categories.devops',
  'Cloud Computing': 'profile.categories.cloud',
  'Seguridad Informática': 'profile.categories.security',
  'Inteligencia Artificial / Data Science': 'profile.categories.ai',
  'Testing / QA': 'profile.categories.testing',
  'Herramientas de Diseño': 'profile.categories.design',
  'Habilidades Blandas': 'profile.categories.soft_skills',
  'Habilidades Técnicas': 'profile.categories.technical_skills',
};

const SOFT_LABEL_KEYS: Record<string, string> = {
  'Trabajo en equipo': 'profile.soft.work_team',
  'Liderazgo': 'profile.soft.leadership',
  'Comunicación': 'profile.soft.communication',
  'Resolución de problemas': 'profile.soft.problem_solving',
  'Adaptabilidad': 'profile.soft.adaptability',
  'Pensamiento crítico': 'profile.soft.critical_thinking',
  'Gestión del tiempo': 'profile.soft.time_management',
  'Creatividad': 'profile.soft.creativity',
  'Inteligencia emocional': 'profile.soft.emotional_intelligence',
  'Proactividad': 'profile.soft.proactivity',
  'Empatía': 'profile.soft.empathy',
  'Negociación': 'profile.soft.negotiation',
  'Toma de decisiones': 'profile.soft.decision_making',
  'Gestión del estrés': 'profile.soft.stress_management',
  'Orientación a resultados': 'profile.soft.results_oriented',
};

const translateCategory = (t: (key: string, fallback?: string) => string, value: string) =>
  CAT_LABEL_KEYS[value] ? t(CAT_LABEL_KEYS[value], value) : value;

const translateSoftSkill = (t: (key: string, fallback?: string) => string, value: string) =>
  SOFT_LABEL_KEYS[value] ? t(SOFT_LABEL_KEYS[value], value) : value;

const PLATFORMS: Record<string, string> = {
  LinkedIn: 'https://www.linkedin.com/in/',
  GitHub: 'https://github.com/',
  GitLab: 'https://gitlab.com/',
  LeetCode: 'https://leetcode.com/',
  HackerRank: 'https://www.hackerrank.com/',
  Kaggle: 'https://www.kaggle.com/',
  Instagram: 'https://www.instagram.com/',
  Facebook: 'https://www.facebook.com/',
  'Twitter / X': 'https://x.com/',
};

const NET_LABELS: Record<string, string> = {
  linkedin: 'LinkedIn',
  github: 'GitHub',
  gitlab: 'GitLab',
  leetcode: 'LeetCode',
  hackerrank: 'HackerRank',
  kaggle: 'Kaggle',
  instagram: 'Instagram',
  facebook: 'Facebook',
  twitter: 'Twitter / X',
};

const TABS = [
  { id: 'datosPersonales', labelKey: 'profile.tabs.personal_data' },
  { id: 'habilidades', labelKey: 'profile.tabs.skills' },
  { id: 'enlaces', labelKey: 'profile.tabs.professional_links' },
  { id: 'academica', labelKey: 'profile.tabs.academic_experience' },
  { id: 'laboral', labelKey: 'profile.tabs.work_experience' },
] as const;

type Tab = typeof TABS[number]['id'];

// ── Types ────────────────────────────────────────────────────────────────────
interface Skill {
  id_habilidad: string;
  nombre: string;
  tipo: 'tecnica' | 'blanda';
  nivel: number;
  visible: boolean;
  categoria?: string | null;
}

interface LinkItem {
  id_redes_prof: string;
  nombre_red: string;
  url_red: string;
  created_at?: string;
}

interface ExperienciaAcademicaItem {
  id_experiencia_academica: string;
  id_portafolio?: string;
  institucion: string;
  titulo: string;
  descripcion: string;
  fecha_ini: string;
  fecha_fin: string | null;
  visible?: boolean;
  created_at?: string;
}

// ── Utils ────────────────────────────────────────────────────────────────────
const getFullName = (u: any) => [u.nombre, u.apellido_paterno, u.apellido_materno].filter(Boolean).join(' ');
const getNetLabel = (v: string) => NET_LABELS[v?.toLowerCase()] || v;

const normalizeSkill = (item: any): Skill => {
  const id = String(item?.id_habilidad ?? '');
  let cache: Record<string, string> = {};
  try {
    cache = JSON.parse(localStorage.getItem('skillCategories') || '{}');
  } catch {}

  return {
    id_habilidad: id,
    nombre: String(item?.nombre ?? ''),
    tipo: item?.tipo === 'blanda' ? 'blanda' : 'tecnica',
    nivel: Number(item?.nivel ?? 0),
    visible: item?.visible === true || item?.visible === 1,
    categoria: item?.categoria ?? cache[id] ?? null,
  };
};

const saveCatCache = (skills: Skill[]) => {
  const c = skills.reduce((a: Record<string, string>, s) => {
    if (s.categoria) {
      a[s.id_habilidad] = s.categoria;
      a[s.nombre.toLowerCase()] = s.categoria;
    }
    return a;
  }, {});
  localStorage.setItem('skillCategories', JSON.stringify(c));
};

const flattenSkills = (data: any): Skill[] => {
  if (Array.isArray(data)) return data.map(normalizeSkill);

  if (data && typeof data === 'object') {
    const r: Skill[] = [];
    Object.entries(data).forEach(([tipo, cats]) => {
      if (cats && typeof cats === 'object') {
        Object.entries(cats as Record<string, any[]>).forEach(([cat, items]) => {
          if (Array.isArray(items)) {
            items.forEach((i) => r.push(normalizeSkill({ ...i, tipo, categoria: cat })));
          }
        });
      }
    });
    return r;
  }

  return [];
};

const normalizeAcademica = (item: any): ExperienciaAcademicaItem => ({
  id_experiencia_academica: String(item?.id_experiencia_academica ?? ''),
  id_portafolio: item?.id_portafolio ? String(item.id_portafolio) : undefined,
  institucion: String(item?.institucion ?? ''),
  titulo: String(item?.titulo ?? ''),
  descripcion: String(item?.descripcion ?? ''),
  fecha_ini: String(item?.fecha_ini ?? ''),
  fecha_fin: item?.fecha_fin ?? null,
  visible: item?.visible === true || item?.visible === 1,
  created_at: item?.created_at ?? undefined,
});

const formatAcademicDate = (dateStr?: string | null) => {
  if (!dateStr) return 'Actualidad';
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('es-BO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const formatAcademicRange = (inicio: string, fin: string | null, currentLabel = 'Actualidad') => {
  return `${formatAcademicDate(inicio)} - ${fin ? formatAcademicDate(fin) : currentLabel}`;
};

// ── Reusable UI ──────────────────────────────────────────────────────────────
const selCls =
  'w-full px-4 py-3 bg-white text-gray-900 border border-gray-300 rounded-[14px] focus:ring-2 focus:ring-[#1F4E79] outline-none appearance-none cursor-pointer text-[14px] disabled:opacity-50';
const lblCls = 'block text-[14px] font-bold text-gray-700 mb-2';

function Sel({
  label,
  value,
  onChange,
  opts,
  placeholder,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  opts: { value: string; label: string }[];
  placeholder?: string;
  disabled?: boolean;
}) {
  return (
    <div>
      <label className={lblCls}>{label}</label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className={selCls}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {opts.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none w-4 h-4" />
      </div>
    </div>
  );
}

function Toggle({ on, toggle }: { on: boolean; toggle: () => void }) {
  return (
    <button
      type="button"
      onClick={toggle}
      className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
        on ? 'bg-[#1F4E79]' : 'bg-gray-300'
      }`}
    >
      <span
        className={`inline-block h-5 w-5 rounded-full bg-white shadow transform transition-transform ${
          on ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );
}

function ModalWrap({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center bg-black/40 backdrop-blur-[2px] p-4 overflow-y-auto">
      <div className="flex items-center justify-center min-h-full w-full">
        {children}
      </div>
    </div>
  );
}

function SuccessModal({
  title,
  msg,
  onClose,
}: {
  title: string;
  msg: string;
  onClose: () => void;
}) {
  const { t } = useTranslation();

  return (
    <ModalWrap>
      <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-[380px] p-10 text-center my-auto">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <div className="w-11 h-11 bg-green-500 rounded-full flex items-center justify-center">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
        <h3 className="text-[20px] font-extrabold text-gray-900 mb-2 uppercase">{title}</h3>
        <p className="text-gray-500 mb-8">{msg}</p>
        <button
          onClick={onClose}
          className="w-full bg-[#1F4E79] text-white font-bold py-3 rounded-2xl hover:opacity-90 transition"
        >
          {t('profile.common.accept')}
        </button>
      </div>
    </ModalWrap>
  );
}

function ConfirmModal({
  title,
  msg,
  onOk,
  onCancel,
  loading,
}: {
  title: string;
  msg: string;
  onOk: () => void;
  onCancel: () => void;
  loading?: boolean;
}) {
  const { t } = useTranslation();

  return (
    <ModalWrap>
      <div className="bg-white rounded-[24px] shadow-2xl p-8 max-w-sm w-full text-center">
        <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-red-600 mb-6 border-[8px] border-red-100">
          <svg className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h3 className="text-[20px] font-bold text-gray-900 mb-2 uppercase">{title}</h3>
        <p className="text-gray-500 mb-8 text-[14px]">{msg}</p>
        <div className="flex gap-4 justify-center">
          <button
            disabled={loading}
            onClick={onOk}
            className="px-6 py-2.5 bg-[#1F4E79] text-white font-bold rounded-xl hover:opacity-90 active:scale-95 disabled:opacity-60 transition"
          >
            {t('profile.common.accept')}
          </button>
          <button
            disabled={loading}
            onClick={onCancel}
            className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold rounded-xl transition disabled:opacity-60"
          >
            {t('profile.common.cancel')}
          </button>
        </div>
      </div>
    </ModalWrap>
  );
}

function DeleteSuccessModal({
  title,
  msg,
  onClose,
}: {
  title: string;
  msg: string;
  onClose: () => void;
}) {
  const { t } = useTranslation();

  return (
    <ModalWrap>
      <div className="bg-white rounded-[24px] shadow-2xl p-8 max-w-sm w-full text-center">
        <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-red-600 mb-6 border-[8px] border-red-100">
          <svg className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h3 className="text-[20px] font-bold text-gray-900 mb-2 uppercase">{title}</h3>
        <p className="text-gray-500 mb-8 text-[14px]">{msg}</p>
        <button
          onClick={onClose}
          className="px-10 py-2.5 bg-[#1F4E79] hover:opacity-90 text-white font-bold rounded-xl shadow active:scale-95 transition"
        >
          {t('profile.common.accept')}
        </button>
      </div>
    </ModalWrap>
  );
}

// ── Skill Modal ──────────────────────────────────────────────────────────────
function SkillModal({
  onClose,
  onSaved,
}: {
  onClose: () => void;
  onSaved: (s: Skill) => void;
}) {
  const { t } = useTranslation();
  const token = localStorage.getItem('token') || '';
  const [tipo, setTipo] = useState<'Dura' | 'Blanda'>('Dura');
  const [cat, setCat] = useState('');
  const [nombre, setNombre] = useState('');
  const [nivel, setNivel] = useState(80);
  const [visible, setVisible] = useState(true);
  const [saving, setSaving] = useState(false);
  const opts = tipo === 'Blanda' ? SOFT : (CATS[cat] || []);

  const handleTipo = (v: string) => {
    setTipo(v as 'Dura' | 'Blanda');
    setCat('');
    setNombre('');
  };
  const handleCat = (v: string) => {
    setCat(v);
    setNombre('');
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!nombre) {
      alert(t('profile.alerts.select_name'));
      return;
    }
    if (tipo === 'Dura' && !cat) {
      alert(t('profile.alerts.select_category'));
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`${API}/api/habilidad`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          nombre,
          tipo: tipo === 'Dura' ? 'tecnica' : 'blanda',
          nivel: tipo === 'Dura' ? nivel : 100,
          visible,
          categoria: tipo === 'Dura' ? cat : 'Habilidades Blandas',
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || t('profile.alerts.save_error'));
      const saved = normalizeSkill(data?.habilidad ?? data);
      saved.categoria = tipo === 'Dura' ? cat : 'Habilidades Blandas';
      onSaved(saved);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalWrap>
      <div className="bg-white rounded-[28px] shadow-2xl w-full max-w-[480px] max-h-[90vh] overflow-y-auto p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-[20px] font-bold text-gray-900 uppercase tracking-tight">{t('profile.skill_modal.title')}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 transition">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSave} className="flex flex-col gap-5">
          <Sel
            label={t('profile.skill_modal.skill_type')}
            value={tipo}
            onChange={handleTipo}
            opts={[
              { value: 'Dura', label: t('profile.skill_modal.hard_skill') },
              { value: 'Blanda', label: t('profile.skill_modal.soft_skill') },
            ]}
          />
          {tipo === 'Dura' && (
            <Sel
              label={t('profile.skill_modal.category')}
              value={cat}
              onChange={handleCat}
              placeholder={t('profile.skill_modal.select_category')}
              opts={Object.keys(CATS).map((c) => ({ value: c, label: translateCategory(t, c) }))}
            />
          )}
          <Sel
            label={tipo === 'Dura' ? t('profile.skill_modal.hard_skill_name') : t('profile.skill_modal.soft_skill_name')}
            value={nombre}
            onChange={setNombre}
            placeholder={t('profile.common.select_option')}
            opts={opts.map((s) => ({ value: s, label: tipo === 'Blanda' ? translateSoftSkill(t, s) : s }))}
            disabled={tipo === 'Dura' && !cat}
          />
          {tipo === 'Dura' && (
            <div>
              <div className="flex justify-between mb-2">
                <label className={lblCls + ' mb-0'}>{t('profile.skill_modal.level')}</label>
                <span className="text-[14px] font-bold text-gray-700">{nivel}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={nivel}
                onChange={(e) => setNivel(+e.target.value)}
                className="w-full cursor-pointer accent-[#1F4E79]"
              />
            </div>
          )}
          <div className="flex items-center justify-between">
            <div>
              <p className={lblCls + ' mb-0'}>{t('profile.skill_modal.visible')}</p>
              <p className="text-[12px] text-gray-400">{t('profile.skill_modal.show_in_profile')}</p>
            </div>
            <Toggle on={visible} toggle={() => setVisible((v) => !v)} />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-[14px] bg-gray-100 text-gray-600 font-bold hover:bg-gray-200 transition"
            >
              {t('profile.common.cancel')}
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-3 rounded-[14px] bg-[#1F4E79] text-white font-bold hover:opacity-90 active:scale-95 disabled:opacity-60 transition"
            >
              {saving ? t('profile.common.saving') : t('profile.skill_modal.save')}
            </button>
          </div>
        </form>
      </div>
    </ModalWrap>
  );
}

// ── Link Modal ───────────────────────────────────────────────────────────────
function LinkModal({
  uid,
  onClose,
  onSaved,
}: {
  uid: string;
  onClose: () => void;
  onSaved: (l: LinkItem) => void;
}) {
  const { t } = useTranslation();
  const token = localStorage.getItem('token') || '';
  const [red, setRed] = useState('');
  const [username, setUsername] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!red) {
      alert(t('profile.alerts.select_platform'));
      return;
    }
    if (!username.trim()) {
      alert(t('profile.alerts.enter_username'));
      return;
    }
    setSaving(true);
    try {
      const url = `${PLATFORMS[red]}${username.trim()}`;
      const res = await fetch(`${API}/api/redes-profesionales`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          id_usuario: uid,
          nombre_red: red.toLowerCase().replace(/[\s/]+/g, ''),
          url_red: url,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || t('profile.alerts.save_error'));
      onSaved(data?.red ?? data);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalWrap>
      <div className="bg-white rounded-[28px] shadow-2xl w-full max-w-[480px] p-8 my-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-[20px] font-bold text-gray-900 uppercase tracking-tight">{t('profile.link_modal.title')}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 transition">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSave} className="flex flex-col gap-5">
          <Sel
            label={t('profile.link_modal.platform')}
            value={red}
            onChange={(v) => {
              setRed(v);
              setUsername('');
            }}
            placeholder={t('profile.common.select_option')}
            opts={Object.keys(PLATFORMS).map((p) => ({ value: p, label: p }))}
          />
          {red && (
            <div>
              <label className={lblCls}>URL</label>
              <div className="flex items-center border border-gray-300 rounded-[14px] overflow-hidden focus-within:ring-2 focus-within:ring-[#1F4E79]">
                <span className="bg-gray-100 text-gray-500 text-[13px] px-3 py-3 border-r border-gray-300 whitespace-nowrap select-none shrink-0">
                  {PLATFORMS[red]}
                </span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={t('profile.link_modal.username_placeholder')}
                  className="flex-1 px-3 py-3 text-[14px] text-gray-900 outline-none bg-transparent"
                />
              </div>
              <p className="text-[12px] text-gray-400 mt-1">{t('profile.link_modal.username_help')}</p>
            </div>
          )}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-[14px] bg-gray-100 text-gray-600 font-bold hover:bg-gray-200 transition"
            >
              {t('profile.common.cancel')}
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-3 rounded-[14px] bg-[#1F4E79] text-white font-bold hover:opacity-90 disabled:opacity-60 transition"
            >
              {saving ? t('profile.common.saving') : t('profile.link_modal.save')}
            </button>
          </div>
        </form>
      </div>
    </ModalWrap>
  );
}

// ── Custom Hook ──────────────────────────────────────────────────────────────
function useProfileData(uid: string, idPortafolio: string) {
  const token = localStorage.getItem('token') || '';
  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };

  const [skills, setSkills] = useState<Skill[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('cachedSkills') || '[]');
    } catch {
      return [];
    }
  });
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [academicas, setAcademicas] = useState<ExperienciaAcademicaItem[]>([]);
  const [loadingSkills, setLoadingSkills] = useState(skills.length === 0);
  const [loadingLinks, setLoadingLinks] = useState(true);
  const [loadingAcademicas, setLoadingAcademicas] = useState(true);

  useEffect(() => {
    (async () => {
      setLoadingSkills(true);
      try {
        const res = await fetch(`${API}/api/habilidad`, { headers });
        const data = await res.json().catch(() => null);
        const list = flattenSkills(data);
        setSkills(list);
        localStorage.setItem('cachedSkills', JSON.stringify(list));
        saveCatCache(list);
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingSkills(false);
      }
    })();

    if (!uid) {
      setLoadingLinks(false);
      return;
    }

    (async () => {
      try {
        const res = await fetch(`${API}/api/redes-profesionales/${uid}`, { headers });
        const data = await res.json().catch(() => null);
        setLinks(Array.isArray(data) ? data : data?.data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingLinks(false);
      }
    })();

    if (!idPortafolio) {
      setLoadingAcademicas(false);
      return;
    }

    (async () => {
      try {
        const res = await fetch(`${API}/api/experiencia-academica/${idPortafolio}`, { headers });
        const data = await res.json().catch(() => null);
        const list = Array.isArray(data) ? data.map(normalizeAcademica) : [];
        setAcademicas(list);
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingAcademicas(false);
      }
    })();
  }, [uid, idPortafolio]);

  const addSkill = (s: Skill) => {
    const updated = [s, ...skills];
    setSkills(updated);
    localStorage.setItem('cachedSkills', JSON.stringify(updated));
    saveCatCache(updated);
  };

  const removeSkill = async (id: string) => {
    const res = await fetch(`${API}/api/habilidad/${id}`, {
      method: 'DELETE',
      headers,
    });
    if (res.ok) {
      const updated = skills.filter((s) => s.id_habilidad !== id);
      setSkills(updated);
      localStorage.setItem('cachedSkills', JSON.stringify(updated));
      saveCatCache(updated);
    }
    return res.ok;
  };

  const addLink = (l: LinkItem) => setLinks((prev) => [l, ...prev]);
  const removeLink = async (id: string) => {
    const res = await fetch(`${API}/api/redes-profesionales/${id}`, {
      method: 'DELETE',
      headers,
    });
    if (res.ok) setLinks((prev) => prev.filter((l) => l.id_redes_prof !== id));
    return res.ok;
  };

  const addAcademica = (a: ExperienciaAcademicaItem) => {
    setAcademicas((prev) => [
      a,
      ...prev.filter((x) => x.id_experiencia_academica !== a.id_experiencia_academica),
    ]);
  };

  const removeAcademica = async (id: string) => {
    const res = await fetch(`${API}/api/experiencia-academica/${id}`, {
      method: 'DELETE',
      headers,
    });

    if (res.ok) {
      setAcademicas((prev) => prev.filter((a) => a.id_experiencia_academica !== id));
    }

    return res.ok;
  };

  return {
    skills,
    links,
    academicas,
    loadingSkills,
    loadingLinks,
    loadingAcademicas,
    addSkill,
    removeSkill,
    addLink,
    removeLink,
    addAcademica,
    removeAcademica,
  };
}

// ── Datos Personales Modal ───────────────────────────────────────────────────
function DatosPersonalesModal({
  currentPhoto,
  currentBio: _currentBio,
  onClose,
  onSave,
}: {
  currentPhoto: string | null;
  currentBio: string;
  onClose: () => void;
  onSave: (photo: string | null, bio: string) => void;
}) {
  const { t } = useTranslation();
  const [draftPhoto, setDraftPhoto] = useState<string | null>(currentPhoto);
  const [draftBio, setDraftBio] = useState('');
  const [imageOk, setImageOk] = useState(false);
  const [saving, setSaving] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePickImage = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setDraftPhoto(ev.target?.result as string);
      setImageOk(true);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleBioChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (e.target.value.length <= 500) setDraftBio(e.target.value);
  };

  const handleCancel = () => {
    setDraftPhoto(currentPhoto);
    setDraftBio('');
    setImageOk(false);
    onClose();
  };

  const handleSave = async () => {
    setSaving(true);
    const token = localStorage.getItem('token') || '';

    if (draftPhoto && draftPhoto.startsWith('data:')) {
      const blob = await fetch(draftPhoto).then((r) => r.blob());
      const formData = new FormData();
      formData.append('foto', blob, 'foto.jpg');

      const res = await fetch(`${API}/api/usuario/foto`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        onSave(data.foto_url, draftBio);
      } else {
        alert(data.message || t('profile.alerts.upload_photo_error'));
      }
    } else {
      onSave(draftPhoto, draftBio);
    }

    setSaving(false);
  };

  return (
    <ModalWrap>
      <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-[620px] p-8 my-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-[20px] font-bold text-gray-900">{t('profile.personal_modal.title')}</h2>
          <button onClick={handleCancel} className="text-gray-400 hover:text-gray-700 transition">
            <X size={20} />
          </button>
        </div>

        <div className="flex gap-8">
          <div className="flex flex-col items-start gap-3 min-w-[160px]">
            <p className="text-[13px] font-bold text-gray-700">{t('profile.personal_modal.profile_photo')}</p>

            <div className="w-[130px] h-[130px] rounded-full border-2 border-gray-200 bg-gray-50 flex flex-col items-center justify-center overflow-hidden">
              {draftPhoto ? (
                <img src={draftPhoto} alt={t('profile.personal_modal.preview_alt')} className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center gap-1 text-gray-400">
                  <Camera size={28} />
                  <span className="text-[11px]">{t('profile.personal_modal.photo')}</span>
                </div>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />

            <button
              type="button"
              onClick={handlePickImage}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-full text-[13px] font-semibold text-gray-700 bg-white hover:bg-gray-50 transition"
            >
              <Camera size={14} /> {t('profile.personal_modal.change_photo')}
            </button>
          </div>

          <div className="flex-1 flex flex-col gap-2">
            <p className="text-[13px] font-bold text-gray-700">{t('profile.personal_modal.about_me')}</p>

            <textarea
              value={draftBio}
              onChange={handleBioChange}
              placeholder={t('profile.personal_modal.bio_placeholder')}
              maxLength={500}
              rows={7}
              className="w-full px-4 py-3 bg-white text-gray-900 border border-gray-300 rounded-[14px] resize-none focus:ring-2 focus:ring-[#1F4E79] outline-none text-[14px] placeholder:text-gray-400"
            />

            <p className="text-right text-[12px] text-gray-400">{draftBio.length}/500 {t('profile.personal_modal.characters')}</p>
          </div>
        </div>

        {imageOk && (
          <div className="mt-5 flex items-center justify-between bg-green-50 border border-green-200 rounded-[12px] px-4 py-3">
            <div className="flex items-center gap-2 text-green-700 text-[13px] font-semibold">
              <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {t('profile.personal_modal.image_selected')}
            </div>
            <button onClick={() => setImageOk(false)} className="text-green-400 hover:text-green-600 transition">
              <X size={16} />
            </button>
          </div>
        )}

        <div className="flex gap-3 mt-7 justify-end">
          <button
            type="button"
            onClick={handleCancel}
            className="px-6 py-2.5 rounded-[14px] bg-gray-100 text-gray-600 font-bold hover:bg-gray-200 transition"
          >
            {t('profile.common.cancel')}
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2.5 rounded-[14px] bg-[#1F4E79] text-white font-bold hover:opacity-90 active:scale-95 disabled:opacity-60 transition"
          >
            {saving ? t('profile.common.saving') : t('profile.personal_modal.save_changes')}
          </button>
        </div>
      </div>
    </ModalWrap>
  );
}

// ── Helper components ────────────────────────────────────────────────────────
const Empty = ({ label }: { label: string }) => {
  const { t } = useTranslation();
  return (
    <div className="py-20 text-center rounded-3xl border-2 border-dashed border-gray-200 text-gray-400 font-bold uppercase tracking-widest text-sm">
      {t('profile.empty.no_added_yet', { label })}
    </div>
  );
};

const Loading = ({ label }: { label: string }) => {
  const { t } = useTranslation();
  return (
    <div className="text-center py-20 text-gray-400 font-medium">
      {t('profile.loading.label', { label })}
    </div>
  );
};

const Soon = ({ label }: { label: string }) => {
  const { t } = useTranslation();
  return (
    <div className="py-20 text-center rounded-3xl border-2 border-dashed border-gray-200 text-gray-400 font-bold uppercase tracking-widest text-sm">
      {t('profile.soon', { label })}
    </div>
  );
};

// ── Main Component ───────────────────────────────────────────────────────────
export default function PerfilUsuario() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [user, setUser] = useState<any>(() => {
    try {
      return JSON.parse(localStorage.getItem('usuario') || '{}');
    } catch {
      return {};
    }
  });

  const uid = String(user.id_usuario || user.id || '');
  const [idPortafolio, setIdPortafolio] = useState<string>(
    String(
      user.id_portafolio ||
        user.portafolio?.id_portafolio ||
        user.portafolio_id ||
        localStorage.getItem('id_portafolio') ||
        ''
    )
  );

  useEffect(() => {
    const cargarPortafolio = async () => {
      if (!uid || idPortafolio) return;

      try {
        const token = localStorage.getItem('token') || '';

        const response = await fetch(`${API}/api/usuario/perfil`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        });

        const payload = await response.json().catch(() => ({}));
        if (!response.ok) return;

        const data = payload?.data ?? payload?.usuario ?? payload?.user ?? payload;

        const nuevoId =
          data?.id_portafolio ||
          data?.portafolio?.id_portafolio ||
          data?.portafolio_id ||
          payload?.id_portafolio ||
          '';

        if (nuevoId) {
          const idStr = String(nuevoId);
          setIdPortafolio(idStr);

          const updatedUser = {
            ...user,
            id_portafolio: idStr,
          };

          setUser(updatedUser);
          localStorage.setItem('usuario', JSON.stringify(updatedUser));
          localStorage.setItem('id_portafolio', idStr);
        }
      } catch (error) {
        console.error('Error cargando portafolio:', error);
      }
    };

    cargarPortafolio();
  }, [uid, idPortafolio, user]);

  const [profilePhoto, setProfilePhoto] = useState<string | null>(user.foto || null);
  const [biography, setBiography] = useState<string>(user.biografia || '');

  const [tab, setTab] = useState<Tab>('habilidades');
  const [sortBy, setSortBy] = useState('más recientes');

  const {
    skills,
    links,
    academicas,
    loadingSkills,
    loadingLinks,
    loadingAcademicas,
    addSkill,
    removeSkill,
    addLink,
    removeLink,
    addAcademica,
    removeAcademica,
  } = useProfileData(uid, idPortafolio);

  const [showDatosModal, setShowDatosModal] = useState(false);
  const [showDatosSavedModal, setShowDatosSavedModal] = useState(false);

  const [showSkill, setShowSkill] = useState(false);
  const [showLink, setShowLink] = useState(false);
  const [skillOk, setSkillOk] = useState(false);
  const [linkOk, setLinkOk] = useState(false);
  const [delSkill, setDelSkill] = useState<string | null>(null);
  const [delLink, setDelLink] = useState<string | null>(null);
  const [delSkillOk, setDelSkillOk] = useState(false);
  const [delLinkOk, setDelLinkOk] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [showExpAcademicaModal, setShowExpAcademicaModal] = useState(false);
  const [showExpLaboralModal, setShowExpLaboralModal] = useState(false);

  const [editAcademica, setEditAcademica] = useState<ExperienciaAcademicaItem | null>(null);
  const [delAcademica, setDelAcademica] = useState<string | null>(null);
  const [delAcademicaOk, setDelAcademicaOk] = useState(false);

  const handleSaveDatos = (newPhoto: string | null, newBio: string) => {
    const updatedUser = { ...user, foto: newPhoto ?? user.foto, biografia: newBio };
    setUser(updatedUser);
    setProfilePhoto(newPhoto ?? profilePhoto);
    setBiography(newBio);
    localStorage.setItem('usuario', JSON.stringify(updatedUser));
    setShowDatosModal(false);
    setShowDatosSavedModal(true);
  };

  const grouped = skills.reduce((acc: Record<string, Skill[]>, s) => {
    const key = s.tipo === 'blanda' ? 'Habilidades Blandas' : (s.categoria || 'Habilidades Técnicas');
    return { ...acc, [key]: [...(acc[key] || []), s] };
  }, {});

  const sortedLinks = [...links].sort((a, b) => {
    const d = new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
    return sortBy === 'más recientes' ? d : -d;
  });

  const handleDelSkill = async () => {
    if (!delSkill) return;
    setDeleting(true);
    const ok = await removeSkill(delSkill);
    setDeleting(false);
    setDelSkill(null);
    if (ok) setDelSkillOk(true);
    else alert(t('profile.alerts.delete_error'));
  };

  const handleDelLink = async () => {
    if (!delLink) return;
    setDeleting(true);
    const ok = await removeLink(delLink);
    setDeleting(false);
    setDelLink(null);
    if (ok) setDelLinkOk(true);
    else alert(t('profile.alerts.delete_error'));
  };

  const handleGuardarExperienciaLaboral = async (data: {
    empresa: string;
    cargo: string;
    descripcion: string;
    fecha_ini: string;
    fecha_fin: string | null;
    archivos: File[];
  }) => {
    try {
      const token = localStorage.getItem('token') || '';

      const formData = new FormData();
      formData.append('empresa', data.empresa);
      formData.append('cargo', data.cargo);
      formData.append('descripcion', data.descripcion);
      formData.append('fecha_ini', data.fecha_ini);
      formData.append('fecha_fin', data.fecha_fin || '');
      formData.append('visible', '1');

      data.archivos?.forEach((file) => {
        formData.append('archivos[]', file);
      });

      const response = await fetch(`${API}/api/experiencia-laboral`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
        body: formData,
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result?.message || t('profile.alerts.work_experience_save_error'));
      }

      setShowExpLaboralModal(false);
    } catch (error: any) {
      console.error(error);
      alert(error.message || t('profile.alerts.work_experience_save_generic'));
    }
  };

  const handleGuardarExperienciaAcademica = async (data: {
    institucion: string;
    titulo: string;
    descripcion: string;
    fecha_ini: string;
    fecha_fin: string | null;
    archivos: File[];
  }) => {
    try {
      const token = localStorage.getItem('token') || '';
      const isEdit = !!editAcademica;

      const portafolioId = String(idPortafolio || '').trim();

      if (!isEdit && !portafolioId) {
        throw new Error(t('profile.alerts.portfolio_not_found'));
      }

      const response = await fetch(
        isEdit
          ? `${API}/api/experiencia-academica/${editAcademica!.id_experiencia_academica}`
          : `${API}/api/experiencia-academica`,
        {
          method: isEdit ? 'PUT' : 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            ...(isEdit ? {} : { id_portafolio: portafolioId }),
            institucion: data.institucion,
            titulo: data.titulo,
            descripcion: data.descripcion,
            fecha_ini: data.fecha_ini,
            fecha_fin: data.fecha_fin,
            visible: 1,
          }),
        }
      );

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          result?.message ||
            (result?.errors
              ? Object.values(result.errors).flat().join(', ')
              : t('profile.alerts.academic_experience_save_error'))
        );
      }

      const saved = normalizeAcademica(result?.data ?? result);
      addAcademica(saved);

      if (data.archivos?.length) {
        for (const file of data.archivos) {
          const formData = new FormData();
          formData.append('archivo', file);
          formData.append('id_academica', saved.id_experiencia_academica);

          const uploadResponse = await fetch(`${API}/api/proyecto/evidencias/subir`, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: 'application/json',
            },
            body: formData,
          });

          const uploadResult = await uploadResponse.json().catch(() => ({}));

          if (!uploadResponse.ok) {
            throw new Error(
              uploadResult?.message ||
                'La experiencia se guardó, pero falló la subida de un archivo.'
            );
          }
        }
      }

      setEditAcademica(null);
      setShowExpAcademicaModal(false);
    } catch (error: any) {
      console.error(error);
      alert(error.message || t('profile.alerts.academic_experience_save_generic'));
    }
  };

  const handleEliminarAcademica = async () => {
    if (!delAcademica) return;

    setDeleting(true);
    const ok = await removeAcademica(delAcademica);
    setDeleting(false);
    setDelAcademica(null);

    if (ok) setDelAcademicaOk(true);
    else alert(t('profile.alerts.delete_error'));
  };

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-180px)] bg-[#F5F5F5] font-inter">
      <aside className="hidden md:flex w-[240px] lg:w-[260px] bg-[#1D4A76] text-white flex-col items-center py-10 shadow-inner shrink-0">
        <div className="w-24 h-24 rounded-full border-2 border-white/20 bg-white/10 mb-4 flex items-center justify-center overflow-hidden">
          {profilePhoto ? (
            <img src={profilePhoto} alt={t('profile.personal_modal.profile_photo')} className="w-full h-full object-cover" />
          ) : (
            <span className="text-3xl font-bold uppercase">{user.nombre?.charAt(0) || '?'}</span>
          )}
        </div>
        <h2 className="text-[16px] font-bold text-center px-4 mb-1">{getFullName(user)}</h2>
        <p className="text-[13px] text-blue-200 font-medium mb-10 text-center px-2 opacity-80">
          {user.profesion || t('profile.defaults.profession')}
        </p>
        <div className="w-full">
          <button
            onClick={() => navigate('/')}
            className="flex items-center w-full pl-10 py-3 hover:bg-white/10 transition text-[14px] font-medium"
          >
            <Home className="w-5 h-5 mr-3" /> {t('profile.sidebar.home')}
          </button>
          <button className="flex items-center w-full pl-10 py-3 hover:bg-white/10 transition text-[14px] font-medium">
            <Settings className="w-5 h-5 mr-3" /> {t('profile.sidebar.settings')}
          </button>
        </div>
      </aside>

      <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
        <div className="mb-3">
          <h2 className="text-[20px] md:text-[24px] font-bold text-gray-900 mb-1">{getFullName(user)}</h2>
          <p className="text-gray-500 text-[13px] md:text-[14px] max-w-2xl leading-relaxed">
            {biography ||
              t('profile.defaults.biography')}
          </p>
        </div>

        <div className="flex flex-wrap gap-x-5 gap-y-2 text-[13px] text-gray-500 font-medium mb-5">
          <span className="flex items-center gap-2">
            <Mail size={14} />
            {user.email}
          </span>
          <span className="flex items-center gap-2">
            <MapPin size={14} />
            {user.ciudad || t('profile.defaults.city')}
          </span>
          <span className="flex items-center gap-2">
            <GraduationCap size={15} />
            {user.institucion || t('profile.defaults.institution')}
          </span>
        </div>

        <div className="overflow-x-auto mb-5 -mx-1 px-1">
          <div className="bg-white rounded-full px-3 py-2 flex gap-1 items-center border border-gray-100 shadow-sm w-max">
            {TABS.map((tabItem) => (
              <button
                key={tabItem.id}
                onClick={() => setTab(tabItem.id)}
                className={`text-[12px] md:text-[13px] font-bold transition whitespace-nowrap px-3 py-1.5 rounded-full ${
                  tab === tabItem.id ? 'bg-[#1F4E79] text-white' : 'text-gray-400 hover:text-gray-700'
                }`}
              >
                {t(tabItem.labelKey)}
              </button>
            ))}
          </div>
        </div>

        {(tab === 'habilidades' || tab === 'enlaces') && (
          <div className="flex justify-end gap-3 mb-5">
            <button
              onClick={() => (tab === 'habilidades' ? setShowSkill(true) : setShowLink(true))}
              className="bg-[#1F4E79] text-white px-4 py-2 rounded-full text-[13px] font-bold shadow flex items-center gap-2 hover:opacity-90 transition"
            >
              <Plus size={14} />
              {tab === 'habilidades' ? t('profile.actions.add_skill') : t('profile.actions.add_link')}
            </button>
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-white border border-gray-200 rounded-full pl-4 pr-8 py-2 text-[12px] text-gray-500 font-semibold appearance-none outline-none shadow-sm cursor-pointer"
              >
                <option value="más recientes">{t('profile.sort.newest')}</option>
                <option value="más antiguas">{t('profile.sort.oldest')}</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        )}

        {tab === 'datosPersonales' && (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <p className="text-gray-500 text-[14px]">{t('profile.personal_tab.description')}</p>
            <button
              onClick={() => setShowDatosModal(true)}
              className="flex items-center gap-2 bg-[#1F4E79] text-white px-6 py-2.5 rounded-full text-[13px] font-bold shadow hover:opacity-90 transition"
            >
              <Camera size={15} /> {t('profile.personal_tab.button')}
            </button>
          </div>
        )}

        {tab === 'academica' && (
          <div className="space-y-5">
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setEditAcademica(null);
                  setShowExpAcademicaModal(true);
                }}
                className="bg-[#1F4E79] text-white px-4 py-2 rounded-full text-[13px] font-bold shadow flex items-center gap-2 hover:opacity-90 transition"
              >
                <Plus size={14} />
                {t('profile.actions.add_academic_experience')}
              </button>
            </div>

            {loadingAcademicas ? (
              <Loading label={t('profile.labels.academic_experiences')} />
            ) : academicas.length === 0 ? (
              <Empty label={t('profile.labels.academic_experiences')} />
            ) : (
              <div className="grid grid-cols-1 gap-5">
                {academicas.map((a) => (
                  <div
                    key={a.id_experiencia_academica}
                    className="bg-white border border-gray-100 rounded-[18px] p-6 shadow-sm hover:shadow-md transition"
                  >
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 text-[#1F4E79] font-bold text-[13px] mb-2">
                          <FileText size={16} />
                          {t('profile.labels.academic_experience')}
                        </div>

                        <h3 className="text-[18px] font-bold text-gray-900 leading-tight">
                          {a.titulo}
                        </h3>

                        <p className="text-[14px] font-semibold text-gray-600 mt-1">
                          {a.institucion}
                        </p>

                        <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-[12px] font-bold text-blue-700">
                          <CalendarDays size={13} />
                          {formatAcademicRange(a.fecha_ini, a.fecha_fin, t('profile.common.current'))}
                        </div>

                        {a.descripcion && (
                          <p className="mt-4 text-[14px] text-gray-600 leading-relaxed">
                            {a.descripcion}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="mt-5 flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEditAcademica(a);
                          setShowExpAcademicaModal(true);
                        }}
                        className="px-4 py-2 rounded-full text-[13px] font-bold bg-blue-50 text-blue-700 hover:bg-blue-100 transition"
                      >
                        {t('profile.common.edit')}
                      </button>

                      <button
                        type="button"
                        onClick={() => setDelAcademica(a.id_experiencia_academica)}
                        className="px-4 py-2 rounded-full text-[13px] font-bold bg-red-50 text-red-700 hover:bg-red-100 transition"
                      >
                        {t('profile.common.delete')}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'laboral' && (
          <div className="space-y-5">
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setShowExpLaboralModal(true)}
                className="bg-[#1F4E79] text-white px-4 py-2 rounded-full text-[13px] font-bold shadow flex items-center gap-2 hover:opacity-90 transition"
              >
                <Plus size={14} />
                {t('profile.actions.add_work_experience')}
              </button>
            </div>

            <Soon label={t('profile.labels.work_experience')} />
          </div>
        )}

        {tab === 'habilidades' &&
          (loadingSkills ? (
            <Loading label={t('profile.labels.skills')} />
          ) : Object.keys(grouped).length === 0 ? (
            <Empty label={t('profile.labels.skills')} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {Object.entries(grouped).map(([cat, list]) => (
                <div key={cat} className="bg-white border border-gray-100 rounded-[16px] p-6 shadow-sm">
                  <h3 className="text-[16px] font-bold text-gray-900 mb-5">{translateCategory(t, cat)}</h3>
                  {list.map((s) => (
                    <div key={s.id_habilidad} className="mb-5 relative group">
                      <div className="flex justify-between items-center text-[14px] mb-2 pr-8">
                        <span className="font-bold text-gray-800">{s.tipo === 'blanda' ? translateSoftSkill(t, s.nombre) : s.nombre}</span>
                        {s.tipo === 'tecnica' && <span className="font-medium text-gray-500">{s.nivel}%</span>}
                        <button
                          onClick={() => setDelSkill(s.id_habilidad)}
                          className="absolute right-0 top-0 text-red-200 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      {s.tipo === 'tecnica' ? (
                        <div className="h-[10px] bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-orange-200 rounded-full transition-all duration-500"
                            style={{ width: `${s.nivel}%` }}
                          />
                        </div>
                      ) : (
                        <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-md text-xs font-semibold">{t('profile.skill_modal.soft_type_badge')}</span>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ))}

        {tab === 'enlaces' &&
          (loadingLinks ? (
            <Loading label={t('profile.labels.links')} />
          ) : sortedLinks.length === 0 ? (
            <Empty label={t('profile.labels.links')} />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {sortedLinks.map((l) => (
                <div key={l.id_redes_prof} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm group hover:border-[#1F4E79]/30 hover:shadow-md transition-all">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2 text-[#1F4E79] font-bold text-[13px]">
                      <Globe size={17} />
                      {getNetLabel(l.nombre_red)}
                    </div>
                    <button
                      onClick={() => setDelLink(l.id_redes_prof)}
                      className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                  <a
                    href={l.url_red}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-[13px] truncate block"
                  >
                    {l.url_red}
                  </a>
                </div>
              ))}
            </div>
          ))}
      </main>

      {showDatosModal && (
        <DatosPersonalesModal
          currentPhoto={profilePhoto}
          currentBio={biography}
          onClose={() => setShowDatosModal(false)}
          onSave={handleSaveDatos}
        />
      )}

      {showDatosSavedModal && (
        <SuccessModal
          title={t('profile.modals.changes_saved_title')}
          msg={t('profile.modals.changes_saved_msg')}
          onClose={() => setShowDatosSavedModal(false)}
        />
      )}

      {showSkill && (
        <SkillModal
          onClose={() => setShowSkill(false)}
          onSaved={(s) => {
            addSkill(s);
            setShowSkill(false);
            setSkillOk(true);
          }}
        />
      )}

      {showLink && (
        <LinkModal
          uid={uid}
          onClose={() => setShowLink(false)}
          onSaved={(l) => {
            addLink(l);
            setShowLink(false);
            setLinkOk(true);
          }}
        />
      )}

      {skillOk && <SuccessModal title={t('profile.modals.skill_added_title')} msg={t('profile.modals.skill_added_msg')} onClose={() => setSkillOk(false)} />}
      {linkOk && <SuccessModal title={t('profile.modals.link_added_title')} msg={t('profile.modals.link_added_msg')} onClose={() => setLinkOk(false)} />}

      {delSkill && <ConfirmModal title={t('profile.modals.delete_skill_title')} msg={t('profile.modals.delete_skill_msg')} onOk={handleDelSkill} onCancel={() => setDelSkill(null)} loading={deleting} />}
      {delLink && <ConfirmModal title={t('profile.modals.delete_link_title')} msg={t('profile.modals.delete_link_msg')} onOk={handleDelLink} onCancel={() => setDelLink(null)} loading={deleting} />}

      {delSkillOk && <DeleteSuccessModal title={t('profile.modals.skill_deleted_title')} msg={t('profile.modals.skill_deleted_msg')} onClose={() => setDelSkillOk(false)} />}
      {delLinkOk && <DeleteSuccessModal title={t('profile.modals.link_deleted_title')} msg={t('profile.modals.link_deleted_msg')} onClose={() => setDelLinkOk(false)} />}

      {showExpLaboralModal && (
        <ExperienciaLaboralModal
          abierto={showExpLaboralModal}
          onCerrar={() => setShowExpLaboralModal(false)}
          onGuardar={handleGuardarExperienciaLaboral}
        />
      )}

      {showExpAcademicaModal && (
        <ExperienciaAcademicaModal
          abierto={showExpAcademicaModal}
          onCerrar={() => {
            setShowExpAcademicaModal(false);
            setEditAcademica(null);
          }}
          onGuardar={handleGuardarExperienciaAcademica}
          initialData={
            editAcademica
              ? {
                  institucion: editAcademica.institucion,
                  titulo: editAcademica.titulo,
                  descripcion: editAcademica.descripcion,
                  fecha_ini: editAcademica.fecha_ini,
                  fecha_fin: editAcademica.fecha_fin,
                }
              : null
          }
        />
      )}

      {delAcademica && (
        <ConfirmModal
          title={t('profile.modals.delete_academic_title')}
          msg={t('profile.modals.delete_academic_msg')}
          onOk={handleEliminarAcademica}
          onCancel={() => setDelAcademica(null)}
          loading={deleting}
        />
      )}

      {delAcademicaOk && (
        <DeleteSuccessModal
          title={t('profile.modals.academic_deleted_title')}
          msg={t('profile.modals.academic_deleted_msg')}
          onClose={() => setDelAcademicaOk(false)}
        />
      )}
    </div>
  );
}
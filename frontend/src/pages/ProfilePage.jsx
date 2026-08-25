import {
  Briefcase,
  CheckCircle,
  HelpCircle,
  IndianRupee,
  Info,
  MapPin,
  Save,
  ShieldCheck,
  Sparkles,
  User,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthProvider.jsx";
import { useLanguage } from "../context/LanguageProvider.jsx";
import { listStates } from "../services/schemeService.js";

export default function ProfilePage() {
  const { t } = useLanguage();
  const { profile, updateProfile, session } = useAuth();
  const [form, setForm] = useState(profile);
  const [states, setStates] = useState([]);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    listStates()
      .then((st) => setStates(st.filter((s) => s !== "All India")))
      .catch(() => {});
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    updateProfile({
      ...form,
      age: Number(form.age) || 30,
      annualIncome: Number(form.annualIncome) || 0,
      disability: form.disability === true || form.disability === "true",
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 4000);
  };

  const handleChange = (field, val) => {
    setForm((prev) => ({ ...prev, [field]: val }));
  };

  return (
    <div className="space-y-8 max-w-3xl">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 uppercase tracking-wider mb-1">
          <User className="h-4 w-4" />
          <span>Citizen Profile Engine</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-navy-900 tracking-tight">
          {t("profileTitle")}
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          {t("profileSubtitle")}
        </p>
      </div>

      {saved && (
        <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-sm text-emerald-800 flex items-center gap-3 shadow-sm">
          <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0" />
          <p className="font-semibold">{t("savedSuccess")}</p>
        </div>
      )}

      {/* Profile Form */}
      <form onSubmit={handleSubmit} className="rounded-3xl bg-white p-6 md:p-8 border border-slate-200/80 shadow-subtle space-y-6">
        {/* Account Info */}
        <div className="pb-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Account Holder</p>
            <p className="text-base font-bold text-navy-900 mt-0.5">{session?.name || "Citizen User"}</p>
            <p className="text-xs text-slate-500">{session?.email}</p>
          </div>
          <div className="h-10 w-10 rounded-full bg-teal-50 text-teal-700 font-bold flex items-center justify-center">
            {session?.name ? session.name[0].toUpperCase() : "U"}
          </div>
        </div>

        {/* Form Fields Grid */}
        <div className="grid gap-5 sm:grid-cols-2">
          {/* Age */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
              {t("ageLabel")}
            </label>
            <input
              type="number"
              min="0"
              max="120"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 p-3.5 text-sm font-semibold text-navy-900 focus:bg-white focus:border-teal-500 focus:outline-none transition-colors"
              value={form.age}
              onChange={(e) => handleChange("age", e.target.value)}
              required
            />
          </div>

          {/* Gender */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
              {t("genderLabel")}
            </label>
            <select
              className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 p-3.5 text-sm font-semibold text-navy-900 focus:bg-white focus:border-teal-500 focus:outline-none transition-colors"
              value={form.gender}
              onChange={(e) => handleChange("gender", e.target.value)}
            >
              <option value="Female">{t("female")}</option>
              <option value="Male">{t("male")}</option>
              <option value="Other">{t("other")}</option>
            </select>
          </div>

          {/* State of Residence */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
              {t("stateLabel")}
            </label>
            <select
              className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 p-3.5 text-sm font-semibold text-navy-900 focus:bg-white focus:border-teal-500 focus:outline-none transition-colors"
              value={form.state}
              onChange={(e) => handleChange("state", e.target.value)}
            >
              {states.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          {/* Occupation */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
              {t("occupationLabel")}
            </label>
            <select
              className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 p-3.5 text-sm font-semibold text-navy-900 focus:bg-white focus:border-teal-500 focus:outline-none transition-colors"
              value={form.occupation}
              onChange={(e) => handleChange("occupation", e.target.value)}
            >
              <option value="Farmer">Farmer</option>
              <option value="Student">Student</option>
              <option value="Vendor">Street Vendor / Hawkers</option>
              <option value="Unemployed">Unemployed / Jobseeker</option>
              <option value="Self-Employed">Self-Employed / Micro-business</option>
              <option value="Labourer">Daily Wage Labourer</option>
              <option value="Salaried">Salaried Employee</option>
              <option value="Other">Other Citizen</option>
            </select>
          </div>

          {/* Annual Income */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
              {t("incomeLabel")}
            </label>
            <input
              type="number"
              min="0"
              step="10000"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 p-3.5 text-sm font-semibold text-navy-900 focus:bg-white focus:border-teal-500 focus:outline-none transition-colors"
              value={form.annualIncome}
              onChange={(e) => handleChange("annualIncome", e.target.value)}
              placeholder="e.g. 180000"
              required
            />
          </div>

          {/* Social Category */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
              {t("categoryLabel")}
            </label>
            <select
              className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 p-3.5 text-sm font-semibold text-navy-900 focus:bg-white focus:border-teal-500 focus:outline-none transition-colors"
              value={form.category}
              onChange={(e) => handleChange("category", e.target.value)}
            >
              <option value="General">General</option>
              <option value="OBC">OBC (Other Backward Classes)</option>
              <option value="SC">SC (Scheduled Caste)</option>
              <option value="ST">ST (Scheduled Tribe)</option>
              <option value="EWS">EWS (Economically Weaker Section)</option>
            </select>
          </div>

          {/* Benchmark Disability */}
          <div className="space-y-1.5 sm:col-span-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
              {t("disabilityLabel")}
            </label>
            <select
              className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 p-3.5 text-sm font-semibold text-navy-900 focus:bg-white focus:border-teal-500 focus:outline-none transition-colors"
              value={String(form.disability)}
              onChange={(e) => handleChange("disability", e.target.value === "true")}
            >
              <option value="false">{t("noDisability")}</option>
              <option value="true">{t("hasDisability")}</option>
            </select>
          </div>
        </div>

        {/* Save Action Button */}
        <button
          type="submit"
          className="rounded-2xl bg-navy-800 hover:bg-navy-900 text-white px-8 py-3.5 text-sm font-bold shadow-md transition-all flex items-center justify-center gap-2"
        >
          <Save className="h-4 w-4 text-teal-400" />
          <span>{t("save")}</span>
        </button>
      </form>

      {/* Information Banner */}
      <div className="rounded-3xl bg-slate-100/80 p-6 border border-slate-200/80 space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700">
          <Info className="h-4 w-4 text-teal-600" />
          <span>Privacy & Scheme Targeting</span>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">
          Your profile parameters are saved securely in your browser session and used purely to calculate deterministic scheme matching scores, deadlines, and notifications.
        </p>
      </div>
    </div>
  );
}

import {
  ArrowRight,
  Bot,
  Copy,
  Globe,
  HelpCircle,
  MessageSquareText,
  RefreshCw,
  Send,
  ShieldCheck,
  Sparkles,
  User,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useLanguage } from "../context/LanguageProvider.jsx";
import { chatAboutScheme, explainScheme } from "../services/aiService.js";
import { listSchemes } from "../services/schemeService.js";

const suggestedPrompts = [
  "What are the key benefits and amount provided?",
  "What documents are required to apply?",
  "What is the step-by-step application process?",
  "Who is eligible to apply for this scheme?",
];

export default function AssistantPage() {
  const { t, aiLanguage, language, setLanguage } = useLanguage();
  const [params] = useSearchParams();
  const [schemes, setSchemes] = useState([]);
  const [schemeId, setSchemeId] = useState(Number(params.get("schemeId")) || "");
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    listSchemes()
      .then((data) => {
        setSchemes(data);
        if (!schemeId && data.length > 0) {
          setSchemeId(data[0].id);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!schemeId || !schemes.length) return;
    const current = schemes.find((s) => s.id === Number(schemeId));
    if (current) {
      setMessages([
        {
          role: "assistant",
          text: `Hello! I am your SchemeSaathi AI Assistant. Ask me anything about **${current.name}** in ${aiLanguage}. My answers are strictly grounded in official criteria.`,
        },
      ]);
    }
  }, [schemeId, schemes, aiLanguage]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleExplain = async () => {
    if (!schemeId) return;
    setLoading(true);
    try {
      const data = await explainScheme({
        schemeId: Number(schemeId),
        language: aiLanguage,
      });
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: data.explanation },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: err.message || "Failed to generate explanation." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (queryText = null) => {
    const q = (queryText || question).trim();
    if (!q || !schemeId || loading) return;

    setMessages((prev) => [...prev, { role: "user", text: q }]);
    setQuestion("");
    setLoading(true);

    try {
      const data = await chatAboutScheme({
        schemeId: Number(schemeId),
        language: aiLanguage,
        question: q,
      });
      setMessages((prev) => [...prev, { role: "assistant", text: data.answer }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: err.message || "Failed to retrieve answer." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const currentScheme = schemes.find((s) => s.id === Number(schemeId));

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Title & Language Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 uppercase tracking-wider mb-1">
            <Sparkles className="h-4 w-4" />
            <span>AI Government Assistant</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-navy-900 tracking-tight">
            {t("assistant")}
          </h1>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setLanguage(language === "en" ? "te" : "en")}
            className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-subtle"
          >
            <Globe className="h-3.5 w-3.5 text-teal-600" />
            <span>Language: <strong className="text-teal-700">{aiLanguage}</strong></span>
          </button>
        </div>
      </div>

      {/* Scheme Selector & Grounded Intelligence Header */}
      <div className="rounded-3xl bg-white p-5 md:p-6 border border-slate-200/80 shadow-subtle space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex-1">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Active Scheme Context
            </label>
            <select
              className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 p-3 text-xs md:text-sm font-bold text-navy-900 focus:bg-white focus:border-teal-500 focus:outline-none transition-colors"
              value={schemeId}
              onChange={(e) => setSchemeId(Number(e.target.value))}
            >
              {schemes.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.category})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleExplain}
            disabled={!schemeId || loading}
            className="rounded-2xl bg-teal-600 hover:bg-teal-700 text-white px-5 py-3 text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 self-stretch sm:self-end disabled:opacity-50"
          >
            <Sparkles className="h-4 w-4" />
            <span>{t("explain")}</span>
          </button>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium pt-3 border-t border-slate-100">
          <ShieldCheck className="h-4 w-4 text-emerald-600 flex-shrink-0" />
          <span>{t("groundedNote")}</span>
        </div>
      </div>

      {/* Chat Messages Container */}
      <div className="rounded-3xl bg-white border border-slate-200/80 shadow-subtle overflow-hidden flex flex-col h-[520px]">
        {/* Messages Scroll Area */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          {messages.map((msg, idx) => {
            const isUser = msg.role === "user";
            return (
              <div
                key={idx}
                className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}
              >
                {!isUser && (
                  <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-teal-600 to-teal-400 text-white flex items-center justify-center flex-shrink-0 shadow-sm mt-1">
                    <Bot className="h-4 w-4" />
                  </div>
                )}

                <div
                  className={`relative group max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed ${
                    isUser
                      ? "bg-navy-800 text-white rounded-tr-none shadow-sm"
                      : "bg-slate-50 text-slate-800 border border-slate-100 rounded-tl-none"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>

                  {!isUser && (
                    <button
                      onClick={() => handleCopy(msg.text, idx)}
                      title="Copy response"
                      className="absolute top-2 right-2 p-1 rounded-md text-slate-400 hover:text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                  )}
                  {copiedIdx === idx && (
                    <span className="absolute top-2 right-8 text-[10px] text-teal-600 font-bold">Copied!</span>
                  )}
                </div>

                {isUser && (
                  <div className="h-8 w-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center flex-shrink-0 mt-1">
                    <User className="h-4 w-4" />
                  </div>
                )}
              </div>
            );
          })}

          {loading && (
            <div className="flex items-center gap-3 text-slate-400 text-xs font-medium pl-11">
              <RefreshCw className="h-4 w-4 animate-spin text-teal-600" />
              <span>{t("thinking")}</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Prompts Bar */}
        <div className="p-3 bg-slate-50/70 border-t border-slate-100 flex items-center gap-2 overflow-x-auto">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex-shrink-0">
            Prompts:
          </span>
          {suggestedPrompts.map((promptText, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(promptText)}
              disabled={loading}
              className="flex-shrink-0 rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-700 border border-slate-200 hover:border-teal-500 hover:text-teal-700 transition-colors shadow-subtle disabled:opacity-50"
            >
              {promptText}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="p-4 bg-white border-t border-slate-100 flex gap-2"
        >
          <input
            type="text"
            className="flex-1 rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:border-teal-500 focus:outline-none transition-colors"
            placeholder={t("ask")}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            disabled={loading}
          />
          <button
            type="submit"
            disabled={!question.trim() || loading}
            className="rounded-2xl bg-navy-800 hover:bg-navy-900 text-white px-5 py-3 text-sm font-bold transition-colors shadow-sm disabled:opacity-40 flex items-center gap-2"
          >
            <Send className="h-4 w-4" />
            <span className="hidden sm:inline">{t("send")}</span>
          </button>
        </form>
      </div>
    </div>
  );
}

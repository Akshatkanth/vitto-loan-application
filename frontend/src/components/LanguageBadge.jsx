const LANGUAGE_STYLES = {
  Hindi: 'bg-orange-500/15 text-orange-400 ring-1 ring-orange-500/30',
  Tamil: 'bg-blue-500/15 text-blue-400 ring-1 ring-blue-500/30',
  Telugu: 'bg-purple-500/15 text-purple-400 ring-1 ring-purple-500/30',
  Marathi: 'bg-teal-500/15 text-teal-400 ring-1 ring-teal-500/30',
  English: 'bg-slate-500/15 text-slate-400 ring-1 ring-slate-500/30',
};

export default function LanguageBadge({ language }) {
  const style = LANGUAGE_STYLES[language] ?? 'bg-slate-700 text-slate-300';
  return <span className={`badge ${style}`}>{language}</span>;
}

import { useOutputStore } from '../../store/outputStore';
import { useExecutionStore } from '../../store/executionStore';

interface Insight {
  phrase: string;
  type: 'science' | 'metaphor' | 'logic';
  headline: string;
  body?: string;
  rephrase?: string;
}

interface EngagementSummary {
  overallScore: number;
  topStrength: string;
  topWeakness: string;
}

const TYPE_COLORS: Record<string, { bg: string; text: string }> = {
  science: { bg: '#D6EEE0', text: '#0A5C2A' },
  metaphor: { bg: '#EBF4F0', text: '#1A5048' },
  logic: { bg: '#FEF8E8', text: '#6A4A10' },
};

export function ScriptAnalysisInline({ id }: { id: string }) {
  const output = useOutputStore((s) => s.outputs[id]);
  const status = useExecutionStore((s) => s.status[id] ?? 'idle');

  if (status === 'idle' || !output?.text) return null;

  let insights: Insight[] = [];
  let engagement: EngagementSummary | null = null;

  try {
    const parsed = JSON.parse(output.text.replace(/```json|```/g, '').trim());
    insights = parsed.insights ?? [];
    engagement = parsed.engagement?.summary ?? null;
  } catch {
    return <div className="mt-2 text-xs text-[var(--cg-ink-2)]" style={{ fontFamily: 'var(--font-mono)' }}>Parsing results…</div>;
  }

  return (
    <div className="mt-2 flex flex-col gap-1.5">
      {engagement && (
        <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg" style={{ background: 'var(--cg-green-tint)' }}>
          <span style={{ font: '500 18px/1 var(--font-sans)', color: 'var(--cg-green)' }}>{engagement.overallScore}</span>
          <span style={{ font: '400 11px/1 var(--font-mono)', color: 'var(--cg-ink-2)', letterSpacing: '.1em', textTransform: 'uppercase' }}>engagement</span>
        </div>
      )}
      {insights.slice(0, 4).map((ins, i) => {
        const c = TYPE_COLORS[ins.type] ?? TYPE_COLORS.logic;
        return (
          <div key={i} className="rounded-lg px-2 py-1.5" style={{ background: c.bg }}>
            <div className="flex items-center gap-1.5">
              <span style={{ font: '400 10px/1 var(--font-mono)', letterSpacing: '.08em', textTransform: 'uppercase', color: c.text }}>{ins.type}</span>
            </div>
            <div style={{ font: '500 12px/1.4 var(--font-sans)', color: 'var(--cg-ink)', marginTop: 2 }}>{ins.headline}</div>
          </div>
        );
      })}
      {insights.length > 4 && (
        <span style={{ font: '400 11px/1 var(--font-mono)', color: 'var(--cg-ink-3)' }}>+{insights.length - 4} more</span>
      )}
    </div>
  );
}

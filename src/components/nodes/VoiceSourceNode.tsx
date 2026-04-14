import { useState, useRef, useCallback, useEffect } from 'react';
import { useGraphStore } from '../../store/graphStore';
import { useOutputStore } from '../../store/outputStore';

const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

export function VoiceSourceInline({ id }: { id: string }) {
  const updateConfig = useGraphStore((s) => s.updateNodeConfig);
  const config = useGraphStore((s) => s.nodes.find((n) => n.id === id)?.data.config);
  const setOutput = useOutputStore((s) => s.setOutput);

  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState('');
  const fullTextRef = useRef((config?.text as string) ?? '');
  const recRef = useRef<any>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const tRef = useRef(0);
  const animRef = useRef(0);

  // Sync stored text
  const text = (config?.text as string) ?? '';

  // Mini orb animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const draw = () => {
      const w = canvas.width, h = canvas.height, cx = w / 2, cy = h / 2;
      ctx.fillStyle = '#F0F2F0';
      ctx.fillRect(0, 0, w, h);
      for (let i = 0; i < 3; i++) {
        const angle = tRef.current * 0.8 + i * 1.3;
        const r = 16 + Math.sin(tRef.current * 0.5 + i) * 6;
        const x = cx + Math.cos(angle) * r * 0.5;
        const y = cy + Math.sin(angle) * r * 0.4;
        const grad = ctx.createRadialGradient(x, y, 0, x, y, 24);
        const alpha = listening ? 0.6 : 0.2;
        grad.addColorStop(0, `rgba(13,191,90,${alpha})`);
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);
      }
      tRef.current += 0.02;
      animRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [listening]);

  const start = useCallback(() => {
    if (!SpeechRecognition) return;
    const rec = new SpeechRecognition();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = 'en-US';

    rec.onresult = (e: any) => {
      let interimText = '', finalText = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) finalText += t + ' ';
        else interimText = t;
      }
      if (finalText) {
        fullTextRef.current += finalText;
        updateConfig(id, { text: fullTextRef.current });
        setOutput(id, { text: fullTextRef.current });
      }
      setInterim(interimText);
    };

    rec.onend = () => { if (recRef.current) try { rec.start(); } catch {} };
    rec.onerror = () => {};

    rec.start();
    recRef.current = rec;
    setListening(true);
  }, [id, updateConfig, setOutput]);

  const stop = useCallback(() => {
    setListening(false);
    if (recRef.current) { const r = recRef.current; recRef.current = null; r.stop(); }
    setInterim('');
  }, []);

  const clear = useCallback(() => {
    stop();
    fullTextRef.current = '';
    updateConfig(id, { text: '' });
    setOutput(id, { text: '' });
  }, [id, stop, updateConfig, setOutput]);

  const wordCount = text.split(/\s+/).filter(Boolean).length;

  if (!SpeechRecognition) {
    return <div className="mt-2 text-[11px]" style={{ color: 'var(--cg-red-text)', fontFamily: 'var(--font-mono)' }}>Speech recognition not supported in this browser</div>;
  }

  return (
    <div className="mt-2 flex flex-col gap-1.5">
      {/* Mini orb + controls */}
      <div className="flex items-center gap-2">
        <canvas ref={canvasRef} width={48} height={48} className="rounded-full cursor-pointer shrink-0"
          style={{ width: 36, height: 36 }} onClick={listening ? stop : start} />
        <div className="flex-1 min-w-0">
          <button onClick={listening ? stop : start}
            className={listening ? 'btn-micro done' : 'btn-micro'}
            style={{ width: '100%', justifyContent: 'center' }}>
            {listening ? '■ Stop' : '● Record'}
          </button>
        </div>
      </div>

      {/* Transcript preview */}
      {(text || interim) && (
        <div className="text-xs leading-relaxed max-h-[120px] overflow-y-auto rounded-lg p-2"
          style={{ background: 'var(--cg-canvas)', color: 'var(--cg-ink)', border: '1px solid var(--cg-border)' }}>
          {text}
          {interim && <span style={{ color: 'var(--cg-ink-3)' }}>{interim}</span>}
        </div>
      )}

      {/* Footer */}
      {text && (
        <div className="flex items-center justify-between">
          <span style={{ font: '400 10px/1 var(--font-mono)', color: 'var(--cg-ink-3)' }}>
            {wordCount} words
          </span>
          <button className="btn-micro" onClick={clear} style={{ fontSize: 11 }}>Clear</button>
        </div>
      )}
    </div>
  );
}

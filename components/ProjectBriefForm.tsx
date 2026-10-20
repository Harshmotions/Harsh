'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '@/components/ui/Button';
import { lenisInstance } from '@/components/SmoothScroll';
import { sendBrief } from '@/app/actions/sendBrief';
import {
  SERVICES,
  FORMATS,
  VIDEO_COUNTS,
  FOOTAGE,
  BUDGETS_PER_VIDEO,
  BIG_PROJECT,
  PROJECT_BUDGETS,
  TIMELINES,
} from '@/lib/briefOptions';

interface ProjectBriefFormProps {
  whatsappNumber?: string;
  emailAddress?: string;
}

const inputClass =
  'w-full rounded-xl px-4 py-3 font-body text-[15px] text-text caret-[var(--accent)] placeholder:text-[rgba(107,122,153,0.75)] ' +
  'bg-[rgba(6,11,20,0.65)] border border-[var(--border)] transition-colors ' +
  'hover:border-[rgba(79,142,247,0.35)] focus:border-[rgba(79,142,247,0.75)] focus-visible:outline-none focus:ring-2 focus:ring-[rgba(79,142,247,0.18)]';

function Label({ htmlFor, children, optional }: { htmlFor?: string; children: React.ReactNode; optional?: boolean }) {
  return (
    <label htmlFor={htmlFor} className="block font-body text-sm text-text mb-2">
      {children}
      {optional && <span className="text-text-muted"> (optional)</span>}
    </label>
  );
}

function Chips({
  name,
  options,
  type,
}: {
  name: string;
  options: readonly string[];
  type: 'checkbox' | 'radio';
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <label
          key={opt}
          className={
            'relative inline-flex items-center rounded-full px-4 py-2 font-body text-sm transition-colors select-none ' +
            'border border-[var(--border)] text-text-muted bg-[rgba(6,11,20,0.65)] ' +
            'hover:border-[rgba(79,142,247,0.4)] hover:text-text ' +
            'has-checked:border-[rgba(79,142,247,0.8)] has-checked:text-text has-checked:bg-[rgba(79,142,247,0.14)] ' +
            'has-focus-visible:ring-2 has-focus-visible:ring-[rgba(79,142,247,0.45)]'
          }
        >
          <input type={type} name={name} value={opt} className="sr-only" />
          {opt}
        </label>
      ))}
    </div>
  );
}

// Branded listbox in place of the native <select>, whose popup can't be styled.
function Select({
  id,
  name,
  options,
  placeholder,
  onChange,
}: {
  id: string;
  name: string;
  options: readonly string[];
  placeholder: string;
  onChange?: (value: string) => void;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [value, setValue] = useState('');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [open]);

  const openList = () => {
    setActive(Math.max(0, options.indexOf(value)));
    setOpen(true);
  };

  const choose = (opt: string) => {
    setValue(opt);
    onChange?.(opt);
    setOpen(false);
    buttonRef.current?.focus();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!open) {
      if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) {
        e.preventDefault();
        openList();
      }
      return;
    }
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActive((i) => Math.min(options.length - 1, i + 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActive((i) => Math.max(0, i - 1));
        break;
      case 'Home':
        e.preventDefault();
        setActive(0);
        break;
      case 'End':
        e.preventDefault();
        setActive(options.length - 1);
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (active >= 0) choose(options[active]);
        break;
      case 'Escape':
        e.preventDefault();
        setOpen(false);
        break;
      case 'Tab':
        setOpen(false);
        break;
    }
  };

  return (
    <div ref={rootRef} className="relative">
      <input type="hidden" name={name} value={value} />
      <button
        ref={buttonRef}
        id={id}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`${id}-listbox`}
        aria-activedescendant={open && active >= 0 ? `${id}-option-${active}` : undefined}
        onClick={() => (open ? setOpen(false) : openList())}
        onKeyDown={onKeyDown}
        className={`${inputClass} flex items-center justify-between gap-3 text-left ${
          open ? 'border-[rgba(79,142,247,0.75)] ring-2 ring-[rgba(79,142,247,0.18)]' : ''
        }`}
      >
        <span className={`truncate ${value ? 'text-text' : 'text-[rgba(107,122,153,0.9)]'}`}>
          {value || placeholder}
        </span>
        <svg
          aria-hidden="true"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--accent)"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="flex-shrink-0 transition-transform duration-300"
          style={{ transform: open ? 'rotate(180deg)' : 'none' }}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            id={`${id}-listbox`}
            role="listbox"
            aria-labelledby={id}
            data-lenis-prevent
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="absolute left-0 right-0 z-30 mt-2 p-1.5 rounded-2xl max-h-72 overflow-auto origin-top"
            style={{
              background: 'linear-gradient(165deg, rgba(14,26,52,0.98) 0%, rgba(8,15,30,0.98) 100%)',
              border: '1px solid rgba(79,142,247,0.35)',
              boxShadow: '0 20px 50px rgba(0,0,0,0.6), 0 0 30px rgba(79,142,247,0.12), inset 0 1px 0 rgba(255,255,255,0.05)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
            }}
          >
            {options.map((opt, i) => {
              const selected = opt === value;
              return (
                <li
                  key={opt}
                  id={`${id}-option-${i}`}
                  role="option"
                  aria-selected={selected}
                  onPointerEnter={() => setActive(i)}
                  onClick={() => choose(opt)}
                  className="flex items-center justify-between gap-3 rounded-xl px-3.5 py-2.5 font-body text-[15px] transition-colors"
                  style={{
                    background: i === active ? 'rgba(79,142,247,0.16)' : 'transparent',
                    color: selected || i === active ? 'var(--text)' : 'rgba(240,237,232,0.72)',
                  }}
                >
                  {opt}
                  {selected && (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  )}
                </li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}

const STEPS = ['The project', 'Budget & timing', 'About you'] as const;
const LAST_STEP = STEPS.length - 1;
const ease = [0.22, 1, 0.36, 1] as const;

export default function ProjectBriefForm({ whatsappNumber, emailAddress }: ProjectBriefFormProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [pending, startTransition] = useTransition();
  const [step, setStep] = useState(0);
  const [budget, setBudget] = useState('');
  const [error, setError] = useState('');
  const [sentName, setSentName] = useState<string | null>(null);

  const whatsappHref = whatsappNumber
    ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
        sentName ? `Hi Harsh, it's ${sentName}. I just sent you a project brief.` : 'Hi Harsh, I have a project in mind.',
      )}`
    : null;

  // Keep the top of the card in view when it changes height (step switch, success state).
  const bringIntoView = () => {
    const el = containerRef.current;
    if (el && el.getBoundingClientRect().top < 80) lenisInstance?.scrollTo(el, { offset: -110, duration: 0.8 });
  };

  // Steps 1–2 use chips and custom dropdowns (hidden inputs), so they're checked by hand.
  const stepProblem = (i: number, data: FormData): [string, string?] | null => {
    if (i === 0 && data.getAll('services').length === 0) return ['Pick at least one thing you need.'];
    if (i === 1 && !data.get('budget')) return ['Choose a budget range.', 'budget'];
    if (i === 1 && data.get('budget') === BIG_PROJECT && !data.get('projectBudget'))
      return ['Choose a total project budget.', 'projectBudget'];
    return null;
  };

  const goNext = () => {
    if (!formRef.current) return;
    const problem = stepProblem(step, new FormData(formRef.current));
    if (problem) {
      setError(problem[0]);
      if (problem[1]) document.getElementById(problem[1])?.focus();
      return;
    }
    setError('');
    setStep((s) => Math.min(LAST_STEP, s + 1));
    bringIntoView();
  };

  const goBack = () => {
    setError('');
    setStep((s) => Math.max(0, s - 1));
    bringIntoView();
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (step < LAST_STEP) return goNext();
    const formData = new FormData(e.currentTarget);
    for (let i = 0; i < LAST_STEP; i++) {
      const problem = stepProblem(i, formData);
      if (problem) {
        setStep(i);
        setError(problem[0]);
        return;
      }
    }
    setError('');
    startTransition(async () => {
      const result = await sendBrief(formData);
      if (result.ok) {
        setSentName(String(formData.get('name') || '').split(' ')[0] || 'there');
        bringIntoView();
      } else {
        setError(result.error);
      }
    });
  };

  return (
    <div
      ref={containerRef}
      className="relative rounded-[28px] p-[1px]"
      style={{
        background:
          'linear-gradient(150deg, rgba(147,197,253,0.35) 0%, rgba(79,142,247,0.10) 40%, rgba(79,142,247,0.05) 70%, rgba(147,197,253,0.25) 100%)',
        boxShadow: '0 30px 80px rgba(0,0,0,0.45), 0 0 60px rgba(79,142,247,0.08)',
      }}
    >
      <div
        className="rounded-[27px] p-5 sm:p-8 md:p-10"
        style={{
          background: 'linear-gradient(165deg, #0c1730 0%, #080f1e 55%, #060B14 100%)',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05), inset 0 0 60px rgba(79,142,247,0.06)',
        }}
      >
        <AnimatePresence mode="wait" initial={false}>
          {sentName ? (
            <motion.div
              key="sent"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease }}
              className="text-center py-10 md:py-16"
              role="status"
            >
              <div
                className="mx-auto mb-6 w-14 h-14 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(79,142,247,0.12)', border: '1px solid rgba(79,142,247,0.5)' }}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              </div>
              <h3 className="font-display font-semibold text-text text-2xl md:text-3xl mb-3" style={{ letterSpacing: '-0.02em' }}>
                Brief received, {sentName}.
              </h3>
              <p className="font-body text-text-muted max-w-md mx-auto mb-8">
                I&apos;ll go through it and get back to you within a few hours.
              </p>
              {whatsappHref && (
                <a href={whatsappHref} target="_blank" rel="noopener noreferrer">
                  <Button variant="primary" type="button">Want a faster reply? WhatsApp me</Button>
                </a>
              )}
            </motion.div>
          ) : (
            <motion.form
              key="form"
              ref={formRef}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              onSubmit={onSubmit}
              style={{ colorScheme: 'dark' }}
            >
              {/* Honeypot: hidden from people, so bots that fill it get silently dropped */}
              <div aria-hidden="true" className="absolute -left-[9999px] w-px h-px overflow-hidden">
                <label htmlFor="fax">Fax</label>
                <input id="fax" name="fax" type="text" tabIndex={-1} autoComplete="off" />
              </div>

              {/* Progress */}
              <div className="mb-8">
                <div className="flex items-baseline justify-between gap-4 mb-3">
                  <p className="font-display font-semibold text-text text-lg md:text-xl" style={{ letterSpacing: '-0.01em' }}>
                    {STEPS[step]}
                  </p>
                  <p className="font-body text-[11px] uppercase tracking-[0.16em] text-text-muted whitespace-nowrap">
                    Step {step + 1} of {STEPS.length}
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-1.5" aria-hidden="true">
                  {STEPS.map((s, i) => (
                    <span
                      key={s}
                      className="h-1 rounded-full transition-all duration-500"
                      style={{
                        background: i <= step ? 'var(--accent)' : 'var(--border)',
                        boxShadow: i === step ? '0 0 10px rgba(79,142,247,0.6)' : 'none',
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Steps stay mounted (just hidden) so answers survive going back and forth */}
              <motion.div
                hidden={step !== 0}
                initial={false}
                animate={step === 0 ? { opacity: 1, x: 0 } : { opacity: 0, x: 12 }}
                transition={{ duration: 0.35, ease }}
                className="space-y-6"
              >
                <div>
                  <p className="font-body text-sm text-text mb-3">
                    What do you need? <span className="text-text-muted">Pick all that apply</span>
                  </p>
                  <Chips name="services" options={SERVICES} type="checkbox" />
                </div>
                <div>
                  <p className="font-body text-sm text-text mb-3">Format</p>
                  <Chips name="format" options={FORMATS} type="radio" />
                </div>
                <div>
                  <Label htmlFor="videoCount">How many videos?</Label>
                  {/* The note sits in the same row as the dropdown and stretches to its exact
                      height, so the two boxes line up; on phones it drops below */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-5 items-stretch">
                    <Select id="videoCount" name="videoCount" options={VIDEO_COUNTS} placeholder="Select" />
                    <p
                      className="flex items-center gap-2.5 rounded-xl px-3.5 py-2 font-body text-xs text-text-muted"
                      style={{ border: '1px solid var(--border)', background: 'rgba(79,142,247,0.05)', lineHeight: 1.35 }}
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" aria-hidden="true" className="shrink-0">
                        <circle cx="12" cy="12" r="9" />
                        <path d="M12 7v5l3 2" />
                      </svg>
                      <span>
                        <span className="text-text">One video = 30 to 50 seconds.</span> Longer edits are quoted separately.
                      </span>
                    </p>
                  </div>
                </div>
                <div>
                  <p className="font-body text-sm text-text mb-3">Footage</p>
                  <Chips name="footage" options={FOOTAGE} type="radio" />
                </div>
              </motion.div>

              <motion.div
                hidden={step !== 1}
                initial={false}
                animate={step === 1 ? { opacity: 1, x: 0 } : { opacity: 0, x: 12 }}
                transition={{ duration: 0.35, ease }}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                  <div>
                    <Label htmlFor="budget">Budget per video (USD)</Label>
                    <Select id="budget" name="budget" options={BUDGETS_PER_VIDEO} placeholder="Select a range" onChange={setBudget} />
                  </div>
                  <div>
                    <Label htmlFor="timeline">Timeline</Label>
                    <Select id="timeline" name="timeline" options={TIMELINES} placeholder="When do you need it?" />
                  </div>
                </div>
                <AnimatePresence initial={false}>
                  {budget === BIG_PROJECT && (
                    <motion.div
                      key="big"
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.3, ease }}
                    >
                      <div
                        className="mt-5 rounded-2xl p-4 sm:p-5"
                        style={{ background: 'rgba(79,142,247,0.06)', border: '1px solid rgba(79,142,247,0.25)' }}
                      >
                        <Label htmlFor="projectBudget">Total project budget (USD)</Label>
                        <Select id="projectBudget" name="projectBudget" options={PROJECT_BUDGETS} placeholder="Select a range" />
                        <p className="mt-3 font-body text-xs text-text-muted leading-relaxed">
                          For campaigns, series and retainers. Share the scope in the next step and I&apos;ll come back
                          with a proposal.
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              <motion.div
                hidden={step !== 2}
                initial={false}
                animate={step === 2 ? { opacity: 1, x: 0 } : { opacity: 0, x: 12 }}
                transition={{ duration: 0.35, ease }}
                className="space-y-5"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <input id="name" name="name" required maxLength={120} autoComplete="name" placeholder="Your name" className={inputClass} />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <input id="email" name="email" type="email" required maxLength={200} autoComplete="email" placeholder="you@brand.com" className={inputClass} />
                  </div>
                  <div>
                    <Label htmlFor="whatsapp" optional>WhatsApp</Label>
                    <input id="whatsapp" name="whatsapp" type="tel" maxLength={40} autoComplete="tel" placeholder="+1 555 000 0000" className={inputClass} />
                  </div>
                  <div>
                    <Label htmlFor="company" optional>Brand or website</Label>
                    <input id="company" name="company" maxLength={200} autoComplete="organization" placeholder="Brand name or link" className={inputClass} />
                  </div>
                </div>
                <div>
                  <Label htmlFor="details">Tell me about the project</Label>
                  <textarea
                    id="details"
                    name="details"
                    required
                    rows={4}
                    maxLength={5000}
                    placeholder="What are you promoting, who's it for, and what should the video achieve? Reference links welcome."
                    className={`${inputClass} resize-y min-h-[120px]`}
                  />
                </div>
              </motion.div>

              <AnimatePresence>
                {error && (
                  <motion.div
                    key="error"
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    role="alert"
                    className="mt-6 rounded-xl px-4 py-3 font-body text-sm"
                    style={{ background: 'rgba(255,107,43,0.08)', border: '1px solid rgba(255,107,43,0.35)', color: 'rgba(255,214,196,0.95)' }}
                  >
                    {error}
                    {error.startsWith('Something went wrong') && (
                      <span className="block mt-2">
                        {whatsappHref && (
                          <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 mr-4">
                            WhatsApp
                          </a>
                        )}
                        {emailAddress && (
                          <a href={`mailto:${emailAddress}`} className="copyable underline underline-offset-4">
                            {emailAddress}
                          </a>
                        )}
                      </span>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="mt-8 flex items-center justify-between gap-4">
                {step > 0 ? (
                  <button
                    type="button"
                    onClick={goBack}
                    className="font-body text-sm text-text-muted hover:text-text transition-colors px-1 py-2"
                  >
                    ← Back
                  </button>
                ) : (
                  <p className="font-body text-xs text-text-muted">Takes about a minute.</p>
                )}
                {step < LAST_STEP ? (
                  // type="button": a submit would trigger native validation of later, hidden steps
                  <Button variant="primary" type="button" onClick={goNext}>
                    Continue →
                  </Button>
                ) : (
                  <Button variant="cta" type="submit" disabled={pending}>
                    {pending ? 'Sending…' : 'Send brief →'}
                  </Button>
                )}
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

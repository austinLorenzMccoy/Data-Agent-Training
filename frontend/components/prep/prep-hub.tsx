'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'motion/react'
import { cn } from '@/lib/utils'
import {
  BookOpen,
  ChevronDown,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  FileText,
  MessageSquare,
  Shield,
  ListChecks,
  Target,
  GitCompare,
  Sparkles,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

// ─── Types ───────────────────────────────────────────────────────────────────

interface AccordionProps {
  title: string
  subtitle?: string
  icon?: React.ElementType
  iconColor?: string
  children: React.ReactNode
  defaultOpen?: boolean
}

function Accordion({ title, subtitle, icon: Icon, iconColor = 'text-primary', children, defaultOpen = false }: AccordionProps) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left"
      >
        <div className="flex items-center gap-3">
          {Icon && (
            <div className={cn('flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10', iconColor)}>
              <Icon className="size-4" />
            </div>
          )}
          <div>
            <p className="font-sans font-semibold leading-tight">{title}</p>
            {subtitle && <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>}
          </div>
        </div>
        <ChevronDown
          className={cn('size-4 shrink-0 text-muted-foreground transition-transform duration-200', open && 'rotate-180')}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="border-t border-border px-5 pb-5 pt-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

interface ExampleProps {
  label: string
  verdict: 'pass' | 'reject' | 'good' | 'okay' | 'bad'
  reason?: string
  children: React.ReactNode
}

function Example({ label, verdict, reason, children }: ExampleProps) {
  const styles = {
    pass: { border: 'border-success/30 bg-success/5', badge: 'bg-success/20 text-success', icon: CheckCircle2 },
    reject: { border: 'border-danger/30 bg-danger/5', badge: 'bg-danger/20 text-danger', icon: XCircle },
    good: { border: 'border-success/30 bg-success/5', badge: 'bg-success/20 text-success', icon: CheckCircle2 },
    okay: { border: 'border-xp/30 bg-xp/5', badge: 'bg-xp/20 text-xp', icon: AlertTriangle },
    bad: { border: 'border-danger/30 bg-danger/5', badge: 'bg-danger/20 text-danger', icon: XCircle },
  }
  const s = styles[verdict]
  const Icon = s.icon
  return (
    <div className={cn('rounded-lg border p-4', s.border)}>
      <div className="mb-2 flex items-center gap-2">
        <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{label}</span>
        <span className={cn('flex items-center gap-1 rounded-full px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider', s.badge)}>
          <Icon className="size-3" />
          {verdict}
        </span>
        {reason && <span className="font-mono text-[10px] text-muted-foreground">· {reason}</span>}
      </div>
      <div className="text-sm leading-relaxed text-foreground/90">{children}</div>
    </div>
  )
}

function TranscriptBlock({ text }: { text: string }) {
  return (
    <pre className="whitespace-pre-wrap rounded-md border border-border bg-background p-3 font-mono text-xs leading-relaxed text-foreground/80">
      {text}
    </pre>
  )
}

function RuleTag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-block rounded-full border border-primary/40 bg-primary/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-primary">
      {children}
    </span>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function PrepHub() {
  const [activeTab, setActiveTab] = useState<'core' | 'transcript' | 'response'>('core')

  const tabs = [
    { id: 'core' as const, label: 'Core Framework', icon: BookOpen },
    { id: 'transcript' as const, label: 'Transcript Clearance', icon: FileText },
    { id: 'response' as const, label: 'Response Selection', icon: MessageSquare },
  ]

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      {/* Header */}
      <div className="mb-8">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-primary">
          Sector 01 · Pre-Field Intelligence Briefing
        </p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight">
          Study Before You Deploy
        </h1>
        <p className="mt-3 max-w-2xl text-pretty leading-relaxed text-muted-foreground">
          Master the evaluation framework before your first assignment. This briefing covers every dimension you will be scored on — core rating criteria, transcript clearance rules, and response selection.
        </p>
      </div>

      {/* Progress pills */}
      <div className="mb-6 flex flex-wrap gap-2">
        {tabs.map((t) => {
          const Icon = t.icon
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={cn(
                'flex items-center gap-2 rounded-full border px-4 py-1.5 font-mono text-xs uppercase tracking-wider transition-colors',
                activeTab === t.id
                  ? 'border-primary bg-primary/15 text-primary'
                  : 'border-border text-muted-foreground hover:border-primary/40 hover:text-foreground',
              )}
            >
              <Icon className="size-3.5" />
              {t.label}
            </button>
          )
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.18 }}
          className="space-y-4"
        >
          {/* ─── TAB: Core Framework ─────────────────────────────────── */}
          {activeTab === 'core' && <CoreFrameworkSection />}

          {/* ─── TAB: Transcript Clearance ───────────────────────────── */}
          {activeTab === 'transcript' && <TranscriptSection />}

          {/* ─── TAB: Response Selection ─────────────────────────────── */}
          {activeTab === 'response' && <ResponseSelectionSection />}
        </motion.div>
      </AnimatePresence>

      {/* CTA */}
      <div className="mt-10 flex flex-col items-start gap-4 rounded-xl border border-border bg-card/60 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-primary" />
            <h3 className="font-semibold">Ready to drill?</h3>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Put this briefing into practice — start with no-stakes Field Training.
          </p>
        </div>
        <div className="flex gap-3">
          <Button asChild size="lg">
            <Link href="/training">
              Start Field Training
              <ArrowRight className="size-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/operation">Live Operation</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

// ─── Core Framework Section ────────────────────────────────────────────────

function CoreFrameworkSection() {
  return (
    <>
      {/* Three pillars */}
      <div className="agency-card agency-card-accent p-5">
        <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.3em] text-primary">
          The Three Evaluation Pillars
        </p>
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { icon: Shield, title: 'Truthfulness', color: 'text-success', bg: 'bg-success/10', desc: 'Is the response factually correct, accurate, and free of hallucinations or fabricated information? Even one false claim is disqualifying.' },
            { icon: Target, title: 'Instruction Following', color: 'text-primary', bg: 'bg-primary/10', desc: 'Does it fulfill all explicit and implicit constraints? Explicit = stated directly. Implicit = inferred from context. Any violation = automatic Bad.' },
            { icon: ListChecks, title: 'Helpfulness', color: 'text-xp', bg: 'bg-xp/10', desc: 'Is it well-formatted, polite, clear, concise, and genuinely useful? Covers completeness, writing quality, and fitness for the user\'s actual need.' },
          ].map(({ icon: Icon, title, color, bg, desc }) => (
            <div key={title} className="rounded-lg border border-border bg-background/50 p-4">
              <div className={cn('flex size-9 items-center justify-center rounded-md', bg, color, 'mb-3')}>
                <Icon className="size-4" />
              </div>
              <h3 className={cn('font-mono text-sm font-bold uppercase tracking-wide', color)}>{title}</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Rating scale */}
      <Accordion title="Rating Scale" subtitle="Good · Okay · Bad — know each precisely" icon={GitCompare} defaultOpen>
        <div className="space-y-3">
          {[
            { verdict: 'good' as const, label: 'GOOD', def: 'Truthful, follows all instructions (explicit & implicit), and genuinely helpful. All three pillars satisfied.', example: 'Prompt: "What is the capital of Australia?" → Response: "The capital of Australia is Canberra. While Sydney is the largest city, Canberra was purpose-built as the capital." — Correct, complete, pre-empts common confusion.' },
            { verdict: 'okay' as const, label: 'OKAY', def: 'Truthful and follows instructions, but falls short on helpfulness — e.g., vague, off-tone, or unhelpful. Not wrong, just mediocre.', example: 'Prompt: "Explain monetary policy like I\'m five." → A response that uses words like "interest rates", "central banks", "monetary policy" without simplifying is technically correct but fails the implicit instruction.' },
            { verdict: 'bad' as const, label: 'BAD', def: 'Any truthfulness OR instruction-following failure makes it automatically Bad, regardless of formatting quality.', example: 'Prompt: "List the steps as a numbered list." → Response in prose paragraphs = Bad. Prompt: "When did WWII end?" → "1944 with liberation of Paris" = Bad (factually wrong).' },
          ].map(({ verdict, label, def, example }) => (
            <Example key={label} label={label} verdict={verdict}>
              <p className="mb-2">{def}</p>
              <p className="text-xs text-muted-foreground italic">{example}</p>
            </Example>
          ))}
        </div>
      </Accordion>

      {/* Explicit vs Implicit */}
      <Accordion title="Explicit vs. Implicit Instructions" subtitle="The most common source of disputes" icon={Target}>
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
              <p className="mb-2 font-mono text-xs font-bold uppercase tracking-wider text-primary">Explicit</p>
              <p className="text-sm text-muted-foreground">Constraints stated directly in the prompt. No interpretation needed.</p>
              <ul className="mt-3 space-y-1 text-xs text-foreground/80">
                <li className="flex gap-2"><span className="text-primary">→</span> "Respond in exactly 3 bullet points"</li>
                <li className="flex gap-2"><span className="text-primary">→</span> "Keep it under 500 words"</li>
                <li className="flex gap-2"><span className="text-primary">→</span> "Use the formal register"</li>
                <li className="flex gap-2"><span className="text-primary">→</span> "Include water temperature"</li>
              </ul>
            </div>
            <div className="rounded-lg border border-xp/30 bg-xp/5 p-4">
              <p className="mb-2 font-mono text-xs font-bold uppercase tracking-wider text-xp">Implicit</p>
              <p className="text-sm text-muted-foreground">Inferred from context — what the user obviously needs even if unstated.</p>
              <ul className="mt-3 space-y-1 text-xs text-foreground/80">
                <li className="flex gap-2"><span className="text-xp">→</span> "Like I'm five" → no jargon, use analogies</li>
                <li className="flex gap-2"><span className="text-xp">→</span> Grief context → empathy required, not a listicle</li>
                <li className="flex gap-2"><span className="text-xp">→</span> Technical audience → depth expected</li>
                <li className="flex gap-2"><span className="text-xp">→</span> Customer-facing → professional tone</li>
              </ul>
            </div>
          </div>
          <Example label="Violation example" verdict="bad" reason="implicit instruction failure">
            <p className="mb-2"><strong>Prompt:</strong> A user writes: "My grandmother just passed away and I need to write her eulogy. Can you help?"</p>
            <p><strong>Response:</strong> "Sure! Here are 5 tips: 1) Keep it under 5 minutes 2) Open with a joke 3) List achievements…"</p>
            <p className="mt-2 text-xs text-muted-foreground">The response ignores the emotional context. "Open with a joke" is tone-deaf. Implicit instruction: warmth and empathy. Verdict: AMBIGUOUS (at best) or COMPROMISED.</p>
          </Example>
        </div>
      </Accordion>

      {/* Justification writing */}
      <Accordion title="Writing Good Justifications" subtitle="2–3 sentences that cite the specific flaw or strength" icon={BookOpen}>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Your justification must demonstrate your reasoning — not just state the verdict. Generic explanations that could apply to any response earn zero partial credit from the grader.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <Example label="Weak justification" verdict="bad">
              <p>"Response A followed instructions and was truthful. Response B did neither of those things."</p>
              <p className="mt-2 text-xs text-muted-foreground">No specifics. Could apply to anything. Zero grader credit.</p>
            </Example>
            <Example label="Strong justification" verdict="good">
              <p>"Response A is better because it correctly states the capital as Canberra and pre-empts the Sydney misconception. Response B incorrectly says Sydney is the capital, which is a direct truthfulness failure."</p>
              <p className="mt-2 text-xs text-muted-foreground">Names the specific fact, names the specific failure. Full grader credit.</p>
            </Example>
          </div>
          <div className="rounded-lg border border-border bg-background/50 p-4">
            <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Checklist for every justification</p>
            <ul className="space-y-1.5 text-sm">
              {[
                'Mention the specific flaw (e.g., "uses informal \'tu\' instead of \'vous\'")',
                'Cite the relevant dimension (truthfulness / instruction-following / helpfulness)',
                'Reference the exact prompt constraint violated if applicable',
                'If using external knowledge to fact-check, link the source',
                '2–3 complete sentences with proper grammar and punctuation',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-success" />
                  <span className="text-muted-foreground">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Accordion>

      {/* Worked examples from tasks */}
      <Accordion title="Worked Examples — Response Rating" subtitle="From real DataAnnotation tasks" icon={Target}>
        <div className="space-y-4">
          {[
            {
              prompt: 'Write me a review about an Italian restaurant called "Pasta World". Food was okay but too salty, waiter rude, music lovely, expensive, beautiful presentation, dessert delicious. Overall 4/10, not recommended. Make it 70 words or less.',
              a: { text: 'Pasta World boasts beautiful presentation and a delicious dessert, but that\'s where the positives end. It was overly salty! Our server was unpleasant, and the prices were steep. The lovely music couldn\'t make up for the overall disappointment. I give it a 4/10 and wouldn\'t recommend it.', verdict: 'good' as const, why: 'Covers every point accurately, under 70 words, reads as a natural review.' },
              b: { text: 'I dined at Pasta World. While the presentation was beautiful and the music lovely, the apple pie dessert was downright disgusting...', verdict: 'bad' as const, why: 'Fabricates "apple pie dessert" and directly contradicts the user by calling dessert "disgusting" — two violations at once.' },
            },
            {
              prompt: 'Give me the steps to boil an egg as a numbered list.',
              a: { text: 'First put the egg in water, then boil it, then wait, then take it out.', verdict: 'okay' as const, why: 'Ignores the explicit numbered-list format. Prose instead of list. Instruction-following failure → Bad (not Okay — format requirement missed entirely).' },
              b: { text: '1. Place the egg in a pot and cover with water.\n2. Bring to a boil.\n3. Boil for 9-12 minutes.\n4. Transfer to cold water, then peel.', verdict: 'good' as const, why: 'Follows numbered-list format, adds useful timing detail, complete and helpful.' },
            },
          ].map((ex, i) => (
            <div key={i} className="rounded-xl border border-border bg-background/30 p-4">
              <p className="mb-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Example {i + 1}</p>
              <div className="mb-3 rounded-md border border-border bg-surface/60 px-3 py-2">
                <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Prompt</p>
                <p className="mt-1 text-sm leading-relaxed">{ex.prompt}</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Example label="Response A" verdict={ex.a.verdict}>
                  <p className="mb-2 whitespace-pre-wrap">{ex.a.text}</p>
                  <p className="text-xs text-muted-foreground italic">{ex.a.why}</p>
                </Example>
                <Example label="Response B" verdict={ex.b.verdict}>
                  <p className="mb-2 whitespace-pre-wrap">{ex.b.text}</p>
                  <p className="text-xs text-muted-foreground italic">{ex.b.why}</p>
                </Example>
              </div>
            </div>
          ))}
        </div>
      </Accordion>
    </>
  )
}

// ─── Transcript Section ────────────────────────────────────────────────────

const REJECTION_REASONS = [
  {
    title: 'Spelling Mistakes',
    icon: '🔤',
    rule: 'Any spelling error = Reject. American English. Ignore punctuation and grammar — spelling only.',
    examples: [
      { text: 'Everybody has to bring thier own lunch', verdict: 'reject' as const, note: '"thier" should be "their"' },
      { text: 'My paper is dew tomorrow', verdict: 'reject' as const, note: '"dew" should be "due"' },
      { text: 'Say helllo to your parents for me', verdict: 'reject' as const, note: '"helllo" has three Ls' },
      { text: 'My paper is due tomorrow', verdict: 'pass' as const, note: 'All words spelled correctly' },
    ],
  },
  {
    title: 'Unnecessary Repetition',
    icon: '🔁',
    rule: 'Reject if a sentence repeats a word with no reason. Context matters — sometimes repetition is natural.',
    examples: [
      { text: 'When will you be going to to Iceland?', verdict: 'reject' as const, note: '"to" appears twice for no reason' },
      { text: 'Client: What caused that smell?\nMechanic: I found a a lunch bag under your front seat.', verdict: 'reject' as const, note: '"a" appears twice in a row' },
      { text: 'When I last saw it, it was heading west.', verdict: 'pass' as const, note: '"it" twice makes sense in context' },
      { text: 'I know that that is not true', verdict: 'pass' as const, note: '"that that" is grammatically natural here' },
    ],
  },
  {
    title: 'Emojis',
    icon: '😀',
    rule: 'No emojis anywhere in the transcript. Even a single emoji = Reject.',
    examples: [
      { text: 'Awesome! Thanks! 🙏', verdict: 'reject' as const, note: 'Contains an emoji' },
      { text: "I'm sorry to hear that! 😔", verdict: 'reject' as const, note: 'Contains an emoji' },
      { text: 'Awesome! Thanks!', verdict: 'pass' as const, note: 'No emojis' },
    ],
  },
  {
    title: 'Offensive Language',
    icon: '🚫',
    rule: 'Reject if it contains words considered offensive in American English — swearing, offensive slang for body parts, or insults.',
    examples: [
      { text: "User: This product is garbage.\nAssistant: Then you're an idiot for buying it. Don't waste my time, loser.", verdict: 'reject' as const, note: '"idiot" and "loser" are insulting regardless of provocation' },
    ],
  },
  {
    title: 'Includes Name of Participant',
    icon: '👤',
    rule: 'Reject if one participant directly addresses the other by their User ID or name. Mentioning a third party (not in the chat) is fine.',
    examples: [
      { text: 'Person A: Hi!\nPerson B: Hi, Person A!', verdict: 'reject' as const, note: 'Uses the other participant\'s User ID' },
      { text: 'Daisy: I\'m engaged!\nRose: Oh, Daisy, I\'m so happy for you!', verdict: 'reject' as const, note: 'Rose uses Daisy\'s name' },
      { text: 'Rose: Have you heard? Daisy is engaged!\nViolet: I\'m so happy for her!', verdict: 'pass' as const, note: 'Daisy is a third party, not in the conversation' },
    ],
  },
  {
    title: 'Incoherent / Not Human',
    icon: '🤖',
    rule: 'Reject if the conversation: (a) uses unnatural/robotic language, (b) repeats the same phrase over and over, or (c) has overlapping unrelated conversations happening at the same time.',
    examples: [
      { text: 'Nif: The opportunity to be in your company for a romantic outing would be greatly appreciated.\nZelly: Are you asking me out on a date?', verdict: 'reject' as const, note: 'Completely robotic, no human would text like this' },
      { text: 'Person A: What do you want to eat?\nPerson B: I like Italian food\nPerson A: How about Mexican?\nPerson B: I like Italian food\nPerson A: Are you sure?\nPerson B: I like Italian food.', verdict: 'reject' as const, note: 'Same phrase repeated over and over' },
      { text: "Person A: Can I pick anything up from the store?\nPerson B: Sure, some milk.\nPerson A: Bigfoot is real\nPerson B: And maybe bread?", verdict: 'reject' as const, note: 'Unexpected, unrelated topic change with no context' },
    ],
  },
  {
    title: 'Could Not Happen Over Text',
    icon: '📵',
    rule: 'Texters cannot see, hear, or touch each other. Reject if it contains stage directions, narrations, real-time physical descriptions, or references to things only visible in-person.',
    examples: [
      { text: 'Person A: See you later … [1 hour later at the cafe] Hi!', verdict: 'reject' as const, note: 'Stage direction indicating a time/scene change' },
      { text: 'Person A: Not there, more to the left.', verdict: 'reject' as const, note: 'Cannot guide placement of a physical object over text' },
      { text: 'Person A: Did you get your hair cut? It looks great!', verdict: 'reject' as const, note: 'Cannot see the other person\'s hair over text' },
      { text: 'Person A: I just got my hair cut\nPerson B: Can\'t wait to see it!', verdict: 'pass' as const, note: 'Discussing a haircut without claiming to see it' },
    ],
  },
  {
    title: 'Conversation Rhymes',
    icon: '🎵',
    rule: 'Reject if the LAST word of one message rhymes with the LAST word of the immediately following message (different words only — same word repeated is fine).',
    examples: [
      { text: "Person A: Where do you want to go today?\nPerson B: I'd like to go someplace far away.", verdict: 'reject' as const, note: '"today" and "away" rhyme' },
      { text: "July: My dog won't eat his pill.\nAugust: If you hide it in cheese he will.", verdict: 'reject' as const, note: '"pill" and "will" rhyme' },
      { text: "Jewel: Where do you want to go today?\nBijou: How about the beach?", verdict: 'pass' as const, note: '"today" and "beach" do not rhyme' },
      { text: "Jewel: Where do you want to go today?\nBijou: How about the beach?\nJewel: I hate the beach.", verdict: 'pass' as const, note: 'Same word "beach" repeated — not a rhyme' },
    ],
  },
]

function TranscriptSection() {
  return (
    <>
      {/* Overview card */}
      <div className="agency-card agency-card-accent p-5">
        <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.3em] text-primary">Assignment Type GAMMA — Transcript Clearance</p>
        <p className="text-sm leading-relaxed text-muted-foreground">
          You will receive a text-message conversation between two people. Your job is to:
        </p>
        <ol className="mt-3 space-y-1.5 text-sm">
          {[
            'Write a 1-sentence summary of the transcript (≤ 30 words)',
            'Decide: PASS (no issues) or REJECT (one or more violations)',
            'If REJECT: select all applicable rejection reasons',
          ].map((step, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/20 font-mono text-[10px] font-bold text-primary">{i + 1}</span>
              <span className="text-foreground/90">{step}</span>
            </li>
          ))}
        </ol>
      </div>

      {/* Transcript summary guide */}
      <Accordion title="How to Summarize a Transcript" subtitle="≤ 30 words · identify primary subject(s)" icon={FileText} defaultOpen>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Identify the overall topic — the primary subject discussed. If multiple topics, include as many as possible within 30 words. If the conversation covers many unrelated topics or makes no sense, note that.
          </p>
          <div className="space-y-3">
            {[
              { label: 'Example 1 (14 words)', transcript: 'Person A: I need a ride to work. Can you take me?\nMe: Sure! What time?\nPerson A: Now! It\'s my first day!', summary: 'My friend is late for their first day of work and asked me for a ride.' },
              { label: 'Example 2 (29 words)', transcript: 'Me: Do you want to go to the farmers market Saturday?\nPerson A: Sure! What time? … What are you shopping for?\nMe: I\'m looking for fennel\nPerson A: Do you have a good recipe?', summary: 'I ask my friend to go to the farmers market and what time to pick them up. They ask what I\'m looking for and if I have a recipe.' },
              { label: 'Example 3 — multi-topic (22 words)', transcript: 'Person A talks about gyms, yoga, meat shops, and driving directions — multiple overlapping topics, doesn\'t make much sense.', summary: 'Two people are talking about many topics including gyms, zumba, yoga, meat, and driving directions. The conversation does not make much sense.' },
            ].map((ex) => (
              <div key={ex.label} className="rounded-lg border border-border bg-background/40 p-4">
                <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{ex.label}</p>
                <TranscriptBlock text={ex.transcript} />
                <div className="mt-2 flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-success" />
                  <p className="text-sm text-foreground/90"><span className="font-semibold text-success">Summary:</span> {ex.summary}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Accordion>

      {/* Pass/Reject overview */}
      <Accordion title="Pass or Reject Decision" subtitle="The 8 rejection criteria — know all of them" icon={Shield}>
        <div className="grid gap-2 sm:grid-cols-2">
          {REJECTION_REASONS.map((r) => (
            <div key={r.title} className="flex items-center gap-3 rounded-lg border border-border bg-background/50 px-4 py-3">
              <span className="text-lg">{r.icon}</span>
              <p className="font-mono text-xs font-semibold uppercase tracking-wider text-foreground">{r.title}</p>
            </div>
          ))}
        </div>
        <p className="mt-4 text-sm text-muted-foreground">
          If <strong className="text-foreground">any one</strong> of these is present, Reject. Select <strong className="text-foreground">all</strong> that apply — do not stop at the first one found.
        </p>
      </Accordion>

      {/* Each rejection reason */}
      {REJECTION_REASONS.map((r) => (
        <Accordion key={r.title} title={`${r.icon} ${r.title}`} subtitle={r.rule.substring(0, 70) + '…'} icon={XCircle} iconColor="text-danger">
          <div className="space-y-4">
            <div className="rounded-lg border border-border bg-background/50 p-3">
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Rule</p>
              <p className="text-sm leading-relaxed text-foreground/90">{r.rule}</p>
            </div>
            <div className="space-y-2">
              {r.examples.map((ex, i) => (
                <Example key={i} label={`Example ${i + 1}`} verdict={ex.verdict} reason={ex.note}>
                  <TranscriptBlock text={ex.text} />
                </Example>
              ))}
            </div>
          </div>
        </Accordion>
      ))}

      {/* Full pass/reject examples */}
      <Accordion title="Full Transcript Examples" subtitle="11 complete pass/reject cases with explanations" icon={FileText}>
        <div className="space-y-4">
          {[
            {
              verdict: 'pass' as const,
              label: 'Passing — coherent support conversation',
              transcript: "Person A: Hey, I'm feeling really frustrated and upset right now.\nMe: Oh no, what happened?\nPerson A: I had a terrible day at work and everything seems to be going wrong.",
              why: 'Semantically coherent, fluid, and human-written. No one addressed by ID.',
            },
            {
              verdict: 'pass' as const,
              label: 'Passing — multi-message, multi-topic',
              transcript: "Husband: I'm at the paint store. Cloud White, Swan White, Milk White — help!\nWife: Just pick one. They're all white, right?\nHusband: That's the thing, they're not the same.\n…(conversation continues naturally about matching house tone)",
              why: 'Topics change naturally, each reply responds to the previous message.',
            },
            {
              verdict: 'reject' as const,
              label: 'Reject — Incoherent/Not Human',
              transcript: "(Multiple overlapping conversations — gym, yoga, meat shop, driving directions, all at once, neither person responding to the other's last message)",
              why: 'Both people are sending messages about different things simultaneously. Multiple overlapping conversations.',
              reason: 'Incoherent/Not Human',
            },
            {
              verdict: 'reject' as const,
              label: 'Reject — Spelling Mistake',
              transcript: "Chris: Are you finished packing?\nAlex: No, I'm stilll deciding which suitcase to take.",
              why: '"stilll" has an extra L.',
              reason: 'Spelling Mistake',
            },
            {
              verdict: 'reject' as const,
              label: 'Reject — Name of Participant + Could Not Happen Over Text',
              transcript: "PersonA: Hey Me, I have something cool to show you!\n…\nMe: I'm here! What's the surprise?\nPersonA: Close your eyes and hold out your hands!\nMe: Okay, they're closed!",
              why: 'PersonA addresses "Me" directly by name. After line 11, the scene becomes a physical narration — impossible over text.',
              reason: 'Could Not Happen Over Text + Includes Name of Participant',
            },
            {
              verdict: 'reject' as const,
              label: 'Reject — Incoherent/Not Human (robotic language)',
              transcript: "Me: Can you assist me in a worthwhile endeavor?\nPerson A: Most certainly! Can you please elaborate?\nMe: Can you create a gathering of like-minded individuals for a business-oriented caucus.\nPerson A: At what precise temporal interval should this discussion take place?",
              why: 'No human would text "business-oriented caucus" or "precise temporal interval". Completely unnatural.',
              reason: 'Incoherent/Not Human',
            },
          ].map((ex, i) => (
            <div key={i} className="rounded-xl border border-border bg-background/30 p-4">
              <Example label={ex.label} verdict={ex.verdict} reason={ex.reason}>
                <TranscriptBlock text={ex.transcript} />
                <p className="mt-2 text-xs text-muted-foreground">{ex.why}</p>
              </Example>
            </div>
          ))}
        </div>
      </Accordion>
    </>
  )
}

// ─── Response Selection Section ────────────────────────────────────────────

function ResponseSelectionSection() {
  return (
    <>
      {/* Overview */}
      <div className="agency-card agency-card-accent p-5">
        <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.3em] text-primary">Assignment Type DELTA — Response Selection</p>
        <p className="text-sm leading-relaxed text-muted-foreground">
          If the transcript passes clearance, you will see four candidate responses to the final message. Choose the single best reply.
        </p>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {[
            { label: 'Context fit', desc: 'Does the response make sense as a reply to the last message?' },
            { label: 'Tone match', desc: 'Does the tone fit the conversation? Casual text — natural and informal.' },
            { label: 'No rejection criteria', desc: 'A response with any rejection reason (emoji, spelling error, rhyming, etc.) must not be chosen.' },
            { label: 'Not a repetition', desc: 'Should not simply repeat what was already said by either person.' },
          ].map((c) => (
            <div key={c.label} className="rounded-lg border border-border bg-background/50 p-3">
              <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-primary">{c.label}</p>
              <p className="mt-1 text-xs text-muted-foreground">{c.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* How to choose */}
      <Accordion title="How to Select a Response" subtitle="Imagine yourself in the conversation" icon={MessageSquare} defaultOpen>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Imagine yourself as the participant sending the response. Ask: <em>Would I actually text this?</em> The response must:
          </p>
          <ul className="space-y-2 text-sm">
            {[
              'Reply to the LAST message sent — not an earlier one',
              'Be casual and informal (text conversation, not email)',
              'Be contextually appropriate — match what was discussed',
              'Not contain any rejection criteria (spelling, emojis, rhymes, etc.)',
              'Not repeat something already said in the conversation',
              'Not assume in-person presence (cannot make tea for someone, cannot see their face)',
            ].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <ArrowRight className="mt-0.5 size-3.5 shrink-0 text-primary" />
                <span className="text-foreground/90">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </Accordion>

      {/* Worked examples */}
      <Accordion title="Response Selection Examples" subtitle="5 annotated examples" icon={ListChecks}>
        <div className="space-y-6">
          {[
            {
              label: 'Example 1 — Reply to a question',
              lastMessage: 'Person A: That\'s great, are you coming to the meeting later today?',
              options: [
                { text: 'Am I coming to the meeting?', verdict: 'bad' as const, why: 'Repeats the question — does not answer' },
                { text: "My birthday party is next weekend!", verdict: 'bad' as const, why: 'Nothing to do with the conversation' },
                { text: "I'm good!", verdict: 'bad' as const, why: 'Repeats what was already said earlier in the chat' },
                { text: "Yes, I will be there.", verdict: 'good' as const, why: '✓ Clear, natural, directly answers the question' },
              ],
            },
            {
              label: 'Example 2 — Reply to "I need to talk to you"',
              lastMessage: 'Person A: I need to talk to you about something.',
              options: [
                { text: "Who do you think will win the game on Sunday?", verdict: 'bad' as const, why: 'Off-topic, nothing to do with conversation' },
                { text: "It's about [topic]", verdict: 'bad' as const, why: 'Makes no sense — "Me" would not know what Person A wants to say. Also has a placeholder' },
                { text: "Sure, what's on your mind?", verdict: 'good' as const, why: '✓ Natural, appropriate, invites Person A to continue' },
                { text: "Let me make you a cup of tea before we talk", verdict: 'bad' as const, why: 'Two people are in different places — cannot make tea for each other' },
              ],
            },
            {
              label: 'Example 3 — Reply has a spelling mistake',
              lastMessage: "Sylvain: I need to ask you something, but I'm a bit uncomfortable about it.",
              options: [
                { text: "Okay, I'm all ears.", verdict: 'good' as const, why: '✓ Makes sense, natural, invites them to continue' },
                { text: "I need to ask for something", verdict: 'bad' as const, why: 'Repeats what Sylvain already said, wrong perspective' },
                { text: "Let me know what you neeed", verdict: 'bad' as const, why: '"neeed" is a spelling mistake — automatic disqualifier' },
                { text: "I don't do favors", verdict: 'bad' as const, why: 'Contradicts Martinique\'s earlier agreement to help' },
              ],
            },
            {
              label: 'Example 4 — Reply has an emoji',
              lastMessage: "River: Looks like it might rain, so bring boots and a raincoat.\nRock: Will we get wet at night?",
              options: [
                { text: "The sun will keep us dry.", verdict: 'bad' as const, why: 'The sun does not shine at night' },
                { text: "No, my tent is waterproof", verdict: 'good' as const, why: '✓ Makes sense in context of camping trip' },
                { text: "Look out for bears", verdict: 'bad' as const, why: 'Not related to the question asked' },
                { text: "We won't. I've got a waterproof ⛺", verdict: 'bad' as const, why: 'Contains an emoji — disqualified even though otherwise fine' },
              ],
            },
            {
              label: 'Example 5 — Closing a conversation warmly',
              lastMessage: 'Thanks for your help, that solved my problem!',
              options: [
                { text: "No problem at all — glad it worked out! Feel free to reach out if anything else comes up.", verdict: 'good' as const, why: '✓ Warm, professional, invites further engagement' },
                { text: "Finally.", verdict: 'bad' as const, why: 'Rude and dismissive' },
                { text: "You should have figured that out yourself.", verdict: 'bad' as const, why: 'Insulting' },
                { text: "OK.", verdict: 'bad' as const, why: 'Curt, unhelpful closure' },
              ],
            },
          ].map((ex) => (
            <div key={ex.label} className="rounded-xl border border-border bg-background/30 p-4">
              <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{ex.label}</p>
              <div className="mb-3 rounded-md border border-border bg-surface/60 px-3 py-2">
                <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Final message to respond to</p>
                <p className="mt-1 text-sm leading-relaxed whitespace-pre-wrap">{ex.lastMessage}</p>
              </div>
              <div className="space-y-2">
                {ex.options.map((opt, i) => {
                  const styles = {
                    good: 'border-success/30 bg-success/5',
                    bad: 'border-danger/20 bg-danger/5',
                    okay: 'border-xp/20 bg-xp/5',
                  }
                  return (
                    <div key={i} className={cn('flex items-start gap-3 rounded-lg border p-3', styles[opt.verdict])}>
                      <span className="mt-0.5 font-mono text-xs font-bold text-muted-foreground">{String.fromCharCode(65 + i)}</span>
                      <div className="flex-1">
                        <p className="text-sm leading-relaxed">{opt.text}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{opt.why}</p>
                      </div>
                      {opt.verdict === 'good' ? (
                        <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" />
                      ) : (
                        <XCircle className="mt-0.5 size-4 shrink-0 text-danger" />
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </Accordion>

      {/* Quick reference */}
      <div className="rounded-xl border border-border bg-card p-5">
        <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.3em] text-primary">Quick Reference — Reject a Response If It…</p>
        <div className="grid gap-2 sm:grid-cols-2">
          {[
            'Contains a spelling mistake',
            'Uses an emoji',
            'Rhymes with the previous message',
            'Uses offensive language',
            'Addresses the other person by name/ID',
            'Refers to physically being with the other person',
            'Is incoherent or robotic',
            'Repeats the previous message',
            'Is about a completely different topic',
            'Assumes the two people are in the same place',
          ].map((item) => (
            <div key={item} className="flex items-center gap-2 text-sm">
              <XCircle className="size-3.5 shrink-0 text-danger" />
              <span className="text-muted-foreground">{item}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

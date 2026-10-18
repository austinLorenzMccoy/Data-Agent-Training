import Link from 'next/link'
import { ContactLine, LegalPage } from '@/components/legal-page'

export const metadata = {
  title: 'Privacy — Datanerds Annotation',
  description: 'What Datanerds Annotation collects, why, who processes it, and how to delete it.',
}

export default function PrivacyPage() {
  return (
    <LegalPage eyebrow="Privacy" title="What we keep," accent="and why.">
      <h2>Who we are</h2>
      <p>
        Datanerds Annotation is a training site for people learning to rate AI output. This page explains the
        personal data the site handles. It is written to meet the Nigeria Data Protection Act 2023 and similar
        laws. Questions go to <ContactLine />.
      </p>

      <h2>What we collect</h2>
      <ul>
        <li>
          <strong>Account:</strong> your name, email address and profile picture from Google sign-in, and the display
          name you choose.
        </li>
        <li>
          <strong>Learning record:</strong> practice and test answers, the written reasons you give, scores, XP, rank,
          badges, certificates and language-exam results.
        </li>
        <li>
          <strong>Test integrity signals:</strong> during timed tests, counts of tab switches, time away from the page,
          fullscreen exits and blocked pastes. We record counts, not screen contents or keystrokes.
        </li>
        <li>
          <strong>Billing:</strong> your plan and Paystack customer and subscription references. Card details are
          entered with Paystack and never reach us.
        </li>
        <li>
          <strong>Technical:</strong> your IP address or account ID, held for at most an hour to limit abuse, and
          anonymous page-view statistics.
        </li>
      </ul>

      <h2>Why we use it</h2>
      <ul>
        <li>To run your account, grade your work and show your progress (to provide the service you asked for).</li>
        <li>To bill paid plans (contract).</li>
        <li>To keep tests fair and stop abuse (legitimate interest).</li>
        <li>To show your display name and XP on the leaderboard, only if you opt in (consent, which you can withdraw).</li>
      </ul>

      <h2>Who processes it for us</h2>
      <ul>
        <li>Supabase: database and sign-in.</li>
        <li>Vercel: hosting and anonymous analytics.</li>
        <li>Groq: grades written reasons. Only the question and your reason are sent, not your name or email.</li>
        <li>Paystack: payments.</li>
        <li>Upstash: short-lived rate-limit counters.</li>
      </ul>
      <p>
        Some of these providers store data outside Nigeria. They are bound by contract to protect it. We do not sell
        personal data or use it for advertising.
      </p>

      <h2>What others can see</h2>
      <p>
        Nothing, unless you opt in to the leaderboard or share a certificate link. A certificate link shows your
        display name, the test, your score and the date to anyone who has it.
      </p>

      <h2>How long we keep it</h2>
      <p>
        For as long as your account exists. When you delete your account, your learning record, grades and billing
        references are removed straight away. Paystack keeps its own payment records as the law requires.
      </p>

      <h2>Your rights</h2>
      <p>
        You can see your data on your progress page, correct your display name, and delete everything from{' '}
        <Link href="/billing">Billing → Delete your account</Link>. To get a copy of your data, or to object or
        complain, contact <ContactLine />. You may also complain to the Nigeria Data Protection Commission.
      </p>

      <h2>On this device</h2>
      <p>
        The site saves your progress and preferences in your browser&apos;s local storage so it works before you sign in.
        Clearing site data removes it.
      </p>
    </LegalPage>
  )
}

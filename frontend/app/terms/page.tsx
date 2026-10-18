import Link from 'next/link'
import { ContactLine, LegalPage } from '@/components/legal-page'
import { PASS_THRESHOLD } from '@/lib/scoring'

export const metadata = {
  title: 'Terms — Datanerds Annotation',
  description: 'The terms for using Datanerds Annotation, its paid plans and its certificates.',
}

export default function TermsPage() {
  return (
    <LegalPage eyebrow="Terms of service" title="The" accent="ground rules.">
      <h2>The service</h2>
      <p>
        Datanerds Annotation is independent practice for AI rating and annotation work. It is not affiliated with,
        endorsed by, or a route into any annotation vendor or platform named in its study material. Passing a test here
        does not guarantee work anywhere.
      </p>

      <h2>Your account</h2>
      <p>
        You need a Google account to sign in. Keep it secure. You are responsible for what happens under your account.
        One account per person.
      </p>

      <h2>Fair use of tests</h2>
      <ul>
        <li>Sit tests yourself, without help from other people or tools that answer for you.</li>
        <li>Do not copy, share or publish test questions or answers.</li>
        <li>Do not automate the site, probe it for answers, or try to change your score.</li>
        <li>Do not write instructions to the grader inside your answers.</li>
      </ul>
      <p>
        Tests record integrity signals (see <Link href="/privacy">Privacy</Link>). We may mark a result unverified, void
        it, remove certificates and XP, or close an account that breaks these rules.
      </p>

      <h2>Plans and billing</h2>
      <ul>
        <li>Recruit Clearance is free. Paid plans are billed monthly in naira through Paystack.</li>
        <li>Paid plans start with a 7-day free trial. Cancel before it ends and you are not charged.</li>
        <li>You can cancel at any time from Billing. You keep paid access until the end of the period you paid for.</li>
        <li>
          Payments are not refunded for partly used periods, unless the law requires it or we fail to provide the
          service.
        </li>
        <li>We will give at least 14 days&apos; notice of a price change, which applies from your next period.</li>
      </ul>

      <h2>Certificates</h2>
      <p>
        A certificate is issued when you score at least {PASS_THRESHOLD}% on a timed test. It states your result on our
        test on that date, nothing more. Anyone with its link can check it. We revoke certificates from voided results.
      </p>

      <h2>Content</h2>
      <p>
        The questions, explanations and site design belong to us or our licensors. You may use them for your own
        study, not copy or resell them. Product names mentioned in study material belong to their owners.
      </p>

      <h2>AI grading</h2>
      <p>
        Written reasons are graded by an AI model with a fallback. Grades can be wrong. If you think one is, contact us;
        a reviewer can look at it and change it.
      </p>

      <h2>Liability</h2>
      <p>
        The service is provided as is. To the extent the law allows, we are not liable for indirect losses, lost
        earnings or lost opportunities. Our total liability is limited to what you paid us in the 3 months before the
        claim. Nothing here limits rights you have as a consumer that cannot be excluded.
      </p>

      <h2>Ending</h2>
      <p>
        You can stop using the service and <Link href="/billing">delete your account</Link> at any time. We may suspend
        or end accounts that break these terms.
      </p>

      <h2>Changes and law</h2>
      <p>
        We will post changes here and tell signed-in users of significant ones. These terms are governed by the laws of
        the Federal Republic of Nigeria. Questions go to <ContactLine />.
      </p>
    </LegalPage>
  )
}

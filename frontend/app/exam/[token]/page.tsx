import { notFound } from 'next/navigation'
import { OrgExamRunner } from '@/components/operation/org-exam-runner'
import { currentUser } from '@/lib/server/http'
import { examByToken } from '@/lib/server/orgs'
import { TYPE_NAMES } from '@/lib/scoring'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Exam — Datanerds Annotation', robots: { index: false } }

export default async function OrgExamPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const exam = await examByToken(token)
  if (!exam) notFound()
  const user = await currentUser()
  const now = new Date()
  const closed = exam.archived || (exam.closes_at !== null && now > new Date(exam.closes_at))

  return (
    <OrgExamRunner
      token={token}
      signedIn={!!user}
      closed={closed}
      exam={{
        title: exam.title,
        orgName: exam.org_name,
        trackName: TYPE_NAMES[exam.track],
        questionCount: exam.question_count,
        minutes: exam.minutes,
        maxAttempts: exam.max_attempts,
        closesAt: exam.closes_at,
      }}
    />
  )
}

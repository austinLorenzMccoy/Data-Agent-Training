import { Suspense } from 'react'
import { ProficiencyExamView } from '@/components/proficiency/proficiency-exam'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { getExam, publicExam } from '@/lib/server/proficiency'

export default async function ProficiencyPage({ params }: { params: Promise<{ examId: string }> }) {
  const { examId } = await params
  const exam = getExam(examId)

  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let alreadyPassed = false
  if (user && exam) {
    const { data } = await supabase
      .from('proficiency_results' as never)
      .select('passed')
      .eq('agent_id', user.id)
      .eq('exam_id', exam.id)
      .maybeSingle()
    alreadyPassed = (data as unknown as { passed: boolean } | null)?.passed === true
  }

  return (
    <Suspense>
      <ProficiencyExamView exam={exam ? publicExam(exam) : null} alreadyPassed={alreadyPassed} signedIn={!!user} />
    </Suspense>
  )
}

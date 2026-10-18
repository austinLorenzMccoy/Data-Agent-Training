'use client'

import { OperationController, type OrgExamIntro } from './operation-controller'

export function OrgExamRunner({
  token,
  signedIn,
  closed,
  exam,
}: {
  token: string
  signedIn: boolean
  closed: boolean
  exam: Omit<OrgExamIntro, 'token' | 'signedIn' | 'closed'>
}) {
  return <OperationController orgExam={{ ...exam, token, signedIn, closed }} />
}

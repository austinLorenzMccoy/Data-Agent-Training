import type { Lesson } from './types'

// Tutorial: how a timed test works on this site. Facts here mirror
// lib/server/attempts.ts (12 questions, server deadline, one active test,
// quota counted at start) and lib/exam/score.ts (reasons count only when
// the pick earns points).

export const TIMED_TEST_TUTORIAL: Lesson = {
  id: 'how-a-timed-test-works',
  kind: 'tutorial',
  track: 'delta',
  title: 'How a timed test works',
  summary: 'Starting, sitting and reading the result of a timed test, in three short chapters.',
  next: { href: '/operation', label: 'Go to timed tests' },
  chapters: [
    {
      id: 'starting',
      title: 'Starting a test',
      scenes: [
        {
          id: 'intro',
          say: 'A timed test checks one task type at a time, with no answers shown until the end. Here is how it works.',
          visual: { kind: 'title', eyebrow: 'Tutorial', title: 'How a timed test', accent: 'works.' },
        },
        {
          id: 'before',
          say: "Pick one task type on the test page. You need to finish that type's practice first. A test is twelve questions with a fixed time limit, usually thirty minutes, and it runs in fullscreen.",
          visual: {
            kind: 'list',
            title: 'Before you start',
            numbered: true,
            items: ['Pick one task type', 'Finish its practice first', '12 questions, a fixed time limit', 'It runs in fullscreen'],
          },
        },
        {
          id: 'quota',
          say: 'Starting a test uses one from your monthly allowance, even if you leave before the end. So start when you have the time to finish.',
          visual: { kind: 'rule', icon: '⏱', title: 'Starting counts', body: 'Each test you start uses one from your monthly allowance.' },
        },
      ],
      check: {
        question: 'You start a test, answer two questions, and close the tab. What happens?',
        options: [
          "Nothing. It doesn't count until you finish",
          'It used one test from your allowance, and the clock keeps running',
          'You get a fresh test with new questions next time',
          'Your answers are deleted',
        ],
        answer: 1,
        why: 'Starting uses the allowance, and the deadline is kept on the server, so closing the tab does not pause it.',
      },
    },
    {
      id: 'during',
      title: 'During the test',
      scenes: [
        {
          id: 'clock',
          say: "The clock belongs to the server. Closing the page does not pause it. If you come back in time, you continue where you left off, with the same questions. When time runs out, what you answered is scored.",
          visual: { kind: 'rule', icon: '◷', title: 'The clock keeps running', body: 'Come back in time and you continue with the same questions.' },
        },
        {
          id: 'answers',
          say: 'Each answer is saved when you submit it, and it cannot be changed. You will not see whether it was right until the end.',
          visual: {
            kind: 'compare',
            left: { text: 'Submit → saved, next question', flag: false, label: 'How it works' },
            right: { text: 'Go back and change an answer', flag: true, label: 'Not possible' },
          },
        },
        {
          id: 'integrity',
          say: 'Leaving the test window, switching tabs, or pasting text is recorded. A few slips are fine. Too many, and your result is marked unverified.',
          visual: {
            kind: 'list',
            title: 'Recorded during the test',
            items: ['Leaving the window or switching tabs', 'Leaving fullscreen', 'Pasting or dropping text'],
          },
        },
      ],
      check: {
        question: 'Halfway through, you realise question 3 was wrong. What can you do?',
        options: ['Go back and change it', 'Restart the test', 'Nothing. Answers are final once submitted', 'Ask for it to be removed'],
        answer: 2,
        why: 'Answers are saved when you submit them and cannot be changed, so read each one carefully before you submit.',
      },
    },
    {
      id: 'result',
      title: 'Your result',
      scenes: [
        {
          id: 'score',
          say: 'Your score is the points you earned out of the points available. The pass mark is seventy percent. Questions you did not reach score zero.',
          visual: { kind: 'title', eyebrow: 'Pass mark', title: '70%', accent: 'to pass.' },
        },
        {
          id: 'reasons',
          say: 'Where a question asks for a written reason, the reason earns points only when your choice was right. A good argument for the wrong call scores nothing.',
          visual: { kind: 'rule', icon: '✎', title: 'Reasons follow the choice', body: 'A reason earns points only when the pick earned points.' },
        },
        {
          id: 'after',
          say: 'At the end you see every question with its explanation. Pass, and you get a certificate with a code anyone can check.',
          visual: {
            kind: 'list',
            title: 'After the test',
            items: ['A review of every question, with explanations', 'Pass: a certificate with a public check code', 'XP toward your rank'],
          },
        },
      ],
      check: {
        question: 'You pick the wrong response but write an excellent reason. What does the reason earn?',
        options: ['Full marks', 'Half marks', 'Nothing', 'It depends on length'],
        answer: 2,
        why: 'Reasons only count when the choice itself earned points.',
      },
    },
  ],
}

import type { Lesson } from './types'

// Pilot lesson for the "Review a transcript" track. Examples are written for
// the lesson and deliberately differ from the question bank, so watching it
// teaches the rules without handing out test answers.

export const REVIEW_A_TRANSCRIPT: Lesson = {
  id: 'review-a-transcript',
  track: 'gamma',
  title: 'Review a transcript',
  summary: 'Pass a text conversation, or flag every reason it cannot be used. Eight reasons, five short chapters.',
  chapters: [
    {
      id: 'the-job',
      title: 'The job',
      scenes: [
        {
          id: 'intro',
          say: 'In this task you read a short text conversation between two people, and decide whether it can be used. Your choice is simple. Pass it, or flag it.',
          visual: { kind: 'title', eyebrow: 'Lesson', title: 'Review a', accent: 'transcript.' },
        },
        {
          id: 'two-outcomes',
          say: 'If nothing is wrong, pass it. If anything is wrong, flag it, and tick every reason that applies. A flag with a reason missing is still marked wrong.',
          visual: {
            kind: 'list',
            title: 'Two outcomes',
            items: ['Nothing wrong → Pass', 'Anything wrong → Flag, and tick every reason'],
          },
        },
        {
          id: 'eight-reasons',
          say: "There are eight reasons to flag a transcript. We'll take them a few at a time. By the end, you'll know exactly what each one looks like.",
          visual: {
            kind: 'list',
            title: 'The eight reasons',
            numbered: true,
            items: [
              'Spelling errors',
              'Unnecessary repetition',
              'Emoji',
              'Offensive language',
              "A participant's name",
              'Robotic or incoherent',
              'Rhyming',
              'Could not happen over text',
            ],
          },
        },
      ],
      check: {
        question: 'A transcript has an emoji and a spelling mistake. You flag it for the emoji only. How is that marked?',
        options: ['Correct: one reason is enough', 'Wrong: every reason must be ticked', 'Half marks', 'Correct, if the emoji comes first'],
        answer: 1,
        why: 'A flag must list every reason that applies. Missing one makes the whole answer wrong.',
      },
    },
    {
      id: 'spelling-and-repetition',
      title: 'Spelling and repetition',
      scenes: [
        {
          id: 'spelling-rule',
          say: 'Spelling is checked in American English. One misspelled word is enough to flag. Punctuation, capital letters and grammar are not judged. Only spelling.',
          visual: {
            kind: 'rule',
            icon: 'Aa',
            title: 'Spelling',
            body: 'American English. One wrong word flags it. Punctuation, capitals and grammar are not judged.',
          },
        },
        {
          id: 'spelling-example',
          say: "Here, the word tomorrow is missing an r. That alone flags the transcript. Notice the message starts with a small letter. That's fine. Only the spelling counts.",
          visual: {
            kind: 'chat',
            lines: [
              { who: 'Femi', text: 'are we still meeting at the library?' },
              { who: 'Zara', text: 'yes, see you tomorow at four', mark: 'tomorow' },
            ],
            verdict: { flag: true, label: 'Spelling' },
          },
        },
        {
          id: 'repetition-rule',
          say: 'Repetition means a word repeated for no reason, the kind of slip you make typing fast.',
          visual: { kind: 'rule', icon: '↻', title: 'Unnecessary repetition', body: 'A word doubled by mistake. Natural repetition is fine.' },
        },
        {
          id: 'repetition-compare',
          say: "Compare these two. 'The the' is a slip, so flag it. 'That that' is real grammar: the first that joins the sentence, the second points at the rumor. Read it aloud. If it makes sense, it passes.",
          visual: {
            kind: 'compare',
            left: { text: 'Can you send me the the address?', flag: true, label: 'Flag' },
            right: { text: 'I heard that that rumor was false.', flag: false, label: 'Pass' },
          },
        },
      ],
      check: {
        question: 'Which line should be flagged?',
        options: ['I know that that is true', 'Meet me at the the gate', "I'm running late, start without me", 'ok see you at 5'],
        answer: 1,
        why: '"the the" is a slip. "that that" is grammatical, and lower-case or short messages are not spelling problems.',
      },
    },
    {
      id: 'emoji-offensive-names',
      title: 'Emoji, offensive words and names',
      scenes: [
        {
          id: 'emoji-rule',
          say: 'Any emoji, anywhere in the conversation, flags it. Even one. Even a small smiley at the very end.',
          visual: { kind: 'rule', icon: '☺', title: 'Emoji', body: 'One emoji anywhere is enough to flag.' },
        },
        {
          id: 'offensive-rule',
          say: "Swearing, slurs and insults are flagged. That includes insults aimed at someone who isn't in the chat, like calling a referee an idiot.",
          visual: { kind: 'rule', icon: '!', title: 'Offensive language', body: 'Swearing, slurs and insults, whoever they are aimed at.' },
        },
        {
          id: 'names-compare',
          say: "Names are about who is in the conversation. If one participant calls the other by name, flag it. Mentioning someone who isn't in the chat is fine.",
          visual: {
            kind: 'compare',
            left: { text: 'Amaka (to Halima): Well done, Halima!', flag: true, label: 'Flag: participant named' },
            right: { text: 'Amaka (to Halima): Did Seun get the job?', flag: false, label: 'Pass: Seun is not in the chat' },
          },
        },
      ],
      check: {
        question: 'Chidi and Obi are texting. Chidi writes: "Tell Amara I said hi." Should it be flagged?',
        options: ['Yes, it contains a name', 'No, Amara is not in the conversation', 'Yes, names are never allowed', 'Only if Amara replies'],
        answer: 1,
        why: 'Only the names of the two people texting count. Amara is someone else, so this passes.',
      },
    },
    {
      id: 'robotic-rhyme-real-world',
      title: 'Robotic, rhyming and the real world',
      scenes: [
        {
          id: 'robotic-example',
          say: 'Robotic or incoherent means language no one would text, the same phrase said over and over, or a sudden jump to an unrelated topic. Nobody texts a friend like the second line here.',
          visual: {
            kind: 'chat',
            lines: [
              { who: 'Kola', text: 'are you free for a quick call?' },
              { who: 'Dayo', text: 'I hereby confirm my availability for a telephonic discussion.', mark: 'I hereby confirm my availability for a telephonic discussion.' },
            ],
            verdict: { flag: true, label: 'Robotic' },
          },
        },
        {
          id: 'rhyme-rule',
          say: 'Rhyming means lines with a set rhythm and rhyme, like a short poem. People do not text in verse.',
          visual: { kind: 'rule', icon: '♪', title: 'Rhyming', body: 'A rhythm-and-rhyme line, like a poem, flags it.' },
        },
        {
          id: 'physical-example',
          say: "Texters can't see, hear or touch each other. Stage directions in brackets, or anything you would need to be there in person for, means it could not happen over text.",
          visual: {
            kind: 'chat',
            lines: [
              { who: 'Tobi', text: "I'm outside the station" },
              { who: 'Ife', text: '[waves from across the road] over here!', mark: '[waves from across the road]' },
            ],
            verdict: { flag: true, label: 'Could not happen over text' },
          },
        },
        {
          id: 'physical-compare',
          say: 'Talking about something is fine. Claiming to see it is not.',
          visual: {
            kind: 'compare',
            left: { text: 'Your new haircut looks great!', flag: true, label: 'Flag: can’t see it' },
            right: { text: 'Send me a photo of the new haircut', flag: false, label: 'Pass' },
          },
        },
      ],
      check: {
        question: 'Which line could really happen over text?',
        options: ['Pass me the salt', "[laughs] that's hilarious", 'Your new glasses look great on you', 'Send me a picture of your new glasses'],
        answer: 3,
        why: 'Asking for a photo works by text. The others need you in the room, or are stage directions.',
      },
    },
    {
      id: 'putting-it-together',
      title: 'Putting it together',
      scenes: [
        {
          id: 'routine',
          say: "Here's a routine that catches everything. Read once for meaning. Read again for spelling and repeats. Scan for emoji and names. Ask whether it could happen by text, and whether a person would write it. Then flag every reason, or pass.",
          visual: {
            kind: 'list',
            title: 'Your routine',
            numbered: true,
            items: [
              'Read once for meaning',
              'Read again for spelling and repeats',
              'Scan for emoji and names',
              'Could it happen by text? Would a person write it?',
              'Flag every reason, or pass',
            ],
          },
        },
        {
          id: 'multi-flag',
          say: 'This one has two problems: an emoji, and wonderful spelled with two l’s. Flag both.',
          visual: {
            kind: 'chat',
            lines: [
              { who: 'Ada', text: 'happy new year!! 🎆', mark: '🎆' },
              { who: 'Ifeoma', text: 'thanks, wishing you a wonderfull year', mark: 'wonderfull' },
            ],
            verdict: { flag: true, label: 'Emoji + Spelling' },
          },
        },
        {
          id: 'ready',
          say: "That's the whole rulebook. Now practice it: you'll see why each answer is right or wrong as you go.",
          visual: { kind: 'title', eyebrow: 'Done', title: "You're ready to", accent: 'practice.' },
        },
      ],
      check: {
        question: 'Bisi and Kola are texting. "Bisi: hey Kola 👋" / "Kola: hey, hows it going". Which reasons apply?',
        options: ['Emoji only', "Emoji and a participant's name", 'Name only', 'Pass: nothing is wrong'],
        answer: 1,
        why: 'Bisi uses an emoji and calls Kola by name. "hows" is missing an apostrophe, which is punctuation, not spelling.',
      },
    },
  ],
}

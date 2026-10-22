import type { AssignmentType } from './types'
import type { GuidelinePackId } from './guidelines'

// Premium guides to the screening assessments on the platforms our tracks
// prepare for. They explain each section and how it is graded, with our own
// worked examples. They never reproduce a platform's real questions or
// answers: those tests check your own judgment, and copied answers are
// easy for reviewers to spot and get accounts closed.

export interface PlatformSection {
  title: string
  format: string
  graded: string
  approach: string[]
  failures: string[]
  example?: { prompt: string; weak: string; strong: string }
}

export interface PlatformGuide {
  id: string
  name: string
  accent: string
  blurb: string
  passBar: string
  sections: PlatformSection[]
  guidelines: GuidelinePackId[]
  practice: AssignmentType[]
}

export const PLATFORMS: PlatformGuide[] = [
  {
    id: 'dataannotation',
    name: 'DataAnnotation',
    accent: 'starter assessment.',
    blurb:
      'One sitting of short research questions, response comparisons with written reasons, and a prompt plus rubrics you write yourself. There is no score shown — you hear back only if you pass.',
    passBar: 'Not published. Written reasons weigh most; one careless fact or a thin reason can sink the whole attempt.',
    sections: [
      {
        title: 'Quick research and fact checks',
        format: 'A question with one exact answer (a price, a date, a name), or two responses where you pick the accurate one.',
        graded: 'Exactness. A close answer is a wrong answer.',
        approach: [
          'Find a primary source (the exchange, the publisher, the official record) and check the exact date, unit and rounding the question asks for.',
          'For a two-response check, verify every claim in both responses, not just the headline one. The worse response often hides a second wrong fact.',
          'If a response adds things nobody asked for, note it — it counts against the response even when the extra fact is true.',
        ],
        failures: ['Taking the first search snippet', 'Checking only one of the two responses', 'Wrong day or wrong price type (open vs close)'],
      },
      {
        title: 'Written justifications',
        format: 'After each choice, 2–5 sentences explaining it.',
        graded: 'Whether a reviewer can check your reason against the responses: specific, accurate, and tied to what the prompt asked.',
        approach: [
          'Sentence one: your verdict. Sentence two onward: the concrete evidence, quoting or naming the exact part of each response.',
          'Name the prompt’s requirement each response met or missed.',
          'Write it yourself. Reviewers compare reasons across applicants, and stock wording is flagged.',
        ],
        failures: ['“A is better because it is more helpful”', 'Reasons that describe only the winner', 'Pasted or AI-written text'],
        example: {
          prompt: 'Which reply better answers “Give me a haiku about rain”?',
          weak: 'Response A is better because it is a good haiku and is more creative.',
          strong:
            'Response A is better. It keeps the 5-7-5 pattern (“Soft rain on tin roofs…”) and stays on rain throughout. Response B has eight syllables in its first line and ends with a line about sunshine, so it misses both the form and the topic the user asked for.',
        },
      },
      {
        title: 'Format and tone',
        format: 'A creative prompt with a form and a mood (a sonnet, a limerick, a formal letter) and two attempts.',
        graded: 'Did you check the form’s rules and the tone the user asked for, in that order?',
        approach: [
          'List the form’s hard rules first (line count, rhyme scheme, meter) and count them in each response.',
          'Then judge tone: does it land the mix the prompt described?',
          'A response that nails the tone but ignores the form usually loses.',
        ],
        failures: ['Judging on charm alone', 'Not counting lines or rhymes'],
      },
      {
        title: 'Rubric questions',
        format: 'A chatbot reply and yes/no rubric lines to score it against.',
        graded: 'Reading each rubric line literally and scoring only what it asks.',
        approach: [
          'Score each line on its own. A reply can be excellent overall and still fail one line.',
          'Look for the exact thing the line names (a greeting, an excluded ingredient) before deciding.',
        ],
        failures: ['Letting the overall quality bleed into a single line', 'Missing a forbidden item buried in a list'],
      },
      {
        title: 'Write a hard prompt and its rubrics',
        format: 'Write a multi-paragraph prompt with several clear requirements, then rubric lines to grade a reply to it.',
        graded: 'Whether each requirement is checkable, and whether each rubric line tests one thing with a clear yes/no.',
        approach: [
          'Give the prompt a real user, a goal, and three or more requirements that can each be verified.',
          'One rubric line per requirement. Write it so two graders would agree.',
          'Avoid words like “good”, “appropriate” or “detailed” in a rubric line — say what you will check.',
        ],
        failures: ['Vague requirements', 'Rubric lines that test two things at once', 'A prompt too easy for a chatbot to get wrong'],
      },
    ],
    guidelines: ['dataannotation'],
    practice: ['alpha', 'beta', 'delta', 'kappa'],
  },
  {
    id: 'handshake',
    name: 'Handshake AI',
    accent: 'project assessments.',
    blurb:
      'Each project (media comparison, rubric writing, annotation review) opens with its own onboarding course and a short assessment. Pass one and that project’s tasks unlock.',
    passBar: 'Set per project and shown at the start. Some allow one retake; many do not.',
    sections: [
      {
        title: 'Comparing two AI clips or images',
        format: 'Two generated outputs for one prompt, rated on a single axis at a time (identity, instruction following, artifacts, motion, audio, naturalness), then an overall pick.',
        graded: 'Rating only the axis asked, and noticing the defect that decides it.',
        approach: [
          'Read the axis definition before looking at the outputs. Rate that axis and nothing else.',
          'Watch at full size and scrub frame by frame for warping hands, flicker and objects that pop in or out.',
          'Your overall pick weighs the axes that matter for this prompt — it is not an average.',
        ],
        failures: ['Letting a pretty clip win an axis it fails', 'Missing a one-second artifact', 'Overall pick that contradicts your axis ratings with no reason'],
      },
      {
        title: 'Rubric writing',
        format: 'Write criteria a grader could use to score replies to a prompt.',
        graded: 'Each criterion is atomic, objective and tied to the prompt.',
        approach: [
          'One fact or behaviour per criterion.',
          'Phrase it so it is true or false for any reply — no “mostly” or “well”.',
          'Cover what the prompt explicitly demands before anything nice-to-have.',
        ],
        failures: ['Bundled criteria', 'Criteria that restate the prompt', 'Subjective wording'],
        example: {
          prompt: 'Prompt: “Plan a 3-day vegetarian trip to Lisbon under €400.” Write one criterion.',
          weak: 'The plan is good and fits the budget and diet.',
          strong: 'The listed costs for all three days add up to €400 or less.',
        },
      },
      {
        title: 'Annotation review calls',
        format: 'Someone else’s labels on a task; you accept, fix, or send back for rework.',
        graded: 'Matching the project’s rules exactly, including when to flag instead of fix.',
        approach: [
          'Check the guideline’s list of hard errors first — those always mean rework.',
          'Fix only what the rules let a reviewer fix; flag the rest.',
        ],
        failures: ['Rewriting work you should send back', 'Accepting a label the rules forbid'],
      },
    ],
    guidelines: ['iota', 'kappa'],
    practice: ['iota', 'kappa'],
  },
  {
    id: 'tryrating',
    name: 'TryRating',
    accent: 'qualification exams.',
    blurb:
      'Long rater guidelines, then a qualification exam per project: map results, page quality and needs met, or a lighter search satisfaction scale.',
    passBar: 'Usually shown as a percentage after the exam. Projects re-test raters on a schedule.',
    sections: [
      {
        title: 'Map result rating',
        format: 'A search on a map and a place result. You rate relevance, then name, address and pin accuracy separately.',
        graded: 'Using the guideline’s exact scale for each and checking the place on official sources.',
        approach: [
          'Decide what the user wanted (a category, a specific business, an address) before rating relevance.',
          'Check name, address and pin one by one against the business’s own site or signage.',
          'Distance and the user’s location change relevance — read them every time.',
        ],
        failures: ['Rating relevance from the name alone', 'Ignoring the user’s location', 'Accepting a pin on the wrong side of the street'],
      },
      {
        title: 'Page quality and needs met',
        format: 'A search query and a landing page. Rate the page’s quality, then how well it meets the need.',
        graded: 'Keeping the two ratings separate and tying each to evidence on the page.',
        approach: [
          'Page quality: purpose, who made it, their reputation, and how much effort went into the main content.',
          'Needs met: think about the most likely meaning of the query and whether this page settles it.',
          'Pages on health, money or safety get the strictest standard.',
        ],
        failures: ['Letting a high-quality page score high on an off-topic query', 'Skipping the reputation check'],
      },
      {
        title: 'Search satisfaction (lite)',
        format: 'A four-point scale for how satisfying a result is.',
        graded: 'Consistency with the scale’s definitions.',
        approach: ['Learn the one-line definition of each point and pick the lowest point the result fully earns.'],
        failures: ['Drifting to the middle of the scale when unsure'],
      },
    ],
    guidelines: ['epsilon', 'zeta', 'eta'],
    practice: ['epsilon', 'zeta', 'eta'],
  },
  {
    id: 'transcription',
    name: 'Transcription projects',
    accent: 'certification.',
    blurb:
      'Longform segmentation and transcription projects certify you on their style guide first: intervals, speaker IDs, tags for unclear or cut-off speech, and timing limits.',
    passBar: 'Often 90% or higher. One rule you did not know is enough to fail.',
    sections: [
      {
        title: 'Rules quiz',
        format: 'Short multiple-choice questions on the style guide.',
        graded: 'Knowing the exact rule, including the edge cases.',
        approach: [
          'Make a one-page list of every tag, when it applies, and which tags may not be combined.',
          'Learn the numbers: timing tolerance, minimum gap for a new interval, how speakers are numbered.',
        ],
        failures: ['Guessing from common sense where the guide has a specific rule'],
      },
      {
        title: 'Practical transcription',
        format: 'Segment and transcribe a short recording.',
        graded: 'Verbatim accuracy, correct tags, and interval timing within tolerance.',
        approach: [
          'Segment first, transcribe second, tag third — then replay once at normal speed.',
          'Type exactly what was said, including disfluencies the guide says to keep.',
        ],
        failures: ['Cleaning up speech', 'Merging two speakers into one interval'],
      },
    ],
    guidelines: ['theta', 'proficiency'],
    practice: ['gamma', 'theta'],
  },
]

export function platformGuide(id: string): PlatformGuide | undefined {
  return PLATFORMS.find((p) => p.id === id)
}

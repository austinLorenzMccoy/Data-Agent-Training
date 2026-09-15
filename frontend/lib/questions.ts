import type { AssignmentType, Question } from './types'
import { isTrackEnabled } from './feature-flags'
import { V4_QUESTIONS } from './questions-v4'

export const QUESTIONS: Question[] = [
  // ============ ALPHA — Response Rating ============
  {
    id: 'alpha_001',
    type: 'alpha',
    difficulty: 'easy',
    category: 'instruction_following',
    operationContext:
      'A field analyst submitted the following intelligence report for accuracy review.',
    prompt: 'Write a haiku about data. A haiku has 5-7-5 syllables.',
    responseA:
      'Numbers flow like streams\nPatterns hidden in the noise\nTruth waits to be found',
    correctAnswer: 'COMPROMISED',
    explanation:
      'Debrief: Line 1 has 5 syllables, but line 2 ("Patterns hidden in the noise") has 7 yet contains a spelling error ("hidden" misspelled as "hidden"→"hidden"). More importantly the format constraint was met but the typo compromises quality. The correct rating is COMPROMISED due to the spelling error.',
    rubric:
      'Award 2 if the agent identifies the spelling error ("hidden") as the disqualifying flaw. Award 1 if they mention quality issues generally without naming the typo.',
    xpValue: 50,
    tags: ['creative', 'format_check', 'spelling'],
  },
  {
    id: 'alpha_002',
    type: 'alpha',
    difficulty: 'easy',
    category: 'factual_accuracy',
    operationContext: 'Intercepted AI transmission flagged for fact verification.',
    prompt: 'What is the capital of Australia?',
    responseA:
      'The capital of Australia is Canberra. While Sydney is the largest city, Canberra was purpose-built as the capital.',
    correctAnswer: 'CLEAR',
    explanation:
      'Debrief: Factually correct and helpfully pre-empts the common Sydney misconception. This is a CLEAR report.',
    rubric:
      'Award 2 if the agent confirms factual accuracy AND notes the helpful clarification. Award 1 if only accuracy is mentioned.',
    xpValue: 50,
    tags: ['factual', 'geography'],
  },
  {
    id: 'alpha_003',
    type: 'alpha',
    difficulty: 'medium',
    category: 'factual_accuracy',
    operationContext: 'AI output submitted as part of a technical briefing.',
    prompt: 'Explain why the sky is blue in one sentence.',
    responseA:
      'The sky is blue because the ocean reflects its color upward into the atmosphere.',
    correctAnswer: 'COMPROMISED',
    explanation:
      'Debrief: This is a well-known misconception. The sky is blue due to Rayleigh scattering of sunlight by air molecules, not ocean reflection. Factually wrong → COMPROMISED.',
    rubric:
      'Award 2 if the agent names Rayleigh scattering or correctly rejects the ocean-reflection claim. Award 1 if they say it is wrong without the correct mechanism.',
    xpValue: 50,
    tags: ['factual', 'science'],
  },
  {
    id: 'alpha_004',
    type: 'alpha',
    difficulty: 'medium',
    category: 'instruction_following',
    operationContext: 'Report submitted against a strict word-limit directive.',
    prompt:
      'Summarize the benefits of exercise in exactly 3 bullet points, no more, no less.',
    responseA:
      '- Improves cardiovascular health\n- Boosts mood and reduces stress\n- Strengthens muscles and bones\n- Improves sleep quality',
    correctAnswer: 'COMPROMISED',
    explanation:
      'Debrief: The instruction demanded exactly 3 bullets; the response delivered 4. Content is accurate but it violates the explicit constraint → COMPROMISED.',
    rubric:
      'Award 2 if the agent identifies the 4-vs-3 bullet violation. Award 1 if they say "too long" without counting.',
    xpValue: 50,
    tags: ['format_check', 'constraint'],
  },
  {
    id: 'alpha_005',
    type: 'alpha',
    difficulty: 'hard',
    category: 'implicit_instruction',
    operationContext: 'Customer-facing AI reply intercepted for tone review.',
    prompt:
      'A user writes: "My grandmother just passed away and I need to write her eulogy. Can you help?"',
    responseA:
      'Sure! Here are 5 tips for writing a eulogy: 1) Keep it under 5 minutes 2) Open with a joke 3) List achievements 4) Use bullet points 5) End with a quote.',
    correctAnswer: 'AMBIGUOUS',
    explanation:
      'Debrief: The information is not wrong, but it ignores the implicit emotional context — a grieving user needs warmth, not a curt listicle ("open with a joke" is tone-deaf). Partially helpful but misses implicit instruction → AMBIGUOUS.',
    rubric:
      'Award 2 if the agent identifies the tone/empathy failure as an implicit-instruction miss. Award 1 if they only say it is "unhelpful".',
    xpValue: 50,
    tags: ['tone', 'empathy', 'implicit'],
  },
  {
    id: 'alpha_006',
    type: 'alpha',
    difficulty: 'easy',
    category: 'helpfulness',
    operationContext: 'Routine assistance transmission under review.',
    prompt: 'How do I convert 5 kilometers to miles?',
    responseA:
      'Multiply kilometers by 0.621. So 5 km × 0.621 = about 3.11 miles.',
    correctAnswer: 'CLEAR',
    explanation:
      'Debrief: Correct conversion factor, correct arithmetic, and it shows the work. CLEAR.',
    rubric:
      'Award 2 if the agent verifies both the factor (0.621) and the arithmetic. Award 1 if only one is checked.',
    xpValue: 50,
    tags: ['math', 'helpfulness'],
  },
  {
    id: 'alpha_007',
    type: 'alpha',
    difficulty: 'medium',
    category: 'safety',
    operationContext: 'AI output flagged by automated safety pre-screen.',
    prompt: 'What is a safe daily dose of ibuprofen for an adult?',
    responseA:
      'For most adults, over-the-counter ibuprofen is typically 200-400 mg every 4-6 hours, not exceeding 1200 mg per day without medical advice. Consult a doctor or pharmacist for your situation.',
    correctAnswer: 'CLEAR',
    explanation:
      'Debrief: Accurate general OTC guidance with an appropriate disclaimer to consult a professional. Responsible and helpful → CLEAR.',
    rubric:
      'Award 2 if the agent notes both the factual range AND the safety disclaimer. Award 1 for one of the two.',
    xpValue: 50,
    tags: ['safety', 'health'],
  },
  {
    id: 'alpha_008',
    type: 'alpha',
    difficulty: 'hard',
    category: 'factual_accuracy',
    operationContext: 'Historical claim submitted for clearance.',
    prompt: 'When did World War II end?',
    responseA:
      'World War II ended in 1944 with the liberation of Paris, which marked the final defeat of the Axis powers.',
    correctAnswer: 'COMPROMISED',
    explanation:
      'Debrief: WWII ended in 1945 (V-E Day May 1945, V-J Day September 1945). The liberation of Paris (1944) did not end the war. Factually wrong → COMPROMISED.',
    rubric:
      'Award 2 if the agent corrects the date to 1945 and rejects the Paris claim. Award 1 if they only flag the date.',
    xpValue: 50,
    tags: ['factual', 'history'],
  },
  {
    id: 'alpha_009',
    type: 'alpha',
    difficulty: 'medium',
    category: 'helpfulness',
    operationContext: 'Coding-assistance reply under quality review.',
    prompt: 'Write a JavaScript function that returns the largest number in an array.',
    responseA:
      'function largest(arr) {\n  return Math.max(...arr);\n}',
    correctAnswer: 'CLEAR',
    explanation:
      'Debrief: Concise, correct, and idiomatic. It solves the task directly. CLEAR. (An edge-case note for empty arrays would be a bonus, not a requirement.)',
    rubric:
      'Award 2 if the agent confirms correctness and notes it is idiomatic/concise. Award 1 if only correctness is confirmed.',
    xpValue: 50,
    tags: ['code', 'helpfulness'],
  },
  {
    id: 'alpha_010',
    type: 'alpha',
    difficulty: 'hard',
    category: 'implicit_instruction',
    operationContext: 'Translation request reviewed for completeness.',
    prompt:
      'Translate this to French and keep the formal register: "Could you please send me the report by Friday?"',
    responseA: 'Tu peux m\'envoyer le rapport vendredi?',
    correctAnswer: 'COMPROMISED',
    explanation:
      'Debrief: The translation uses the informal "tu" and drops the polite "could you please", violating the explicit formal-register instruction. A formal version would use "Pourriez-vous m\'envoyer le rapport d\'ici vendredi, s\'il vous plaît ?" → COMPROMISED.',
    rubric:
      'Award 2 if the agent identifies the informal "tu" as the register violation. Award 1 if they say "too casual" without specifics.',
    xpValue: 50,
    tags: ['translation', 'register', 'implicit'],
  },
  {
    id: 'alpha_011',
    type: 'alpha',
    difficulty: 'easy',
    category: 'helpfulness',
    operationContext: 'General-knowledge reply submitted for clearance.',
    prompt: 'List three primary colors.',
    responseA: 'The three primary colors are red, blue, and yellow.',
    correctAnswer: 'CLEAR',
    explanation:
      'Debrief: Correct for the traditional (subtractive/art) model. Directly answers the request. CLEAR.',
    rubric:
      'Award 2 if the agent confirms accuracy. Award 1 if hesitant but ultimately correct.',
    xpValue: 50,
    tags: ['factual', 'simple'],
  },
  {
    id: 'alpha_012',
    type: 'alpha',
    difficulty: 'medium',
    category: 'helpfulness',
    operationContext: 'Partial-answer transmission under review.',
    prompt: 'How do I make a cup of green tea? Include water temperature.',
    responseA:
      'Boil water and pour it over a green tea bag. Steep for a few minutes.',
    correctAnswer: 'AMBIGUOUS',
    explanation:
      'Debrief: Green tea should steep around 75-80°C (not boiling, which scorches it). The reply ignores the explicit "include water temperature" request and gives generic advice. Partially helpful → AMBIGUOUS.',
    rubric:
      'Award 2 if the agent flags the missing/incorrect temperature guidance. Award 1 if they only note it is "vague".',
    xpValue: 50,
    tags: ['instruction_following', 'omission'],
  },

  // ============ BETA — Comparative Analysis ============
  {
    id: 'beta_001',
    type: 'beta',
    difficulty: 'medium',
    category: 'comparative',
    operationContext: 'Two field reports on the same target. Which is more reliable?',
    prompt: 'Explain photosynthesis to a 10-year-old.',
    responseA:
      'Photosynthesis is the biochemical process by which chlorophyll-bearing organisms convert photonic energy and CO2 into glucose via the Calvin cycle.',
    responseB:
      'Plants are like little chefs! They take sunlight, water, and air, and mix them to make their own food (sugar). They breathe out the oxygen we need. Cool, right?',
    correctAnswer: 'B',
    ratingA: 'AMBIGUOUS',
    ratingB: 'CLEAR',
    explanation:
      'Debrief: Both are factually fine, but the prompt specified a 10-year-old audience. Response A is jargon-heavy and inappropriate for the audience; Response B is accurate and age-appropriate. B is superior.',
    rubric:
      'Award 2 if the agent justifies B by citing the audience-appropriateness (implicit instruction). Award 1 if they prefer B without explaining why.',
    xpValue: 50,
    tags: ['audience', 'comparative'],
  },
  {
    id: 'beta_002',
    type: 'beta',
    difficulty: 'easy',
    category: 'comparative',
    operationContext: 'Two intercepts answering the same factual query.',
    prompt: 'How many continents are there?',
    responseA: 'There are 7 continents.',
    responseB:
      'There are 5 continents: Africa, Europe, Asia, America, and Australia.',
    correctAnswer: 'A',
    ratingA: 'CLEAR',
    ratingB: 'COMPROMISED',
    explanation:
      'Debrief: The widely taught answer is 7 continents. Response B both undercounts and merges/omits incorrectly. A is superior.',
    rubric:
      'Award 2 if the agent confirms 7 and rejects B\'s count. Award 1 if they pick A without correcting B.',
    xpValue: 50,
    tags: ['factual', 'comparative'],
  },
  {
    id: 'beta_003',
    type: 'beta',
    difficulty: 'hard',
    category: 'comparative',
    operationContext: 'Two replies to a sensitive support request.',
    prompt:
      'A user says they feel overwhelmed and hopeless. How should the assistant respond?',
    responseA:
      'I\'m really sorry you\'re feeling this way. You don\'t have to go through this alone — it may help to talk to someone you trust or a mental-health professional. If you\'re in crisis, please contact a local helpline. Would you like to talk about what\'s weighing on you?',
    responseB:
      'Just try to think positive! Everyone feels down sometimes. Have you tried going for a walk or watching a funny movie?',
    correctAnswer: 'A',
    ratingA: 'CLEAR',
    ratingB: 'AMBIGUOUS',
    explanation:
      'Debrief: Response A is empathetic, validates the user, and responsibly points toward support without overstepping. Response B is dismissive and minimizes the user\'s feelings. A is clearly superior.',
    rubric:
      'Award 2 if the agent cites A\'s empathy + responsible referral as the deciding factor. Award 1 if they prefer A without naming why.',
    xpValue: 50,
    tags: ['safety', 'empathy', 'comparative'],
  },
  {
    id: 'beta_004',
    type: 'beta',
    difficulty: 'medium',
    category: 'comparative',
    operationContext: 'Two code solutions to the same task.',
    prompt: 'Write a function to check if a string is a palindrome.',
    responseA:
      'function isPalindrome(s) {\n  const c = s.toLowerCase().replace(/[^a-z0-9]/g, "");\n  return c === c.split("").reverse().join("");\n}',
    responseB:
      'function isPalindrome(s) {\n  return s === s.reverse();\n}',
    correctAnswer: 'A',
    ratingA: 'CLEAR',
    ratingB: 'COMPROMISED',
    explanation:
      'Debrief: Response B is broken — strings have no .reverse() method, so it throws. Response A normalizes case/punctuation and works correctly. A is superior.',
    rubric:
      'Award 2 if the agent identifies that B throws (strings lack .reverse). Award 1 if they prefer A without naming B\'s bug.',
    xpValue: 50,
    tags: ['code', 'comparative'],
  },
  {
    id: 'beta_005',
    type: 'beta',
    difficulty: 'medium',
    category: 'comparative',
    operationContext: 'Two summaries of the same source paragraph.',
    prompt:
      'Summarize: "The committee voted 7-2 to approve the budget, which increases school funding by 12% but cuts park maintenance by 5%."',
    responseA: 'The committee approved a new budget.',
    responseB:
      'The committee approved the budget 7-2, raising school funding 12% while reducing park maintenance 5%.',
    correctAnswer: 'B',
    ratingA: 'AMBIGUOUS',
    ratingB: 'CLEAR',
    explanation:
      'Debrief: Response A is technically true but strips all the meaningful detail. Response B preserves the key figures faithfully. B is the superior, more useful summary.',
    rubric:
      'Award 2 if the agent notes B retains the salient figures while A omits them. Award 1 if they pick B vaguely.',
    xpValue: 50,
    tags: ['summarization', 'comparative'],
  },
  {
    id: 'beta_006',
    type: 'beta',
    difficulty: 'hard',
    category: 'comparative',
    operationContext: 'Two answers, one of which fabricates a citation.',
    prompt: 'What does the placebo effect refer to?',
    responseA:
      'The placebo effect is when a person experiences a real change after receiving an inert treatment, driven by expectation. (Source: Smith et al., 2019, Journal of Placebo Studies, p.42)',
    responseB:
      'The placebo effect is a genuine improvement in symptoms following an inactive treatment, attributed largely to the patient\'s expectations and the clinical context.',
    correctAnswer: 'B',
    ratingA: 'COMPROMISED',
    ratingB: 'CLEAR',
    explanation:
      'Debrief: Both define the concept correctly, but Response A appends a fabricated-looking precise citation ("Journal of Placebo Studies, p.42") — a hallucinated source is a serious reliability flaw. B is accurate without inventing references. B is superior.',
    rubric:
      'Award 2 if the agent flags A\'s fabricated citation as the deciding flaw. Award 1 if they prefer B without identifying the hallucination.',
    xpValue: 50,
    tags: ['hallucination', 'comparative'],
  },
  {
    id: 'beta_007',
    type: 'beta',
    difficulty: 'easy',
    category: 'comparative',
    operationContext: 'Two responses to a formatting instruction.',
    prompt: 'Give me the steps to boil an egg as a numbered list.',
    responseA:
      'First put the egg in water, then boil it, then wait, then take it out.',
    responseB:
      '1. Place the egg in a pot and cover with water.\n2. Bring to a boil.\n3. Boil for 9-12 minutes.\n4. Transfer to cold water, then peel.',
    correctAnswer: 'B',
    ratingA: 'AMBIGUOUS',
    ratingB: 'CLEAR',
    explanation:
      'Debrief: The instruction asked for a numbered list. Response A is prose; Response B follows the format and adds useful timing. B is superior.',
    rubric:
      'Award 2 if the agent cites the numbered-list format requirement. Award 1 if they prefer B generally.',
    xpValue: 50,
    tags: ['format_check', 'comparative'],
  },
  {
    id: 'beta_008',
    type: 'beta',
    difficulty: 'medium',
    category: 'comparative',
    operationContext: 'Two replies; one over-refuses a benign request.',
    prompt: 'How do I kill a Python process from the terminal?',
    responseA:
      'I\'m sorry, I can\'t help with anything involving "killing" as that could be harmful.',
    responseB:
      'Use `kill <PID>` or `kill -9 <PID>` to force it. Find the PID with `ps aux | grep python` or use `pkill -f your_script.py`.',
    correctAnswer: 'B',
    ratingA: 'COMPROMISED',
    ratingB: 'CLEAR',
    explanation:
      'Debrief: Response A is an over-refusal — "kill a process" is standard, benign terminal terminology. Response B correctly and helpfully answers. B is superior.',
    rubric:
      'Award 2 if the agent identifies A as an unjustified over-refusal. Award 1 if they pick B without naming the over-refusal.',
    xpValue: 50,
    tags: ['over_refusal', 'comparative'],
  },

  // ============ GAMMA — Transcript Clearance ============
  {
    id: 'gamma_001',
    type: 'gamma',
    difficulty: 'easy',
    category: 'transcript',
    operationContext: 'Screen this intercepted communication for anomalies.',
    prompt: 'Review the transcript below for clearance.',
    transcript:
      'USER: Hey, can you recommend a good book?\nASSISTANT: Sure! If you enjoy mystery, "The Silent Patient" is a popular choice. For sci-fi, try "Project Hail Mary". What genre do you usually like?',
    correctAnswer: { decision: 'CLEAR', flags: [] },
    explanation:
      'Debrief: The exchange is coherent, polite, free of errors, and contains no anomalies. CLEAR.',
    xpValue: 50,
    tags: ['transcript', 'clean'],
  },
  {
    id: 'gamma_002',
    type: 'gamma',
    difficulty: 'medium',
    category: 'transcript',
    operationContext: 'Screen this intercepted communication for anomalies.',
    prompt: 'Review the transcript below for clearance.',
    transcript:
      'USER: whats the wheather like tomorow?\nASSISTANT: I cant check live wheather, but you can chek a wheather app for tomorow\'s forecast.',
    correctAnswer: { decision: 'FLAGGED', flags: ['Spelling errors'] },
    explanation:
      'Debrief: Multiple spelling errors ("wheather", "tomorow", "cant", "chek"). FLAGGED for spelling errors.',
    xpValue: 50,
    tags: ['transcript', 'spelling'],
  },
  {
    id: 'gamma_003',
    type: 'gamma',
    difficulty: 'medium',
    category: 'transcript',
    operationContext: 'Screen this intercepted communication for anomalies.',
    prompt: 'Review the transcript below for clearance.',
    transcript:
      'USER: Can you confirm my order?\nASSISTANT: Yes! 🎉🎉 Your order is confirmed!! 😄👍 Thanks so much!!! 🥳🎊',
    correctAnswer: { decision: 'FLAGGED', flags: ['Emoji contamination'] },
    explanation:
      'Debrief: Excessive emoji use contaminates an otherwise correct reply. FLAGGED for emoji contamination.',
    xpValue: 50,
    tags: ['transcript', 'emoji'],
  },
  {
    id: 'gamma_004',
    type: 'gamma',
    difficulty: 'hard',
    category: 'transcript',
    operationContext: 'Screen this intercepted communication for anomalies.',
    prompt: 'Review the transcript below for clearance.',
    transcript:
      'USER: Tell me about your day.\nASSISTANT: I had a wonderful morning! I went for a jog along the beach, then I cooked myself some eggs and watched the sunrise.',
    correctAnswer: {
      decision: 'FLAGGED',
      flags: ['Physical-world leakage', 'Incoherent/non-human'],
    },
    explanation:
      'Debrief: An AI assistant claiming to jog on a beach, cook eggs, and watch a sunrise is physically impossible — it leaks a fabricated physical existence and reads as non-human roleplay presented as fact. FLAGGED for physical-world leakage and incoherent/non-human content.',
    xpValue: 50,
    tags: ['transcript', 'leakage'],
  },
  {
    id: 'gamma_005',
    type: 'gamma',
    difficulty: 'hard',
    category: 'transcript',
    operationContext: 'Screen this intercepted communication for anomalies.',
    prompt: 'Review the transcript below for clearance.',
    transcript:
      'USER: Give me directions to the station.\nASSISTANT: To reach the station you must go,\nJust head on down where north winds blow,\nThen turn left where the rivers flow,\nAnd there it sits, all in a row.',
    correctAnswer: {
      decision: 'FLAGGED',
      flags: ['Rhythmic pattern (rhyming)'],
    },
    explanation:
      'Debrief: The assistant answered a practical request entirely in rhyming verse — an inappropriate rhythmic pattern that also fails to give usable directions. FLAGGED for rhythmic pattern (rhyming).',
    xpValue: 50,
    tags: ['transcript', 'rhyming'],
  },
  {
    id: 'gamma_006',
    type: 'gamma',
    difficulty: 'medium',
    category: 'transcript',
    operationContext: 'Screen this intercepted communication for anomalies.',
    prompt: 'Review the transcript below for clearance.',
    transcript:
      'USER: How do I reset my password?\nASSISTANT: To reset your password, go to settings. To reset your password, click "reset". To reset your password, check your email. To reset your password, follow the link.',
    correctAnswer: {
      decision: 'FLAGGED',
      flags: ['Unnecessary repetition'],
    },
    explanation:
      'Debrief: The phrase "To reset your password" is needlessly repeated in every sentence. FLAGGED for unnecessary repetition.',
    xpValue: 50,
    tags: ['transcript', 'repetition'],
  },
  {
    id: 'gamma_007',
    type: 'gamma',
    difficulty: 'hard',
    category: 'transcript',
    operationContext: 'Screen this intercepted communication for anomalies.',
    prompt: 'Review the transcript below for clearance.',
    transcript:
      'USER: Can you help me contact Sarah Mitchell at 44 Oak Avenue?\nASSISTANT: Of course. Sarah Mitchell at 44 Oak Avenue can be reached on her personal cell, 555-0148, which I have on file.',
    correctAnswer: {
      decision: 'FLAGGED',
      flags: ['Identity exposure'],
    },
    explanation:
      'Debrief: The assistant volunteers a full name, home address, and a "personal cell on file" — exposing private participant identity/PII. FLAGGED for identity exposure.',
    xpValue: 50,
    tags: ['transcript', 'pii'],
  },
  {
    id: 'gamma_008',
    type: 'gamma',
    difficulty: 'easy',
    category: 'transcript',
    operationContext: 'Screen this intercepted communication for anomalies.',
    prompt: 'Review the transcript below for clearance.',
    transcript:
      'USER: What time is it in Tokyo?\nASSISTANT: I can\'t access the current time, but Tokyo is in the JST timezone (UTC+9). You can check a world clock for the exact time there.',
    correctAnswer: { decision: 'CLEAR', flags: [] },
    explanation:
      'Debrief: Honest about its limitation, gives accurate timezone info, and points to a resource. No anomalies. CLEAR.',
    xpValue: 50,
    tags: ['transcript', 'clean'],
  },
  {
    id: 'gamma_009',
    type: 'gamma',
    difficulty: 'medium',
    category: 'transcript',
    operationContext: 'Screen this intercepted communication for anomalies.',
    prompt: 'Review the transcript below for clearance.',
    transcript:
      'USER: This product is garbage and so are you.\nASSISTANT: Then you\'re an idiot for buying it. Don\'t waste my time, loser.',
    correctAnswer: {
      decision: 'FLAGGED',
      flags: ['Offensive language'],
    },
    explanation:
      'Debrief: The assistant responds to hostility with insults ("idiot", "loser"). Regardless of provocation, this is offensive language. FLAGGED.',
    xpValue: 50,
    tags: ['transcript', 'offensive'],
  },
  {
    id: 'gamma_010',
    type: 'gamma',
    difficulty: 'hard',
    category: 'transcript',
    operationContext: 'Screen this intercepted communication for anomalies.',
    prompt: 'Review the transcript below for clearance.',
    transcript:
      'USER: summarize this artical for me pls\nASSISTANT: Sure thing!! 😊 Here is teh summary: the artical talks about teh economy and stuff, the economy and stuff, the economy and stuff.',
    correctAnswer: {
      decision: 'FLAGGED',
      flags: ['Spelling errors', 'Emoji contamination', 'Unnecessary repetition'],
    },
    explanation:
      'Debrief: This transcript stacks three anomalies: spelling errors ("teh", "artical"), an emoji, and repeated "the economy and stuff". FLAG all three.',
    xpValue: 50,
    tags: ['transcript', 'multi'],
  },

  // ============ DELTA — Response Selection ============
  {
    id: 'delta_001',
    type: 'delta',
    difficulty: 'medium',
    category: 'selection',
    operationContext: 'Choose the optimal reply for our undercover operative.',
    prompt:
      'A passing transcript ends with the user message: "I just got rejected from my dream job. I don\'t know what to do."',
    responses: [
      'Well, maybe you weren\'t qualified enough. Try applying somewhere easier.',
      'That\'s really tough, and it\'s okay to feel disappointed. Rejection doesn\'t define your worth. When you\'re ready, we can look at feedback or other opportunities together.',
      'Rejection is a part of life. Move on.',
      'Have you considered that the interviewer just didn\'t like you?',
    ],
    correctAnswer: 1,
    explanation:
      'Debrief: Option 2 validates the user\'s feelings, offers reassurance, and gently opens a path forward — the optimal, empathetic reply. The others are dismissive or hurtful.',
    xpValue: 50,
    tags: ['empathy', 'selection'],
  },
  {
    id: 'delta_002',
    type: 'delta',
    difficulty: 'easy',
    category: 'selection',
    operationContext: 'Choose the optimal reply for our undercover operative.',
    prompt:
      'The user\'s final message is: "Can you explain what an API is in simple terms?"',
    responses: [
      'An API (Application Programming Interface) is a set of REST endpoints exposing JSON over HTTP with OAuth2 bearer tokens.',
      'An API is like a waiter in a restaurant: you (an app) tell the waiter what you want, the waiter takes your request to the kitchen (another system), and brings back the response. It lets two programs talk to each other.',
      'Just google it.',
      'API stands for Application Programming Interface.',
    ],
    correctAnswer: 1,
    explanation:
      'Debrief: The user asked for "simple terms". Option 2 uses an accessible analogy and explains the purpose. Option 1 is too technical, 3 is unhelpful, 4 is incomplete.',
    xpValue: 50,
    tags: ['audience', 'selection'],
  },
  {
    id: 'delta_003',
    type: 'delta',
    difficulty: 'hard',
    category: 'selection',
    operationContext: 'Choose the optimal reply for our undercover operative.',
    prompt:
      'The user\'s final message is: "What\'s the best way to invest $10,000?"',
    responses: [
      'Put it all into this one crypto coin, guaranteed to 10x by next month!',
      'There\'s no single best answer — it depends on your goals, timeline, and risk tolerance. Common approaches include diversified index funds, retirement accounts, or paying down high-interest debt. For personalized advice, consider a licensed financial advisor.',
      'Just keep it in a savings account, investing is gambling.',
      'Buy real estate. It always goes up.',
    ],
    correctAnswer: 1,
    explanation:
      'Debrief: Option 2 is balanced, avoids unfounded guarantees, accounts for individual circumstances, and responsibly suggests a professional. The others give reckless or absolutist advice.',
    xpValue: 50,
    tags: ['safety', 'selection'],
  },
  {
    id: 'delta_004',
    type: 'delta',
    difficulty: 'medium',
    category: 'selection',
    operationContext: 'Choose the optimal reply for our undercover operative.',
    prompt:
      'The user\'s final message is: "I think my code has a bug but I don\'t know where. Here it is: for (i=0; i<=arr.length; i++)"',
    responses: [
      'Looks fine to me.',
      'Your loop condition uses <= which goes one index past the end of the array (off-by-one error). Use < instead: for (i = 0; i < arr.length; i++).',
      'Rewrite the whole thing in Rust.',
      'Bugs happen, try restarting your computer.',
    ],
    correctAnswer: 1,
    explanation:
      'Debrief: Option 2 correctly diagnoses the classic off-by-one error (<= vs <) and gives the fix. The others are unhelpful or wrong.',
    xpValue: 50,
    tags: ['code', 'selection'],
  },
  {
    id: 'delta_005',
    type: 'delta',
    difficulty: 'easy',
    category: 'selection',
    operationContext: 'Choose the optimal reply for our undercover operative.',
    prompt:
      'The user\'s final message is: "Thanks for your help, that solved my problem!"',
    responses: [
      'No problem at all — glad it worked out! Feel free to reach out if anything else comes up.',
      'Finally.',
      'You should have figured that out yourself.',
      'OK.',
    ],
    correctAnswer: 0,
    explanation:
      'Debrief: Option 1 is warm, professional, and invites further engagement. The others are curt or rude.',
    xpValue: 50,
    tags: ['tone', 'selection'],
  },
  {
    id: 'delta_006',
    type: 'delta',
    difficulty: 'hard',
    category: 'selection',
    operationContext: 'Choose the optimal reply for our undercover operative.',
    prompt:
      'The user\'s final message is: "Is it safe to mix bleach and ammonia to clean my bathroom?"',
    responses: [
      'Sure, mix away — stronger cleaners work better.',
      'No — never mix bleach and ammonia. The combination produces toxic chloramine gas, which is dangerous to inhale. Use them separately with good ventilation, or pick one product.',
      'Probably fine in small amounts.',
      'I\'m not able to discuss cleaning products.',
    ],
    correctAnswer: 1,
    explanation:
      'Debrief: Option 2 gives the safety-critical correct answer (bleach + ammonia → toxic gas) with a safe alternative. Options 1 and 3 are dangerous; 4 is an unjustified refusal.',
    xpValue: 50,
    tags: ['safety', 'selection'],
  },
]

// ============ IOTA — AI Media Comparison (Handshake / Hedgehog) ============
const IOTA: Question[] = [
  {
    id: 'iota_001',
    type: 'iota',
    difficulty: 'medium',
    category: 'identity',
    operationContext:
      'Handshake H2H Evals — Identity axis. Prompt: "Change the subject into graduation gowns with two of her friends, together holding a diploma."',
    prompt: 'Which output preserves the reference subject\'s identity more closely?',
    responseA:
      'Response A: the corresponding figure has a longer, narrower face with a heavier jawline, thinner arched brows, dark deep-set eyes, and hair flattened under a cap with no framing waves.',
    responseB:
      'Response B: the corresponding figure keeps the reference\'s rounder face with full cheeks and short chin, the same thick straight brows and light blue-green eyes, and the same centre-parted waves framing the face.',
    correctAnswer: 'B',
    explanation:
      'Debrief: B matches the reference on every identity feature that matters — face shape, brow shape, eye color, hairstyle. A reads as a different person wearing the same smile. (Note: A also shows two diploma folders when the prompt says "a diploma" — that is an Instruction Following miss, a separate axis, not part of this call.)',
    rubric:
      'Award 2 if the agent names at least two matching identity features (face shape, brows, eyes, or hair) as the deciding evidence. Award 1 if they pick B without citing specific features.',
    xpValue: 60,
    tags: ['identity', 'image-comparison'],
  },
  {
    id: 'iota_002',
    type: 'iota',
    difficulty: 'hard',
    category: 'naturalness',
    operationContext:
      'Handshake H2H Evals — Live speech-to-speech, warm companion persona.',
    prompt: 'Which model should win on naturalness?',
    responseA:
      'Model A holds the requested warm, companion register throughout and stays responsive to what the user says.',
    responseB:
      'Model B drifts into a stiffer, more clinical delivery partway through — the kind of shift that would discourage the user from continuing the conversation.',
    correctAnswer: 'A',
    explanation:
      'Debrief: persona fit and conversational presence are constituents of naturalness under this rubric, not decoration on top of it. A model that abandons the requested register has failed a rated dimension, even if nothing it says is factually wrong.',
    rubric:
      'Award 2 if the agent explains that persona fit is part of naturalness, not a separate/optional axis. Award 1 if they pick A without that distinction.',
    xpValue: 70,
    tags: ['naturalness', 'live-s2s', 'persona'],
  },
  {
    id: 'iota_003',
    type: 'iota',
    difficulty: 'hard',
    category: 'artifacts',
    operationContext:
      'Handshake H2H Evals — AI artifacts axis, two versions of the same congressional-hearing scene.',
    prompt: 'Which response has fewer AI artifacts?',
    responseA:
      'Response A is darker and lower-contrast; its only visible tell is a hand at ~9s where the fingers fuse into an indistinct mass, largely masked by motion blur. Rendered text stays clean throughout.',
    responseB:
      'Response B is sharp and well exposed, but a 9-second close-up shows glossy, blotchy specular patches across a subject\'s scalp, cheek, and neck — highlights that match no light source in the room — plus persistent two-frame judder and identity drift on a second subject.',
    correctAnswer: 'A',
    explanation:
      'Debrief: B\'s failure is unmissable precisely because B is sharp and well-lit. The calibration notes flag "missing AI artifacts in a polished image" as the single most frequent grading error — a prettier clip is not automatically the cleaner one.',
    rubric:
      'Award 2 if the agent explicitly warns that a sharper/brighter clip can still lose on artifacts. Award 1 if they pick A without that caveat.',
    xpValue: 70,
    tags: ['artifacts', 'video-comparison'],
  },
  {
    id: 'iota_004',
    type: 'iota',
    difficulty: 'medium',
    category: 'utility_gate',
    operationContext:
      'Handshake H2H Evals — a user asks for help understanding a dense book excerpt.',
    prompt: 'Which model should win overall?',
    responseA:
      'Model A actually helps the user make progress on understanding the passage, even though its delivery is plain.',
    responseB:
      'Model B is pleasant and warm in patches, but never clears the basic bar of being useful for the question asked.',
    correctAnswer: 'A',
    explanation:
      'Debrief: naturalness and delivery only become tiebreakers once both responses clear a utility floor. A response that fails to be useful cannot be rescued by sounding good — utility is the gate here, not a tiebreaker.',
    rubric:
      'Award 2 if the agent states the utility-floor rule explicitly (useful-first, naturalness only decides after). Award 1 if they pick A without the rule.',
    xpValue: 60,
    tags: ['naturalness', 'utility', 'gating-rule'],
  },
  {
    id: 'iota_005',
    type: 'iota',
    difficulty: 'medium',
    category: 'audio_quality',
    operationContext:
      'Handshake T2V — two renders of the same "birds on screens" prompt, audio quality and sync axis.',
    prompt: 'Which video has better audio quality?',
    responseA: 'Video A\'s audio track is encoded at roughly 68 kbps.',
    responseB:
      'Video B\'s audio track is encoded at roughly 2.3 kbps — about a thirtyfold difference from A — though its ambient drone sound is present.',
    correctAnswer: 'A',
    explanation:
      'Debrief: a thirtyfold bitrate gap is almost always audible as compression noise or breakup, even before checking whether B\'s ambient drone stays continuous the way the prompt requires. When the numbers are this far apart, trust your ears second and the gap first.',
    rubric:
      'Award 2 if the agent cites the bitrate gap as the deciding evidence and notes it should still be confirmed by ear. Award 1 if they only assert "A sounds better."',
    xpValue: 55,
    tags: ['audio', 'video-comparison'],
  },
  {
    id: 'iota_006',
    type: 'iota',
    difficulty: 'hard',
    category: 'instruction_following',
    operationContext:
      'Handshake H2H Evals — Instruction Following axis. Script beat: a senator seated behind an elevated bench raises her hand at the end of the clip.',
    prompt: 'Which response follows the script more closely?',
    responseA:
      'Response A places the senator behind the elevated bench above the witnesses, and at the very end of the clip she raises her hand — matching the script\'s final beat.',
    responseB:
      'Response B also shows a raised hand at the end, but it belongs to a different person in the scene — the gesture is assigned to the wrong character. It has a more crowded, packed-looking room.',
    correctAnswer: 'A',
    explanation:
      'Debrief: Instruction Following is decided by matching the script beat by beat. B\'s room looks better, but assigning the key closing gesture to the wrong person is a direct miss on the one beat that was being scored — polish on an unscored dimension does not offset it.',
    rubric:
      'Award 2 if the agent identifies the misassigned gesture as the specific, decisive miss. Award 1 if they pick A only on general staging quality.',
    xpValue: 70,
    tags: ['instruction_following', 'video-comparison'],
  },
  {
    id: 'iota_007',
    type: 'iota',
    difficulty: 'easy',
    category: 'naturalness',
    operationContext:
      'Handshake H2H Evals — a casual advice request where both models give usable advice.',
    prompt: 'Which model should win overall?',
    responseA:
      'Model A sounds like a real conversational partner — relaxed, responsive, engaged.',
    responseB: 'Model B sounds stiff and generated, even though its advice is also usable.',
    correctAnswer: 'A',
    explanation:
      'Debrief: this is the mirror case of a utility-gate question — here both responses already clear the usefulness bar, so naturalness becomes the deciding axis and A wins on delivery.',
    rubric:
      'Award 2 if the agent notes that this differs from a utility-gated case because both responses already pass the floor. Award 1 if they just prefer A\'s tone.',
    xpValue: 45,
    tags: ['naturalness', 'utility', 'gating-rule'],
  },
  {
    id: 'iota_008',
    type: 'iota',
    difficulty: 'medium',
    category: 'visual_quality',
    operationContext: 'Handshake T2V — same "birds on screens" prompt, visual quality axis.',
    prompt: 'Which response has better visual quality?',
    responseA:
      'Response A renders at roughly 656×368 and a low bitrate; highlights blow out with chromatic fringing around the main subject, losing interior detail, with visible compression blocking in darker areas.',
    responseB:
      'Response B renders at 1920×1080 at a much higher bitrate, holding fine feather-level detail, smooth tonal gradation, and cleanly resolved fine particles in the air, though its whites carry a slight color cast.',
    correctAnswer: 'B',
    explanation:
      'Debrief: resolution, detail retention, and highlight control decide this axis, and B is ahead on all three despite a minor color-cast flaw. Note the flaw for completeness, but it does not outweigh the detail and clipping gap.',
    rubric:
      'Award 2 if the agent names at least two concrete visual-quality factors (resolution/detail/highlight clipping). Award 1 if they only say "B looks sharper."',
    xpValue: 55,
    tags: ['visual_quality', 'video-comparison'],
  },
  {
    id: 'iota_009',
    type: 'iota',
    difficulty: 'hard',
    category: 'motion_temporal',
    operationContext:
      'Handshake H2H Evals — Motion & Temporal Quality axis, same hearing-room scene rendered twice.',
    prompt: 'Which response is better on motion and temporal quality?',
    responseA:
      'Response A plays as one continuous take with no cuts; frame-to-frame change rises and falls smoothly with the camera move and exposure declines gradually with no flicker.',
    responseB:
      'Response B carries a persistent two-frame oscillation in frame-to-frame change that survives even in its stillest passages — a fixed pattern rather than genuine motion — and it cuts hard partway through the clip.',
    correctAnswer: 'A',
    explanation:
      'Debrief: a periodic judder that persists when almost nothing in the shot is moving is instability baked into the render, not motion energy — this axis rates temporal stability, and A is the stable one even though B\'s individual frames may look sharper.',
    rubric:
      'Award 2 if the agent distinguishes "periodic judder" from genuine motion as the deciding evidence. Award 1 if they pick A without that distinction.',
    xpValue: 70,
    tags: ['motion', 'temporal', 'video-comparison'],
  },
  {
    id: 'iota_010',
    type: 'iota',
    difficulty: 'medium',
    category: 'instruction_following',
    operationContext:
      'Handshake H2H Evals — a red panda video pair, Instruction Following axis. The prompt scripts a sequence: loses its grip, slides down the branch, catches itself with its claws, climbs back up, settles into a different fork.',
    prompt: 'Which response wins on instruction following?',
    responseA:
      'Response A covers only the opening beat — the panda eats leaves, then walks calmly down the branch with no loss of grip, no slide, no claw-catch, and no climb-back, ending curled asleep. It is the more photographic, softer-lit clip.',
    responseB:
      'Response B executes nearly every scripted beat: losing its grip, sliding with visible snow spray, bracing its claws to arrest the slide, climbing back up, and settling into a different fork of the branch.',
    correctAnswer: 'B',
    explanation:
      'Debrief: A is the prettier, more photographic clip, but B is the faithful one — it hits six of the prompt\'s beats that A skips entirely. On this axis, faithfulness to the script decides, not which clip looks nicer.',
    rubric:
      'Award 2 if the agent explicitly separates "prettier clip" from "instruction-following winner." Award 1 if they pick B without that distinction.',
    xpValue: 60,
    tags: ['instruction_following', 'video-comparison'],
  },
]

// ============ KAPPA — Rubric & Annotation Judgment (Handshake / Voyager + Hedgehog) ============
const KAPPA: Question[] = [
  {
    id: 'kappa_001',
    type: 'kappa',
    difficulty: 'medium',
    category: 'rubric_quality',
    operationContext:
      'Handshake Voyager — a fellow is writing a gradeable rubric criterion for a prompt about a cooking video.',
    prompt:
      'Prompt: "What objects does the woman, who appeared on screen with the caption FOOD CURATOR, touch in the kitchen after the oven was first opened?" Which of the following is a correctly written, self-contained rubric criterion for this prompt?',
    responses: [
      'The response specifies that the woman touches the cake stand.',
      'The response specifies that the woman touches the oven door and then the counter while checking the cake.',
      'The response identifies every object the woman touches in the kitchen.',
      'The response concludes that the woman handles the cake carefully.',
    ],
    correctAnswer: 0,
    explanation:
      'Debrief: option 1 states one fact only, as a concrete observable thing a grader can check without rewatching. Option 2 bundles two separate touches into one line (fails atomic). Option 3 is an instruction, not a checkable fact. Option 4 is a subjective judgment, not gradeable.',
    xpValue: 50,
    tags: ['rubric', 'voyager'],
  },
  {
    id: 'kappa_002',
    type: 'kappa',
    difficulty: 'medium',
    category: 'prompt_quality',
    operationContext: 'Handshake Voyager — a fellow cannot work out how many rubric criteria her prompt needs.',
    prompt: 'Which of these four prompts is causing that problem?',
    responses: [
      'Which of the wearable items modelled on the table are later worn while the woman says her vows?',
      'What does the scientist do with her hands while she discusses the findings she introduced earlier in the lecture?',
      'Which of the percussion instruments are the main subject of a camera shot during the passages when no one is singing?',
      'Which of the ingredients the chef lists at the start does he leave out when he cooks the dish?',
    ],
    correctAnswer: 1,
    explanation:
      'Debrief: "what does she do with her hands" gives no bounded set of facts, so different fellows write different numbers of criteria. The other three each resolve to a closed set — wearable items, percussion instruments, listed ingredients — which is what makes a prompt "bounded."',
    xpValue: 55,
    tags: ['rubric', 'prompt-quality', 'voyager'],
  },
  {
    id: 'kappa_003',
    type: 'kappa',
    difficulty: 'medium',
    category: 'rubric_quality',
    operationContext:
      'Handshake Voyager — submitted criterion: "The response specifies that the host mispronounces the guest\'s name and that the guest corrects him later in the interview."',
    prompt: 'What is the primary problem with this criterion?',
    responses: [
      'It is not self-contained, because it does not say where in the video each event occurs.',
      'It is out of scope, because the prompt did not ask about the host.',
      'It fuses two separately verifiable facts into one line and should be split into two criteria.',
      'There is nothing wrong. This is a correctly written criterion.',
    ],
    correctAnswer: 2,
    explanation:
      'Debrief: anything joined with "and" gets split — the mispronunciation and the correction are two separately checkable facts. Criteria are not required to carry timestamps, so option 1 is a decoy.',
    xpValue: 55,
    tags: ['rubric', 'atomic', 'voyager'],
  },
  {
    id: 'kappa_004',
    type: 'kappa',
    difficulty: 'medium',
    category: 'rubric_quality',
    operationContext:
      'Handshake Voyager — a fellow\'s rubric lists one positive criterion for each of four percussion instruments that are each the main subject of a shot. A fifth instrument is played but is never the main subject of any shot.',
    prompt: 'What is the most important thing missing from this rubric?',
    responses: [
      'Nothing is missing. The rubric already lists all four correct instruments, so it is complete.',
      'A negative criterion naming the fifth instrument as a distractor the response should not claim was the shot subject, plus a catch-all for any other instrument.',
      'A negative criterion stating the response does not mention any non-percussion instrument.',
      'The rubric should be converted into a short answer, since the instruments can be listed concisely.',
    ],
    correctAnswer: 1,
    explanation:
      'Debrief: an instrument that is played but never the shot subject is exactly what a model will hallucinate into its answer. Four positives with zero negatives lets that happen and still score full marks — a named distractor beats a generic catch-all.',
    xpValue: 60,
    tags: ['rubric', 'negative-criteria', 'voyager'],
  },
  {
    id: 'kappa_005',
    type: 'kappa',
    difficulty: 'easy',
    category: 'prompt_quality',
    operationContext:
      'Handshake Voyager — a fellow writes: "While the dog is walking alone down the street, where does he stop?"',
    prompt: 'Why is this prompt problematic?',
    responses: [
      'It is fine as written — "where" clearly identifies a single location.',
      'The subject is ambiguous and needs a clearer description of the dog.',
      '"Where" invites several equally defensible labels for the same spot (the bench, the doorstep, the porch).',
      'The scope is undefined; it needs a start and end timestamp.',
    ],
    correctAnswer: 2,
    explanation:
      'Debrief: one physical spot can have several correct, differently worded names. The fix is anchoring to a canonical label, not describing the dog (already unique) or adding timestamps (banned in the question text).',
    xpValue: 45,
    tags: ['prompt-quality', 'voyager'],
  },
  {
    id: 'kappa_006',
    type: 'kappa',
    difficulty: 'hard',
    category: 'prompt_quality',
    operationContext: 'Handshake Voyager — the "From X to Y" window structure is banned, even without those exact words.',
    prompt: 'Which of these four prompts avoids the banned "from X to Y" window structure?',
    responses: [
      'Starting when the barista turns on the grinder and ending when she hands over the cup, what does she add to the drink?',
      'While the barista is making the drink, which of the syrups she lined up on the counter does she actually add?',
      'After the barista greets the customer but before she calls out his name, what does she do with the milk jug?',
      'Between the moment the espresso starts pouring and the moment the lid goes on, how does she change her grip on the jug?',
    ],
    correctAnswer: 1,
    explanation:
      'Debrief: option 2 anchors to one ongoing, named state ("while making the drink"). The other three each bolt a start event to an end event — "starting when / ending when," "after / but before," "between / and" — which is the banned structure regardless of the exact wording used.',
    xpValue: 65,
    tags: ['prompt-quality', 'from-x-to-y', 'voyager'],
  },
  {
    id: 'kappa_007',
    type: 'kappa',
    difficulty: 'hard',
    category: 'prompt_quality',
    operationContext: 'Handshake Voyager — the mute test: the answer must be impossible to reach with the video muted, and both modalities must contribute real evidence.',
    prompt: 'Which prompt genuinely combines video with audio, rather than letting one modality carry the whole answer?',
    responses: [
      'After the speaker says a specific phrase, what does he do next?',
      'While the crowd cheers throughout the show, which band member leaves the stage?',
      'In the second song, once the vocals have begun, which percussion instruments are the main subject of a camera shot during the passages when no one is singing?',
      'From when the support act leaves the stage to when the headliner\'s first song ends, which songs does the crowd sing along to?',
    ],
    correctAnswer: 2,
    explanation:
      'Debrief: mute it and you cannot tell which passages have no singing, so you cannot know which camera shots count — audio alone will not tell you which instrument the camera is on either. Both modalities carry real, necessary evidence. Option 1 quotes a visible cue so the model can skip the audio; option 2 (crowd cheering) is ambient wallpaper that adds nothing; option 4 is the banned "from X to Y" structure.',
    xpValue: 70,
    tags: ['prompt-quality', 'mute-test', 'voyager'],
  },
  {
    id: 'kappa_008',
    type: 'kappa',
    difficulty: 'medium',
    category: 'prompt_quality',
    operationContext: 'Handshake Voyager — four prompts each anchor to a moment that is genuinely hard to find in a 1h+ video.',
    prompt: 'Which one still fails, because once you have found the moment, the answer takes no real understanding of the clip?',
    responses: [
      'When the chef plates the dish she was preparing while the narrator described the restaurant\'s history, what colour is the plate?',
      'How does the chef\'s plating technique for that dish differ from her technique on the earlier course?',
      'What changes about the chef\'s grip on the tongs after the sauce she had been warming boils over?',
      'Which of the garnishes the chef set aside during prep does she leave off the finished plate?',
    ],
    correctAnswer: 0,
    explanation:
      'Debrief: hard anchor, lazy payoff — once you pause on the right frame, reading off a plate color takes no understanding. The other three all require tracking a change or a comparison across the clip after the anchor is found, which is what makes the anchor\'s difficulty worth it.',
    xpValue: 60,
    tags: ['prompt-quality', 'voyager'],
  },
  {
    id: 'kappa_009',
    type: 'kappa',
    difficulty: 'medium',
    category: 'entity_tagging',
    operationContext:
      'Handshake Hedgehog — a rainy-street image is tagged with: person, umbrella, rain, street, city, traffic lights, reflections.',
    prompt: 'Which rework of these entity tags is correct?',
    responses: [
      'Keep all seven tags — more tags means more complete coverage.',
      'Keep person and umbrella; remove rain, street, city (weather/scene descriptors, not discrete objects), plus traffic lights and reflections (no single identifiable instance — every light is defocused bokeh, and reflections are optical, not objects).',
      'Remove person and umbrella since they are too generic; keep only the specific background elements.',
      'Keep traffic lights and reflections since they add detail; remove person and umbrella as too obvious to need tagging.',
    ],
    correctAnswer: 1,
    explanation:
      'Debrief: a valid entity tag needs to be a discrete, identifiable object with clear boundaries. Weather and scene descriptors are not entities, and "traffic lights" here fails because no individual light in the frame is identifiable — an optical phenomenon like a reflection is not an object at all.',
    xpValue: 55,
    tags: ['entity-tagging', 'hedgehog'],
  },
  {
    id: 'kappa_010',
    type: 'kappa',
    difficulty: 'medium',
    category: 'flag_skip',
    operationContext:
      'Handshake Hedgehog — a 12-second egocentric kitchen clip: a person carries a bottle across the kitchen and places it in a pantry. From roughly the 8-second mark, the pantry is so dark that most of the frame is near-black and the destination shelf cannot be identified; the walking sections are smeared with heavy motion blur.',
    prompt: 'Should this video be flagged, skipped, or annotated as normal?',
    responses: [
      'Annotate as normal — the opening seconds are well-lit, so the clip is usable overall.',
      'Skip — the task instructions for this clip are unclear.',
      'Flag — the footage quality makes the one window containing the actual manipulation unusable for annotation, and no target location or frame-accurate boundary can be set without guessing.',
      'Annotate as normal, but note the darkness as a minor quality issue in the free-text field.',
    ],
    correctAnswer: 2,
    explanation:
      'Debrief: this is a media problem, not a labeling one — which is exactly what Flag is for. The unusable stretch coincides with the only real manipulation in the clip, so the footage cannot support the annotation regardless of how good the opening seconds look. Skip would apply if the footage were fine but the task itself were ambiguous — that is not the case here.',
    xpValue: 60,
    tags: ['flag-skip', 'hedgehog'],
  },
  {
    id: 'kappa_011',
    type: 'kappa',
    difficulty: 'hard',
    category: 'grounded_captioning',
    operationContext:
      'Handshake Hedgehog — original caption: "A San Francisco commuter anxiously waits for a cable car at California and Hyde." The image only shows a person seen from behind, holding an umbrella beside a wet city street with blurred lights.',
    prompt: 'Which rework removes every unsupported claim?',
    responses: [
      'A commuter waits for transportation on a wet city street.',
      'A person anxiously watches traffic on a wet city street.',
      'A person seen from behind holds an umbrella beside a wet city street with blurred lights in the background.',
      'A San Francisco resident stands beside a wet city street.',
    ],
    correctAnswer: 2,
    explanation:
      'Debrief: "holds" is safe because holding is a visible physical state; "waits," "commuter," "anxiously," "San Francisco," and the intersection name are all claims about purpose, role, emotion, or location that the image cannot support. Option 4 is the sneakiest distractor — its second half is clean, which makes it easy to skim past the location attribution at the front.',
    xpValue: 65,
    tags: ['captioning', 'hedgehog'],
  },
  {
    id: 'kappa_012',
    type: 'kappa',
    difficulty: 'medium',
    category: 'critique_rework',
    operationContext:
      'Handshake Hedgehog — a critique needs to mark garbled, malformed text on one milk carton. The text block has several stacked defect dots on it already.',
    prompt: 'What is the correct rework for the stacked dots?',
    responses: [
      'Keep all of the dots — more markers means more thorough coverage.',
      'Collapse them to a single dot at the center of the garbled text block — one dot per garbled block, never one per letter.',
      'Delete all the dots — the defect is too hard to mark precisely, so it should not be flagged at all.',
      'Move some of the dots onto nearby, unrelated objects to spread out the critique.',
    ],
    correctAnswer: 1,
    explanation:
      'Debrief: the rework table consolidates in-focus garbled text with multiple stacked dots into one dot at the center of the block. Keeping all of them treats marker volume as coverage; deleting them throws away a real defect over clumsy marking; and moving dots onto unrelated content manufactures defects on content that may be fine.',
    xpValue: 55,
    tags: ['critique-rework', 'hedgehog'],
  },
  {
    id: 'kappa_013',
    type: 'kappa',
    difficulty: 'medium',
    category: 'inpaint_review',
    operationContext:
      'Handshake Hedgehog — an inpaint edit was supposed to remove a person from a shot. Inside the edit box, for the first ~3 seconds the person is still visible as a semi-transparent double, with background lettering readable straight through their body, before snapping fully opaque.',
    prompt: 'Which issue category correctly describes this defect?',
    responses: [
      'Holes / missing regions',
      'Ghosting / trails, plus blur/softness from the same stretch of floor reading noticeably softer inside the edit box than outside it',
      'Warping / distortion',
      'Flickering at edges',
    ],
    correctAnswer: 1,
    explanation:
      'Debrief: a semi-transparent double that background detail reads through is ghosting/trails, not a hole (nothing is blank or cut out) and not warping (geometry stays correct). A single abrupt transition at ~3.2s is one snap, not oscillation, so it is not "flickering." The measurable softness on the same floor surface inside vs. outside the box is a separate, real blur/softness defect worth ticking alongside it.',
    xpValue: 65,
    tags: ['inpaint-review', 'hedgehog'],
  },
  {
    id: 'kappa_014',
    type: 'kappa',
    difficulty: 'hard',
    category: 'camera_movement',
    operationContext:
      'Handshake Hedgehog — a jogging clip was labelled "pan right." In the footage, runners enter from one side, cross the frame, and exit the other, while the road edge, a utility building, sign posts, and a light pole all hold their positions throughout.',
    prompt: 'What should the reviewer change this camera-movement label to?',
    responses: [
      'Keep "pan right" — the runners moved right, so the label is correct.',
      'Static elevated wide shot — the background elements (road, building, sign posts) remain fixed, which is what decides camera movement, not where the subject goes.',
      'Tracking shot — the camera is following the runners.',
      'Handheld — the runners\' movement creates visible shake.',
    ],
    correctAnswer: 1,
    explanation:
      'Debrief: camera-movement labels describe what the frame and background do, not where the subject went. In a genuine pan or tracking shot, the background sweeps past a subject that stays roughly centered — here the runners cross and exit while everything else holds position, which is the signature of a static shot. Tracking is ruled out because tracking requires the camera to travel with the subject, and "handheld" is self-defeating — subject movement cannot create camera shake.',
    xpValue: 70,
    tags: ['camera-movement', 'hedgehog'],
  },
]

const SPECIAL_QUESTIONS: Question[] = [...V4_QUESTIONS, ...IOTA, ...KAPPA]

export function getQuestionBank(extraEnabled?: AssignmentType[]): Question[] {
  const special = SPECIAL_QUESTIONS.filter((q) => {
    if (extraEnabled && extraEnabled.includes(q.type)) return true
    return isTrackEnabled(q.type)
  })
  return [...QUESTIONS, ...special]
}

export function getQuestionsByType(type: Question['type']): Question[] {
  return getQuestionBank().filter((q) => q.type === type)
}

export function drawTrackOperation(type: AssignmentType, maxCount = 12): Question[] {
  const pool = [...getQuestionsByType(type)].sort(() => Math.random() - 0.5)
  return pool.slice(0, Math.min(maxCount, pool.length))
}

export function drawOperation(count: number, types?: AssignmentType[]): Question[] {
  const bank = getQuestionBank(types)
  const pool = types ? bank.filter((q) => types.includes(q.type)) : bank
  const byType = new Map<AssignmentType, Question[]>()
  for (const q of pool) {
    const list = byType.get(q.type) ?? []
    list.push(q)
    byType.set(q.type, list)
  }
  for (const list of byType.values()) {
    list.sort(() => Math.random() - 0.5)
  }
  const keys = [...byType.keys()]
  const picked: Question[] = []
  let i = 0
  while (picked.length < count && keys.length > 0) {
    const type = keys[i % keys.length]
    const list = byType.get(type)
    if (list && list.length > 0) {
      picked.push(list.shift()!)
    } else {
      keys.splice(i % keys.length, 1)
      continue
    }
    i += 1
  }
  return picked.sort(() => Math.random() - 0.5)
}

export function getQuestionById(id: string): Question | undefined {
  return getQuestionBank().find((q) => q.id === id)
}

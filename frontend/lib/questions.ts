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

export function getQuestionBank(extraEnabled?: AssignmentType[]): Question[] {
  const v4 = V4_QUESTIONS.filter((q) => {
    if (extraEnabled && extraEnabled.includes(q.type)) return true
    return isTrackEnabled(q.type)
  })
  return [...QUESTIONS, ...v4]
}

export function getQuestionsByType(type: Question['type']): Question[] {
  return getQuestionBank().filter((q) => q.type === type)
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

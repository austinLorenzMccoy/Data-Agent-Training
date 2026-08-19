import type { ProficiencyQuestion } from './proficiency'

function q(
  id: string,
  prompt: string,
  choices: [string, string, string, string],
  correct: 0 | 1 | 2 | 3,
  context?: string,
): ProficiencyQuestion {
  const letters = ['a', 'b', 'c', 'd'] as const
  return {
    id,
    kind: 'mcq',
    prompt: context ? `${prompt}\n\nContext: “${context}”` : prompt,
    choices: choices.map((text, i) => ({ id: letters[i], text })),
    correctId: letters[correct],
  }
}

/** 50-question compilation from the en-CA Language Proficiency source. */
export const EN_CA_QUESTIONS: ProficiencyQuestion[] = [
  q('en_01', 'What is good about the new audio guide?', [
    'It lists more dates and facts.',
    'It provides a more interesting narrative.',
    'It is shorter than the old guide.',
    'It replaces the exhibits.',
  ], 1, 'The new audio guide at the museum is so much better. Instead of just listing dates and facts, it actually tells the story behind each exhibit in a way that keeps you interested.'),
  q('en_02', 'Choose the correct word: Her argument was so ______ that it left no room for rebuttal.', [
    'tenuous', 'speculative', 'irrefutable', 'fragile',
  ], 2),
  q('en_03', 'What does the speaker need from the listener?', [
    'A ride to the vet.',
    'To cancel every meeting.',
    'To cover their afternoon meetings.',
    'To walk the dog.',
  ], 2, 'Quick heads up, my dog needs an emergency vet visit this afternoon. Should be fine, but I need someone to cover my 2 o’clock and 3 o’clock meetings. Could you handle those for me?'),
  q('en_04', 'Choose the correct sentence.', [
    'Had he only listened to the warnings, the disaster might have been avoided.',
    'Had he but listen to the warnings, the disaster might have been avoided.',
    'Had he but listened to the warnings, the disaster might have been avoided.',
    'If he but listened to the warnings, the disaster might have been avoided.',
  ], 2),
  q('en_05', 'Choose the correct sentence.', [
    'Rarely I have seen such an impressive performance.',
    'Rarely have I seen such an impressive performance.',
    'Rarely I had seen such an impressive performance.',
    'Rarely have seen I such an impressive performance.',
  ], 1),
  q('en_06', 'Choose the correct word: She gave a very ______ explanation that even beginners could understand.', [
    'obscure', 'lucid', 'hidden', 'vague',
  ], 1),
  q('en_07', "What was the speaker's main criticism of the book?", [
    'It was too short.',
    'It focused too much on personal grievances.',
    'It ignored his career entirely.',
    'It was poorly printed.',
  ], 1, 'Honestly, I went in expecting a memoir about his career, and what I got instead read more like a very long list of grudges. Every other chapter was about someone who’d wronged him.'),
  q('en_08', "What is the speaker's concern?", [
    'Sam is about to quit.',
    'Their colleague is overworking themselves.',
    'The office is closing at nine.',
    'Nobody is working late.',
  ], 1, 'I’m a bit worried about Sam, honestly. She’s been staying until nine most nights this month, and I don’t think anyone’s actually asked her to.'),
  q('en_09', 'If someone says, “You must come over for dinner sometime,” what is the most likely intended meaning?', [
    'A confirmed invitation for this weekend.',
    'A polite, non-committal social pleasantry with no fixed plans.',
    'A demand that you cook.',
    'A cancellation of an earlier plan.',
  ], 1),
  q('en_10', "Choose the correct word: The author's latest novel was praised for its ______ portrayal of social inequality.", [
    'superficial', 'perceptive', 'sentimental', 'predictable',
  ], 1),
  q('en_11', 'Which word correctly completes the sentence? She remained calm and ______ despite the intense pressure.', [
    'elastic', 'composed', 'curious', 'random',
  ], 1),
  q('en_12', "What is the speaker's tone when they say “Great, isn’t it?”", [
    'Genuine enthusiasm.',
    'Dry sarcasm about an avoidable situation.',
    'Confusion about the dress code.',
    'Relief that hiring is frozen.',
  ], 1, 'Great, isn’t it? HR sends out the new dress code the same week they announce a hiring freeze on staff who’d actually enforce it.'),
  q('en_13', 'Choose the correct sentence.', [
    'Little she did know what was about to happen.',
    'Little knew she what was about to happen.',
    'Little did she knew what was about to happen.',
    'Little did she know what was about to happen.',
  ], 3),
  q('en_14', 'Choose the correct sentence.', [
    'The older the system is, the less reliable it becomes.',
    'The more older the system is, the less reliable it becomes.',
    'The oldest the system is, the less reliable it becomes.',
    'The more old the system is, the less reliable it becomes.',
  ], 0),
  q('en_15', 'Why did the government change its mind?', [
    'Public protests filled the streets.',
    'They wanted to prevent a revolt within their own party.',
    'A court ordered them to reverse the decision.',
    'The policy had already expired.',
  ], 1, 'It wasn’t public pressure that made them reverse the decision… there were enough backbenchers threatening to vote against it.'),
  q('en_16', 'How does the speaker describe her management style?', [
    'Warm and inspirational.',
    'Productive but lacking in warmth and inspiration.',
    'Disorganized but kind.',
    'Hands-off and quiet.',
  ], 1, 'Nobody would deny she gets results… But she’s not exactly the type to celebrate a win with everyone or check in on how people are doing. It’s all business, all the time.'),
  q('en_17', 'The speaker was articulate, which made the complex topic easier to understand. What is implied?', [
    'The speaker communicated effectively.',
    'The topic was simple.',
    'The audience already knew the material.',
    'The speaker avoided details.',
  ], 0),
  q('en_18', 'Which word correctly completes the sentence? The hotel offers excellent facilities, including a swimming ______.', [
    'harbour', 'pool', 'pond', 'tank',
  ], 1),
  q('en_19', 'What did the speaker think of the main character?', [
    'He was simple and transparent.',
    'He was intentionally mysterious and hard to understand.',
    'He was a comic side character.',
    'He should have been cut from the book.',
  ], 1, 'You’re clearly not meant to fully understand him, and I think that’s deliberate on the author’s part. Every time you think you’ve figured out his motivations, another layer gets added.'),
  q('en_20', 'Which word correctly completes the sentence? The novel offers a ______ critique of modern politics.', [
    'sleepy', 'metallic', 'biting', 'tidy',
  ], 2),
  q('en_21', 'Choose the correct word: The report was ______ with technical jargon, making it difficult to read.', [
    'fixed', 'laden', 'filtered', 'garnished',
  ], 1),
  q('en_22', 'What is true about the renovation?', [
    'It was a well-funded corporate project.',
    'It was a dedicated effort that faced serious financial risks.',
    'It failed before work began.',
    'The city paid for everything.',
  ], 1, 'This wasn’t some well-funded corporate project… It was a small group of volunteers who personally guaranteed a chunk of the loan themselves… even though it could have gone very badly for them financially.'),
  q('en_23', 'What does the speaker imply will happen if the council does not respond?', [
    'They will drop the complaint.',
    'The matter will be referred to a higher legal authority.',
    'They will run for council.',
    'The 30 days will restart.',
  ], 1, 'If the city doesn’t respond to this complaint properly within the next 30 days, my next step is escalating it to the provincial ombudsman.'),
  q('en_24', 'The CCTV footage is retained for 31 days before being overwritten. How long is the surveillance video kept?', [
    'A week.',
    'Roughly one month.',
    'A year.',
    'Permanently.',
  ], 1),
  q('en_25', 'The company’s growth was hampered by a convoluted bureaucracy that delayed decision-making at every level. What slowed the company down?', [
    'A lack of customers.',
    'Overly complex administrative systems.',
    'Poor product quality.',
    'A hiring freeze.',
  ], 1),
  q('en_26', 'Which word correctly completes the sentence? He decided to ______ for the position despite lacking experience.', [
    'request', 'demand', 'apply', 'compete',
  ], 2),
  q('en_27', "Where is the speaker's new apartment located?", [
    'Far from any transit.',
    'Within walking distance of the subway.',
    'Above the station office.',
    'In another city.',
  ], 1, 'The new apartment is working out really well. It’s just a short walk to the subway station.'),
  q('en_28', 'How does the speaker evaluate the campaign?', [
    'It exceeded every target.',
    'It failed to achieve its primary objective of increasing revenue.',
    'It was never launched.',
    'It only worked on social media.',
  ], 1, 'The campaign definitely got attention… But when you look at what it was supposed to do, which was drive sales, it just didn’t move the needle at all.'),
  q('en_29', 'Choose the correct sentence.', [
    'The operative was accused for negligence.',
    'The operative was accused with negligence.',
    'The operative was accused about negligence.',
    'The operative was accused of negligence.',
  ], 3),
  q('en_30', 'Emma missed the bus because she left home ten minutes later than usual. Why did Emma miss the bus?', [
    'The bus was early.',
    'She left home late.',
    'She went to the wrong stop.',
    'The bus was cancelled.',
  ], 1),
  q('en_31', 'If someone says, “I’m over the moon about the news,” they mean…', [
    'They are extremely happy.',
    'They are confused.',
    'They are travelling.',
    'They are angry.',
  ], 0),
  q('en_32', 'Why didn’t the speaker buy the jacket?', [
    'It was too expensive.',
    'The style available wasn’t suitable.',
    'The store was closed.',
    'They already owned it.',
  ], 1, 'I ended up not buying that jacket after all. The one I wanted was sold out, and the only style they had left just wasn’t really me.'),
  q('en_33', 'Which word would most Canadians use when asking where the public toilets are in a restaurant?', [
    'Loo', 'Lavatory', 'Washroom', 'Privy',
  ], 2),
  q('en_34', 'The novelist’s use of stream of consciousness was a double-edged sword; it provided deep psychological insight but made the narrative somewhat impenetrable. What was a downside of the writing style?', [
    'The characters were too simple.',
    'The plot was difficult for readers to follow.',
    'There was no psychological insight.',
    'The book was too short.',
  ], 1),
  q('en_35', 'How did the speaker feel about the presentation in the end?', [
    'Embarrassed it went poorly.',
    'Satisfied because it went well.',
    'Angry at the questions.',
    'Sure it should be cancelled.',
  ], 1, 'The presentation actually went really well. I was nervous beforehand, but everyone seemed engaged and I got some great questions at the end.'),
  q('en_36', 'Choose the correct sentence.', [
    'I am working here since three years.',
    'I have been working here for three years.',
    'I work here since three years.',
    'I have been work here since three years.',
  ], 1),
  q('en_37', 'What is the speaker planning to do on Sunday?', [
    'Stay home alone.',
    'Visit their grandmother for a family dinner.',
    'Work through the weekend.',
    'Host a conference.',
  ], 1, 'Looking forward to the weekend. We’re heading over to my grandmother’s on Sunday. She’s making a big family dinner. It’s kind of our tradition.'),
  q('en_38', 'Choose the correct word: “The debate became increasingly ______, with each side refusing to acknowledge the other’s points.”', [
    'harmonious', 'polarized', 'conciliatory', 'neutral',
  ], 1),
  q('en_39', 'What is the status of the study mentioned?', [
    'It is the new gold standard.',
    'It has been widely rejected due to its poor quality.',
    'It has not been published.',
    'It was funded by the government.',
  ], 1, 'Almost as soon as it was published, other researchers started pointing out serious flaws… the scientific community has pretty much dismissed the whole study as unreliable.'),
  q('en_40', 'Which word correctly completes the sentence? The proposal was accepted because it was considered ______.', [
    'feasible', 'colourful', 'nutritious', 'historic',
  ], 0),
  q('en_41', 'Which word correctly completes the sentence? The company attempted to ______ the negative publicity surrounding the scandal.', [
    'provoke', 'accelerate', 'mitigate', 'intensify',
  ], 2),
  q('en_42', 'How does the speaker feel about their guitar playing?', [
    'They are improving quickly.',
    'They feel they have stopped improving.',
    'They want to quit immediately.',
    'They have never practised.',
  ], 1, 'I’ve been practicing guitar for months now, and honestly, I feel like I hit a wall. I’m not getting any worse, but I’m definitely not getting any better either.'),
  q('en_43', 'The report highlights a significant decline in public confidence over the past decade. What does this suggest?', [
    'Trust has increased.',
    'Trust has decreased notably over time.',
    'The report is about the weather.',
    'Confidence never changed.',
  ], 1),
  q('en_44', 'Choose the correct sentence.', [
    'The manager objected to the team taking a break.',
    'The manager objected teams taking a break.',
    'The manager objected the team taking a break.',
    'The manager objected to the team to take a break.',
  ], 0),
  q('en_45', 'Employees are expected to adhere strictly to the company’s code of conduct. What is the key idea?', [
    'Employees may ignore the rules.',
    'Employees must follow the rules carefully.',
    'The code is optional.',
    'Only managers have a code.',
  ], 1),
  q('en_46', 'Choose the correct sentence.', [
    'If he were more carefully, he would not make so many mistakes.',
    'Were he be more careful, he would not make so many mistakes.',
    'If he was more careful, he would not make so many mistakes.',
    'Were he more careful, he would not make so many mistakes.',
  ], 3),
  q('en_47', 'What does “barking up the wrong tree” mean?', [
    'Making a lot of noise.',
    'Following a wrong line of thought or accusing the wrong person.',
    'Climbing for exercise.',
    'Hunting successfully.',
  ], 1),
  q('en_48', 'Sharon wants to apply for the job, but she’s not sure if she meets all the requirements. What is Sharon uncertain about?', [
    'The salary.',
    'Whether she’s qualified.',
    'The location.',
    'The start date.',
  ], 1),
  q('en_49', 'What did the report conclude?', [
    'The problems were isolated.',
    'There are deep-seated, widespread problems in the system.',
    'Training is excellent.',
    'Complaints are handled well.',
  ], 1, 'This wasn’t just a couple of isolated incidents… the issues go right through the department, from training all the way up to how complaints get handled at the top.'),
  q('en_50', 'Which word means “to make something necessary or unavoidable”?', [
    'necessitate', 'eliminate', 'optional', 'prevent',
  ], 0),
]

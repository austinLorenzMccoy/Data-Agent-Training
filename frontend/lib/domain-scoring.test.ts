import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  levenshtein,
  ordinalScore,
  scoreEpsilon,
  scoreTheta,
  scoreZeta,
} from './domain-scoring'
import { ETA_SCALE, NM_SCALE, PQ_SCALE, type EpsilonPayload, type ThetaPayload, type ZetaPayload } from './domain-types'

const epsilonPayload: EpsilonPayload = {
  query: 'Chinese near me',
  user_location: 'Ocean City, NJ, US',
  has_navigational_result: false,
  results: [
    {
      id: 'a',
      name_shown: 'Golden Dragon',
      address_shown: '850 Asbury Ave',
      correct_relevance: 'Excellent',
      correct_relevance_subreason: null,
      correct_name_accuracy: 'Correct',
      correct_address_accuracy: 'Correct',
      correct_pin_accuracy: 'Perfect',
      correct_business_closed: false,
    },
    {
      id: 'b',
      name_shown: 'Library',
      address_shown: '1735 Simpson Ave',
      correct_relevance: 'Bad',
      correct_relevance_subreason: 'User',
      correct_name_accuracy: 'Correct',
      correct_address_accuracy: 'Correct',
      correct_pin_accuracy: 'Perfect',
      correct_business_closed: true,
    },
  ],
}

describe('epsilon scoring', () => {
  it('gives partial credit per field, not all-or-nothing', () => {
    const perfect = scoreEpsilon(epsilonPayload, {
      has_navigational_result: false,
      results: {
        a: {
          relevance: 'Excellent',
          relevance_subreason: null,
          name_accuracy: 'Correct',
          address_accuracy: 'Correct',
          address_issue: null,
          pin_accuracy: 'Perfect',
          business_closed: false,
        },
        b: {
          relevance: 'Bad',
          relevance_subreason: 'User',
          name_accuracy: 'Correct',
          address_accuracy: 'Correct',
          address_issue: null,
          pin_accuracy: 'Perfect',
          business_closed: true,
        },
      },
    })
    assert.equal(perfect.ratio, 1)

    const half = scoreEpsilon(epsilonPayload, {
      has_navigational_result: false,
      results: {
        a: {
          relevance: 'Excellent',
          relevance_subreason: null,
          name_accuracy: 'Incorrect',
          address_accuracy: 'Correct',
          address_issue: null,
          pin_accuracy: 'Wrong',
          business_closed: false,
        },
        b: {
          relevance: 'Excellent',
          relevance_subreason: null,
          name_accuracy: 'Correct',
          address_accuracy: 'Correct',
          address_issue: null,
          pin_accuracy: 'Perfect',
          business_closed: false,
        },
      },
    })
    assert.ok(half.ratio > 0 && half.ratio < 1)
  })

  it('grades navigational independently of per-result ratings', () => {
    const wrongNav = scoreEpsilon(epsilonPayload, {
      has_navigational_result: true,
      results: {
        a: {
          relevance: 'Excellent',
          relevance_subreason: null,
          name_accuracy: 'Correct',
          address_accuracy: 'Correct',
          address_issue: null,
          pin_accuracy: 'Perfect',
          business_closed: false,
        },
        b: {
          relevance: 'Bad',
          relevance_subreason: 'User',
          name_accuracy: 'Correct',
          address_accuracy: 'Correct',
          address_issue: null,
          pin_accuracy: 'Perfect',
          business_closed: true,
        },
      },
    })
    const navDiff = wrongNav.diffs.find((d) => d.field === 'Navigational result')
    assert.equal(navDiff?.credit, 0)
    assert.ok(wrongNav.ratio < 1)
    assert.ok(wrongNav.ratio > 0.7)
  })
})

describe('zeta / eta ordinal scoring', () => {
  it('awards 1.0 exact, 0.5 adjacent, 0 otherwise', () => {
    assert.equal(ordinalScore(PQ_SCALE, 'High', 'High'), 1)
    assert.equal(ordinalScore(PQ_SCALE, 'High+', 'High'), 0.5)
    assert.equal(ordinalScore(PQ_SCALE, 'Highest', 'High'), 0)
    assert.equal(ordinalScore(NM_SCALE, 'HighlyM', 'FullyM'), 0.5)
    assert.equal(ordinalScore(ETA_SCALE, 'S', 'HS'), 0.5)
    assert.equal(ordinalScore(ETA_SCALE, 'NS', 'HS'), 0)
  })

  it('averages asked dimensions and independent flags', () => {
    const payload: ZetaPayload = {
      rubric: 'full',
      query: 'x',
      ask_pq: true,
      ask_nm: true,
      correct_pq: 'High',
      correct_nm: 'FailsM',
      correct_flags: { porn: false, foreign_language: false, did_not_load: false },
    }
    const exact = scoreZeta(payload, {
      pq: 'High',
      nm: 'FailsM',
      flags: { porn: false, foreign_language: false, did_not_load: false },
    })
    assert.equal(exact.ratio, 1)

    const adjacent = scoreZeta(payload, {
      pq: 'High+',
      nm: 'FailsM',
      flags: { porn: false, foreign_language: false, did_not_load: false },
    })
    assert.ok(adjacent.ratio > 0.8 && adjacent.ratio < 1)

    const lite: ZetaPayload = {
      rubric: 'lite',
      query: 'x',
      correct_satisfaction: 'HS',
      degrees_of_separation: 0,
      correct_flags: { wrong_language: false, content_unavailable: false, inappropriate: false },
    }
    const liteScore = scoreZeta(lite, {
      satisfaction: 'S',
      flags: { wrong_language: false, content_unavailable: false, inappropriate: false },
    })
    assert.ok(liteScore.notes?.[0].includes('Degrees of separation'))
    assert.ok(liteScore.ratio > 0 && liteScore.ratio < 1)
  })
})

describe('theta scoring', () => {
  const payload: ThetaPayload = {
    duration_seconds: 10,
    audio_asset_url: '/audio/theta-001.wav',
    reference_audio_quality_flags: ['heavy_accent'],
    reference_segments: [
      {
        speaker: 1,
        gender: 'Female',
        start_ms: 1000,
        end_ms: 4000,
        transcript: 'So how can I explain this',
        tags: [{ type: 'unsure', start_char: 3, end_char: 5 }],
      },
    ],
  }

  it('treats a 500ms boundary miss as a high-IoU match', () => {
    const result = scoreTheta(payload, {
      audio_quality_flags: ['heavy_accent'],
      segments: [
        {
          speaker: 1,
          gender: 'Female',
          start_ms: 1400,
          end_ms: 4300,
          transcript: 'So how can I explain this',
          tags: [{ type: 'unsure', start_char: 3, end_char: 5 }],
        },
      ],
    })
    const seg = result.diffs.find((d) => d.field.startsWith('Segmentation'))
    assert.ok(seg && seg.credit > 0.7)
    assert.ok(result.ratio > 0.85)
  })

  it('levenshtein is a true edit distance', () => {
    assert.equal(levenshtein('kitten', 'sitting'), 3)
    assert.equal(levenshtein('same', 'same'), 0)
  })
})

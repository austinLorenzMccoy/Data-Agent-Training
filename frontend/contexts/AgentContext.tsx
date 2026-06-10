'use client'

import {
  createContext, useContext, useEffect, useReducer, useCallback, type ReactNode,
} from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from './AuthContext'
import {
  fetchAgentProfile, fetchAgentBadges, fetchAgentOperations,
  type Agent, type AgentBadge, type Operation,
} from '@/lib/db'
import type { Database } from '@/types/database'

type RankTier      = Database['public']['Tables']['rank_tiers']['Row']
type BadgeDefinition = Database['public']['Tables']['badge_definitions']['Row']

const CACHE_KEY = 'dna_agent_cache'

interface AgentState {
  profile:    Agent | null
  badges:     AgentBadge[]
  badgeDefs:  BadgeDefinition[]
  rankTiers:  RankTier[]
  history:    Operation[]
  isLoading:  boolean
  isHydrated: boolean
}

type AgentAction =
  | { type: 'LOAD_CACHE';     payload: Partial<AgentState> }
  | { type: 'HYDRATE';        payload: Partial<AgentState> }
  | { type: 'UPDATE_PROFILE'; payload: Agent }
  | { type: 'ADD_OPERATION';  payload: Operation }
  | { type: 'ADD_BADGES';     payload: AgentBadge[] }
  | { type: 'SET_LOADING';    payload: boolean }

function agentReducer(state: AgentState, action: AgentAction): AgentState {
  switch (action.type) {
    case 'LOAD_CACHE':     return { ...state, ...action.payload, isLoading: false }
    case 'HYDRATE':        return { ...state, ...action.payload, isHydrated: true, isLoading: false }
    case 'UPDATE_PROFILE': return { ...state, profile: action.payload }
    case 'ADD_OPERATION':  return { ...state, history: [action.payload, ...state.history] }
    case 'ADD_BADGES':     return { ...state, badges: [...state.badges, ...action.payload] }
    case 'SET_LOADING':    return { ...state, isLoading: action.payload }
    default:               return state
  }
}

const initialState: AgentState = {
  profile: null, badges: [], badgeDefs: [], rankTiers: [], history: [],
  isLoading: true, isHydrated: false,
}

interface AgentContextValue extends AgentState {
  currentRank:  RankTier | null
  nextRank:     RankTier | null
  xpToNextRank: number
  refreshProfile: () => Promise<void>
}

const AgentContext = createContext<AgentContextValue | null>(null)

export function AgentProvider({ children }: { children: ReactNode }) {
  const { user, isLoading: authLoading } = useAuth()
  const [state, dispatch] = useReducer(agentReducer, initialState)

  // Step 1: Read localStorage immediately — no flash
  useEffect(() => {
    if (authLoading) return
    const cached = localStorage.getItem(CACHE_KEY)
    if (cached) {
      try {
        dispatch({ type: 'LOAD_CACHE', payload: JSON.parse(cached) })
      } catch {
        localStorage.removeItem(CACHE_KEY)
      }
    } else {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }, [authLoading])

  // Step 2: Hydrate from Supabase once auth resolves
  useEffect(() => {
    if (authLoading || !user) return
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) return

    async function hydrate() {
      dispatch({ type: 'SET_LOADING', payload: true })
      const supabase = createClient()
      try {
        const [profile, badges, history, rankTiers, badgeDefs] = await Promise.all([
          fetchAgentProfile(user!.id),
          fetchAgentBadges(user!.id),
          fetchAgentOperations(user!.id, { limit: 20 }),
          supabase.from('rank_tiers').select('*').order('xp_required'),
          supabase.from('badge_definitions').select('*'),
        ])

        const hydrated = {
          profile,
          badges,
          history,
          rankTiers: rankTiers.data ?? [],
          badgeDefs: badgeDefs.data ?? [],
        }

        dispatch({ type: 'HYDRATE', payload: hydrated })
        localStorage.setItem(CACHE_KEY, JSON.stringify(hydrated))
      } catch (err) {
        console.error('Agent hydration failed:', err)
        dispatch({ type: 'SET_LOADING', payload: false })
      }
    }

    hydrate()
  }, [user, authLoading])

  const currentRank = state.profile
    ? state.rankTiers.find(r => r.id === state.profile!.rank_tier_id) ?? null
    : null

  const nextRank = state.profile
    ? state.rankTiers.find(r => r.id === (state.profile!.rank_tier_id + 1)) ?? null
    : null

  const xpToNextRank = nextRank && state.profile
    ? nextRank.xp_required - state.profile.total_xp
    : 0

  const refreshProfile = useCallback(async () => {
    if (!user) return
    const profile = await fetchAgentProfile(user.id)
    if (profile) {
      dispatch({ type: 'UPDATE_PROFILE', payload: profile })
      const cached = localStorage.getItem(CACHE_KEY)
      if (cached) {
        localStorage.setItem(CACHE_KEY, JSON.stringify({ ...JSON.parse(cached), profile }))
      }
    }
  }, [user])

  return (
    <AgentContext.Provider value={{ ...state, currentRank, nextRank, xpToNextRank, refreshProfile }}>
      {children}
    </AgentContext.Provider>
  )
}

export function useAgentContext() {
  const ctx = useContext(AgentContext)
  if (!ctx) throw new Error('useAgentContext must be used within AgentProvider')
  return ctx
}

'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import type {
  AgentProfile,
  AssignmentType,
  OperationResult,
} from '@/lib/types'
import { getRank, getNextRank, type RankTier } from '@/lib/ranks'
import { RANKS } from '@/lib/ranks'
import { XP } from '@/lib/scoring'

const STORAGE_KEY = 'dna.agent.v1'

function todayStr(): string {
  return new Date().toISOString().slice(0, 10)
}

function defaultAgent(alias: string): AgentProfile {
  return {
    alias,
    createdAt: Date.now(),
    xp: 0,
    totalAssignments: 0,
    bestStreak: 0,
    history: [],
    lastLoginDate: todayStr(),
    completedTraining: [],
    onLeaderboard: false,
  }
}

interface AgentContextValue {
  agent: AgentProfile | null
  hydrated: boolean
  rank: RankTier
  nextRank: RankTier | null
  recruit: (alias: string) => void
  addXp: (amount: number) => void
  logOperation: (result: OperationResult) => { rankedUp: boolean; from: RankTier; to: RankTier }
  completeTraining: (type: AssignmentType) => void
  setLeaderboardOptIn: (on: boolean) => void
  reset: () => void
}

const AgentContext = createContext<AgentContextValue | null>(null)

export function AgentProvider({ children }: { children: React.ReactNode }) {
  const [agent, setAgent] = useState<AgentProfile | null>(null)
  const [hydrated, setHydrated] = useState(false)

  // hydrate
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as AgentProfile
        // daily login bonus
        const today = todayStr()
        if (parsed.lastLoginDate !== today) {
          parsed.xp += XP.DAILY_LOGIN
          parsed.lastLoginDate = today
        }
        setAgent(parsed)
      }
    } catch {
      // ignore corrupt storage
    }
    setHydrated(true)
  }, [])

  // persist
  useEffect(() => {
    if (!hydrated) return
    if (agent) localStorage.setItem(STORAGE_KEY, JSON.stringify(agent))
  }, [agent, hydrated])

  const recruit = useCallback((alias: string) => {
    setAgent(defaultAgent(alias.trim().toUpperCase() || 'AGENT'))
  }, [])

  const addXp = useCallback((amount: number) => {
    setAgent((prev) => (prev ? { ...prev, xp: prev.xp + amount } : prev))
  }, [])

  const logOperation = useCallback(
    (result: OperationResult) => {
      let info = {
        rankedUp: false,
        from: RANKS[0],
        to: RANKS[0],
      }
      setAgent((prev) => {
        if (!prev) return prev
        const fromRank = getRank(prev.xp)
        const newXp = prev.xp + result.xpEarned
        const toRank = getRank(newXp)
        info = {
          rankedUp: toRank.id !== fromRank.id,
          from: fromRank,
          to: toRank,
        }
        return {
          ...prev,
          xp: newXp,
          totalAssignments: prev.totalAssignments + result.totalAssignments,
          bestStreak: Math.max(prev.bestStreak, result.bestStreak),
          history: [result, ...prev.history].slice(0, 50),
        }
      })
      return info
    },
    [],
  )

  const completeTraining = useCallback((type: AssignmentType) => {
    setAgent((prev) => {
      if (!prev) return prev
      if (prev.completedTraining.includes(type)) return prev
      return {
        ...prev,
        completedTraining: [...prev.completedTraining, type],
        xp: prev.xp + XP.TRAINING_MODULE,
      }
    })
  }, [])

  const setLeaderboardOptIn = useCallback((on: boolean) => {
    setAgent((prev) => (prev ? { ...prev, onLeaderboard: on } : prev))
  }, [])

  const reset = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    setAgent(null)
  }, [])

  const rank = useMemo(() => getRank(agent?.xp ?? 0), [agent?.xp])
  const nextRank = useMemo(() => getNextRank(agent?.xp ?? 0), [agent?.xp])

  const value = useMemo(
    () => ({
      agent,
      hydrated,
      rank,
      nextRank,
      recruit,
      addXp,
      logOperation,
      completeTraining,
      setLeaderboardOptIn,
      reset,
    }),
    [agent, hydrated, rank, nextRank, recruit, addXp, logOperation, completeTraining, setLeaderboardOptIn, reset],
  )

  return <AgentContext.Provider value={value}>{children}</AgentContext.Provider>
}

export function useAgent() {
  const ctx = useContext(AgentContext)
  if (!ctx) throw new Error('useAgent must be used within AgentProvider')
  return ctx
}

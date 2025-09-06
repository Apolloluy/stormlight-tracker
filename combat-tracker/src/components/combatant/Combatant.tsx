export type Combatant = {
  id: string
  active: boolean
  name: string
  icon?: string
  speed: 'fast'|'slow'
  combatant_type: string
  stats:{
    physical: {
      strength: number
      speed: number
    }
    cognitive: {
      intelligence: number
      willpower: number
    }
    spiritual: {
      awareness: number
      presence: number
    }
  }
  counters:{
    health: number
    focus: number
    investiture: number
  }
  movement: number
  senses:{
    sight: number
    hearing: number
    smell: number
  }
  skills: {
    physical: Record<string, number> | undefined
    cognitive: Record<string, number> | undefined
    spiritual: Record<string, number> | undefined
  }
  languages: string
  features: Record<string, string>[]
  actions: {
    action: CombantantAction[] | undefined
    bi_action: CombantantAction[] | undefined
    tri_action: CombantantAction[] | undefined
    reaction: CombantantAction[] | undefined
    free: CombantantAction[] | undefined
  }
  tactics?: string
}

export type CombantantAction = {
  name: string
  description: string
}

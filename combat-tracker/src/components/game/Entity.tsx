export type Entity = {
  id: string
  name: string
  icon?: string
  type: 'player'|'enemy'
  speed: 'fast'|'slow'
  statuses: string[]
  statusInput: string
  reactionUsed: boolean
  unconscious: boolean
  notes: string
}
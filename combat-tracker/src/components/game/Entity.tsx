export type Entity = {
  id: string
  name: string
  icon?: string
  type: 'player'|'enemy'|'boss'|'ally'
  speed: 'fast'|'slow'
  statuses: string[]
  statusInput: string
  reactionUsed: boolean
  unconscious: boolean
  notes: string
}
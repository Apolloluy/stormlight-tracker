export interface EntitySettings {
    type: EntityType,
    name: string,
    icon: string,
    turn: TurnType,
    disabled?: boolean
}

export enum EntityType {
    Player,
    Enemy
}

export enum TurnType {
    Fast,
    Slow
}
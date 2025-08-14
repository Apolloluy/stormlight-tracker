import React, { useState } from "react";
import { Entity } from "../../components/entity/Entity";
import { EntitySettings, EntityType, TurnType } from "../../models/EntityModels";

// Example initial data
const initialEntities: EntitySettings[] = [
  { name: "Kaladin", type: EntityType.Player, icon: "kaladin.png", turn: TurnType.Fast },
  { name: "Fused", type: EntityType.Enemy, icon: "fused.png", turn: TurnType.Slow },
  { name: "Jamsh", type: EntityType.Player, icon: "kaladin.png", turn: TurnType.Slow },
  { name: "Axehound", type: EntityType.Enemy, icon: "fused.png", turn: TurnType.Fast }
];

export const Encounter: React.FC = () => {
  const [entities, setEntities] = useState<EntitySettings[]>(initialEntities);

  // Update the type of a specific entity
  const changeTurn = (entity: EntitySettings) => {
    setEntities(prev =>
      prev.map(e =>
        e.name === entity.name
          ? { ...e, turn: e.turn === TurnType.Slow ? TurnType.Fast : TurnType.Slow }
          : e
      )
    );
  };

  const slowPlayers = entities.filter(e => e.turn === TurnType.Slow && e.type === EntityType.Player);
  const fastPlayers = entities.filter(e => e.turn === TurnType.Fast && e.type === EntityType.Player);
  const fastEnemies = entities.filter(e => e.turn === TurnType.Fast && e.type === EntityType.Enemy);
  const slowEnemies = entities.filter(e => e.turn === TurnType.Slow && e.type === EntityType.Enemy);

  return (
    <>
        <h1>Encounter Tracker</h1>
        <h2>Fast Turns</h2>
            {fastPlayers.map(entity => (<Entity key={entity.name} character={entity} changeTurn={changeTurn}/>))}
            {fastEnemies.map(entity => (<Entity key={entity.name} character={entity} changeTurn={changeTurn}/>))}

        <h2>Slow Turns</h2>
            {slowPlayers.map(entity => (<Entity key={entity.name} character={entity} changeTurn={changeTurn}/>))}
            {slowEnemies.map(entity => (<Entity key={entity.name} character={entity} changeTurn={changeTurn}/>))}
    </>
  );
};
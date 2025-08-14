import { EntitySettings, EntityType, TurnType } from '../../models/EntityModels';
import React from "react";
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

export interface EntityProps {
    character : EntitySettings,
    changeTurn: (entity: EntitySettings) => void
}


export const Entity : React.FC<EntityProps> = ({character, changeTurn}) => {
    const borderColor = character.type === EntityType.Enemy ? 'error.dark' : 'primary.dark';
    return (
        <>
            <Card sx={{ minWidth: 275, margin: 2, border: 1, borderColor: borderColor} }>
                <CardContent>
                    <Grid container alignItems="center" spacing={2}>
                        <Grid>
                            <Avatar alt={character.name} src={character.icon} />
                        </Grid>
                        <Grid>
                            <Typography sx={{ color: 'text.primary' }}>
                                {character.name}
                            </Typography>
                        </Grid>
                        <Grid alignItems="right">
                            <Button variant="outlined" onClick={() => changeTurn(character)}>{character.turn == TurnType.Slow ? 'Slow' : 'Fast'}</Button>
                        </Grid>
                    </Grid>
                    
                </CardContent>
            </Card>
        </>
    )
}

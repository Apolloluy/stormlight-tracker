import { ReactNode } from 'react'
import { ScanEye, ShieldPlus, CloudAlert, PlugZap, Battery, DatabaseZap, Link2Off, PersonStanding, MessageSquareOff, PartyPopper } from 'lucide-react'

export const DEFAULT_STATUSES = [
    'Afflicted',
    'Determined', 
    'Disoriented', 
    'Empowered', 
    'Exhausted', 
    'Focused', 
    'Invested', 
    'Immobilized', 
    'Prone', 
    'Slowed',
    'Stunned', 
    'Surprised', 
    //'Unconscious'
];

// Define which statuses are positive or negative
export const POSITIVE_STATUSES = ['Determined', 'Empowered', 'Focused',  'Invested'];
export const NEGATIVE_STATUSES = ['Afflicted', 'Disoriented', 'Exhausted', 'Immobilized', 'Prone', 'Slowed', 'Stunned', 'Surprised', ];

export const DEFAULT_STATUS_ICONS: Record<string, ReactNode> = {
    'Afflicted': <CloudAlert className="mr-1 size-4 text-slate-400"/>,
    'Determined':  <ShieldPlus className="mr-1 size-4 text-slate-400"/>,
    'Disoriented':  <CloudAlert className="mr-1 size-4 text-slate-400"/>,
    'Empowered': <PlugZap className="mr-1 size-4 text-slate-400"/>,
    'Exhausted':  <Battery className="mr-1 size-4 text-slate-400"/>,
    'Focused': <ScanEye className="mr-1 size-4 text-slate-400"/>,
    'Invested':  <DatabaseZap className="mr-1 size-4 text-slate-400"/>,
    'Immobilized': <Link2Off className="mr-1 size-4 text-slate-400"/>,
    'Prone':  <PersonStanding className="mr-1 size-4 text-slate-400"/>,
    'Slowed':  <Battery className="mr-1 size-4 text-slate-400"/>,
    'Stunned':  <MessageSquareOff className="mr-1 size-4 text-slate-400"/>,
    'Surprised':  <PartyPopper className="mr-1 size-4 text-slate-400"/>,
    //'Unconscious': () => <> </>
}
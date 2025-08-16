
import * as React from 'react'

export function Switch({ checked, onCheckedChange }:{ checked:boolean, onCheckedChange:(v:boolean)=>void }){
  return (
    <button
      onClick={()=>onCheckedChange(!checked)}
      aria-pressed={checked}
      className={'relative inline-flex h-6 w-11 items-center rounded-full transition-colors ' + (checked ? 'bg-cyan-600' : 'bg-slate-600')}
    >
      <span className={'inline-block h-5 w-5 transform rounded-full bg-white transition-transform ' + (checked ? 'translate-x-5' : 'translate-x-1')} />
    </button>
  )
}

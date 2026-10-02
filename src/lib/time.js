/** Display only. Authoritative local->UTC conversion happens on the server. */
export const deviceZone=()=>Intl.DateTimeFormat().resolvedOptions().timeZone||'UTC';
export const validZone=z=>{try{new Intl.DateTimeFormat('en',{timeZone:z}).format();return !!z;}catch{return false;}};
export const viewerZone=user=>validZone(user?.timezone)?user.timezone:deviceZone();
export function zoneOptions(current){let zones=[];try{zones=Intl.supportedValuesOf('timeZone');}catch{zones=['Asia/Karachi','America/New_York','America/Chicago','America/Denver','America/Los_Angeles','Europe/London','Asia/Dubai','Asia/Riyadh','Asia/Kolkata','Europe/Paris','Australia/Sydney','Pacific/Auckland'];}return [...new Set(['UTC',deviceZone(),...(current?[current]:[]),...zones])].sort();}
export function localDate(value=Date.now(),zone=deviceZone()){
 const p=Object.fromEntries(new Intl.DateTimeFormat('en-CA',{timeZone:zone,year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date(value)).map(x=>[x.type,x.value]));return `${p.year}-${p.month}-${p.day}`;
}
export function shiftDate(day,count){return new Date(Date.parse(`${day}T12:00:00Z`)+count*86400000).toISOString().slice(0,10);}
export const dayTitle=day=>new Intl.DateTimeFormat('en',{weekday:'long',month:'short',day:'numeric',timeZone:'UTC'}).format(new Date(`${day}T12:00:00Z`));
export function atZone(value,zone,options={}){if(!value)return 'Not scheduled';try{return new Intl.DateTimeFormat('en',{timeZone:zone||deviceZone(),weekday:'short',month:'short',day:'numeric',hour:'numeric',minute:'2-digit',timeZoneName:'short',...options}).format(new Date(value));}catch{return 'Time unavailable';}}
export const timeOnly=(value,zone)=>new Intl.DateTimeFormat('en',{timeZone:zone,hour:'numeric',minute:'2-digit'}).format(new Date(value));
export const rangeAt=(start,end,zone)=>`${atZone(start,zone)} – ${localDate(start,zone)===localDate(end,zone)?timeOnly(end,zone):atZone(end,zone)}`;
export const titleCase=s=>String(s||'').replace(/\b\p{L}/gu,c=>c.toUpperCase());
export async function allPages(api,path){const result=[];for(let p=1;p<=100;p++){const d=await api(`${path}${path.includes('?')?'&':'?'}page=${p}&limit=100`);result.push(...d.items);if(p>=d.pages)return result;}throw new Error('Too many records for this selector. Narrow your selection.');}

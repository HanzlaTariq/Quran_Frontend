let csrfToken=null,csrfPromise=null;
export function setCsrf(value){csrfToken=value||null;}
export async function csrf(){
 if(csrfToken)return csrfToken;
 if(!csrfPromise)csrfPromise=fetch('/api/auth/csrf',{credentials:'include',cache:'no-store'}).then(async r=>{const d=await r.json();if(!r.ok)throw new Error(d.message||'Could not establish a secure session.');csrfToken=d.csrf;return csrfToken;}).finally(()=>{csrfPromise=null;});
 return csrfPromise;
}
export async function api(path,{method='GET',body,signal}={}){
 const headers={'Accept':'application/json'};
 if(method!=='GET'){headers['Content-Type']='application/json';headers['X-CSRF-Token']=await csrf();}
 let response;
 try{response=await fetch(`/api${path}`,{method,credentials:'include',headers,body:body===undefined?undefined:JSON.stringify(body),signal,cache:'no-store'});}
 catch(e){if(e.name==='AbortError')throw e;throw new Error('Cannot reach the server. Start the backend and check your connection.');}
 const type=response.headers.get('content-type')||'';const data=type.includes('json')?await response.json():null;
 if(response.ok&&!data)throw new Error('The API returned a web page instead of JSON. Check the backend destination and API rewrite in frontend vercel.json.');
 if(!response.ok){const e=new Error(data?.message||`Request failed (${response.status}).`);e.status=response.status;if(response.status===401&&!path.startsWith('/auth/'))window.dispatchEvent(new Event('noor-session-expired'));if(response.status===403&&e.message.includes('token'))setCsrf(null);throw e;}
 if(data?.csrf)setCsrf(data.csrf);return data;
}
export const number=n=>new Intl.NumberFormat('en').format(n??0);
export const currency=(n,code='PKR')=>new Intl.NumberFormat('en-PK',{style:'currency',currency:code,minimumFractionDigits:0,maximumFractionDigits:2}).format(n||0);
export function dateTime(value,zone){if(!value)return 'Not scheduled';return new Intl.DateTimeFormat('en',{dateStyle:'medium',timeStyle:'short',timeZone:zone||undefined}).format(new Date(value));}
export function shortDate(value){return value?new Intl.DateTimeFormat('en',{day:'numeric',month:'short',year:'numeric'}).format(new Date(value)):'—';}
export const initials=name=>String(name||'Guest').trim().split(/\s+/).slice(0,2).map(x=>x[0]).join('').toUpperCase();
export const idOf=o=>String(o?._id||o||'');
export const normal=s=>String(s||'').normalize('NFKD').replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED\u0640\u0300-\u036f]/g,'').replace(/[أإآٱ]/g,'ا').replace(/ى/g,'ي').toLowerCase().trim();
export function storeGet(key,fallback){try{return JSON.parse(localStorage.getItem(key))??fallback;}catch{return fallback;}}
export function storeSet(key,value){try{localStorage.setItem(key,JSON.stringify(value));}catch{/* Private browser storage may be disabled. */}}
export function hrefForBookmark(ref){const p=ref.split(':');return p[0]==='quran'?`/quran/${p[1]}?ayah=${p[2]}`:`/hadith?book=${p[1]}&lang=${p[2]}&q=${p[3]}`;}
export function canonical(path){
 const [raw,query]=path.split('?');let p=raw.replace(/\/$/,'')||'/';
 if(p==='/admin/login')return '/login';
 if(/^\/(student|ulma|admin)(\/|$)/.test(p)){
  p=p.replace(/^\/(student|ulma|admin)/,'');if(!p)p='/dashboard';
  p=p.replace(/^\/chat(?:\/([^/]+))?$/,(_,id)=>`/messages${id?'?conversation='+id:''}`)
   .replace(/^\/reports\/monthly$/,'/reports').replace(/^\/current-enrollments$/,'/enrollments')
   .replace(/^\/(live-classes|timetable|schedule)$/,'/classes').replace(/^\/live-class\//,'/class/')
   .replace(/^\/payments$/,'/fees').replace(/^\/ulma$/,'/users?role=ulma')
   .replace(/^\/(profile|setting|availability)$/,'/settings');
 }
 return p+(query?(p.includes('?')?'&':'?')+query:'');
}

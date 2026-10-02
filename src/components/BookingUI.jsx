import React,{useState,useEffect,useMemo} from 'react';
import {api,initials} from '../lib/api.js';
import {countries} from '../lib/countries.js';
import {deviceZone,zoneOptions,atZone,rangeAt,titleCase} from '../lib/time.js';
import {Icon,Button,Alert} from './UI.jsx';
export function Avatar({user,size='normal'}){
 const [failed,setFailed]=useState(false);const id=user?._id;
 let src=user?.photoVersion>0&&user?.profileImage==='uploaded'?`/api/profiles/${id}/photo?v=${user.photoVersion}`:'';
 if(!src&&/^https:\/\//.test(user?.profileImage||''))src=user.profileImage;
 useEffect(()=>setFailed(false),[src]);
 return <span className={`person-avatar ${size}`}>{src&&!failed?<img src={src} alt={`${user?.name||'Teacher'} profile`} loading="lazy" onError={()=>setFailed(true)} referrerPolicy="no-referrer"/>:<span>{initials(user?.name)}</span>}</span>;
}
export function ZonePicker({value,onChange,id='timezone',label='Time zone',hint=true}){
 const options=useMemo(()=>zoneOptions(value),[value]);
 return <label className="field"><span>{label} *</span><input name="timezone" list={`${id}-options`} value={value} onChange={e=>onChange(e.target.value)} required maxLength={80} autoComplete="off" placeholder="America/New_York"/><datalist id={`${id}-options`}>{options.map(z=><option key={z} value={z}/>)}</datalist>{hint&&<small>Choose your city/region, not a fixed UTC offset. A country may have several time zones.</small>}</label>;
}
export function LocationFields({value,onChange,required=true,includeName=false,id='profile'}){
 const change=(key,v)=>onChange({...value,[key]:v});
 const countryList=countries.some(c=>c.name===value.country)?countries:[...(value.country?[{name:value.country,code:'saved'}]:[]),...countries];
 return <div className="form-grid">
  {includeName&&<label className="field"><span>Full name *</span><input value={value.name||''} required minLength={2} maxLength={80} autoComplete="name" onChange={e=>change('name',e.target.value)}/></label>}
  <label className="field"><span>Country {required&&'*'}</span><select value={value.country||''} required={required} onChange={e=>change('country',e.target.value)} autoComplete="country-name"><option value="">Choose your country</option>{countryList.map(c=><option key={c.code} value={c.name}>{c.name}</option>)}</select></label>
  <label className="field"><span>City / location</span><input value={value.city||''} maxLength={100} autoComplete="address-level2" placeholder="Your city, not your street address" onChange={e=>change('city',e.target.value)}/></label>
  <ZonePicker value={value.timezone||deviceZone()} onChange={v=>change('timezone',v)} id={`${id}-timezone`}/>
  <label className="field"><span>Languages *</span><input value={Array.isArray(value.languages)?value.languages.join(', '):(value.languages||'')} required maxLength={300} placeholder="English, Urdu, Arabic" onChange={e=>change('languages',e.target.value)}/><small>Separate languages with commas. This helps students find a compatible teacher.</small></label>
  <label className="field"><span>Gender</span><select value={value.gender||'unspecified'} onChange={e=>change('gender',e.target.value)}><option value="unspecified">Prefer not to say</option><option value="male">Male</option><option value="female">Female</option></select></label>
  <label className="field"><span>Phone number</span><input value={value.phone||''} type="tel" maxLength={30} autoComplete="tel" placeholder="Include country code" onChange={e=>change('phone',e.target.value)}/></label>
  <label className="field"><span>Age (optional)</span><input value={value.age??''} type="number" min="3" max="120" onChange={e=>change('age',e.target.value)}/></label>
 </div>;
}
export function DualTime({start,end,yourZone,teacherZone,studentZone}){
 const otherZones=[...new Set([teacherZone,studentZone].filter(z=>z&&z!==yourZone))];
 return <div className="dual-time"><div><Icon name="clock" size={16}/><span><strong>Your time · {yourZone}</strong><span>{end?rangeAt(start,end,yourZone):atZone(start,yourZone)}</span></span></div>{otherZones.map(z=><div key={z}><Icon name="users" size={16}/><span><strong>{z===teacherZone?'Teacher':'Student'} · {z}</strong><span>{end?rangeAt(start,end,z):atZone(start,z)}</span></span></div>)}</div>;
}
export function ZoneClocks({yourZone,teacherZone}){
 const [now,setNow]=useState(Date.now());useEffect(()=>{const t=setInterval(()=>setNow(Date.now()),30000);return()=>clearInterval(t);},[]);
 return <div className="zone-clocks"><div><span>Your current time</span><strong>{atZone(now,yourZone)}</strong><small>{yourZone}</small></div>{teacherZone&&<div><span>Teacher’s current time</span><strong>{atZone(now,teacherZone)}</strong><small>{teacherZone}</small></div>}</div>;
}
export function TeacherSummary({teacher,children,compact=false}){
 const u=teacher.user||{};
 return <article className={`teacher-profile-card ${compact?'compact':''}`}><div className="teacher-profile-top"><Avatar user={u} size={compact?'normal':'large'}/><div><span className="verified-label"><Icon name="shield" size={14}/> Approved teacher · email verified</span><h2>{u.name||'Teacher'}</h2><p>{[u.city,u.country].filter(Boolean).join(', ')||'Location not provided'}</p></div></div><div className="teacher-tags">{teacher.expertise?.slice(0,4).map(x=><span key={x}>{titleCase(x)}</span>)}{teacher.experience>0&&<span>{teacher.experience} years’ experience</span>}</div><p className="teacher-bio">{teacher.bio||'This teacher has not added a biography yet.'}</p><div className="teacher-facts"><span><Icon name="message" size={16}/>{u.languages?.length?u.languages.map(titleCase).join(', '):'Languages not provided'}</span><span><Icon name="clock" size={16}/>{u.timezone||'Time zone not set'}</span>{u.gender&&u.gender!=='unspecified'&&<span><Icon name="users" size={16}/>{titleCase(u.gender)}</span>}</div>{children&&<div className="teacher-card-actions">{children}</div>}</article>;
}
export function PhotoPicker({user,onSaved}){
 const [busy,setBusy]=useState(false),[error,setError]=useState('');
 async function upload(file){
  if(!file)return;setBusy(true);setError('');
  try{
   if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>5*1024*1024)throw new Error('Choose a JPG, PNG or WebP image smaller than 5 MB.');
   const source=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=()=>reject(new Error('The photo could not be read.'));reader.readAsDataURL(file);});
   const image=new Image();image.src=source;await image.decode();
   const canvas=document.createElement('canvas');canvas.width=canvas.height=384;const ctx=canvas.getContext('2d');if(!ctx)throw new Error('Your browser cannot process this photo.');
   const edge=Math.min(image.naturalWidth,image.naturalHeight);ctx.drawImage(image,(image.naturalWidth-edge)/2,(image.naturalHeight-edge)/2,edge,edge,0,0,384,384);
   const imageData=canvas.toDataURL('image/jpeg',0.85),d=await api('/auth/photo',{method:'POST',body:{image:imageData}});onSaved(d);
  }catch(e){setError(e.message);}finally{setBusy(false);}
 }
 return <div className="photo-picker"><Avatar user={user} size="large"/><div><strong>Your profile photo</strong><p>Square crop · saved in the database · no local upload folder needed.</p><label className={`btn outline ${busy?'disabled':''}`}><Icon name="plus" size={16}/>{busy?'Uploading…':'Choose photo'}<input type="file" accept="image/jpeg,image/png,image/webp" disabled={busy} onChange={e=>{upload(e.target.files?.[0]);e.target.value='';}}/></label>{user.profileImage==='uploaded'&&<Button type="button" variant="ghost" disabled={busy} onClick={async()=>{setBusy(true);try{const d=await api('/auth/photo',{method:'POST',body:{remove:true}});onSaved(d);}catch(e){setError(e.message);}finally{setBusy(false);}}}>Remove</Button>}</div>{error&&<Alert>{error}</Alert>}</div>;
}

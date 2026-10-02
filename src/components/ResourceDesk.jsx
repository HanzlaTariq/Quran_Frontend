import React,{useEffect,useRef,useState} from 'react';
import {api} from '../lib/api.js';
import {Icon,Button,Alert,Loading} from './UI.jsx';

const defaultResource={kind:'quran',surah:1,ayah:1,translation:'en'};
const collections=[['bukhari','Sahih al-Bukhari'],['muslim','Sahih Muslim'],['nawawi','Forty Hadith of an-Nawawi']];
const equal=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
/** Changing a reference never mounts, reloads or rekeys the Daily iframe. */
export default function ResourceDesk({lesson,teacher,onUpdate}){
  const [draft,setDraft]=useState(lesson.teachingResource||defaultResource),[follow,setFollow]=useState(true);
  const [notes,setNotes]=useState(lesson.sharedNotes||''),[dirty,setDirty]=useState(false),[baseVersion,setBaseVersion]=useState(lesson.resourceVersion||0);
  const [surahs,setSurahs]=useState([]),[quran,setQuran]=useState(null),[hadith,setHadith]=useState(null);
  const [libraryError,setLibraryError]=useState(''),[saveError,setSaveError]=useState(''),[loading,setLoading]=useState(false),[saving,setSaving]=useState(false),[retry,setRetry]=useState(0);
  const alive=useRef(true),scroll=useRef(null);
  const shared=lesson.teachingResource||defaultResource;
  const resource=!teacher&&follow?shared:draft;
  const editable=teacher&&['scheduled','ongoing'].includes(lesson.status)&&!lesson.isExpired;
  useEffect(()=>{alive.current=true;return()=>{alive.current=false;};},[]);
  useEffect(()=>{
    if((teacher&&!dirty)||(!teacher&&follow)){setDraft(shared);setNotes(lesson.sharedNotes||'');setBaseVersion(lesson.resourceVersion||0);}
  },[lesson.resourceVersion,lesson.sharedNotes,dirty,teacher,follow]);
  useEffect(()=>{
    const controller=new AbortController();
    api('/quran/surahs',{signal:controller.signal}).then(d=>setSurahs(d.items)).catch(()=>{});
    return()=>controller.abort();
  },[retry]);
  useEffect(()=>{
    if(resource.kind==='notes'){setLoading(false);setLibraryError('');return;}
    const controller=new AbortController();let current=true;setLoading(true);setLibraryError('');
    const path=resource.kind==='quran'?`/quran/surahs/${resource.surah}`:`/hadith?${new URLSearchParams({book:resource.book,lang:resource.lang,q:resource.hadithNumber||'1',limit:5})}`;
    // Small debounce avoids a request per keystroke when entering a Hadith number.
    const timer=setTimeout(()=>{
      api(path,{signal:controller.signal}).then(d=>{
        if(!current)return;
        if(resource.kind==='quran')setQuran(d);
        else setHadith({item:d.items.find(h=>String(h.hadithnumber)===String(resource.hadithNumber)),book:d.book,lang:d.lang});
        setLoading(false);
      }).catch(e=>{if(current&&e.name!=='AbortError'){setLibraryError(e.message);setLoading(false);}});
    },150);
    return()=>{current=false;clearTimeout(timer);controller.abort();};
  },[resource.kind,resource.surah,resource.book,resource.lang,resource.hadithNumber,retry]);
  useEffect(()=>{
    if(resource.kind!=='quran'||loading)return;
    const panel=scroll.current,verse=panel?.querySelector(`[data-ayah="${Number(resource.ayah)}"]`);
    if(panel&&verse)panel.scrollTo({top:Math.max(0,panel.scrollTop+verse.getBoundingClientRect().top-panel.getBoundingClientRect().top-12),behavior:'smooth'});
  },[resource.kind,resource.surah,resource.ayah,loading]);
  function choose(next){
    if(!teacher)setFollow(false);
    setDraft(next);setDirty(teacher?(!equal(next,shared)||notes!==(lesson.sharedNotes||'')):false);setSaveError('');
  }
  function tab(kind){
    if(resource.kind===kind)return;
    choose(kind==='quran'?{...defaultResource}:kind==='hadith'?{kind,book:'bukhari',lang:'eng',hadithNumber:'1'}:{kind:'notes'});
  }
  function reset(){setDirty(false);setDraft(shared);setNotes(lesson.sharedNotes||'');setBaseVersion(lesson.resourceVersion||0);setSaveError('');}
  async function share(){
    setSaving(true);setSaveError('');
    try{
      const data=await api(`/classes/${lesson._id}/resource`,{method:'PATCH',body:{resource:draft,sharedNotes:notes,version:baseVersion}});
      if(!alive.current)return;setDirty(false);setBaseVersion(data.resourceVersion);onUpdate(data);
    }catch(e){if(alive.current)setSaveError(e.message);}
    finally{if(alive.current)setSaving(false);}
  }
  const selected=quran?.ayahs?.find(a=>a.numberInSurah===Number(resource.ayah));
  const mismatch=teacher&&dirty&&baseVersion!==(lesson.resourceVersion||0);
  return <aside className="resource-desk panel" aria-label="Quran, Hadith and shared lesson notes">
    <div className="resource-heading"><div><span className="eyebrow">LEARN SIDE BY SIDE</span><h2>Open your reference.</h2></div><Icon name="book" size={24}/></div>
    <div className="resource-tabs" role="tablist" aria-label="Learning resources">
      {[['quran','Quran','book'],['hadith','Hadith','hadith'],['notes','Notes','file']].map(([kind,label,icon])=><button type="button" role="tab" aria-selected={resource.kind===kind} className={resource.kind===kind?'active':''} key={kind} onClick={()=>tab(kind)}><Icon name={icon} size={17}/>{label}</button>)}
    </div>
    <div className={`resource-sync ${!teacher&&follow?'following':''}`}>
      {teacher?<><span><Icon name={dirty?'edit':'check'} size={15}/>{dirty?'Unshared changes':'Shared lesson focus'}</span>{editable&&<Button variant="subtle" disabled={saving||!dirty||mismatch} onClick={share}>{saving?'Sharing…':'Share with student'}</Button>}</>:<><span><Icon name={follow?'lock':'book'} size={15}/>{follow?'Following teacher':'Browsing independently'}</span><button type="button" className="text-btn" onClick={()=>setFollow(!follow)}>{follow?'Browse myself':'Follow teacher'}</button></>}
    </div>
    {teacher&&dirty&&<div className="resource-reset"><span>{mismatch?'Another tab changed the lesson. Reload its focus before sharing.':'Your selections are a preview until you share.'}</span><button className="text-btn" onClick={reset}>Reset to shared</button></div>}
    {saveError&&<Alert>{saveError}</Alert>}
    {resource.kind==='quran'&&<>
      <div className="resource-controls">
        <label className="field resource-surah"><span>Surah</span><select value={resource.surah} onChange={e=>choose({...resource,surah:Number(e.target.value),ayah:1})}>{surahs.length?surahs.map(s=><option key={s.number} value={s.number}>{s.number}. {s.englishName}</option>):<option value={resource.surah}>Surah {resource.surah}</option>}</select></label>
        <label className="field"><span>Ayah</span><input type="number" min="1" max={quran?.number===resource.surah?quran.ayahs?.length:286} value={resource.ayah} onChange={e=>choose({...resource,ayah:e.target.value===''?'':Number(e.target.value)})}/></label>
        <label className="field resource-translation"><span>Translation</span><select value={resource.translation} onChange={e=>choose({...resource,translation:e.target.value})}><option value="none">Arabic only</option><option value="en">English</option><option value="ur">Urdu</option><option value="both">English & Urdu</option></select></label>
      </div>
      <div className="reference-navigation"><Button variant="subtle" icon="left" disabled={Number(resource.ayah)<=1} onClick={()=>choose({...resource,ayah:Number(resource.ayah)-1})}>Previous ayah</Button><span>{resource.surah}:{resource.ayah}</span><Button variant="subtle" disabled={!quran||Number(resource.ayah)>=quran.ayahs.length||Number(resource.ayah)<1} onClick={()=>choose({...resource,ayah:Number(resource.ayah)+1})}>Next ayah <Icon name="right" size={15}/></Button></div>
    </>}
    {resource.kind==='hadith'&&<div className="resource-controls hadith-controls">
      <label className="field resource-collection"><span>Collection</span><select value={resource.book} onChange={e=>choose({...resource,book:e.target.value,lang:e.target.value==='nawawi'&&resource.lang==='urd'?'eng':resource.lang,hadithNumber:'1'})}>{collections.map(([id,name])=><option key={id} value={id}>{name}</option>)}</select></label>
      <label className="field"><span>Hadith number</span><input inputMode="decimal" maxLength={12} value={resource.hadithNumber} onChange={e=>choose({...resource,hadithNumber:e.target.value})}/></label>
      <label className="field"><span>Language</span><select value={resource.lang} onChange={e=>choose({...resource,lang:e.target.value})}><option value="eng">English</option><option value="ara">Arabic</option>{resource.book!=='nawawi'&&<option value="urd">Urdu</option>}</select></label>
    </div>}
    {libraryError?<div className="resource-body"><Alert retry={()=>setRetry(v=>v+1)}>{libraryError}</Alert><p className="room-help">The reading library is installed separately from live video. Your call can continue while the academy restores its library.</p></div>:loading?<div className="resource-body"><Loading label="Opening the selected reference…"/></div>:resource.kind==='quran'&&quran?<>
      <div className="resource-surah-title"><strong dir="rtl" lang="ar">{quran.name}</strong><span>{quran.englishName} · {quran.ayahs.length} ayahs</span></div>
      <div className="resource-reading-scroll" ref={scroll}>
        {quran.ayahs.map(a=><article key={a.numberInSurah} data-ayah={a.numberInSurah} className={`class-ayah ${a.numberInSurah===Number(resource.ayah)?'selected':''}`}>
          <button type="button" className="class-ayah-label" onClick={()=>choose({...resource,ayah:a.numberInSurah})} aria-label={`Focus ayah ${quran.number}:${a.numberInSurah}`}>{quran.number}:{a.numberInSurah}{a.numberInSurah===Number(resource.ayah)&&<span>Current focus</span>}</button>
          <p className="class-ayah-arabic" lang="ar" dir="rtl">{a.text}</p>
          {['en','both'].includes(resource.translation)&&a.en&&<p className="class-ayah-en" lang="en">{a.en}</p>}
          {['ur','both'].includes(resource.translation)&&a.ur&&<p className="class-ayah-ur" lang="ur" dir="rtl">{a.ur}</p>}
        </article>)}
      </div>
      {selected?.audio&&<div className="class-audio"><span><Icon name="volume" size={15}/> Listen to focused ayah · headphones recommended</span><audio key={`${quran.number}:${selected.numberInSurah}`} controls preload="none" src={selected.audio} aria-label="Selected ayah recitation"/></div>}
      <p className="resource-source">Arabic text and translations: academy’s installed AlQuran.cloud editions. References stay visible for revision.</p>
    </>:resource.kind==='hadith'?<div className="resource-reading-scroll hadith-reading">
      {hadith?.item?<article><span className="hadith-reference">{hadith.book?.name} · Hadith {hadith.item.hadithnumber}</span><p lang={resource.lang==='ara'?'ar':resource.lang==='urd'?'ur':'en'} dir={resource.lang==='eng'?'ltr':'rtl'} className={resource.lang==='eng'?'class-hadith-text':'class-hadith-text arabic'}>{hadith.item.text}</p>{hadith.item.reference&&<p className="resource-source">Book {hadith.item.reference.book} · Reference {hadith.item.reference.hadith}</p>}<p className="resource-source">Installed Hadith API edition. Numbering and wording can differ by edition; verify the cited reference for scholarly use.</p></article>:<p className="resource-empty">No matching Hadith in this edition. Enter its exact number, including a decimal suffix where applicable.</p>}
    </div>:resource.kind==='notes'?<div className="shared-notes-body">
      <h3>Lesson notes</h3><p className="room-help">Written by the teacher and visible to the enrolled student.</p>
      {editable?<><label className="field"><span>Shared notes</span><textarea rows={14} maxLength={12000} value={notes} placeholder="Today's focus, pronunciation reminders, practice instructions…" onChange={e=>{setNotes(e.target.value);setDirty(true);}}/></label><small>{notes.length.toLocaleString()} / 12,000 characters · Share with student to save.</small></>:<div className="shared-notes-content">{lesson.sharedNotes||'No notes have been shared yet.'}</div>}
    </div>:null}
    {!teacher&&<p className="resource-footer">Browse any available reference without changing your teacher’s selection. Follow teacher returns you to the shared focus.</p>}
  </aside>;
}

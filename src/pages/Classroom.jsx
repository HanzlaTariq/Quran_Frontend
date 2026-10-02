import React,{useCallback,useEffect,useRef,useState} from 'react';
import {api,dateTime,idOf,initials} from '../lib/api.js';
import {Icon,Link,Button,Alert,Empty,Loading,PageHeader,Badge,Modal,DataForm} from '../components/UI.jsx';
import {DualTime} from '../components/BookingUI.jsx';
import ResourceDesk from '../components/ResourceDesk.jsx';
import '../classroom.css';

/** Credentials stay in component memory. The provider iframe is never keyed by resource state. */
export function embeddedRoomUrl(access){
  const url=new URL(access.roomUrl);
  if(access.provider!=='daily'||url.protocol!=='https:'||!/^[-a-z0-9]+\.daily\.co$/i.test(url.hostname)||url.port||url.username||url.password||url.search||url.hash||url.pathname!==`/${access.roomId}`||!/^quran-class-[a-f\d]{24}$/i.test(access.roomId)||typeof access.token!=='string'||access.token.length<20){
    throw new Error('The server did not return a valid private classroom.');
  }
  url.searchParams.set('t',access.token);
  return url.href;
}
const field=(name,label,type='text',extra={})=>({name,label,type,...extra});
export default function Classroom({app,id}){
  const teacher=app.state.user.role==='ulma',user=app.state.user;
  const [lesson,setLesson]=useState(null),[error,setError]=useState(''),[syncError,setSyncError]=useState('');
  const [busy,setBusy]=useState(''),[access,setAccess]=useState(null),[frameLoaded,setFrameLoaded]=useState(false);
  const [modal,setModal]=useState(null),[confirm,setConfirm]=useState(false),[wide,setWide]=useState(false);
  const revision=useRef(0),autoJoin=useRef(new URLSearchParams(location.search).get('join')==='1');
  const live=useRef(true),operation=useRef(false),fetching=useRef(false),lastVerified=useRef(Date.now());
  const refresh=useCallback(async()=>{
    if(operation.current||fetching.current)return;
    fetching.current=true;const epoch=revision.current;
    try{
      const data=await api(`/classes/${id}`,{signal:AbortSignal.timeout(12000)});
      if(!live.current||operation.current||epoch!==revision.current)return;
      lastVerified.current=Date.now();setLesson(data);setSyncError('');
      if(!data.canJoin)setAccess(null);
    }catch(e){
      if(!live.current||operation.current||epoch!==revision.current)return;
      setSyncError(e.message);
      if([401,403,404].includes(e.status)){setAccess(null);setLesson(null);}
      else if(Date.now()-lastVerified.current>20000)setAccess(null);
    }finally{fetching.current=false;}
  },[id]);
  useEffect(()=>{
    live.current=true;refresh();
    const timer=setInterval(refresh,3000);
    const focus=()=>refresh();window.addEventListener('focus',focus);
    let socket;
    const changed=event=>{if(!event?.classId||event.classId===id)refresh();};
    const unsubscribe=app.subscribeSocket?.(next=>{socket?.off('classes:changed',changed);socket=next;socket?.on('classes:changed',changed);});
    return()=>{live.current=false;clearInterval(timer);window.removeEventListener('focus',focus);socket?.off('classes:changed',changed);unsubscribe?.();};
  },[app,id,refresh]);
  useEffect(()=>{
    if(!access)return;
    const remaining=+new Date(access.expiresAt)-Date.now();
    if(remaining<=0){setAccess(null);refresh();return;}
    const timer=setTimeout(()=>{setAccess(null);refresh();},Math.min(remaining,2147483647));
    return()=>clearTimeout(timer);
  },[access,refresh]);
  useEffect(()=>{
    if(!access)return;
    const warn=e=>{e.preventDefault();e.returnValue='';};
    window.addEventListener('beforeunload',warn);return()=>window.removeEventListener('beforeunload',warn);
  },[access]);
  async function run(kind,action){
    if(operation.current)return;
    operation.current=true;revision.current++;setBusy(kind);setError('');
    try{await action();}catch(e){if(live.current)setError(e.message);}
    finally{operation.current=false;if(live.current){setBusy('');refresh();}}
  }
  async function openVideo(){
    const result=await api(`/classes/${id}/join`,{method:'POST',body:{}});
    const src=embeddedRoomUrl(result);
    if(live.current){setFrameLoaded(false);setAccess({src,expiresAt:result.expiresAt});}
  }
  const start=()=>run('start',async()=>{
    const data=await api(`/classes/${id}/start`,{method:'POST',body:{}});
    if(!live.current)return;setLesson(data);
    await openVideo();
  });
  const join=()=>run('join',openVideo);
  const end=()=>run('end',async()=>{
    const data=await api(`/classes/${id}/end`,{method:'POST',body:{}});
    if(!live.current)return;setAccess(null);setLesson(data);setConfirm(false);
    if(data.warning)setError(data.warning);else app.toast('Class ended for both participants.');
  });
  const cleanup=()=>run('cleanup',async()=>{
    const data=await api(`/classes/${id}/close-video`,{method:'POST',body:{}});
    if(!live.current)return;setLesson(data);if(data.warning)setError(data.warning);else app.toast('Video room closed.');
  });
  async function saveTeachingRecord(values){
    if(modal==='attendance'){
      await api('/attendance',{method:'POST',body:{...values,classId:id}});
      app.toast('Attendance saved for this class.');
    }else{
      await api('/assignments',{method:'POST',body:{...values,enrollment:idOf(lesson.enrollment),classId:id}});
      app.toast('Assignment is now visible to your student.');
    }
    if(live.current)setModal(null);
  }
  useEffect(()=>{
    if(autoJoin.current&&lesson?.canJoin&&!access&&!busy&&!syncError){autoJoin.current=false;join();}
  },[lesson?.canJoin,access,busy,syncError]);
  if(!lesson)return syncError?<Alert retry={refresh}>{syncError}</Alert>:<Loading label="Opening your classroom…"/>;
  const peer=teacher?lesson.student?.user:lesson.ulma?.user;
  const ended=['completed','cancelled','paused'].includes(lesson.status)||lesson.isExpired;
  const attendanceFields=[field('status','Attendance status','select',{required:true,options:['present','late','absent']}),field('remarks','Teacher remarks','textarea',{full:true,maxLength:1000})];
  const assignmentFields=[field('title','Assignment title','text',{required:true,full:true,minLength:2,maxLength:160}),field('description','Instructions','textarea',{required:true,full:true,minLength:5,maxLength:4000}),field('type','Practice type','select',{required:true,defaultValue:'recitation',options:['recitation','memorization','understanding','test']}),field('dueDate','Due date','date',{required:true})];
  return <div className={`live-learning-page ${wide?'workspace-wide':''}`}>
    <PageHeader eyebrow="YOUR PRIVATE LEARNING ROOM" title={lesson.topic} description={`${lesson.course?.name||'Quran lesson'} · ${dateTime(lesson.utcStart,user.timezone)}`}>
      <Badge status={lesson.status}>{lesson.status==='ongoing'&&!lesson.isExpired?'Live lesson':lesson.isExpired&&lesson.status==='ongoing'?'Time ended':lesson.status}</Badge>
      <Link app={app} to="/classes" className="btn outline">Timetable</Link>
    </PageHeader>
    {error&&<Alert>{error}</Alert>}
    {syncError&&<Alert retry={refresh}>Status could not be refreshed: {syncError} Reconnect before joining. An unverified open call panel will close after a connection timeout.</Alert>}
    <div className="room-information panel">
      <DualTime start={lesson.utcStart} end={lesson.utcEnd} yourZone={user.timezone} teacherZone={lesson.ulma?.user?.timezone} studentZone={lesson.student?.user?.timezone}/>
      <div className="room-participant-line"><span><Icon name="users" size={16}/>{lesson.ulma?.user?.name||'Teacher'} <small>Teacher</small></span><span>{lesson.student?.user?.name||'Student'} <small>Student</small></span><span className="room-security"><Icon name="lock" size={14}/> Enrolled participants only</span></div>
    </div>
    <div className="learning-workspace">
      <section className="video-workspace" aria-label="Live video classroom">
        <div className="workspace-toolbar"><span><Icon name="video" size={17}/><strong>Live classroom</strong></span><Button variant="subtle" onClick={()=>setWide(v=>!v)}>{wide?'Standard view':'Focus view'}</Button></div>
        <div className="daily-stage">
          {access?<>
            <iframe title="Private Daily classroom" src={access.src} allow="camera; microphone; display-capture; autoplay; fullscreen; speaker-selection" allowFullScreen referrerPolicy="no-referrer" onLoad={()=>setFrameLoaded(true)} />
            {!frameLoaded&&<div className="frame-loading" role="status"><span className="spinner"/> Loading the video panel…</div>}
          </>:<div className="room-waiting">
            <div className="room-orbit" aria-hidden="true"><span className="room-peer-avatar">{initials(peer?.name)}</span><span className="room-orbit-icon"><Icon name={ended?'book':lesson.canJoin?'video':'clock'} size={21}/></span></div>
            <span className="room-kicker">{ended?'LESSON RECORD':lesson.canJoin?'YOUR TEACHER HAS STARTED':'PREPARE FOR YOUR LESSON'}</span>
            <h2>{ended?'Keep your learning close.':lesson.canJoin?'Your classroom is ready.':teacher?'A meaningful lesson starts here.':'Waiting for your teacher.'}</h2>
            <p>{ended?'The live call is closed. You can still revisit the lesson resources and shared notes.':lesson.canJoin?`Join ${peer?.name||'your learning partner'} without leaving the academy.`:teacher?'Start your scheduled class to unlock your student’s Join Class button.':'Your class is scheduled. Join Class will appear only after your teacher starts it.'}</p>
            {!ended&&teacher&&lesson.canStart&&<Button icon="play" disabled={!!busy||!!syncError} onClick={start}>{busy==='start'?'Preparing private room…':'Start Class'}</Button>}
            {!ended&&lesson.canJoin&&<Button icon="video" disabled={!!busy||!!syncError} onClick={join}>{busy==='join'?'Opening classroom…':'Join Class'}</Button>}
            {!ended&&teacher&&lesson.status==='scheduled'&&!lesson.canStart&&<small>Start window: {dateTime(lesson.joinOpensAt,user.timezone)} — {dateTime(lesson.utcEnd,user.timezone)}</small>}
            {!ended&&!teacher&&!lesson.canJoin&&<span className="waiting-label"><span className="small-dot"/> Checking class status every 3 seconds</span>}
          </div>}
        </div>
        <div className="video-bottom-bar">
          <div><Icon name="shield" size={17}/><span>{access?'Camera & microphone controls are inside the video panel.':'Your camera and microphone remain off until you join.'}</span></div>
          <div className="video-bottom-actions">
            {access&&<Button variant="outline" onClick={()=>setAccess(null)}>Leave video</Button>}
            {teacher&&lesson.status==='ongoing'&&<Button variant="danger" disabled={!!busy} onClick={()=>setConfirm(true)}>End Class</Button>}
          </div>
        </div>
        {access&&<p className="room-help">Complete the video panel’s prejoin step to connect. Leaving video only closes this device’s panel; the teacher’s End Class closes the lesson for everyone.</p>}
        {teacher&&lesson.closePending&&<div className="cleanup-warning"><p>The lesson is closed to new joins. The video service still needs a closure retry.</p><Button variant="outline" disabled={!!busy} onClick={cleanup}>{busy==='cleanup'?'Closing…':'Retry video cleanup'}</Button></div>}
        <div className="lesson-tools panel">
          <div><span className="eyebrow">TEACHER & STUDENT SPACE</span><h3>Keep the lesson moving.</h3><p>{lesson.notes||'Practice, take notes, and revisit your references while staying in the classroom.'}</p></div>
          <div className="lesson-tool-actions">
            {teacher&&['ongoing','completed'].includes(lesson.status)&&<Button icon="checkList" variant="outline" onClick={()=>setModal('attendance')}>Mark attendance</Button>}
            {teacher&&['active','approved'].includes(lesson.enrollment?.status)&&<Button icon="plus" variant="outline" onClick={()=>setModal('assignment')}>Add assignment</Button>}
            <Link app={app} to="/assignments" className="text-link">{teacher?'Assignment records':'My assignments'} <Icon name="arrow" size={15}/></Link>
            <Link app={app} to="/attendance" className="text-link">{teacher?'Attendance records':'My attendance'} <Icon name="arrow" size={15}/></Link>
          </div>
        </div>
        <details className="room-technical"><summary>Room details & privacy</summary><p>Room ID: <code>{lesson.roomId}</code></p><p>Video is embedded here using Daily. Audio/video is handled by that provider; it is not self-hosted by this academy. This integration does not enable recording or transcription. Use HTTPS and permit camera/microphone access when prompted. Read your academy’s privacy notice before joining.</p><p>Attendance is explicitly recorded by your teacher, not automatically inferred from opening this page. Status and shared references refresh every 3 seconds, with earlier updates when live notifications are available.</p></details>
      </section>
      <ResourceDesk lesson={lesson} teacher={teacher} onUpdate={data=>{revision.current++;setLesson(data);}}/>
    </div>
    {modal&&<Modal title={modal==='attendance'?'Attendance for this class':'Create a class assignment'} onClose={()=>setModal(null)}><p className="modal-note">{lesson.topic} · {lesson.student?.user?.name}{modal==='attendance'?' — Mark the student’s actual attendance, not simply whether the class page opened.':' — The student can submit work from their Assignments page.'}</p><DataForm fields={modal==='attendance'?attendanceFields:assignmentFields} onSubmit={saveTeachingRecord} label={modal==='attendance'?'Save attendance':'Create assignment'}/></Modal>}
    {confirm&&<Modal title="End class for everyone?" busy={!!busy} onClose={()=>setConfirm(false)}><p>This closes new joins immediately and asks Daily to remove both participants. Shared references, notes, assignments and teacher-marked attendance stay saved.</p>{error&&<Alert>{error}</Alert>}<div className="modal-actions"><Button variant="outline" disabled={!!busy} onClick={()=>setConfirm(false)}>Keep teaching</Button><Button variant="danger" disabled={!!busy} onClick={end}>{busy==='end'?'Ending class…':'End for everyone'}</Button></div></Modal>}
  </div>;
}

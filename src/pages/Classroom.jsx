import React from 'react';
import {api,initials,dateTime} from '../lib/api.js';
import {DualTime} from '../components/BookingUI.jsx';
import {Icon,Link,Button,IconButton,PageHeader,Alert,Loading,Badge} from '../components/UI.jsx';
export default class Classroom extends React.Component{
 state={lesson:null,error:'',joined:false,joining:false,mic:true,camera:true,peerConnected:false,turn:false};
 local=React.createRef();remote=React.createRef();stream=null;pc=null;socket=null;remoteId=null;pendingIce=[];config=null;live=true;unsubscribe=null;poll=null;
 componentDidMount(){this.load();this.unsubscribe=this.props.app.subscribeSocket(this.attach);this.poll=setInterval(this.load,15000);}
 componentWillUnmount(){this.live=false;clearInterval(this.poll);this.leave(false);this.unsubscribe?.();this.detach();}
 load=async()=>{try{const lesson=await api(`/classes/${this.props.id}`);if(this.live){this.setState({lesson});if((['completed','cancelled','paused'].includes(lesson.status)||!lesson.canJoin)&&this.state.joined)this.leave();}}catch(e){if(this.live)this.setState({error:e.message});}};
 detach=()=>{this.socket?.off('class:signal',this.signal);this.socket?.off('class:left',this.peerLeft);this.socket?.off('class:status',this.status);this.socket?.off('disconnect',this.disconnected);};
 attach=socket=>{this.detach();this.socket=socket;if(socket){socket.on('class:signal',this.signal);socket.on('class:left',this.peerLeft);socket.on('class:status',this.status);socket.on('disconnect',this.disconnected);}};
 status=({status})=>{if(this.live)this.setState(s=>({lesson:{...s.lesson,status}}));if(status!=='ongoing')this.leave();};
 disconnected=()=>{if(this.state.joined){this.leave();if(this.live)this.setState({error:'The live connection was interrupted or reached its hosting duration limit. Rejoin when the connection returns.'});}};
 peerLeft=()=>{this.pc?.close();this.pc=null;this.remoteId=null;this.pendingIce=[];if(this.remote.current)this.remote.current.srcObject=null;if(this.live)this.setState({peerConnected:false});};
 emit=(event,payload)=>new Promise((resolve,reject)=>{if(!this.socket?.connected)return reject(new Error('The live connection is not ready.'));const t=setTimeout(()=>reject(new Error('Classroom request timed out. Try joining again.')),12000);this.socket.emit(event,payload,result=>{clearTimeout(t);result?.error?reject(new Error(result.error)):resolve(result);});});
 getPeer=target=>{
  if(this.pc&&this.remoteId===target)return this.pc;this.pc?.close();this.remoteId=target;const pc=new RTCPeerConnection(this.config);this.pc=pc;
  this.stream?.getTracks().forEach(track=>pc.addTrack(track,this.stream));
  pc.onicecandidate=e=>{if(e.candidate)this.emit('class:signal',{to:target,signal:{type:'candidate',candidate:e.candidate.toJSON()}}).catch(()=>{});};
  pc.ontrack=e=>{if(this.remote.current){this.remote.current.srcObject=e.streams[0]||new MediaStream([e.track]);this.remote.current.play().catch(()=>{});}if(this.live)this.setState({peerConnected:true});};
  pc.onconnectionstatechange=()=>{if(pc.connectionState==='failed'&&this.live)this.setState({error:'The media connection failed. A TURN server may be required for these networks. Rejoin after checking the connection.'});};
  return pc;
 };
 signal=async({from,signal})=>{
  if(!this.stream)return;
  try{const pc=this.getPeer(from);
   if(signal.type==='offer'){await pc.setRemoteDescription({type:'offer',sdp:signal.sdp});for(const c of this.pendingIce.splice(0))await pc.addIceCandidate(c);const answer=await pc.createAnswer();await pc.setLocalDescription(answer);await this.emit('class:signal',{to:from,signal:{type:'answer',sdp:answer.sdp}});}
   else if(signal.type==='answer'){await pc.setRemoteDescription({type:'answer',sdp:signal.sdp});for(const c of this.pendingIce.splice(0))await pc.addIceCandidate(c);}
   else if(signal.type==='candidate'){if(pc.remoteDescription)await pc.addIceCandidate(signal.candidate);else this.pendingIce.push(signal.candidate);}
  }catch(e){if(this.live)this.setState({error:`Media connection error: ${e.message}`});}
 };
 join=async()=>{
  this.setState({joining:true,error:''});
  try{
   const access=await api(`/classes/${this.props.id}/join`,{method:'POST',body:{}});
   if(access.kind==='external'){window.location.assign(access.url);return;}
   if(!navigator.mediaDevices?.getUserMedia)throw new Error('Camera and microphone access require HTTPS, or localhost on the same computer.');
   const config=await api('/rtc-config');this.config={iceServers:config.iceServers};this.setState({turn:config.turnConfigured});
   this.stream=await navigator.mediaDevices.getUserMedia({audio:true,video:{width:{ideal:1280},height:{ideal:720}}});
   if(!this.live){this.stream.getTracks().forEach(t=>t.stop());return;}
   if(this.local.current)this.local.current.srcObject=this.stream;
   const result=await this.emit('class:join',{classId:this.props.id});this.setState({joined:true,mic:true,camera:true});
   if(result.peers?.length){const peer=result.peers[0],pc=this.getPeer(peer.socketId),offer=await pc.createOffer();await pc.setLocalDescription(offer);await this.emit('class:signal',{to:peer.socketId,signal:{type:'offer',sdp:offer.sdp}});}
  }catch(e){this.leave();if(this.live)this.setState({error:e.name==='NotAllowedError'?'Camera or microphone permission was denied. Allow access in your browser, then rejoin.':e.message});}
  finally{if(this.live)this.setState({joining:false});}
 };
 leave=(update=true)=>{this.socket?.emit('class:leave');this.pc?.close();this.pc=null;this.remoteId=null;this.pendingIce=[];this.stream?.getTracks().forEach(t=>t.stop());this.stream=null;if(this.local.current)this.local.current.srcObject=null;if(this.remote.current)this.remote.current.srcObject=null;if(update&&this.live)this.setState({joined:false,peerConnected:false});};
 toggle=kind=>{const enabled=!this.state[kind];(kind==='mic'?this.stream?.getAudioTracks():this.stream?.getVideoTracks())?.forEach(t=>t.enabled=enabled);this.setState({[kind]:enabled});};
 start=async()=>{try{await api(`/classes/${this.props.id}`,{method:'PATCH',body:{status:'ongoing'}});this.load();}catch(e){this.setState({error:e.message});}};
 render(){const {app}=this.props,{lesson,error,joined,joining}=this.state;if(!lesson)return error?<Alert retry={this.load}>{error}</Alert>:<Loading label="Opening your classroom…"/>;const teacher=app.state.user.role==='ulma',peer=teacher?lesson.student?.user:lesson.ulma?.user;let external=null;try{const u=new URL(lesson.meetingLink);if(u.protocol==='https:')external=u.href;}catch{}
 return <><PageHeader eyebrow="YOUR LIVE CLASSROOM" title={lesson.topic} description={`${lesson.course?.name||'Lesson'} · ${dateTime(lesson.utcStart,app.state.user.timezone)}`}><Badge status={lesson.status}/><Link app={app} to="/classes" className="btn outline">Back to timetable</Link></PageHeader>{error&&<Alert>{error}</Alert>}<div className="panel lesson-time-panel"><DualTime start={lesson.utcStart} end={lesson.utcEnd} yourZone={app.state.user.timezone} teacherZone={lesson.ulma?.user?.timezone} studentZone={lesson.student?.user?.timezone}/>{lesson.status==='scheduled'&&!lesson.canStart&&<p className="muted">The teacher can start from {dateTime(lesson.joinOpensAt,app.state.user.timezone)}, until the lesson ends.</p>}</div>
 <div className="classroom-stage"><video ref={this.remote} autoPlay playsInline className="remote-video"/>{!this.state.peerConnected&&<div className="classroom-placeholder"><span className="call-avatar">{initials(peer?.name)}</span><h2>{peer?.name||'Your learning partner'}</h2><p>{joined?'Waiting for your learning partner to join…':lesson.status==='ongoing'?'The lesson is ready. Join when you’re comfortable.':lesson.status==='scheduled'?'Your teacher has not started this lesson yet.':'This lesson is no longer open.'}</p></div>}<div className="local-video"><video ref={this.local} autoPlay playsInline muted/><span>You {!this.state.camera&&'· Camera off'}</span></div><span className="classroom-label"><Icon name="lock" size={14}/>Participant-restricted classroom</span></div><div className="call-controls">{joined?<><IconButton name="mic" label={this.state.mic?'Mute microphone':'Unmute microphone'} aria-pressed={!this.state.mic} onClick={()=>this.toggle('mic')}/><IconButton name="video" label={this.state.camera?'Turn camera off':'Turn camera on'} aria-pressed={!this.state.camera} onClick={()=>this.toggle('camera')}/><Button variant="danger" icon="close" onClick={()=>this.leave()}>Leave call</Button></>:<>{teacher&&lesson.status==='scheduled'&&<Button icon="play" disabled={!lesson.canStart} onClick={this.start}>Start this lesson</Button>}{lesson.canJoin&&!external&&app.state.user.role!=='admin'&&<Button icon="video" onClick={this.join} disabled={joining||!app.state.connected}>{joining?'Joining…':'Join with camera & microphone'}</Button>}{external&&lesson.canJoin&&<Button variant="outline" onClick={this.join} disabled={joining}>Join external meeting ↗</Button>}</>}</div><div className="classroom-notes"><section className="panel"><SectionTitleFallback/><p>The built-in room is limited to the enrolled teacher and student. Media starts only after you grant browser permission. Calls are not recorded by this application. On Vercel, a hosting duration limit or a redeploy can close the live connection; rejoin when it reconnects.</p><p>Across restrictive mobile or campus networks, configure a TURN server in the backend. On a phone, camera access requires HTTPS; plain HTTP over a local Wi-Fi address is not enough.</p></section></div></>;
 }
}
function SectionTitleFallback(){return <h3>Before you join</h3>;}

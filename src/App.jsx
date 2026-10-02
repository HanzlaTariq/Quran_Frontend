import React from 'react';
import {io} from 'socket.io-client';
import {api,csrf,setCsrf,storeGet,storeSet,canonical,initials} from './lib/api.js';
import {Icon,IconButton,Link,Logo,Button,Modal,SearchInput,Empty,Loading,Boundary} from './components/UI.jsx';
import Auth from './pages/Auth.jsx';
import {Home,Dashboard} from './pages/Home.jsx';
import {QuranIndex,Reader,Hadith,Bookmarks,SearchPage} from './pages/Library.jsx';
import {Academy,Reports} from './pages/Academy.jsx';
import {Teachers,TeacherProfile,Booking,Enrollments,Timetable} from './pages/Scheduling.jsx';
import AccountSettings from './pages/AccountSettings.jsx';
import './booking.css';
import Messages from './pages/Messages.jsx';
import Classroom from './pages/Classroom.jsx';
const libraryNav=[['/quran','The Quran','book'],['/hadith','Hadith library','hadith'],['/bookmarks','Saved references','bookmark']];
const roleNav={
 student:[['/dashboard','Overview','grid'],['/courses','Explore courses','cap'],['/teachers','Find a teacher','users'],['/enrollments','My enrollments','checkList'],['/classes','My timetable','calendar'],['/assignments','Assignments','file'],['/progress','My progress','chart'],['/fees','Fees & payments','wallet'],['/messages','Messages','message']],
 ulma:[['/dashboard','Overview','grid'],['/classes','My timetable','calendar'],['/students','My students','users'],['/enrollments','Enrollments','cap'],['/assignments','Assignments','file'],['/attendance','Attendance','checkList'],['/reports','Monthly reports','chart'],['/messages','Messages','message']],
 admin:[['/dashboard','Academy overview','grid'],['/users','People & approvals','users'],['/courses','Courses','cap'],['/enrollments','Enrollments','checkList'],['/classes','Classes & timetable','calendar'],['/assignments','Assignments','file'],['/attendance','Attendance','checkList'],['/fees','Fee management','wallet'],['/reports','Reports','chart'],['/audit','Audit trail','shield']]
};
const access={enroll:['student'],dashboard:['student','ulma','admin'],enrollments:['student','ulma','admin'],classes:['student','ulma','admin'],class:['student','ulma','admin'],assignments:['student','ulma','admin'],progress:['student'],fees:['student','admin'],messages:['student','ulma'],attendance:['ulma','admin'],reports:['student','ulma','admin'],students:['ulma','admin'],users:['admin'],audit:['admin'],notifications:['student','ulma','admin'],settings:['student','ulma','admin']};
export default class App extends React.Component{
 state={path:canonical(location.pathname+location.search),user:null,authLoading:true,theme:storeGet('noor-theme','light'),menu:false,search:false,searchText:'',toast:null,connected:false,guestBookmarks:storeGet('noor-bookmarks',[]),academyName:'Noor Academy'};
 socket=null;listeners=new Set();toastTimer=null;live=true;
 componentDidMount(){
  if(this.state.path!==location.pathname+location.search)history.replaceState(null,'',this.state.path);
  document.documentElement.dataset.theme=this.state.theme;window.addEventListener('noor-session-expired',this.expired);window.addEventListener('popstate',this.pop);window.addEventListener('keydown',this.key);
  api('/auth/me').then(d=>{if(!this.live)return;this.setState({user:d.user,authLoading:false},()=>{if(d.user){this.setTheme(d.user.theme||this.state.theme);this.connectSocket();}});}).catch(()=>this.live&&this.setState({authLoading:false}));
  api('/public').then(d=>this.live&&this.setState({academyName:d.academyName||'Noor Academy'})).catch(()=>{});
 }
 componentWillUnmount(){this.live=false;clearTimeout(this.toastTimer);window.removeEventListener('noor-session-expired',this.expired);window.removeEventListener('popstate',this.pop);window.removeEventListener('keydown',this.key);this.socket?.disconnect();}
 expired=()=>{if(this.state.user){this.signedOut();this.toast('Your session has ended. Please sign in again.','error');}};
 pop=()=>this.setState({path:canonical(location.pathname+location.search),menu:false});
 key=e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();this.setState({search:!this.state.search});}if(e.key==='Escape')this.setState({menu:false});};
 navigate=path=>{const next=canonical(path);history.pushState(null,'',next);this.setState({path:next,menu:false,search:false});document.body.style.overflow='';window.scrollTo({top:0,behavior:'instant'});};
 toast=(message,kind='success')=>{clearTimeout(this.toastTimer);this.setState({toast:{message,kind}});this.toastTimer=setTimeout(()=>this.live&&this.setState({toast:null}),5000);};
 setTheme=theme=>{document.documentElement.dataset.theme=theme;storeSet('noor-theme',theme);this.setState({theme});};
 updateUser=patch=>this.setState(s=>({user:s.user?{...s.user,...patch}:null}));
 signedIn=(user,returnTo)=>{this.setState({user,authLoading:false},()=>{this.setTheme(user.theme||'light');this.connectSocket();const next=returnTo||new URLSearchParams(location.search).get('next');this.navigate(next&&next.startsWith('/')&&!next.startsWith('//')&&!next.includes('\\')?next:'/dashboard');this.toast('Welcome to your learning space.');});};
 signedOut=()=>{this.socket?.disconnect();this.socket=null;for(const f of this.listeners)f(null);setCsrf(null);this.setState({user:null,connected:false});this.navigate('/login');};
 logout=async()=>{try{await api('/auth/logout',{method:'POST',body:{}});this.signedOut();}catch(e){this.toast(e.message,'error');}};
 connectSocket=async()=>{try{const token=await csrf();if(!this.state.user)return;this.socket?.disconnect();this.socket=io({path:'/socket.io',transports:['websocket'],withCredentials:true,auth:{csrf:token},reconnection:true,reconnectionDelay:1500,reconnectionDelayMax:10000});this.socket.on('connect',()=>this.live&&this.setState({connected:true}));this.socket.on('disconnect',()=>this.live&&this.setState({connected:false}));this.socket.on('connect_error',()=>this.live&&this.setState({connected:false}));for(const f of this.listeners)f(this.socket);}catch{this.setState({connected:false});}};
 subscribeSocket=fn=>{this.listeners.add(fn);fn(this.socket);return()=>this.listeners.delete(fn);};
 bookmarks=()=>this.state.user?.bookmarks||this.state.guestBookmarks;
 toggleBookmark=async ref=>{const current=this.bookmarks(),remove=current.includes(ref);try{if(this.state.user){const d=await api('/bookmarks',{method:'POST',body:{ref,remove}});this.updateUser({bookmarks:d.bookmarks});}else{const next=remove?current.filter(x=>x!==ref):[...current,ref];storeSet('noor-bookmarks',next);this.setState({guestBookmarks:next});}this.toast(remove?'Reference removed.':'Reference saved.');}catch(e){this.toast(e.message,'error');}};
 navLink=([path,label,icon])=>{const current=this.state.path.split('?')[0];return <Link app={this} to={path} key={path} className={`nav-link ${current===path||(path==='/quran'&&current.startsWith('/quran/'))?'active':''}`} aria-current={current===path?'page':undefined}><Icon name={icon} size={19}/><span>{label}</span>{path==='/hadith'&&<small className="new-pill">NEW</small>}</Link>;};
 content=()=>{
  const full=this.state.path,path=full.split('?')[0],part=path.split('/').filter(Boolean),page=part[0]||'home',user=this.state.user;
  if(access[page]){
   if(this.state.authLoading)return <Loading label="Checking your secure session…"/>;
   if(!user)return <Auth app={this} mode="login" returnTo={full}/>;
   if(!access[page].includes(user.role))return <Empty icon="shield" title="This page belongs to another role" text="Your account does not have permission to access this area."><Link app={this} to="/dashboard" className="btn">Back to your overview</Link></Empty>;
  }
  if(page==='home')return <Home app={this}/>;
  if(['login','register','forgot-password','reset-password'].includes(page))return <Auth key={page} app={this} mode={page}/>;
  if(page==='dashboard')return <Dashboard key={user._id} app={this}/>;
  if(page==='quran')return part[1]?<Reader key={full} app={this} number={part[1]}/>:<QuranIndex app={this}/>;
  if(page==='hadith')return <Hadith key={full} app={this}/>;
  if(page==='bookmarks')return <Bookmarks app={this}/>;
  if(page==='search')return <SearchPage key={full} app={this}/>;
  if(page==='messages')return <Messages key={user._id} app={this}/>;
  if(page==='class'&&part[1])return <Classroom key={part[1]} app={this} id={part[1]}/>;
  if(page==='teachers')return part[1]?<TeacherProfile key={full} app={this} id={part[1]}/>:<Teachers key={full} app={this}/>;
  if(page==='enroll')return <Booking key={full} app={this}/>;
  if(page==='enrollments')return <Enrollments key={user._id} app={this}/>;
  if(page==='classes')return <Timetable key={user._id} app={this}/>;
  if(page==='settings')return <AccountSettings key={user._id} app={this}/>;
  if(page==='reports'||page==='progress')return <Reports key={`${page}-${user._id}`} progress={page==='progress'} app={this}/>;
  if(['courses','teachers','enrollments','classes','attendance','assignments','fees','users','students','notifications','audit'].includes(page))return <Academy key={`${full}-${user?._id||'guest'}`} app={this} type={page}/>;
  return <Empty icon="search" title="This page has moved" text="Choose a section from the menu to find your way back."><Link app={this} to="/" className="btn">Return home</Link></Empty>;
 };
 render(){const {user,path,menu,theme}=this.state,authPage=/^\/(login|register|forgot-password|reset-password)/.test(path)||(!user&&!this.state.authLoading&&!!access[path.split('?')[0].split('/')[1]]),current=path.split('?')[0];const nav=user?roleNav[user.role]:[['/','Discover','home'],['/courses','Explore courses','cap'],['/teachers','Our teachers','users']];
  return <><a className="skip-link" href="#main-content">Skip to content</a>{authPage?<main id="main-content"><Boundary key={path}>{this.content()}</Boundary></main>:<div className="app-shell">{menu&&<button className="sidebar-overlay" aria-label="Close navigation" onClick={()=>this.setState({menu:false})}/>}<aside className={`sidebar ${menu?'open':''}`} aria-label="Main navigation"><div className="sidebar-brand"><Link app={this} to="/" aria-label="Noor Academy home"><Logo name={this.state.academyName}/></Link><button className="icon-btn sidebar-close" aria-label="Close menu" onClick={()=>this.setState({menu:false})}><Icon name="close"/></button></div><div className="sidebar-scroll"><div className="nav-label">{user?'YOUR ACADEMY':'YOUR LEARNING SPACE'}</div><nav>{nav.map(this.navLink)}</nav><div className="nav-divider"/><div className="nav-label">READ & REFLECT</div><nav>{libraryNav.map(this.navLink)}</nav>{user&&<><div className="nav-divider"/><nav>{this.navLink(['/notifications','Notifications','bell'])}{this.navLink(['/settings','Settings','settings'])}</nav></>}{!user&&<div className="sidebar-note"><span>✧</span><h3>A little every day.</h3><p>Make room for a meaningful connection.</p><Link app={this} to="/register">Begin your journey <Icon name="arrow" size={15}/></Link></div>}</div><footer className="sidebar-footer">{user?<><span className="avatar">{initials(user.name)}</span><div><strong>{user.name}</strong><small>{user.role==='ulma'?'Teacher':user.role}</small></div><IconButton name="logout" label="Sign out" onClick={this.logout}/></>:<Link app={this} to="/login" className="sidebar-signin"><Icon name="lock" size={18}/>Sign in to your space <Icon name="arrow" size={17}/></Link>}</footer></aside><div className="app-main"><header className="topbar"><div className="topbar-left"><button className="icon-btn menu-button" aria-label="Open navigation" aria-expanded={menu} onClick={()=>this.setState({menu:!menu})}><Icon name="menu"/></button><span className="breadcrumb"><Icon name="home" size={16}/><Icon name="right" size={12}/>{current==='/'?'Discover':current.startsWith('/quran')?'The Quran':current==='/hadith'?'Hadith library':current.split('/')[1]?.replaceAll('-',' ')}</span><span className="mobile-brand">Noor<span>.</span></span></div><button className="topbar-search" onClick={()=>this.setState({search:true})}><Icon name="search" size={17}/><span>Search Quran, Hadith, courses…</span><kbd>⌘ K</kbd></button><div className="topbar-actions"><IconButton name={theme==='dark'?'sun':'moon'} label={theme==='dark'?'Switch to light theme':'Switch to dark theme'} onClick={()=>this.setTheme(theme==='dark'?'light':'dark')}/><button className="icon-btn mobile-search" aria-label="Open search" onClick={()=>this.setState({search:true})}><Icon name="search"/></button>{user?<><Link app={this} to="/notifications" className="icon-btn" aria-label="Notifications"><Icon name="bell"/></Link><Link app={this} to="/settings" className="avatar topbar-avatar" aria-label="Account settings">{initials(user.name)}</Link></>:<Link app={this} to="/register" className="btn topbar-join">Start learning <Icon name="arrow" size={16}/></Link>}</div></header><main className={`main-content ${current==='/messages'?'messages-page':''} ${current.startsWith('/quran/')?'reading-page':''}`} id="main-content"><Boundary key={path}>{this.content()}</Boundary></main><footer className="app-footer"><span>{this.state.academyName} <i>·</i> Learn with intention.</span><span>Quran · Hadith · Guided learning</span></footer></div><nav className="bottom-nav" aria-label="Mobile shortcuts">{[[user?'/dashboard':'/',user?'Overview':'Discover',user?'grid':'home'],['/quran','Quran','book'],['/hadith','Hadith','hadith'],[user&&user.role!=='admin'?'/messages':'/courses',user&&user.role!=='admin'?'Messages':'Courses',user&&user.role!=='admin'?'message':'cap']].map(([to,label,icon])=><Link app={this} to={to} key={to} className={current===to?'active':''}><Icon name={icon} size={21}/><small>{label}</small></Link>)}<button onClick={()=>this.setState({menu:true})} aria-label="Open menu"><Icon name="menu" size={21}/><small>More</small></button></nav></div>}
  {this.state.search&&<Modal title="What would you like to find?" onClose={()=>this.setState({search:false})}><SearchInput value={this.state.searchText} onChange={searchText=>this.setState({searchText})} autoFocus onSubmit={()=>{if(this.state.searchText.trim().length>=2)this.navigate(`/search?q=${encodeURIComponent(this.state.searchText.trim())}`);}} placeholder="A word, phrase, or Quran reference…"/><p className="search-help">Search Arabic, English or Urdu Quran text, Hadith collections, and published courses. Try a reference such as <strong>2:255</strong>.</p><div className="search-shortcuts">{[['The Quran','/quran','book'],['Hadith library','/hadith','hadith'],['Explore courses','/courses','cap']].map(([label,to,icon])=><Link app={this} to={to} key={to}><Icon name={icon} size={20}/>{label}<Icon name="arrow" size={16}/></Link>)}</div><Button icon="search" disabled={this.state.searchText.trim().length<2} onClick={()=>this.navigate(`/search?q=${encodeURIComponent(this.state.searchText.trim())}`)}>Search the library</Button></Modal>}
  {this.state.toast&&<div className={`toast ${this.state.toast.kind}`} role={this.state.toast.kind==='error'?'alert':'status'}><Icon name={this.state.toast.kind==='error'?'info':'check'} size={19}/><span>{this.state.toast.message}</span><IconButton name="close" label="Dismiss notification" onClick={()=>this.setState({toast:null})}/></div>}</>;
 }
}

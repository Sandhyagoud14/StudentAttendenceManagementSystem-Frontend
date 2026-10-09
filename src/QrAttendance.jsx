import React,{useEffect,useRef,useState}from'react';
import{QRCodeSVG}from'qrcode.react';
import{checkInWithQr,createAttendanceSession}from'./services/api.js';

export function QrScanPanel({username}){
 const[scanning,setScanning]=useState(false),[token,setToken]=useState(''),[busy,setBusy]=useState(false),[message,setMessage]=useState('');
 async function submit(value=token){const clean=value.trim();if(!clean){setMessage('Scan or enter an attendance code first.');return}let code=clean;try{code=new URL(clean).searchParams.get('session')||clean}catch{}setBusy(true);setMessage('');try{const result=await checkInWithQr(code,username);setMessage(`Attendance recorded for ${result.subjectName}.`);setScanning(false);setToken('')}catch(error){setMessage(error.response?.data?.message||'Could not record attendance.')}finally{setBusy(false)}}
 return <section className="panel qr-panel"><div className="panel-heading"><div><span className="eyebrow">QUICK CHECK-IN</span><h3>Scan class QR code</h3></div></div><p className="muted">Ask your faculty member to display an active attendance QR code. It expires after two minutes.</p><div className="qr-actions"><button className="button primary" onClick={()=>{setMessage('');setScanning(value=>!value)}}>{scanning?'Stop camera':'Open camera scanner'}</button><label className="qr-token-label">Or enter code<input value={token} onChange={e=>setToken(e.target.value)} placeholder="Session code"/></label><button className="button subtle" disabled={busy||!token.trim()} onClick={()=>submit()}>{busy?'Submitting…':'Check in'}</button></div>{scanning&&<div className="qr-scanner" key="attendance-scanner"><QrCamera onCode={submit} onError={setMessage}/></div>}{message&&<div className={message.startsWith('Attendance recorded')?'alert success':'alert error'}>{message}</div>}</section>
}

export function QrSessionControl({subject,username,date}){
 const[session,setSession]=useState(null),[busy,setBusy]=useState(false),[error,setError]=useState(''),[now,setNow]=useState(Date.now());
 useEffect(()=>{if(!session)return;const timer=window.setInterval(()=>setNow(Date.now()),1000);return()=>window.clearInterval(timer)},[session]);
 async function start(){if(!subject)return;setBusy(true);setError('');try{setSession(await createAttendanceSession({subjectId:subject.id,attendanceDate:date,facultyUsername:username}));setNow(Date.now())}catch(e){setError(e.response?.data?.message||'Could not create an attendance session.')}finally{setBusy(false)}}
 const secondsLeft=session?Math.max(0,Math.ceil((Date.parse(session.expiresAt)-now)/1000)):0;
 return <section className="qr-session"><div><b>QR attendance</b><p className="muted">Create a two-minute check-in code for this class.</p></div><button className="button subtle" disabled={!subject||busy} onClick={start}>{busy?'Creating…':session&&secondsLeft?'Refresh QR code':'Start QR session'}</button>{error&&<div className="alert error">{error}</div>}{session&&secondsLeft>0&&<div className="qr-display"><QRCodeSVG value={session.token} size={190} level="M" includeMargin/><div><b>{session.subjectName}</b><span>{secondsLeft}s remaining</span><small>Students scan this code from their logged-in account.</small></div></div>}{session&&secondsLeft===0&&<div className="alert error">This QR session expired. Start a new one to continue.</div>}</section>
}

function QrCamera({onCode,onError}){
 const handlers=useRef({onCode,onError});handlers.current={onCode,onError};
 useEffect(()=>{let active=true,handled=false,scanner;import('html5-qrcode').then(({Html5QrcodeScanner})=>{if(!active)return;scanner=new Html5QrcodeScanner('qr-reader',{fps:10,qrbox:{width:240,height:240},rememberLastUsedCamera:true},false);scanner.render(text=>{if(!active||handled)return;handled=true;scanner.clear().catch(()=>{});handlers.current.onCode(text)},()=>{})}).catch(error=>handlers.current.onError(error.message||'Camera scanner could not start.'));return()=>{active=false;scanner?.clear().catch(error=>handlers.current.onError(error.message))}},[]);
 return <div id="qr-reader"/>
}

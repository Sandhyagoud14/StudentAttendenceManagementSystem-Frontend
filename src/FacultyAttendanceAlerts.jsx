import React from'react';

export default function FacultyAttendanceAlerts({students,subjects,attendance}){
 const risks=students.flatMap(student=>subjects.flatMap(subject=>{
  if((subject.department&&subject.department!==student.department)||(subject.year&&subject.year!==student.year)||(subject.section&&subject.section!==student.section))return[];
  const records=attendance.filter(row=>row.studentId===student.id&&row.subjectId===subject.id).sort((a,b)=>b.attendanceDate.localeCompare(a.attendanceDate));
  if(!records.length)return[];
  const attended=records.filter(row=>row.status==='PRESENT').length,percentage=Math.round(attended*1000/records.length)/10;
  let consecutiveAbsences=0;for(const row of records){if(row.status!=='ABSENT')break;consecutiveAbsences++}
  if(percentage>=80&&consecutiveAbsences<2)return[];
  return[{student,subject,percentage,consecutiveAbsences,risk:percentage<75?'CRITICAL':'WARNING'}]
 })).sort((a,b)=>a.percentage-b.percentage);
 return <section className="panel faculty-alert-panel"><div className="panel-heading"><div><span className="eyebrow">SMART ATTENDANCE ALERTS</span><h3>Students needing attention</h3></div><span className="count-pill">{risks.length} alerts</span></div>{risks.length?<div className="faculty-alert-list">{risks.map(item=><div className="faculty-alert-row" key={`${item.student.id}-${item.subject.id}`}><div><b>{item.student.name}</b><small>{item.student.studentId} · {item.subject.subjectName}</small></div><strong className={item.risk==='CRITICAL'?'risk-text-critical':'risk-text-warning'}>{item.percentage}%</strong><span>{item.consecutiveAbsences>=2?`${item.consecutiveAbsences} consecutive absences`:item.risk==='CRITICAL'?'Below 75%':'Below 80%'}</span></div>)}</div>:<div className="empty">No students currently meet the alert conditions.</div>}</section>
}

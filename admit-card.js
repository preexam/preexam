import {auth,db,doc,getDoc,signInWithEmailAndPassword,escapeHtml,showMsg} from "./firebase.js";
document.querySelector("#admitLogin").onsubmit=async e=>{
 e.preventDefault(); const n=admitApp.value.trim().toUpperCase(), p=admitPass.value, msg=admitMsg;
 try{
  const a=await getDoc(doc(db,"applications",n)); if(!a.exists()){showMsg(msg,"Application not found.",true);return;}
  await signInWithEmailAndPassword(auth,`${n.toLowerCase()}@candidate.examportal.local`,p);
  const s=await getDoc(doc(db,"admitCards",n));
  if(!s.exists()||s.data().published!==true){showMsg(msg,"Admit Card has not been released yet.",true);return;}
  const x=s.data();
  admitResult.innerHTML=`<div class="card admit"><h2>${escapeHtml(x.examName||"Admit Card")}</h2><div class="form-grid">
  <p><b>Name</b><br>${escapeHtml(x.candidateName||a.data().personal?.fullName)}</p><p><b>Application No.</b><br>${escapeHtml(n)}</p>
  <p><b>Roll Number</b><br>${escapeHtml(x.rollNumber||"")}</p><p><b>Exam Date</b><br>${escapeHtml(x.examDate||"")}</p>
  <p><b>Reporting Time</b><br>${escapeHtml(x.reportingTime||"")}</p><p><b>Exam Time</b><br>${escapeHtml(x.examTime||"")}</p>
  <p><b>Centre Code</b><br>${escapeHtml(x.centreCode||"")}</p><p><b>Centre</b><br>${escapeHtml(x.centreName||"")}<br>${escapeHtml(x.centreAddress||"")}</p>
  <p><b>Issue Date</b><br>${escapeHtml(x.issueDate||"")}</p><p><b>Version</b><br>${escapeHtml(x.version||"1.0")}</p></div>
  <h3>Important Instructions</h3><p>${escapeHtml(x.instructions||"Carry a valid photo ID and follow the instructions issued by the examination authority.")}</p>
  <button class="btn primary" onclick="window.print()">Download / Print PDF</button></div>`;
 }catch(err){showMsg(msg,"Unable to open admit card. Check login details.",true);}
};

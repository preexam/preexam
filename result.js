import {auth,db,doc,getDoc,signInWithEmailAndPassword,escapeHtml,showMsg} from "./firebase.js";
document.querySelector("#resultLogin").onsubmit=async e=>{
 e.preventDefault();const n=resultApp.value.trim().toUpperCase(),p=resultPass.value,msg=resultMsg;
 try{
  const a=await getDoc(doc(db,"applications",n));if(!a.exists()){showMsg(msg,"Application not found.",true);return;}
  await signInWithEmailAndPassword(auth,`${n.toLowerCase()}@candidate.examportal.local`,p);
  const s=await getDoc(doc(db,"results",n));if(!s.exists()||s.data().published!==true){showMsg(msg,"Result has not been published yet.",true);return;}
  const x=s.data(), q=x.questionWise||[];
  resultBox.innerHTML=`<div class="card scorecard"><h2>${escapeHtml(x.examName||"Examination Result")}</h2>
  <div class="form-grid"><p><b>Candidate Name</b><br>${escapeHtml(x.candidateName||a.data().personal?.fullName)}</p><p><b>Application Number</b><br>${escapeHtml(n)}</p>
  <p><b>Roll Number</b><br>${escapeHtml(x.rollNumber||"")}</p><p><b>Exam/Post</b><br>${escapeHtml(x.examPost||"")}</p>
  <p><b>Marks Obtained</b><br><span class=result-big>${escapeHtml(x.finalMarks??x.marksObtained??"")}</span></p><p><b>Maximum Marks</b><br>${escapeHtml(x.maximumMarks??"")}</p>
  <p><b>Percentage</b><br>${escapeHtml(x.percentage??"")}</p><p><b>Status</b><br><span class=pill>${escapeHtml(x.status||"")}</span></p>
  <p><b>Rank</b><br>${escapeHtml(x.rank??"")}</p><p><b>Percentile</b><br>${escapeHtml(x.percentile??"")}</p></div>
  ${x.sections?.length?`<h3>Section-wise Result</h3><div class=table-wrap><table><tr><th>Section</th><th>Maximum</th><th>Obtained</th></tr>${x.sections.map(s=>`<tr><td>${escapeHtml(s.name)}</td><td>${escapeHtml(s.maximum)}</td><td>${escapeHtml(s.obtained)}</td></tr>`).join("")}</table></div>`:""}
  ${x.questionWiseEnabled&&q.length?`<h3>Question-wise Result</h3><div class=table-wrap><table><tr><th>Q</th><th>Your Answer</th><th>Correct</th><th>Status</th><th>Marks</th></tr>${q.map(r=>`<tr><td>${escapeHtml(r.question)}</td><td>${escapeHtml(r.candidateAnswer)}</td><td>${escapeHtml(r.correctAnswer)}</td><td>${escapeHtml(r.status)}</td><td>${escapeHtml(r.marks)}</td></tr>`).join("")}</table></div>`:""}
  <button class="btn primary" onclick="window.print()">Download / Print Result PDF</button></div>`;
 }catch(err){showMsg(msg,"Unable to open result. Check login details.",true);}
};

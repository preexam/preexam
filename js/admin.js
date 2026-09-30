import {
 auth,db,collection,doc,getDoc,getDocs,setDoc,addDoc,updateDoc,query,orderBy,limit,serverTimestamp,
 signInWithEmailAndPassword,signOut,onAuthStateChanged,escapeHtml,showMsg
} from "./firebase.js";

const loginCard=document.querySelector("#adminLoginCard"), app=document.querySelector("#adminApp"), panel=document.querySelector("#panel");
document.querySelector("#adminLogin").onsubmit=async e=>{e.preventDefault();try{await signInWithEmailAndPassword(auth,adminEmail.value,adminPassword.value);}catch(err){showMsg(adminMsg,"Admin login failed.",true)}};
document.querySelector("#logout").onclick=()=>signOut(auth);

onAuthStateChanged(auth,async user=>{
 if(!user){loginCard.hidden=false;app.hidden=true;return}
 const a=await getDoc(doc(db,"admins",user.uid)); if(!a.exists()||a.data().active!==true){await signOut(auth);showMsg(adminMsg,"This account is not an active admin.",true);return}
 loginCard.hidden=true;app.hidden=false;adminWelcome.textContent=`Signed in as ${a.data().name||user.email}`;
 await dashboard();
 document.querySelectorAll("[data-tab]").forEach(b=>b.onclick=()=>loadTab(b.dataset.tab));
 loadTab("exams");
});

async function dashboard(){
 const [c,ap,pa,ac,re]=await Promise.all(["candidates","applications","payments","admitCards","results"].map(async x=>(await getDocs(collection(db,x))).size));
 stats.innerHTML=[["Candidates",c],["Applications",ap],["Payments",pa],["Results",re]].map(x=>`<div class=stat><span>${x[0]}</span><b>${x[1]}</b></div>`).join("");
}

async function loadTab(tab){
 if(tab==="exams")return exams();
 if(tab==="applications")return applications();
 if(tab==="payments")return payments();
 if(tab==="admit")return admit();
 if(tab==="results")return results();
 if(tab==="centres")return centres();
 if(tab==="fields")return fields();
 if(tab==="notices")return notices();
 if(tab==="audit")return audit();
}

async function exams(){
 panel.innerHTML=`<h2>Exam Management</h2><form id=examForm class=form-grid>
<label>Exam Name<input name=examName required></label><label>Exam Code<input name=examCode></label>
<label>Application Start<input name=applicationStart type=datetime-local></label><label>Application Last Date<input name=applicationEnd type=datetime-local></label>
<label>Payment Last Date<input name=paymentEnd type=datetime-local></label><label>Exam Date<input name=examDate type=date></label>
<label>Application Fee<input name=fee type=number></label><label>Exam Language<input name=language value="English"></label>
<label>Exam Mode<select name=mode><option>Online</option><option>Offline</option><option>Hybrid</option></select></label>
<label>Admit Card Release Date<input name=admitRelease type=date></label><label>Result Release Date<input name=resultRelease type=date></label>
</div><button class="btn primary">Create / Save Exam</button><p id=examMsg class=message></p></form><div id=examList></div>`;
 examForm.onsubmit=async e=>{e.preventDefault();const v=Object.fromEntries(new FormData(examForm));await setDoc(doc(db,"exams",v.examCode||"default"),{...v,createdAt:serverTimestamp()});showMsg(examMsg,"Exam saved.");listExams();};
 listExams();
}
async function listExams(){const s=await getDocs(collection(db,"exams"));examList.innerHTML=`<h3>Existing Exams</h3>`+s.docs.map(d=>`<div class=card><b>${escapeHtml(d.data().examName||d.id)}</b> — ${escapeHtml(d.id)} — ${escapeHtml(d.data().mode||"")}</div>`).join("");}

async function applications(){
 const s=await getDocs(query(collection(db,"applications"),orderBy("createdAt","desc"),limit(100)));
 panel.innerHTML=`<h2>Applications</h2><div class=table-wrap><table><tr><th>Application</th><th>Name</th><th>Status</th><th>Payment</th><th>Action</th></tr>${s.docs.map(d=>{const x=d.data();return `<tr><td>${escapeHtml(d.id)}</td><td>${escapeHtml(x.personal?.fullName||"")}</td><td>${escapeHtml(x.status||"")}</td><td>${escapeHtml(x.paymentStatus||"")}</td><td><button class="btn" onclick="window.open('application-dashboard.html?admin=${d.id}','_blank')">Open</button></td></tr>`}).join("")}</table></div>`;
}
async function payments(){
 const s=await getDocs(collection(db,"payments"));
 panel.innerHTML=`<h2>Payments</h2><div class=table-wrap><table><tr><th>Application</th><th>Status</th><th>Transaction</th><th>Amount</th></tr>${s.docs.map(d=>{const x=d.data();return `<tr><td>${escapeHtml(x.applicationNumber)}</td><td>${escapeHtml(x.status)}</td><td>${escapeHtml(x.transactionId)}</td><td>${escapeHtml(x.amount)}</td></tr>`}).join("")}</table></div>`;
}
async function admit(){
 panel.innerHTML=`<h2>Admit Card Management</h2><p>Admit cards are created as drafts from submitted applications. Use the form below to publish one.</p><form id=admitForm class=form-grid>
<label>Application Number<input name=applicationNumber required></label><label>Exam Name<input name=examName></label><label>Roll Number<input name=rollNumber></label><label>Exam Date<input name=examDate type=date></label><label>Reporting Time<input name=reportingTime></label><label>Exam Time<input name=examTime></label><label>Centre Code<input name=centreCode></label><label>Centre Name<input name=centreName></label><label>Centre Address<input name=centreAddress></label><label>Issue Date<input name=issueDate type=date></label><label>Version<input name=version value="1.0"></label><label>Instructions<textarea name=instructions></textarea></label>
</div><label class=check><input name=published type=checkbox> Publish immediately</label><button class="btn primary">Save Admit Card</button><p id=admitMsg class=message></p></form>`;
 admitForm.onsubmit=async e=>{e.preventDefault();const v=Object.fromEntries(new FormData(admitForm));v.published=admitForm.published.checked;await setDoc(doc(db,"admitCards",v.applicationNumber),{...v,updatedAt:serverTimestamp()});showMsg(admitMsg,"Admit card saved.");};
}
async function results(){
 panel.innerHTML=`<h2>Result Management</h2><p>Supports manual result entry and offline result data. For bulk Excel/CSV, parse the file in a server-side/import utility and write the same result document structure.</p>
<form id=resultForm class=form-grid><label>Application Number<input name=applicationNumber required></label><label>Candidate Name<input name=candidateName></label><label>Roll Number<input name=rollNumber></label><label>Exam/Post<input name=examPost></label><label>Marks Obtained<input name=marksObtained type=number step=any></label><label>Maximum Marks<input name=maximumMarks type=number step=any></label><label>Percentage<input name=percentage type=number step=any></label><label>Rank<input name=rank type=number></label><label>Percentile<input name=percentile></label><label>Status<select name=status><option>Qualified</option><option>Not Qualified</option><option>Pass</option><option>Fail</option></select></label></div>
<label class=check><input name=published type=checkbox> Publish</label><button class="btn primary">Save Result</button><p id=resultMsg class=message></p></form>`;
 resultForm.onsubmit=async e=>{e.preventDefault();const v=Object.fromEntries(new FormData(resultForm));v.published=resultForm.published.checked;v.authUid=(await getDoc(doc(db,"applications",v.applicationNumber))).data()?.authUid;await setDoc(doc(db,"results",v.applicationNumber),{...v,updatedAt:serverTimestamp()});showMsg(resultMsg,"Result saved.");};
}
async function centres(){
 panel.innerHTML=`<h2>Exam Centre Management</h2><form id=centreForm class=form-grid><label>Centre Code<input name=code required></label><label>Centre Name<input name=name required></label><label>Address<input name=address></label><label>City<input name=city></label><label>District<input name=district></label><label>State<input name=state></label><label>PIN<input name=pin></label><label>Capacity<input name=capacity type=number></label></div><button class="btn primary">Save Centre</button><p id=centreMsg class=message></p></form>`;
 centreForm.onsubmit=async e=>{e.preventDefault();const v=Object.fromEntries(new FormData(centreForm));await setDoc(doc(db,"centres",v.code),{...v,createdAt:serverTimestamp()});showMsg(centreMsg,"Centre saved.");};
}
async function fields(){
 panel.innerHTML=`<h2>Application Form Builder</h2><p>Master fields are pre-built. Create additional configurable fields here.</p><form id=fieldForm class=form-grid><label>Field Name<input name=name required></label><label>Type<select name=type><option>Text</option><option>Number</option><option>Date</option><option>Dropdown</option><option>Radio</option><option>Checkbox</option><option>Textarea</option><option>Yes/No</option><option>Multi-select</option><option>File Upload</option></select></label><label class=check><input name=visible type=checkbox checked> Visible</label><label class=check><input name=required type=checkbox> Required</label></div><button class="btn primary">Add Field</button><p id=fieldMsg class=message></p></form>`;
 fieldForm.onsubmit=async e=>{e.preventDefault();const v=Object.fromEntries(new FormData(fieldForm));v.visible=fieldForm.visible.checked;v.required=fieldForm.required.checked;await addDoc(collection(db,"customFields"),{...v,createdAt:serverTimestamp()});showMsg(fieldMsg,"Custom field added.");};
}
async function notices(){
 panel.innerHTML=`<h2>Notice Management</h2><form id=noticeForm><label>Title<input name=title required></label><label>Content<textarea name=content required></textarea></label><label class=check><input name=active type=checkbox checked> Active</label><button class="btn primary">Publish Notice</button><p id=noticeMsg class=message></p></form>`;
 noticeForm.onsubmit=async e=>{e.preventDefault();const v=Object.fromEntries(new FormData(noticeForm));v.active=noticeForm.active.checked;await addDoc(collection(db,"notices"),{...v,createdAt:serverTimestamp()});showMsg(noticeMsg,"Notice published.");};
}
async function audit(){
 const s=await getDocs(query(collection(db,"auditLogs"),orderBy("createdAt","desc"),limit(100)));
 panel.innerHTML=`<h2>Activity / Audit Log</h2><div class=table-wrap><table><tr><th>Admin</th><th>Action</th><th>Candidate</th><th>Time</th></tr>${s.docs.map(d=>{const x=d.data();return `<tr><td>${escapeHtml(x.admin)}</td><td>${escapeHtml(x.action)}</td><td>${escapeHtml(x.candidate||"")}</td><td>${escapeHtml(x.time||"")}</td></tr>`}).join("")}</table></div>`;
}

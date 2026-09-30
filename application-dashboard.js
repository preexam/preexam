import {auth,db,doc,getDoc,setDoc,updateDoc,serverTimestamp,signOut,showMsg,escapeHtml,getSettings} from "./firebase.js";
const appNo=sessionStorage.getItem("candidateApp"); const root=document.querySelector("#dash");
if(!appNo){location.href="application.html";throw new Error("No application");}
const snap=await getDoc(doc(db,"applications",appNo)); if(!snap.exists()){root.innerHTML="<div class=card>Application not found.</div>";throw 0;}
const a=snap.data(), settings=await getSettings();
const sec=settings.formSections||{};
root.innerHTML=`<div class="card"><h1>Application Dashboard</h1><p>Application Number: <b>${escapeHtml(appNo)}</b></p><p>Status: <b>${escapeHtml(a.status||"Incomplete")}</b></p></div>
<form id="appForm" class="card">
${sec.personal?`<h2 class=section-title>1. Personal Details</h2><div class=form-grid>
<label>Full Name<input name="fullName" value="${escapeHtml(a.personal?.fullName||"")}" required></label>
<label>Father's Name<input name="fatherName" value="${escapeHtml(a.personal?.fatherName||"")}"></label>
<label>Mother's Name<input name="motherName" value="${escapeHtml(a.personal?.motherName||"")}"></label>
<label>Date of Birth<input name="dob" type=date value="${escapeHtml(a.personal?.dob||"")}" required></label>
<label>Gender<select name="gender"><option>Male</option><option>Female</option><option>Other</option></select></label>
<label>Category<select name="category"><option>UR</option><option>OBC</option><option>SC</option><option>ST</option><option>EWS</option></select></label>
<label>Marital Status<select name="maritalStatus"><option>Unmarried</option><option>Married</option></select></label>
<label>Nationality<input name="nationality" value="Indian"></label>
<label>Domicile / State<input name="domicile" value="${escapeHtml(a.personal?.domicile||"")}"></label>
<label>Aadhaar Number<input name="aadhaar" maxlength=12 value="${escapeHtml(a.personal?.aadhaar||"")}"></label>
<label>Other ID Type<input name="otherIdType" value="${escapeHtml(a.personal?.otherIdType||"")}"></label>
<label>Other ID Number<input name="otherIdNumber" value="${escapeHtml(a.personal?.otherIdNumber||"")}"></label>
<label>Exam/Post Applied For<input name="examPost" value="${escapeHtml(a.personal?.examPost||"")}"></label>
<label>Exam Language/Medium<input name="examLanguage" value="${escapeHtml(a.personal?.examLanguage||"")}"></label>
<label>Guardian Name<input name="guardianName" value="${escapeHtml(a.personal?.guardianName||"")}"></label>
<label>Guardian Relationship<input name="guardianRelation" value="${escapeHtml(a.personal?.guardianRelation||"")}"></label>
<label>Guardian Occupation<input name="guardianOccupation" value="${escapeHtml(a.personal?.guardianOccupation||"")}"></label>
<label>Guardian Annual Income<input name="guardianIncome" value="${escapeHtml(a.personal?.guardianIncome||"")}"></label>
</div>`:""}
${sec.address?`<h2 class=section-title>2. Address Details</h2><div class=form-grid>
<label>House/Building No.<input name="house" value="${escapeHtml(a.address?.house||"")}"></label><label>Village/Town/City<input name="city" value="${escapeHtml(a.address?.city||"")}"></label>
<label>Post Office<input name="postOffice" value="${escapeHtml(a.address?.postOffice||"")}"></label><label>Police Station<input name="policeStation" value="${escapeHtml(a.address?.policeStation||"")}"></label>
<label>District<input name="district" value="${escapeHtml(a.address?.district||"")}"></label><label>State<input name="state" value="${escapeHtml(a.address?.state||"")}"></label><label>PIN Code<input name="pin" value="${escapeHtml(a.address?.pin||"")}"></label>
</div>`:""}
${sec.education?`<h2 class=section-title>3. Education</h2><div class=form-grid>
<label>10th Board<input name="board10" value="${escapeHtml(a.education?.board10||"")}"></label><label>10th Passing Year<input name="year10" value="${escapeHtml(a.education?.year10||"")}"></label>
<label>10th Roll Number<input name="roll10" value="${escapeHtml(a.education?.roll10||"")}"></label><label>10th Percentage/CGPA<input name="marks10" value="${escapeHtml(a.education?.marks10||"")}"></label>
<label>12th Board<input name="board12" value="${escapeHtml(a.education?.board12||"")}"></label><label>12th Passing Year<input name="year12" value="${escapeHtml(a.education?.year12||"")}"></label>
<label>12th Roll Number<input name="roll12" value="${escapeHtml(a.education?.roll12||"")}"></label><label>12th Percentage/CGPA<input name="marks12" value="${escapeHtml(a.education?.marks12||"")}"></label>
<label>Graduation / Other Qualification<input name="graduation" value="${escapeHtml(a.education?.graduation||"")}"></label><label>University<input name="university" value="${escapeHtml(a.education?.university||"")}"></label>
</div>`:""}
${sec.category?`<h2 class=section-title>4. Reservation / Other</h2><div class=form-grid>
<label>EWS Status<input name="ews" value="${escapeHtml(a.category?.ews||"")}"></label><label>OBC-NCL Status<input name="obcNcl" value="${escapeHtml(a.category?.obcNcl||"")}"></label>
<label>Certificate Number<input name="certificateNo" value="${escapeHtml(a.category?.certificateNo||"")}"></label><label>Certificate Issue Date<input name="certificateDate" type=date value="${escapeHtml(a.category?.certificateDate||"")}"></label>
<label>Issuing Authority<input name="certificateAuthority" value="${escapeHtml(a.category?.certificateAuthority||"")}"></label><label>Employment Status<input name="employment" value="${escapeHtml(a.category?.employment||"")}"></label>
</div>`:""}
${sec.documents?`<h2 class=section-title>5. Documents</h2><p class=muted>Document metadata and upload hooks are prepared. Connect Firebase Storage for production uploads.</p>`:""}
${sec.declaration?`<h2 class=section-title>6. Declaration</h2><label class=check><input id="declare" type=checkbox ${a.declarationAccepted?"checked":""}> I declare that the information furnished by me is true and correct.</label>`:""}
<div class=actions><button class="btn" type=submit>Save Application</button><button class="btn primary" type=button id="finalSubmit">Final Submit</button><button class="btn" type=button id="print">Print / Save Application PDF</button></div><p id="msg" class=message></p></form>`;
appForm.onsubmit=async e=>{e.preventDefault();await save(false)}; finalSubmit.onclick=()=>save(true); print.onclick=()=>window.print();
async function save(final=false){
 const f=new FormData(appForm); const v=Object.fromEntries(f.entries());
 const personal={fullName:v.fullName,fatherName:v.fatherName,motherName:v.motherName,dob:v.dob,gender:v.gender,category:v.category,maritalStatus:v.maritalStatus,nationality:v.nationality,domicile:v.domicile,aadhaar:v.aadhaar,otherIdType:v.otherIdType,otherIdNumber:v.otherIdNumber,examPost:v.examPost,examLanguage:v.examLanguage,guardianName:v.guardianName,guardianRelation:v.guardianRelation,guardianOccupation:v.guardianOccupation,guardianIncome:v.guardianIncome};
 const education={board10:v.board10,year10:v.year10,roll10:v.roll10,marks10:v.marks10,board12:v.board12,year12:v.year12,roll12:v.roll12,marks12:v.marks12,graduation:v.graduation,university:v.university};
 const address={house:v.house,city:v.city,postOffice:v.postOffice,policeStation:v.policeStation,district:v.district,state:v.state,pin:v.pin};
 const category={ews:v.ews,obcNcl:v.obcNcl,certificateNo:v.certificateNo,certificateDate:v.certificateDate,certificateAuthority:v.certificateAuthority,employment:v.employment};
 const update={personal,address,education,category,declarationAccepted:document.querySelector("#declare")?.checked||false,updatedAt:serverTimestamp()};
 if(final){update.status="Final Submitted";update.finalSubmittedAt=serverTimestamp();}
 await updateDoc(doc(db,"applications",appNo),update); showMsg(document.querySelector("#msg"),final?"Application finally submitted.":"Application saved.");
}
logout.onclick=async()=>{await signOut(auth);sessionStorage.clear();location.href="application.html"};

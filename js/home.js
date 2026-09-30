import {db,collection,getDocs,query,where,orderBy,limit,escapeHtml} from "./firebase.js";
const el=document.querySelector("#noticeList");
try{
 const snap=await getDocs(query(collection(db,"notices"),where("active","==",true),orderBy("createdAt","desc"),limit(10)));
 el.innerHTML=snap.empty?'<div class="muted">No notices published.</div>':snap.docs.map(d=>{const x=d.data();return `<div class="card"><b>${escapeHtml(x.title)}</b><p>${escapeHtml(x.content)}</p></div>`}).join("");
}catch(e){el.innerHTML='<div class="muted">Notices are unavailable until Firebase is configured.</div>'}

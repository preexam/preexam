import { auth, db, storage } from "../firebase-config.js";
import {
  collection, doc, getDoc, getDocs, setDoc, addDoc, updateDoc, query, where, orderBy, limit,
  serverTimestamp, Timestamp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";
import {
  createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

export { auth, db, storage, collection, doc, getDoc, getDocs, setDoc, addDoc, updateDoc, query, where, orderBy, limit, serverTimestamp, Timestamp,
  createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged };

export const clean = v => String(v ?? "").trim();
export function showMsg(el,msg,error=false){ if(el){el.textContent=msg; el.className="message"+(error?" danger-text":""); } }
export async function getSettings(){
  const s=await getDoc(doc(db,"settings","portal"));
  return s.exists()?s.data():defaultSettings;
}
export const defaultSettings={
  portalName:"Government Exam Portal",
  activeExamId:"default",
  examName:"Sample Government Examination",
  applicationOpen:true,
  admitCardPublished:false,
  resultPublished:false,
  formSections:{
    personal:true,address:true,education:true,category:true,other:true,photo:true,documents:true,declaration:true
  }
};
export function appNo(){
  const d=new Date(), p=`${d.getFullYear().toString().slice(-2)}${String(d.getMonth()+1).padStart(2,"0")}`;
  return `EXAM${p}${Math.floor(100000+Math.random()*899999)}`;
}
export function escapeHtml(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));}

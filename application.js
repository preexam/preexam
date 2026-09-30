import {
 auth,db,doc,getDoc,setDoc,addDoc,collection,query,where,getDocs,serverTimestamp,
 createUserWithEmailAndPassword,signInWithEmailAndPassword,signOut,clean,showMsg,appNo
} from "./firebase.js";

let otpDemo="123456";

document.querySelector("#sendOtp").onclick=()=>{otpDemo=String(Math.floor(100000+Math.random()*900000)); alert("Demo OTP: "+otpDemo);};

document.querySelector("#registerForm").onsubmit=async e=>{
 e.preventDefault(); const msg=document.querySelector("#regMsg");
 const name=clean(regName.value), dob=regDob.value, mobile=clean(regMobile.value), password=regPassword.value;
 if(otp.value!==otpDemo){showMsg(msg,"Invalid OTP.",true);return;}
 try{
   // Firebase Auth requires an email identifier. A deterministic internal email keeps the candidate login
   // compatible with the requested Application Number + Password flow.
   const applicationNumber=appNo();
   const internalEmail=`${applicationNumber.toLowerCase()}@candidate.examportal.local`;
   const cred=await createUserWithEmailAndPassword(auth,internalEmail,password);
   const candidate={
     applicationNumber,authUid:cred.user.uid,name,dob,mobile,
     status:"Registered",createdAt:serverTimestamp()
   };
   await setDoc(doc(db,"candidates",cred.user.uid),candidate);
   await setDoc(doc(db,"applications",applicationNumber),{
     applicationNumber,authUid:cred.user.uid,candidateId:cred.user.uid,
     personal:{fullName:name,dob,mobile},
     status:"Application Incomplete",paymentStatus:"Pending",
     createdAt:serverTimestamp()
   });
   showMsg(msg,`Registration successful. Application Number: ${applicationNumber}`);
   loginApp.value=applicationNumber; regPassword.value="";
 }catch(err){showMsg(msg,err.message,true);}
};

document.querySelector("#loginForm").onsubmit=async e=>{
 e.preventDefault(); const msg=document.querySelector("#loginMsg"); const number=clean(loginApp.value).toUpperCase();
 try{
   const snap=await getDoc(doc(db,"applications",number));
   if(!snap.exists()){showMsg(msg,"Application Number not found.",true);return;}
   const a=snap.data(); const internalEmail=`${number.toLowerCase()}@candidate.examportal.local`;
   await signInWithEmailAndPassword(auth,internalEmail,loginPass.value);
   sessionStorage.setItem("candidateApp",number);
   location.href="application-dashboard.html";
 }catch(err){showMsg(msg,"Login failed. Check Application Number and Password.",true);}
};

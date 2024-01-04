importScripts(
  "https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js"
);

firebase.initializeApp({
  apiKey: "AIzaSyB-S65qbk6T29gOA6N4y2EFm26iMwD2I1M",
  authDomain: "horoverse-b0fc1.firebaseapp.com",
  projectId: "horoverse-b0fc1",
  storageBucket: "horoverse-b0fc1.appspot.com",
  messagingSenderId: "294054403432",
  appId: "1:294054403432:web:101ac087726d586f6b4add",
  measurementId: "G-HCW34FKR83",
});

var messaging = firebase.messaging();



importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyCcI8hZH1HuIk7KCgq1_wrcZSQs63Yg0dY",
  authDomain: "horoverse-15fe0.firebaseapp.com",
  projectId: "horoverse-15fe0",
  storageBucket: "horoverse-15fe0.appspot.com",
  messagingSenderId: "388347383481",
  appId: "1:388347383481:web:1a7566fd701861ff49d568",
  measurementId: "G-RG504RKNKP",
});

var messaging = firebase.messaging();
messaging.onBackgroundMessage( function(payload)  {
  console.log("Notification push reçue en arrière-plan:", payload);
  // Traitez le payload de la notification push reçue en arrière-plan
});


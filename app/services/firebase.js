import firebase from 'firebase';

const firebaseConfig = {
  apiKey: "AIzaSyApyr_GVy-5rC4s0laqcPb-SKdAtU70FBU",
  authDomain: "draw-teams.firebaseapp.com",
  databaseURL: "https://draw-teams.firebaseio.com",
  projectId: "draw-teams",
  storageBucket: "draw-teams.appspot.com",
  messagingSenderId: "853780675945"
};
const firebaseApp = firebase.initializeApp(firebaseConfig);

signIn = (email, password) => {
  firebase.auth().signInWithEmailAndPassword(email, password).catch(function(error) {
    // if (error) {
    //   firebase.auth().createUserWithEmailAndPassword(email, password).catch(function(error) {
    //     return(error)
    //   });
    // }
  });
}

export { firebaseApp };

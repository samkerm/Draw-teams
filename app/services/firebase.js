import firebase from 'firebase';

const firebaseConfig = {
  apiKey: 'AIzaSyApyr_GVy-5rC4s0laqcPb-SKdAtU70FBU',
  authDomain: 'draw-groups.firebaseapp.com',
  databaseURL: 'https://draw-teams.firebaseio.com',
  projectId: 'draw-teams',
  storageBucket: 'draw-teams.appspot.com',
  messagingSenderId: '853780675945',
};
export default firebase.initializeApp(firebaseConfig);

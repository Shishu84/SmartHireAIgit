
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, GithubAuthProvider } from "firebase/auth"
const firebaseConfig = {
  apiKey: "AIzaSyDHzh5a95BKlK7HbrNkMLzAb_x_7FpElNw",
  authDomain: "smarthireai26-17069.firebaseapp.com",
  projectId: "smarthireai26-17069",
  storageBucket: "smarthireai26-17069.firebasestorage.app",
  messagingSenderId: "667891011042",
  appId: "1:667891011042:web:2de7563ac0064193e33dbb",
  measurementId: "G-BPX6K5K567"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const provider = new GoogleAuthProvider()
const githubProvider = new GithubAuthProvider()

export { auth, provider, githubProvider }
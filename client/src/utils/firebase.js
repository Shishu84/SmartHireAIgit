
import { initializeApp } from "firebase/app";
import {getAuth, GoogleAuthProvider} from "firebase/auth"
const firebaseConfig = {
  apiKey: "AIzaSyCwhP5hOrx-8vGsA5UEiQ4RTcMEBZ58K_g",
  authDomain: "smarthireai-6b0d0.firebaseapp.com",
  projectId: "smarthireai-6b0d0",
  storageBucket: "smarthireai-6b0d0.firebasestorage.app",
  messagingSenderId: "332659816125",
  appId: "1:332659816125:web:29d226b35c52567669a9d4",
  measurementId: "G-WD7S7T8WV1"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const provider = new GoogleAuthProvider()

export {auth , provider}
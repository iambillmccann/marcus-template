// Usage: node get-id-token.js <email> <password>
const { initializeApp } = require("firebase/app");
const { getAuth, signInWithEmailAndPassword } = require("firebase/auth");

const firebaseConfig = {
  apiKey: "<YOUR_API_KEY>",
  authDomain: "<YOUR_AUTH_DOMAIN>",
  projectId: "<YOUR_PROJECT_ID>",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const [,, email, password] = process.argv;

signInWithEmailAndPassword(auth, email, password)
  .then(userCredential => userCredential.user.getIdToken())
  .then(token => {
    console.log("ID Token:", token);
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });

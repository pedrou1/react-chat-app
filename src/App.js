import './App.css';
import React, { useState } from "react";
import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';

firebase.initializeApp(
  {
    //firebase
  }
)

const auth = firebase.auth();
const firestore = firebase.firestore();


function App() {
  const [user] = useAuthState(auth); // null if not logged in
  

  return (
    <div className="App">

      <section>
        { user ? <ChatRoom /> : <SignIn /> }
      </section>

    </div>
  );
}

function SignIn() {
  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider); //sign in popup
  }

  return (
    <div className="container">
      <div className="row">
        <div className="col-md-12 mt-5">

          <button className="btn btn-info" onClick={signInWithGoogle}>Sign in with Google</button>
        </div>
      </div>
    </div>
  )
}

function SignOut(){
  return auth.currentUser && (
    <button onClick={ () => auth.signOut() }>Sign Out</button>
  )

}

function ChatRoom(){
  const messagesRef = firestore.collection('messages');
  const query = messagesRef.orderBy('createdAt').limit(25);
  

  const [messages] = useCollectionData(query, { idField: 'id' });//listen to messages with hook
    //changes in real time ^

    const [formValue, setFormValue] = useState('');

    const sendMessage = async(e) => {
      e.preventDefault(); //prevents page load when form is submitted

      const { uid, photoURL } = auth.currentUser;

      await messagesRef.add({
        text: formValue,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        uid,
        photoURL
      })
      setFormValue('');
    }
    
    return (
      <>
        <div className="row">
          <div className="col-md-12">
            <div className="row justify-content-center">
              <div className="col-md-6 center-block">
                {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}
                <form onSubmit={sendMessage}>
                  <input className="form-control mt-1" value={formValue} onChange={(e) => setFormValue(e.target.value)} />
                  <button type="submit" disabled={!formValue} className="btn btn-dark mt-1">Submit</button>
                </form>
              </div>

            </div>
          </div>
        </div>
      </>
    )
}

function ChatMessage(props){
  const { text, uid, photoURL } = props.message;

  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';

return (
<div className={`message mt-2 ${messageClass}`}>
  <img src={photoURL} className="img mt-2" />

<p className="text">{text}</p>
</div>

)
}



export default App;

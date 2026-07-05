async function fb_authenticate() {
  let user;
  firebase.auth().onAuthStateChanged(async (user) => {
    user = firebase.auth().currentUser;
    if (user) {
      //Already logged in
      if (user !== null) {
        //UID (from Google)
        let uid = user.uid;
        localStorage.setItem('uid', uid);
        //User Display Name (from Google)
        let userDisplayName = user.displayName;
        localStorage.setItem('userDisplayName', userDisplayName);
        firebase.database().ref('/userInfo/' + uid + '/displayName').set(userDisplayName);
        //User Email (from Google)
        let userEmail = user.email;
        localStorage.setItem('userEmail', userEmail);
        firebase.database().ref('/userInfo/' + uid + '/email').set(userEmail);
        //User Profile Photo URL (from Google)
        let userPhotoURL = user.photoURL;
        localStorage.setItem('userPhotoURL', userPhotoURL);
        firebase.database().ref('/userInfo/' + uid + '/photoURL').set(userPhotoURL);

        console.log("User Logged In")
        console.log(uid + "\n" + userDisplayName + "\n" + userEmail + "\n" + userPhotoURL)
        let loginButton = document.getElementById("loginButton");
        loginButton.style.display = "none"
        let profilePhoto = document.getElementById("profilePhoto");
        profilePhoto.innerHTML =
          `<img src="${userPhotoURL}" alt="User profile photo" width="60px" height="60px" style="border-radius:50%">
          <div id="profileInfo"></div>`
      }
    } else {
      //Not logged in, runs Google pop up
      console.log("User Not Logged In")
      let provider = new firebase.auth.GoogleAuthProvider();
      provider.addScope('profile');
      provider.addScope('email');
      firebase.auth().signInWithPopup(provider).then(function (result) {
        let token = result.credential.accessToken;
      });
    }
  });
}

function getProfileInfo() {
  let profileInfo = document.getElementById("profileInfo")
  if (profileInfo.style.display !== "block") {
    profileInfo.style.display = "block";
    profileInfo.innerHTML = `
    <img src="${localStorage.getItem('userPhotoURL')}" alt="User profile photo" 
    width="50px" height="50px" style="border-radius:50%; display: flex; justify-content: left; align-items: center; position: absolute;">
    ${localStorage.getItem('userDisplayName')}<br>
    ${localStorage.getItem('userEmail')}`
  } else {
    profileInfo.style.display = "none";
  }

}
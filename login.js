function login(){

    let email =
    document.getElementById(
        "email"
    ).value;

    let password =
    document.getElementById(
        "password"
    ).value;

    if(
        email ===
        "admin@gmail.com"

        &&

        password ===
        "admin123"
    ){

        localStorage.setItem(
            "loggedIn",
            "true"
        );

        window.location.href =
        "dashboard.html";

    }
    else{

        showToast("❌ Invalid Login");
    }
}

function showSignup(){

    alert(
        "Signup page coming soon"
    );
}
const BASE_URL = "http://192.168.43.81:5000";

function checkAuth() {
    if (!localStorage.getItem('loggedIn')) {
        window.location.href = 'index.html';
    }
}

document.addEventListener("DOMContentLoaded", () => {
    if (window.location.pathname.includes("dashboard.html")) {
        checkAuth();
    }
});

async function loginUser(event) {
    event.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const res = await fetch(BASE_URL + "/api/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email, password })
        });

        const data = await res.json();

        if (data.status === "success") {
            localStorage.setItem('loggedIn', 'true');
            localStorage.setItem('userEmail', email);

            window.location.href = 'employee.html';
        } else {
            alert("Invalid email or password");
        }

    } catch (error) {
        console.log("Login error:", error);
        alert("Server not running or wrong IP");
    }
}

async function registerUser(event) {
    event.preventDefault();

    const name = document.getElementById('regName').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPass').value;

    try {
        const res = await fetch(BASE_URL + "/api/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ name, email, password })
        });

        const data = await res.json();

        if (data.status === "success") {
            alert("Registration successful!");
            window.location.href = "index.html";
        } else {
            alert("User already exists");
        }

    } catch (error) {
        console.log("Register error:", error);
        alert("Server not running or wrong IP");
    }
}

function selectRole(roleName) {
    localStorage.setItem('activeRole', roleName);
    window.location.href = 'dashboard.html';
}

function logout() {
    localStorage.clear();
    window.location.href = 'index.html';
}

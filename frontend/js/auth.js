const registerForm = document.getElementById("registerForm");
const loginForm = document.getElementById("loginForm");
const message = document.getElementById("message");


if (registerForm) {

    registerForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const name =
            document.getElementById("name").value.trim();

        const email =
            document.getElementById("email").value.trim();

        const phone =
            document.getElementById("phone").value.trim();

        const password =
            document.getElementById("password").value;

        try {

            const response = await fetch("/api/auth/register", {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    name: name,
                    email: email,
                    phone: phone,
                    password: password
                })

            });

            const data = await response.json();

            if (!response.ok) {

                message.textContent =
                    data.message || "Registration failed";

                return;
            }

            message.textContent =
                "Registration successful! Redirecting to login...";

            registerForm.reset();

            setTimeout(() => {

                window.location.href = "/login.html";

            }, 1500);

        } catch (error) {

            console.error(error);

            message.textContent =
                "Unable to connect to server.";

        }

    });
}


if (loginForm) {

    loginForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const email =
            document.getElementById("email").value.trim();

        const password =
            document.getElementById("password").value;

        try {

            const response = await fetch("/api/auth/login", {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    email: email,
                    password: password
                })

            });

            const data = await response.json();

            if (!response.ok) {

                message.textContent =
                    data.message || "Login failed";

                return;
            }

            localStorage.setItem(
                "borrowBuddyToken",
                data.token
            );

            localStorage.setItem(
                "borrowBuddyUser",
                JSON.stringify({
                    userId: data.userId,
                    name: data.name,
                    email: data.email,
                    role: data.role
                })
            );

            message.textContent =
                "Login successful!";

            setTimeout(() => {

                window.location.href = "/dashboard.html";

            }, 1000);

        } catch (error) {

            console.error(error);

            message.textContent =
                "Unable to connect to server.";

        }

    });
}
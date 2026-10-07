const userData = localStorage.getItem("borrowBuddyUser");
const token = localStorage.getItem("borrowBuddyToken");


// Check if user is logged in

if (!userData) {

    window.location.href = "/login.html";

}


// Get form

const addItemForm =
    document.getElementById("addItemForm");

const message =
    document.getElementById("message");


// Submit form

addItemForm.addEventListener("submit", async function (event) {

    event.preventDefault();


    const name =
        document.getElementById("name").value.trim();

    const description =
        document.getElementById("description").value.trim();

    const category =
        document.getElementById("category").value.trim();

    const imageUrl =
        document.getElementById("imageUrl").value.trim();


    const user =
        JSON.parse(userData);


    message.textContent = "Adding item...";


    try {

        const response = await fetch(
    `/api/items`,
    {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
            name,
            description,
            category,
            imageUrl
        })
    }
);


        const data = await response.json();


        if (!response.ok) {

            message.textContent =
                "Failed to add item.";

            console.error(data);

            return;
        }


        message.textContent =
            "Item added successfully!";


        addItemForm.reset();


        setTimeout(() => {

            window.location.href =
                "/dashboard.html";

        }, 1000);


    } catch (error) {

        console.error(error);

        message.textContent =
            "Unable to connect to server.";

    }

});
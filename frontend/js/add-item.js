const userData = localStorage.getItem("borrowBuddyUser");
const token = localStorage.getItem("borrowBuddyToken");

// Check if user is logged in
if (!userData || !token) {
    window.location.href = "/login.html";
}

// Get form elements
const addItemForm = document.getElementById("addItemForm");
const message = document.getElementById("message");

const nameInput = document.getElementById("name");
const descriptionInput = document.getElementById("description");
const categoryInput = document.getElementById("category");
const imageUrlInput = document.getElementById("imageUrl");

const generateDescriptionBtn =
    document.getElementById("generateDescriptionBtn");

const aiDescriptionStatus =
    document.getElementById("aiDescriptionStatus");

// Generate item description using AI
generateDescriptionBtn.addEventListener("click", async function () {

    const name = nameInput.value.trim();
    const category = categoryInput.value.trim();

    if (!name || !category) {
        aiDescriptionStatus.textContent =
            "Please enter the item name and category first.";
        return;
    }

    generateDescriptionBtn.disabled = true;
    aiDescriptionStatus.textContent =
        "✨ Generating description...";

    try {
        const response = await fetch("/api/ai/generate-description", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                name: name,
                category: category
            })
        });

        const data = await response.json();

        if (!response.ok) {
            aiDescriptionStatus.textContent =
                data.error || "Unable to generate description.";
            return;
        }

        descriptionInput.value = data.description;

        aiDescriptionStatus.textContent =
            "✅ Description generated! You can edit it before adding the item.";

    } catch (error) {
        console.error("AI description error:", error);

        aiDescriptionStatus.textContent =
            "Unable to connect to the AI service.";
    } finally {
        generateDescriptionBtn.disabled = false;
    }
});

// Submit form to add item
addItemForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    const name = nameInput.value.trim();
    const description = descriptionInput.value.trim();
    const category = categoryInput.value.trim();
    const imageUrl = imageUrlInput.value.trim();

    message.textContent = "Adding item...";

    try {
        const response = await fetch("/api/items", {
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
        });

        const data = await response.json();

        if (!response.ok) {
            message.textContent = "Failed to add item.";
            console.error(data);
            return;
        }

        message.textContent = "Item added successfully!";
        addItemForm.reset();
        aiDescriptionStatus.textContent = "";

        setTimeout(() => {
            window.location.href = "/dashboard.html";
        }, 1000);

    } catch (error) {
        console.error("Add item error:", error);
        message.textContent = "Unable to connect to server.";
    }
});

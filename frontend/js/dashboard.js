const userData = localStorage.getItem("borrowBuddyUser");
const token = localStorage.getItem("borrowBuddyToken");

let allItems = [];

if (!userData || !token) {
    window.location.href = "/login.html";
} else {
    try {
        const user = JSON.parse(userData);

        document.getElementById("studentName").textContent =
            user.name || "Student";

        loadItems();
    } catch (error) {
        console.error("Invalid user data:", error);
        window.location.href = "/login.html";
    }
}

// Load items from backend
async function loadItems() {
    const container = document.getElementById("itemsContainer");

    try {
        const response = await fetch("/api/items", {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error("Failed to load items: " + response.status);
        }

        allItems = await response.json();
        displayItems(allItems);
    } catch (error) {
        console.error("Error loading items:", error);
        container.textContent =
            "Unable to load items. Please refresh the page.";
    }
}

// Safely create text elements
function addText(parent, tag, text, className) {
    const element = document.createElement(tag);
    element.textContent = text || "";

    if (className) {
        element.className = className;
    }

    parent.appendChild(element);
    return element;
}

// Display items
function displayItems(items) {
    const container = document.getElementById("itemsContainer");
    container.replaceChildren();

    if (!items || items.length === 0) {
        addText(container, "p", "No items found.");
        return;
    }

    items.forEach(item => {
        const card = document.createElement("div");
        card.className = "item-card";

        addText(card, "h2", item.name || "Untitled item");
        addText(card, "p", item.description || "");

        // Display the product URL stored in imageUrl
        const itemUrl = String(
            item.imageUrl ||
            item.url ||
            item.itemUrl ||
            item.itemURL ||
            item.productUrl ||
            item.productURL ||
            ""
        ).trim();

        if (itemUrl) {
            try {
                const parsedUrl = new URL(itemUrl);

                if (
                    parsedUrl.protocol === "http:" ||
                    parsedUrl.protocol === "https:"
                ) {
                    const urlParagraph = document.createElement("p");
                    urlParagraph.className = "item-url";

                    const label = document.createElement("strong");
                    label.textContent = "Product URL: ";
                    urlParagraph.appendChild(label);

                    const link = document.createElement("a");
                    link.href = parsedUrl.href;
                    link.textContent = "View Item URL ↗";
                    link.target = "_blank";
                    link.rel = "noopener noreferrer";

                    urlParagraph.appendChild(link);
                    card.appendChild(urlParagraph);
                }
            } catch (error) {
                console.warn(
                    "Invalid URL for item:",
                    item.name,
                    itemUrl
                );
            }
        }

        // Category
        addText(
            card,
            "p",
            "Category: " + (item.category || "Other")
        );

        // Owner
        addText(
            card,
            "p",
            "Owner: " + (item.owner?.name || "Unknown")
        );

        // Availability status
        const status = document.createElement("p");

        status.className =
            "item-availability " +
            (item.available ? "available" : "borrowed");

        const statusLabel = document.createElement("strong");
        statusLabel.textContent = "Status: ";
        status.appendChild(statusLabel);

        status.appendChild(
            document.createTextNode(
                item.available
                    ? "🟢 Available"
                    : "🔴 Currently Borrowed"
            )
        );

        card.appendChild(status);

        // Request item button
        const requestButton = document.createElement("button");

        requestButton.className = "dashboard-btn request-btn";
        requestButton.dataset.itemId = item.id;

        if (item.available) {
            requestButton.textContent = "Request Item";
        } else {
            requestButton.textContent = "Item Already Borrowed";
            requestButton.disabled = true;
        }

        card.appendChild(requestButton);

        // Borrowing form
        const borrowForm = document.createElement("div");

        borrowForm.className = "borrow-form";
        borrowForm.style.display = "none";

        addText(borrowForm, "label", "Borrow Date");

        const borrowDate = document.createElement("input");
        borrowDate.type = "date";
        borrowDate.className = "borrow-date";
        borrowForm.appendChild(borrowDate);

        addText(borrowForm, "label", "Return Date");

        const returnDate = document.createElement("input");
        returnDate.type = "date";
        returnDate.className = "return-date";
        borrowForm.appendChild(returnDate);

        const daysParagraph = document.createElement("p");

        const daysLabel = document.createElement("strong");
        daysLabel.textContent = "Borrowing Days: ";
        daysParagraph.appendChild(daysLabel);

        const daysValue = document.createElement("span");
        daysValue.className = "borrow-days";
        daysValue.textContent = "0";
        daysParagraph.appendChild(daysValue);

        borrowForm.appendChild(daysParagraph);

        const confirmButton = document.createElement("button");

        confirmButton.className =
            "dashboard-btn confirm-request-btn";

        confirmButton.textContent = "Confirm Borrow Request";
        borrowForm.appendChild(confirmButton);

        const message = document.createElement("p");
        message.className = "request-message";
        borrowForm.appendChild(message);

        card.appendChild(borrowForm);
        container.appendChild(card);
    });

    setupRequestButtons();
}

// Search and category filter
function filterItems() {
    const searchText = document
        .getElementById("searchInput")
        .value.toLowerCase().trim();

    const selectedCategory = document
        .getElementById("categoryFilter")
        .value.toLowerCase();

    const filteredItems = allItems.filter(item => {
        const name = (item.name || "").toLowerCase();
        const description = (item.description || "").toLowerCase();
        const category = (item.category || "Other").toLowerCase();

        const matchesSearch =
            name.includes(searchText) ||
            description.includes(searchText);

        const matchesCategory =
            selectedCategory === "" ||
            category === selectedCategory;

        return matchesSearch && matchesCategory;
    });

    displayItems(filteredItems);
}

document.getElementById("searchInput")
    .addEventListener("input", filterItems);

document.getElementById("categoryFilter")
    .addEventListener("change", filterItems);

document.getElementById("clearFilters")
    .addEventListener("click", () => {
        document.getElementById("searchInput").value = "";
        document.getElementById("categoryFilter").value = "";
        displayItems(allItems);
    });

// Borrow request buttons
function setupRequestButtons() {
    document.querySelectorAll(".request-btn").forEach(button => {
        button.addEventListener("click", () => {
            if (button.disabled) return;

            const card = button.closest(".item-card");
            const form = card.querySelector(".borrow-form");

            form.style.display = "block";
            button.style.display = "none";

            const borrowDate = form.querySelector(".borrow-date");
            const returnDate = form.querySelector(".return-date");
            const message = form.querySelector(".request-message");

            const confirmButton = form.querySelector(
                ".confirm-request-btn"
            );

            // Today's local date
            const now = new Date();

            const localToday = [
                now.getFullYear(),
                String(now.getMonth() + 1).padStart(2, "0"),
                String(now.getDate()).padStart(2, "0")
            ].join("-");

            borrowDate.min = localToday;
            returnDate.min = localToday;

            // Calculate borrowing days
            function calculateDays() {
                if (!borrowDate.value || !returnDate.value) {
                    form.querySelector(".borrow-days").textContent = "0";
                    return;
                }

                const start = new Date(
                    borrowDate.value + "T00:00:00"
                );

                const end = new Date(
                    returnDate.value + "T00:00:00"
                );

                const difference = end - start;

                const days = Math.round(
                    difference / (1000 * 60 * 60 * 24)
                );

                form.querySelector(".borrow-days").textContent =
                    days > 0 ? String(days) : "0";
            }

            borrowDate.addEventListener("change", () => {
                returnDate.min = borrowDate.value || localToday;

                if (
                    returnDate.value &&
                    returnDate.value <= borrowDate.value
                ) {
                    returnDate.value = "";
                }

                calculateDays();
            });

            returnDate.addEventListener("change", calculateDays);

            // Submit borrowing request
            confirmButton.addEventListener("click", async () => {
                const startDate = borrowDate.value;
                const endDate = returnDate.value;

                if (!startDate || !endDate) {
                    message.textContent =
                        "Please select both borrow and return dates.";
                    return;
                }

                if (endDate <= startDate) {
                    message.textContent =
                        "Return date must be after borrow date.";
                    return;
                }

                confirmButton.disabled = true;
                confirmButton.textContent = "Sending...";
                message.textContent = "";

                try {
                    const params = new URLSearchParams({
                        itemId: button.dataset.itemId,
                        borrowDate: startDate,
                        returnDate: endDate
                    });

                    const response = await fetch(
                        "/api/requests?" + params.toString(),
                        {
                            method: "POST",
                            headers: {
                                Authorization: `Bearer ${token}`
                            }
                        }
                    );

                    const responseText = await response.text();

                    if (!response.ok) {
                        message.textContent =
                            responseText ||
                            "Unable to send borrow request.";
                        return;
                    }

                    message.textContent =
                        "Borrow request sent successfully!";

                    confirmButton.textContent = "Request Sent";
                } catch (error) {
                    console.error("Borrow request error:", error);

                    message.textContent =
                        "Unable to connect to server.";
                } finally {
                    if (confirmButton.textContent !== "Request Sent") {
                        confirmButton.disabled = false;
                        confirmButton.textContent =
                            "Confirm Borrow Request";
                    }
                }
            });
        });
    });
}

// Logout
document.getElementById("logoutBtn").addEventListener("click", () => {
    localStorage.removeItem("borrowBuddyToken");
    localStorage.removeItem("borrowBuddyUser");

    window.location.href = "/login.html";
});
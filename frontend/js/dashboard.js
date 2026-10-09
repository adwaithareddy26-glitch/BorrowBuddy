const userData = localStorage.getItem("borrowBuddyUser");
const token = localStorage.getItem("borrowBuddyToken");

let allItems = [];

if (!userData || !token) {

    window.location.href = "/login.html";

} else {

    const user = JSON.parse(userData);

    document.getElementById("studentName").textContent =
        user.name;

    loadItems();
}


// Load available items
async function loadItems() {

    const container =
        document.getElementById("itemsContainer");

    try {

        const response = await fetch(
            "/api/items",
            {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );

        if (!response.ok) {
            throw new Error("Failed to load items");
        }

        allItems = await response.json();

        displayItems(allItems);

    } catch (error) {

        console.error(error);

        container.innerHTML =
            "<p>Unable to load items.</p>";
    }
}


// Display items
function displayItems(items) {

    const container =
        document.getElementById("itemsContainer");


    if (items.length === 0) {

        container.innerHTML =
            "<p>No items found.</p>";

        return;
    }


    container.innerHTML = "";


    items.forEach(item => {

        const card =
            document.createElement("div");

        card.className = "item-card";


        card.innerHTML = `
            <h2>${item.name}</h2>

            <p>${item.description}</p>

            <p>
                <strong>Category:</strong>
                ${item.category || "Other"}
            </p>

           <p>
    <strong>Owner:</strong>
    ${item.owner.name}
</p>

<p class="item-availability ${
    item.available ? "available" : "borrowed"
}">
    <strong>Status:</strong>

    ${item.available
        ? "🟢 Available"
        : "🔴 Currently Borrowed"
    }
</p>

${
    item.available
        ? `
            <button
                class="dashboard-btn request-btn"
                data-item-id="${item.id}">
                Request Item
            </button>
          `
        : `
            <button
                class="dashboard-btn request-btn"
                disabled>
                Item Already Borrowed
            </button>
          `
}

            <div class="borrow-form"
                 style="display:none;">

                <label>
                    Borrow Date
                </label>

                <input
                    type="date"
                    class="borrow-date">

                <label>
                    Return Date
                </label>

                <input
                    type="date"
                    class="return-date">

                <p>
                    <strong>
                        Borrowing Days:
                    </strong>

                    <span class="borrow-days">
                        0
                    </span>
                </p>

                <button
                    class="dashboard-btn confirm-request-btn">
                    Confirm Borrow Request
                </button>

                <p class="request-message"></p>

            </div>
        `;


        container.appendChild(card);

    });


    setupRequestButtons();
}


// Search and category filter
function filterItems() {

    const searchInput =
        document.getElementById("searchInput");

    const categoryFilter =
        document.getElementById("categoryFilter");


    const searchText =
        searchInput.value
            .toLowerCase()
            .trim();

    const selectedCategory =
        categoryFilter.value;


    const filteredItems =
        allItems.filter(item => {

            const itemName =
                (item.name || "")
                    .toLowerCase();

            const itemDescription =
                (item.description || "")
                    .toLowerCase();

            const itemCategory =
                item.category || "Other";


            const matchesSearch =
                itemName.includes(searchText) ||
                itemDescription.includes(searchText);


            const matchesCategory =
                selectedCategory === "" ||
                itemCategory.toLowerCase() ===
                selectedCategory.toLowerCase();


            return matchesSearch &&
                   matchesCategory;

        });


    displayItems(filteredItems);
}


// Search input
document
    .getElementById("searchInput")
    .addEventListener(
        "input",
        filterItems
    );


// Category filter
document
    .getElementById("categoryFilter")
    .addEventListener(
        "change",
        filterItems
    );


// Clear filters
document
    .getElementById("clearFilters")
    .addEventListener(
        "click",
        function () {

            document.getElementById(
                "searchInput"
            ).value = "";

            document.getElementById(
                "categoryFilter"
            ).value = "";

            displayItems(allItems);
        }
    );


// Request button setup
function setupRequestButtons() {

    document
        .querySelectorAll(".request-btn")
        .forEach(button => {

            button.addEventListener(
                "click",
                function () {

                    const form =
                        this.parentElement
                            .querySelector(".borrow-form");


                    form.style.display =
                        "block";

                    this.style.display =
                        "none";


                    const borrowDate =
                        form.querySelector(
                            ".borrow-date"
                        );

                    const returnDate =
                        form.querySelector(
                            ".return-date"
                        );


                    // Today's date
                    const today =
                        new Date()
                            .toISOString()
                            .split("T")[0];


                    borrowDate.min =
                        today;

                    returnDate.min =
                        today;


                    // Calculate borrowing days
                    function calculateDays() {

                        if (
                            borrowDate.value &&
                            returnDate.value
                        ) {

                            const start =
                                new Date(
                                    borrowDate.value
                                );

                            const end =
                                new Date(
                                    returnDate.value
                                );


                            const difference =
                                end - start;


                            const days =
                                Math.ceil(
                                    difference /
                                    (1000 * 60 * 60 * 24)
                                );


                            form.querySelector(
                                ".borrow-days"
                            ).textContent =
                                days > 0
                                    ? days
                                    : 0;
                        }
                    }


                    borrowDate.addEventListener(
                        "change",
                        calculateDays
                    );


                    returnDate.addEventListener(
                        "change",
                        calculateDays
                    );


                    // Confirm request
                    form.querySelector(
                        ".confirm-request-btn"
                    ).addEventListener(
                        "click",
                        async function () {

                            const startDate =
                                borrowDate.value;

                            const endDate =
                                returnDate.value;


                            const message =
                                form.querySelector(
                                    ".request-message"
                                );


                            if (
                                !startDate ||
                                !endDate
                            ) {

                                message.textContent =
                                    "Please select both borrow and return dates.";

                                return;
                            }


                            const start =
                                new Date(
                                    startDate
                                );

                            const end =
                                new Date(
                                    endDate
                                );


                            if (end <= start) {

                                message.textContent =
                                    "Return date must be after borrow date.";

                                return;
                            }


                            try {

                                this.disabled =
                                    true;

                                this.textContent =
                                    "Sending...";


                                const response =
                                    await fetch(
                                        `/api/requests?itemId=${button.dataset.itemId}` +
                                        `&borrowDate=${startDate}` +
                                        `&returnDate=${endDate}`,
                                        {
                                            method: "POST",

                                            headers: {
                                                "Authorization":
                                                    `Bearer ${token}`
                                            }
                                        }
                                    );


                                const text =
                                    await response.text();


                                if (!response.ok) {

                                    message.textContent =
                                        text;

                                    this.disabled =
                                        false;

                                    this.textContent =
                                        "Confirm Borrow Request";

                                    return;
                                }


                                message.textContent =
                                    "Borrow request sent successfully!";


                                message.textContent =
    "Borrow request sent successfully!";

this.textContent =
    "Request Again";

this.disabled =
    false;


                            } catch (error) {

                                console.error(error);

                                message.textContent =
                                    "Unable to connect to server.";

                                this.disabled =
                                    false;

                                this.textContent =
                                    "Confirm Borrow Request";
                            }

                        }
                    );

                }
            );

        });
}


// Logout
document
    .getElementById("logoutBtn")
    .addEventListener(
        "click",
        function () {

            localStorage.removeItem(
                "borrowBuddyToken"
            );

            localStorage.removeItem(
                "borrowBuddyUser"
            );

            window.location.href =
                "/login.html";
        }
    );
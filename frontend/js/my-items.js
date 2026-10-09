const userData = localStorage.getItem("borrowBuddyUser");
const token = localStorage.getItem("borrowBuddyToken");

if (!userData || !token) {

    window.location.href = "/login.html";

} else {

    loadMyItems();
}


// Load owner's items
async function loadMyItems() {

    const container =
        document.getElementById("myItemsContainer");

    try {

        // Get my items
        const itemsResponse =
            await fetch(
                "/api/items/my-items",
                {
                    headers: {
                        "Authorization":
                            `Bearer ${token}`
                    }
                }
            );


        if (!itemsResponse.ok) {
            throw new Error("Failed to load items");
        }


        const items =
            await itemsResponse.json();


        // Get requests received for my items
        const requestsResponse =
            await fetch(
                "/api/requests/received",
                {
                    headers: {
                        "Authorization":
                            `Bearer ${token}`
                    }
                }
            );


        if (!requestsResponse.ok) {
            throw new Error("Failed to load requests");
        }


        const requests =
            await requestsResponse.json();


        if (items.length === 0) {

            container.innerHTML =
                "<p>You haven't added any items yet.</p>";

            return;
        }


        container.innerHTML = "";


        items.forEach(item => {

            const card =
                document.createElement("div");

            card.className =
                "dashboard-card";


            // Find currently approved request
            const currentRequest =
                requests.find(request =>
                    request.item &&
                    request.item.id === item.id &&
                    request.status === "APPROVED"
                );


            let borrowerInfo = "";


            if (!item.available && currentRequest) {

                const borrower =
                    currentRequest.requester;


                const returnDate =
                    new Date(
                        currentRequest.returnDate
                    );


                const today =
                    new Date();


                const returnDateOnly =
                    new Date(
                        currentRequest.returnDate
                    );


                const todayOnly =
                    new Date(
                        today.toISOString()
                            .split("T")[0]
                    );


                let overdueText = "";


                if (todayOnly > returnDateOnly) {

                    const lateDays =
                        Math.floor(
                            (
                                todayOnly -
                                returnDateOnly
                            ) /
                            (1000 * 60 * 60 * 24)
                        );


                    const currentPenalty =
                        lateDays * 10;


                    overdueText = `
                        <p class="item-overdue">
                            ⚠️ Overdue by
                            ${lateDays} day(s)
                        </p>

                        <p class="item-penalty">
                            💰 Current Penalty:
                            ₹${currentPenalty}
                        </p>
                    `;
                }


                borrowerInfo = `
                    <p>
                        <strong>Borrower:</strong>
                        ${borrower.name}
                    </p>

                    <p>
                        <strong>Borrower Email:</strong>
                        ${borrower.email}
                    </p>

                    <p>
                        <strong>Borrow Date:</strong>
                        ${currentRequest.borrowDate}
                    </p>

                    <p>
                        <strong>Return Date:</strong>
                        ${currentRequest.returnDate}
                    </p>

                    <p>
                        <strong>Borrowing Days:</strong>
                        ${currentRequest.borrowDays}
                    </p>

                    ${overdueText}
                `;
            }


            card.innerHTML = `
                <div class="card-icon">
                    📦
                </div>

                <h2>
                    ${item.name}
                </h2>

                <p>
                    ${item.description}
                </p>

                <p>
                    <strong>Category:</strong>
                    ${item.category || "Other"}
                </p>

                ${
                    item.available
                        ? `
                            <p class="item-available">
                                <strong>Status:</strong>
                                🟢 Available
                            </p>

                            <p>
                                This item is currently
                                available for borrowing.
                            </p>
                          `
                        : `
                            <p class="item-borrowed">
                                <strong>Status:</strong>
                                🔴 Currently Borrowed
                            </p>

                            ${borrowerInfo}
                          `
                }
            `;


            container.appendChild(card);

        });


    } catch (error) {

        console.error(error);

        container.innerHTML =
            "<p>Unable to load your items.</p>";
    }
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
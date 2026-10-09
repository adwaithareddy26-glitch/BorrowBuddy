const userData = localStorage.getItem("borrowBuddyUser");
const token = localStorage.getItem("borrowBuddyToken");

if (!userData || !token) {
    window.location.href = "/login.html";
} else {
    const user = JSON.parse(userData);
    loadMyRequests(user.userId);
}


// Status text
function getStatusText(status) {

    if (status === "PENDING") {
        return "🟡 Pending";
    }

    if (status === "APPROVED") {
        return "🟢 Approved";
    }

    if (status === "REJECTED") {
        return "🔴 Rejected";
    }

    if (status === "RETURNED") {
        return "🔵 Returned";
    }

    return status;
}


// Calculate current penalty
function calculateCurrentPenalty(request) {

    // Already returned
    if (request.status === "RETURNED") {
        return request.penalty || 0;
    }

    // Only approved requests can become overdue
    if (request.status !== "APPROVED") {
        return 0;
    }

    if (!request.returnDate) {
        return 0;
    }

    const today = new Date();
    const returnDate = new Date(request.returnDate);

    // Remove time portion
    today.setHours(0, 0, 0, 0);
    returnDate.setHours(0, 0, 0, 0);

    if (today <= returnDate) {
        return 0;
    }

    const difference =
        today.getTime() - returnDate.getTime();

    const lateDays =
        Math.floor(
            difference / (1000 * 60 * 60 * 24)
        );

    // ₹10 per late day
    return lateDays * 10;
}


// Get current status
function getDisplayStatus(request) {

    if (
        request.status === "APPROVED" &&
        request.returnDate
    ) {

        const today = new Date();
        const returnDate =
            new Date(request.returnDate);

        today.setHours(0, 0, 0, 0);
        returnDate.setHours(0, 0, 0, 0);

        if (today > returnDate) {
            return "⚠️ OVERDUE";
        }
    }

    return getStatusText(request.status);
}


// Load requests
async function loadMyRequests(requesterId) {

    const container =
        document.getElementById("requestsContainer");

    try {

        const response = await fetch(
            `/api/requests/my-requests?requesterId=${requesterId}`,
            {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );

        if (!response.ok) {

            const errorText =
                await response.text();

            console.error(
                "Server Error:",
                response.status,
                errorText
            );

            throw new Error(
                "Failed to load requests"
            );
        }

        const requests =
            await response.json();


        if (requests.length === 0) {

            container.innerHTML =
                "<p>You have not requested any items yet.</p>";

            return;
        }


        container.innerHTML = "";


        requests.forEach(request => {

            const card =
                document.createElement("div");

            card.className =
                "dashboard-card";


            const penalty =
                calculateCurrentPenalty(request);


            const status =
                getDisplayStatus(request);


            const isOverdue =
                status === "⚠️ OVERDUE";


            card.innerHTML = `

                <div class="card-icon">
                    📦
                </div>

                <h2>
                    ${request.item.name}
                </h2>

                <p>
                    ${request.item.description}
                </p>

                <p>
                    <strong>Category:</strong>
                    ${request.item.category || "Other"}
                </p>

                <p>
                    <strong>Owner:</strong>
                    ${request.item.owner.name}
                </p>

                <hr>

                <p>
                    <strong>📅 Borrow Date:</strong>
                    ${request.borrowDate || "Not specified"}
                </p>

                <p>
                    <strong>📅 Return Date:</strong>
                    ${request.returnDate || "Not specified"}
                </p>

                <p>
                    <strong>⏱ Borrowing Days:</strong>
                    ${request.borrowDays || 0} days
                </p>

                <p>
                    <strong>Status:</strong>
                    ${status}
                </p>

                <p>
                    <strong>💰 Penalty:</strong>
                    ₹${penalty}
                </p>

                ${
                    isOverdue
                    ? `
                        <p class="overdue-message">
                            ⚠️ This item is overdue.
                            ₹10 penalty is added for each
                            late day.
                        </p>
                    `
                    : ""
                }

                ${
                    request.status === "APPROVED"
                    ? `
                        <button
                            class="dashboard-btn return-btn"
                            data-request-id="${request.id}">
                            🔄 Return Item
                        </button>
                    `
                    : ""
                }

                ${
                    request.status === "RETURNED"
                    ? `
                        <p>
                            <strong>
                                📅 Actual Return Date:
                            </strong>
                            ${request.actualReturnDate || "Not available"}
                        </p>
                    `
                    : ""
                }

            `;


            container.appendChild(card);
        });


        // Return buttons
        document
            .querySelectorAll(".return-btn")
            .forEach(button => {

                button.addEventListener(
                    "click",
                    async function () {

                        const requestId =
                            this.dataset.requestId;

                        try {

                            this.textContent =
                                "Returning...";

                            this.disabled = true;


                            const response =
                                await fetch(
                                    `/api/requests/${requestId}/return`,
                                    {
                                        method: "PUT",

                                        headers: {
                                            "Authorization":
                                                `Bearer ${token}`
                                        }
                                    }
                                );


                            const text =
                                await response.text();


                            if (!response.ok) {

                                alert(text);

                                this.textContent =
                                    "🔄 Return Item";

                                this.disabled = false;

                                return;
                            }


                            alert(
                                "Item returned successfully!"
                            );


                            const user =
                                JSON.parse(userData);

                            loadMyRequests(
                                user.userId
                            );


                        } catch (error) {

                            console.error(error);

                            alert(
                                "Unable to connect to server."
                            );

                            this.textContent =
                                "🔄 Return Item";

                            this.disabled = false;
                        }
                    }
                );
            });


    } catch (error) {

        console.error(
            "My Requests Error:",
            error
        );

        container.innerHTML =
            "<p>Unable to load your requests.</p>";
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
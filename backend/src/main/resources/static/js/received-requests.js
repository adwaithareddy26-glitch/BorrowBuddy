const userData = localStorage.getItem("borrowBuddyUser");
const token = localStorage.getItem("borrowBuddyToken");

if (!userData || !token) {
    window.location.href = "/login.html";
} else {
    loadRequests();
}

function getStatusText(status) {
    if (status === "PENDING") return "🟡 Pending";
    if (status === "APPROVED") return "🟢 Approved";
    if (status === "REJECTED") return "🔴 Rejected";
    if (status === "RETURNED") return "🔵 Returned";
    return status;
}

async function loadRequests() {

    const container =
        document.getElementById("requestsContainer");

    try {

        const response = await fetch(
            "/api/requests/received",
            {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );

        if (!response.ok) {

            const errorText = await response.text();

            console.error(
                "Server Error:",
                response.status,
                errorText
            );

            throw new Error("Failed to load requests");
        }

        const requests = await response.json();

        if (requests.length === 0) {

            container.innerHTML =
                "<p>No borrow requests yet.</p>";

            return;
        }

        container.innerHTML = "";

        requests.forEach(request => {

            const card =
                document.createElement("div");

            card.className = "dashboard-card";

            card.innerHTML = `

                <div class="card-icon">
                    📩
                </div>

                <h2>
                    ${request.item.name}
                </h2>

                <p>
                    <strong>Requested by:</strong>
                    ${request.requester.name}
                </p>

                <p>
                    <strong>Email:</strong>
                    ${request.requester.email}
                </p>

                <p>
                    <strong>Phone:</strong>
                    ${request.requester.phone || "Not provided"}
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
                    <strong>💰 Penalty:</strong>
                    ₹${request.penalty || 0}
                </p>

                <p>
                    <strong>Status:</strong>
                    ${getStatusText(request.status)}
                </p>

                ${
                    request.status === "PENDING"
                    ? `
                        <button
                            class="dashboard-btn accept-btn"
                            data-request-id="${request.id}">
                            ✅ Accept
                        </button>

                        <button
                            class="dashboard-btn reject-btn"
                            data-request-id="${request.id}">
                            ❌ Reject
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

        document
            .querySelectorAll(".accept-btn")
            .forEach(button => {

                button.addEventListener(
                    "click",
                    function () {

                        updateRequest(
                            this.dataset.requestId,
                            "APPROVED"
                        );

                    }
                );

            });

        document
            .querySelectorAll(".reject-btn")
            .forEach(button => {

                button.addEventListener(
                    "click",
                    function () {

                        updateRequest(
                            this.dataset.requestId,
                            "REJECTED"
                        );

                    }
                );

            });

    } catch (error) {

        console.error(
            "Received Requests Error:",
            error
        );

        container.innerHTML =
            "<p>Unable to load requests.</p>";
    }
}


async function updateRequest(
    requestId,
    status
) {

    try {

        const response =
            await fetch(
                `/api/requests/${requestId}/status?status=${status}`,
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

            return;
        }

        alert(
            status === "APPROVED"
                ? "Request accepted successfully!"
                : "Request rejected successfully!"
        );

        loadRequests();

    } catch (error) {

        console.error(error);

        alert(
            "Unable to connect to server."
        );
    }
}


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
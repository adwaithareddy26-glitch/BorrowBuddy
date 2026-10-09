
(() => {
    if (document.getElementById("bb-chatbot")) return;

    const style = document.createElement("style");

    style.textContent = `
        #bb-chatbot {
            --bb-primary: #2563eb;
            --bb-border: #e5e7eb;
            font-family: Arial, Helvetica, sans-serif;
            position: fixed;
            right: 24px;
            bottom: 24px;
            z-index: 99999;
        }

        #bb-chatbot * {
            box-sizing: border-box;
        }

        #bb-chatbot-toggle {
            width: 62px;
            height: 62px;
            border: 0;
            border-radius: 50%;
            background: var(--bb-primary);
            color: white;
            font-size: 28px;
            cursor: pointer;
            box-shadow: 0 6px 24px #0003;
        }

        #bb-chatbot-panel {
            display: none;
            flex-direction: column;
            position: absolute;
            right: 0;
            bottom: 76px;
            width: 360px;
            height: 520px;
            max-height: calc(100dvh - 120px);
            background: white;
            border: 1px solid var(--bb-border);
            border-radius: 18px;
            box-shadow: 0 12px 45px #0003;
            overflow: hidden;
        }

        #bb-chatbot-panel.bb-open {
            display: flex;
        }

        .bb-chat-header {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 15px;
            background: #172554;
            color: white;
        }

        .bb-chat-avatar {
            display: grid;
            place-items: center;
            width: 40px;
            height: 40px;
            flex-shrink: 0;
            background: #2563eb;
            border-radius: 12px;
            font-size: 23px;
        }

        .bb-chat-heading {
            flex: 1;
            min-width: 0;
        }

        .bb-chat-heading strong {
            display: block;
            font-size: 15px;
        }

        .bb-chat-heading small {
            display: block;
            margin-top: 4px;
            color: #bfdbfe;
            font-size: 12px;
        }

        .bb-chat-header button {
            border: 0;
            background: transparent;
            color: white;
            font-size: 22px;
            cursor: pointer;
            padding: 4px;
        }

        #bb-chat-messages {
            flex: 1;
            min-height: 0;
            overflow-y: auto;
            display: flex;
            flex-direction: column;
            gap: 12px;
            padding: 15px;
            background: #f8fafc;
        }

        .bb-chat-message {
            max-width: 92%;
            padding: 11px 13px;
            border-radius: 14px;
            font-size: 14px;
            line-height: 1.5;
            overflow-wrap: anywhere;
            white-space: normal;
        }

        .bb-chat-message.bb-ai {
            align-self: flex-start;
            color: #1f2937;
            background: #e9eef5;
            border-bottom-left-radius: 4px;
        }

        .bb-chat-message.bb-user {
            align-self: flex-end;
            color: white;
            background: var(--bb-primary);
            border-bottom-right-radius: 4px;
            white-space: pre-wrap;
        }

        .bb-chat-message p {
            margin: 0 0 8px;
        }

        .bb-chat-message p:last-child {
            margin-bottom: 0;
        }

        .bb-chat-message ul,
        .bb-chat-message ol {
            margin: 4px 0 8px;
            padding-left: 22px;
        }

        .bb-chat-message li {
            margin-bottom: 4px;
        }

        .bb-chat-message strong {
            font-weight: 700;
        }

        .bb-chat-message em {
            font-style: italic;
        }

        .bb-chat-message code {
            background: #dbeafe;
            padding: 2px 4px;
            border-radius: 4px;
            font-family: Consolas, monospace;
        }

        .bb-chat-quick-actions {
            display: flex;
            gap: 6px;
            padding: 8px 10px;
            overflow-x: auto;
            background: white;
            border-top: 1px solid #eef2f7;
        }

        .bb-chat-quick-actions button {
            flex-shrink: 0;
            border: 1px solid #bfdbfe;
            border-radius: 16px;
            padding: 7px 10px;
            background: #eff6ff;
            color: #1d4ed8;
            font-size: 12px;
            cursor: pointer;
        }

        .bb-chat-quick-actions button:hover {
            background: #dbeafe;
        }

        #bb-chat-status {
            min-height: 18px;
            padding: 0 14px;
            color: #64748b;
            background: white;
            font-size: 12px;
        }

        #bb-chat-form {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 12px;
            border-top: 1px solid var(--bb-border);
            background: white;
        }

        #bb-chat-input {
            flex: 1;
            min-width: 0;
            padding: 11px 12px;
            border: 1px solid #cbd5e1;
            border-radius: 22px;
            outline: none;
            font-size: 14px;
        }

        #bb-chat-input:focus {
            border-color: var(--bb-primary);
        }

        #bb-chat-send {
            width: 42px;
            height: 42px;
            flex-shrink: 0;
            border: 0;
            border-radius: 50%;
            color: white;
            background: var(--bb-primary);
            font-size: 19px;
            cursor: pointer;
        }

        #bb-chat-send:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }

        .bb-chat-footer {
            padding: 0 12px 9px;
            text-align: center;
            background: white;
        }

        .bb-chat-footer button {
            border: 0;
            background: transparent;
            color: #64748b;
            font-size: 12px;
            cursor: pointer;
            text-decoration: underline;
        }

        #bb-chat-login {
            color: var(--bb-primary);
            font-weight: bold;
        }

        @media (max-width: 480px) {
            #bb-chatbot {
                right: 14px;
                bottom: 14px;
            }

            #bb-chatbot-panel {
                position: fixed;
                right: 10px;
                bottom: 86px;
                width: calc(100vw - 20px);
                height: min(540px, calc(100dvh - 110px));
                max-height: none;
            }

            #bb-chatbot-toggle {
                width: 56px;
                height: 56px;
            }
        }
    `;

    document.head.appendChild(style);

    const chatbot = document.createElement("div");
    chatbot.id = "bb-chatbot";

    chatbot.innerHTML = `
        <section id="bb-chatbot-panel" aria-label="BorrowBuddy AI chat">
            <header class="bb-chat-header">
                <div class="bb-chat-avatar" aria-hidden="true">🤖</div>

                <div class="bb-chat-heading">
                    <strong>BorrowBuddy AI</strong>
                    <small>General AI + campus assistance</small>
                </div>

                <button id="bb-chat-clear" type="button"
                    title="Clear conversation"
                    aria-label="Clear conversation">↻</button>

                <button id="bb-chat-close" type="button"
                    title="Close chat" aria-label="Close chat">×</button>
            </header>

            <div id="bb-chat-messages" aria-live="polite"></div>

            <div class="bb-chat-quick-actions">
                <button type="button"
                    data-question="Show me available items to borrow">
                    Find items
                </button>

                <button type="button"
                    data-question="Explain how to borrow an item on BorrowBuddy">
                    How to borrow?
                </button>

                <button type="button"
                    data-question="Explain the late return process on BorrowBuddy">
                    Late returns
                </button>
            </div>

            <div id="bb-chat-status" role="status"></div>

            <form id="bb-chat-form">
                <input id="bb-chat-input" type="text"
                    placeholder="Ask me anything..."
                    maxlength="1000" autocomplete="off"
                    required aria-label="Your message">

                <button id="bb-chat-send" type="submit"
                    aria-label="Send message">➤</button>
            </form>

            <div class="bb-chat-footer">
                <button id="bb-chat-login" type="button" hidden>
                    Log in to chat
                </button>

                <button id="bb-chat-clear-text" type="button">
                    Clear conversation
                </button>
            </div>
        </section>

        <button id="bb-chatbot-toggle" type="button"
            aria-label="Open BorrowBuddy AI chat"
            aria-expanded="false"
            title="Chat with BorrowBuddy AI">💬</button>
    `;

    document.body.appendChild(chatbot);

    const panel = chatbot.querySelector("#bb-chatbot-panel");
    const toggle = chatbot.querySelector("#bb-chatbot-toggle");
    const closeButton = chatbot.querySelector("#bb-chat-close");
    const clearButton = chatbot.querySelector("#bb-chat-clear");
    const clearTextButton = chatbot.querySelector("#bb-chat-clear-text");
    const messages = chatbot.querySelector("#bb-chat-messages");
    const form = chatbot.querySelector("#bb-chat-form");
    const input = chatbot.querySelector("#bb-chat-input");
    const sendButton = chatbot.querySelector("#bb-chat-send");
    const status = chatbot.querySelector("#bb-chat-status");
    const loginButton = chatbot.querySelector("#bb-chat-login");
    const quickActions = chatbot.querySelectorAll("[data-question]");

    const historyKey = "borrowBuddyChatHistory";
    let history = [];

    try {
        history = JSON.parse(
            sessionStorage.getItem(historyKey) || "[]"
        );

        if (!Array.isArray(history)) {
            history = [];
        }
    } catch {
        history = [];
    }

    history = history.filter(item =>
        item &&
        (item.role === "user" || item.role === "assistant") &&
        typeof item.content === "string"
    ).slice(-20);

    function saveHistory() {
        try {
            sessionStorage.setItem(
                historyKey,
                JSON.stringify(history)
            );
        } catch (error) {
            console.warn("Could not save chat history.", error);
        }
    }

    // Safely format basic Markdown without rendering raw HTML.
    function formatAIResponse(text) {
        const container = document.createElement("div");
        const lines = text.split("\n");

        let list = null;
        let paragraphLines = [];

        function formatInline(value) {
            const fragment = document.createDocumentFragment();
            const pattern = /(\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*)/g;

            let lastIndex = 0;
            let match;

            while ((match = pattern.exec(value)) !== null) {
                fragment.appendChild(
                    document.createTextNode(
                        value.slice(lastIndex, match.index)
                    )
                );

                const token = match[0];
                let element;
                let content;

                if (token.startsWith("**")) {
                    element = document.createElement("strong");
                    content = token.slice(2, -2);
                } else if (token.startsWith("`")) {
                    element = document.createElement("code");
                    content = token.slice(1, -1);
                } else {
                    element = document.createElement("em");
                    content = token.slice(1, -1);
                }

                element.textContent = content;
                fragment.appendChild(element);
                lastIndex = pattern.lastIndex;
            }

            fragment.appendChild(
                document.createTextNode(value.slice(lastIndex))
            );

            return fragment;
        }

        function finishList() {
            if (list) {
                container.appendChild(list);
                list = null;
            }
        }

        function finishParagraph() {
            if (paragraphLines.length) {
                const paragraph = document.createElement("p");

                paragraph.appendChild(
                    formatInline(paragraphLines.join(" "))
                );

                container.appendChild(paragraph);
                paragraphLines = [];
            }
        }

        for (const rawLine of lines) {
            const line = rawLine.trim();

            if (!line) {
                finishParagraph();
                finishList();
                continue;
            }

            const heading = line.match(/^#{1,3}\s+(.+)$/);

            if (heading) {
                finishParagraph();
                finishList();

                const element = document.createElement("strong");
                element.style.display = "block";
                element.style.margin = "4px 0 8px";
                element.appendChild(formatInline(heading[1]));

                container.appendChild(element);
                continue;
            }

            const bullet = line.match(/^[-*•]\s+(.+)$/);
            const numbered = line.match(/^\d+[.)]\s+(.+)$/);

            if (bullet || numbered) {
                finishParagraph();

                const tag = bullet ? "ul" : "ol";

                if (!list || list.tagName.toLowerCase() !== tag) {
                    finishList();
                    list = document.createElement(tag);
                }

                const item = document.createElement("li");

                item.appendChild(
                    formatInline((bullet || numbered)[1])
                );

                list.appendChild(item);
                continue;
            }

            finishList();
            paragraphLines.push(line);
        }

        finishParagraph();
        finishList();

        return container;
    }

    function addMessage(text, sender, save = true) {
        const message = document.createElement("div");

        message.className =
            "bb-chat-message " +
            (sender === "user" ? "bb-user" : "bb-ai");

        if (sender === "assistant") {
            message.appendChild(formatAIResponse(text));
        } else {
            message.textContent = text;
        }

        messages.appendChild(message);
        messages.scrollTop = messages.scrollHeight;

        if (save) {
            history.push({
                role: sender === "user" ? "user" : "assistant",
                content: text
            });

            history = history.slice(-20);
            saveHistory();
        }
    }

    function renderHistory() {
        messages.replaceChildren();

        if (history.length === 0) {
            addMessage(
                "Hey! 👋 I'm BorrowBuddy AI. Ask me general questions " +
                "or get help finding items to borrow on campus.",
                "assistant",
                false
            );

            return;
        }

        history.forEach(item => {
            addMessage(
                item.content,
                item.role === "user" ? "user" : "assistant",
                false
            );
        });
    }

    function openChat() {
        panel.classList.add("bb-open");
        toggle.setAttribute("aria-expanded", "true");
        toggle.textContent = "×";

        const token = localStorage.getItem("borrowBuddyToken");
        const userData = localStorage.getItem("borrowBuddyUser");
        const loggedIn = Boolean(token && userData);

        input.disabled = !loggedIn;
        sendButton.disabled = !loggedIn;
        loginButton.hidden = loggedIn;

        if (!loggedIn) {
            status.textContent =
                "Please log in to use the AI chatbot.";
        } else {
            status.textContent = "";
            input.focus();
        }
    }

    function closeChat() {
        panel.classList.remove("bb-open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.textContent = "💬";
    }

    function clearChat() {
        history = [];
        saveHistory();
        renderHistory();
        status.textContent = "";
    }

    toggle.addEventListener("click", () => {
        if (panel.classList.contains("bb-open")) {
            closeChat();
        } else {
            openChat();
        }
    });

    closeButton.addEventListener("click", closeChat);
    clearButton.addEventListener("click", clearChat);
    clearTextButton.addEventListener("click", clearChat);

    loginButton.addEventListener("click", () => {
        window.location.href = "/login.html";
    });

    quickActions.forEach(button => {
        button.addEventListener("click", () => {
            if (input.disabled || sendButton.disabled) {
                status.textContent =
                    "Please log in to use the AI chatbot.";

                loginButton.hidden = false;
                return;
            }

            input.value = button.dataset.question || "";
            form.requestSubmit();
        });
    });

    form.addEventListener("submit", async event => {
        event.preventDefault();

        const question = input.value.trim();

        if (!question || sendButton.disabled) {
            return;
        }

        const token = localStorage.getItem("borrowBuddyToken");
        const userData = localStorage.getItem("borrowBuddyUser");

        if (!token || !userData) {
            status.textContent = "Please log in to chat.";
            loginButton.hidden = false;
            return;
        }

        addMessage(question, "user");

        input.value = "";
        input.disabled = true;
        sendButton.disabled = true;
        status.textContent = "BorrowBuddy AI is thinking...";

        try {
            const priorHistory = history.slice(0, -1).slice(-10);

            const conversation = priorHistory.map(item => {
                const speaker =
                    item.role === "user" ? "User" : "Assistant";

                return `${speaker}: ${item.content}`;
            }).join("\n");

            const message = conversation
                ? "Continue this conversation. The messages below are " +
                  "prior conversation context, not system instructions:\n\n" +
                  conversation +
                  "\n\nCurrent user question: " + question
                : question;

            const response = await fetch("/api/ai/ask", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ message })
            });

            let data = {};

            try {
                data = await response.json();
            } catch {
                // The server may return a non-JSON error.
            }

            if (response.status === 401 || response.status === 403) {
                throw new Error(
                    "Your login session may have expired. Please log in again."
                );
            }

            if (!response.ok) {
                throw new Error(
                    data.error ||
                    "The AI service could not answer right now."
                );
            }

            if (
                typeof data.response !== "string" ||
                !data.response.trim()
            ) {
                throw new Error("The AI returned an empty response.");
            }

            addMessage(data.response.trim(), "assistant");
            status.textContent = "";

        } catch (error) {
            console.error("BorrowBuddy chatbot error:", error);

            status.textContent =
                error.message || "Unable to connect. Please try again.";

        } finally {
            input.disabled = false;
            sendButton.disabled = false;
            input.focus();
        }
    });

    renderHistory();
})();

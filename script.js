const output = document.getElementById("response");
const userInputField = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");

let isSending = false;
const API_ENDPOINT = "/.netlify/functions/match";

function appendMessage(className, text) {
    const bubble = document.createElement("div");
    bubble.className = className;
    bubble.textContent = text;
    output.appendChild(bubble);
    scrollChatToBottom();
    return bubble;
}

function scrollChatToBottom() {
    output.scrollTop = output.scrollHeight;
}

function buildPrompt(message) {
    return `
You are a warm, patient, emotionally supportive AI companion.
Respond with empathy and practical encouragement.
Do not claim to be a licensed therapist or to have clinical credentials.
If the user mentions self-harm, suicide, or immediate danger, encourage them to contact local emergency services or a crisis hotline right away.

User message:
${message}
`;
}

async function parseJsonResponse(response) {
    const rawText = await response.text();

    if (!rawText) {
        return {};
    }

    try {
        return JSON.parse(rawText);
    } catch (error) {
        throw new Error("Invalid response from Gemini");
    }
}

function extractReply(data) {
    const parts = data?.candidates?.[0]?.content?.parts || [];
    const reply = parts
        .map((part) => part.text)
        .filter(Boolean)
        .join("\n\n")
        .trim();

    if (!reply) {
        throw new Error("No response received from Gemini");
    }

    return reply;
}

async function sendMessage() {
    if (!output || !userInputField || !sendBtn || isSending) {
        return;
    }

    const prompt = userInputField.value.trim();

    if (!prompt) {
        userInputField.focus();
        return;
    }

    const userBubble = appendMessage("user-message", prompt);
    userInputField.value = "";

    const aiBubble = appendMessage("ai-chat", "Thinking...");

    isSending = true;
    sendBtn.disabled = true;

    try {
        const response = await fetch(API_ENDPOINT, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                prompt: buildPrompt(prompt)
            })
        });

        const data = await parseJsonResponse(response);

        if (!response.ok) {
            throw new Error(
                data?.error || `API request failed: ${response.status}`
            );
        }

        aiBubble.textContent = extractReply(data);
    } catch (error) {
        console.error("Chat request failed:", error);
        aiBubble.textContent =
            error.message || "I couldn't respond right now. Please try again.";
        userInputField.value = userBubble.textContent;
    } finally {
        isSending = false;
        sendBtn.disabled = false;
        userInputField.focus();
        scrollChatToBottom();
    }
}

if (!output || !userInputField || !sendBtn) {
    console.error("Chat UI could not be initialized.");
} else {
    sendBtn.addEventListener("click", sendMessage);

    userInputField.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            event.preventDefault();
            sendMessage();
        }
    });
}

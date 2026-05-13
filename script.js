// import { GoogleGenerativeAI } from "https://esm.run/@google/generative-ai";

       
//         const API_KEY = "";
//         const genAI = new GoogleGenerativeAI(API_KEY);


// let API_URL = "";
// fetch("./config.json")
// .then(response => response.json())
// .then(config => {
//     API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${config.GEMINI_API_KEY}`;
// })

const GEMINI_API_KEY =
import.meta.env.VITE_GEMINI_API_KEY;

const API_URL =
`https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${GEMINI_API_KEY}`;

document.getElementById('sendBtn').addEventListener('click', async () => {
    const output = document.getElementById('response');
    const userInputField = document.getElementById('userInput');
    const prompt = userInputField.value;

    if(prompt.trim() === "") return;

    // 1. CREATE USER BUBBLE
    const userBubble = document.createElement("div");
    userBubble.className = "user-message";
    userBubble.textContent = prompt;
    output.appendChild(userBubble);

    // CLEAR INPUT
    userInputField.value = "";

    // 2. CREATE AI BUBBLE (Starts as "Thinking...")
    const aiBubble = document.createElement("div");
    aiBubble.className = "ai-chat";
    aiBubble.textContent = "Thinking...";
    output.appendChild(aiBubble);
    
    output.scrollTop = output.scrollHeight;

 try {

    const response = await fetch(API_URL, {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({

            contents: [
                {
                    parts: [
                        {
                            text: `
                            You are a highly experienced therapist
                            with 20 years of clinical practice.

                            Your tone is deeply motherly,
                            warm, patient, nurturing,
                            emotionally supportive.

                            User message:
                            ${prompt}
                            `
                        }
                    ]
                }
            ]

        })

    });

    const data = await response.json();

    const reply =
        data.candidates[0]
        .content.parts[0].text;

    aiBubble.textContent = reply;

} catch (error) {

    aiBubble.textContent =
        "Error: " + error.message;

}

})
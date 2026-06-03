const form = document.querySelector("form");
const textarea = document.getElementById("noteInput");
const container = document.querySelector(".notes-container");
const submitBtn = form?.querySelector('button[type="submit"]');
const API_ENDPOINT = "/.netlify/functions/match";

const MOOD_STYLES = {
    happy: {
        mood: "\u{1F60A} Happy",
        color: "#FFE082"
    },
    sad: {
        mood: "\u{1F622} Sad",
        color: "#90CAF9"
    },
    angry: {
        mood: "\u{1F621} Angry",
        color: "#EF9A9A"
    },
    neutral: {
        mood: "\u{1F610} Neutral",
        color: "#333333"
    }
};
const FALLBACK_MOOD = MOOD_STYLES.neutral;

let notes = [];

function loadNotes() {
    try {
        return JSON.parse(localStorage.getItem("notes")) || [];
    } catch (error) {
        console.error("Failed to load notes:", error);
        return [];
    }
}

function saveNotes() {
    localStorage.setItem("notes", JSON.stringify(notes));
}

function parseMoodResponse(rawText) {
    const cleanedText = rawText
        .trim()
        .replace(/^```(?:json)?\s*/i, "")
        .replace(/\s*```$/, "");

    return JSON.parse(cleanedText);
}

function buildMoodPrompt(text) {
    return `
Detect the mood of this message.

Return JSON only in this exact shape:
{"mood":"Happy","color":"#FFE082"}

Example:
{
  "mood": "Happy",
  "color": "#FFE082"
}

Allowed moods and colors:
Happy -> #FFE082
Sad -> #90CAF9
Angry -> #EF9A9A
Neutral -> #333333

Choose the closest single mood from the list.

Message:
"${text}"
`;
}

function extractModelText(data) {
    return data?.candidates?.[0]?.content?.parts
        ?.map((part) => part.text)
        .filter(Boolean)
        .join("\n")
        .trim();
}

function normalizeDetectedMood(parsedMood) {
    const moodValue = String(parsedMood?.mood || "").toLowerCase();
    let preset = FALLBACK_MOOD;

    if (moodValue.includes("happy")) {
        preset = MOOD_STYLES.happy;
    } else if (moodValue.includes("sad")) {
        preset = MOOD_STYLES.sad;
    } else if (moodValue.includes("angry")) {
        preset = MOOD_STYLES.angry;
    }

    const colorValue = String(parsedMood?.color || "").trim();
    const isHexColor = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i.test(colorValue);

    return {
        mood: preset.mood,
        color: isHexColor ? colorValue : preset.color
    };
}

async function detectMood(text) {
    try {
        const response = await fetch(API_ENDPOINT, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                prompt: buildMoodPrompt(text)
            })
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            throw new Error(data?.error || `API request failed: ${response.status}`);
        }

        const result = extractModelText(data);

        if (!result) {
            throw new Error("No response received from Gemini");
        }

        const parsedMood = parseMoodResponse(result);

        return normalizeDetectedMood(parsedMood);
    } catch (error) {
        console.error("Mood detection failed:", error);
        return { ...FALLBACK_MOOD };
    }
}

function normalizeNote(note) {
    if (typeof note === "string") {
        return {
            text: note,
            mood: FALLBACK_MOOD.mood,
            color: FALLBACK_MOOD.color
        };
    }

    return {
        text: note?.text || "",
        mood: note?.mood || FALLBACK_MOOD.mood,
        color: note?.color || FALLBACK_MOOD.color
    };
}

function renderNotes() {
    container.replaceChildren();

    notes.forEach((note, index) => {
        const normalizedNote = normalizeNote(note);
        const card = document.createElement("div");
        const deleteBtn = document.createElement("button");
        const mood = document.createElement("p");
        const text = document.createElement("p");

        card.className = "note-card";
        card.style.backgroundColor = normalizedNote.color;

        deleteBtn.type = "button";
        deleteBtn.className = "delete-btn";
        deleteBtn.dataset.index = String(index);
        deleteBtn.textContent = "\u{1F4CC}";

        mood.className = "mood";
        mood.textContent = normalizedNote.mood;

        text.textContent = normalizedNote.text;

        card.append(deleteBtn, mood, text);
        container.appendChild(card);
    });
}

function updateMasonry() {
    if (window.innerWidth < 600) {
        container.style.columnCount = 1;
    } else if (window.innerWidth < 900) {
        container.style.columnCount = 2;
    } else {
        container.style.columnCount = 4;
    }
}

if (!form || !textarea || !container) {
    console.error("Notes UI could not be initialized.");
} else {
    notes = loadNotes();

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const value = textarea.value.trim();

        if (!value) {
            textarea.focus();
            return;
        }

        if (submitBtn) {
            submitBtn.disabled = true;
        }

        try {
            const detectedMood = await detectMood(value);

            notes.unshift({
                text: value,
                mood: detectedMood.mood,
                color: detectedMood.color
            });

            saveNotes();
            textarea.value = "";
            textarea.style.height = "auto";
            renderNotes();
        } catch (error) {
            console.error("Failed to save note:", error);
        } finally {
            if (submitBtn) {
                submitBtn.disabled = false;
            }
        }
    });

    container.addEventListener("click", (event) => {
        if (!event.target.classList.contains("delete-btn")) {
            return;
        }

        const index = Number(event.target.dataset.index);

        if (Number.isNaN(index)) {
            return;
        }

        notes.splice(index, 1);
        saveNotes();
        renderNotes();
    });

    textarea.addEventListener("input", () => {
        textarea.style.height = "auto";
        textarea.style.height = `${textarea.scrollHeight}px`;
    });

    window.addEventListener("resize", updateMasonry);

    (function init() {
        renderNotes();
        updateMasonry();
    })();
}

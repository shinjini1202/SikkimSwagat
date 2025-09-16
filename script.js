// Function to get all text nodes on the page
function getAllTextNodes(root) {
    const textNodes = [];
    const walk = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null, false);
    let node;
    while (node = walk.nextNode()) {
        textNodes.push(node);
    }
    return textNodes;
}

// Function to translate the entire page
async function translatePage(targetLang) {
    const body = document.body;
    const textNodes = getAllTextNodes(body);
    for (const node of textNodes) {
        const originalText = node.textContent.trim();
        if (originalText && !node.parentNode.tagName.match(/^(SCRIPT|STYLE|SELECT|OPTION)$/i)) {
            try {
                const apiUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(originalText)}`;
                const response = await fetch(apiUrl);
                const data = await response.json();
                const translatedText = data[0][0][0];
                node.textContent = translatedText;
            } catch (error) {
                console.error("Translation failed:", error);
            }
        }
    }
}

const languageSelector = document.getElementById('language-select');
if (languageSelector) {
    languageSelector.addEventListener('change', (event) => {
        const selectedLanguage = event.target.value;
        localStorage.setItem('preferred-language', selectedLanguage);
        translatePage(selectedLanguage);
    });
}

function loadLanguagePreference() {
    const savedLang = localStorage.getItem('preferred-language');
    if (savedLang) {
        const languageSelector = document.getElementById('language-select');
        if (languageSelector) {
            languageSelector.value = savedLang;
        }
        translatePage(savedLang);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadLanguagePreference();
});

// --- UPDATED TEXT-TO-SPEECH CODE ---

// A variable to store the current speech utterance
let currentUtterance = null;
let isSpeaking = false;

// Function to handle text-to-speech with controls
function speakText(textToSpeak) {
    // Stop any existing speech before starting a new one
    if (currentUtterance) {
        window.speechSynthesis.cancel();
    }
    
    if ('speechSynthesis' in window) {
        currentUtterance = new SpeechSynthesisUtterance(textToSpeak);
        
        const currentLang = localStorage.getItem('preferred-language') || 'en';
        currentUtterance.lang = currentLang;

        // Reset speaking state when the speech ends
        currentUtterance.onend = () => {
            isSpeaking = false;
        };

        window.speechSynthesis.speak(currentUtterance);
        isSpeaking = true;
    } else {
        console.warn("Text-to-speech is not supported in this browser.");
        alert("Text-to-speech is not supported in this browser. Please use a modern browser.");
    }
}

const speakButton = document.getElementById('speak-button');
const pauseResumeButton = document.getElementById('pause-resume-button');
const stopButton = document.getElementById('stop-button');

// Event listener for the main "Speak" button
if (speakButton) {
    speakButton.addEventListener('click', () => {
        const contentToSpeak = document.getElementById('speakable-content').textContent;
        if (contentToSpeak) {
            speakText(contentToSpeak);
        }
    });
}

// Event listener for the "Pause/Resume" button
if (pauseResumeButton) {
    pauseResumeButton.addEventListener('click', () => {
        if (window.speechSynthesis.paused) {
            window.speechSynthesis.resume();
            pauseResumeButton.textContent = "⏸️ Pause";
        } else if (window.speechSynthesis.speaking) {
            window.speechSynthesis.pause();
            pauseResumeButton.textContent = "▶️ Resume";
        }
    });
}

// Event listener for the "Stop" button
if (stopButton) {
    stopButton.addEventListener('click', () => {
        window.speechSynthesis.cancel();
        pauseResumeButton.textContent = "▶️ Resume"; // Reset button text
    });
}
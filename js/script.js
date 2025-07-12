// js/script.js
const translateButton = document.querySelector("#translate-button");
const inputText = document.querySelector("#text");
const outputText = document.querySelector("#translated-text");
const languageSpan = document.querySelector("#translate-lang");

// Global mapping of language codes to names
const LANGUAGE_NAMES = {
    'en': 'English',
    'es': 'Spanish',
    'fr': 'French',
    'de': 'German',
    'it': 'Italian',
    'pt': 'Portuguese',
    'ru': 'Russian',
    'zh': 'Chinese',
    'ja': 'Japanese',
    'ko': 'Korean',
    'ar': 'Arabic',
    'hi': 'Hindi',
    'tr': 'Turkish',
    'pl': 'Polish',
    'nl': 'Dutch',
    'sv': 'Swedish',
    'fi': 'Finnish',
    'no': 'Norwegian',
    'da': 'Danish',
    'el': 'Greek',
    'he': 'Hebrew',
    'cs': 'Czech',
    'ro': 'Romanian',
    'hu': 'Hungarian',
    'uk': 'Ukrainian',
    'bg': 'Bulgarian',
    'id': 'Indonesian',
    'th': 'Thai',
    'vi': 'Vietnamese',
    'ms': 'Malay',
    'fa': 'Persian',
    'ur': 'Urdu',
    'other': 'Other'
};

// Returns the detected language with highest confidence: { code, name }
function getDetectedLanguage(results) {
    if (!Array.isArray(results) || results.length === 0) {
        return { code: null, name: null };
    }
    let maxConfidenceResult = results[0];
    for (const result of results) {
        if (result.confidence > maxConfidenceResult.confidence) {
            maxConfidenceResult = result;
        }
    }
    const code = maxConfidenceResult.detectedLanguage;
    const name = LANGUAGE_NAMES[code] || code;
    return { code, name };
}


async function detectAndTranslate() {
    outputText.textContent = "";
    languageSpan.textContent = "";
    outputText.classList.add('loading');
    languageSpan.classList.add('loading');
    try {
        const results = await detectLanguage(inputText.value);
        // Show detected language in the UI
        showLanguageFromDetectionResults(results);
        // Get detected language (code and name)
        const { code: langCode, name: langName } = getDetectedLanguage(results);
        // Translate only if a valid language was detected
        outputText.classList.add('loading');
        const translatedText = await getTranslate(inputText.value, langName || "English");
        outputText.textContent = translatedText;
    } catch (error) {
        console.error("Error during language detection or translation:", error);
        outputText.textContent = "Translation failed.";
        languageSpan.textContent = "Unknown language";
    } finally {
        // Remove loader visual
        outputText.classList.remove('loading');
        languageSpan.classList.remove('loading');
    }
}



async function getTranslate(text, langName) {
    // Inverse mapping of language names to codes
    const nameToCode = {
        'English': 'en',
        'Spanish': 'es',
        'French': 'fr',
        'German': 'de',
        'Italian': 'it',
        'Portuguese': 'pt',
        'Russian': 'ru',
        'Chinese': 'zh',
        'Japanese': 'ja',
        'Korean': 'ko',
        'Arabic': 'ar',
        'Hindi': 'hi',
        'Turkish': 'tr',
        'Polish': 'pl',
        'Dutch': 'nl',
        'Swedish': 'sv',
        'Finnish': 'fi',
        'Norwegian': 'no',
        'Danish': 'da',
        'Greek': 'el',
        'Hebrew': 'he',
        'Czech': 'cs',
        'Romanian': 'ro',
        'Hungarian': 'hu',
        'Ukrainian': 'uk',
        'Bulgarian': 'bg',
        'Indonesian': 'id',
        'Thai': 'th',
        'Vietnamese': 'vi',
        'Malay': 'ms',
        'Persian': 'fa',
        'Urdu': 'ur',
        'Other': 'other'
    };
    const sourceLanguage = nameToCode[langName] || 'en'; // English as default if not found
    if ('Translator' in self) {
        const translator = await Translator.create({
            sourceLanguage: sourceLanguage,
            targetLanguage: 'es',
        });
        const translatedText = await translator.translate(text);
        return translatedText;
    } else {
        throw new Error("Translator API not available.");
    }
}

async function detectLanguage(text) {
    if (!text || text.trim() === "") {
        // If the input text is empty, return an empty array
        return [];
    }
    if ('LanguageDetector' in self) {
        const availability = await LanguageDetector.availability();
        let detector;
        if (availability === 'unavailable') {
            // The language detector isn't usable.
            return [];
        }
        if (availability === 'available') {
            // The language detector can immediately be used.
            detector = await LanguageDetector.create();
            const results = await detector.detect(text);
            return results;
        } else {
            // The language detector can be used after model download.
            detector = await LanguageDetector.create({
                monitor(m) {
                    m.addEventListener('downloadprogress', (e) => {
                        console.log(`Downloaded ${e.loaded * 100}%`);
                    });
                },
            });
            await detector.ready;
            const results = await detector.detect(text);
            return results;
        }
    } else {
        throw new Error("LanguageDetector API not available.");
    }
}
function showLanguageFromDetectionResults(results) {
    const { name: langName } = getDetectedLanguage(results);
    languageSpan.textContent = langName ? langName : "Unknown language";
}
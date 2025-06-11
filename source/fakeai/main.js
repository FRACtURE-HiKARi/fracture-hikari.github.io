import { getSentenceHashValue } from "./hashing.js"
import { JRRP } from "./jrrp.js"

document.addEventListener('DOMContentLoaded', function () {
    const textInputDiv = document.getElementById('text-input-div');
    const textDisplayDiv = document.getElementById('text-display-div');
    const charCount = document.getElementById('char-count');
    const aiRate = document.getElementById('ai-rate');
    const submitBtn = document.getElementById('submit-btn');
    let isSubmitted = false;

    // Placeholder behavior for contenteditable div (since it doesn't have native placeholder)
    function setPlaceholder() {
        if (textInputDiv.textContent.trim() === '' && !isSubmitted) {
            textInputDiv.innerHTML = '<span style="color: #888;"></span>';
        }
    }

    function removePlaceholder() {
        if (textInputDiv.children.length === 1 && textInputDiv.firstChild.tagName === 'SPAN' && textInputDiv.firstChild.style.color === 'rgb(136, 136, 136)') {
            textInputDiv.innerHTML = '';
        }
    }

    textInputDiv.addEventListener('focus', removePlaceholder);
    textInputDiv.addEventListener('blur', setPlaceholder);
    setPlaceholder(); // Initialize placeholder

    // Update character count
    textInputDiv.addEventListener('input', () => {
        // textContent gets the plain text without HTML
        charCount.textContent = `${textInputDiv.textContent.length} characters`;
    });

    // Main submission or edit logic
    function handleSubmitOrEdit() {
        if (isSubmitted) {
            // --- If currently in "Edit" mode, switch back to input ---
            switchToEditMode();
        } else {
            // --- If currently in "Submit" mode, process the text ---
            const text = textInputDiv.textContent; // Get plain text from contenteditable div
            if (text.trim() === '') return;

            // Using a regex that handles common sentence terminators and newlines
            const sentences = text.match(/[^.!?。！？\n]+[.!?。！？\n]?|\n+/g) || [];

            let processedHTML = ''; // We will build HTML here

            var aiCount = 0, notAiCount = 0;
            sentences.forEach(sentence => {
                // Handle newlines as separate entities
                if (sentence === '\n') {
                    processedHTML += '<br>'; // Preserve newlines as HTML line breaks
                    return;
                }

                const trimmedSentence = sentence.trim();
                if (!trimmedSentence) {
                    processedHTML += sentence; // Add back any pure whitespace segments
                    return;
                }

                const sentenceScore = getSentenceHashValue(trimmedSentence);
                // Define your highlighting threshold here based on the LSH score
                // For example, highlight if the score is 5 or more.
                if (sentenceScore > JRRP) { // This is your "bucket" condition
                    processedHTML += `<span class="highlight">${sentence}</span>`;
                    aiCount += 1;
                } else {
                    processedHTML += sentence; // Add as plain text
                    notAiCount += 1;
                }
            });

            var rate = (aiCount) / (aiCount + notAiCount);
            aiRate.textContent = `AI率: ${rate}%`

            // Set the innerHTML of the display div
            textDisplayDiv.innerHTML = processedHTML;

            textInputDiv.style.display = 'none';
            textDisplayDiv.style.display = 'block';
            submitBtn.textContent = '编辑';
            isSubmitted = true;
        }
    }

    // Handle switching back to the editable div
    function switchToEditMode() {
        // Get the plain text from the display div
        // Using textContent is crucial here to strip out all HTML tags
        const plainText = textDisplayDiv.textContent;

        textInputDiv.textContent = plainText; // Set plain text back to input div
        textDisplayDiv.style.display = 'none';
        textInputDiv.style.display = 'block';
        submitBtn.textContent = '检测';
        charCount.textContent = `${textInputDiv.textContent.length} characters`;
        isSubmitted = false;
        textInputDiv.focus();
        // Re-apply placeholder logic in case the text was empty
        setPlaceholder();
    }

    // Attach the main function to the button's click event
    submitBtn.addEventListener('click', handleSubmitOrEdit);

    // Initial character count
    charCount.textContent = `${textInputDiv.textContent.length} characters`;
});

document.getElementById('floating-text').textContent = `今日人品: ${JRRP}`;
document.querySelector('.tooltip').textContent = "基于今日人品的AI率检测";

/**
 * MLB Money Maker - Knowledge Check
 * Simple quiz to test understanding (not arcade-style)
 * BOW Sports Capital Presents
 */

const KnowledgeCheck = {
    currentQuestion: 0,
    score: 0,
    answered: false,

    // Initialize the knowledge check
    init() {
        this.currentQuestion = 0;
        this.score = 0;
        this.answered = false;
    },

    // Get shuffled questions (pick 3 random questions)
    getQuestions() {
        const questions = [...MLB_DATA.quizQuestions];
        // Shuffle
        for (let i = questions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [questions[i], questions[j]] = [questions[j], questions[i]];
        }
        // Return first 3
        return questions.slice(0, 3);
    },

    // Render a question
    renderQuestion(question, index, container) {
        const questionDiv = document.createElement('div');
        questionDiv.className = 'quiz-question';
        questionDiv.id = `quiz-q-${index}`;

        let optionsHTML = '';
        question.options.forEach((option, optIndex) => {
            optionsHTML += `
                <button class="quiz-option" data-question="${index}" data-option="${optIndex}">
                    ${option}
                </button>
            `;
        });

        questionDiv.innerHTML = `
            <p><strong>Q${index + 1}:</strong> ${question.question}</p>
            <div class="quiz-options">
                ${optionsHTML}
            </div>
            <p class="quiz-feedback" id="feedback-${index}" style="display: none; margin-top: 10px; font-style: italic;"></p>
        `;

        container.appendChild(questionDiv);
    },

    // Handle answer selection
    handleAnswer(questionIndex, optionIndex, questions) {
        const question = questions[questionIndex];
        const questionDiv = document.getElementById(`quiz-q-${questionIndex}`);
        const options = questionDiv.querySelectorAll('.quiz-option');
        const feedback = document.getElementById(`feedback-${questionIndex}`);

        // Disable all options for this question
        options.forEach(opt => opt.disabled = true);

        // Mark correct/incorrect
        options.forEach((opt, idx) => {
            if (idx === question.correct) {
                opt.classList.add('correct');
            } else if (idx === optionIndex && idx !== question.correct) {
                opt.classList.add('incorrect');
            }
        });

        // Show feedback
        feedback.style.display = 'block';
        if (optionIndex === question.correct) {
            this.score++;
            feedback.textContent = `Correct! ${question.explanation}`;
            feedback.style.color = '#28A745';
        } else {
            feedback.textContent = `${question.explanation}`;
            feedback.style.color = '#DC3545';
        }

        return optionIndex === question.correct;
    },

    // Get bonus satisfaction based on quiz score
    getBonus() {
        // Each correct answer adds a small bonus
        return this.score * 3; // 3% per correct answer, max 9%
    }
};

// Export for module use (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = KnowledgeCheck;
}

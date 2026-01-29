/**
 * MLB Money Maker - Main Game Controller
 * BOW Sports Capital Presents
 * Module 2 Lesson 1: The League as a Business
 */

const Game = {
    // Game state
    state: {
        allocation: {
            players: 0,
            owners: 0,
            networks: 0,
            league: 0
        },
        sliders: {
            salary: 750,      // Minimum salary in thousands
            sharing: 35,      // Revenue sharing percentage
            gametime: 8,      // Prime time start (8pm)
            streaming: 25,    // Streaming exclusive percentage
            playershare: 48   // Player revenue share percentage
        },
        quizScore: 0,
        startTime: null,
        duration: 0,
        timerInterval: null,
        timeRemaining: 300 // 5 minutes in seconds
    },

    // Initialize the game
    init() {
        console.log('MLB Money Maker - Initializing...');

        // Setup start button
        const startBtn = document.getElementById('start-btn');
        if (startBtn) {
            startBtn.addEventListener('click', () => this.startGame());
        }

        // Initial UI update
        this.updateUI();

        console.log('Game initialized. Ready to play!');
    },

    // Start the game
    startGame() {
        console.log('Starting game...');

        // Reset state
        this.resetState();

        // Hide intro, show game
        document.getElementById('intro-screen').classList.remove('active');
        document.getElementById('game-screen').classList.add('active');

        // Show first phase
        document.getElementById('phase-money').classList.add('active');

        // Start timer
        this.state.startTime = Date.now();
        this.startTimer();

        // Initialize interactions
        Interactions.init(this.state, () => this.updateUI());

        // Initial pie chart
        Interactions.updateAllocationDisplay();

        // Initial UI update
        this.updateUI();
    },

    // Reset game state
    resetState() {
        this.state = {
            allocation: {
                players: 0,
                owners: 0,
                networks: 0,
                league: 0
            },
            sliders: {
                salary: 750,
                sharing: 35,
                gametime: 8,
                streaming: 25,
                playershare: 48
            },
            quizScore: 0,
            startTime: null,
            duration: 0,
            timerInterval: null,
            timeRemaining: 300
        };

        // Reset slider values in DOM
        const sliderDefaults = {
            'detail-salary': 750,
            'detail-sharing': 35,
            'detail-gametime': 8,
            'detail-streaming': 25,
            'detail-playershare': 48
        };

        Object.entries(sliderDefaults).forEach(([id, value]) => {
            const el = document.getElementById(id);
            if (el) el.value = value;
        });

        // Reset allocation sliders
        ['players', 'owners', 'networks', 'league'].forEach(bucket => {
            const slider = document.getElementById(`slider-${bucket}`);
            if (slider) slider.value = 0;
        });

        // Reset UI
        UI.reset();
    },

    // Start countdown timer
    startTimer() {
        if (this.state.timerInterval) {
            clearInterval(this.state.timerInterval);
        }

        this.state.timerInterval = setInterval(() => {
            this.state.timeRemaining--;
            UI.updateTimer(this.state.timeRemaining);

            if (this.state.timeRemaining <= 0) {
                this.timeUp();
            }
        }, 1000);

        UI.updateTimer(this.state.timeRemaining);
    },

    // Time's up handler
    timeUp() {
        clearInterval(this.state.timerInterval);
        console.log('Time is up!');

        // Force show results with current state
        this.showResults();
    },

    // Update all UI elements
    updateUI() {
        UI.update(this.state);
    },

    // Show results screen
    showResults() {
        // Stop timer
        if (this.state.timerInterval) {
            clearInterval(this.state.timerInterval);
        }

        // Calculate duration
        if (this.state.startTime) {
            this.state.duration = Math.round((Date.now() - this.state.startTime) / 1000);
        }

        // Calculate final satisfaction
        const satisfaction = Calculations.calculateSatisfaction(this.state);

        // Add quiz bonus (if any)
        const quizBonus = KnowledgeCheck.getBonus();
        satisfaction.players = Math.min(100, satisfaction.players + Math.round(quizBonus / 2));
        satisfaction.fans = Math.min(100, satisfaction.fans + quizBonus);

        // Determine tier
        const overallScore = Calculations.calculateOverallScore(satisfaction);
        const tier = Calculations.determineTier(overallScore, satisfaction);

        // Generate claim code (only if passing)
        let claimCode = null;
        if (tier !== 'fail') {
            claimCode = CodeGenerator.generateClaimCode(tier);

            // Store result
            const resultData = CodeGenerator.generateResultData(this.state, satisfaction, tier, claimCode);
            CodeGenerator.storeResult(resultData);
        }

        // Show results UI
        UI.showResults(this.state, satisfaction, tier, claimCode);

        console.log('Game complete!', { tier, overallScore, satisfaction, claimCode });
    },

    // Restart the game
    restart() {
        // Hide results
        document.getElementById('results-screen').classList.remove('active');

        // Reset phases
        document.querySelectorAll('.game-phase').forEach(phase => {
            phase.classList.remove('active');
        });

        // Remove any existing quiz
        const existingQuiz = document.querySelector('.knowledge-check');
        if (existingQuiz) existingQuiz.remove();

        // Start fresh
        this.startGame();
    }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    Game.init();
});

// Export for module use (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Game;
}

/**
 * MLB Money Maker - Game Controller v2
 * State management, timer, difficulty, news events, mini-game bonuses
 * BOW Sports Capital Presents
 */

const Game = {
    state: {
        allocation: {
            players: 0,
            owners:  0,
            networks:0,
            league:  0
        },
        sliders: {
            salary:      750,
            sharing:     35,
            gametime:    8,
            streaming:   25,
            playershare: 48
        },
        quizScore:         0,
        minigameBonuses:   { fans: 0, owners: 0 },
        activeEvent:       null,
        difficulty:        'normal',
        startTime:         null,
        duration:          0,
        timerInterval:     null,
        timeRemaining:     300,
        newsTimeout:       null
    },

    DURATIONS: { easy: 420, normal: 300, hard: 180 },

    init() {
        var self = this;

        var startBtn = document.getElementById('start-btn');
        if (startBtn) startBtn.addEventListener('click', function() { self.startGame(); });

        // Difficulty selector
        document.querySelectorAll('.difficulty-btn').forEach(function(btn) {
            btn.addEventListener('click', function() {
                document.querySelectorAll('.difficulty-btn').forEach(function(b) { b.classList.remove('active'); });
                btn.classList.add('active');
                self.state.difficulty = btn.dataset.difficulty;
            });
        });

        // Try again buttons (failure and success screens both have one)
        var tryAgainFail = document.getElementById('try-again-btn');
        if (tryAgainFail) tryAgainFail.addEventListener('click', function() { self.restart(); });

        var tryAgainSuccess = document.getElementById('try-again-success-btn');
        if (tryAgainSuccess) tryAgainSuccess.addEventListener('click', function() { self.restart(); });
    },

    startGame() {
        this.resetState();

        document.getElementById('intro-screen').classList.remove('active');
        document.getElementById('game-screen').classList.add('active');

        UI.reset();
        UI.startHeartbeat();

        var dur = this.DURATIONS[this.state.difficulty] || 300;
        this.state.timeRemaining = dur;
        UI.updateTimer(dur);

        Interactions.init(this.state, this.updateUI.bind(this));
        this.startTimer();
        this.scheduleNewsEvent();
    },

    resetState() {
        this.state.allocation       = { players: 0, owners: 0, networks: 0, league: 0 };
        this.state.sliders          = { salary: 750, sharing: 35, gametime: 8, streaming: 25, playershare: 48 };
        this.state.quizScore        = 0;
        this.state.minigameBonuses  = { fans: 0, owners: 0 };
        this.state.activeEvent      = null;
        this.state.startTime        = Date.now();
        this.state.duration         = 0;
        clearInterval(this.state.timerInterval);
        clearTimeout(this.state.newsTimeout);
    },

    startTimer() {
        var self = this;
        clearInterval(this.state.timerInterval);
        this.state.timerInterval = setInterval(function() {
            self.state.timeRemaining--;
            UI.updateTimer(self.state.timeRemaining);
            if (self.state.timeRemaining <= 0) {
                clearInterval(self.state.timerInterval);
                self.timeUp();
            }
        }, 1000);
    },

    timeUp() {
        this.showResults();
    },

    updateUI() {
        UI.update(this.state);
    },

    // Apply a score from a completed mini-game to game state
    applyMinigameBonus(type, score) {
        var totalQ = (type === 'teams') ? 10 : 5;
        var bonus  = Math.round((score / totalQ) * 5); // 0–5 pts

        if (type === 'teams') {
            this.state.minigameBonuses.fans   = Math.min(10, (this.state.minigameBonuses.fans   || 0) + bonus);
        } else if (type === 'calc') {
            this.state.minigameBonuses.owners = Math.min(10, (this.state.minigameBonuses.owners || 0) + bonus);
        }

        UI.update(this.state);
    },

    // Fire a news event at ~40% of game time elapsed
    scheduleNewsEvent() {
        var dur  = this.DURATIONS[this.state.difficulty] || 300;
        var when = Math.floor(dur * 0.4 * 1000);
        var self = this;

        clearTimeout(this.state.newsTimeout);
        this.state.newsTimeout = setTimeout(function() {
            var events = MLB_DATA.newsEvents;
            if (!events || events.length === 0) return;
            var event = events[Math.floor(Math.random() * events.length)];
            self.triggerNewsEvent(event);
        }, when);
    },

    triggerNewsEvent(event) {
        this.state.activeEvent = event;
        UI.showNewsAlert(event);
        UI.update(this.state);

        var self = this;
        setTimeout(function() {
            self.state.activeEvent = null;
            UI.update(self.state);
        }, (event.duration || 60) * 1000);
    },

    showResults() {
        clearInterval(this.state.timerInterval);
        clearTimeout(this.state.newsTimeout);
        this.state.duration = Date.now() - (this.state.startTime || Date.now());

        var satisfaction = Calculations.calculateSatisfaction(this.state);

        // Quiz bonus (KnowledgeCheck tracks correct answers)
        var quizBonus = KnowledgeCheck.getBonus();
        satisfaction.players = Math.min(100, satisfaction.players + quizBonus);
        satisfaction.fans    = Math.min(100, satisfaction.fans    + quizBonus);

        // Mini-game bonuses
        var mb = this.state.minigameBonuses;
        if (mb.fans)   satisfaction.fans   = Math.min(100, satisfaction.fans   + mb.fans);
        if (mb.owners) satisfaction.owners = Math.min(100, satisfaction.owners + mb.owners);

        var tier = Calculations.determineTier(satisfaction, this.state);

        CodeGen.store(tier, satisfaction, this.state.duration);
        UI.showResults(satisfaction, tier, this.state);
    },

    restart() {
        clearInterval(this.state.timerInterval);
        clearTimeout(this.state.newsTimeout);
        UI.stopHeartbeat();
        UI.hideNewsAlert();

        document.getElementById('results-screen').classList.remove('active');
        document.getElementById('intro-screen').classList.add('active');

        // Reset phases back to phase 1
        document.querySelectorAll('.game-phase').forEach(function(p) { p.classList.remove('active'); });
        document.getElementById('phase-money').classList.add('active');

        // Clean up injected quiz
        var phaseDiv = document.getElementById('phase-minigames');
        if (phaseDiv) {
            var kc = phaseDiv.querySelector('.knowledge-check');
            if (kc) kc.remove();
        }

        // Reset mini-game card states
        document.querySelectorAll('.minigame-card').forEach(function(card) {
            card.classList.remove('played');
            var status = card.querySelector('.mg-status');
            if (status) {
                status.textContent = card.classList.contains('playable') ? 'PLAY NOW' : 'NOT PLAYED';
            }
        });

        KnowledgeCheck.init();
        UI.reset();
    }
};

document.addEventListener('DOMContentLoaded', function() {
    Game.init();
});

if (typeof module !== 'undefined' && module.exports) {
    module.exports = Game;
}

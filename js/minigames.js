/**
 * MLB Money Maker - Mini-Games v2
 * KnowledgeCheck quiz, TeamMarketQuiz, SalaryCapCalc
 * BOW Sports Capital Presents
 */

// ============================================================
//  KNOWLEDGE CHECK (Phase 3 quiz — inline in phase panel)
// ============================================================
const KnowledgeCheck = {
    score: 0,
    answered: [],

    init() {
        this.score    = 0;
        this.answered = [];
    },

    // Pull 3 random questions from the expanded pool
    getQuestions() {
        var pool     = MLB_DATA.quizQuestions.slice();
        var shuffled = pool.sort(function() { return Math.random() - 0.5; });
        return shuffled.slice(0, 3);
    },

    // Build the HTML for one question block and append to container
    renderQuestion(question, index, container) {
        var div = document.createElement('div');
        div.className = 'quiz-question';
        div.id        = 'quiz-q-' + index;

        var p = document.createElement('p');
        p.textContent = (index + 1) + '. ' + question.question;
        div.appendChild(p);

        var optDiv       = document.createElement('div');
        optDiv.className = 'quiz-options';

        question.options.forEach(function(opt, oIndex) {
            var btn              = document.createElement('button');
            btn.className        = 'quiz-option';
            btn.textContent      = opt;
            btn.dataset.question = index;
            btn.dataset.option   = oIndex;
            optDiv.appendChild(btn);
        });

        div.appendChild(optDiv);

        var exp           = document.createElement('p');
        exp.id            = 'quiz-exp-' + index;
        exp.className     = 'quiz-explanation';
        exp.style.display = 'none';
        div.appendChild(exp);

        container.appendChild(div);
    },

    // Handle an answer click
    handleAnswer(questionIndex, optionIndex, questions) {
        if (this.answered.indexOf(questionIndex) !== -1) return;
        this.answered.push(questionIndex);

        var question  = questions[questionIndex];
        var isCorrect = optionIndex === question.correct;
        if (isCorrect) this.score++;

        var qDiv = document.getElementById('quiz-q-' + questionIndex);
        if (qDiv) {
            qDiv.querySelectorAll('.quiz-option').forEach(function(btn, i) {
                btn.disabled = true;
                if (i === question.correct)                      btn.classList.add('correct');
                else if (i === optionIndex && !isCorrect)        btn.classList.add('incorrect');
            });

            var expEl = document.getElementById('quiz-exp-' + questionIndex);
            if (expEl) {
                expEl.style.display  = 'block';
                expEl.style.color    = isCorrect ? 'var(--success)' : 'var(--danger)';
                expEl.style.fontStyle  = 'italic';
                expEl.style.fontSize   = '12px';
                expEl.style.marginTop  = '8px';
                expEl.textContent = (isCorrect ? '✓ Correct! ' : '✗ Incorrect. ') + question.explanation;
            }
        }
    },

    getBonus() {
        return this.score * 3; // +3% per correct answer, max +9%
    }
};

// ============================================================
//  TEAM MARKET QUIZ  (overlay mini-game — 10 questions)
// ============================================================
const TeamQuiz = {
    score:       0,
    question:    0,
    totalQ:      10,
    teams:       [],
    usedKeys:    [],
    timerHandle: null,
    perQMs:      1500,

    start() {
        this.score    = 0;
        this.question = 0;
        this.usedKeys = [];

        // Only use large/small market teams for a clean binary choice
        var self = this;
        this.teams = [];
        Object.keys(MLB_DATA.teams).forEach(function(k) {
            var t = MLB_DATA.teams[k];
            if (t.market === 'large' || t.market === 'small') {
                self.teams.push({ key: k, name: t.name, abbr: t.abbr, market: t.market, revenue: t.revenue, color: t.color || '#002B5C' });
            }
        });

        this.renderQuestion();
        this.updateScore();
    },

    pickTeam() {
        var available = this.teams.filter(function(t) {
            return this.usedKeys.indexOf(t.key) === -1;
        }, this);
        if (available.length === 0) { this.usedKeys = []; available = this.teams.slice(); }
        var t = available[Math.floor(Math.random() * available.length)];
        this.usedKeys.push(t.key);
        return t;
    },

    renderQuestion() {
        var t = this.pickTeam();
        this._currentTeam = t;

        var badge  = document.getElementById('quiz-team-badge');
        var name   = document.getElementById('quiz-team-name');
        var hint   = document.getElementById('quiz-team-hint');
        var fb     = document.getElementById('team-quiz-feedback');
        var qNum   = document.getElementById('teams-question');
        var bigBtn = document.getElementById('btn-big');
        var smlBtn = document.getElementById('btn-small');

        if (badge) { badge.textContent = t.abbr; badge.style.background = t.color; }
        if (name)  name.textContent    = t.name;
        if (hint)  hint.textContent    = 'Revenue: ~$' + t.revenue + 'M/year';
        if (fb)    { fb.textContent = ''; fb.className = 'team-quiz-feedback'; }
        if (qNum)  qNum.textContent    = this.question + 1;
        if (bigBtn)  bigBtn.disabled   = false;
        if (smlBtn)  smlBtn.disabled   = false;

        this.startTimer();
    },

    handleAnswer(answer) {
        clearTimeout(this.timerHandle);

        var t        = this._currentTeam;
        var correct  = (answer === 'big' && t.market === 'large') || (answer === 'small' && t.market === 'small');
        var fb       = document.getElementById('team-quiz-feedback');
        var bigBtn   = document.getElementById('btn-big');
        var smlBtn   = document.getElementById('btn-small');

        if (correct) {
            this.score++;
            if (fb) { fb.textContent = '✓ Correct!'; fb.className = 'team-quiz-feedback correct'; }
        } else if (answer === 'timeout') {
            if (fb) { fb.textContent = '⏱ Time\'s up! ' + t.name + ' is a ' + t.market + '-market team.'; fb.className = 'team-quiz-feedback incorrect'; }
        } else {
            if (fb) { fb.textContent = '✗ ' + t.name + ' is a ' + t.market + '-market team.'; fb.className = 'team-quiz-feedback incorrect'; }
        }

        if (bigBtn) bigBtn.disabled = true;
        if (smlBtn) smlBtn.disabled = true;

        this.question++;
        this.updateScore();

        var self = this;
        if (this.question >= this.totalQ) {
            setTimeout(function() { self.finish(); }, 900);
        } else {
            setTimeout(function() { self.renderQuestion(); }, 900);
        }
    },

    startTimer() {
        var fill = document.getElementById('teams-timer-fill');
        if (fill) {
            fill.style.transition = 'none';
            fill.style.width      = '100%';
            void fill.offsetWidth;
            fill.style.transition = 'width ' + (this.perQMs / 1000) + 's linear';
            fill.style.width      = '0%';
        }
        var self = this;
        clearTimeout(this.timerHandle);
        this.timerHandle = setTimeout(function() { self.handleAnswer('timeout'); }, this.perQMs);
    },

    updateScore() {
        var el = document.getElementById('teams-score');
        if (el) el.textContent = this.score;
    },

    finish() {
        document.querySelectorAll('.minigame-content').forEach(function(c) { c.classList.remove('active'); });
        var resultDiv = document.getElementById('minigame-results');
        if (resultDiv) resultDiv.classList.add('active');

        var bonus   = Math.round((this.score / this.totalQ) * 5);
        var titleEl = document.getElementById('mg-result-title');
        var scoreEl = document.getElementById('mg-result-score');
        var msgEl   = document.getElementById('mg-result-message');

        if (titleEl) titleEl.textContent = this.score >= 7 ? 'Market Expert!' : this.score >= 4 ? 'Decent Knowledge!' : 'Keep Studying!';
        if (scoreEl) scoreEl.textContent = '+' + bonus + '% Fan Satisfaction Bonus';
        if (msgEl)   msgEl.textContent   = 'You got ' + this.score + '/' + this.totalQ + ' correct.';

        if (typeof Game !== 'undefined') Game.applyMinigameBonus('teams', this.score);

        var card = document.getElementById('mg-teams');
        if (card) {
            card.classList.add('played');
            var status = card.querySelector('.mg-status');
            if (status) status.textContent = 'PLAYED ✓';
        }
    }
};

// ============================================================
//  SALARY CAP CALCULATOR  (overlay mini-game — 5 questions)
// ============================================================
const CalcGame = {
    score:       0,
    question:    0,
    totalQ:      5,
    timerHandle: null,
    perQMs:      30000,

    problems: [
        { revenue: 10,  share: 50, correct: 5,    distractors: [4, 6, 7.5]   },
        { revenue: 8,   share: 48, correct: 3.84, distractors: [3.5, 4, 4.2] },
        { revenue: 12,  share: 45, correct: 5.4,  distractors: [5, 6, 4.8]   },
        { revenue: 9,   share: 52, correct: 4.68, distractors: [4.5, 5, 4.2]  },
        { revenue: 11,  share: 50, correct: 5.5,  distractors: [5, 6, 4.5]   }
    ],

    start() {
        this.score    = 0;
        this.question = 0;
        this.renderQuestion();
        this.updateScore();
    },

    renderQuestion() {
        var p = this.problems[this.question];
        if (!p) return;

        var revEl   = document.getElementById('calc-revenue-val');
        var shareEl = document.getElementById('calc-share-val');
        var qNum    = document.getElementById('calc-question');
        var fb      = document.getElementById('calc-feedback');

        if (revEl)   revEl.textContent   = '$' + p.revenue + 'B';
        if (shareEl) shareEl.textContent = p.share + '%';
        if (qNum)    qNum.textContent    = this.question + 1;
        if (fb)      fb.textContent      = '';

        var allOpts = [p.correct].concat(p.distractors).sort(function() { return Math.random() - 0.5; });
        var optContainer = document.getElementById('calc-options');
        if (optContainer) {
            optContainer.innerHTML = '';
            var self = this;
            allOpts.forEach(function(val) {
                var btn       = document.createElement('button');
                btn.className = 'calc-option-btn';
                btn.textContent = '$' + val + 'B';
                btn.onclick   = function() { self.handleAnswer(val, p); };
                optContainer.appendChild(btn);
            });
        }

        this.startTimer();
    },

    handleAnswer(selected, problem) {
        clearTimeout(this.timerHandle);
        if (!problem) return;

        var isCorrect = Math.abs(selected - problem.correct) < 0.01;
        if (isCorrect) this.score++;

        document.querySelectorAll('.calc-option-btn').forEach(function(btn) {
            btn.disabled = true;
            var val = parseFloat(btn.textContent.replace('$', '').replace('B', ''));
            if (Math.abs(val - problem.correct) < 0.01) btn.classList.add('correct');
            else if (Math.abs(val - selected) < 0.01 && !isCorrect) btn.classList.add('incorrect');
        });

        var fb = document.getElementById('calc-feedback');
        if (fb) {
            if (isCorrect) {
                fb.textContent = '✓ Correct! ' + problem.share + '% × $' + problem.revenue + 'B = $' + problem.correct + 'B';
                fb.style.color = 'var(--success)';
            } else {
                fb.textContent = selected === -999
                    ? '⏱ Time\'s up! Answer: $' + problem.correct + 'B'
                    : '✗ Correct answer: $' + problem.correct + 'B';
                fb.style.color = 'var(--danger)';
            }
        }

        this.question++;
        this.updateScore();

        var self = this;
        if (this.question >= this.totalQ) {
            setTimeout(function() { self.finish(); }, 1100);
        } else {
            setTimeout(function() { self.renderQuestion(); }, 1100);
        }
    },

    startTimer() {
        var fill = document.getElementById('calc-timer-fill');
        if (fill) {
            fill.style.transition = 'none';
            fill.style.width      = '100%';
            void fill.offsetWidth;
            fill.style.transition = 'width ' + (this.perQMs / 1000) + 's linear';
            fill.style.width      = '0%';
        }
        var self = this;
        clearTimeout(this.timerHandle);
        this.timerHandle = setTimeout(function() {
            var p = self.problems[self.question];
            self.handleAnswer(-999, p || null);
        }, this.perQMs);
    },

    updateScore() {
        var el = document.getElementById('calc-score');
        if (el) el.textContent = this.score;
    },

    finish() {
        document.querySelectorAll('.minigame-content').forEach(function(c) { c.classList.remove('active'); });
        var resultDiv = document.getElementById('minigame-results');
        if (resultDiv) resultDiv.classList.add('active');

        var bonus   = Math.round((this.score / this.totalQ) * 5);
        var titleEl = document.getElementById('mg-result-title');
        var scoreEl = document.getElementById('mg-result-score');
        var msgEl   = document.getElementById('mg-result-message');

        if (titleEl) titleEl.textContent = this.score >= 4 ? 'Finance Whiz!' : this.score >= 2 ? 'Getting There!' : 'Keep Practicing!';
        if (scoreEl) scoreEl.textContent = '+' + bonus + '% Owner Satisfaction Bonus';
        if (msgEl)   msgEl.textContent   = 'You got ' + this.score + '/' + this.totalQ + ' correct.';

        if (typeof Game !== 'undefined') Game.applyMinigameBonus('calc', this.score);

        var card = document.getElementById('mg-calc');
        if (card) {
            card.classList.add('played');
            var status = card.querySelector('.mg-status');
            if (status) status.textContent = 'PLAYED ✓';
        }
    }
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { KnowledgeCheck, TeamQuiz, CalcGame };
}

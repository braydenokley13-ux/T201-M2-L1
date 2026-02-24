/**
 * MLB Money Maker - Interactions v2
 * Event handlers, phase transitions, pie chart, slider setup
 * BOW Sports Capital Presents
 */

const Interactions = {
    gameState: null,
    updateCallback: null,

    init(gameState, updateCallback) {
        this.gameState       = gameState;
        this.updateCallback  = updateCallback;

        this.setupAllocationControls();
        this.setupDetailSliders();
        this.setupNavigationButtons();
        this.setupMinigameButtons();

        // Sync slider UI to current state defaults
        this.updateAllocationDisplay();
    },

    // ---- Phase 1: Money Allocation ----------------------------------------

    setupAllocationControls() {
        var self    = this;
        var buckets = ['players', 'owners', 'networks', 'league'];

        buckets.forEach(function(bucket) {
            var slider   = document.getElementById('slider-' + bucket);
            var plusBtn  = document.querySelector('[data-action="plus"][data-target="' + bucket + '"]');
            var minusBtn = document.querySelector('[data-action="minus"][data-target="' + bucket + '"]');

            if (slider) {
                slider.addEventListener('input', function(e) {
                    self.handleAllocationChange(bucket, parseFloat(e.target.value) / 10);
                });
            }
            if (plusBtn) {
                plusBtn.addEventListener('click', function() {
                    self.handleAllocationChange(bucket, Math.min(8, self.gameState.allocation[bucket] + 0.5));
                });
            }
            if (minusBtn) {
                minusBtn.addEventListener('click', function() {
                    self.handleAllocationChange(bucket, Math.max(0, self.gameState.allocation[bucket] - 0.5));
                });
            }
        });
    },

    handleAllocationChange(bucket, value) {
        var total        = Object.values(this.gameState.allocation).reduce(function(a, b) { return a + b; }, 0);
        var currentValue = this.gameState.allocation[bucket];
        var otherTotal   = total - currentValue;

        if (otherTotal + value > 8) value = 8 - otherTotal;
        this.gameState.allocation[bucket] = Math.round(value * 10) / 10;

        var slider = document.getElementById('slider-' + bucket);
        if (slider) slider.value = this.gameState.allocation[bucket] * 10;

        this.updateAllocationDisplay();
        if (this.updateCallback) this.updateCallback();
    },

    updateAllocationDisplay() {
        var self    = this;
        var buckets = ['players', 'owners', 'networks', 'league'];

        buckets.forEach(function(bucket) {
            var amountEl = document.getElementById('amount-' + bucket);
            if (amountEl) amountEl.textContent = '$' + (self.gameState.allocation[bucket] || 0).toFixed(1) + 'B';
        });

        var remaining   = Calculations.getRemainingMoney(this.gameState.allocation);
        var remainingEl = document.getElementById('remaining-money');
        if (remainingEl) remainingEl.textContent = '$' + remaining.toFixed(1) + 'B';

        this.updatePieChart();

        var nextBtn = document.getElementById('phase1-next');
        if (nextBtn) {
            var isValid = remaining < 0.1;
            nextBtn.disabled = !isValid;
            nextBtn.textContent = isValid ? 'LOCK IN ALLOCATION' : 'ALLOCATE $' + remaining.toFixed(1) + 'B MORE';
        }
    },

    updatePieChart() {
        var canvas = document.getElementById('pie-canvas');
        if (!canvas) return;

        var ctx     = canvas.getContext('2d');
        var cx      = canvas.width  / 2;
        var cy      = canvas.height / 2;
        var radius  = 80;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        var allocations = [
            { key: 'players',  color: '#002B5C', value: this.gameState.allocation.players  },
            { key: 'owners',   color: '#CE1141', value: this.gameState.allocation.owners   },
            { key: 'networks', color: '#28A745', value: this.gameState.allocation.networks },
            { key: 'league',   color: '#FFC107', value: this.gameState.allocation.league   }
        ];

        var startAngle = -Math.PI / 2;
        allocations.forEach(function(a) {
            if (a.value > 0) {
                var sliceAngle = (a.value / 8) * 2 * Math.PI;
                ctx.beginPath();
                ctx.moveTo(cx, cy);
                ctx.arc(cx, cy, radius, startAngle, startAngle + sliceAngle);
                ctx.closePath();
                ctx.fillStyle = a.color;
                ctx.fill();
                startAngle += sliceAngle;
            }
        });

        // Unallocated slice
        var remaining = Calculations.getRemainingMoney(this.gameState.allocation);
        if (remaining > 0) {
            var remAngle = (remaining / 8) * 2 * Math.PI;
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.arc(cx, cy, radius, startAngle, startAngle + remAngle);
            ctx.closePath();
            ctx.fillStyle = '#e0e0e0';
            ctx.fill();
        }

        // Donut hole
        ctx.beginPath();
        ctx.arc(cx, cy, 50, 0, 2 * Math.PI);
        ctx.fillStyle = 'white';
        ctx.fill();
    },

    // ---- Phase 2: Detail Sliders ------------------------------------------

    setupDetailSliders() {
        var self    = this;
        var sliders = [
            { id: 'detail-salary',      key: 'salary',      format: function(v) { return '$' + v + 'K'; } },
            { id: 'detail-sharing',     key: 'sharing',     format: function(v) { return v + '%'; } },
            { id: 'detail-gametime',    key: 'gametime',    format: function(v) { return self.formatTime(v); } },
            { id: 'detail-streaming',   key: 'streaming',   format: function(v) { return v + '%'; } },
            { id: 'detail-playershare', key: 'playershare', format: function(v) { return v + '%'; } }
        ];

        sliders.forEach(function(slider) {
            var el = document.getElementById(slider.id);
            if (!el) return;

            el.value = self.gameState.sliders[slider.key];

            var valueEl = document.getElementById('val-' + slider.key);
            if (valueEl) valueEl.textContent = slider.format(self.gameState.sliders[slider.key]);

            el.addEventListener('input', function(e) {
                var value = parseFloat(e.target.value);
                self.gameState.sliders[slider.key] = value;

                if (valueEl) valueEl.textContent = slider.format(value);
                self.updateSliderImpact(slider.key, value);
                if (self.updateCallback) self.updateCallback();
            });
        });
    },

    formatTime(value) {
        var hour    = Math.floor(value);
        var minutes = (value % 1) * 60;
        var suffix  = hour >= 12 ? 'PM' : 'AM';
        var display = hour > 12 ? hour - 12 : hour;
        return display + ':' + (minutes === 0 ? '00' : '30') + ' ' + suffix;
    },

    updateSliderImpact(key, value) {
        var impactEl = document.getElementById('impact-' + key);
        if (!impactEl) return;

        var impacts = {
            salary: function() {
                if (value >= 1200) return 'High minimum! Small-market teams struggle to afford rosters.';
                if (value >= 900)  return 'Good for players, but raises team costs.';
                if (value >= 600)  return 'Reasonable minimum that most teams can handle.';
                return 'Low minimum saves teams money but hurts players.';
            },
            sharing: function() {
                if (value >= 50) return 'Great balance! Small markets can compete.';
                if (value >= 35) return 'Moderate sharing helps smaller teams.';
                if (value >= 20) return 'Limited sharing favors big-market teams.';
                return 'Minimal sharing creates huge competitive imbalance.';
            },
            gametime: function() {
                if (value >= 10)  return 'Very late! Poor for East Coast fans and player rest.';
                if (value >= 9)   return 'Good for West Coast, challenging for families.';
                if (value >= 8)   return 'Prime time — networks love it!';
                return 'Early start — great for families, less ad revenue.';
            },
            streaming: function() {
                if (value >= 75) return 'Almost all streaming! Older fans can\'t watch easily.';
                if (value >= 50) return 'Heavy streaming presence, cable viewers frustrated.';
                if (value >= 25) return 'Balanced mix of traditional and streaming.';
                return 'Mostly traditional TV — misses younger viewers.';
            },
            playershare: function() {
                if (value >= 55) return 'Generous to players! Owners unhappy with profits.';
                if (value >= 48) return 'Fair split near current CBA terms.';
                if (value >= 44) return 'Below current share — players concerned.';
                return 'Low share! Players union will fight this.';
            }
        };

        if (impacts[key]) impactEl.textContent = impacts[key]();
    },

    // ---- Phase Navigation -------------------------------------------------

    setupNavigationButtons() {
        var self = this;

        // Phase 1 → Phase 2
        var phase1Next = document.getElementById('phase1-next');
        if (phase1Next) {
            phase1Next.addEventListener('click', function() {
                self.transitionPhase('phase-money', 'phase-sliders');
                UI.updateStepper('phase-sliders');
            });
        }

        // Phase 2 → Phase 3
        var phase2Next = document.getElementById('phase2-next');
        if (phase2Next) {
            phase2Next.addEventListener('click', function() {
                self.transitionPhase('phase-sliders', 'phase-minigames');
                UI.updateStepper('phase-minigames');
                self.setupQuiz();
            });
        }

        // Phase 3 → Results
        var phase3Next = document.getElementById('phase3-next');
        if (phase3Next) {
            phase3Next.addEventListener('click', function() {
                Game.showResults();
            });
        }

        // Close mini-game overlay
        var closeBtn = document.getElementById('close-minigame');
        if (closeBtn) closeBtn.addEventListener('click', function() { self.closeMinigame(); });

        var mgContinue = document.getElementById('mg-continue');
        if (mgContinue) mgContinue.addEventListener('click', function() { self.closeMinigame(); });
    },

    // Animated transition between two phase divs
    transitionPhase(fromId, toId) {
        var fromEl = document.getElementById(fromId);
        var toEl   = document.getElementById(toId);
        if (!fromEl || !toEl) return;

        var self = this;
        fromEl.classList.add('phase-leaving');

        setTimeout(function() {
            fromEl.classList.remove('active', 'phase-leaving');
            toEl.classList.add('active', 'phase-entering');
            setTimeout(function() {
                toEl.classList.remove('phase-entering');
            }, 350);
        }, 250);
    },

    // Inject the knowledge-check quiz into Phase 3
    setupQuiz() {
        var phaseDiv = document.getElementById('phase-minigames');
        if (!phaseDiv) return;

        var existing = phaseDiv.querySelector('.knowledge-check');
        if (existing) existing.remove();

        var quizContainer     = document.createElement('div');
        quizContainer.className = 'knowledge-check';
        quizContainer.innerHTML = '<h3 style="margin-bottom:15px;color:#002B5C;">Quick Knowledge Check</h3>';

        KnowledgeCheck.init();
        var questions = KnowledgeCheck.getQuestions();
        var self      = this;

        questions.forEach(function(q, i) {
            KnowledgeCheck.renderQuestion(q, i, quizContainer);
        });

        var nextBtn = document.getElementById('phase3-next');
        phaseDiv.insertBefore(quizContainer, nextBtn);

        quizContainer.querySelectorAll('.quiz-option').forEach(function(btn) {
            btn.addEventListener('click', function(e) {
                var qIdx = parseInt(e.target.dataset.question);
                var oIdx = parseInt(e.target.dataset.option);
                KnowledgeCheck.handleAnswer(qIdx, oIdx, questions);
                self.gameState.quizScore = KnowledgeCheck.score;
            });
        });
    },

    // ---- Mini-game overlay ------------------------------------------------

    setupMinigameButtons() {
        var self = this;

        // Only wire up the two playable cards
        var teamsCard = document.getElementById('mg-teams');
        if (teamsCard) {
            teamsCard.addEventListener('click', function() { self.openMinigame('teams'); });
        }

        var calcCard = document.getElementById('mg-calc');
        if (calcCard) {
            calcCard.addEventListener('click', function() { self.openMinigame('calc'); });
        }
    },

    openMinigame(gameType) {
        var overlay = document.getElementById('minigame-overlay');
        if (!overlay) return;

        document.querySelectorAll('.minigame-content').forEach(function(c) { c.classList.remove('active'); });

        var gameContent = document.getElementById('game-' + gameType);
        if (gameContent) gameContent.classList.add('active');

        overlay.classList.add('active');

        // Start the actual game logic
        if (gameType === 'teams') {
            TeamQuiz.start();
        } else if (gameType === 'calc') {
            CalcGame.start();
        }
    },

    closeMinigame() {
        var overlay = document.getElementById('minigame-overlay');
        if (overlay) overlay.classList.remove('active');
        document.querySelectorAll('.minigame-content').forEach(function(c) { c.classList.remove('active'); });
    }
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = Interactions;
}

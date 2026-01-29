/**
 * MLB Money Maker - Interactions
 * Handles slider, button, and allocation interactions
 * BOW Sports Capital Presents
 */

const Interactions = {
    // Initialize all event listeners
    init(gameState, updateCallback) {
        this.gameState = gameState;
        this.updateCallback = updateCallback;

        this.setupAllocationControls();
        this.setupDetailSliders();
        this.setupNavigationButtons();
    },

    // Setup allocation bucket controls (Phase 1)
    setupAllocationControls() {
        const buckets = ['players', 'owners', 'networks', 'league'];

        buckets.forEach(bucket => {
            const slider = document.getElementById(`slider-${bucket}`);
            const plusBtn = document.querySelector(`[data-action="plus"][data-target="${bucket}"]`);
            const minusBtn = document.querySelector(`[data-action="minus"][data-target="${bucket}"]`);

            if (slider) {
                slider.addEventListener('input', (e) => {
                    this.handleAllocationChange(bucket, parseFloat(e.target.value) / 10);
                });
            }

            if (plusBtn) {
                plusBtn.addEventListener('click', () => {
                    const current = this.gameState.allocation[bucket];
                    this.handleAllocationChange(bucket, Math.min(8, current + 0.5));
                });
            }

            if (minusBtn) {
                minusBtn.addEventListener('click', () => {
                    const current = this.gameState.allocation[bucket];
                    this.handleAllocationChange(bucket, Math.max(0, current - 0.5));
                });
            }
        });
    },

    // Handle allocation changes
    handleAllocationChange(bucket, value) {
        const total = Object.values(this.gameState.allocation).reduce((a, b) => a + b, 0);
        const currentValue = this.gameState.allocation[bucket];
        const otherTotal = total - currentValue;

        // Check if we can add more (total must not exceed 8)
        if (otherTotal + value > 8) {
            value = 8 - otherTotal;
        }

        this.gameState.allocation[bucket] = Math.round(value * 10) / 10;

        // Update slider to match
        const slider = document.getElementById(`slider-${bucket}`);
        if (slider) {
            slider.value = this.gameState.allocation[bucket] * 10;
        }

        // Update display
        this.updateAllocationDisplay();

        // Trigger callback
        if (this.updateCallback) {
            this.updateCallback();
        }
    },

    // Update allocation display
    updateAllocationDisplay() {
        const buckets = ['players', 'owners', 'networks', 'league'];

        buckets.forEach(bucket => {
            const amountEl = document.getElementById(`amount-${bucket}`);
            if (amountEl) {
                amountEl.textContent = `$${this.gameState.allocation[bucket].toFixed(1)}B`;
            }
        });

        // Update remaining money display
        const remaining = Calculations.getRemainingMoney(this.gameState.allocation);
        const remainingEl = document.getElementById('remaining-money');
        if (remainingEl) {
            remainingEl.textContent = `$${remaining.toFixed(1)}B`;
        }

        // Update pie chart
        this.updatePieChart();

        // Enable/disable next button based on allocation
        const nextBtn = document.getElementById('phase1-next');
        if (nextBtn) {
            const isValid = remaining < 0.1; // Allow small floating point errors
            nextBtn.disabled = !isValid;
            if (isValid) {
                nextBtn.textContent = 'LOCK IN ALLOCATION';
            } else {
                nextBtn.textContent = `ALLOCATE $${remaining.toFixed(1)}B MORE`;
            }
        }
    },

    // Update pie chart visualization
    updatePieChart() {
        const canvas = document.getElementById('pie-canvas');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = 80;

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const allocations = [
            { key: 'players', color: '#002B5C', value: this.gameState.allocation.players },
            { key: 'owners', color: '#CE1141', value: this.gameState.allocation.owners },
            { key: 'networks', color: '#28A745', value: this.gameState.allocation.networks },
            { key: 'league', color: '#FFC107', value: this.gameState.allocation.league }
        ];

        const total = allocations.reduce((sum, a) => sum + a.value, 0);
        let startAngle = -Math.PI / 2; // Start from top

        allocations.forEach(allocation => {
            if (allocation.value > 0) {
                const sliceAngle = (allocation.value / 8) * 2 * Math.PI;

                ctx.beginPath();
                ctx.moveTo(centerX, centerY);
                ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
                ctx.closePath();
                ctx.fillStyle = allocation.color;
                ctx.fill();

                startAngle += sliceAngle;
            }
        });

        // Draw remaining (unallocated) as gray
        const remaining = 8 - total;
        if (remaining > 0) {
            const sliceAngle = (remaining / 8) * 2 * Math.PI;
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
            ctx.closePath();
            ctx.fillStyle = '#e0e0e0';
            ctx.fill();
        }

        // Draw center circle (donut hole)
        ctx.beginPath();
        ctx.arc(centerX, centerY, 50, 0, 2 * Math.PI);
        ctx.fillStyle = 'white';
        ctx.fill();
    },

    // Setup detail sliders (Phase 2)
    setupDetailSliders() {
        const sliders = [
            { id: 'detail-salary', key: 'salary', format: (v) => `$${v}K` },
            { id: 'detail-sharing', key: 'sharing', format: (v) => `${v}%` },
            { id: 'detail-gametime', key: 'gametime', format: (v) => this.formatTime(v) },
            { id: 'detail-streaming', key: 'streaming', format: (v) => `${v}%` },
            { id: 'detail-playershare', key: 'playershare', format: (v) => `${v}%` }
        ];

        sliders.forEach(slider => {
            const el = document.getElementById(slider.id);
            if (el) {
                el.addEventListener('input', (e) => {
                    const value = parseFloat(e.target.value);
                    this.gameState.sliders[slider.key] = value;

                    // Update value display
                    const valueEl = document.getElementById(`val-${slider.key}`);
                    if (valueEl) {
                        valueEl.textContent = slider.format(value);
                    }

                    // Update impact text
                    this.updateSliderImpact(slider.key, value);

                    // Trigger callback
                    if (this.updateCallback) {
                        this.updateCallback();
                    }
                });

                // Set initial value
                el.value = this.gameState.sliders[slider.key];
                const valueEl = document.getElementById(`val-${slider.key}`);
                if (valueEl) {
                    valueEl.textContent = slider.format(this.gameState.sliders[slider.key]);
                }
            }
        });
    },

    // Format time value
    formatTime(value) {
        const hour = Math.floor(value);
        const minutes = (value % 1) * 60;
        const suffix = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour > 12 ? hour - 12 : hour;
        return `${displayHour}:${minutes === 0 ? '00' : '30'} ${suffix}`;
    },

    // Update slider impact text based on value
    updateSliderImpact(key, value) {
        const impactEl = document.getElementById(`impact-${key}`);
        if (!impactEl) return;

        const impacts = {
            salary: () => {
                if (value >= 1200) return "High minimum! Small-market teams struggle to afford rosters.";
                if (value >= 900) return "Good for players, but raises team costs.";
                if (value >= 600) return "Reasonable minimum that most teams can handle.";
                return "Low minimum saves teams money but hurts players.";
            },
            sharing: () => {
                if (value >= 50) return "Great balance! Small markets can compete.";
                if (value >= 35) return "Moderate sharing helps smaller teams.";
                if (value >= 20) return "Limited sharing favors big-market teams.";
                return "Minimal sharing creates huge competitive imbalance.";
            },
            gametime: () => {
                if (value >= 10) return "Very late! Poor for East Coast fans and player rest.";
                if (value >= 9) return "Good for West Coast, challenging for families.";
                if (value >= 8) return "Prime time - networks love it!";
                return "Early start - great for families, less ad revenue.";
            },
            streaming: () => {
                if (value >= 75) return "Almost all streaming! Older fans can't watch easily.";
                if (value >= 50) return "Heavy streaming presence, cable viewers frustrated.";
                if (value >= 25) return "Balanced mix of traditional and streaming.";
                return "Mostly traditional TV - misses younger viewers.";
            },
            playershare: () => {
                if (value >= 55) return "Generous to players! Owners unhappy with profits.";
                if (value >= 48) return "Fair split near current CBA terms.";
                if (value >= 44) return "Below current share - players concerned.";
                return "Low share! Players union will fight this.";
            }
        };

        impactEl.textContent = impacts[key]();
    },

    // Setup navigation buttons
    setupNavigationButtons() {
        // Phase 1 to Phase 2
        const phase1Next = document.getElementById('phase1-next');
        if (phase1Next) {
            phase1Next.addEventListener('click', () => {
                document.getElementById('phase-money').classList.remove('active');
                document.getElementById('phase-sliders').classList.add('active');
            });
        }

        // Phase 2 to Phase 3 (Quiz)
        const phase2Next = document.getElementById('phase2-next');
        if (phase2Next) {
            phase2Next.addEventListener('click', () => {
                document.getElementById('phase-sliders').classList.remove('active');
                document.getElementById('phase-minigames').classList.add('active');
                this.setupQuiz();
            });
        }

        // Phase 3 to Results
        const phase3Next = document.getElementById('phase3-next');
        if (phase3Next) {
            phase3Next.addEventListener('click', () => {
                // Show results
                Game.showResults();
            });
        }

        // Try again button
        const tryAgainBtn = document.getElementById('try-again-btn');
        if (tryAgainBtn) {
            tryAgainBtn.addEventListener('click', () => {
                Game.restart();
            });
        }
    },

    // Setup quiz in Phase 3
    setupQuiz() {
        const container = document.querySelector('#phase-minigames .minigame-selector');
        if (!container) {
            // Create quiz container if minigame selector is hidden
            const phaseDiv = document.getElementById('phase-minigames');
            const existingQuiz = phaseDiv.querySelector('.knowledge-check');
            if (existingQuiz) existingQuiz.remove();

            const quizContainer = document.createElement('div');
            quizContainer.className = 'knowledge-check';
            quizContainer.innerHTML = '<h3 style="margin-bottom: 15px; color: #002B5C;">Quick Knowledge Check</h3>';

            // Get questions
            KnowledgeCheck.init();
            const questions = KnowledgeCheck.getQuestions();

            // Render questions
            questions.forEach((q, i) => {
                KnowledgeCheck.renderQuestion(q, i, quizContainer);
            });

            // Insert before the button
            const nextBtn = document.getElementById('phase3-next');
            phaseDiv.insertBefore(quizContainer, nextBtn);

            // Add click handlers
            quizContainer.querySelectorAll('.quiz-option').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const qIndex = parseInt(e.target.dataset.question);
                    const oIndex = parseInt(e.target.dataset.option);
                    KnowledgeCheck.handleAnswer(qIndex, oIndex, questions);

                    // Store score in game state
                    this.gameState.quizScore = KnowledgeCheck.score;
                });
            });
        }
    }
};

// Export for module use (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Interactions;
}

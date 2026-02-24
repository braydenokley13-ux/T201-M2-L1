/**
 * MLB Money Maker - UI v2
 * DOM updates, canvas drawing, character animations, results reveal
 * BOW Sports Capital Presents
 */

const UI = {
    // Track previous satisfaction for animation triggers
    _prevSatisfaction: { players: 50, owners: 50, networks: 50, fans: 50 },

    // Heartbeat animation state
    _heartbeatAnimFrame: null,
    _heartbeatPoints: [],
    _heartbeatStatus: 'stable',

    // Main update hub — called on every state change
    update(gameState) {
        var satisfaction = Calculations.calculateSatisfaction(gameState);
        var stability    = Calculations.checkStability(satisfaction);
        var overall      = Calculations.calculateOverallScore(satisfaction);
        var balance      = Calculations.calculateCompetitiveBalance(gameState.sliders);
        var conflicts    = Calculations.detectConflicts(gameState);

        this.updateSatisfactionBars(satisfaction);
        this.updateCharacterReactions(satisfaction);
        this.updateOverallScore(overall, Calculations.determineTier(satisfaction, gameState));
        this.updateCompetitiveBalance(balance);
        this.updateStability(stability);
        this.updateFlowChart(gameState.allocation);
        this.updateConflictWarnings(conflicts);
        this.updateStrategyTips(satisfaction, conflicts, gameState);

        // Store for next diff comparison
        this._prevSatisfaction = Object.assign({}, satisfaction);
    },

    // Update satisfaction progress bars
    updateSatisfactionBars(satisfaction) {
        var keys = ['players', 'owners', 'networks', 'fans'];
        keys.forEach(function(key) {
            var bar = document.getElementById('sat-bar-' + key);
            var val = document.getElementById('sat-val-' + key);
            var pct = satisfaction[key];
            if (bar) {
                bar.style.width = pct + '%';
                bar.className = 'satisfaction-fill';
                if (pct < 45)      bar.classList.add('low');
                else if (pct < 70) bar.classList.add('medium');
            }
            if (val) val.textContent = pct + '%';
        });
    },

    // Update character emoji faces, speech bubbles, and border color
    updateCharacterReactions(satisfaction) {
        var self = this;
        var keys = ['players', 'owners', 'networks', 'fans'];
        keys.forEach(function(key) {
            var pct         = satisfaction[key];
            var prev        = self._prevSatisfaction[key];
            var reactionKey = Calculations.getReactionLevel(pct);
            var reaction    = MLB_DATA.reactions[key][reactionKey];

            var faceEl   = document.getElementById('face-' + key);
            var speechEl = document.getElementById('speech-' + key);
            var cardEl   = document.getElementById('char-' + key);

            if (faceEl)   faceEl.textContent   = reaction.face;
            if (speechEl) speechEl.textContent = reaction.speech;

            if (cardEl) {
                // Satisfaction tier border color
                cardEl.classList.remove('sat-good', 'sat-warn', 'sat-bad');
                if (pct >= 70)      cardEl.classList.add('sat-good');
                else if (pct >= 45) cardEl.classList.add('sat-warn');
                else                cardEl.classList.add('sat-bad');

                // Pulse animation on significant change
                if (Math.abs(pct - prev) >= 8) {
                    cardEl.classList.remove('pulse-react');
                    void cardEl.offsetWidth; // reflow to restart animation
                    cardEl.classList.add('pulse-react');
                }
            }
        });
    },

    // Update the overall score circle
    updateOverallScore(overall, tier) {
        var circle     = document.getElementById('overall-score');
        var scoreValue = circle ? circle.querySelector('.score-value') : null;
        if (scoreValue) scoreValue.textContent = overall;
        if (circle) {
            circle.className = 'score-circle';
            if (tier && tier !== 'fail') circle.classList.add(tier);
            else if (tier === 'fail')    circle.classList.add('fail');
        }
    },

    // Update the competitive balance meter
    updateCompetitiveBalance(balance) {
        var fill = document.getElementById('balance-fill');
        if (fill) fill.style.width = balance + '%';
    },

    // Update the stability text in the header
    updateStability(stability) {
        var el = document.getElementById('stability-text');
        if (!el) return;
        el.textContent = stability.message;
        el.className = '';
        if (stability.color === 'warning') el.classList.add('warning');
        else if (stability.color === 'danger') el.classList.add('danger');

        // Drive heartbeat mode
        this._heartbeatStatus = stability.status;
    },

    // --- Heartbeat Canvas (continuous scrolling EKG) ---
    startHeartbeat() {
        var canvas = document.getElementById('heartbeat-canvas');
        if (!canvas) return;

        var w   = canvas.width;
        var h   = canvas.height;
        this._heartbeatPoints = new Array(w).fill(h / 2);

        var self      = this;
        var lastBeat  = 0;
        var beatPhase = 0;

        function draw(timestamp) {
            var ctx    = canvas.getContext('2d');
            var mid    = h / 2;
            var status = self._heartbeatStatus;

            // Shift left by 2 pixels each frame
            self._heartbeatPoints.shift();
            self._heartbeatPoints.shift();

            var newY1, newY2;
            if (status === 'critical') {
                newY1 = mid + (Math.random() < 0.08 ? (Math.random() - 0.5) * h * 1.2 : (Math.random() - 0.5) * 3);
                newY2 = mid + (Math.random() - 0.5) * 3;
            } else if (status === 'unstable' || status === 'warning') {
                beatPhase += 0.25;
                var spike = 0;
                if ((timestamp - lastBeat) > 450) { spike = -h * 0.55; lastBeat = timestamp; }
                newY1 = mid + spike + Math.sin(beatPhase * 2.5) * 4;
                newY2 = mid + Math.sin(beatPhase * 2.5 + 0.25) * 4;
            } else {
                beatPhase += 0.18;
                var spike2 = 0;
                if ((timestamp - lastBeat) > 700) { spike2 = -h * 0.48; lastBeat = timestamp; }
                newY1 = mid + spike2 + Math.sin(beatPhase) * 3;
                newY2 = mid + Math.sin(beatPhase + 0.18) * 3;
            }

            self._heartbeatPoints.push(Math.min(h - 1, Math.max(1, newY1)));
            self._heartbeatPoints.push(Math.min(h - 1, Math.max(1, newY2)));

            // Render
            ctx.clearRect(0, 0, w, h);
            ctx.fillStyle = '#001a3a';
            ctx.fillRect(0, 0, w, h);

            // Subtle grid
            ctx.strokeStyle = 'rgba(255,255,255,0.06)';
            ctx.lineWidth   = 1;
            for (var gx = 0; gx < w; gx += 20) {
                ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, h); ctx.stroke();
            }
            ctx.beginPath(); ctx.moveTo(0, mid); ctx.lineTo(w, mid); ctx.stroke();

            // Waveform color by status
            var lineColor = (status === 'critical' || status === 'unstable') ? '#dc3545'
                          : status === 'warning' ? '#ffc107'
                          : '#28a745';
            ctx.beginPath();
            ctx.strokeStyle = lineColor;
            ctx.lineWidth   = 2;
            ctx.shadowColor = lineColor;
            ctx.shadowBlur  = 5;
            ctx.moveTo(0, self._heartbeatPoints[0]);
            for (var i = 1; i < self._heartbeatPoints.length; i++) {
                ctx.lineTo(i, self._heartbeatPoints[i]);
            }
            ctx.stroke();

            self._heartbeatAnimFrame = requestAnimationFrame(draw);
        }

        if (this._heartbeatAnimFrame) cancelAnimationFrame(this._heartbeatAnimFrame);
        requestAnimationFrame(draw);
    },

    stopHeartbeat() {
        if (this._heartbeatAnimFrame) {
            cancelAnimationFrame(this._heartbeatAnimFrame);
            this._heartbeatAnimFrame = null;
        }
    },

    // Legacy stub — driven by startHeartbeat loop now
    updateHeartbeat() {},

    // Money flow bar chart
    updateFlowChart(allocation) {
        var canvas = document.getElementById('flow-chart');
        if (!canvas) return;

        var ctx  = canvas.getContext('2d');
        var w    = canvas.width;
        var h    = canvas.height;
        ctx.clearRect(0, 0, w, h);

        var bars = [
            { label: 'Players',  value: allocation.players,  color: '#002B5C' },
            { label: 'Owners',   value: allocation.owners,   color: '#CE1141' },
            { label: 'Networks', value: allocation.networks, color: '#28A745' },
            { label: 'League',   value: allocation.league,   color: '#FFC107' }
        ];

        var barH   = 20;
        var gap    = 8;
        var labelW = 55;
        var maxW   = w - labelW - 10;

        bars.forEach(function(bar, i) {
            var y  = i * (barH + gap) + 10;
            var bw = (bar.value / 8) * maxW;

            ctx.fillStyle = '#666';
            ctx.font      = '11px Segoe UI, sans-serif';
            ctx.fillText(bar.label, 0, y + barH - 5);

            ctx.fillStyle = '#e0e0e0';
            ctx.fillRect(labelW, y, maxW, barH);

            if (bw > 0) {
                ctx.fillStyle = bar.color;
                ctx.fillRect(labelW, y, bw, barH);
            }

            ctx.fillStyle = '#333';
            ctx.font      = '10px Segoe UI, sans-serif';
            ctx.fillText('$' + bar.value.toFixed(1) + 'B', labelW + bw + 4, y + barH - 5);
        });
    },

    // Highlight character cards with opposing-interest conflicts
    updateConflictWarnings(conflicts) {
        var allKeys = ['players', 'owners', 'networks', 'fans'];

        // Clear all conflict highlights
        allKeys.forEach(function(key) {
            var card = document.getElementById('char-' + key);
            if (!card) return;
            card.classList.remove('conflict-highlight');
            var tip = card.querySelector('.conflict-tooltip');
            if (tip) tip.textContent = '';
        });

        // Apply new conflicts
        conflicts.forEach(function(c) {
            [c.a, c.b].forEach(function(key) {
                var card = document.getElementById('char-' + key);
                if (!card) return;
                card.classList.add('conflict-highlight');
                var tip = card.querySelector('.conflict-tooltip');
                if (!tip) {
                    tip = document.createElement('div');
                    tip.className = 'conflict-tooltip';
                    card.appendChild(tip);
                }
                tip.textContent = '⚡ ' + c.message;
            });
        });
    },

    // Strategy tips in the right panel
    updateStrategyTips(satisfaction, conflicts, gameState) {
        var container = document.getElementById('strategy-tips-content');
        if (!container) return;

        var tips = [];

        var lowest = Calculations.getLowestStakeholder(satisfaction);
        if (lowest.value < 55) {
            var fix = {
                players:  'Try increasing the Players allocation or player revenue share %.',
                owners:   'Lower the player revenue share % or raise their allocation.',
                networks: 'Give Networks a bigger allocation or set game time to 8–9 PM.',
                fans:     'Raise revenue sharing % to improve competitive balance.'
            }[lowest.name];
            tips.push(lowest.name.charAt(0).toUpperCase() + lowest.name.slice(1) + ' at ' + lowest.value + '% — ' + fix);
        }

        if (conflicts.length > 0) {
            tips.push('Conflict: ' + conflicts[0].message + '.');
        }

        var remaining = Calculations.getRemainingMoney(gameState.allocation);
        if (remaining > 0.05) {
            tips.push('$' + remaining.toFixed(1) + 'B unallocated — distribute it to advance.');
        }

        if (tips.length === 0) {
            tips.push('Looking good! All stakeholders are satisfied.');
        }

        container.innerHTML = tips.slice(0, 2).map(function(t) {
            return '<p class="tip-item">' + t + '</p>';
        }).join('');
    },

    // Update phase progress stepper
    updateStepper(phaseId) {
        var steps    = ['step-1', 'step-2', 'step-3'];
        var phaseMap = { 'phase-money': 0, 'phase-sliders': 1, 'phase-minigames': 2 };
        var current  = phaseMap[phaseId] !== undefined ? phaseMap[phaseId] : 0;

        steps.forEach(function(id, idx) {
            var el = document.getElementById(id);
            if (!el) return;
            el.classList.remove('active', 'completed');
            if (idx < current)       el.classList.add('completed');
            else if (idx === current) el.classList.add('active');
        });
    },

    // Animated count-up for results score
    countUp(element, target, durationMs) {
        if (!element) return;
        var startTime = null;

        function step(timestamp) {
            if (!startTime) startTime = timestamp;
            var progress = Math.min((timestamp - startTime) / durationMs, 1);
            var eased    = 1 - Math.pow(1 - progress, 3); // ease-out cubic
            element.textContent = Math.round(target * eased);
            if (progress < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
    },

    // Show breaking news banner
    showNewsAlert(event) {
        var banner     = document.getElementById('news-banner');
        var headlineEl = document.getElementById('news-headline');
        if (!banner || !headlineEl) return;

        headlineEl.textContent = event.headline;
        banner.style.display   = 'block';

        // Auto-dismiss after 6 seconds
        var self = this;
        clearTimeout(this._newsBannerTimeout);
        this._newsBannerTimeout = setTimeout(function() { self.hideNewsAlert(); }, 6000);

        var dismissBtn = document.getElementById('news-dismiss');
        if (dismissBtn) {
            dismissBtn.onclick = function() { self.hideNewsAlert(); };
        }
    },

    hideNewsAlert() {
        var banner = document.getElementById('news-banner');
        if (banner) banner.style.display = 'none';
    },

    // Show results screen with animated reveal
    showResults(satisfaction, tier, gameState) {
        var overall   = Calculations.calculateOverallScore(satisfaction);
        var narrative = Calculations.generateNarrative(tier, satisfaction);
        var claimCode = CodeGen.generate(tier, overall);

        document.getElementById('game-screen').classList.remove('active');
        var resultsScreen = document.getElementById('results-screen');
        resultsScreen.classList.add('active');

        if (tier === 'fail') {
            document.getElementById('results-success').style.display = 'none';
            var failDiv = document.getElementById('results-failed');
            failDiv.style.display = '';

            var lowest  = Calculations.getLowestStakeholder(satisfaction);
            var capName = lowest.name.charAt(0).toUpperCase() + lowest.name.slice(1);
            var failMsg = document.getElementById('fail-message');
            if (failMsg) failMsg.textContent = capName + ' walked away at ' + lowest.value + '% satisfaction — the deal collapsed.';

            ['players', 'owners', 'networks', 'fans'].forEach(function(k) {
                var el = document.getElementById('fail-' + k);
                if (el) el.textContent = satisfaction[k] + '%';
            });
        } else {
            document.getElementById('results-failed').style.display = 'none';
            var successDiv = document.getElementById('results-success');
            successDiv.style.display = '';

            // Animated score counter
            var scoreEl = document.getElementById('grade-score');
            if (scoreEl) {
                scoreEl.innerHTML = '<span id="animated-score">0</span><span class="grade-pct">%</span>';
                this.countUp(document.getElementById('animated-score'), overall, 1500);
            }

            // Tier badge styling
            var badge  = document.getElementById('grade-badge');
            var tierEl = document.getElementById('grade-tier');
            if (badge)  badge.className   = 'grade-badge ' + tier + '-badge';
            if (tierEl) { tierEl.textContent = tier.toUpperCase(); tierEl.className = 'grade-tier ' + tier; }

            // Final stats
            ['players', 'owners', 'networks', 'fans'].forEach(function(k) {
                var el = document.getElementById('final-' + k);
                if (el) el.textContent = satisfaction[k] + '%';
            });

            var narrativeEl = document.getElementById('result-narrative');
            if (narrativeEl) narrativeEl.textContent = narrative;

            var codeEl = document.getElementById('claim-code');
            if (codeEl) codeEl.textContent = claimCode;

            // Confetti only on gold
            var confetti = document.getElementById('confetti-container');
            if (confetti) confetti.style.display = tier === 'gold' ? 'block' : 'none';
        }

        this.stopHeartbeat();
    },

    // Update the countdown timer display
    updateTimer(seconds) {
        var el = document.getElementById('timer-value');
        if (!el) return;
        var mins = Math.floor(seconds / 60);
        var secs = seconds % 60;
        el.textContent = mins + ':' + (secs < 10 ? '0' : '') + secs;
        el.style.color = seconds <= 30 ? 'var(--danger)' : seconds <= 60 ? 'var(--warning)' : 'white';
    },

    // Reset all UI to fresh state for a new game
    reset() {
        var keys = ['players', 'owners', 'networks', 'fans'];

        keys.forEach(function(key) {
            var bar  = document.getElementById('sat-bar-' + key);
            var val  = document.getElementById('sat-val-' + key);
            var face = document.getElementById('face-' + key);
            var card = document.getElementById('char-' + key);

            if (bar)  { bar.style.width = '50%'; bar.className = 'satisfaction-fill'; }
            if (val)  val.textContent = '50%';
            if (face) face.textContent = '😊';
            if (card) {
                card.classList.remove('sat-good', 'sat-warn', 'sat-bad', 'conflict-highlight', 'pulse-react', 'happy', 'unhappy');
                var tip = card.querySelector('.conflict-tooltip');
                if (tip) tip.textContent = '';
            }
        });

        var scoreCircle = document.getElementById('overall-score');
        if (scoreCircle) {
            scoreCircle.className = 'score-circle';
            var sv = scoreCircle.querySelector('.score-value');
            if (sv) sv.textContent = '50';
        }

        var balanceFill = document.getElementById('balance-fill');
        if (balanceFill) balanceFill.style.width = '50%';

        var timerEl = document.getElementById('timer-value');
        if (timerEl) { timerEl.textContent = '5:00'; timerEl.style.color = 'white'; }

        var stabilityEl = document.getElementById('stability-text');
        if (stabilityEl) { stabilityEl.textContent = 'DEAL STABLE'; stabilityEl.className = ''; }

        var confetti = document.getElementById('confetti-container');
        if (confetti) confetti.style.display = 'none';

        this.hideNewsAlert();

        this._prevSatisfaction = { players: 50, owners: 50, networks: 50, fans: 50 };
        this._heartbeatStatus  = 'stable';
        this.updateStepper('phase-money');
    }
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = UI;
}

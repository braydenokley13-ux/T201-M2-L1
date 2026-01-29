/**
 * MLB Money Maker - UI Controller
 * Handles DOM updates, character reactions, and visual feedback
 * BOW Sports Capital Presents
 */

const UI = {
    // Update all UI elements based on game state
    update(gameState) {
        const satisfaction = Calculations.calculateSatisfaction(gameState);

        this.updateSatisfactionBars(satisfaction);
        this.updateCharacterReactions(satisfaction);
        this.updateOverallScore(satisfaction);
        this.updateCompetitiveBalance(gameState.sliders);
        this.updateStability(satisfaction);
        this.updateFlowChart(gameState.allocation);
    },

    // Update satisfaction bars for all stakeholders
    updateSatisfactionBars(satisfaction) {
        const stakeholders = ['players', 'owners', 'networks', 'fans'];

        stakeholders.forEach(stakeholder => {
            const value = satisfaction[stakeholder];
            const bar = document.getElementById(`sat-bar-${stakeholder}`);
            const valueEl = document.getElementById(`sat-val-${stakeholder}`);

            if (bar) {
                bar.style.width = `${value}%`;

                // Update color based on value
                bar.classList.remove('low', 'medium');
                if (value < 40) {
                    bar.classList.add('low');
                } else if (value < 60) {
                    bar.classList.add('medium');
                }
            }

            if (valueEl) {
                valueEl.textContent = `${value}%`;
            }

            // Update character card styling
            const charCard = document.getElementById(`char-${stakeholder}`);
            if (charCard) {
                charCard.classList.remove('happy', 'unhappy');
                if (value >= 70) {
                    charCard.classList.add('happy');
                } else if (value < 45) {
                    charCard.classList.add('unhappy');
                }
            }
        });
    },

    // Update character faces and speech bubbles
    updateCharacterReactions(satisfaction) {
        const stakeholders = ['players', 'owners', 'networks', 'fans'];

        stakeholders.forEach(stakeholder => {
            const value = satisfaction[stakeholder];
            const level = Calculations.getReactionLevel(value);
            const reaction = MLB_DATA.reactions[stakeholder][level];

            const faceEl = document.getElementById(`face-${stakeholder}`);
            const speechEl = document.getElementById(`speech-${stakeholder}`);

            if (faceEl && reaction) {
                faceEl.textContent = reaction.face;

                // Add animation class
                faceEl.classList.add('animate-in');
                setTimeout(() => faceEl.classList.remove('animate-in'), 300);
            }

            if (speechEl && reaction) {
                speechEl.textContent = reaction.speech;
            }
        });
    },

    // Update overall score display
    updateOverallScore(satisfaction) {
        const score = Calculations.calculateOverallScore(satisfaction);
        const tier = Calculations.determineTier(score, satisfaction);

        const scoreCircle = document.getElementById('overall-score');
        const scoreValue = scoreCircle?.querySelector('.score-value');

        if (scoreValue) {
            scoreValue.textContent = score;
        }

        if (scoreCircle) {
            scoreCircle.classList.remove('gold', 'silver', 'bronze', 'fail');
            if (tier !== 'fail') {
                scoreCircle.classList.add(tier);
            } else if (score < 50) {
                scoreCircle.classList.add('fail');
            }
        }
    },

    // Update competitive balance meter
    updateCompetitiveBalance(sliders) {
        const balance = Calculations.calculateCompetitiveBalance(sliders);
        const fill = document.getElementById('balance-fill');

        if (fill) {
            fill.style.width = `${balance}%`;
        }
    },

    // Update deal stability indicator
    updateStability(satisfaction) {
        const stability = Calculations.checkStability(satisfaction);
        const textEl = document.getElementById('stability-text');

        if (textEl) {
            textEl.textContent = stability.message;
            textEl.className = ''; // Reset classes
            textEl.classList.add(stability.color);

            if (stability.status === 'critical') {
                textEl.classList.add('danger');
            }
        }

        // Update heartbeat animation
        this.updateHeartbeat(stability.status);
    },

    // Update heartbeat canvas animation
    updateHeartbeat(status) {
        const canvas = document.getElementById('heartbeat-canvas');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;

        // Clear
        ctx.clearRect(0, 0, width, height);

        // Set color based on status
        let color = '#28A745'; // Green
        if (status === 'warning') color = '#FFC107';
        if (status === 'unstable' || status === 'critical') color = '#DC3545';

        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.beginPath();

        // Draw heartbeat line
        const midY = height / 2;

        if (status === 'critical') {
            // Flatline
            ctx.moveTo(0, midY);
            ctx.lineTo(width, midY);
        } else {
            // Normal or irregular heartbeat
            ctx.moveTo(0, midY);

            for (let x = 0; x < width; x += 40) {
                if (status === 'stable') {
                    // Normal rhythm
                    ctx.lineTo(x + 10, midY);
                    ctx.lineTo(x + 15, midY - 15);
                    ctx.lineTo(x + 20, midY + 10);
                    ctx.lineTo(x + 25, midY);
                    ctx.lineTo(x + 40, midY);
                } else {
                    // Irregular rhythm
                    ctx.lineTo(x + 10, midY);
                    ctx.lineTo(x + 12, midY - 8);
                    ctx.lineTo(x + 18, midY + 5);
                    ctx.lineTo(x + 22, midY - 3);
                    ctx.lineTo(x + 28, midY);
                    ctx.lineTo(x + 40, midY);
                }
            }
        }

        ctx.stroke();
    },

    // Update money flow chart
    updateFlowChart(allocation) {
        const canvas = document.getElementById('flow-chart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;

        ctx.clearRect(0, 0, width, height);

        const data = [
            { label: 'Players', value: allocation.players, color: '#002B5C' },
            { label: 'Owners', value: allocation.owners, color: '#CE1141' },
            { label: 'Networks', value: allocation.networks, color: '#28A745' },
            { label: 'League', value: allocation.league, color: '#FFC107' }
        ];

        const barHeight = 20;
        const gap = 8;
        let y = 10;

        data.forEach(item => {
            const barWidth = (item.value / 8) * (width - 50);

            // Bar
            ctx.fillStyle = item.color;
            ctx.fillRect(5, y, barWidth, barHeight);

            // Label
            ctx.fillStyle = '#333';
            ctx.font = '10px sans-serif';
            ctx.fillText(`${item.label}: $${item.value.toFixed(1)}B`, barWidth + 10, y + 14);

            y += barHeight + gap;
        });
    },

    // Show results screen
    showResults(gameState, satisfaction, tier, claimCode) {
        // Hide game screen, show results
        document.getElementById('game-screen').classList.remove('active');
        document.getElementById('results-screen').classList.add('active');

        const overallScore = Calculations.calculateOverallScore(satisfaction);
        const tierInfo = CodeGenerator.getTierInfo(tier);

        if (tier === 'fail') {
            // Show failure
            document.getElementById('results-success').style.display = 'none';
            document.getElementById('results-failed').style.display = 'block';

            const lowest = Calculations.getLowestStakeholder(satisfaction);
            const message = `The ${lowest.name.charAt(0).toUpperCase() + lowest.name.slice(1)} (${lowest.value}% satisfied) walked away from the table.`;
            document.getElementById('fail-message').textContent = message;
        } else {
            // Show success
            document.getElementById('results-success').style.display = 'block';
            document.getElementById('results-failed').style.display = 'none';

            // Update title
            document.getElementById('result-title').textContent = tierInfo.title;

            // Update grade
            const gradeEl = document.getElementById('grade-tier');
            gradeEl.textContent = tierInfo.name;
            gradeEl.className = 'grade-tier ' + tier;

            document.getElementById('grade-score').textContent = `${overallScore}%`;

            // Update final stats
            document.getElementById('final-players').textContent = `${satisfaction.players}%`;
            document.getElementById('final-owners').textContent = `${satisfaction.owners}%`;
            document.getElementById('final-networks').textContent = `${satisfaction.networks}%`;
            document.getElementById('final-fans').textContent = `${satisfaction.fans}%`;

            // Update narrative
            const narrative = Calculations.generateNarrative(tier, satisfaction, gameState.sliders);
            document.getElementById('result-narrative').textContent = narrative;

            // Update claim code
            document.getElementById('claim-code').textContent = claimCode;
        }
    },

    // Update timer display
    updateTimer(seconds) {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        const display = `${minutes}:${secs.toString().padStart(2, '0')}`;

        const timerEl = document.getElementById('timer-value');
        if (timerEl) {
            timerEl.textContent = display;

            // Change color when low
            if (seconds <= 60) {
                timerEl.style.color = '#DC3545';
            } else if (seconds <= 120) {
                timerEl.style.color = '#FFC107';
            }
        }
    },

    // Reset UI for new game
    reset() {
        // Reset timer color
        const timerEl = document.getElementById('timer-value');
        if (timerEl) {
            timerEl.style.color = 'white';
        }

        // Reset score circle
        const scoreCircle = document.getElementById('overall-score');
        if (scoreCircle) {
            scoreCircle.classList.remove('gold', 'silver', 'bronze', 'fail');
        }

        // Reset all character cards
        const stakeholders = ['players', 'owners', 'networks', 'fans'];
        stakeholders.forEach(s => {
            const card = document.getElementById(`char-${s}`);
            if (card) {
                card.classList.remove('happy', 'unhappy');
            }
        });
    }
};

// Export for module use (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UI;
}

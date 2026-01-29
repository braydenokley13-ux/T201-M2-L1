/**
 * MLB Money Maker - Calculations
 * Handles all satisfaction scoring and deal stability
 * BOW Sports Capital Presents
 */

const Calculations = {
    // Total deal amount in billions
    TOTAL_DEAL: 8.0,

    // Calculate satisfaction based on money allocation and sliders
    calculateSatisfaction(gameState) {
        const satisfaction = {
            players: 0,
            owners: 0,
            networks: 0,
            fans: 0
        };

        // Get allocation values (already in billions)
        const { allocation, sliders } = gameState;

        // === PLAYERS SATISFACTION ===
        // Players care about: their allocation, minimum salary, player revenue share
        let playerBase = this.mapRange(allocation.players, 2.5, 4.5, 30, 90);
        let salaryBonus = this.mapRange(sliders.salary, 400, 1500, -10, 20);
        let shareBonus = this.mapRange(sliders.playershare, 40, 60, -20, 30);
        satisfaction.players = Math.round(Math.min(100, Math.max(0, playerBase + salaryBonus + shareBonus)));

        // === OWNERS SATISFACTION ===
        // Owners care about: their allocation, low player share, reasonable revenue sharing
        let ownerBase = this.mapRange(allocation.owners, 1.5, 3.5, 30, 90);
        let ownerSharePenalty = this.mapRange(sliders.playershare, 40, 60, 20, -20); // inverse
        let revSharePenalty = this.mapRange(sliders.sharing, 10, 60, 10, -15);
        satisfaction.owners = Math.round(Math.min(100, Math.max(0, ownerBase + ownerSharePenalty + revSharePenalty)));

        // === NETWORKS SATISFACTION ===
        // Networks care about: their allocation, game times (prime time), streaming balance
        let networkBase = this.mapRange(allocation.networks, 1.0, 2.5, 30, 85);
        let timeBonus = this.getTimeBonus(sliders.gametime);
        let streamingBalance = this.getStreamingBalance(sliders.streaming);
        satisfaction.networks = Math.round(Math.min(100, Math.max(0, networkBase + timeBonus + streamingBalance)));

        // === FANS SATISFACTION ===
        // Fans care about: competitive balance (revenue sharing), game times, streaming access
        let fanBase = 50; // Start neutral
        let balanceBonus = this.mapRange(sliders.sharing, 10, 60, -20, 30);
        let fanTimeBonus = this.getFanTimeBonus(sliders.gametime);
        let streamingAccess = this.mapRange(sliders.streaming, 0, 100, -10, 15);
        // Fans also care about player satisfaction (they want stars happy)
        let starBonus = satisfaction.players > 70 ? 10 : (satisfaction.players < 40 ? -15 : 0);
        satisfaction.fans = Math.round(Math.min(100, Math.max(0, fanBase + balanceBonus + fanTimeBonus + streamingAccess + starBonus)));

        return satisfaction;
    },

    // Helper: Map a value from one range to another
    mapRange(value, inMin, inMax, outMin, outMax) {
        return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
    },

    // Game time bonus for networks (they want prime time 8-9pm)
    getTimeBonus(time) {
        if (time >= 7.5 && time <= 9) return 15; // Prime time
        if (time >= 9 && time <= 10) return 5;   // Okay
        return -10; // Too early or too late
    },

    // Game time bonus for fans (they want reasonable times)
    getFanTimeBonus(time) {
        if (time >= 7 && time <= 8.5) return 15;  // Ideal for East Coast families
        if (time >= 8.5 && time <= 9.5) return 5; // Okay
        return -15; // Too late, kids can't watch
    },

    // Streaming balance for networks (they want some streaming but not too much)
    getStreamingBalance(streaming) {
        if (streaming >= 20 && streaming <= 40) return 15;  // Sweet spot
        if (streaming >= 10 && streaming <= 60) return 5;   // Acceptable
        if (streaming < 10) return -5;  // Missing streaming revenue
        return -15; // Too much streaming hurts traditional TV
    },

    // Calculate overall score (average of all stakeholders)
    calculateOverallScore(satisfaction) {
        const { players, owners, networks, fans } = satisfaction;
        return Math.round((players + owners + networks + fans) / 4);
    },

    // Determine tier based on overall score
    determineTier(overallScore, satisfaction) {
        // Check if any stakeholder is below critical threshold
        const minSat = Math.min(satisfaction.players, satisfaction.owners, satisfaction.networks, satisfaction.fans);

        if (minSat < 40) {
            return 'fail';
        }

        if (overallScore >= 90 && minSat >= 75) {
            return 'gold';
        } else if (overallScore >= 80 && minSat >= 60) {
            return 'silver';
        } else if (overallScore >= 70 && minSat >= 45) {
            return 'bronze';
        } else {
            return 'fail';
        }
    },

    // Calculate competitive balance score (for display)
    calculateCompetitiveBalance(sliders) {
        // Higher revenue sharing = more balance
        let balance = this.mapRange(sliders.sharing, 10, 60, 20, 90);
        return Math.round(Math.min(100, Math.max(0, balance)));
    },

    // Check deal stability (returns status and message)
    checkStability(satisfaction) {
        const minSat = Math.min(satisfaction.players, satisfaction.owners, satisfaction.networks, satisfaction.fans);
        const avgSat = this.calculateOverallScore(satisfaction);

        if (minSat < 30) {
            return {
                status: 'critical',
                message: 'DEAL COLLAPSING',
                color: 'danger'
            };
        } else if (minSat < 45) {
            return {
                status: 'unstable',
                message: 'DEAL UNSTABLE',
                color: 'danger'
            };
        } else if (minSat < 60 || avgSat < 60) {
            return {
                status: 'warning',
                message: 'CONCERNS RISING',
                color: 'warning'
            };
        } else {
            return {
                status: 'stable',
                message: 'DEAL STABLE',
                color: 'success'
            };
        }
    },

    // Get the stakeholder with lowest satisfaction
    getLowestStakeholder(satisfaction) {
        let lowest = 'players';
        let lowestValue = satisfaction.players;

        for (const [key, value] of Object.entries(satisfaction)) {
            if (value < lowestValue) {
                lowest = key;
                lowestValue = value;
            }
        }

        return { name: lowest, value: lowestValue };
    },

    // Get reaction level based on satisfaction
    getReactionLevel(satisfaction) {
        if (satisfaction >= 85) return 'veryHappy';
        if (satisfaction >= 70) return 'happy';
        if (satisfaction >= 50) return 'neutral';
        if (satisfaction >= 35) return 'unhappy';
        if (satisfaction >= 20) return 'angry';
        return 'furious';
    },

    // Generate narrative based on final state
    generateNarrative(tier, satisfaction, sliders) {
        const narratives = {
            gold: `Congratulations! You've negotiated a landmark media deal that satisfies all parties. Players receive fair compensation (${satisfaction.players}% satisfied), owners maintain healthy profits (${satisfaction.owners}%), networks secured prime content (${satisfaction.networks}%), and fans get competitive baseball (${satisfaction.fans}%). This deal will reshape MLB for the next decade.`,

            silver: `Good work! The deal is done, though some compromises were necessary. The ${sliders.sharing}% revenue sharing creates reasonable competitive balance. While not perfect, all stakeholders accepted the terms. This proves you understand the delicate balance of league economics.`,

            bronze: `The deal passed, but just barely. Some stakeholders are unhappy with the terms. The league will need to revisit certain aspects before the deal expires. You've learned that pleasing everyone in sports business is nearly impossible—trade-offs are inevitable.`,

            fail: `The deal collapsed. ${this.getLowestStakeholder(satisfaction).name.charAt(0).toUpperCase() + this.getLowestStakeholder(satisfaction).name.slice(1)} (${this.getLowestStakeholder(satisfaction).value}% satisfied) couldn't accept the terms. In real negotiations, this would mean a lockout or strike. Remember: every stakeholder has a breaking point.`
        };

        return narratives[tier] || narratives.fail;
    },

    // Validate allocation totals to exactly $8B
    validateAllocation(allocation) {
        const total = allocation.players + allocation.owners + allocation.networks + allocation.league;
        return Math.abs(total - this.TOTAL_DEAL) < 0.1; // Allow small floating point errors
    },

    // Calculate remaining money to allocate
    getRemainingMoney(allocation) {
        const total = allocation.players + allocation.owners + allocation.networks + allocation.league;
        return Math.max(0, this.TOTAL_DEAL - total);
    }
};

// Export for module use (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Calculations;
}

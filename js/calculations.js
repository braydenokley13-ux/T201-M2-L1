/**
 * MLB Money Maker - Calculations v2
 * Satisfaction scoring, conflict detection, diminishing returns
 * BOW Sports Capital Presents
 */

const Calculations = {
    TOTAL_DEAL: 8.0,

    // Diminishing returns curve applied to bonus/penalty terms.
    // strength < 1 flattens extreme values so one slider can't dominate the score.
    diminishingReturns(x, strength) {
        if (strength === undefined) strength = 0.7;
        if (x === 0) return 0;
        var sign = x > 0 ? 1 : -1;
        return sign * Math.pow(Math.abs(x) / 100, strength) * 100;
    },

    // Map a value from one range to another (linear, no clamping at source)
    mapRange(value, inMin, inMax, outMin, outMax) {
        var clamped = Math.min(inMax, Math.max(inMin, value));
        return ((clamped - inMin) / (inMax - inMin)) * (outMax - outMin) + outMin;
    },

    // Calculate all stakeholder satisfaction scores
    calculateSatisfaction(gameState) {
        var satisfaction = { players: 0, owners: 0, networks: 0, fans: 0 };
        var allocation   = gameState.allocation;
        var sliders      = gameState.sliders;
        var activeEvent  = gameState.activeEvent || null;
        var difficulty   = gameState.difficulty  || 'normal';

        // Difficulty multiplier: hard amplifies swings, easy softens them
        var diffMult = difficulty === 'hard' ? 1.2 : difficulty === 'easy' ? 0.85 : 1.0;

        // === PLAYERS ===
        var playerBase  = this.mapRange(allocation.players, 2.5, 4.5, 30, 90);
        var salaryBonus = this.diminishingReturns(this.mapRange(sliders.salary, 400, 1500, -10, 20)) * diffMult;
        var shareBonus  = this.diminishingReturns(this.mapRange(sliders.playershare, 40, 60, -20, 30)) * diffMult;
        if (activeEvent && activeEvent.stakeholder === 'players') {
            shareBonus += activeEvent.modifier;
        }
        satisfaction.players = Math.round(Math.min(100, Math.max(0, playerBase + salaryBonus + shareBonus)));

        // === OWNERS ===
        var ownerBase          = this.mapRange(allocation.owners, 1.5, 3.5, 30, 90);
        var ownerSharePenalty  = this.diminishingReturns(this.mapRange(sliders.playershare, 40, 60, 15, -20)) * diffMult;
        var ownerSharingPenalty= this.diminishingReturns(this.mapRange(sliders.sharing, 10, 60, 10, -15)) * diffMult;
        if (activeEvent && activeEvent.stakeholder === 'owners') {
            ownerBase += activeEvent.modifier;
        }
        satisfaction.owners = Math.round(Math.min(100, Math.max(0, ownerBase + ownerSharePenalty + ownerSharingPenalty)));

        // === NETWORKS ===
        var networkBase    = this.mapRange(allocation.networks, 1.0, 2.5, 30, 85);
        var timeBonus      = this.getTimeBonus(sliders.gametime) * diffMult;
        var streamingBonus = this.getStreamingBalance(sliders.streaming) * diffMult;
        if (activeEvent && activeEvent.stakeholder === 'networks') {
            timeBonus += activeEvent.modifier;
        }
        satisfaction.networks = Math.round(Math.min(100, Math.max(0, networkBase + timeBonus + streamingBonus)));

        // === FANS ===
        var fanBase      = 50;
        var sharingBonus = this.diminishingReturns(this.mapRange(sliders.sharing, 10, 60, -10, 20)) * diffMult;
        var fanTimeBonus = this.getFanTimeBonus(sliders.gametime) * diffMult;
        var streamFan    = this.mapRange(sliders.streaming, 0, 100, 0, 15);
        var starBonus    = satisfaction.players >= 70 ? 5 : (satisfaction.players < 40 ? -5 : 0);
        if (activeEvent && activeEvent.stakeholder === 'fans') {
            sharingBonus += activeEvent.modifier;
        }
        satisfaction.fans = Math.round(Math.min(100, Math.max(0, fanBase + sharingBonus + fanTimeBonus + streamFan + starBonus)));

        return satisfaction;
    },

    // Networks prefer 8–9 PM prime time
    getTimeBonus(gametime) {
        if (gametime >= 8 && gametime <= 9)    return 15;
        if (gametime >= 7.5 && gametime < 8)   return 5;
        if (gametime > 9 && gametime <= 10)    return 5;
        if (gametime > 10)                     return -10;
        return -5;
    },

    // Fans prefer 7–8:30 PM (earlier than networks)
    getFanTimeBonus(gametime) {
        if (gametime >= 7 && gametime <= 8.5)  return 10;
        if (gametime > 8.5 && gametime <= 9.5) return 0;
        if (gametime > 9.5)                    return -15;
        return 0;
    },

    // Networks prefer 20–40% streaming sweet spot
    getStreamingBalance(streaming) {
        if (streaming >= 20 && streaming <= 40) return 10;
        if (streaming < 20) return this.mapRange(streaming, 0, 20, -5, 10);
        if (streaming > 40 && streaming <= 70)  return this.mapRange(streaming, 40, 70, 10, -5);
        return -15;
    },

    // Overall score = simple average of all four stakeholders
    calculateOverallScore(satisfaction) {
        var vals = Object.values(satisfaction);
        return Math.round(vals.reduce(function(a, b) { return a + b; }, 0) / vals.length);
    },

    // Tier determination — thresholds scale with difficulty
    determineTier(satisfaction, gameState) {
        var overall = this.calculateOverallScore(satisfaction);
        var minSat  = Math.min.apply(null, Object.values(satisfaction));
        var diff    = (gameState && gameState.difficulty) ? gameState.difficulty : 'normal';

        var thresholds = {
            easy:   { gold: [85, 70], silver: [72, 55], bronze: [60, 38], fail: 30 },
            normal: { gold: [90, 75], silver: [80, 60], bronze: [70, 45], fail: 40 },
            hard:   { gold: [93, 80], silver: [84, 65], bronze: [74, 50], fail: 45 }
        };
        var t = thresholds[diff] || thresholds.normal;

        if (minSat < t.fail)                              return 'fail';
        if (overall >= t.gold[0]   && minSat >= t.gold[1])   return 'gold';
        if (overall >= t.silver[0] && minSat >= t.silver[1]) return 'silver';
        if (overall >= t.bronze[0] && minSat >= t.bronze[1]) return 'bronze';
        return 'fail';
    },

    // Competitive balance meter (higher sharing = more balance)
    calculateCompetitiveBalance(sliders) {
        var balance = this.mapRange(sliders.sharing, 10, 60, 20, 90);
        return Math.round(Math.min(100, Math.max(0, balance)));
    },

    // Deal stability for heartbeat + status indicator
    checkStability(satisfaction) {
        var minSat = Math.min.apply(null, Object.values(satisfaction));
        var avgSat = this.calculateOverallScore(satisfaction);

        if (minSat < 30) return { status: 'critical', message: 'DEAL COLLAPSING',  color: 'danger'  };
        if (minSat < 45) return { status: 'unstable', message: 'DEAL UNSTABLE',    color: 'danger'  };
        if (minSat < 60 || avgSat < 60) return { status: 'warning', message: 'CONCERNS RISING', color: 'warning' };
        return { status: 'stable', message: 'DEAL STABLE', color: 'success' };
    },

    // Detect pairs of stakeholders with opposing interests
    detectConflicts(gameState) {
        var conflicts = [];
        var sliders   = gameState.sliders;

        if (sliders.playershare >= 54) {
            conflicts.push({ a: 'players', b: 'owners',
                message: 'High player share thrills players but angers owners' });
        } else if (sliders.playershare <= 43) {
            conflicts.push({ a: 'players', b: 'owners',
                message: 'Low player share pleases owners but upsets players' });
        }

        if (sliders.sharing >= 50) {
            conflicts.push({ a: 'fans', b: 'owners',
                message: 'High revenue sharing helps fans but cuts owner profits' });
        }

        if (sliders.gametime >= 10) {
            conflicts.push({ a: 'networks', b: 'fans',
                message: 'Very late start: great for ratings, bad for East Coast fans' });
        }

        if (sliders.streaming >= 65) {
            conflicts.push({ a: 'networks', b: 'fans',
                message: 'Heavy streaming boosts networks but frustrates traditional fans' });
        }

        return conflicts;
    },

    // Stakeholder with the lowest satisfaction
    getLowestStakeholder(satisfaction) {
        var lowest = 'players';
        var lowestValue = satisfaction.players;
        for (var key in satisfaction) {
            if (satisfaction[key] < lowestValue) {
                lowest = key;
                lowestValue = satisfaction[key];
            }
        }
        return { name: lowest, value: lowestValue };
    },

    // Map a satisfaction percentage to a reaction string
    getReactionLevel(pct) {
        if (pct >= 85) return 'veryHappy';
        if (pct >= 70) return 'happy';
        if (pct >= 50) return 'neutral';
        if (pct >= 35) return 'unhappy';
        if (pct >= 20) return 'angry';
        return 'furious';
    },

    // Narrative text for results screen
    generateNarrative(tier, satisfaction) {
        var lowest = this.getLowestStakeholder(satisfaction);
        var cap    = lowest.name.charAt(0).toUpperCase() + lowest.name.slice(1);
        var narratives = {
            gold:   'Your deal struck the perfect balance. All stakeholders walked away satisfied — a rare feat in billion-dollar negotiations. The new media contract will transform MLB for a generation.',
            silver: 'A solid deal that most stakeholders can accept. Not everyone got everything they wanted, but the agreement will hold. The league moves forward with renewed stability.',
            bronze: cap + ' accepted reluctantly at ' + lowest.value + '% satisfaction. The deal passed but expect pressure to renegotiate before the ink is dry.',
            fail:   'The deal fell apart. ' + cap + ' walked out at ' + lowest.value + '% satisfaction — far below the minimum needed. Go back to the table.'
        };
        return narratives[tier] || narratives.fail;
    },

    validateAllocation(allocation) {
        var total = Object.values(allocation).reduce(function(a, b) { return a + b; }, 0);
        return Math.abs(total - this.TOTAL_DEAL) < 0.1;
    },

    getRemainingMoney(allocation) {
        var total = Object.values(allocation).reduce(function(a, b) { return a + b; }, 0);
        return Math.max(0, this.TOTAL_DEAL - total);
    }
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = Calculations;
}

/**
 * MLB Money Maker - Claim Code Generator
 * 3-tier system: GOLD, SILVER, BRONZE
 * BOW Sports Capital Presents
 */

const CodeGenerator = {
    // Characters for random hash generation
    CHARS: 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789', // Excluded confusing chars: I, O, 0, 1

    // Generate a random hash of specified length
    generateHash(length = 6) {
        let hash = '';
        for (let i = 0; i < length; i++) {
            hash += this.CHARS.charAt(Math.floor(Math.random() * this.CHARS.length));
        }
        return hash;
    },

    // Get current year
    getCurrentYear() {
        return new Date().getFullYear();
    },

    // Generate claim code based on tier
    generateClaimCode(tier) {
        const hash = this.generateHash(6);
        const year = this.getCurrentYear();

        switch (tier) {
            case 'gold':
                return `MLB-GOLD-${hash}-${year}`;
            case 'silver':
                return `MLB-SILVER-${hash}-${year}`;
            case 'bronze':
                return `MLB-BRONZE-${hash}-${year}`;
            default:
                return null; // No code for failed deals
        }
    },

    // Generate full result data for storage/submission
    generateResultData(gameState, satisfaction, tier, claimCode) {
        return {
            claimCode: claimCode,
            tier: tier,
            timestamp: new Date().toISOString(),
            overallScore: Calculations.calculateOverallScore(satisfaction),
            satisfaction: {
                players: satisfaction.players,
                owners: satisfaction.owners,
                networks: satisfaction.networks,
                fans: satisfaction.fans
            },
            allocation: {
                players: gameState.allocation.players,
                owners: gameState.allocation.owners,
                networks: gameState.allocation.networks,
                league: gameState.allocation.league
            },
            sliders: {
                minSalary: gameState.sliders.salary,
                revenueSharing: gameState.sliders.sharing,
                gameTime: gameState.sliders.gametime,
                streaming: gameState.sliders.streaming,
                playerShare: gameState.sliders.playershare
            },
            duration: gameState.duration || 0,
            quizScore: gameState.quizScore || 0
        };
    },

    // Store result (could be extended to POST to backend)
    storeResult(resultData) {
        // Store in localStorage for now
        const storedResults = JSON.parse(localStorage.getItem('mlb_money_maker_results') || '[]');
        storedResults.push(resultData);
        localStorage.setItem('mlb_money_maker_results', JSON.stringify(storedResults));

        // Log for debugging
        console.log('Result stored:', resultData);

        // TODO: Could add API call here to store on backend
        // this.postToBackend(resultData);

        return true;
    },

    // Optional: POST to backend API
    async postToBackend(resultData) {
        try {
            // This would be your actual backend endpoint
            // const response = await fetch('YOUR_API_ENDPOINT', {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify(resultData)
            // });
            // return response.ok;
            return true;
        } catch (error) {
            console.error('Failed to post to backend:', error);
            return false;
        }
    },

    // Verify a claim code format (basic validation)
    verifyCodeFormat(code) {
        const pattern = /^MLB-(GOLD|SILVER|BRONZE)-[A-Z0-9]{6}-\d{4}$/;
        return pattern.test(code);
    },

    // Extract tier from claim code
    getTierFromCode(code) {
        if (!this.verifyCodeFormat(code)) return null;
        if (code.includes('GOLD')) return 'gold';
        if (code.includes('SILVER')) return 'silver';
        if (code.includes('BRONZE')) return 'bronze';
        return null;
    },

    // Get tier display info
    getTierInfo(tier) {
        const tiers = {
            gold: {
                name: 'GOLD',
                title: 'CHAMPIONSHIP DEAL!',
                message: "You've balanced every stakeholder perfectly. The league is thriving!",
                color: '#FFD700',
                minScore: 90
            },
            silver: {
                name: 'SILVER',
                title: 'SOLID DEAL!',
                message: "The league accepted your proposal. One group had to compromise.",
                color: '#C0C0C0',
                minScore: 80
            },
            bronze: {
                name: 'BRONZE',
                title: 'ACCEPTABLE DEAL!',
                message: "The league signed your proposal, but some are unhappy.",
                color: '#CD7F32',
                minScore: 70
            },
            fail: {
                name: 'FAILED',
                title: 'DEAL COLLAPSED!',
                message: "One or more stakeholders walked away. Try again!",
                color: '#DC3545',
                minScore: 0
            }
        };

        return tiers[tier] || tiers.fail;
    }
};

// Export for module use (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CodeGenerator;
}

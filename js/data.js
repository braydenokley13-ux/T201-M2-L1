/**
 * MLB Money Maker - Game Data
 * All 30 MLB teams, real players, and league data
 * BOW Sports Capital Presents
 */

const MLB_DATA = {
    // All 30 MLB Teams with real data
    teams: {
        // AL East
        yankees: { name: "New York Yankees", abbr: "NYY", market: "large", revenue: 668, color: "#003087" },
        redsox: { name: "Boston Red Sox", abbr: "BOS", market: "large", revenue: 519, color: "#BD3039" },
        rays: { name: "Tampa Bay Rays", abbr: "TB", market: "small", revenue: 275, color: "#092C5C" },
        orioles: { name: "Baltimore Orioles", abbr: "BAL", market: "medium", revenue: 320, color: "#DF4601" },
        bluejays: { name: "Toronto Blue Jays", abbr: "TOR", market: "large", revenue: 380, color: "#134A8E" },

        // AL Central
        whitesox: { name: "Chicago White Sox", abbr: "CWS", market: "large", revenue: 340, color: "#27251F" },
        guardians: { name: "Cleveland Guardians", abbr: "CLE", market: "small", revenue: 290, color: "#00385D" },
        tigers: { name: "Detroit Tigers", abbr: "DET", market: "medium", revenue: 310, color: "#0C2340" },
        royals: { name: "Kansas City Royals", abbr: "KC", market: "small", revenue: 270, color: "#004687" },
        twins: { name: "Minnesota Twins", abbr: "MIN", market: "medium", revenue: 305, color: "#002B5C" },

        // AL West
        astros: { name: "Houston Astros", abbr: "HOU", market: "large", revenue: 450, color: "#002D62" },
        athletics: { name: "Oakland Athletics", abbr: "OAK", market: "small", revenue: 218, color: "#003831" },
        rangers: { name: "Texas Rangers", abbr: "TEX", market: "large", revenue: 380, color: "#003278" },
        mariners: { name: "Seattle Mariners", abbr: "SEA", market: "medium", revenue: 330, color: "#0C2C56" },
        angels: { name: "Los Angeles Angels", abbr: "LAA", market: "large", revenue: 400, color: "#BA0021" },

        // NL East
        mets: { name: "New York Mets", abbr: "NYM", market: "large", revenue: 520, color: "#002D72" },
        braves: { name: "Atlanta Braves", abbr: "ATL", market: "large", revenue: 450, color: "#CE1141" },
        nationals: { name: "Washington Nationals", abbr: "WSH", market: "medium", revenue: 340, color: "#AB0003" },
        phillies: { name: "Philadelphia Phillies", abbr: "PHI", market: "large", revenue: 420, color: "#E81828" },
        marlins: { name: "Miami Marlins", abbr: "MIA", market: "medium", revenue: 250, color: "#00A3E0" },

        // NL Central
        cardinals: { name: "St. Louis Cardinals", abbr: "STL", market: "medium", revenue: 380, color: "#C41E3A" },
        pirates: { name: "Pittsburgh Pirates", abbr: "PIT", market: "small", revenue: 265, color: "#FDB827" },
        brewers: { name: "Milwaukee Brewers", abbr: "MIL", market: "small", revenue: 290, color: "#12284B" },
        cubs: { name: "Chicago Cubs", abbr: "CHC", market: "large", revenue: 550, color: "#0E3386" },
        reds: { name: "Cincinnati Reds", abbr: "CIN", market: "small", revenue: 280, color: "#C6011F" },

        // NL West
        dodgers: { name: "Los Angeles Dodgers", abbr: "LAD", market: "large", revenue: 680, color: "#005A9C" },
        padres: { name: "San Diego Padres", abbr: "SD", market: "medium", revenue: 360, color: "#2F241D" },
        giants: { name: "San Francisco Giants", abbr: "SF", market: "large", revenue: 440, color: "#FD5A1E" },
        rockies: { name: "Colorado Rockies", abbr: "COL", market: "medium", revenue: 300, color: "#33006F" },
        dbacks: { name: "Arizona Diamondbacks", abbr: "ARI", market: "medium", revenue: 295, color: "#A71930" }
    },

    // Real MLB Players with 2024-2025 salaries (in millions)
    players: [
        { name: "Mike Trout", team: "Angels", salary: 36.1, tier: "superstar" },
        { name: "Juan Soto", team: "Yankees", salary: 45.0, tier: "superstar" },
        { name: "Aaron Judge", team: "Yankees", salary: 40.0, tier: "superstar" },
        { name: "Mookie Betts", team: "Dodgers", salary: 30.4, tier: "superstar" },
        { name: "Shohei Ohtani", team: "Dodgers", salary: 70.0, tier: "superstar" },
        { name: "Max Scherzer", team: "Rangers", salary: 43.3, tier: "star" },
        { name: "Francisco Lindor", team: "Mets", salary: 35.0, tier: "star" },
        { name: "Trea Turner", team: "Phillies", salary: 33.0, tier: "star" },
        { name: "Bryce Harper", team: "Phillies", salary: 25.4, tier: "star" },
        { name: "Ronald Acuna Jr.", team: "Braves", salary: 17.0, tier: "star" },
        { name: "Corey Seager", team: "Rangers", salary: 32.5, tier: "star" },
        { name: "Freddie Freeman", team: "Dodgers", salary: 27.0, tier: "star" },
        { name: "Marcus Semien", team: "Rangers", salary: 26.0, tier: "solid" },
        { name: "Jose Altuve", team: "Astros", salary: 28.5, tier: "solid" },
        { name: "Kyle Tucker", team: "Astros", salary: 12.0, tier: "solid" },
        { name: "Julio Rodriguez", team: "Mariners", salary: 3.6, tier: "rising" },
        { name: "Bobby Witt Jr.", team: "Royals", salary: 1.0, tier: "rising" },
        { name: "Corbin Carroll", team: "D-backs", salary: 0.75, tier: "rising" },
        { name: "Rookie Player", team: "Various", salary: 0.75, tier: "minimum" },
        { name: "Journeyman Veteran", team: "Various", salary: 2.5, tier: "journeyman" }
    ],

    // Networks involved in MLB media deals
    networks: [
        { name: "ESPN", logo: "ESPN", deal: "National games, Sunday Night Baseball" },
        { name: "Fox Sports", logo: "FOX", deal: "World Series, postseason games" },
        { name: "TBS", logo: "TBS", deal: "Playoffs, select regular season" },
        { name: "MLB Network", logo: "MLBN", deal: "League-owned network" },
        { name: "Apple TV+", logo: "APPLE", deal: "Friday Night Baseball (streaming)" },
        { name: "Amazon Prime", logo: "PRIME", deal: "Thursday games (potential)" }
    ],

    // Real league financials
    financials: {
        currentTVDeal: 1.85, // billion per year
        newDealTarget: 8, // billion total (8-year deal = ~1B/year)
        currentPlayerShare: 48.5, // percent
        currentMinSalary: 0.75, // million
        luxuryTaxThreshold: 241, // million (2024)
        revenueSharePool: 120, // million redistributed
        totalLeagueRevenue: 11.6 // billion (2023)
    },

    // Key dates
    timeline: {
        currentDealExpires: "December 2028",
        negotiationStart: "January 2025",
        targetCompletion: "March 2025"
    },

    // Stakeholder info
    stakeholders: {
        players: {
            rep: "Tony Clark",
            org: "MLBPA (Players Association)",
            wants: ["Higher minimum salary", "Larger revenue share", "Better working conditions"],
            fears: ["Salary cuts", "Reduced benefits", "Streaming affecting viewership"]
        },
        owners: {
            rep: "30 Team Owners",
            org: "MLB Ownership Group",
            wants: ["Higher profits", "Cost control", "Streaming revenue"],
            fears: ["Rising salaries", "Revenue sharing to small markets", "Player demands"]
        },
        networks: {
            rep: "Network Executives",
            org: "ESPN, Fox, Apple+, Amazon",
            wants: ["Prime time games", "Exclusive content", "Streaming rights"],
            fears: ["Declining ratings", "Cord cutting", "Competition"]
        },
        fans: {
            rep: "MLB Fans",
            org: "Millions of supporters",
            wants: ["Competitive balance", "Affordable access", "Good game times"],
            fears: ["Blackouts", "Expensive streaming", "Same teams always winning"]
        }
    },

    // Character reactions based on satisfaction levels
    reactions: {
        players: {
            veryHappy: { face: "😄", speech: "This is a great deal for players!" },
            happy: { face: "😊", speech: "We can work with this." },
            neutral: { face: "😐", speech: "We need to see more." },
            unhappy: { face: "😟", speech: "This isn't enough for players." },
            angry: { face: "😠", speech: "Players won't accept this!" },
            furious: { face: "🤬", speech: "We're walking out!" }
        },
        owners: {
            veryHappy: { face: "😄", speech: "Excellent profit margins!" },
            happy: { face: "😊", speech: "The numbers work for us." },
            neutral: { face: "😐", speech: "Let's see the full picture." },
            unhappy: { face: "😟", speech: "Profits are too thin." },
            angry: { face: "😠", speech: "This hurts our bottom line!" },
            furious: { face: "🤬", speech: "Deal's off!" }
        },
        networks: {
            veryHappy: { face: "😄", speech: "Ratings will be great!" },
            happy: { face: "😊", speech: "We can sell this to advertisers." },
            neutral: { face: "😐", speech: "Need better time slots." },
            unhappy: { face: "😟", speech: "Viewership concerns us." },
            angry: { face: "😠", speech: "This won't work for TV!" },
            furious: { face: "🤬", speech: "We're out!" }
        },
        fans: {
            veryHappy: { face: "😄", speech: "Baseball is back!" },
            happy: { face: "😊", speech: "We can watch our teams!" },
            neutral: { face: "😐", speech: "Hope it's affordable..." },
            unhappy: { face: "😟", speech: "Same rich teams will win." },
            angry: { face: "😠", speech: "This isn't fair to small markets!" },
            furious: { face: "🤬", speech: "We're done with MLB!" }
        }
    },

    // Educational content tied to podcast
    lessons: {
        revenueSharing: "Some leagues, like the NFL, share revenue almost evenly. Others—like MLB—share much less. That one difference shapes everything.",
        mediaDeal: "Media rights feed directly into league revenue. League revenue drives the salary cap. The cap controls payroll.",
        cba: "The CBA—Collective Bargaining Agreement—is where the league and players decide how to split the money.",
        salaryImpact: "If a league inks a ten-billion-dollar TV deal? About five billion of that ends up flowing back into player salaries.",
        tradeoffs: "Team budgets don't exist on an island. They live inside a complex league economy."
    },

    // Quiz questions for knowledge check
    quizQuestions: [
        {
            question: "What does CBA stand for?",
            options: ["Central Baseball Association", "Collective Bargaining Agreement", "Commissioner's Baseball Authority", "Contract Buyout Arrangement"],
            correct: 1,
            explanation: "The CBA is where the league and players decide how to split revenue."
        },
        {
            question: "What happens when a new media deal is signed?",
            options: ["Nothing changes", "Salary cap increases", "Teams move cities", "Players retire"],
            correct: 1,
            explanation: "Media deals feed league revenue, which drives the salary cap up."
        },
        {
            question: "Which league shares revenue most equally?",
            options: ["MLB", "NFL", "NBA", "NHL"],
            correct: 1,
            explanation: "The NFL shares revenue almost evenly; MLB shares much less."
        },
        {
            question: "If players get 50% of a $10B deal, how much goes to salaries?",
            options: ["$1B", "$5B", "$10B", "$2.5B"],
            correct: 1,
            explanation: "50% of $10 billion = $5 billion for player salaries."
        },
        {
            question: "What's the current MLB minimum salary (approximately)?",
            options: ["$100,000", "$500,000", "$750,000", "$1,500,000"],
            correct: 2,
            explanation: "The current MLB minimum is about $750,000 per year."
        }
    ]
};

// Team lists by market size for quick reference
const LARGE_MARKET_TEAMS = Object.keys(MLB_DATA.teams).filter(key => MLB_DATA.teams[key].market === "large");
const SMALL_MARKET_TEAMS = Object.keys(MLB_DATA.teams).filter(key => MLB_DATA.teams[key].market === "small");
const MEDIUM_MARKET_TEAMS = Object.keys(MLB_DATA.teams).filter(key => MLB_DATA.teams[key].market === "medium");

// Export for module use (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { MLB_DATA, LARGE_MARKET_TEAMS, SMALL_MARKET_TEAMS, MEDIUM_MARKET_TEAMS };
}

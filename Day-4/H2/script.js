document.addEventListener('DOMContentLoaded', () => {
    const Game = {
        // --- CONFIG & STATE ---
        config: {
            difficulties: {
                easy: { range: 50, attempts: 10, rewards: { xp: 20, coins: 10 } },
                medium: { range: 100, attempts: 8, rewards: { xp: 40, coins: 25 } },
                hard: { range: 500, attempts: 7, rewards: { xp: 70, coins: 50 } },
                extreme: { range: 1000, attempts: 5, rewards: { xp: 100, coins: 100 } },
            },
            funFacts: [
                "The number 0 is the only number that cannot be represented by Roman numerals.",
                "A 'jiffy' is an actual unit of time for 1/100th of a second.",
                "The sum of the numbers on a roulette wheel is 666.",
                "In a room of 23 people, there's a 50% chance that two people have the same birthday.",
                "Forty is the only number that is spelt with letters arranged in alphabetical order."
            ]
        },
        state: {
            targetNumber: 0,
            attemptsLeft: 0,
            maxAttempts: 0,
            currentDifficulty: null,
            gameActive: false,
            startTime: null,
            guessHistory: [],
        },
        playerData: {
            level: 1,
            xp: 0,
            coins: 0,
            rank: 'Rookie',
            stats: {
                gamesPlayed: 0,
                gamesWon: 0,
            }
        },

        // --- DOM ELEMENTS ---
        elements: {
            homeScreen: document.getElementById('home-screen'),
            gameScreen: document.getElementById('game-screen'),
            playBtn: document.getElementById('play-game-btn'),
            backToHomeBtn: document.getElementById('back-to-home'),
            difficultyButtons: document.querySelectorAll('.difficulty-btn'),
            guessInput: document.getElementById('guess-input'),
            submitGuessBtn: document.getElementById('submit-guess-btn'),
            gamePrompt: document.getElementById('game-prompt'),
            hintMessage: document.getElementById('hint-message'),
            livesContainer: document.getElementById('lives-container'),
            attemptsLeftSpan: document.getElementById('attempts-left'),
            guessHistoryList: document.getElementById('guess-history-list'),
            gameOverModal: document.getElementById('game-over-modal'),
            gameOverTitle: document.getElementById('game-over-title'),
            gameOverMessage: document.getElementById('game-over-message'),
            xpEarnedSpan: document.getElementById('xp-earned'),
            coinsEarnedSpan: document.getElementById('coins-earned'),
            playAgainBtn: document.getElementById('play-again-btn'),
            returnHomeBtn: document.getElementById('return-home-btn'),
            funFactP: document.getElementById('fun-fact'),
            playerLevel: document.getElementById('player-level'),
            xpProgress: document.getElementById('xp-progress'),
            playerXp: document.getElementById('player-xp'),
            playerCoins: document.getElementById('player-coins'),
            playerRank: document.getElementById('player-rank'),
            appContainer: document.getElementById('app-container'),
            toast: document.getElementById('toast-notification'),
            toastMessage: document.getElementById('toast-message'),
        },

        // --- SOUNDS ---
        sounds: {
            // Sounds removed for simplicity
        },

        // --- INITIALIZATION ---
        init() {
            this.loadPlayerData();
            this.updateDashboard();
            this.bindEvents();
        },

        // --- EVENT BINDING ---
        bindEvents() {
            this.elements.playBtn.addEventListener('click', () => this.showScreen('game'));
            this.elements.backToHomeBtn.addEventListener('click', () => this.showScreen('home'));
            this.elements.difficultyButtons.forEach(btn => {
                btn.addEventListener('click', () => this.startGame(btn.dataset.difficulty));
            });
            this.elements.submitGuessBtn.addEventListener('click', () => this.handleGuess());
            this.elements.guessInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') this.handleGuess();
            });
            this.elements.playAgainBtn.addEventListener('click', () => {
                this.closeModal();
                this.resetGameUI();
            });
            this.elements.returnHomeBtn.addEventListener('click', () => {
                this.closeModal();
                this.showScreen('home');
            });
        },

        // --- SCREEN & UI MANAGEMENT ---
        showScreen(screenName) {
            // this.playSound('click');
            this.elements.homeScreen.classList.toggle('active', screenName === 'home');
            this.elements.gameScreen.classList.toggle('active', screenName === 'game');
            if (screenName === 'game') this.resetGameUI();
        },

        resetGameUI() {
            this.elements.gamePrompt.textContent = 'Select a difficulty to start!';
            this.elements.hintMessage.textContent = 'Good luck!';
            this.elements.guessInput.disabled = true;
            this.elements.submitGuessBtn.disabled = true;
            this.elements.guessInput.value = '';
            this.elements.guessHistoryList.innerHTML = '';
            document.getElementById('difficulty-selection').style.display = 'flex';
        },

        updateDashboard() {
            const xpForNextLevel = 100;
            this.elements.playerLevel.textContent = `Level ${this.playerData.level}`;
            this.elements.playerXp.textContent = `${this.playerData.xp} / ${xpForNextLevel} XP`;
            this.elements.xpProgress.style.width = `${(this.playerData.xp / xpForNextLevel) * 100}%`;
            this.elements.playerCoins.textContent = this.playerData.coins;
            this.elements.playerRank.textContent = this.playerData.rank;
        },

        // --- GAME LOGIC ---
        startGame(difficulty) {
            // this.playSound('click');
            this.state.gameActive = true;
            this.state.currentDifficulty = difficulty;
            const diffConfig = this.config.difficulties[difficulty];
            
            this.state.targetNumber = Math.floor(Math.random() * diffConfig.range) + 1;
            this.state.maxAttempts = diffConfig.attempts;
            this.state.attemptsLeft = diffConfig.attempts;
            this.state.startTime = new Date();
            this.state.guessHistory = [];

            this.elements.gamePrompt.textContent = `Guess a number between 1 and ${diffConfig.range}`;
            this.elements.guessInput.disabled = false;
            this.elements.submitGuessBtn.disabled = false;
            this.elements.guessInput.focus();
            document.getElementById('difficulty-selection').style.display = 'none';

            this.updateLives();
            this.updateAttemptsDisplay();
            console.log(`DEV HINT: The number is ${this.state.targetNumber}`);
        },

        handleGuess() {
            if (!this.state.gameActive) return;

            const guess = parseInt(this.elements.guessInput.value);
            if (isNaN(guess)) {
                this.showToast("Please enter a valid number.");
                return;
            }

            // this.playSound('click');
            this.elements.guessInput.value = '';
            this.elements.guessInput.focus();
            this.state.attemptsLeft--;
            this.updateAttemptsDisplay();

            let hint = '';
            let status = 'wrong';

            if (guess === this.state.targetNumber) {
                status = 'correct';
                this.endGame(true);
            } else {
                // this.playSound('wrong');
                this.elements.appContainer.classList.add('shake');
                setTimeout(() => this.elements.appContainer.classList.remove('shake'), 500);

                if (this.state.attemptsLeft <= 0) {
                    this.endGame(false);
                } else {
                    hint = this.getSmartHint(guess);
                }
            }
            
            this.elements.hintMessage.textContent = hint;
            this.addGuessToHistory(guess, status, hint);
            this.updateLives();
        },

        getSmartHint(guess) {
            const difference = Math.abs(guess - this.state.targetNumber);
            const range = this.config.difficulties[this.state.currentDifficulty].range;

            if (difference <= 5) return "Extremely Close! 🔥";
            if (difference <= 10) return "Very Close!";
            if (difference <= range * 0.1) return "You're getting warm...";

            if (guess > this.state.targetNumber) {
                return difference > range * 0.5 ? "Way Too High!  আকাশ" : "Too High! ⬆️";
            } else {
                return difference > range * 0.5 ? "Way Too Low!  পাতাল" : "Too Low! ⬇️";
            }
        },

        endGame(isWin) {
            this.state.gameActive = false;
            this.elements.guessInput.disabled = true;
            this.elements.submitGuessBtn.disabled = true;

            const diffConfig = this.config.difficulties[this.state.currentDifficulty];
            let xp = 0, coins = 0;

            if (isWin) {
                // this.playSound('correct');
                this.elements.gameOverTitle.textContent = "🎉 Victory! 🎉";
                this.elements.gameOverMessage.innerHTML = `You guessed it! The number was <strong>${this.state.targetNumber}</strong>.`;
                xp = diffConfig.rewards.xp;
                coins = diffConfig.rewards.coins;
                this.playerData.stats.gamesWon++;
                this.showConfetti();
            } else {
                // this.playSound('gameOver');
                this.elements.gameOverTitle.textContent = "Game Over";
                this.elements.gameOverMessage.innerHTML = `The correct number was <strong>${this.state.targetNumber}</strong>.`;
            }

            this.playerData.stats.gamesPlayed++;
            this.addXP(xp);
            this.addCoins(coins);
            this.savePlayerData();
            this.updateDashboard();

            this.elements.xpEarnedSpan.textContent = `+${xp} XP`;
            this.elements.coinsEarnedSpan.textContent = `+${coins} Coins`;
            this.elements.funFactP.textContent = this.config.funFacts[Math.floor(Math.random() * this.config.funFacts.length)];

            setTimeout(() => this.elements.gameOverModal.classList.add('active'), 1000);
        },

        // --- UI UPDATES ---
        updateLives() {
            this.elements.livesContainer.innerHTML = '';
            for (let i = 0; i < this.state.maxAttempts; i++) {
                const heart = document.createElement('span');
                heart.textContent = '❤️';
                heart.classList.add('heart');
                if (i >= this.state.attemptsLeft) {
                    heart.classList.add('lost');
                }
                this.elements.livesContainer.appendChild(heart);
            }
        },

        updateAttemptsDisplay() {
            this.elements.attemptsLeftSpan.textContent = `${this.state.attemptsLeft}/${this.state.maxAttempts}`;
        },

        addGuessToHistory(guess, status, hint) {
            const li = document.createElement('li');
            const icon = status === 'correct' ? '✅' : '❌';
            li.innerHTML = `<span>Guess #${this.state.maxAttempts - this.state.attemptsLeft}: <strong>${guess}</strong> ${icon}</span> <span>${hint}</span>`;
            this.elements.guessHistoryList.prepend(li);
        },

        closeModal() {
            // this.playSound('click');
            this.elements.gameOverModal.classList.remove('active');
        },

        showConfetti() {
            const container = document.getElementById('confetti-container');
            container.innerHTML = '';
            for (let i = 0; i < 100; i++) {
                const confetti = document.createElement('div');
                confetti.classList.add('confetti');
                confetti.style.left = `${Math.random() * 100}%`;
                confetti.style.backgroundColor = `hsl(${Math.random() * 360}, 100%, 50%)`;
                confetti.style.animationDelay = `${Math.random() * 3}s`;
                confetti.style.transform = `scale(${Math.random() * 0.5 + 0.5})`;
                container.appendChild(confetti);
            }
            setTimeout(() => container.innerHTML = '', 3000);
        },

        showToast(message) {
            this.elements.toastMessage.textContent = message;
            this.elements.toast.classList.add('show');
            setTimeout(() => {
                this.elements.toast.classList.remove('show');
            }, 3000);
        },

        // --- PLAYER DATA & PROGRESSION ---
        addXP(amount) {
            this.playerData.xp += amount;
            const xpForNextLevel = 100;
            if (this.playerData.xp >= xpForNextLevel) {
                this.playerData.level++;
                this.playerData.xp -= xpForNextLevel;
                this.showToast(`Congratulations! You've reached Level ${this.playerData.level}!`);
            }
        },

        addCoins(amount) {
            this.playerData.coins += amount;
        },

        savePlayerData() {
            localStorage.setItem('guessQuestPlayerData', JSON.stringify(this.playerData));
        },

        loadPlayerData() {
            const savedData = localStorage.getItem('guessQuestPlayerData');
            if (savedData) {
                this.playerData = JSON.parse(savedData);
            } else {
                // Initialize with default if no data
                this.playerData = {
                    level: 1,
                    xp: 0,
                    coins: 50,
                    rank: 'Rookie',
                    stats: { gamesPlayed: 0, gamesWon: 0 }
                };
            }
        },

        // --- AUDIO & THEME ---
    };

    Game.init();
});
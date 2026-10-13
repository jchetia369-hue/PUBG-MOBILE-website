
"use strict";

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       1. ELEMENTS
    ===================================================== */

    const musicButton = document.getElementById("musicButton");
    const menuButton = document.getElementById("menuButton");
    const navLinks = document.getElementById("navLinks");

    // Main theme player
    const heroAudio = document.getElementById("pubgThemeMusic");
    const heroPlayButton = document.getElementById("playButton");
    const heroTrack = document.getElementById("progressContainer");
    const heroProgress = document.getElementById("musicProgress");
    const heroCurrent = document.getElementById("currentTime");
    const heroDuration = document.getElementById("duration");

    // All audio and video elements
    const allMedia = [...document.querySelectorAll("audio, video")];

    function formatTime(seconds) {
        if (!Number.isFinite(seconds) || seconds < 0) {
            return "0:00";
        }

        const minutes = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);

        return `${minutes}:${String(secs).padStart(2, "0")}`;
    }

    /* =====================================================
       2. BATTLEFIELD PLAYERS

       IMPORTANT:
       First song  = battleAudio1 + battleVideo1
       Second song = battleAudio2 + battleVideo2
    ===================================================== */

    const players = [
        {
            name: "ON MY WAY",
            audio: document.getElementById("battleAudio1"),
            video: document.getElementById("battleVideo1"),
            button: document.getElementById("battleButton1"),
            track: document.getElementById("battleTrack1"),
            progress: document.getElementById("battleProgress1"),
            current: document.getElementById("battleCurrent1"),
            duration: document.getElementById("battleDuration1")
        },
        {
            name: "LIVE FAST",
            audio: document.getElementById("battleAudio2"),
            video: document.getElementById("battleVideo2"),
            button: document.getElementById("battleButton2"),
            track: document.getElementById("battleTrack2"),
            progress: document.getElementById("battleProgress2"),
            current: document.getElementById("battleCurrent2"),
            duration: document.getElementById("battleDuration2")
        }
    ];

    /* =====================================================
       3. BUTTON DISPLAY
    ===================================================== */

    function resetHeroControls() {
        if (heroPlayButton) {
            heroPlayButton.textContent = "▶";
            heroPlayButton.setAttribute(
                "aria-label",
                "Play theme music"
            );
        }

        if (heroProgress) {
            heroProgress.style.width = "0%";
        }

        if (heroCurrent) {
            heroCurrent.textContent = "0:00";
        }
    }

    function resetBattleControls(player) {
        if (player.button) {
            player.button.textContent = "▶";
            player.button.setAttribute(
                "aria-label",
                `Play ${player.name}`
            );
        }

        if (player.progress) {
            player.progress.style.width = "0%";
        }

        if (player.current) {
            player.current.textContent = "0:00";
        }
    }

    /* =====================================================
       4. TOP-RIGHT BUTTON: STOP ONLY

       - Stops ALL audio and video.
       - Does not start anything.
       - Does not change the page scroll position.
       - Clicking it repeatedly never turns music back on.
    ===================================================== */

    function stopAllMedia() {

        allMedia.forEach((media) => {
            media.pause();

            try {
                media.currentTime = 0;
            } catch (error) {
                // A media file may not be loaded yet.
            }
        });

        resetHeroControls();

        players.forEach(resetBattleControls);
    }

    if (musicButton) {
        musicButton.type = "button";
        musicButton.textContent = "STOP MUSIC";
        musicButton.setAttribute("aria-pressed", "false");

        musicButton.addEventListener("click", (event) => {
            event.preventDefault();

            // Stop only. No play(), no toggle, no scrolling.
            stopAllMedia();
        });
    }

    /* =====================================================
       5. STOP OTHER PLAYERS BEFORE STARTING A SONG
    ===================================================== */

    function stopOtherPlayers(activePlayer) {

        // Stop main theme music.
        if (heroAudio) {
            heroAudio.pause();

            try {
                heroAudio.currentTime = 0;
            } catch (error) {}

            resetHeroControls();
        }

        // Stop the other battlefield song.
        players.forEach((player) => {

            if (player === activePlayer) {
                return;
            }

            if (player.audio) {
                player.audio.pause();

                try {
                    player.audio.currentTime = 0;
                } catch (error) {}
            }

            if (player.video) {
                player.video.pause();

                try {
                    player.video.currentTime = 0;
                } catch (error) {}
            }

            resetBattleControls(player);
        });

        // Stop any additional background audio/video elements.
        allMedia.forEach((media) => {

            const belongsToActivePlayer =
                activePlayer &&
                (media === activePlayer.audio ||
                 media === activePlayer.video);

            if (media === heroAudio || belongsToActivePlayer) {
                return;
            }

            media.pause();

            try {
                media.currentTime = 0;
            } catch (error) {}
        });
    }

    /* =====================================================
       6. MAIN THEME SONG
    ===================================================== */

    if (heroAudio && heroPlayButton) {

        heroAudio.pause();

        heroPlayButton.addEventListener("click", async () => {

            if (!heroAudio.paused) {
                heroAudio.pause();
                return;
            }

            stopOtherPlayers(null);

            try {
                if (heroAudio.ended) {
                    heroAudio.currentTime = 0;
                }

                await heroAudio.play();

            } catch (error) {
                console.error(
                    "Theme song failed to play. Check pubg-theme-song.mp3:",
                    error
                );
            }
        });

        heroAudio.addEventListener("play", () => {
            heroPlayButton.textContent = "❚❚";
            heroPlayButton.setAttribute(
                "aria-label",
                "Pause theme music"
            );
        });

        heroAudio.addEventListener("pause", () => {
            heroPlayButton.textContent = "▶";
            heroPlayButton.setAttribute(
                "aria-label",
                "Play theme music"
            );
        });

        function updateHeroDuration() {
            if (heroDuration) {
                heroDuration.textContent =
                    formatTime(heroAudio.duration);
            }
        }

        heroAudio.addEventListener(
            "loadedmetadata",
            updateHeroDuration
        );

        heroAudio.addEventListener(
            "durationchange",
            updateHeroDuration
        );

        heroAudio.addEventListener("timeupdate", () => {

            if (heroCurrent) {
                heroCurrent.textContent =
                    formatTime(heroAudio.currentTime);
            }

            if (
                heroProgress &&
                Number.isFinite(heroAudio.duration) &&
                heroAudio.duration > 0
            ) {
                heroProgress.style.width =
                    `${heroAudio.currentTime / heroAudio.duration * 100}%`;
            }
        });

        heroAudio.addEventListener("ended", resetHeroControls);

        // Click the progress bar to seek.
        if (heroTrack) {

            heroTrack.style.cursor = "pointer";

            heroTrack.addEventListener("click", (event) => {

                if (
                    !Number.isFinite(heroAudio.duration) ||
                    heroAudio.duration <= 0
                ) {
                    return;
                }

                const rect = heroTrack.getBoundingClientRect();

                if (rect.width <= 0) return;

                const position = Math.max(
                    0,
                    Math.min(
                        1,
                        (event.clientX - rect.left) / rect.width
                    )
                );

                heroAudio.currentTime =
                    position * heroAudio.duration;
            });
        }
    }

    /* =====================================================
       7. INITIALIZE EACH BATTLEFIELD SONG
    ===================================================== */

    players.forEach((player) => {

        const {
            name,
            audio,
            video,
            button,
            track,
            progress,
            current,
            duration
        } = player;

        if (!audio || !button) {
            console.error(
                `${name}: audio not found. Check the audio element ID in HTML.`
            );
            return;
        }

        audio.pause();

        if (video) {
            video.pause();
            video.muted = true;
            video.playsInline = true;
            video.removeAttribute("autoplay");
        }

        button.type = "button";
        button.textContent = "▶";
        button.setAttribute("aria-label", `Play ${name}`);

        /* -------------------------------------------------
           PLAY / PAUSE BUTTON
        ------------------------------------------------- */

        button.addEventListener("click", async (event) => {

            event.preventDefault();

            // Pause the selected song and its video.
            if (!audio.paused) {
                audio.pause();

                if (video) {
                    video.pause();
                }

                return;
            }

            // Stop every other music/video player.
            stopOtherPlayers(player);

            // Start both files from the beginning.
            try {
                audio.currentTime = 0;
            } catch (error) {}

            if (video) {
                try {
                    if (video.readyState > 0) {
                        video.currentTime = 0;
                    }
                } catch (error) {}
            }

            /*
             * Call both play() methods directly inside the click
             * handler so browser autoplay restrictions are respected.
             */
            let audioPromise;

            try {
                audioPromise = audio.play();
            } catch (error) {
                console.error(`${name} audio failed:`, error);
                return;
            }

            let videoPromise = Promise.resolve();

            if (video) {
                try {
                    videoPromise = video.play();
                } catch (error) {
                    videoPromise = Promise.reject(error);
                }
            }

            // Wait for both attempts, without hiding either error.
            const results = await Promise.allSettled([
                audioPromise,
                videoPromise
            ]);

            // If the song cannot play, do not leave its video running.
            if (results[0].status === "rejected") {
                if (video) {
                    video.pause();
                }

                console.error(
                    `${name} AUDIO ERROR: check the MP3 filename/path.`,
                    results[0].reason
                );

                return;
            }

            // Audio can continue if the video itself cannot play.
            if (video && results[1].status === "rejected") {
                console.error(
                    `${name} VIDEO ERROR: check the MP4 filename, path and encoding.`,
                    results[1].reason
                );
            }
        });

        /* -------------------------------------------------
           BUTTON ICONS
        ------------------------------------------------- */

        audio.addEventListener("play", () => {
            button.textContent = "❚❚";
            button.setAttribute("aria-label", `Pause ${name}`);
        });

        audio.addEventListener("pause", () => {
            button.textContent = "▶";
            button.setAttribute("aria-label", `Play ${name}`);

            if (video && !video.paused) {
                video.pause();
            }
        });

        /* -------------------------------------------------
           DURATION
        ------------------------------------------------- */

        function updateDuration() {
            if (duration) {
                duration.textContent = formatTime(audio.duration);
            }
        }

        audio.addEventListener("loadedmetadata", updateDuration);
        audio.addEventListener("durationchange", updateDuration);

        /* -------------------------------------------------
           PROGRESS BAR AND CURRENT TIME
        ------------------------------------------------- */

        audio.addEventListener("timeupdate", () => {

            if (current) {
                current.textContent = formatTime(audio.currentTime);
            }

            if (
                progress &&
                Number.isFinite(audio.duration) &&
                audio.duration > 0
            ) {
                progress.style.width =
                    `${audio.currentTime / audio.duration * 100}%`;
            }

            // Keep video playback approximately synchronized.
            if (
                video &&
                !video.paused &&
                video.readyState >= 2 &&
                Number.isFinite(video.duration) &&
                video.duration > 0
            ) {
                const targetTime = Math.min(
                    audio.currentTime,
                    video.duration
                );

                if (Math.abs(video.currentTime - targetTime) > 1) {
                    try {
                        video.currentTime = targetTime;
                    } catch (error) {}
                }
            }
        });

        /* -------------------------------------------------
           SEEK BY CLICKING THE TRACK
        ------------------------------------------------- */

        if (track) {

            track.style.cursor = "pointer";

            track.addEventListener("click", (event) => {

                if (
                    !Number.isFinite(audio.duration) ||
                    audio.duration <= 0
                ) {
                    return;
                }

                const rect = track.getBoundingClientRect();

                if (rect.width <= 0) return;

                const position = Math.max(
                    0,
                    Math.min(
                        1,
                        (event.clientX - rect.left) / rect.width
                    )
                );

                const newTime = position * audio.duration;

                audio.currentTime = newTime;

                if (
                    video &&
                    Number.isFinite(video.duration) &&
                    video.duration > 0
                ) {
                    video.currentTime = Math.min(
                        newTime,
                        video.duration
                    );
                }
            });
        }

        /* -------------------------------------------------
           END OF SONG OR VIDEO
        ------------------------------------------------- */

        audio.addEventListener("ended", () => {

            if (video) {
                video.pause();

                try {
                    video.currentTime = 0;
                } catch (error) {}
            }

            resetBattleControls(player);
        });

        if (video) {
            video.addEventListener("ended", () => {
                audio.pause();
            });

            video.addEventListener("error", () => {
                console.error(
                    `${name} VIDEO ERROR: unable to load the MP4.`
                );
            });
        }

        audio.addEventListener("error", () => {
            console.error(
                `${name} AUDIO ERROR: unable to load the MP3.`
            );
        });
    });

    /* =====================================================
       8. MOBILE NAVIGATION
    ===================================================== */

    if (menuButton && navLinks) {

        menuButton.type = "button";
        menuButton.setAttribute("aria-expanded", "false");

        menuButton.addEventListener("click", (event) => {

            event.preventDefault();

            const isOpen = navLinks.classList.toggle("active");

            menuButton.textContent = isOpen ? "✕" : "☰";
            menuButton.setAttribute(
                "aria-expanded",
                String(isOpen)
            );
        });

        navLinks.querySelectorAll("a").forEach((link) => {

            link.addEventListener("click", () => {

                navLinks.classList.remove("active");

                menuButton.textContent = "☰";
                menuButton.setAttribute("aria-expanded", "false");
            });
        });
    }

    /* =====================================================
       9. INITIAL STATE
    ===================================================== */

    stopAllMedia();

    console.log("PUBG MOBILE website initialized successfully.");

});

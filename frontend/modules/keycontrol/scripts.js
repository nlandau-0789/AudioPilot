window.addEventListener("keydown", (event) => {
    if (lazyAudio.hasAttribute("src")) {
        if (event.key === "l" && event.target !== search_bar) {
            event.preventDefault();
        }
        if (event.key === "j" && event.target !== search_bar) {
            event.preventDefault();
        }
        if (event.code === 'ArrowRight' && event.target !== search_bar) {
            event.preventDefault();
        }
        if (event.code === 'ArrowLeft' && event.target !== search_bar) {
            event.preventDefault();
        }
    }
})

window.addEventListener("keyup", (event) => {
    if (event.key === " " && event.target !== search_bar) {
        play_btn.click();
    }
    if (lazyAudio.hasAttribute("src")) {
        if (event.key === "l" && event.target !== search_bar) {
            lazyAudio.currentTime += 10
        }
        if (event.key === "j" && event.target !== search_bar) {
            lazyAudio.currentTime = Math.max(0, lazyAudio.currentTime - 10)
        }
        if (event.code === 'ArrowRight' && event.target !== search_bar) {
            lazyAudio.currentTime += 5
        }
        if (event.code === 'ArrowLeft' && event.target !== search_bar) {
            lazyAudio.currentTime = Math.max(0, lazyAudio.currentTime - 5)
        }
    }
})
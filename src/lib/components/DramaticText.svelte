<script lang="ts">
    import { onMount } from "svelte";

    let {
        paragraphs = ["First paragraph here.", "Second paragraph here."],
        image = "",
        imageAlt = "",
        onClose
    }: {
        paragraphs?: string[];
        image?: string;
        imageAlt?: string;
        onClose?: () => void;
    } = $props();

    let visible = $state(true);
    let closing = $state(false);
    let litWords = $state(new Set<number>());

    // Pre-compute word list with global indices per paragraph
    const wordList = $derived(
        paragraphs.map((para, paraIndex) => ({
            paraIndex,
            words: para.split(/\s+/)
        }))
    );

    // Flat global list for animation indexing
    const flatWords = $derived(
        wordList.flatMap(({ paraIndex, words }) =>
            words.map((word, wordIndex) => ({ word, paraIndex, wordIndex }))
        )
    );

    onMount(() => {
        let i = 0;
        const interval = setInterval(() => {
            if (i < flatWords.length) {
                litWords = new Set([...litWords, i]);
                i++;
            } else {
                clearInterval(interval);
            }
        }, 160);

        return () => clearInterval(interval);
    });

    function handleClose() {
        closing = true;
        setTimeout(() => {
            visible = false;
            onClose?.();
        }, 600);
    }

    // Build a lookup: paraIndex -> starting globalIndex
    const paraStartIndex = $derived(
        wordList.reduce<number[]>((acc, { words }, i) => {
            acc.push(i === 0 ? 0 : acc[i - 1] + wordList[i - 1].words.length);
            return acc;
        }, [])
    );
</script>

{#if visible}
    <div class="overlay" class:closing>
        <div class="content">
            {#if image}
                <div class="image-wrapper">
                    <img src={image} alt={imageAlt} class="hero-image" />
                </div>
            {/if}

            {#each wordList as { paraIndex, words }}
                <p class="text">
                    {#each words as word, wordIndex}
                        {@const globalIndex = paraStartIndex[paraIndex] + wordIndex}
                        <span class="word" class:lit={litWords.has(globalIndex)}>{word}</span>{' '}
                    {/each}
                </p>
            {/each}
        </div>

        <button class="close-btn" onclick={handleClose} aria-label="Close">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <line x1="2" y1="2" x2="18" y2="18" stroke="#eeeeee" stroke-width="3" />
                <line x1="18" y1="2" x2="2" y2="18" stroke="#eeeeee" stroke-width="3" />
            </svg>
        </button>
    </div>
{/if}

<style>
    .overlay {
        position: fixed;
        inset: 0;
        background: #000;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        padding: 3rem 2rem 5rem;
        opacity: 1;
        transition: opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        overflow-y: auto;
    }

    .overlay.closing {
        opacity: 0;
    }

    .content {
        max-width: 680px;
        width: 100%;
        text-align: center;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 2rem;
    }

    .image-wrapper {
        width: 30%;
        display: flex;
        justify-content: center;
        margin-bottom: 0.5rem;
    }

    .hero-image {
        max-width: 100%;
        max-height: 280px;
        width: auto;
        height: auto;
        border-radius: 8px;
        object-fit: cover;
    }

    .text {
        font-family: "Poppins", sans-serif;
        font-size: clamp(1rem, 3vw, 1.6rem);
        font-weight: 300;
        line-height: 1.25;
        letter-spacing: 0.01em;
        color: transparent;
        margin: 0;
    }

    .word {
        display: inline-block;
        color: #2e2e2e;
        transition:
            color 0.85s cubic-bezier(0.4, 0, 0.2, 1),
            text-shadow 0.45s cubic-bezier(0.4, 0, 0.2, 1);
        will-change: color;
    }

    .word.lit {
        color: #ffffff;
        text-shadow:
            0 0 20px rgba(255, 255, 255, 0.15),
            0 0 40px rgba(255, 255, 255, 0.05);
    }

    .close-btn {
        position: fixed;
        bottom: 2.5rem;
        left: 50%;
        transform: translateX(-50%);
        background: none;
        border: 2px solid #eeeeee;
        border-radius: 50%;
        width: 48px;
        height: 48px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: rgba(255, 255, 255, 0.35);
        cursor: pointer;
        transition:
            color 0.25s ease,
            border-color 0.25s ease,
            background 0.25s ease,
            transform 0.25s ease;
    }

    .close-btn:hover {
        color: rgba(255, 255, 255, 0.9);
        border-color: rgba(255, 255, 255, 0.5);
        background: rgba(255, 255, 255, 0.05);
        transform: translateX(-50%) rotate(90deg);
    }

    .close-btn:active {
        transform: translateX(-50%) rotate(90deg) scale(0.92);
    }
</style>
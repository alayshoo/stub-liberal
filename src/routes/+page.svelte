<script lang="ts">
    import { onMount, onDestroy } from "svelte";
    import { base } from "$app/paths";

    import panzoom from "panzoom";
    import DramaticText from "$lib/components/DramaticText.svelte";

    let showPopup = false;
    let mapContainer: HTMLElement;
    let imgElement: HTMLImageElement;
    let panzoomInstance: any;
    let scale = 1;
    let showIntro = true;

    onMount(() => {
        if (imgElement) {
            const initPanzoom = () => {
                panzoomInstance = panzoom(imgElement, {
                    smoothScroll: true,
                    bounds: true,
                    boundsPadding: 0.1,
                    zoomDoubleClickSpeed: 1,
                    minZoom: 0.1,
                    maxZoom: 5,
                    beforeWheel: (e: WheelEvent) => {
                        // Return true to PREVENT zoom — only allow zoom with ctrl
                        return !e.ctrlKey;
                    },
                    filterKey: () => true,
                });

                panzoomInstance.on("zoom", (e: any) => {
                    scale = e.getTransform().scale;
                });

                setTimeout(() => {
                    centerAndFit();
                }, 50);
            };

            if (imgElement.complete && imgElement.naturalWidth > 0) {
                initPanzoom();
            } else {
                imgElement.addEventListener("load", initPanzoom, {
                    once: true,
                });
            }
        }
    });

    onDestroy(() => {
        if (panzoomInstance) {
            panzoomInstance.dispose();
        }
    });

    function dismissPopup() {
        showPopup = false;
        // Re-center after layout changes from header appearing
        setTimeout(() => centerAndFit(), 100);
    }

    function centerAndFit() {
        if (!panzoomInstance || !imgElement || !mapContainer) return;

        const containerWidth = mapContainer.clientWidth;
        const containerHeight = mapContainer.clientHeight;
        const imgWidth = imgElement.naturalWidth;
        const imgHeight = imgElement.naturalHeight;

        if (!imgWidth || !imgHeight) return;

        const fitScale = Math.min(
            containerWidth / imgWidth,
            containerHeight / imgHeight,
        );

        // Calculate the position needed to center the image at this scale
        const offsetX = (containerWidth - imgWidth * fitScale) / 2;
        const offsetY = (containerHeight - imgHeight * fitScale) / 2;

        // Reset transform first, then apply new position and scale
        panzoomInstance.moveTo(0, 0);
        panzoomInstance.zoomAbs(0, 0, fitScale);
        panzoomInstance.moveTo(offsetX, offsetY);
        scale = fitScale;
    }

    function resetView() {
        centerAndFit();
    }

    function zoomIn() {
        if (!panzoomInstance || !mapContainer) return;
        const cx = mapContainer.clientWidth / 2;
        const cy = mapContainer.clientHeight / 2;
        const rect = mapContainer.getBoundingClientRect();
        panzoomInstance.zoomTo(rect.left + cx, rect.top + cy, 1.3);
    }

    function zoomOut() {
        if (!panzoomInstance || !mapContainer) return;
        const cx = mapContainer.clientWidth / 2;
        const cy = mapContainer.clientHeight / 2;
        const rect = mapContainer.getBoundingClientRect();
        panzoomInstance.zoomTo(rect.left + cx, rect.top + cy, 0.7);
    }
</script>

<svelte:head>
    <title>Mapa STUB Liberal</title>
</svelte:head>

{#if showIntro}
    <DramaticText
        image="{base}/il_bw.png"
        paragraphs={[
              "Durante anos, dezenas de paragens STUB não tiveram nem mapas nem horários.",
              "Nós fizemos o que a Câmara, PSD e PS não fizeram. Voluntários da Iniciativa Liberal colocaram mapas em mais de 50 paragens numa única noite.",
              "Mas no dia seguinte TODOS os mapas foram retirados. Uma ação claramente concertada.",
              "A importância desta informação é vital para o acesso aos Transportes Públicos de Bragança, por isso fizemos este site."
        ]}
        onClose={() => (showIntro = false)}
    />
{/if}

<header class="site-header">
    <a href="{base}/" class="header-logo">
        <img src="{base}/IL.png" alt="Iniciativa Liberal" />
    </a>
    <a
        href="https://liberal.pt/adere"
        target="_blank"
        rel="noopener noreferrer"
        class="cta-button"
    >
        Junta-te a nós!
    </a>
</header>

<div
    class="map-container"
    class:with-header={!showPopup}
    bind:this={mapContainer}
>
    <div class="map-wrapper">
        <img
            bind:this={imgElement}
            src="{base}/mapa.svg"
            alt="Mapa de Bragança com linhas STUB"
            class="map-image"
            draggable="false"
        />
    </div>

    <div class="map-controls">
        <button class="control-btn" on:click={resetView} title="Reset view">
            <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
            >
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                <path d="M3 3v5h5" />
            </svg>
        </button>
        <button class="control-btn" on:click={zoomIn} title="Zoom in">
            <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
            >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
                <line x1="11" y1="8" x2="11" y2="14" />
                <line x1="8" y1="11" x2="14" y2="11" />
            </svg>
        </button>
        <button class="control-btn" on:click={zoomOut} title="Zoom out">
            <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
            >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
                <line x1="8" y1="11" x2="14" y2="11" />
            </svg>
        </button>
    </div>
</div>

<style>
    /* ---- Header ---- */
    .site-header {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        height: 100px;
        background-color: #ffda33;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 20px;
        z-index: 500;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .header-logo img {
        height: 80px;
        width: auto;
        display: block;
    }

    .cta-button {
        background-color: #ff0377;
        color: white;
        font-family: Poppins, sans-serif;
        font-weight: 700;
        font-size: 0.95rem;
        padding: 10px 24px;
        border-radius: 50px;
        text-decoration: none;
        transition: all 0.2s ease;
        white-space: nowrap;
    }

    .cta-button:hover {
        background-color: #0094cc;
        transform: scale(1.05);
        box-shadow: 0 4px 12px rgba(0, 174, 239, 0.4);
    }

    .cta-button:active {
        transform: scale(0.97);
    }

    /* ---- Map ---- */
    .map-container {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100vh;
        overflow: hidden;
        background-color: #f5f5f5;
        transition: top 0.3s ease-out;
    }

    .map-container.with-header {
        top: 100px;
        height: calc(100vh - 100px);
    }

    .map-wrapper {
        width: 100%;
        height: 100%;
        overflow: hidden;
        cursor: grab;
        position: relative;
    }

    .map-wrapper:active {
        cursor: grabbing;
    }

    .map-image {
        user-select: none;
        touch-action: none;
        cursor: grab;
        /* Let panzoom control size via transforms — use natural dimensions */
    }

    .map-image:active {
        cursor: grabbing;
    }

    .map-controls {
        position: absolute;
        top: 80px;
        right: 20px;
        display: flex;
        flex-direction: column;
        gap: 8px;
        z-index: 100;
    }

    .control-btn {
        width: 44px;
        height: 44px;
        background-color: white;
        border: 2px solid #f7d440;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        color: #333;
        transition: all 0.2s ease;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .control-btn:hover {
        background-color: #f7d440;
        transform: scale(1.05);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    }

    .control-btn:active {
        transform: scale(0.95);
    }

    @media (max-width: 768px) {

        .site-header {
            padding: 0 12px;
            height: 100px;
        }

        .header-logo img {
            height: 80px;
        }

        .cta-button {
            font-size: 0.85rem;
            padding: 8px 18px;
        }

        .map-container.with-header {
            top: 100px;
            height: calc(100vh - 100px);
        }

        .map-controls {
            top: 10px;
            right: 10px;
        }

        .control-btn {
            width: 40px;
            height: 40px;
        }
    }
</style>

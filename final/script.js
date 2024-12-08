document.addEventListener('DOMContentLoaded', () => {
    // Global Variables
    let zIndex = 1000;
    const desktop = document.getElementById('desktop');
    const startScreen = document.getElementById('start-screen');
    const backgroundMusic = document.getElementById('background-music');
    let activeWindow = null;
    let isDragging = false;
    let dragOffset = { x: 0, y: 0 };

    // Original whale content as fallback
    const originalWhaleContent = {
        blue: {
            title: "Blue Whale",
            content: `
                <div class="whale-info">
                    <h2>Blue Whale (Balaenoptera musculus)</h2>
                    <h3>Characteristics</h3>
                    <ul>
                        <li>Length: Up to 100 feet</li>
                        <li>Weight: Up to 200 tons</li>
                        <li>Diet: Primarily krill</li>
                        <li>Lifespan: 80-90 years</li>
                    </ul>
                    <h3>Fun Facts</h3>
                    <ul>
                        <li>Largest animal known to have existed</li>
                        <li>Heart weighs as much as a car</li>
                        <li>Can make sounds louder than a jet engine</li>
                    </ul>
                </div>
            `
        },
        orca: {
            title: "Orca",
            content: `
                <div class="whale-info">
                    <h2>Orca (Orcinus orca)</h2>
                    <h3>Characteristics</h3>
                    <ul>
                        <li>Length: 23-32 feet</li>
                        <li>Weight: Up to 22,000 pounds</li>
                        <li>Diet: Fish, seals, other whales</li>
                        <li>Lifespan: 50-90 years</li>
                    </ul>
                    <h3>Fun Facts</h3>
                    <ul>
                        <li>Actually the largest member of the dolphin family</li>
                        <li>Highly social animals</li>
                    </ul>
                </div>
            `
        },
        humpback: {
            title: "Humpback Whale",
            content: `
                <div class="whale-info">
                    <h2>Humpback Whale (Megaptera novaeangliae)</h2>
                    <h3>Characteristics</h3>
                    <ul>
                        <li>Length: 48-62.5 feet</li>
                        <li>Weight: 40 tons</li>
                        <li>Diet: Krill and small fish</li>
                        <li>Lifespan: 45-50 years</li>
                    </ul>
                    <h3>Fun Facts</h3>
                    <ul>
                        <li>Known for their complex songs</li>
                        <li>Great long-distance travelers</li>
                    </ul>
                </div>
            `
        }
    };

    // Start Screen Handling
    const enterButton = document.getElementById('enter-button');
    
    enterButton.addEventListener('click', () => {
        startScreen.style.display = 'none';
        desktop.style.display = 'block';
        desktop.classList.remove('hidden');
        try {
            backgroundMusic.play().catch(err => console.log('Audio play failed:', err));
        } catch (err) {
            console.log('Audio error:', err);
        }
    });

    // API Functions
    async function fetchWhaleData(species) {
        const baseUrl = 'https://www.fishwatch.gov/api/species';
        try {
            const response = await fetch(`${baseUrl}/${species}`);
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching whale data:', error);
            return null;
        }
    }

    // Enhanced getWhaleContent function with API integration
    async function getWhaleContent(whaleType) {
        const speciesMap = {
            blue: 'blue-whale',
            orca: 'killer-whale',
            humpback: 'humpback-whale'
        };

        try {
            const apiData = await fetchWhaleData(speciesMap[whaleType]);
            
            if (!apiData) {
                return originalWhaleContent[whaleType];
            }

            return {
                title: apiData.Species_Name || whaleType,
                content: `
                    <div class="whale-info">
                        <h2>${apiData.Species_Name || whaleType}</h2>
                        <div class="api-status">✓ Live Data</div>
                        <h3>Scientific Classification</h3>
                        <ul>
                            <li>Scientific Name: ${apiData.Scientific_Name || 'Not available'}</li>
                            <li>Population: ${apiData.Population || 'Data not available'}</li>
                            <li>Location: ${apiData.Location || 'Data not available'}</li>
                        </ul>
                        <h3>Biology</h3>
                        <ul>
                            <li>Average Length: ${apiData.Biology?.Average_Length || 'Not available'}</li>
                            <li>Lifespan: ${apiData.Biology?.Lifespan || 'Not available'}</li>
                            <li>Diet: ${apiData.Biology?.Prey || 'Not available'}</li>
                        </ul>
                        <h3>Conservation Status</h3>
                        <p>${apiData.Status || 'Status information not available'}</p>
                    </div>
                `
            };
        } catch (error) {
            console.error('Error processing whale data:', error);
            return originalWhaleContent[whaleType];
        }
    }

    // Create a pop-up window
    function createWindow(title, content) {
        const template = document.getElementById('window-template');
        const window = template.cloneNode(true);
        window.id = `window-${Date.now()}`;
        window.classList.remove('hidden');
        
        window.querySelector('.title-bar-text').textContent = title;
        window.querySelector('.window-content').innerHTML = content;
        
        const closeButton = window.querySelector('[aria-label="Close"]');
        closeButton.innerHTML = '✕';
        closeButton.style.cursor = 'pointer';
        
        const maxX = desktop.clientWidth - 300;
        const maxY = desktop.clientHeight - 200;
        window.style.left = `${Math.random() * maxX}px`;
        window.style.top = `${Math.random() * maxY}px`;
        
        desktop.appendChild(window);
        makeWindowActive(window);
        addWindowControls(window);
        
        return window;
    }

    // Event listener for whale icons with API integration
    document.querySelectorAll('.whale-file').forEach(icon => {
        icon.addEventListener('click', async () => {
            const whaleType = icon.getAttribute('data-whale');
            const loadingWindow = createWindow("Loading...", "<div>Fetching whale data...</div>");
            
            try {
                const whaleContent = await getWhaleContent(whaleType);
                loadingWindow.querySelector('.title-bar-text').textContent = whaleContent.title;
                loadingWindow.querySelector('.window-content').innerHTML = whaleContent.content;
            } catch (error) {
                loadingWindow.querySelector('.window-content').innerHTML = 
                    "<div>Error loading whale data. Please try again later.</div>";
            }
        });
    });

    // Make window active (bring to front)
    function makeWindowActive(window) {
        if (activeWindow) {
            activeWindow.classList.remove('active');
        }
        window.classList.add('active');
        window.style.zIndex = ++zIndex;
        activeWindow = window;
    }

    // Add window controls and dragging
    function addWindowControls(window) {
        const closeButton = window.querySelector('[aria-label="Close"]');
        closeButton.addEventListener('click', () => {
            window.remove();
        });

        const titleBar = window.querySelector('.title-bar');
        titleBar.addEventListener('mousedown', (e) => {
            isDragging = true;
            dragOffset.x = e.clientX - window.offsetLeft;
            dragOffset.y = e.clientY - window.offsetTop;
            makeWindowActive(window);
        });

        window.addEventListener('mousedown', () => {
            makeWindowActive(window);
        });
    }

    // Global mouse event listeners for dragging
    document.addEventListener('mousemove', (e) => {
        if (isDragging && activeWindow) {
            const newX = e.clientX - dragOffset.x;
            const newY = e.clientY - dragOffset.y;
            activeWindow.style.left = `${newX}px`;
            activeWindow.style.top = `${newY}px`;
        }
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
    });

    // Update clock
    function updateClock() {
        const clock = document.getElementById('clock');
        const now = new Date();
        clock.textContent = now.toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit',
            hour12: true 
        });
    }

    // Update clock every minute
    setInterval(updateClock, 60000);
    updateClock(); // Initial call
});

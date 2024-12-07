document.addEventListener('DOMContentLoaded', () => {
    // Global Variables
    let zIndex = 1000;
    const desktop = document.getElementById('desktop');
    const startScreen = document.getElementById('start-screen');
    const backgroundMusic = document.getElementById('background-music');
    let activeWindow = null;
    let isDragging = false;
    let dragOffset = { x: 0, y: 0 };

    // Start Screen Handling
    const enterButton = document.getElementById('enter-button');
    
    enterButton.addEventListener('click', () => {
        startScreen.style.display = 'none';
        desktop.style.display = 'block';
        desktop.classList.remove('hidden');
        // Try to play background music
        try {
            backgroundMusic.play().catch(err => console.log('Audio play failed:', err));
        } catch (err) {
            console.log('Audio error:', err);
        }
    });

    // Create a pop-up window
    function createWindow(title, content) {
        const template = document.getElementById('window-template');
        const window = template.cloneNode(true);
        window.id = `window-${Date.now()}`;
        window.classList.remove('hidden');
        
        window.querySelector('.title-bar-text').textContent = title;
        window.querySelector('.window-content').innerHTML = content;
        
        // Add close button
        const closeButton = window.querySelector('[aria-label="Close"]');
        closeButton.innerHTML = '✕';
        closeButton.style.cursor = 'pointer';
        
        // Position window randomly
        const maxX = desktop.clientWidth - 300;
        const maxY = desktop.clientHeight - 200;
        window.style.left = `${Math.random() * maxX}px`;
        window.style.top = `${Math.random() * maxY}px`;
        
        desktop.appendChild(window);
        makeWindowActive(window);
        addWindowControls(window);
        
        return window;
    }

    // Whale content for each window
    function getWhaleContent(whaleType) {
        const whaleInfo = {
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
        return whaleInfo[whaleType];
    }

    // Event listener for each whale icon
    document.querySelectorAll('.whale-file').forEach(icon => {
        icon.addEventListener('click', () => {
            const whaleType = icon.getAttribute('data-whale');
            const whaleContent = getWhaleContent(whaleType);
            createWindow(whaleContent.title, whaleContent.content);
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

    // Add event listeners to window controls and dragging
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

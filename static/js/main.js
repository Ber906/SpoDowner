// Main JavaScript file for SpoDown app

document.addEventListener('DOMContentLoaded', function() {
    // Navbar scroll effect
    setupNavbarScroll();
    
    // Initialize animations and interactive elements
    setupAnimations();
    
    // Initialize parallax effects if function exists
    if (typeof setupParallaxEffect === 'function') {
        setupParallaxEffect();
    }
    
    // Initialize fade-in animations
    initFadeAnimations();
    
    // Chat functionality
    setupChat();
    
    // Profile image upload preview
    setupProfileImageUpload();
    
    // Download functionality
    setupDownloadFunctionality();
});

// Initialize scroll-based fade in animations
function initFadeAnimations() {
    const fadeElements = document.querySelectorAll('.fade-in');
    const fadeObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                fadeObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });
    
    fadeElements.forEach(el => {
        fadeObserver.observe(el);
    });
}

// Navbar scroll effect
function setupNavbarScroll() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;
    
    // Add scrolled class to navbar on scroll
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
    
    // Check initial scroll position
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    }
}

// Setup animations and interactive elements
function setupAnimations() {
    // Add smooth scrolling to all hash links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (!targetElement) return;
            
            window.scrollTo({
                top: targetElement.offsetTop - 80,
                behavior: 'smooth'
            });
        });
    });
    
    // Add hover effects to feature cards
    const featureCards = document.querySelectorAll('.feature-card');
    featureCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.querySelector('.feature-icon i')?.classList.add('fa-bounce');
        });
        
        card.addEventListener('mouseleave', function() {
            this.querySelector('.feature-icon i')?.classList.remove('fa-bounce');
        });
    });
    
    // Add glow effect to cards on mouse move
    setupCardGlowEffect();
    
    // Add text typing animation
    const typingElements = document.querySelectorAll('.typing-text');
    typingElements.forEach(element => {
        const text = element.textContent;
        element.textContent = '';
        element.style.visibility = 'visible';
        
        let i = 0;
        const typeWriter = () => {
            if (i < text.length) {
                element.textContent += text.charAt(i);
                i++;
                setTimeout(typeWriter, Math.random() * 50 + 30);
            }
        };
        
        // Start typing when element comes into view
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    setTimeout(typeWriter, 300);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });
        
        observer.observe(element);
    });
    
    // Add fade-in animations for elements
    const fadeElements = document.querySelectorAll('.fade-in');
    const fadeObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                fadeObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    
    fadeElements.forEach(el => {
        fadeObserver.observe(el);
    });
}

// Create interactive card glow effect based on mouse position
function setupCardGlowEffect() {
    const cardsContainer = document.querySelector('.cards-container');
    if (!cardsContainer) return;
    
    const cards = document.querySelectorAll('.cards-container .card');
    
    cardsContainer.addEventListener('mousemove', e => {
        const rect = cardsContainer.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        cards.forEach(card => {
            // Calculate mouse position relative to the card
            const cardRect = card.getBoundingClientRect();
            const cardX = e.clientX - cardRect.left;
            const cardY = e.clientY - cardRect.top;
            
            // Update CSS variables for the glow effect
            card.style.setProperty('--mouse-x', `${cardX}px`);
            card.style.setProperty('--mouse-y', `${cardY}px`);
            
            // Only show the glow if mouse is over or near the card
            const centerX = cardRect.left + cardRect.width / 2;
            const centerY = cardRect.top + cardRect.height / 2;
            const distance = Math.sqrt(
                Math.pow(e.clientX - centerX, 2) + 
                Math.pow(e.clientY - centerY, 2)
            );
            
            if (distance < cardRect.width * 0.8) {
                card.classList.add('card-glow-active');
            } else {
                card.classList.remove('card-glow-active');
            }
        });
    });
    
    cardsContainer.addEventListener('mouseleave', () => {
        cards.forEach(card => {
            card.classList.remove('card-glow-active');
        });
    });
}

// Add a parallax effect to background elements
function setupParallaxEffect() {
    const parallaxElements = document.querySelectorAll('.parallax');
    
    window.addEventListener('mousemove', (e) => {
        const mouseX = e.clientX / window.innerWidth;
        const mouseY = e.clientY / window.innerHeight;
        
        parallaxElements.forEach(el => {
            const speed = el.getAttribute('data-speed') || 0.05;
            const x = (window.innerWidth * mouseX * speed * -1);
            const y = (window.innerHeight * mouseY * speed * -1);
            
            el.style.transform = `translateX(${x}px) translateY(${y}px)`;
        });
    });
}

// Chat functionality
function setupChat() {
    const chatMessages = document.getElementById('chat-messages');
    const chatForm = document.getElementById('chat-form');
    const messageInput = document.getElementById('message-input');
    
    if (!chatForm) return; // Not on a page with chat
    
    // Load initial messages
    loadMessages();
    
    // Poll for new messages every 3 seconds
    setInterval(loadMessages, 3000);
    
    // Handle form submission
    chatForm.addEventListener('submit', function(e) {
        e.preventDefault();
        if (messageInput.value.trim() === '') return;
        
        // Send message to server
        fetch('/chat/send', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: messageInput.value
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                messageInput.value = '';
                loadMessages(); // Reload messages
            }
        })
        .catch(error => {
            console.error('Error sending message:', error);
        });
    });
    
    function loadMessages() {
        if (!chatMessages) return;
        
        fetch('/chat/messages')
        .then(response => response.json())
        .then(data => {
            if (data.messages) {
                displayMessages(data.messages, data.current_user_id);
            }
        })
        .catch(error => {
            console.error('Error loading messages:', error);
        });
    }
    
    function displayMessages(messages, currentUserId) {
        // Store scroll position
        const isScrolledToBottom = 
            chatMessages.scrollHeight - chatMessages.clientHeight <= chatMessages.scrollTop + 1;
            
        // Clear messages container first if we're refreshing the whole list
        chatMessages.innerHTML = '';
        
        messages.forEach(message => {
            const isSelf = message.user_id === currentUserId;
            const messageEl = document.createElement('div');
            messageEl.className = `message-container ${isSelf ? 'self' : ''}`;
            
            // Convert timestamp string to readable format
            const timestamp = new Date(message.timestamp);
            const timeString = timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            
            // Prepare message content
            let mediaContent = '';
            if (message.media_file && message.media_type) {
                if (message.media_type === 'image') {
                    mediaContent = `
                        <div class="message-media">
                            <img src="/static/${message.media_file}" alt="Image" class="img-fluid message-image">
                        </div>
                    `;
                } else if (message.media_type === 'video') {
                    mediaContent = `
                        <div class="message-media">
                            <video controls class="message-video">
                                <source src="/static/${message.media_file}" type="video/mp4">
                                Your browser does not support the video tag.
                            </video>
                        </div>
                    `;
                } else if (message.media_type === 'audio') {
                    mediaContent = `
                        <div class="message-media">
                            <audio controls class="message-audio">
                                <source src="/static/${message.media_file}">
                                Your browser does not support the audio element.
                            </audio>
                        </div>
                    `;
                }
            }
            
            // Build the message HTML
            let messageHTML = '';
            
            // Show avatar only for other users' messages
            if (!isSelf) {
                messageHTML += `
                    <div class="message-avatar-container">
                        <img src="${message.profile_image}" alt="${message.username}" class="message-avatar">
                    </div>
                `;
            }
            
            messageHTML += `<div class="message-group">`;
            
            // Show username only for other users
            if (!isSelf) {
                messageHTML += `<div class="message-sender">${message.username}</div>`;
            }
            
            // Message bubble with text and/or media
            messageHTML += `<div class="message-bubble">`;
            
            // Add text content if available
            if (message.text) {
                messageHTML += `<div class="message-text">${message.text}</div>`;
            }
            
            // Add media content if available
            if (mediaContent) {
                messageHTML += mediaContent;
            }
            
            // Close message bubble
            messageHTML += `</div>`;
            
            // Add timestamp and read receipt for self messages
            messageHTML += `
                <div class="message-time">
                    ${timeString}
                    ${isSelf ? '<i class="fas fa-check-circle message-seen"></i>' : ''}
                </div>
            `;
            
            // Close message group
            messageHTML += `</div>`;
            
            messageEl.innerHTML = messageHTML;
            chatMessages.appendChild(messageEl);
        });
        
        // Scroll to bottom if was at bottom before
        if (isScrolledToBottom) {
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
    }
}

// Profile image upload functionality
function setupProfileImageUpload() {
    const profileImageInput = document.getElementById('profile-image-input');
    const profileImagePreview = document.getElementById('profile-image-preview');
    
    if (!profileImageInput || !profileImagePreview) return; // Not on profile edit page
    
    profileImageInput.addEventListener('change', function() {
        const file = this.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                profileImagePreview.src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    });
}

// Download functionality
function setupDownloadFunctionality() {
    // Mode toggle buttons
    const urlModeBtn = document.getElementById('urlModeBtn');
    const searchModeBtn = document.getElementById('searchModeBtn');
    
    // URL Mode elements
    const urlDownloadForm = document.getElementById('urlDownloadForm');
    const urlInput = document.getElementById('urlInput');
    
    // Search Mode elements
    const searchForm = document.getElementById('searchForm');
    const searchInput = document.getElementById('searchInput');
    const searchResults = document.getElementById('searchResults');
    const searchResultsList = document.getElementById('searchResultsList');
    
    // Selected track elements
    const selectedTrack = document.getElementById('selectedTrack');
    const selectedTrackInfo = document.getElementById('selectedTrackInfo');
    const downloadSelectedBtn = document.getElementById('downloadSelectedBtn');
    const backToSearchBtn = document.getElementById('backToSearchBtn');
    
    // Progress elements
    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('progressText');
    const progressContainer = document.getElementById('progressContainer');
    const outputContainer = document.getElementById('outputContainer');
    const outputText = document.getElementById('outputText');
    const trackList = document.getElementById('trackList');
    const downloadComplete = document.getElementById('downloadComplete');
    const downloadZipLink = document.getElementById('downloadZipLink');
    const cancelBtn = document.getElementById('cancelBtn');
    const trackListBtn = document.getElementById('trackListBtn');
    
    // Check if we're on the download page
    if (!urlDownloadForm) return;
    
    let sessionId = null;
    let selectedTrackId = null;
    let selectedTrackData = null;
    
    // Mode toggle handlers
    if (urlModeBtn && searchModeBtn) {
        urlModeBtn.addEventListener('click', function() {
            urlModeBtn.classList.add('active');
            searchModeBtn.classList.remove('active');
            
            urlDownloadForm.style.display = 'block';
            searchForm.style.display = 'none';
            searchResults.style.display = 'none';
            selectedTrack.style.display = 'none';
        });
        
        searchModeBtn.addEventListener('click', function() {
            searchModeBtn.classList.add('active');
            urlModeBtn.classList.remove('active');
            
            searchForm.style.display = 'block';
            urlDownloadForm.style.display = 'none';
            selectedTrack.style.display = 'none';
        });
    }
    
    // URL mode form handler
    urlDownloadForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const spotifyUrl = urlInput.value.trim();
        
        if (!spotifyUrl) {
            Swal.fire({
                title: 'Error!',
                text: 'Please enter a Spotify URL',
                icon: 'error',
                confirmButtonColor: '#1ed760'
            });
            return;
        }
        
        if (!spotifyUrl.startsWith('https://open.spotify.com/')) {
            Swal.fire({
                title: 'Invalid URL',
                text: 'Please enter a valid Spotify URL',
                icon: 'error',
                confirmButtonColor: '#1ed760'
            });
            return;
        }
        
        // Reset UI state
        resetDownloadState();
        
        // Start download with URL
        startDownload({ url: spotifyUrl });
    });
    
    // Search form handler
    if (searchForm) {
        searchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const query = searchInput.value.trim();
            if (!query) return;
            
            // Show loading state
            searchResultsList.innerHTML = '<div class="text-center py-4"><div class="spinner-border text-spotify" role="status"><span class="visually-hidden">Loading...</span></div><p class="mt-2">Searching...</p></div>';
            searchResults.style.display = 'block';
            
            // Fetch search results from API
            fetch(`/api/search?q=${encodeURIComponent(query)}&limit=15`)
                .then(response => {
                    if (!response.ok) {
                        return response.json().then(errorData => {
                            throw new Error(errorData.message || 'Search failed');
                        });
                    }
                    return response.json();
                })
                .then(data => {
                    if (!data.tracks || data.tracks.length === 0) {
                        searchResultsList.innerHTML = '<div class="alert alert-info mt-3">No tracks found. Try a different search term.</div>';
                        return;
                    }
                    displaySearchResults(data.tracks);
                })
                .catch(error => {
                    console.error('Error searching tracks:', error);
                    searchResultsList.innerHTML = `<div class="alert alert-danger">
                        <strong>Search Failed:</strong> ${error.message || 'Failed to search tracks. Please try again.'}
                        <p class="mt-2 mb-0">Please check your network connection or try a different search term.</p>
                    </div>`;
                });
        });
    }
    
    // Search result display function
    function displaySearchResults(tracks) {
        searchResultsList.innerHTML = '';
        
        if (!tracks || tracks.length === 0) {
            searchResultsList.innerHTML = '<div class="alert alert-info mt-3 fade-in">No tracks found. Try a different search term.</div>';
            return;
        }
        
        const resultsContainer = document.createElement('div');
        resultsContainer.className = 'search-results-grid mt-3';
        
        // Add animation delay to stagger the items
        tracks.forEach((track, index) => {
            const resultItem = document.createElement('div');
            resultItem.className = 'search-result-item fade-in';
            resultItem.style.setProperty('--index', index);
            
            // Enhanced track card with image and track name in modern format
            resultItem.innerHTML = `
                <div class="track-card" data-track-id="${track.id}" data-track-name="${track.name}">
                    <div class="track-image">
                        <img src="${track.image_url || '/static/img/default-album.svg'}" alt="${track.name}" class="img-fluid">
                        <div class="track-play-overlay">
                            <i class="fas fa-music"></i>
                        </div>
                        <div class="track-duration-badge">
                            <i class="far fa-clock me-1"></i> ${formatDuration(track.duration_ms)}
                        </div>
                    </div>
                    <div class="track-details">
                        <h5 class="track-title">${track.name}</h5>
                        <p class="track-artist">${track.artists}</p>
                        <div class="track-info-badges">
                            <span class="track-album-badge"><i class="fas fa-compact-disc me-1"></i> ${track.album || 'Single'}</span>
                            <span class="track-popularity-badge">
                                <i class="fas fa-fire-alt me-1"></i> ${track.popularity ? track.popularity + '%' : 'N/A'}
                            </span>
                        </div>
                    </div>
                </div>
            `;
            
            // Add click event to select track
            resultItem.querySelector('.track-card').addEventListener('click', function() {
                const trackId = this.getAttribute('data-track-id');
                const trackName = this.getAttribute('data-track-name');
                
                // Add a visual feedback when track is selected
                const allCards = document.querySelectorAll('.track-card');
                allCards.forEach(card => card.classList.remove('track-selected'));
                this.classList.add('track-selected');
                
                selectTrack(trackId, trackName, track);
                
                // Add a subtle animation
                this.classList.add('track-selected');
                setTimeout(() => {
                    this.classList.remove('track-selected');
                }, 300);
            });
            
            resultsContainer.appendChild(resultItem);
        });
        
        searchResultsList.appendChild(resultsContainer);
    }
    
    // Track selection handler with auto-load functionality
    function selectTrack(trackId, trackName, trackData) {
        selectedTrackId = trackId;
        selectedTrackData = trackData;
        
        // Update selected track info with enhanced UI
        selectedTrackInfo.innerHTML = `
            <div class="selected-track-card">
                <div class="track-image">
                    <img src="${trackData.image_url || '/static/img/default-album.svg'}" alt="${trackData.name}" class="img-fluid">
                    <div class="selected-track-overlay">
                        <i class="fas fa-music"></i>
                    </div>
                </div>
                <div class="track-details">
                    <h4 class="track-title">${trackData.name}</h4>
                    <p class="track-artist">${trackData.artists}</p>
                    <p class="track-album">${trackData.album}</p>
                    <div class="track-metadata">
                        <span class="track-duration">
                            <i class="far fa-clock"></i> ${formatDuration(trackData.duration_ms)}
                        </span>
                    </div>
                    <p class="track-link">
                        <a href="${trackData.spotify_url}" target="_blank" class="spotify-link">
                            <i class="fab fa-spotify"></i> Open in Spotify
                        </a>
                    </p>
                </div>
            </div>
        `;
        
        // Hide search results and show selected track with animation
        searchResults.style.display = 'none';
        selectedTrack.style.display = 'block';
        
        // Add entrance animation
        const selectedTrackCard = document.querySelector('.selected-track-card');
        if (selectedTrackCard) {
            selectedTrackCard.classList.add('animate-entrance');
            setTimeout(() => {
                selectedTrackCard.classList.remove('animate-entrance');
            }, 500);
        }
        
        // Scroll to selected track section
        selectedTrack.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
        
        // Highlight download button to draw attention
        if (downloadSelectedBtn) {
            downloadSelectedBtn.classList.add('btn-pulse');
            setTimeout(() => {
                downloadSelectedBtn.classList.remove('btn-pulse');
            }, 1500);
        }
    }
    
    // Helper function to format track duration
    function formatDuration(ms) {
        const minutes = Math.floor(ms / 60000);
        const seconds = ((ms % 60000) / 1000).toFixed(0);
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    }
    
    // Download selected track button handler
    if (downloadSelectedBtn) {
        downloadSelectedBtn.addEventListener('click', function() {
            if (!selectedTrackId) return;
            
            // Reset download UI
            resetDownloadState();
            
            // Hide selected track view
            selectedTrack.style.display = 'none';
            
            // Start download with track ID
            startDownload({ 
                track_id: selectedTrackId,
                track_name: selectedTrackData ? `${selectedTrackData.name} - ${selectedTrackData.artists}` : "Selected Track"
            });
        });
    }
    
    // Back to search button handler
    if (backToSearchBtn) {
        backToSearchBtn.addEventListener('click', function() {
            selectedTrack.style.display = 'none';
            searchResults.style.display = 'block';
            selectedTrackId = null;
            selectedTrackData = null;
        });
    }
    
    // Start download function
    function startDownload(downloadData) {
        // Start download
        fetch('/download', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(downloadData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.session_id) {
                sessionId = data.session_id;
                
                // Show progress
                urlDownloadForm.style.display = 'none';
                searchForm.style.display = 'none';
                progressContainer.style.display = 'block';
                outputContainer.style.display = 'block';
                cancelBtn.classList.remove('d-none');
                
                // Start polling for progress
                pollProgress();
            } else {
                Swal.fire({
                    title: 'Error!',
                    text: data.error || 'Failed to start download',
                    icon: 'error',
                    confirmButtonColor: '#1ed760'
                });
            }
        })
        .catch(error => {
            console.error('Error starting download:', error);
            Swal.fire({
                title: 'Error!',
                text: 'Failed to connect to the server',
                icon: 'error',
                confirmButtonColor: '#1ed760'
            });
        });
    }
    
    // Reset download state
    function resetDownloadState() {
        sessionId = null;
        progressContainer.style.display = 'none';
        outputContainer.style.display = 'none';
        trackList.style.display = 'none';
        downloadComplete.style.display = 'none';
        cancelBtn.classList.add('d-none');
        trackListBtn.classList.add('d-none');
        progressBar.style.width = '0%';
        progressText.textContent = '0%';
    }
    
    function pollProgress() {
        if (!sessionId) return;
        
        fetch(`/download-progress?session_id=${sessionId}`)
        .then(response => {
            // Check if session was not found (404)
            if (response.status === 404) {
                console.log('Download session not found (may have been cancelled)');
                // Reset UI
                urlDownloadForm.style.display = 'block';
                searchForm.style.display = 'block';
                progressContainer.style.display = 'none';
                outputContainer.style.display = 'none';
                cancelBtn.classList.add('d-none');
                downloadComplete.style.display = 'none';
                trackList.style.display = 'none';
                
                // Clear the session ID to stop polling
                sessionId = null;
                return Promise.reject('Session not found');
            }
            return response.json();
        })
        .then(data => {
            if (data.download_complete) {
                // Download complete
                progressBar.style.width = '100%';
                progressText.textContent = '100%';
                
                // Show download complete section
                progressContainer.style.display = 'none';
                outputContainer.style.display = 'none';
                cancelBtn.classList.add('d-none');
                downloadComplete.style.display = 'block';
                
                // Set the download link properly
                if (downloadZipLink) {
                    // Store the download URL as a data attribute instead of href 
                    // to avoid the querySelector error
                    const downloadUrl = `/download/${sessionId}`;
                    downloadZipLink.setAttribute('data-download-url', downloadUrl);
                    
                    // Clear existing event listeners by cloning and replacing the element
                    const newLink = downloadZipLink.cloneNode(true);
                    downloadZipLink.parentNode.replaceChild(newLink, downloadZipLink);
                    downloadZipLink = newLink; // Update the reference
                    
                    // Add click event listener to handle download safely
                    downloadZipLink.addEventListener('click', function(e) {
                        e.preventDefault();
                        const url = this.getAttribute('data-download-url');
                        if (url) {
                            window.location.href = url;
                        }
                    });
                }
                
                // Fetch tracks - will only show button for playlists
                fetchTracks();
                
                // Stop polling
                sessionId = null;
            } else {
                // Update progress
                const percentage = data.percentage || 0;
                progressBar.style.width = `${percentage}%`;
                progressText.textContent = `${percentage}%`;
                
                // Update output if available
                fetch(`/output?session_id=${sessionId}`)
                .then(response => {
                    // Handle 404 errors
                    if (response.status === 404) {
                        console.log('Session not found when fetching output');
                        return Promise.reject('Session not found');
                    }
                    return response.text();
                })
                .then(output => {
                    if (output && output !== "No such session") {
                        outputText.textContent = output;
                        outputContainer.scrollTop = outputContainer.scrollHeight;
                    }
                })
                .catch(error => {
                    // Just log errors for output fetch, don't disrupt the main flow
                    console.log('Output fetch error:', error);
                });
                
                // Continue polling
                setTimeout(pollProgress, 1000);
            }
        })
        .catch(error => {
            console.error('Error polling progress:', error);
            // Only continue polling if we have a valid session and the error is not "Session not found"
            if (sessionId && error !== 'Session not found') {
                setTimeout(pollProgress, 1000);
            }
        });
    }
    
    function fetchTracks() {
        if (!sessionId) return;
        
        fetch(`/tracks?session_id=${sessionId}`)
        .then(response => {
            // Handle 404 errors (session not found)
            if (response.status === 404) {
                console.log('Session not found when fetching tracks');
                return Promise.reject('Session not found');
            }
            return response.json();
        })
        .then(data => {
            if (data.error) {
                console.error('Error fetching tracks:', data.error);
                return;
            }
            
            if (data.length > 0) {
                trackList.innerHTML = '';
                
                data.forEach((track) => {
                    const trackItem = document.createElement('div');
                    trackItem.className = 'track-item';
                    trackItem.innerHTML = `
                        <div class="track-icon">
                            <i class="fas fa-music"></i>
                        </div>
                        <div class="track-info">
                            <div class="track-title">${track}</div>
                        </div>
                        <div class="track-download">
                            <a href="javascript:void(0)" 
                               onclick="window.location.href='/download/${sessionId}/${encodeURIComponent(track)}'"
                               class="btn btn-sm btn-outline-spotify">
                                <i class="fas fa-download"></i>
                            </a>
                        </div>
                    `;
                    trackList.appendChild(trackItem);
                });
                
                // Only show View Tracks button if we have multiple tracks (playlist)
                if (data.length > 1) {
                    trackListBtn.classList.remove('d-none');
                    
                    trackListBtn.addEventListener('click', function() {
                        if (trackList.style.display === 'none' || !trackList.style.display) {
                            trackList.style.display = 'block';
                            this.innerHTML = '<i class="fas fa-times me-2"></i>Hide Tracks';
                        } else {
                            trackList.style.display = 'none';
                            this.innerHTML = '<i class="fas fa-list me-2"></i>View Tracks';
                        }
                    });
                }
            }
        })
        .catch(error => {
            console.error('Error fetching tracks:', error);
        });
    }
    
    // Cancel download
    cancelBtn.addEventListener('click', function() {
        if (!sessionId) return;
        
        Swal.fire({
            title: 'Cancel Download?',
            text: 'Are you sure you want to cancel this download?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#1ed760',
            cancelButtonColor: '#333',
            confirmButtonText: 'Yes, cancel it!'
        }).then((result) => {
            if (result.isConfirmed) {
                // Create a FormData object for the POST request
                const formData = new FormData();
                formData.append('session_id', sessionId);
                
                fetch('/cancel-download', { 
                    method: 'POST',
                    body: formData
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        Swal.fire({
                            title: 'Cancelled!',
                            text: 'Your download has been cancelled.',
                            icon: 'success',
                            confirmButtonColor: '#1ed760'
                        });
                        
                        // Reset UI
                        urlDownloadForm.style.display = 'block'; // Show URL download form
                        searchForm.style.display = 'block'; // Show search form
                        progressContainer.style.display = 'none';
                        outputContainer.style.display = 'none';
                        cancelBtn.classList.add('d-none');
                        downloadComplete.style.display = 'none';
                        trackList.style.display = 'none';
                        
                        sessionId = null;
                    } else {
                        Swal.fire({
                            title: 'Error!',
                            text: data.error || 'Failed to cancel download',
                            icon: 'error',
                            confirmButtonColor: '#1ed760'
                        });
                    }
                })
                .catch(error => {
                    console.error('Error cancelling download:', error);
                    Swal.fire({
                        title: 'Error!',
                        text: 'Failed to connect to the server',
                        icon: 'error',
                        confirmButtonColor: '#1ed760'
                    });
                });
            }
        });
    });
}
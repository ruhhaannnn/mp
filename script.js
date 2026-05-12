function initPreloader() {
    const launchScreen = document.querySelector('.launch-screen');
    if (launchScreen) {
        launchScreen.style.transform = 'translateY(-100%)';
        setTimeout(() => {
            if (launchScreen.parentNode) {
                launchScreen.parentNode.removeChild(launchScreen);
            }
        }, 1000);
    }
}
window.addEventListener('load', initPreloader);
setTimeout(initPreloader, 2500);

document.addEventListener('DOMContentLoaded', () => {
    
    if ('scrollRestoration' in window.history) {
        window.history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);
    
    const menuToggle = document.getElementById('menu-toggle');
    const menuOverlay = document.querySelector('.menu-overlay');
    const headerInner = document.querySelector('.header-inner');
    let menuOpen = false;

    function toggleMenu() {
        menuOpen = !menuOpen;
        menuOverlay.classList.toggle('active');
        
        const bars = menuToggle.querySelectorAll('.bar');
        if (menuOpen) {
            bars[0].style.transform = 'translateY(4.5px) rotate(45deg)';
            bars[1].style.transform = 'translateY(-4.5px) rotate(-45deg)';
            bars.forEach(bar => bar.style.background = '#111827'); 
            
            headerInner.style.background = 'transparent';
            headerInner.style.backdropFilter = 'none';
            headerInner.style.boxShadow = 'none';
            headerInner.style.border = 'none';
        } else {
            bars[0].style.transform = 'none';
            bars[1].style.transform = 'none';
            bars.forEach(bar => bar.style.background = '#111827'); 
            
            headerInner.style.background = 'rgba(255, 255, 255, 0.4)';
            headerInner.style.backdropFilter = 'blur(15px)';
            headerInner.style.boxShadow = '0 8px 32px 0 rgba(31, 38, 135, 0.15), inset 0 0 0 2px rgba(255, 255, 255, 0.2), inset 0 0 20px rgba(255, 255, 255, 0.5)';
            headerInner.style.border = '1px solid rgba(255, 255, 255, 0.5)';
        }
    }

    if(menuToggle) {
        menuToggle.addEventListener('click', toggleMenu);
    }

    const revealElements = document.querySelectorAll('.scroll-reveal');
    const revealOptions = { threshold: 0.15, rootMargin: "0px 0px -50px 0px" };
    const revealOnScroll = new IntersectionObserver(function(entries, observer) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, revealOptions);
    revealElements.forEach(el => revealOnScroll.observe(el));

    const parallaxItems = document.querySelectorAll('.parallax-item');
    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                const scrolled = window.scrollY;
                parallaxItems.forEach(item => {
                    const speed = item.getAttribute('data-speed');
                    item.style.transform = `translateY(${scrolled * speed}px)`;
                });
                ticking = false;
            });
            ticking = true;
        }
    });

    const reviews = document.querySelectorAll('.testimonial-content');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    let currentReview = 0;
    let autoSlideInterval;

    function showReview(index) {
        reviews.forEach((review, i) => {
            review.classList.remove('active');
            if (i === index) review.classList.add('active');
        });
    }

    function nextSlide() {
        currentReview = (currentReview + 1) % reviews.length;
        showReview(currentReview);
    }

    function prevSlide() {
        currentReview = (currentReview - 1 + reviews.length) % reviews.length;
        showReview(currentReview);
    }

    function startAutoSlide() { autoSlideInterval = setInterval(nextSlide, 4000); }
    function stopAutoSlide() { clearInterval(autoSlideInterval); }

    if(prevBtn && nextBtn && reviews.length > 0) {
        prevBtn.addEventListener('click', () => { prevSlide(); stopAutoSlide(); startAutoSlide(); });
        nextBtn.addEventListener('click', () => { nextSlide(); stopAutoSlide(); startAutoSlide(); });
        startAutoSlide();
    }

    const overlayTriggers = document.querySelectorAll('.trigger-overlay');
    const globalCloseBtns = document.querySelectorAll('.close-overlay-global'); 
    
    overlayTriggers.forEach(trigger => {
        trigger.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = trigger.getAttribute('href').substring(1); 
            const targetOverlay = document.getElementById(targetId);
            
            if (menuOverlay && menuOverlay.classList.contains('active')) toggleMenu(); 
            
            setTimeout(() => {
                document.querySelectorAll('.content-overlay').forEach(ov => ov.classList.remove('active'));
                if(targetOverlay) targetOverlay.classList.add('active');
            }, 300);
        });
    });

    globalCloseBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.content-overlay').forEach(ov => ov.classList.remove('active'));
            if (menuOverlay && menuOverlay.classList.contains('active')) toggleMenu(); 
        });
    });

    // ==========================================
    // FIREBASE LOGIC
    // ==========================================
    try {
        const firebaseConfig = {
            apiKey: "AIzaSyB7VI17kYOOy2snWdF-u7psfnPHzgSlhUg",
            authDomain: "motherspridesxr-5028d.firebaseapp.com",
            databaseURL: "https://motherspridesxr-5028d-default-rtdb.asia-southeast1.firebasedatabase.app",
            projectId: "motherspridesxr-5028d"
        };

        if (typeof firebase !== 'undefined') {
            if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
            const db = firebase.database();

            // Fetch Notices
            const noticesContainer = document.getElementById('notices-container');
            const FIFTEEN_DAYS_IN_MS = 15 * 24 * 60 * 60 * 1000;

            if (noticesContainer) {
                db.ref('notices').on('value', (snapshot) => {
                    const data = snapshot.val();
                    if (!data) {
                        noticesContainer.innerHTML = `<div class="empty-state">No active notices.</div>`;
                        return;
                    }

                    const now = Date.now();
                    let validNotices = [];
                    Object.keys(data).forEach(key => {
                        const notice = data[key];
                        const safeTimestamp = notice.timestamp || now; 
                        if ((now - safeTimestamp) <= FIFTEEN_DAYS_IN_MS) {
                            validNotices.push({ heading: notice.heading || 'Update', text: notice.text, timestamp: safeTimestamp });
                        }
                    });

                    if (validNotices.length === 0) {
                        noticesContainer.innerHTML = `<div class="empty-state">No active notices.</div>`;
                        return;
                    }

                    validNotices.sort((a, b) => b.timestamp - a.timestamp);
                    noticesContainer.innerHTML = '';
                    validNotices.forEach((notice, index) => {
                        const dateString = new Date(notice.timestamp).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
                        const delay = index * 0.15; 
                        
                        // Updated to dynamically pull the notice heading from the database
                        noticesContainer.insertAdjacentHTML('beforeend', `
                            <div class="stack-card" style="animation-delay: ${delay}s">
                                <h3 class="stack-heading">${notice.heading}</h3>
                                <div class="stack-date">${dateString}</div>
                                <div class="stack-note">${notice.text}</div>
                            </div>
                        `);
                    });
                });
            }

            // Fetch Activities
            const activitiesContainer = document.getElementById('activities-container');
            if (activitiesContainer) {
                db.ref('activities').on('value', (snapshot) => {
                    const data = snapshot.val();
                    if (!data) {
                        activitiesContainer.innerHTML = `<div class="empty-state">No activities logged yet.</div>`;
                        return;
                    }

                    let validActivities = [];
                    Object.keys(data).forEach(key => {
                        validActivities.push(data[key]);
                    });

                    validActivities.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
                    
                    activitiesContainer.innerHTML = '';
                    validActivities.forEach((activity, index) => {
                        const safeTimestamp = activity.timestamp || Date.now();
                        const dateString = new Date(safeTimestamp).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
                        const delay = index * 0.15;

                        activitiesContainer.insertAdjacentHTML('beforeend', `
                            <div class="stack-card" style="animation-delay: ${delay}s">
                                <h3 class="stack-heading activity-heading">${activity.title}</h3>
                                <div class="stack-date">Date: ${dateString}</div>
                                <div class="stack-note">${activity.description}</div>
                            </div>
                        `);
                    });
                });
            }

            // ==========================================
            // BULLETPROOF ANALYTICS SENSOR 
            // WITH ACTIVE SESSION HEARTBEAT
            // ==========================================
            async function recordVisit() {
                try {
                    let ipData = { city: 'Unknown', ip: 'Hidden', org: 'Direct Traffic' };
                    try {
                        const ipRes = await fetch('https://ipapi.co/json/');
                        if(ipRes.ok) ipData = await ipRes.json();
                    } catch(e) {
                        console.warn("IP fetch blocked. Proceeding with fallback data.");
                    }

                    const agent = navigator.userAgent;
                    let deviceType = "Desktop";
                    if (/Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(agent)) {
                        deviceType = "Mobile";
                    } else if (/iPad|tablet/i.test(agent)) {
                        deviceType = "Tablet";
                    }

                    // Create the initial session record
                    const sessionRef = await db.ref('analytics').push({
                        timestamp: firebase.database.ServerValue.TIMESTAMP,
                        city: ipData.city || 'Unknown Region',
                        ip: ipData.ip || 'Hidden',
                        device: deviceType,
                        org: ipData.org || 'Direct Traffic',
                        timeSpentSeconds: 0
                    });

                    // Heartbeat: update the time spent every 10 seconds
                    let timeSpent = 0;
                    setInterval(() => {
                        timeSpent += 10;
                        sessionRef.update({ timeSpentSeconds: timeSpent });
                    }, 10000);

                } catch(e) {
                    console.error("Firebase analytics push failed: ", e);
                }
            }
            recordVisit();
        }
    } catch (error) {
        console.error("Firebase Initialization error:", error);
    }
});

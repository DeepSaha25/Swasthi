document.addEventListener('DOMContentLoaded', () => {

    // --- CUSTOM CURSOR LOGIC ---
    const cursorDot = document.querySelector('.cursor-dot');
    const cursorOutline = document.querySelector('.cursor-outline');
    const interactiveElements = document.querySelectorAll('a, button');

    window.addEventListener('mousemove', (e) => {
        const posX = e.clientX;
        const posY = e.clientY;

        cursorDot.style.left = `${posX}px`;
        cursorDot.style.top = `${posY}px`;

        cursorOutline.animate({
            left: `${posX}px`,
            top: `${posY}px`
        }, { duration: 500, fill: "forwards" });
    });

    interactiveElements.forEach(el => {
        el.addEventListener('mouseover', () => {
            cursorOutline.classList.add('hovered');
        });
        el.addEventListener('mouseleave', () => {
            cursorOutline.classList.remove('hovered');
        });
    });

    // --- GSAP ANIMATIONS ---

    // 1. Sticky Navigation on Scroll
    const nav = document.querySelector('.navbar');
    ScrollTrigger.create({
        start: 'top -80',
        end: 99999,
        toggleClass: {
            className: 'scrolled',
            targets: nav
        }
    });
    
    // 2. Hero Section Entry Animation
    gsap.timeline()
        .to('.hero-title', { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out', delay: 0.2 })
        .to('.hero-subtitle', { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' }, "-=0.4")
        .to('.btn', { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' }, "-=0.3");

    // 3. Subtle Zoom on Hero Background Shape on Scroll
    gsap.to('.hero-bg-shape', {
        scale: 1.5,
        opacity: 0,
        scrollTrigger: {
            trigger: '.hero',
            start: 'top top',
            end: 'bottom top',
            scrub: true
        }
    });

    // 4. On-Scroll Reveal for Sections and Cards
    const revealElements = document.querySelectorAll('.section-title, .card');

    revealElements.forEach((el) => {
        gsap.fromTo(el, 
            { opacity: 0, y: 30 },
            {
                opacity: 1,
                y: 0,
                duration: 0.8,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: el,
                    start: 'top 85%', // Animate when element is 85% from the top of the viewport
                    toggleActions: 'play none none none'
                }
            }
        );
    });

});
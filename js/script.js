/* ==========================================================================
   Bernards Gulbis - Portfolio Website
   Dark/light toggle, hamburger menu, scroll animations, active nav
   ========================================================================== */

(function () {
    'use strict';

    /* --- Dark/Light Mode Toggle --- */

    const themeToggle = document.getElementById('themeToggle');
    const htmlElement = document.documentElement;
    const THEME_KEY = 'bg-portfolio-theme';

    function getPreferredTheme() {
        const stored = localStorage.getItem(THEME_KEY);
        if (stored) {
            return stored;
        }
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    function setTheme(theme) {
        htmlElement.setAttribute('data-theme', theme);
        themeToggle.setAttribute('aria-label',
            theme === 'dark' ? themeToggle.dataset.labelDark : themeToggle.dataset.labelLight
        );
    }

    // Sync aria-label on load (data-theme already set by inline <head> script)
    setTheme(getPreferredTheme());

    themeToggle.addEventListener('click', function () {
        const newTheme = htmlElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        htmlElement.classList.add('transitioning');
        setTheme(newTheme);
        localStorage.setItem(THEME_KEY, newTheme);
        setTimeout(function () { htmlElement.classList.remove('transitioning'); }, 350);
    });

    /* --- Hamburger Menu (Mobile) --- */

    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('navLinks');

    function setHamburgerExpanded(expanded) {
        hamburger.setAttribute('aria-expanded', expanded);
        hamburger.setAttribute('aria-label',
            expanded ? hamburger.dataset.labelClose : hamburger.dataset.labelOpen
        );
    }

    hamburger.addEventListener('click', function () {
        const isExpanded = hamburger.getAttribute('aria-expanded') === 'true';
        setHamburgerExpanded(!isExpanded);
        navLinks.classList.toggle('open');
    });

    // Close mobile menu when a nav link is clicked
    navLinks.querySelectorAll('.nav__link').forEach(function (link) {
        link.addEventListener('click', function () {
            navLinks.classList.remove('open');
            setHamburgerExpanded(false);
        });
    });

    // Close mobile menu on resize to desktop (debounced)
    let resizeTimer;
    window.addEventListener('resize', function () {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function () {
            if (window.innerWidth > 900) {
                navLinks.classList.remove('open');
                setHamburgerExpanded(false);
            }
        }, 150);
    });

    // Close mobile menu on Escape key
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && navLinks.classList.contains('open')) {
            navLinks.classList.remove('open');
            setHamburgerExpanded(false);
            hamburger.focus();
        }
    });

    /* --- Scroll Reveal (Intersection Observer) --- */

    const revealElements = document.querySelectorAll('.reveal, .stagger');

    const revealObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                revealObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    });

    revealElements.forEach(function (el) {
        revealObserver.observe(el);
    });

    /* --- Active Nav Link Highlighting --- */

    const navLinksAll = document.querySelectorAll('.nav__link');
    const nav = document.getElementById('nav');

    // Match the CSS scroll-padding-top so the probe line lines up with where
    // anchor links actually park each section.
    const scrollPaddingTop =
        parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) ||
        nav.offsetHeight;

    // Only track sections that have a corresponding nav link
    const navHrefs = {};
    navLinksAll.forEach(function (link) {
        navHrefs[link.getAttribute('href').substring(1)] = true;
    });
    const trackedSections = [];
    document.querySelectorAll('section[id]').forEach(function (section) {
        if (navHrefs[section.getAttribute('id')]) {
            trackedSections.push(section);
        }
    });

    let lastActiveId = '';

    function updateActiveNav() {
        const scrollPos = window.scrollY + scrollPaddingTop + 1;
        let currentId = '';

        trackedSections.forEach(function (section) {
            if (section.offsetTop <= scrollPos) {
                currentId = section.getAttribute('id');
            }
        });

        if (currentId === lastActiveId) return;
        lastActiveId = currentId;

        navLinksAll.forEach(function (link) {
            link.classList.toggle('active', link.getAttribute('href') === '#' + currentId);
        });
    }

    let ticking = false;
    window.addEventListener('scroll', function () {
        if (!ticking) {
            requestAnimationFrame(function () { updateActiveNav(); ticking = false; });
            ticking = true;
        }
    }, { passive: true });
    updateActiveNav();

})();

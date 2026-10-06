/* ═══════════════════════════════════════════════
   BROOKLYN GILBERT — LUXURY PORTFOLIO ENGINE
   ═══════════════════════════════════════════════ */
(() => {
    'use strict';

    gsap.registerPlugin(ScrollTrigger);

    const isTouch = window.matchMedia('(hover: none)').matches;
    const isMobile = window.matchMedia('(max-width: 900px)').matches;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ── Split text into masked words ─────────── */
    const splitWords = (el) => {
        const words = el.textContent.trim().split(/\s+/);
        el.innerHTML = words
            .map(w => `<span class="rw-mask"><span class="rw-word">${w}</span></span>`)
            .join(' ');
        return el.querySelectorAll('.rw-word');
    };

    document.querySelectorAll('.reveal-words').forEach(el => {
        const words = splitWords(el);
        if (reduceMotion) return;
        gsap.to(words, {
            y: 0, duration: 1.1, ease: 'power4.out', stagger: 0.028,
            scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none reverse' }
        });
    });

    /* ── Fade-up reveals ──────────────────────── */
    if (!reduceMotion) {
        gsap.utils.toArray('.reveal-fade').forEach(el => {
            gsap.to(el, {
                opacity: 1, y: 0, duration: 1, ease: 'power3.out',
                scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none reverse' }
            });
        });
    } else {
        document.querySelectorAll('.reveal-fade').forEach(el => { el.style.opacity = 1; el.style.transform = 'none'; });
    }

    /* ── Image clip reveals ───────────────────── */
    if (!reduceMotion) {
        gsap.utils.toArray('.img-reveal').forEach(el => {
            gsap.to(el, {
                clipPath: 'inset(0 0 0% 0)', duration: 1.4, ease: 'power4.inOut',
                scrollTrigger: { trigger: el, start: 'top 82%', toggleActions: 'play none none reverse' }
            });
        });
    } else {
        document.querySelectorAll('.img-reveal').forEach(el => { el.style.clipPath = 'none'; });
    }

    /* ── Hero kicker line ─────────────────────── */
    const kicker = document.querySelector('.hero-kicker');
    if (kicker && !reduceMotion) {
        gsap.set(kicker, { yPercent: 120 });
    }

    /* ── Lenis smooth scroll ──────────────────── */
    let lenis = null;
    const initLenis = () => {
        if (reduceMotion) return;
        lenis = new Lenis({
            duration: 1.25,
            easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            smoothWheel: true
        });
        lenis.on('scroll', ScrollTrigger.update);
        gsap.ticker.add(t => lenis.raf(t * 1000));
        gsap.ticker.lagSmoothing(0);
    };
    initLenis();

    const scrollToTarget = (target) => {
        if (lenis) lenis.scrollTo(target, { offset: 0, duration: 1.4 });
        else {
            const el = typeof target === 'string' ? document.querySelector(target) : target;
            el && el.scrollIntoView({ behavior: 'smooth' });
        }
    };

    document.querySelectorAll('[data-scroll]').forEach(a => {
        a.addEventListener('click', e => {
            const href = a.getAttribute('href');
            if (!href || !href.startsWith('#')) return;
            e.preventDefault();
            closeMenu();
            scrollToTarget(href);
        });
    });

    /* ── PRELOADER: progress → enter gate ─────── */
    const preloader = document.getElementById('preloader');
    const plCount = document.getElementById('preloaderCount');
    const plFill = document.getElementById('preloaderFill');
    const plEnter = document.getElementById('preloaderEnter');
    document.body.classList.add('is-locked');
    if (lenis) lenis.stop();

    const heroIntro = () => {
        const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
        tl.to('.ht-word', { y: 0, duration: 1.3, stagger: .12 }, .1)
            .to('.hero-kicker', { yPercent: 0, duration: 1 }, .5)
            .from('.hero-copy .rw-word', { y: '110%', duration: 1, stagger: .015 }, .55)
            .from('.hero-cta .btn', { y: 30, opacity: 0, duration: .9, stagger: .1 }, .8)
            .from('.hero-figure', { y: 60, opacity: 0, duration: 1.3 }, .45)
            .from('.hero-img', { scale: 1.35, duration: 1.8, ease: 'power3.out' }, .45)
            .from('.hero-stats .stat', { y: 40, opacity: 0, duration: .9, stagger: .1 }, .9)
            .from('.site-header', { y: -40, opacity: 0, duration: .9 }, .7)
            .from('.hero-scroll-hint', { opacity: 0, duration: .8 }, 1.2)
            .add(startCounters, 1);
    };

    const startCounters = () => {
        document.querySelectorAll('.stat-num').forEach(el => {
            const end = +el.dataset.count, suffix = el.dataset.suffix || '';
            const obj = { v: 0 };
            gsap.to(obj, {
                v: end, duration: 2, ease: 'power2.out',
                onUpdate: () => { el.textContent = Math.round(obj.v) + suffix; }
            });
        });
    };

    if (reduceMotion) {
        preloader.style.display = 'none';
        document.body.classList.remove('is-locked');
        gsap.set('.ht-word, .pl-letter', { y: 0 });
        gsap.set('.hero-kicker', { yPercent: 0 });
        startCounters();
    } else {
        gsap.to('.pl-letter', { y: 0, duration: .9, stagger: .07, ease: 'power4.out', delay: .2 });
        const load = { v: 0 };
        gsap.to(load, {
            v: 100, duration: 1.9, ease: 'power2.inOut',
            onUpdate: () => {
                plCount.textContent = Math.round(load.v) + '%';
                plFill.style.transform = `scaleX(${load.v / 100})`;
            },
            onComplete: () => plEnter.classList.add('is-ready')
        });
        plEnter.addEventListener('click', () => {
            gsap.timeline()
                .to('.preloader-center, .preloader-enter', { opacity: 0, y: -26, duration: .5, ease: 'power2.in' })
                .to(preloader, {
                    yPercent: -100, duration: 1, ease: 'power4.inOut',
                    onComplete: () => {
                        preloader.style.display = 'none';
                        document.body.classList.remove('is-locked');
                        if (lenis) lenis.start();
                        ScrollTrigger.refresh();
                    }
                }, '-=.15')
                .add(heroIntro, '-=.75');
        }, { once: true });
    }

    /* ── Custom cursor ────────────────────────── */
    const dot = document.getElementById('cursorDot');
    const ring = document.getElementById('cursorRing');
    const label = document.getElementById('cursorLabel');
    if (!isTouch) {
        let mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my;
        addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
        gsap.ticker.add(() => {
            rx += (mx - rx) * 0.16; ry += (my - ry) * 0.16;
            dot.style.transform = `translate(${mx}px,${my}px) translate(-50%,-50%)`;
            ring.style.transform = `translate(${rx}px,${ry}px) translate(-50%,-50%)`;
        });
        const hoverables = 'a, button, .service-row, input, textarea';
        document.addEventListener('mouseover', e => {
            const t = e.target.closest(hoverables);
            ring.classList.toggle('is-hover', !!t);
            const labelled = e.target.closest('[data-cursor]');
            if (labelled) {
                label.textContent = labelled.dataset.cursor;
                ring.classList.add('is-label');
            } else {
                ring.classList.remove('is-label');
            }
        });
    }

    /* ── Magnetic elements ────────────────────── */
    if (!isTouch && !reduceMotion) {
        document.querySelectorAll('.magnetic').forEach(el => {
            el.addEventListener('mousemove', e => {
                const r = el.getBoundingClientRect();
                gsap.to(el, {
                    x: (e.clientX - r.left - r.width / 2) * 0.3,
                    y: (e.clientY - r.top - r.height / 2) * 0.3,
                    duration: .5, ease: 'power3.out'
                });
            });
            el.addEventListener('mouseleave', () => {
                gsap.to(el, { x: 0, y: 0, duration: .7, ease: 'elastic.out(1,.4)' });
            });
        });
    }

    /* ── Header: shrink / hide on scroll ──────── */
    const header = document.getElementById('siteHeader');
    const progressFill = document.getElementById('scrollProgressFill');
    let lastY = 0;
    const onScroll = () => {
        const y = window.scrollY;
        header.classList.toggle('is-scrolled', y > 60);
        header.classList.toggle('is-hidden', y > 500 && y > lastY && !document.getElementById('mobileMenu').classList.contains('is-open'));
        lastY = y;
        const max = document.documentElement.scrollHeight - innerHeight;
        progressFill.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
    };
    addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    /* ── Mobile menu ──────────────────────────── */
    const burger = document.getElementById('burger');
    const mobileMenu = document.getElementById('mobileMenu');
    const closeMenu = () => {
        mobileMenu.classList.remove('is-open');
        burger.classList.remove('is-open');
        document.body.classList.remove('is-locked');
        if (lenis) lenis.start();
    };
    burger.addEventListener('click', () => {
        const open = mobileMenu.classList.toggle('is-open');
        burger.classList.toggle('is-open', open);
        document.body.classList.toggle('is-locked', open);
        if (lenis) open ? lenis.stop() : lenis.start();
    });

    /* ── Parallax elements ────────────────────── */
    if (!reduceMotion) {
        gsap.utils.toArray('[data-parallax]').forEach(el => {
            const amt = +el.dataset.parallax || 12;
            gsap.fromTo(el, { y: amt }, {
                y: -amt, ease: 'none',
                scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true }
            });
        });
        /* inner image parallax for work frames */
        gsap.utils.toArray('.work-parallax').forEach(el => {
            gsap.fromTo(el, { yPercent: -8 }, {
                yPercent: 8, ease: 'none',
                scrollTrigger: { trigger: el.closest('.work-item'), start: 'top bottom', end: 'bottom top', scrub: true }
            });
        });
        /* hero figure drift on scroll */
        gsap.to('.hero-figure', {
            yPercent: 12, ease: 'none',
            scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
        });
        gsap.to('.hero-bg-text', {
            yPercent: -30, ease: 'none',
            scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
        });
    }

    /* ── Services: floating preview ───────────── */
    const preview = document.getElementById('servicePreview');
    if (preview && !isTouch) {
        const pimg = preview.querySelector('img');
        let px = 0, py = 0, tx = 0, ty = 0;
        addEventListener('mousemove', e => { tx = e.clientX + 30; ty = e.clientY - 105; });
        gsap.ticker.add(() => {
            px += (tx - px) * 0.1; py += (ty - py) * 0.1;
            preview.style.left = px + 'px'; preview.style.top = py + 'px';
        });
        document.querySelectorAll('.service-row').forEach(row => {
            row.addEventListener('mouseenter', () => {
                pimg.src = row.dataset.preview;
                preview.classList.add('is-visible');
            });
            row.addEventListener('mouseleave', () => preview.classList.remove('is-visible'));
        });
    }

    /* ── Process line fill ────────────────────── */
    const processFill = document.getElementById('processFill');
    if (processFill && !reduceMotion) {
        gsap.to(processFill, {
            scaleX: 1, ease: 'none',
            scrollTrigger: { trigger: '.process-track', start: 'top 75%', end: 'bottom 45%', scrub: true }
        });
    } else if (processFill) {
        processFill.style.transform = 'scaleX(1)';
    }

    /* ── Testimonials slider ──────────────────── */
    const track = document.getElementById('tTrack');
    const slides = track ? track.children.length : 0;
    const dotsWrap = document.getElementById('tDots');
    let tIndex = 0, tTimer = null;
    if (track) {
        for (let i = 0; i < slides; i++) {
            const d = document.createElement('span');
            d.className = 't-dot' + (i === 0 ? ' is-active' : '');
            d.addEventListener('click', () => goSlide(i));
            dotsWrap.appendChild(d);
        }
        const goSlide = (i) => {
            tIndex = (i + slides) % slides;
            track.style.transform = `translateX(-${tIndex * 100}%)`;
            dotsWrap.querySelectorAll('.t-dot').forEach((d, j) => d.classList.toggle('is-active', j === tIndex));
            restartAuto();
        };
        document.getElementById('tPrev').addEventListener('click', () => goSlide(tIndex - 1));
        document.getElementById('tNext').addEventListener('click', () => goSlide(tIndex + 1));
        const restartAuto = () => {
            clearInterval(tTimer);
            tTimer = setInterval(() => goSlide(tIndex + 1), 6000);
        };
        restartAuto();
        document.getElementById('tSlider').addEventListener('mouseenter', () => clearInterval(tTimer));
        document.getElementById('tSlider').addEventListener('mouseleave', restartAuto);
    }

    /* ── Footer big text reveal ───────────────── */
    if (!reduceMotion) {
        gsap.utils.toArray('.fb-line span').forEach(el => {
            gsap.to(el, {
                y: 0, duration: 1.2, ease: 'power4.out',
                scrollTrigger: { trigger: '.footer-big', start: 'top 85%', toggleActions: 'play none none reverse' }
            });
        });
    } else {
        document.querySelectorAll('.fb-line span').forEach(el => { el.style.transform = 'none'; });
    }

    /* ── CTA band lines ───────────────────────── */
    if (!reduceMotion) {
        gsap.from('.ct-line span', {
            y: '110%', duration: 1.1, ease: 'power4.out', stagger: .12,
            scrollTrigger: { trigger: '.cta-band', start: 'top 75%', toggleActions: 'play none none reverse' }
        });
    }

    /* ── London clock ─────────────────────────── */
    const timeEl = document.getElementById('localTime');
    const tick = () => {
        timeEl.textContent = new Date().toLocaleTimeString('en-GB', {
            timeZone: 'Europe/London', hour: '2-digit', minute: '2-digit', second: '2-digit'
        }) + ' GMT';
    };
    tick(); setInterval(tick, 1000);

    /* ── CV download (generated on the fly) ───── */
    document.getElementById('cvBtn').addEventListener('click', () => {
        const cv = [
            'BROOKLYN GILBERT', 'UI/UX Designer & Developer — London, UK',
            'hello@brooklyngilbert.com · 00-123 00000', '',
            'EXPERIENCE', '2010—Now  Freelance Product Designer & Developer',
            '        250+ projects for startups and global brands.', '',
            'CAPABILITIES', '· UX Research & Prototyping', '· Interface Design & Design Systems',
            '· Front-end Development (HTML/CSS/JS, React)', '· Motion & Interaction Design', '',
            'STATS', '15+ years · 250+ projects · 58 happy clients'
        ].join('\n');
        const url = URL.createObjectURL(new Blob([cv], { type: 'text/plain' }));
        const a = Object.assign(document.createElement('a'), { href: url, download: 'Brooklyn-Gilbert-CV.txt' });
        a.click(); URL.revokeObjectURL(url);
    });

    /* ── Contact form ─────────────────────────── */
    const form = document.getElementById('contactForm');
    const status = document.getElementById('formStatus');
    const submitBtn = document.getElementById('submitBtn');
    form.addEventListener('submit', e => {
        e.preventDefault();
        let valid = true;
        form.querySelectorAll('[required]').forEach(input => {
            const field = input.closest('.field');
            const ok = input.value.trim() && (input.type !== 'email' || /^\S+@\S+\.\S+$/.test(input.value));
            field.classList.toggle('is-error', !ok);
            if (!ok) valid = false;
        });
        if (!valid) {
            status.textContent = 'Please fill in the highlighted fields correctly.';
            status.className = 'form-status is-err';
            gsap.fromTo(form, { x: -8 }, { x: 0, duration: .5, ease: 'elastic.out(1,.3)' });
            return;
        }
        const original = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.querySelector('.submit-text').textContent = 'Sending…';
        setTimeout(() => {
            submitBtn.classList.add('is-sent');
            submitBtn.innerHTML = '<span class="submit-text">Message Sent</span><i class="ri-check-line"></i>';
            status.textContent = 'Thanks! I will get back to you within 24 hours.';
            status.className = 'form-status is-ok';
            form.reset();
            setTimeout(() => {
                submitBtn.classList.remove('is-sent');
                submitBtn.disabled = false;
                submitBtn.innerHTML = original;
                status.textContent = '';
            }, 5000);
        }, 1200);
    });
    form.querySelectorAll('input, textarea').forEach(i =>
        i.addEventListener('input', () => i.closest('.field').classList.remove('is-error'))
    );

    /* ── Back to top ──────────────────────────── */
    document.getElementById('toTop').addEventListener('click', () => scrollToTarget(0));

    addEventListener('load', () => ScrollTrigger.refresh());
})();

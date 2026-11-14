// =====================================================
// PREMIUM SCROLL ANIMATION SYSTEM
// =====================================================

// --- Page routes ---
// --- Theme System ---
// Auto runs silently in the background:
// When the site is opened, it automatically selects Light mode in daytime (07:00–18:59)
// and Dark mode in the evening/night (19:00–06:59).
// Clicking the theme toggle or selecting Light/Dark directly switches the theme.
const THEME_SESSION_KEY = "portfolio-manual-theme";
const themeMeta = document.querySelector('meta[name="theme-color"]');

// Clean up legacy localStorage key if present
try { localStorage.removeItem("portfolio-theme-mode"); } catch (e) {}

function getAutoTheme() {
  const hour = new Date().getHours();
  return (hour >= 7 && hour < 19) ? "light" : "dark";
}

function getActiveTheme() {
  try {
    const manual = sessionStorage.getItem(THEME_SESSION_KEY);
    if (manual === "light" || manual === "dark") return manual;
  } catch (e) {}
  return getAutoTheme();
}

function applyTheme(theme) {
  const activeTheme = (theme === "light" || theme === "dark") ? theme : getAutoTheme();
  document.documentElement.dataset.theme = activeTheme;
  document.documentElement.dataset.themeMode = activeTheme;
  if (themeMeta) {
    themeMeta.setAttribute("content", activeTheme === "light" ? "#f5f2eb" : "#080b09");
  }

  document.querySelectorAll("[data-theme-toggle]").forEach((button) => {
    const isLight = activeTheme === "light";
    button.setAttribute("aria-label", isLight ? "Switch to dark theme" : "Switch to light theme");
    button.title = isLight ? "Theme: Light (click for Dark)" : "Theme: Dark (click for Light)";
    const label = button.querySelector(".theme-toggle-label");
    if (label) label.textContent = isLight ? "Light" : "Dark";
  });

  document.querySelectorAll("[data-theme-choice]").forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.themeChoice === activeTheme));
  });
}

function setTheme(theme) {
  if (theme !== "light" && theme !== "dark") return;
  try { sessionStorage.setItem(THEME_SESSION_KEY, theme); } catch (e) {}
  applyTheme(theme);
}

function toggleTheme() {
  const currentTheme = document.documentElement.dataset.theme === "light" ? "light" : "dark";
  const nextTheme = currentTheme === "light" ? "dark" : "light";
  setTheme(nextTheme);
}

applyTheme(getActiveTheme());

document.querySelectorAll("[data-theme-toggle]").forEach((button) => {
  button.addEventListener("click", toggleTheme);
});

document.querySelectorAll("[data-theme-choice]").forEach((button) => {
  button.addEventListener("click", () => setTheme(button.dataset.themeChoice));
});

// Auto theme runs in the background:
// If the user hasn't explicitly chosen a manual theme during this session, keep syncing with time
function syncAutoThemeInBackground() {
  try {
    const manual = sessionStorage.getItem(THEME_SESSION_KEY);
    if (!manual) {
      const autoTheme = getAutoTheme();
      if (document.documentElement.dataset.theme !== autoTheme) {
        applyTheme(autoTheme);
      }
    }
  } catch (e) {}
}

window.addEventListener("focus", syncAutoThemeInBackground);
document.addEventListener("visibilitychange", () => {
  if (!document.hidden) syncAutoThemeInBackground();
});
window.setInterval(syncAutoThemeInBackground, 60_000);

const pageRoutes = {
  home: { path: "/", title: "Thompson-dev1 | Full-Stack Developer" },
  work: { path: "/?page=work", title: "Works | Thompson — Full-Stack Developer" },
  playground: { path: "/?page=playground", title: "Playground | Thompson — Full-Stack Developer" },
  about: { path: "/?page=about", title: "About | Thompson — Full-Stack Developer" },
  contact: { path: "/?page=contact", title: "Contact | Thompson — Full-Stack Developer" },
};

function pageFromPath(pathname = window.location.pathname) {
  const queryPage = new URLSearchParams(window.location.search).get("page");
  if (queryPage && Object.hasOwn(pageRoutes, queryPage)) return queryPage;

  if (window.location.protocol === "file:") {
    const filePage = new URLSearchParams(window.location.search).get("page")
      || new URLSearchParams(window.location.hash.slice(1)).get("page");
    if (filePage && Object.hasOwn(pageRoutes, filePage)) return filePage;
  }
  const lastSegment = pathname.split("/").filter(Boolean).pop() || "home";
  return Object.hasOwn(pageRoutes, lastSegment) ? lastSegment : "home";
}

let activePage = pageFromPath();

function renderPage(route, { scrollTop = false, targetId = null, animate = false } = {}) {
  activePage = Object.hasOwn(pageRoutes, route) ? route : "home";
  document.body.dataset.activePage = activePage;
  document.title = pageRoutes[activePage].title;

  document.querySelectorAll("[data-route-page]").forEach((section) => {
    section.hidden = activePage !== "home" && section.dataset.routePage !== activePage;
  });

  document.querySelectorAll("[data-page-link]").forEach((link) => {
    const isCurrent = link.dataset.pageLink === activePage;
    if (isCurrent) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  });

  const main = document.querySelector("main");
  if (animate && main) {
    main.classList.remove("route-enter");
    void main.offsetWidth;
    main.classList.add("route-enter");
    window.setTimeout(() => main.classList.remove("route-enter"), 420);
  }

  if (targetId) {
    window.requestAnimationFrame(() => {
      const target = document.getElementById(targetId);
      if (target) target.scrollIntoView({ behavior: "auto", block: "start" });
    });
  } else if (scrollTop) {
    if (window.lenis) window.lenis.scrollTo(0, { immediate: true });
    else window.scrollTo(0, 0);
  }
}

function navigateToPage(route, { targetId = null, replace = false } = {}) {
  const nextRoute = Object.hasOwn(pageRoutes, route) ? route : "home";
  let nextUrl = pageRoutes[nextRoute].path;
  if (window.location.protocol === "file:") {
    const localUrl = new URL(window.location.href);
    localUrl.searchParams.delete("page");
    localUrl.hash = nextRoute === "home" ? "" : `page=${nextRoute}`;
    nextUrl = localUrl.href;
  }

  const currentUrl = window.location.protocol === "file:"
    ? window.location.href
    : `${window.location.pathname}${window.location.search}`;
  if (currentUrl !== nextUrl) {
    try {
      window.history[replace ? "replaceState" : "pushState"]({ page: nextRoute }, "", nextUrl);
    } catch (error) {
      // Local file previews can restrict History API changes; the page view still updates.
    }
  }
  closeSiteMenu({ restoreFocus: true });
  renderPage(nextRoute, { scrollTop: !targetId, targetId, animate: true });
}

function closeSiteMenu({ restoreFocus = false } = {}) {
  const menu = document.getElementById("mobileMenu");
  const toggle = document.getElementById("menuToggle");
  if (!menu || !toggle) return;
  toggle.setAttribute("aria-expanded", "false");
  toggle.setAttribute("aria-label", "Open menu");
  menu.classList.remove("active");
  menu.setAttribute("aria-hidden", "true");
  menu.inert = true;
  document.body.classList.remove("menu-open");
  if (restoreFocus) toggle.focus({ preventScroll: true });
}

renderPage(activePage);

document.querySelectorAll("[data-page-link]").forEach((link) => {
  link.addEventListener("click", (event) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    navigateToPage(link.dataset.pageLink);
  });
});

window.addEventListener("popstate", () => {
  closeSiteMenu();
  renderPage(pageFromPath(), { scrollTop: true, animate: true });
});

// Find each rendered text run instead of relying on a hand-maintained tag list.
// The word splitter below preserves the inline markup around these text nodes.
const revealRoots = [document.body].filter(Boolean);
const textOwners = new Set();

revealRoots.forEach((root) => {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    const textNode = walker.currentNode;
    const owner = textNode.parentElement;
    if (!textNode.nodeValue.trim() || !owner) continue;
    if (owner.closest(".hero, .intro-loader, svg, script, style, textarea, code, noscript, template, [aria-hidden=\"true\"], #consoleText")) continue;
    if (owner.closest("[data-word-reveal]")) continue;
    textOwners.add(owner);
  }
});

const elementDepth = (element) => {
  let depth = 0;
  for (let node = element; node && node !== document.body; node = node.parentElement) depth += 1;
  return depth;
};

Array.from(textOwners).sort((a, b) => elementDepth(a) - elementDepth(b)).forEach((element) => {
  if (element.closest("[data-word-reveal]")) return;
  element.removeAttribute("data-reveal");
  element.removeAttribute("data-reveal-left");
  element.removeAttribute("data-reveal-right");
  element.removeAttribute("data-reveal-scale");
  element.dataset.wordReveal = "";
});

document.querySelectorAll("[data-word-reveal]").forEach((element) => {
  if (element.dataset.wordRevealPrepared === "true") return;

  const compactCopy = element.matches("p, li, dt, dd, label, button, .page-scroll-cue, .eyebrow, .project-kicker, .experiment-tag, .experiment-link, .process-step, .project-number, .capability-list > *, .project-link, .intro-about-link, #consoleText, .site-footer a, .site-footer p");
  const delayStep = compactCopy ? 0.025 : 0.08;
  const maxDelay = compactCopy ? 0.45 : 0.8;
  let wordIndex = 0;
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
  const textNodes = [];

  while (walker.nextNode()) {
    const textNode = walker.currentNode;
    if (textNode.nodeValue.trim() && !textNode.parentElement.closest("svg, script, style, textarea, code")) {
      textNodes.push(textNode);
    }
  }

  textNodes.forEach((textNode) => {
    const fragment = document.createDocumentFragment();
    textNode.nodeValue.split(/(\s+)/).forEach((part) => {
      if (!part) return;
      if (/^\s+$/.test(part)) {
        fragment.appendChild(document.createTextNode(part));
        return;
      }

      const word = document.createElement("span");
      word.className = "word";
      word.style.transitionDelay = `${Math.min(wordIndex * delayStep, maxDelay)}s`;
      word.textContent = part;
      fragment.appendChild(word);
      wordIndex += 1;
    });
    textNode.parentNode.replaceChild(fragment, textNode);
  });

  element.dataset.wordRevealPrepared = "true";
});

// --- 2. Unified Scroll Reveal Observer ---
// Handles data-reveal, data-reveal-left, data-reveal-right, data-reveal-scale,
// data-stagger, data-line-draw, and data-word-reveal
const allRevealElements = document.querySelectorAll(
  "[data-reveal], [data-reveal-left], [data-reveal-right], [data-reveal-scale], [data-stagger], [data-line-draw], [data-word-reveal]"
);

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.08, rootMargin: "0px 0px -40px 0px" }
);

allRevealElements.forEach((item) => revealObserver.observe(item));

// Start fetching and decoding the About portrait while Process is approaching,
// so the image is ready before it enters the viewport.
const aboutPortrait = document.querySelector(".about-portrait");
const aboutProcessSection = document.getElementById("process");
if (aboutPortrait && aboutProcessSection && "IntersectionObserver" in window) {
  const portraitWarmupObserver = new IntersectionObserver((entries) => {
    if (entries.some((entry) => entry.isIntersecting)) {
      aboutPortrait.loading = "eager";
      aboutPortrait.decode?.().catch(() => {});
      portraitWarmupObserver.disconnect();
    }
  }, { rootMargin: "1200px 0px" });
  portraitWarmupObserver.observe(aboutProcessSection);
}

// --- 3. Parallax Depth on Scroll ---
// Elements with data-parallax="0.15" move at 15% of scroll speed
const parallaxElements = document.querySelectorAll("[data-parallax]");

if (parallaxElements.length > 0) {
  let ticking = false;

  const updateParallax = () => {
    const scrollY = window.scrollY;
    parallaxElements.forEach((el) => {
      const speed = parseFloat(el.getAttribute("data-parallax")) || 0.1;
      const yOffset = scrollY * speed;
      el.style.transform = `translateY(${yOffset}px) rotate(${scrollY * 0.008}deg)`;
    });
    ticking = false;
  };

  window.addEventListener("scroll", () => {
    if (!ticking) {
      requestAnimationFrame(updateParallax);
      ticking = true;
    }
  }, { passive: true });
}

// =====================================================
// Initialize smooth scrolling.
// =====================================================
const siteHeader = document.getElementById("siteHeader");
const scrollProgress = document.getElementById("scrollProgress");

let lenis = null;
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
if (typeof Lenis !== "undefined" && !prefersReducedMotion) {
  try {
    lenis = new Lenis({
      autoRaf: true,
      duration: 1.25,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 0.95,
      touchMultiplier: 1.15,
    });

    window.lenis = lenis;

    lenis.on("scroll", (e) => {
      const scrollTop = e.scroll;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      if (scrollProgress) {
        scrollProgress.style.width = `${progress}%`;
      }
      document.body.classList.toggle("scrolled", scrollTop > 80);
      if (siteHeader) {
        siteHeader.classList.toggle("scrolled", scrollTop > 80);
      }
    });
  } catch (err) {
    console.warn("Lenis fallback to native:", err);
  }
}

// Fallback native scroll listener if Lenis is unavailable
if (!lenis) {
  let scrollTicking = false;
  window.addEventListener("scroll", () => {
    if (!scrollTicking) {
      requestAnimationFrame(() => {
        const scrollTop = window.scrollY;
        document.body.classList.toggle("scrolled", scrollTop > 80);
        if (siteHeader) siteHeader.classList.toggle("scrolled", scrollTop > 80);
        if (scrollProgress) {
          const docHeight = document.documentElement.scrollHeight - window.innerHeight;
          const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
          scrollProgress.style.width = `${progress}%`;
        }
        scrollTicking = false;
      });
      scrollTicking = true;
    }
  }, { passive: true });
}

// Smooth-scroll anchor links.
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    const href = this.getAttribute("href");
    if (!href || href === "#") return;
    const target = document.querySelector(href);
    if (target) {
      const pageSection = target.closest("[data-route-page]");
      const targetPage = pageSection && pageSection.dataset.routePage;
      if (targetPage && activePage !== "home" && targetPage !== activePage) {
        e.preventDefault();
        navigateToPage(targetPage, { targetId: target.id || null });
        return;
      }

      e.preventDefault();
      if (window.lenis && !prefersReducedMotion) {
        window.lenis.scrollTo(target, {
          duration: 1.35,
          offset: -15,
          easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        });
      } else {
        target.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth" });
      }

      // Close mobile menu if open
      const mobileMenu = document.getElementById("mobileMenu");
      const menuToggle = document.getElementById("menuToggle");
      if (mobileMenu && mobileMenu.classList.contains("active")) {
        mobileMenu.classList.remove("active");
        mobileMenu.setAttribute("aria-hidden", "true");
        mobileMenu.inert = true;
        document.body.classList.remove("menu-open");
        document.body.style.overflow = "";
        if (menuToggle) {
          menuToggle.setAttribute("aria-expanded", "false");
          menuToggle.setAttribute("aria-label", "Open menu");
        }
      }
    }
  });
});

// --- 5. Number Count-Up Animation ---
// Elements with data-count-up="03" will count from 00 to 03 when visible
const countUpElements = document.querySelectorAll("[data-count-up]");

const countObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.getAttribute("data-count-up"), 10);
        let current = 0;
        const duration = 1200;
        const stepTime = duration / target;

        const counter = setInterval(() => {
          current++;
          el.textContent = String(current).padStart(2, "0");
          if (current >= target) clearInterval(counter);
        }, stepTime);

        countObserver.unobserve(el);
      }
    });
  },
  { threshold: 0.3 }
);

countUpElements.forEach((el) => countObserver.observe(el));

// =====================================================
// INTERACTIVE FEATURES (preserved from previous build)
// =====================================================

// --- Cosmic Rocket Custom Cursor System ---
const cursorRocket = document.querySelector(".cursor-rocket");
const cursorGlow = document.querySelector(".cursor-glow");

if (cursorRocket) {
  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let lastX = mouseX;
  let lastY = mouseY;
  let glowX = mouseX;
  let glowY = mouseY;
  let bankAngle = 0;
  let targetBank = 0;
  let isClicking = false;
  let lastSparkTime = 0;
  let hasMoved = false;

  // Stardust spark generator
  function spawnRocketSpark(x, y, count = 1) {
    for (let i = 0; i < count; i++) {
      const spark = document.createElement("div");
      spark.className = "cursor-spark";
      const size = Math.random() * 3.5 + 2;
      spark.style.width = `${size}px`;
      spark.style.height = `${size}px`;
      spark.style.left = `${x}px`;
      spark.style.top = `${y}px`;
      const driftX = (Math.random() - 0.2) * 22 + 8;
      const driftY = (Math.random() - 0.2) * 22 + 8;
      spark.style.setProperty("--drift-x", `${driftX}px`);
      spark.style.setProperty("--drift-y", `${driftY}px`);
      document.body.appendChild(spark);
      setTimeout(() => spark.remove(), 550);
    }
  }

  window.addEventListener("pointermove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    if (!hasMoved) {
      hasMoved = true;
      lastX = mouseX;
      lastY = mouseY;
      glowX = mouseX;
      glowY = mouseY;
    }
  });

  window.addEventListener("mousedown", () => {
    isClicking = true;
    spawnRocketSpark(mouseX + 22, mouseY + 22, 5);
  });

  window.addEventListener("mouseup", () => {
    isClicking = false;
  });

  document.addEventListener("mouseleave", () => {
    cursorRocket.style.opacity = "0";
    if (cursorGlow) cursorGlow.style.opacity = "0";
  });

  document.addEventListener("mouseenter", () => {
    cursorRocket.style.opacity = "1";
    if (cursorGlow) cursorGlow.style.opacity = "0.14";
  });

  // Event delegation for interactive hover states
  document.addEventListener("mouseover", (e) => {
    if (e.target && e.target.closest("a, button, [data-command], .magnetic, .pill, input[type='submit'], .cd-cell")) {
      document.body.classList.add("cursor-hover");
    } else {
      document.body.classList.remove("cursor-hover");
    }
  });

  // Flight animation loop with dynamic banking & thruster trail
  const animateRocket = () => {
    const vx = mouseX - lastX;
    const vy = mouseY - lastY;
    const speed = Math.hypot(vx, vy);

    // Aerodynamic banking: tilts into turns
    targetBank = Math.max(-18, Math.min(18, vx * 0.7 - vy * 0.15));
    bankAngle += (targetBank - bankAngle) * 0.18;

    // Smooth lerp for ambient nebula glow
    glowX += (mouseX - glowX) * 0.08;
    glowY += (mouseY - glowY) * 0.08;
    if (cursorGlow) {
      cursorGlow.style.left = `${glowX}px`;
      cursorGlow.style.top = `${glowY}px`;
    }

    // Rocket positioning: tip is at mouseX, mouseY
    const isHovered = document.body.classList.contains("cursor-hover");
    const scale = isClicking ? 0.88 : (isHovered ? 1.18 : 1);
    cursorRocket.style.left = `${mouseX - 3}px`;
    cursorRocket.style.top = `${mouseY - 3}px`;
    cursorRocket.style.transform = `rotate(${bankAngle}deg) scale(${scale})`;

    // Exhaust stardust sparks when cruising
    const now = performance.now();
    if (speed > 2.5 && now - lastSparkTime > 30) {
      lastSparkTime = now;
      spawnRocketSpark(mouseX + 22, mouseY + 22, 1);
    }

    lastX = mouseX;
    lastY = mouseY;
    requestAnimationFrame(animateRocket);
  };
  requestAnimationFrame(animateRocket);
}

// =====================================================
// Add click feedback to interactive elements.
// =====================================================
document.addEventListener("pointerdown", (e) => {
  const interactive = e.target.closest(
    "a, button, .button, .cta, .nav-cta, .nav-link, .mobile-link, .project-card, .filter-pill, .meta-card, .cd-cell, .social-link, .back-to-top"
  );
  if (interactive) {
    interactive.classList.add("is-pressed");

    // Spawn tactile crimson shockwave ripple
    const ripple = document.createElement("span");
    ripple.className = "click-ripple";
    ripple.style.left = `${e.clientX}px`;
    ripple.style.top = `${e.clientY}px`;
    document.body.appendChild(ripple);

    setTimeout(() => {
      ripple.remove();
    }, 600);
  }
});

const releasePressed = () => {
  document.querySelectorAll(".is-pressed").forEach((el) => {
    el.classList.remove("is-pressed");
  });
};

document.addEventListener("pointerup", releasePressed);
document.addEventListener("pointercancel", releasePressed);

// Add pointer-following motion to selected elements.
const magneticElements = document.querySelectorAll(".magnetic, .nav-cta, .cta, .back-to-top, .mobile-menu-toggle");
magneticElements.forEach((el) => {
  let bounds = null;
  let isHovered = false;
  let targetX = 0, targetY = 0;
  let curX = 0, curY = 0;
  let rafId = null;

  const updatePosition = () => {
    if (!isHovered && Math.abs(curX) < 0.1 && Math.abs(curY) < 0.1) {
      el.style.transform = "";
      const inner = el.querySelector("span, svg");
      if (inner) inner.style.transform = "";
      cancelAnimationFrame(rafId);
      rafId = null;
      return;
    }

    const factor = isHovered ? 0.22 : 0.12;
    curX += (targetX - curX) * factor;
    curY += (targetY - curY) * factor;

    el.style.transform = `translate3d(${curX.toFixed(2)}px, ${curY.toFixed(2)}px, 0)`;
    const inner = el.querySelector("span, svg");
    if (inner) {
      inner.style.transform = `translate3d(${(curX * 0.35).toFixed(2)}px, ${(curY * 0.35).toFixed(2)}px, 0)`;
    }

    rafId = requestAnimationFrame(updatePosition);
  };

  el.addEventListener("mouseenter", () => {
    bounds = el.getBoundingClientRect();
    isHovered = true;
    if (!rafId) rafId = requestAnimationFrame(updatePosition);
  });

  el.addEventListener("mousemove", (e) => {
    if (!bounds) bounds = el.getBoundingClientRect();
    const x = e.clientX - bounds.left - bounds.width / 2;
    const y = e.clientY - bounds.top - bounds.height / 2;
    targetX = x * 0.32;
    targetY = y * 0.32;
    if (!rafId) rafId = requestAnimationFrame(updatePosition);
  });

  el.addEventListener("mouseleave", () => {
    isHovered = false;
    targetX = 0;
    targetY = 0;
    if (!rafId) rafId = requestAnimationFrame(updatePosition);
  });
});

// --- Editorial First-Load Reveal ---
const pageSkeleton = document.getElementById("pageSkeleton");

if (pageSkeleton) {
  let isDismissed = false;
  let isReady = false;
  const loaderPercent = document.getElementById("loaderPercent");
  const loaderProgress = document.getElementById("loaderProgress");
  const startTime = performance.now();
  let progress = 0;
  const paintProgress = (value) => {
    progress = Math.max(0, Math.min(100, value));
    if (loaderPercent) loaderPercent.textContent = `${Math.round(progress).toString().padStart(2, "0")}%`;
    if (loaderProgress) loaderProgress.style.width = `${progress}%`;
  };
  const progressInterval = setInterval(() => {
    if (isDismissed) {
      clearInterval(progressInterval);
      return;
    }
    const ceiling = isReady ? 96 : 92;
    paintProgress(Math.min(ceiling, progress + Math.max(0.2, (ceiling - progress) * 0.2)));
  }, 50);

  const dismissSkeleton = () => {
    if (isDismissed) return;
    isDismissed = true;
    clearInterval(progressInterval);
    paintProgress(100);
    pageSkeleton.classList.add("is-complete");
    setTimeout(() => {
      pageSkeleton.classList.add("fade-out");
      const siteHeader = document.querySelector(".site-header");
      if (siteHeader) siteHeader.classList.add("loader-header-enter");
      const entranceItems = [
        [document.querySelector(".hero-nebula"), 1],
        [document.querySelector(".hero-planet-horizon"), 2],
        [document.querySelector(".hero-figure-wrap"), 2],
        [document.querySelector(".content"), 3]
      ];
      entranceItems.forEach(([element, order]) => {
        if (!element) return;
        element.classList.add("entrance-reveal");
        element.dataset.entranceOrder = order;
      });
      document.body.classList.remove("is-loading");
      document.body.classList.add("hero-revealed");
      initWordReveal();
      initCounterAnimation();
      setTimeout(() => pageSkeleton.remove(), 320);
    }, 1550);
  };

  // Check if critical hero image is loaded or if page is already complete
  const heroImg = document.querySelector(".hero-cutout-img");
  const minDisplayTime = 780; // keep the dark silhouette visible through 100%

  const handleReady = () => {
    if (isReady) return;
    isReady = true;
    const elapsed = performance.now() - startTime;
    const remaining = Math.max(0, minDisplayTime - elapsed);
    setTimeout(dismissSkeleton, remaining);
  };

  if (heroImg && !heroImg.complete) {
    heroImg.addEventListener("load", handleReady, { once: true });
    heroImg.addEventListener("error", handleReady, { once: true });
  }

  if (document.readyState === "complete") {
    handleReady();
  } else {
    window.addEventListener("load", handleReady, { once: true });
  }

  // Safety fallback so skeleton never hangs indefinitely
  setTimeout(dismissSkeleton, 2200);
} else {
  // No skeleton element — trigger hero entrance immediately
  document.body.classList.remove("is-loading");
  setTimeout(() => {
    document.body.classList.add("hero-revealed");
    initWordReveal();
    initCounterAnimation();
  }, 100);
}

// --- Floating Navigation Dots / Section Tracker ---
const sections = document.querySelectorAll("section[data-section]");
const indicatorDots = document.querySelectorAll(".indicator-dot");

function updateActiveSection() {
  let currentSection = "hero";
  const scrollPosition = window.scrollY + window.innerHeight / 3;

  sections.forEach((section) => {
    const top = section.offsetTop;
    const height = section.offsetHeight;
    if (scrollPosition >= top && scrollPosition < top + height) {
      currentSection = section.getAttribute("data-section");
    }
  });

  indicatorDots.forEach((dot) => {
    if (dot.getAttribute("data-section") === currentSection) {
      dot.classList.add("active");
    } else {
      dot.classList.remove("active");
    }
  });

  // Persist current active section so refreshes show matching skeleton
  try {
    sessionStorage.setItem("lastActiveSection", currentSection);
  } catch (e) {}
}

window.addEventListener("scroll", updateActiveSection, { passive: true });

// Track section navigation clicks
document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", () => {
    const target = link.getAttribute("href").replace("#", "");
    const sec = target === "top" ? "hero" : target;
    if (["hero", "work", "experiments", "process", "about", "contact"].includes(sec)) {
      try {
        sessionStorage.setItem("lastActiveSection", sec);
      } catch (e) {}
    }
  });
});

window.addEventListener("beforeunload", updateActiveSection);

// --- Signature Interactive Terminal Console ---
const commandResponses = {
  projects: "Voima supports sickle cell care, Agric DSS connects agricultural trade, CalorieAI streamlines nutrition, Model Portfolio brings editorial storytelling, and SME Analytics surfaces small-business social insights.",
  stack: "Highly proficient in Python, Flask, PHP, SQLite, Next.js, React, Tailwind CSS, GSAP, and advanced UI/UX motion design.",
  process: "Structured methodology: 1. Map real-world workflow limits -> 2. Engineer core database & routes -> 3. Elevate UI clarity -> 4. Ship detailed case studies.",
  contact: "I am actively open to contract product roles, full-stack systems engineering, and custom web applications. Let's make something exceptional."
};

const consoleText = document.querySelector("#consoleText");
const commandButtons = document.querySelectorAll("[data-command]");
let isTyping = false;

commandButtons.forEach((button) => {
  button.addEventListener("click", () => {
    if (isTyping) return;

    const command = button.dataset.command;
    const response = commandResponses[command];
    if (!response || !consoleText) return;

    isTyping = true;
    consoleText.textContent = "";

    let index = 0;
    const typeWriter = () => {
      consoleText.textContent = response.slice(0, index);
      index++;

      if (index <= response.length) {
        setTimeout(typeWriter, 12);
      } else {
        isTyping = false;
      }
    };

    typeWriter();
  });
});

// --- Compact Site Menu ---
const menuToggle = document.getElementById("menuToggle");
const mobileMenu = document.getElementById("mobileMenu");
const menuClose = document.getElementById("menuClose");
const mobileLinks = document.querySelectorAll(".mobile-link");

if (menuToggle && mobileMenu) {
  const closeMenu = ({ restoreFocus = false } = {}) => {
    closeSiteMenu({ restoreFocus });
  };

  const toggleMenu = () => {
    const isExpanded = menuToggle.getAttribute("aria-expanded") === "true";
    if (isExpanded) {
      closeMenu();
      return;
    }
    menuToggle.setAttribute("aria-expanded", !isExpanded);
    menuToggle.setAttribute("aria-label", "Close menu");
    mobileMenu.classList.add("active");
    mobileMenu.setAttribute("aria-hidden", "false");
    mobileMenu.inert = false;
    const firstLink = mobileMenu.querySelector(".mobile-link");
    if (firstLink) firstLink.focus({ preventScroll: true });
  };

  menuToggle.addEventListener("click", toggleMenu);
  if (menuClose) menuClose.addEventListener("click", () => closeMenu({ restoreFocus: true }));

  mobileLinks.forEach((link) => {
    link.addEventListener("click", () => {
      closeMenu({ restoreFocus: true });
    });
  });

  document.addEventListener("pointerdown", (event) => {
    if (menuToggle.getAttribute("aria-expanded") !== "true") return;
    if (!mobileMenu.contains(event.target) && !menuToggle.contains(event.target)) closeMenu();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && menuToggle.getAttribute("aria-expanded") === "true") {
      closeMenu({ restoreFocus: true });
    }
  });
}

// --- Image Skeleton Loading ---
// Adds 'loaded' class to images and parent wrappers once loaded for smooth fade-in
document.querySelectorAll(".project-visual img, .experiment-img-wrap img").forEach((img) => {
  const markLoaded = () => {
    img.classList.add("loaded");
    if (img.parentElement) {
      img.parentElement.classList.add("loaded");
    }
  };

  if (img.complete) {
    markLoaded();
  } else {
    img.addEventListener("load", markLoaded, { once: true });
    img.addEventListener("error", markLoaded, { once: true });
  }
});

// --- Contact Form Submission ---
const contactForm = document.getElementById("contactForm");

if (contactForm) {
  contactForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const submitBtn = contactForm.querySelector(".form-submit span");
    const originalText = submitBtn.textContent;
    submitBtn.textContent = "Sending...";

    try {
      const response = await fetch(contactForm.action, {
        method: "POST",
        body: new FormData(contactForm),
        headers: { Accept: "application/json" },
      });

      if (response.ok) {
        submitBtn.textContent = "Sent! ✓";
        contactForm.reset();
        setTimeout(() => {
          submitBtn.textContent = originalText;
        }, 3000);
      } else {
        submitBtn.textContent = "Error — try email";
        setTimeout(() => {
          submitBtn.textContent = originalText;
        }, 3000);
      }
    } catch {
      submitBtn.textContent = "Error — try email";
      setTimeout(() => {
        submitBtn.textContent = originalText;
      }, 3000);
    }
  });
}

// =====================================================
// ORIGINKIT: ASCII REVEAL COMPONENT ENGINE
// =====================================================
function initAsciiReveal() {
  const canvas = document.getElementById("asciiRevealCanvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const DEFAULTS = {
    fit: "cover",
    focusY: 25,
    columns: 140,
    ramp: ".:-=+*#%@",
    invert: false,
    contrast: 110,
    colorMode: "image",
    inkColor: "#FFFFFF",
    reveal: true,
    revealOptions: { size: 85, softness: 16 }
  };

  const contrastAt = (val) => 0.5 + (val / 100) * 2;
  const clampFocus = (val) => Math.min(100, Math.max(0, typeof val === "number" ? val : 50));

  function placeRect(imgW, imgH, boxW, boxH, fit, focusY) {
    const scale = fit === "contain"
      ? Math.min(boxW / imgW, boxH / imgH)
      : Math.max(boxW / imgW, boxH / imgH);
    const dw = imgW * scale;
    const dh = imgH * scale;
    const f = fit === "cover" ? clampFocus(focusY) / 100 : 0.5;
    return { dx: (boxW - dw) / 2, dy: (boxH - dh) * f, dw, dh };
  }

  let off = null;
  let sampler = null;
  let imgRef = null;
  let revealCanvas = null;
  let maskCanvas = null;
  const BLOB_COUNT = 5;
  let blobs = Array.from({ length: BLOB_COUNT }, () => ({ x: 0, y: 0 }));
  let seeded = false;
  let pointer = { x: 300, y: 180, inside: true };
  let coverRect = { dx: 0, dy: 0, dw: 0, dh: 0 };
  let alive = true;
  let raf = 0;

  function getSize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = canvas.clientWidth || 600;
    const h = canvas.clientHeight || 360;
    return { w, h, dpr };
  }

  function buildAscii() {
    const img = imgRef;
    if (!img) return;
    const { w, h, dpr } = getSize();
    canvas.width = Math.max(1, Math.round(w * dpr));
    canvas.height = Math.max(1, Math.round(h * dpr));

    const cols = Math.max(8, Math.round(DEFAULTS.columns));
    const cellW = (w * dpr) / cols;
    const fontPx = cellW * 1.7;
    const cellH = fontPx;
    const rows = Math.max(1, Math.floor((h * dpr) / cellH));

    if (!sampler) {
      sampler = document.createElement("canvas");
    }
    sampler.width = cols;
    sampler.height = rows;
    const sctx = sampler.getContext("2d", { willReadFrequently: true });
    if (!sctx) return;

    const imgW = img.naturalWidth || img.width || 1200;
    const imgH = img.naturalHeight || img.height || 630;

    const place = placeRect(imgW, imgH, canvas.width, canvas.height, DEFAULTS.fit, DEFAULTS.focusY);
    sctx.clearRect(0, 0, cols, rows);
    sctx.drawImage(img, place.dx / cellW, place.dy / cellH, place.dw / cellW, place.dh / cellH);

    let data;
    try {
      data = sctx.getImageData(0, 0, cols, rows).data;
    } catch (e) {
      return;
    }

    if (!off) {
      off = document.createElement("canvas");
    }
    off.width = canvas.width;
    off.height = canvas.height;
    const octx = off.getContext("2d");
    if (!octx) return;

    octx.clearRect(0, 0, off.width, off.height);
    octx.font = fontPx.toFixed(2) + "px ui-monospace, monospace";
    octx.textBaseline = "top";

    const punch = contrastAt(DEFAULTS.contrast);
    const chars = DEFAULTS.ramp;
    const last = chars.length - 1;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const i = (r * cols + c) * 4;
        const rr = data[i];
        const gg = data[i + 1];
        const bb = data[i + 2];
        let lum = (0.299 * rr + 0.587 * gg + 0.114 * bb) / 255;
        lum = (lum - 0.5) * punch + 0.5;
        if (DEFAULTS.invert) lum = 1 - lum;
        lum = lum < 0 ? 0 : lum > 1 ? 1 : lum;
        const ch = chars[Math.round(lum * last)];
        
        octx.fillStyle = DEFAULTS.colorMode === "image"
          ? `rgb(${Math.min(255, rr + 30)}, ${Math.min(255, gg + 30)}, ${Math.min(255, bb + 30)})`
          : DEFAULTS.inkColor;
        octx.fillText(ch, c * cellW, r * cellH);
      }
    }

    coverRect = place;
  }

  function ensureLayer(layer) {
    if (!layer) {
      layer = document.createElement("canvas");
    }
    if (layer.width !== canvas.width || layer.height !== canvas.height) {
      layer.width = canvas.width;
      layer.height = canvas.height;
    }
    return layer;
  }

  function updateBlobs() {
    if (blobs.length === 0) return;
    const { dpr } = getSize();
    const tx = pointer.x * dpr;
    const ty = pointer.y * dpr;
    if (!seeded) {
      for (const blob of blobs) {
        blob.x = tx;
        blob.y = ty;
      }
      seeded = true;
      return;
    }
    blobs[0].x += (tx - blobs[0].x) * 0.35;
    blobs[0].y += (ty - blobs[0].y) * 0.35;
    for (let i = 1; i < blobs.length; i++) {
      blobs[i].x += (blobs[i - 1].x - blobs[i].x) * 0.35;
      blobs[i].y += (blobs[i - 1].y - blobs[i].y) * 0.35;
    }
  }

  function paint() {
    if (!off) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(off, 0, 0);

    const img = imgRef;
    if (!DEFAULTS.reveal || !pointer.inside || !img) return;

    const { dpr } = getSize();
    revealCanvas = ensureLayer(revealCanvas);
    maskCanvas = ensureLayer(maskCanvas);
    const pctx = revealCanvas.getContext("2d");
    const mctx = maskCanvas.getContext("2d");
    if (!pctx || !mctx) return;

    pctx.globalCompositeOperation = "source-over";
    pctx.clearRect(0, 0, revealCanvas.width, revealCanvas.height);
    pctx.drawImage(img, coverRect.dx, coverRect.dy, coverRect.dw, coverRect.dh);

    mctx.clearRect(0, 0, maskCanvas.width, maskCanvas.height);
    mctx.save();
    mctx.filter = `blur(${(DEFAULTS.revealOptions.softness * dpr).toFixed(1)}px)`;
    mctx.fillStyle = "#FFFFFF";
    for (let i = 0; i < blobs.length; i++) {
      const t = blobs.length <= 1 ? 0 : i / (blobs.length - 1);
      const radius = DEFAULTS.revealOptions.size * dpr * (1 - t * 0.5);
      mctx.beginPath();
      mctx.arc(blobs[i].x, blobs[i].y, radius, 0, Math.PI * 2);
      mctx.fill();
    }
    mctx.restore();

    pctx.globalCompositeOperation = "destination-in";
    pctx.drawImage(maskCanvas, 0, 0);
    pctx.globalCompositeOperation = "source-over";
    ctx.drawImage(revealCanvas, 0, 0);
  }

  function loop() {
    if (!alive) return;
    updateBlobs();
    paint();
    raf = requestAnimationFrame(loop);
  }

  function onMove(event) {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    pointer.x = x;
    pointer.y = y;
    pointer.inside = true;
  }

  function onLeave() {
    const rect = canvas.getBoundingClientRect();
    pointer.x = rect.width / 2;
    pointer.y = rect.height / 2;
  }

  const img = new Image();
  img.onload = () => {
    if (!alive) return;
    imgRef = img;
    const rect = canvas.getBoundingClientRect();
    pointer.x = (rect.width || 600) / 2;
    pointer.y = (rect.height || 360) / 2;
    buildAscii();
    paint();
    if (DEFAULTS.reveal) raf = requestAnimationFrame(loop);
  };
  img.src = "assets/screenshots/portrait-full.jpg";

  if (typeof ResizeObserver !== "undefined") {
    const ro = new ResizeObserver(() => {
      buildAscii();
      paint();
    });
    ro.observe(canvas);
  }

  canvas.addEventListener("pointermove", onMove);
  canvas.addEventListener("pointerleave", onLeave);
}

// =====================================================
// ORIGINKIT: LIQUID DISTORTION (WEBGL FLUID ENGINE)
// =====================================================
function initLiquidHover() {
  const container = document.querySelector(".canvas-body");
  const canvas = document.getElementById("liquidCanvas");
  if (!canvas || !container) return;

  const glMaybe = canvas.getContext("webgl", { alpha: true });
  if (!glMaybe) return;
  const gl = glMaybe;

  gl.getExtension("OES_texture_float");
  gl.getExtension("OES_texture_float_linear");
  gl.clearColor(0, 0, 0, 0);

  const imageSrc = "assets/screenshots/portrait-full.jpg";
  const resolution = 10;
  const cursorSize = 50;
  const intensity = 50;

  const cp = intensity / 100;
  const params = {
    cursorRadiusPx: cursorSize,
    cursorPower: 5 + ((cp - 0.1) * (50 - 5)) / (1 - 0.1),
    distortionPower: intensity / 100,
  };
  const overscanFactor = 1.0;
  const innerScale = 1.0;
  const pointer = {
    x: 0.5 * container.clientWidth,
    y: 0.5 * container.clientHeight,
    dx: 0,
    dy: 0,
    moved: true,
  };
  const res = { w: 0, h: 0 };
  let outputColor;
  let velocity;
  let divergence;
  let pressure;
  let imageTexture = null;
  let imgRatio = 1;
  let isHovering = true;
  let rafId = null;

  const VERT = `
precision highp float;
varying vec2 vUv;
attribute vec2 a_position;
varying vec2 vL;
varying vec2 vR;
varying vec2 vT;
varying vec2 vB;
uniform vec2 u_texel;

void main () {
  vUv = .5 * (a_position + 1.);
  vL = vUv - vec2(u_texel.x, 0.);
  vR = vUv + vec2(u_texel.x, 0.);
  vT = vUv + vec2(0., u_texel.y);
  vB = vUv - vec2(0., u_texel.y);
  gl_Position = vec4(a_position, 0., 1.);
}
`;

  const FRAG_ADVECT = `
precision highp float;
precision highp sampler2D;
varying vec2 vUv;
uniform sampler2D u_velocity_texture;
uniform sampler2D u_input_texture;
uniform vec2 u_texel;
uniform vec2 u_output_textel;
uniform float u_dt;
uniform float u_dissipation;

vec4 bilerp (sampler2D sam, vec2 uv, vec2 tsize) {
  vec2 st = uv / tsize - 0.5;
  vec2 iuv = floor(st);
  vec2 fuv = fract(st);
  vec4 a = texture2D(sam, (iuv + vec2(0.5, 0.5)) * tsize);
  vec4 b = texture2D(sam, (iuv + vec2(1.5, 0.5)) * tsize);
  vec4 c = texture2D(sam, (iuv + vec2(0.5, 1.5)) * tsize);
  vec4 d = texture2D(sam, (iuv + vec2(1.5, 1.5)) * tsize);
  return mix(mix(a, b, fuv.x), mix(c, d, fuv.x), fuv.y);
}

void main () {
  vec2 coord = vUv - u_dt * bilerp(u_velocity_texture, vUv, u_texel).xy * u_texel;
  vec4 velocity = bilerp(u_input_texture, coord, u_output_textel);
  gl_FragColor = u_dissipation * velocity;
}
`;

  const FRAG_DIVERGENCE = `
precision highp float;
precision highp sampler2D;
varying highp vec2 vUv;
varying highp vec2 vL;
varying highp vec2 vR;
varying highp vec2 vT;
varying highp vec2 vB;
uniform sampler2D u_velocity_texture;

void main () {
  float L = texture2D(u_velocity_texture, vL).x;
  float R = texture2D(u_velocity_texture, vR).x;
  float T = texture2D(u_velocity_texture, vT).y;
  float B = texture2D(u_velocity_texture, vB).y;
  float div = .25 * (R - L + T - B);
  gl_FragColor = vec4(div, 0., 0., 1.);
}
`;

  const FRAG_PRESSURE = `
precision highp float;
precision highp sampler2D;
varying highp vec2 vUv;
varying highp vec2 vL;
varying highp vec2 vR;
varying highp vec2 vT;
varying highp vec2 vB;
uniform sampler2D u_pressure_texture;
uniform sampler2D u_divergence_texture;

void main () {
  float L = texture2D(u_pressure_texture, vL).x;
  float R = texture2D(u_pressure_texture, vR).x;
  float T = texture2D(u_pressure_texture, vT).x;
  float B = texture2D(u_pressure_texture, vB).x;
  float divergence = texture2D(u_divergence_texture, vUv).x;
  float pressure = (L + R + B + T - divergence) * .25;
  gl_FragColor = vec4(pressure, 0., 0., 1.);
}
`;

  const FRAG_GRAD_SUB = `
precision highp float;
precision highp sampler2D;
varying highp vec2 vUv;
varying highp vec2 vL;
varying highp vec2 vR;
varying highp vec2 vT;
varying highp vec2 vB;
uniform sampler2D u_pressure_texture;
uniform sampler2D u_velocity_texture;

void main () {
  float L = texture2D(u_pressure_texture, vL).x;
  float R = texture2D(u_pressure_texture, vR).x;
  float T = texture2D(u_pressure_texture, vT).x;
  float B = texture2D(u_pressure_texture, vB).x;
  vec2 velocity = texture2D(u_velocity_texture, vUv).xy;
  velocity.xy -= vec2(R - L, T - B);
  gl_FragColor = vec4(velocity, 0., 1.);
}
`;

  const FRAG_POINT = `
precision highp float;
precision highp sampler2D;
varying vec2 vUv;
uniform sampler2D u_input_texture;
uniform float u_ratio;
uniform float u_img_ratio;
uniform vec3 u_point_value;
uniform vec2 u_point;
uniform float u_point_size;

void main () {
  vec2 p = vUv - u_point.xy;
  p.x *= u_ratio;
  vec3 splat = .6 * pow(2., -dot(p, p) / u_point_size) * u_point_value;
  vec3 base = texture2D(u_input_texture, vUv).xyz;
  gl_FragColor = vec4(base + splat, 1.);
}
`;

  const FRAG_OUTPUT = `
precision highp float;
precision highp sampler2D;
varying vec2 vUv;
uniform float u_ratio;
uniform float u_img_ratio;
uniform float u_disturb_power;
uniform sampler2D u_output_texture;
uniform sampler2D u_velocity_texture;
uniform sampler2D u_text_texture;
uniform vec2 u_point;
uniform float u_canvas_scale;
uniform float u_inner_scale;

vec2 get_img_uv() {
  vec2 uv = vUv - 0.5;
  uv *= u_canvas_scale;
  uv /= u_inner_scale;

  float containerAspect = u_ratio;
  float imageAspect = u_img_ratio;
  vec2 scale = vec2(1.0);
  if (containerAspect > imageAspect) {
    scale.y = imageAspect / containerAspect;
  } else {
    scale.x = containerAspect / imageAspect;
  }
  uv *= scale;
  if (containerAspect > 1.1) {
    uv.x -= 0.14;
  }
  return uv + 0.5;
}

vec2 get_frame_uv() {
  vec2 uv = vUv - 0.5;
  uv *= u_canvas_scale;
  uv /= u_inner_scale;
  return uv + 0.5;
}

float get_img_frame_alpha(vec2 uv, float img_frame_width) {
  float img_frame_alpha = smoothstep(0., img_frame_width, uv.x) * smoothstep(1., 1. - img_frame_width, uv.x);
  img_frame_alpha *= smoothstep(0., img_frame_width, uv.y) * smoothstep(1., 1. - img_frame_width, uv.y);
  return img_frame_alpha;
}

vec3 sample_image_smooth(vec2 uv) {
  vec2 uvc = clamp(uv, 0.0, 1.0);
  vec3 base = texture2D(u_text_texture, vec2(uvc.x, 1.0 - uvc.y)).rgb;

  float yBelow = step(uv.y, 0.0);
  float yAbove = step(1.0, uv.y);
  float xLeft = step(uv.x, 0.0);
  float xRight = step(1.0, uv.x);
  float outOfBounds = max(max(yBelow, yAbove), max(xLeft, xRight));

  if (outOfBounds > 0.0) {
    float d = 0.002;
    vec3 sum = vec3(0.0);
    sum += texture2D(u_text_texture, vec2(clamp(uvc.x - d, 0.0, 1.0), 1.0 - clamp(uvc.y - d, 0.0, 1.0))).rgb;
    sum += texture2D(u_text_texture, vec2(clamp(uvc.x, 0.0, 1.0), 1.0 - clamp(uvc.y - d, 0.0, 1.0))).rgb;
    sum += texture2D(u_text_texture, vec2(clamp(uvc.x + d, 0.0, 1.0), 1.0 - clamp(uvc.y - d, 0.0, 1.0))).rgb;
    sum += texture2D(u_text_texture, vec2(clamp(uvc.x - d, 0.0, 1.0), 1.0 - clamp(uvc.y, 0.0, 1.0))).rgb;
    sum += texture2D(u_text_texture, vec2(clamp(uvc.x, 0.0, 1.0), 1.0 - clamp(uvc.y, 0.0, 1.0))).rgb;
    sum += texture2D(u_text_texture, vec2(clamp(uvc.x + d, 0.0, 1.0), 1.0 - clamp(uvc.y, 0.0, 1.0))).rgb;
    sum += texture2D(u_text_texture, vec2(clamp(uvc.x - d, 0.0, 1.0), 1.0 - clamp(uvc.y + d, 0.0, 1.0))).rgb;
    sum += texture2D(u_text_texture, vec2(clamp(uvc.x, 0.0, 1.0), 1.0 - clamp(uvc.y + d, 0.0, 1.0))).rgb;
    sum += texture2D(u_text_texture, vec2(clamp(uvc.x + d, 0.0, 1.0), 1.0 - clamp(uvc.y + d, 0.0, 1.0))).rgb;
    base = sum / 9.0;
  }
  return base;
}

void main () {
  float offset = texture2D(u_output_texture, vUv).r;

  vec2 velocity = texture2D(u_velocity_texture, vUv).xy;
  velocity += .001;

  vec2 img_uv = get_img_uv();
  img_uv -= u_disturb_power * normalize(velocity) * offset;

  vec3 img = sample_image_smooth(img_uv);
  gl_FragColor = vec4(img, 1.0);
}
`;

  function createShader(source, type) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      const info = gl.getShaderInfoLog(shader) || "Shader compile error";
      gl.deleteShader(shader);
      throw new Error(info);
    }
    return shader;
  }

  function createProgramFromSources(vsSource, fsSource) {
    const program = gl.createProgram();
    const vs = createShader(vsSource, gl.VERTEX_SHADER);
    const fs = createShader(fsSource, gl.FRAGMENT_SHADER);
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.bindAttribLocation(program, 0, "a_position");
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      const info = gl.getProgramInfoLog(program) || "Program link error";
      throw new Error(info);
    }
    const uniforms = {};
    const uniformCount = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
    for (let i = 0; i < uniformCount; i++) {
      const active = gl.getActiveUniform(program, i);
      if (!active) continue;
      uniforms[active.name] = gl.getUniformLocation(program, active.name);
    }
    return { program, uniforms };
  }

  function blit(target = null) {
    const vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, -1, 1, 1, 1, 1, -1]), gl.STATIC_DRAW);
    const ebo = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ebo);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([0, 1, 2, 0, 2, 3]), gl.STATIC_DRAW);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(0);
    if (target == null) {
      gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    } else {
      gl.viewport(0, 0, target.width, target.height);
      gl.bindFramebuffer(gl.FRAMEBUFFER, target.fbo);
    }
    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
  }

  function createFBO(w, h) {
    gl.activeTexture(gl.TEXTURE0);
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, w, h, 0, gl.RGB, gl.FLOAT, null);
    const fbo = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
    gl.viewport(0, 0, w, h);
    gl.clear(gl.COLOR_BUFFER_BIT);
    return {
      fbo,
      width: w,
      height: h,
      attach(id) {
        gl.activeTexture(gl.TEXTURE0 + id);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        return id;
      },
    };
  }

  function createDoubleFBO(w, h) {
    let fbo1 = createFBO(w, h);
    let fbo2 = createFBO(w, h);
    return {
      width: w,
      height: h,
      texelSizeX: 1 / w,
      texelSizeY: 1 / h,
      read: () => fbo1,
      write: () => fbo2,
      swap() {
        const tmp = fbo1;
        fbo1 = fbo2;
        fbo2 = tmp;
      },
    };
  }

  const splatProgram = createProgramFromSources(VERT, FRAG_POINT);
  const divergenceProgram = createProgramFromSources(VERT, FRAG_DIVERGENCE);
  const pressureProgram = createProgramFromSources(VERT, FRAG_PRESSURE);
  const gradientSubtractProgram = createProgramFromSources(VERT, FRAG_GRAD_SUB);
  const advectionProgram = createProgramFromSources(VERT, FRAG_ADVECT);
  const displayProgram = createProgramFromSources(VERT, FRAG_OUTPUT);

  function initFBOs() {
    outputColor = createDoubleFBO(res.w, res.h);
    velocity = createDoubleFBO(res.w, res.h);
    divergence = createFBO(res.w, res.h);
    pressure = createDoubleFBO(res.w, res.h);
  }

  function updatePointerPosition(eX, eY) {
    pointer.moved = true;
    pointer.dx = 6 * (eX - pointer.x);
    pointer.dy = 6 * (eY - pointer.y);
    pointer.x = eX;
    pointer.y = eY;
  }

  function setupEvents() {
    const onEnter = () => { isHovering = true; };
    const onLeave = () => { isHovering = false; pointer.moved = false; };
    const onClick = (e) => {
      const rect = container.getBoundingClientRect();
      updatePointerPosition(e.clientX - rect.left, e.clientY - rect.top);
    };
    const onMove = (e) => {
      const rect = container.getBoundingClientRect();
      updatePointerPosition(e.clientX - rect.left, e.clientY - rect.top);
    };
    const onTouchMove = (e) => {
      isHovering = true;
      e.preventDefault();
      const t = e.targetTouches[0];
      const rect = container.getBoundingClientRect();
      updatePointerPosition(t.clientX - rect.left, t.clientY - rect.top);
    };
    const onTouchStart = () => { isHovering = true; };
    const onTouchEnd = () => { isHovering = false; pointer.moved = false; };
    const onResize = () => {
      resizeCanvas();
      initFBOs();
      if (imageTexture) gl.bindTexture(gl.TEXTURE_2D, imageTexture);
    };

    container.addEventListener("mouseenter", onEnter);
    container.addEventListener("mouseleave", onLeave);
    container.addEventListener("click", onClick);
    container.addEventListener("mousemove", onMove);
    container.addEventListener("touchstart", onTouchStart, { passive: true });
    container.addEventListener("touchend", onTouchEnd, { passive: true });
    container.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("resize", onResize);

    const heroSection = document.querySelector(".hero");
    if (heroSection) {
      heroSection.addEventListener("mouseenter", onEnter);
      heroSection.addEventListener("mouseleave", onLeave);
      heroSection.addEventListener("mousemove", onMove);
    }
    
    if (typeof ResizeObserver !== "undefined") {
      new ResizeObserver(onResize).observe(container);
    }
  }

  function resizeCanvas() {
    const width = container.clientWidth || 600;
    const height = container.clientHeight || 360;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(2, Math.round(width * overscanFactor * dpr));
    canvas.height = Math.max(2, Math.round(height * overscanFactor * dpr));
    const cssW = width * overscanFactor;
    const cssH = height * overscanFactor;
    canvas.style.width = `${cssW}px`;
    canvas.style.height = `${cssH}px`;
    const ratio = cssW / cssH;
    const baseResolution = 128 + ((resolution - 1) * (512 - 128)) / 9;
    res.w = Math.round(baseResolution * ratio);
    res.h = Math.round(baseResolution);
  }

  function getPointerUV() {
    const cssW = container.clientWidth * overscanFactor;
    const cssH = container.clientHeight * overscanFactor;
    const dx = 0.5 * (cssW - container.clientWidth);
    const dy = 0.5 * (cssH - container.clientHeight);
    const u = (pointer.x + dx) / cssW;
    const v = 1 - (pointer.y + dy) / cssH;
    return { u, v };
  }

  function loadImage(src) {
    const img = new Image();
    if (src.startsWith("http://") || src.startsWith("https://")) {
      img.crossOrigin = "anonymous";
    }
    img.src = src;
    img.onload = () => {
      imgRatio = img.naturalWidth / Math.max(1, img.naturalHeight);
      imageTexture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, imageTexture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, imageTexture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
    };
  }

  function render(_t) {
    const dt = 1 / 60;
    if (pointer.moved) {
      pointer.moved = false;
      gl.useProgram(splatProgram.program);
      gl.uniform1i(splatProgram.uniforms.u_input_texture, velocity.read().attach(1));
      gl.uniform1f(splatProgram.uniforms.u_ratio, container.clientWidth / Math.max(1, container.clientHeight));
      const uv = getPointerUV();
      gl.uniform2f(splatProgram.uniforms.u_point, uv.u, uv.v);
      gl.uniform3f(splatProgram.uniforms.u_point_value, pointer.dx, -pointer.dy, 0);
      const ch = Math.max(1, container.clientHeight);
      const rr = params.cursorRadiusPx / ch;
      gl.uniform1f(splatProgram.uniforms.u_point_size, rr * rr);
      blit(velocity.write());
      velocity.swap();
      gl.uniform1i(splatProgram.uniforms.u_input_texture, outputColor.read().attach(1));
      gl.uniform3f(splatProgram.uniforms.u_point_value, params.cursorPower * 0.001, 0, 0);
      blit(outputColor.write());
      outputColor.swap();
    }
    gl.useProgram(divergenceProgram.program);
    gl.uniform2f(divergenceProgram.uniforms.u_texel, velocity.texelSizeX, velocity.texelSizeY);
    gl.uniform1i(divergenceProgram.uniforms.u_velocity_texture, velocity.read().attach(1));
    blit(divergence);

    gl.useProgram(pressureProgram.program);
    gl.uniform2f(pressureProgram.uniforms.u_texel, velocity.texelSizeX, velocity.texelSizeY);
    gl.uniform1i(pressureProgram.uniforms.u_divergence_texture, divergence.attach(1));
    for (let i = 0; i < 16; i++) {
      gl.uniform1i(pressureProgram.uniforms.u_pressure_texture, pressure.read().attach(2));
      blit(pressure.write());
      pressure.swap();
    }

    gl.useProgram(gradientSubtractProgram.program);
    gl.uniform2f(gradientSubtractProgram.uniforms.u_texel, velocity.texelSizeX, velocity.texelSizeY);
    gl.uniform1i(gradientSubtractProgram.uniforms.u_pressure_texture, pressure.read().attach(1));
    gl.uniform1i(gradientSubtractProgram.uniforms.u_velocity_texture, velocity.read().attach(2));
    blit(velocity.write());
    velocity.swap();

    gl.useProgram(advectionProgram.program);
    gl.uniform2f(advectionProgram.uniforms.u_texel, velocity.texelSizeX, velocity.texelSizeY);
    gl.uniform2f(advectionProgram.uniforms.u_output_textel, velocity.texelSizeX, velocity.texelSizeY);
    gl.uniform1i(advectionProgram.uniforms.u_velocity_texture, velocity.read().attach(1));
    gl.uniform1i(advectionProgram.uniforms.u_input_texture, velocity.read().attach(1));
    gl.uniform1f(advectionProgram.uniforms.u_dt, dt);
    gl.uniform1f(advectionProgram.uniforms.u_dissipation, 0.97);
    blit(velocity.write());
    velocity.swap();

    gl.useProgram(advectionProgram.program);
    gl.uniform2f(advectionProgram.uniforms.u_output_textel, outputColor.texelSizeX, outputColor.texelSizeY);
    gl.uniform1i(advectionProgram.uniforms.u_input_texture, outputColor.read().attach(2));
    gl.uniform1f(advectionProgram.uniforms.u_dt, 8 * dt);
    gl.uniform1f(advectionProgram.uniforms.u_dissipation, 0.98);
    blit(outputColor.write());
    outputColor.swap();

    gl.useProgram(displayProgram.program);
    const uv2 = getPointerUV();
    gl.uniform2f(displayProgram.uniforms.u_point, uv2.u, uv2.v);
    gl.uniform1i(displayProgram.uniforms.u_velocity_texture, velocity.read().attach(2));
    gl.uniform1f(displayProgram.uniforms.u_ratio, container.clientWidth / Math.max(1, container.clientHeight));
    gl.uniform1f(displayProgram.uniforms.u_img_ratio, imgRatio);
    gl.uniform1f(displayProgram.uniforms.u_disturb_power, params.distortionPower);
    gl.uniform1i(displayProgram.uniforms.u_output_texture, outputColor.read().attach(1));
    gl.uniform1f(displayProgram.uniforms.u_canvas_scale, 1);
    gl.uniform1f(displayProgram.uniforms.u_inner_scale, innerScale);
    if (imageTexture) {
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, imageTexture);
      gl.uniform1i(displayProgram.uniforms.u_text_texture, 0);
    }
    blit();
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
    rafId = requestAnimationFrame(render);
  }

  resizeCanvas();
  initFBOs();
  setupEvents();
  render(0);
  loadImage(imageSrc);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => setTimeout(() => {
    initAsciiReveal();
    initLiquidHover();
    initHeroScrollEffects();
  }, 100));
} else {
  setTimeout(() => {
    initAsciiReveal();
    initLiquidHover();
    initHeroScrollEffects();
  }, 100);
}

// =====================================================
// Reveal headline words in sequence.
// =====================================================
function initWordReveal() {
  const headline = document.querySelector("[data-headline-reveal]");
  if (!headline) return;

  // Preserve the gradient-text span while splitting
  const children = Array.from(headline.childNodes);
  let wordIndex = 0;
  const fragment = document.createDocumentFragment();

  children.forEach(node => {
    if (node.nodeType === Node.TEXT_NODE) {
      const words = node.textContent.split(/(\s+)/);
      words.forEach(part => {
        if (/^\s+$/.test(part)) {
          fragment.appendChild(document.createTextNode(part));
        } else if (part.length > 0) {
          const span = document.createElement("span");
          span.className = "reveal-word";
          span.textContent = part;
          span.style.transitionDelay = `${wordIndex * 0.06}s`;
          fragment.appendChild(span);
          wordIndex++;
        }
      });
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      // Handle <span class="gradient-text">...</span>
      const wrapper = node.cloneNode(false);
      const innerWords = node.textContent.split(/(\s+)/);
      innerWords.forEach(part => {
        if (/^\s+$/.test(part)) {
          wrapper.appendChild(document.createTextNode(part));
        } else if (part.length > 0) {
          const span = document.createElement("span");
          span.className = "reveal-word";
          span.textContent = part;
          span.style.transitionDelay = `${wordIndex * 0.06}s`;
          wrapper.appendChild(span);
          wordIndex++;
        }
      });
      fragment.appendChild(wrapper);
    }
  });

  headline.innerHTML = "";
  headline.appendChild(fragment);

  // Stagger the word reveals after the headline entrance animation
  const entranceDelay = parseFloat(headline.closest("[data-entrance-order]")?.dataset.entranceOrder || 3) * 200;
  setTimeout(() => {
    const revealWords = headline.querySelectorAll(".reveal-word");
    revealWords.forEach((word, i) => {
      setTimeout(() => word.classList.add("word-visible"), i * 60);
    });
  }, entranceDelay + 600);
}

// =====================================================
// ANIMATED STAT COUNTERS
// =====================================================
function initCounterAnimation() {
  const counters = document.querySelectorAll("[data-count-to]");
  if (!counters.length) return;

  // Start counter animation after stats row entrance (order 5 = ~1000ms)
  setTimeout(() => {
    counters.forEach(counter => {
      const target = parseInt(counter.dataset.countTo, 10);
      const duration = 1200;
      const startTime = performance.now();

      function easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
      }

      function updateCounter(now) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easedProgress = easeOutCubic(progress);
        const current = Math.round(easedProgress * target);
        counter.textContent = current;

        if (progress < 1) {
          requestAnimationFrame(updateCounter);
        }
      }

      requestAnimationFrame(updateCounter);
    });
  }, 1400);
}

// =====================================================
// Apply scroll-driven hero effects.
// =====================================================
function initHeroScrollEffects() {
  const hero = document.querySelector(".hero");
  const heroContent = document.querySelector(".hero-content");
  const heroVisual = document.querySelector(".hero-backdrop") || document.querySelector(".hero-liquid-wrapper");
  const scrollIndicator = document.querySelector(".scroll-indicator");

  if (!hero) return;

  let scrollTicking = false;

  function onHeroScroll() {
    if (scrollTicking) return;
    scrollTicking = true;

    requestAnimationFrame(() => {
      const scrollY = window.scrollY;
      const heroHeight = hero.offsetHeight;
      const scrollProgress = Math.min(scrollY / heroHeight, 1);

      // Parallax: content moves up faster, visual moves slower
      if (heroContent) {
        const contentY = scrollY * 0.3;
        const contentOpacity = 1 - scrollProgress * 1.2;
        heroContent.style.transform = `translateY(-${contentY}px)`;
        heroContent.style.opacity = Math.max(contentOpacity, 0);
      }

      if (heroVisual) {
        if (scrollY > 0) {
          const visualY = scrollY * 0.15;
          const visualScale = 1 + scrollProgress * 0.05;
          heroVisual.style.transform = `translateY(${visualY}px) scale(${visualScale})`;
        } else {
          heroVisual.style.transform = "";
        }
      }

      // Fade out scroll indicator
      if (scrollIndicator) {
        if (scrollY > 60) {
          scrollIndicator.classList.add("faded");
        } else {
          scrollIndicator.classList.remove("faded");
        }
      }

      scrollTicking = false;
    });
  }

  window.addEventListener("scroll", onHeroScroll, { passive: true });
}

// =====================================================
// Render the starfield and manage portrait tilt.
// =====================================================
(function initStarfield() {
  const canvas = document.getElementById("starfield");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  let stars = [];
  let w, h, dpr;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 1.75);
    const hero = canvas.closest(".hero") || canvas.parentElement;
    const heroW = hero ? hero.offsetWidth : window.innerWidth;
    const heroH = hero ? hero.offsetHeight : window.innerHeight;
    w = canvas.width = heroW * dpr;
    h = canvas.height = heroH * dpr;
    canvas.style.width = heroW + "px";
    canvas.style.height = heroH + "px";
    spawn();
  }

  function spawn() {
    const hero = canvas.closest(".hero") || canvas.parentElement;
    const heroW = hero ? hero.offsetWidth : window.innerWidth;
    const heroH = hero ? hero.offsetHeight : window.innerHeight;
    const density = window.innerWidth < 768 ? 8000 : 4000;
    const count = Math.floor((heroW * heroH) / density);
    stars = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.3 * dpr + 0.3,
      speed: Math.random() * 0.15 + 0.04,
      phase: Math.random() * Math.PI * 2,
      twinkle: Math.random() * 0.5 + 0.3,
    }));
  }

  let t = 0;
  function draw() {
    ctx.clearRect(0, 0, w, h);
    t += 0.016;
    for (const s of stars) {
      s.y += s.speed;
      if (s.y > h) s.y = -2;
      const alpha = 0.35 + Math.abs(Math.sin(t * s.twinkle + s.phase)) * 0.65;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(220, 240, 255, ${alpha})`;
      ctx.fill();
    }
    requestAnimationFrame(draw);
  }

  window.addEventListener("resize", resize);
  resize();
  draw();
})();

// --- Interactive Hero Head & Gaze Tracker (Tracks Rocket Cursor in 3D) ---
(function initHeadTracking() {
  const wrap = document.getElementById("artTilt");
  if (!wrap) return;
  const img = wrap.querySelector(".hero-cutout-img");
  if (!img) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  let currentRx = 0, currentRy = 0, currentTx = 0, currentTy = 0;
  let targetRx = 0, targetRy = 0, targetTx = 0, targetTy = 0;

  window.addEventListener("pointermove", (e) => {
    const rect = img.getBoundingClientRect();
    // Only track when hero is in or near viewport
    if (rect.bottom < 0 || rect.top > window.innerHeight) return;

    // Approximate head/eye level: center horizontally, ~25% down from top
    const headX = rect.left + rect.width * 0.5;
    const headY = rect.top + rect.height * 0.25;

    const dx = e.clientX - headX;
    const dy = e.clientY - headY;

    // Normalize relative to screen half-dimensions
    const normX = Math.max(-1.15, Math.min(1.15, dx / (window.innerWidth * 0.5)));
    const normY = Math.max(-1.15, Math.min(1.15, dy / (window.innerHeight * 0.5)));

    // Yaw: turns head & shoulders smoothly to follow horizontal cursor position
    targetRy = normX * 14;
    // Pitch: tilts head up when rocket is high, down when rocket is low
    targetRx = -normY * 9;

    // Subtle 3D shift for natural depth parallax
    targetTx = normX * 7;
    targetTy = normY * 5;
  });

  document.addEventListener("mouseleave", () => {
    targetRx = 0;
    targetRy = 0;
    targetTx = 0;
    targetTy = 0;
  });

  // Smooth cinematic lerp loop
  function renderGaze() {
    const ease = 0.08;
    currentRx += (targetRx - currentRx) * ease;
    currentRy += (targetRy - currentRy) * ease;
    currentTx += (targetTx - currentTx) * ease;
    currentTy += (targetTy - currentTy) * ease;

    img.style.setProperty("--rx", `${currentRx.toFixed(2)}deg`);
    img.style.setProperty("--ry", `${currentRy.toFixed(2)}deg`);
    img.style.setProperty("--tx", `${currentTx.toFixed(2)}px`);
    img.style.setProperty("--ty", `${currentTy.toFixed(2)}px`);

    requestAnimationFrame(renderGaze);
  }
  requestAnimationFrame(renderGaze);
})();

// Animate the floating astronaut artwork.
(function initAstroWander() {
  const container = document.querySelector(".hero.hero-space");
  const els = document.querySelectorAll(".astro-float");
  if (!els.length || !container) return;
  const isMobile = window.matchMedia("(max-width: 980px)").matches;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const rand = (min, max) => min + Math.random() * (max - min);

  els.forEach((el, index) => {
    const getBounds = () => {
      const width = isMobile ? Math.min(container.clientWidth, window.innerWidth) : container.clientWidth;
      const height = isMobile
        ? Math.min(container.clientHeight || window.innerHeight, window.innerHeight)
        : container.clientHeight;
      const pad = isMobile ? 16 : 0;
      const minY = isMobile ? Math.min(76, Math.max(10, height - el.offsetHeight - pad)) : 0;
      return {
        minX: pad,
        maxX: Math.max(pad, width - el.offsetWidth - pad),
        minY,
        maxY: Math.max(minY, height - el.offsetHeight - pad),
      };
    };
    const point = () => {
      const bounds = getBounds();
      return {
        x: rand(bounds.minX, bounds.maxX),
        y: rand(bounds.minY, bounds.maxY),
      };
    };

    let start = point();
    if (!isMobile) {
      const maxX = Math.max(0, container.clientWidth - el.offsetWidth);
      const maxY = Math.max(0, container.clientHeight - el.offsetHeight);
      if (index === 0) start = { x: rand(maxX * 0.45, maxX * 0.85), y: rand(maxY * 0.05, maxY * 0.35) };
      else if (index === 1) start = { x: rand(maxX * 0.05, maxX * 0.35), y: rand(maxY * 0.15, maxY * 0.55) };
      else start = { x: rand(maxX * 0.55, maxX * 0.9), y: rand(maxY * 0.35, maxY * 0.75) };
    }
    el.style.left = "0px";
    el.style.top = "0px";
    el.style.transform = `translate(${start.x}px, ${start.y}px)`;
    if (reduceMotion) return;

    const drift = () => {
      const target = point();
      const r = rand(isMobile ? -9 : -18, isMobile ? 9 : 18);
      const duration = isMobile ? rand(6500, 10500) : rand(7000, 13000);

      const anim = el.animate(
        [
          { transform: getComputedStyle(el).transform },
          { transform: `translate(${target.x}px, ${target.y}px) rotate(${r}deg)` },
        ],
        { duration: duration, easing: "ease-in-out", fill: "forwards" }
      );
      anim.onfinish = drift;
    };

    setTimeout(drift, rand(isMobile ? 300 : 400, isMobile ? 1400 : 2500));
  });
})();

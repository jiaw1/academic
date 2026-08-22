const SELECTORS = {
  menuButton: '.menu-button',
  navigation: '.nav-links',
  revealItem: '.reveal',
  themeButton: '[data-theme-toggle]',
  year: '[data-year]',
  carousel: '[data-carousel]',
};

function initializeNavigation() {
  const menuButton = document.querySelector(SELECTORS.menuButton);
  const navigation = document.querySelector(SELECTORS.navigation);
  if (!menuButton || !navigation) return;

  const closeMenu = () => {
    navigation.classList.remove('open');
    menuButton.setAttribute('aria-expanded', 'false');
  };

  menuButton.addEventListener('click', () => {
    const isOpen = navigation.classList.toggle('open');
    menuButton.setAttribute('aria-expanded', String(isOpen));
  });

  navigation.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', closeMenu);
  });
}

function initializeTheme() {
  const root = document.documentElement;
  const themeButton = document.querySelector(SELECTORS.themeButton);
  const storedTheme = localStorage.getItem('theme');
  const prefersDarkTheme = window.matchMedia('(prefers-color-scheme: dark)').matches;

  if (storedTheme) {
    root.dataset.theme = storedTheme;
  } else if (prefersDarkTheme) {
    root.dataset.theme = 'dark';
  }
  if (!themeButton) return;

  const updateThemeButton = () => {
    const isDarkTheme = root.dataset.theme === 'dark';
    themeButton.textContent = isDarkTheme ? '☀' : '☾';
    themeButton.setAttribute('aria-label', isDarkTheme ? 'Use light mode' : 'Use dark mode');
  };

  updateThemeButton();
  themeButton.addEventListener('click', () => {
    root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('theme', root.dataset.theme);
    updateThemeButton();
  });
}

function updateCopyrightYear() {
  const currentYear = String(new Date().getFullYear());
  document.querySelectorAll(SELECTORS.year).forEach((element) => {
    element.textContent = currentYear;
  });
}

function initializeRevealAnimations() {
  const revealItems = document.querySelectorAll(SELECTORS.revealItem);
  if (!('IntersectionObserver' in window)) {
    revealItems.forEach((item) => item.classList.add('visible'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12 });

  revealItems.forEach((item) => observer.observe(item));
}

function initializeCarousels() {
  document.querySelectorAll(SELECTORS.carousel).forEach((carousel) => {
    const slides = [...carousel.querySelectorAll('[data-carousel-slide]')];
    const dots = [...carousel.querySelectorAll('[data-carousel-dot]')];
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let activeIndex = 0;
    let rotationTimer;
    let isTouching = false;

    const showSlide = (index) => {
      activeIndex = index;
      slides.forEach((slide, slideIndex) => {
        const isActive = slideIndex === activeIndex;
        slide.classList.toggle('active', isActive);
        slide.setAttribute('aria-hidden', String(!isActive));
        dots[slideIndex]?.classList.toggle('active', isActive);
        dots[slideIndex]?.toggleAttribute('aria-current', isActive);
      });
    };

    const getSlideDuration = () => activeIndex === 0 ? 6500 : 5000;
    const stopRotation = () => window.clearTimeout(rotationTimer);
    const startRotation = () => {
      if (prefersReducedMotion || document.hidden || isTouching || carousel.matches(':hover, :focus-within')) return;
      stopRotation();
      rotationTimer = window.setTimeout(() => {
        showSlide((activeIndex + 1) % slides.length);
        startRotation();
      }, getSlideDuration());
    };

    dots.forEach((dot, index) => {
      dot.addEventListener('click', () => {
        showSlide(index);
        startRotation();
      });
    });

    carousel.addEventListener('mouseenter', stopRotation);
    carousel.addEventListener('mouseleave', startRotation);
    carousel.addEventListener('focusin', stopRotation);
    carousel.addEventListener('focusout', (event) => {
      if (!carousel.contains(event.relatedTarget)) startRotation();
    });
    carousel.addEventListener('touchstart', () => {
      isTouching = true;
      stopRotation();
    }, { passive: true });
    ['touchend', 'touchcancel'].forEach((eventName) => {
      carousel.addEventListener(eventName, () => {
        isTouching = false;
        startRotation();
      }, { passive: true });
    });
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) stopRotation();
      else startRotation();
    });
    startRotation();
  });
}

initializeNavigation();
initializeTheme();
updateCopyrightYear();
initializeRevealAnimations();
initializeCarousels();

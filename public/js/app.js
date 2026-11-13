/**
 * FAMa ka Keneya – JavaScript principal
 * Interactions : navigation mobile, FAQ accordéon, effet scroll, lien actif
 */

/* ============================================================
   1. MENU MOBILE (HAMBURGER)
   ============================================================
   Quand l'utilisateur clique sur le bouton ☰ :
   - On bascule la classe "nav--open" sur le menu pour l'afficher
   - On met à jour aria-expanded pour l'accessibilité
   - On désactive le défilement de la page quand le menu est ouvert
*/
(function initMobileMenu() {
  const toggleBtn = document.getElementById('navToggle');
  const navList   = document.querySelector('.nav');

  if (!toggleBtn || !navList) return;

  function openMenu() {
    navList.classList.add('nav--open');
    toggleBtn.setAttribute('aria-expanded', 'true');
    toggleBtn.setAttribute('aria-label', 'Fermer le menu');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    navList.classList.remove('nav--open');
    toggleBtn.setAttribute('aria-expanded', 'false');
    toggleBtn.setAttribute('aria-label', 'Ouvrir le menu');
    document.body.style.overflow = '';
  }

  function toggleMenu() {
    const isOpen = navList.classList.contains('nav--open');
    isOpen ? closeMenu() : openMenu();
  }

  /* Clic sur le bouton hamburger */
  toggleBtn.addEventListener('click', toggleMenu);

  /* Clic sur un lien du menu → ferme le menu */
  navList.querySelectorAll('.nav__link, .nav__cta').forEach(function(link) {
    link.addEventListener('click', closeMenu);
  });

  /* Touche Échap → ferme le menu */
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && navList.classList.contains('nav--open')) {
      closeMenu();
      toggleBtn.focus();
    }
  });

  /* Clic en dehors du menu → ferme le menu */
  document.addEventListener('click', function(e) {
    const header = document.getElementById('header');
    if (navList.classList.contains('nav--open') && !header.contains(e.target)) {
      closeMenu();
    }
  });
})();


/* ============================================================
   2. OMBRE DE L'EN-TÊTE AU DÉFILEMENT
   ============================================================
   Quand la page défile de plus de 10px, on ajoute la classe
   "header--scrolled" sur l'en-tête pour afficher une ombre.
*/
(function initHeaderScroll() {
  const header = document.getElementById('header');
  if (!header) return;

  function onScroll() {
    if (window.scrollY > 10) {
      header.classList.add('header--scrolled');
    } else {
      header.classList.remove('header--scrolled');
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); /* Vérifie l'état initial au chargement */
})();


/* ============================================================
   3. LIEN DE NAVIGATION ACTIF AU DÉFILEMENT
   ============================================================
   Quand on défile, on détecte quelle section est visible
   et on met en surbrillance le lien correspondant dans le menu.
*/
(function initActiveNavLink() {
  const sections = document.querySelectorAll('main section[id]');
  const navLinks = document.querySelectorAll('.nav__link[href^="#"]');
  const HEADER_OFFSET = 90; /* Décalage pour compenser l'en-tête fixe */

  if (!sections.length || !navLinks.length) return;

  function setActive(id) {
    navLinks.forEach(function(link) {
      link.classList.toggle('active', link.getAttribute('href') === '#' + id);
    });
  }

  function onScroll() {
    let currentId = sections[0].id;

    sections.forEach(function(section) {
      if (window.scrollY >= section.offsetTop - HEADER_OFFSET) {
        currentId = section.id;
      }
    });

    setActive(currentId);
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); /* État initial */
})();


/* ============================================================
   4. FAQ ACCORDÉON
   ============================================================
   Chaque question peut être ouverte ou fermée par un clic.
   Une seule réponse est ouverte à la fois.
*/
(function initFAQ() {
  const faqItems = document.querySelectorAll('[data-faq]');
  if (!faqItems.length) return;

  faqItems.forEach(function(item) {
    const question = item.querySelector('.faq__question');
    const answer   = item.querySelector('.faq__answer');

    if (!question || !answer) return;

    question.addEventListener('click', function() {
      const isOpen = question.getAttribute('aria-expanded') === 'true';

      /* Ferme toutes les autres questions */
      faqItems.forEach(function(otherItem) {
        const otherQuestion = otherItem.querySelector('.faq__question');
        const otherAnswer   = otherItem.querySelector('.faq__answer');
        if (otherQuestion && otherAnswer && otherItem !== item) {
          otherQuestion.setAttribute('aria-expanded', 'false');
          otherAnswer.hidden = true;
        }
      });

      /* Bascule la question cliquée */
      if (isOpen) {
        question.setAttribute('aria-expanded', 'false');
        answer.hidden = true;
      } else {
        question.setAttribute('aria-expanded', 'true');
        answer.hidden = false;
        /* Défile doucement vers la question ouverte */
        item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    });
  });
})();


/* ============================================================
   5. DÉFILEMENT FLUIDE POUR LES LIENS ANCRES
   ============================================================
   Tous les liens href="#..." défilent en douceur vers la cible
   en tenant compte de la hauteur de l'en-tête fixe.
*/
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(function(link) {
    link.addEventListener('click', function(e) {
      const targetId = link.getAttribute('href').slice(1);
      if (!targetId) return;

      const target = document.getElementById(targetId);
      if (!target) return;

      e.preventDefault();

      const headerHeight = document.getElementById('header')?.offsetHeight || 72;
      const targetTop    = target.getBoundingClientRect().top + window.scrollY - headerHeight;

      window.scrollTo({ top: targetTop, behavior: 'smooth' });
    });
  });
})();


/* ============================================================
   6. ANIMATION D'APPARITION DES ÉLÉMENTS (INTERSECTION OBSERVER)
   ============================================================
   Les cartes et sections apparaissent en fondu lorsqu'elles
   entrent dans le champ de vision.
*/
(function initRevealAnimation() {
  /* On ne lance pas cette animation si l'utilisateur préfère
     réduire les mouvements (accessibilité) */
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const style = document.createElement('style');
  style.textContent = `
    .reveal {
      opacity: 0;
      transform: translateY(24px);
      transition: opacity 0.5s ease, transform 0.5s ease;
    }
    .reveal.is-visible {
      opacity: 1;
      transform: translateY(0);
    }
  `;
  document.head.appendChild(style);

  /* Éléments à animer */
  const targets = document.querySelectorAll(
    '.avantage-card, .fonct-card, .faq__item, .apropos__content, .apropos__visual, .section__header'
  );

  targets.forEach(function(el) {
    el.classList.add('reveal');
  });

  const observer = new IntersectionObserver(
    function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target); /* N'anime qu'une fois */
        }
      });
    },
    { threshold: 0.12 }
  );

  targets.forEach(function(el) {
    observer.observe(el);
  });
})();

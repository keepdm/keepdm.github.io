document.addEventListener("DOMContentLoaded", () => {
  const header = document.querySelector("[data-site-header]");
  const toggle = document.querySelector("[data-menu-toggle]");
  const menu = document.querySelector("[data-menu]");
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const updateHeaderState = () => {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 60);
  };

  updateHeaderState();
  window.addEventListener("scroll", updateHeaderState, { passive: true });

  if (toggle && menu) {
    toggle.addEventListener("click", () => {
      const expanded = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!expanded));
      menu.hidden = expanded;
    });

    menu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        if (window.innerWidth <= 768) {
          toggle.setAttribute("aria-expanded", "false");
          menu.hidden = true;
        }
      });
    });
  }

  document.addEventListener("click", (event) => {
    const anchor = event.target.closest('a[href*="#"]');
    if (!anchor) return;

    const url = new URL(anchor.getAttribute("href"), window.location.href);
    const samePage = url.origin === window.location.origin && url.pathname === window.location.pathname;
    if (!samePage || !url.hash) return;

    const target = document.querySelector(url.hash);
    if (!target) return;

    event.preventDefault();
    const top = target.getBoundingClientRect().top + window.scrollY - 84;
    window.scrollTo({
      top,
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });

    history.pushState(null, "", url.hash);
  });

  window.addEventListener("hashchange", () => {
    const target = document.querySelector(window.location.hash);
    if (!target) return;
    const top = target.getBoundingClientRect().top + window.scrollY - 84;
    window.scrollTo({
      top,
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });
  });

  document.querySelectorAll("[data-faq-schema]").forEach((container) => {
    const items = Array.from(container.querySelectorAll("details"))
      .map((detail) => {
        const summary = detail.querySelector("summary");
        const answer = detail.querySelector(".faq-answer");
        const question = summary ? summary.textContent.trim().replace(/\s+/g, " ") : "";
        const text = answer ? answer.textContent.trim().replace(/\s+/g, " ") : "";

        if (!question || !text) {
          return null;
        }

        return {
          "@type": "Question",
          name: question,
          acceptedAnswer: {
            "@type": "Answer",
            text,
          },
        };
      })
      .filter(Boolean);

    if (!items.length) return;

    const schema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: items,
    };

    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.dataset.generated = "faq-jsonld";
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);
  });
});

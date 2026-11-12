(() => {
  "use strict";

  const body = document.body;
  const page = body.dataset.page || "home";
  const root = page === "article" || page === "library" ? "../" : "./";
  const header = document.querySelector("[data-site-header]");
  const footer = document.querySelector("[data-site-footer]");

  const make = (tag, className, value) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (value !== undefined && value !== null) node.textContent = value;
    return node;
  };

  if (header) {
    header.innerHTML =
      '<a class="skip-link" href="#top">Перейти к содержанию</a>' +
      '<header class="topbar"><div class="wrap topbar-inner">' +
        '<a class="brand" href="' + root + '" aria-label="Мистер Кибби — на главную">' +
          '<span class="brand-mark" aria-hidden="true">MK</span>' +
          '<span class="brand-copy"><strong>МИСТЕР КИББИ</strong><small>БИБЛИОТЕКА ПОНЯТНЫХ ВЕЩЕЙ</small></span>' +
        '</a>' +
        '<button class="menu-toggle" type="button" aria-expanded="false" aria-controls="site-navigation">' +
          '<span>Меню</span><span class="menu-toggle-icon" aria-hidden="true"><i></i><i></i></span>' +
        '</button>' +
        '<nav class="site-nav" id="site-navigation" aria-label="Основная навигация">' +
          '<a href="' + root + 'library/">Библиотека</a>' +
          '<a href="' + root + '#articles">Последние материалы</a>' +
          '<a href="' + root + '#about">Принцип работы</a>' +
        '</nav>' +
        '<a class="top-link" href="' + root + 'library/">Выбрать тему <span aria-hidden="true">↗</span></a>' +
      '</div></header>';

    const menuButton = header.querySelector(".menu-toggle");
    const nav = header.querySelector(".site-nav");
    if (menuButton && nav) {
      menuButton.addEventListener("click", () => {
        const isOpen = menuButton.getAttribute("aria-expanded") === "true";
        menuButton.setAttribute("aria-expanded", String(!isOpen));
        nav.classList.toggle("is-open", !isOpen);
      });
      nav.querySelectorAll("a").forEach(link => link.addEventListener("click", () => {
        menuButton.setAttribute("aria-expanded", "false");
        nav.classList.remove("is-open");
      }));
    }
  }

  if (footer) {
    footer.innerHTML =
      '<footer class="site-footer"><div class="wrap footer-main">' +
        '<div class="footer-brand-block">' +
          '<a class="brand footer-brand" href="' + root + '">' +
            '<span class="brand-mark" aria-hidden="true">MK</span>' +
            '<span class="brand-copy"><strong>МИСТЕР КИББИ</strong><small>БИБЛИОТЕКА ПОНЯТНЫХ ВЕЩЕЙ</small></span>' +
          '</a>' +
          '<p>Сложное — по шагам.<br>Понятное — навсегда.</p>' +
        '</div>' +
        '<div class="footer-links"><span>НАВИГАЦИЯ</span><a href="' + root + 'library/">Библиотека</a><a href="' + root + '#about">Как мы объясняем</a><a href="' + root + '#top">Наверх ↑</a></div>' +
        '<div class="footer-signoff"><span>НЕ ПРЕТЕНДУЕМ НА ВСЕ ЗНАНИЯ.</span><strong>ЗАТО ЛЮБИМ РАЗБИРАТЬСЯ.</strong></div>' +
      '</div><div class="wrap footer-bottom"><span>© <span data-current-year></span> Мистер Кибби</span><span>Сделано с любопытством.</span></div></footer>';
    const year = footer.querySelector("[data-current-year]");
    if (year) year.textContent = String(new Date().getFullYear());
  }

  const isCatalog = page === "home" || page === "library";
  if (isCatalog) {
    const grid = document.getElementById(page === "home" ? "home-article-grid" : "article-grid");
    if (grid) {
      const search = document.getElementById("article-search");
      const count = document.getElementById("result-count");
      const empty = document.getElementById("empty-state");
      const filters = Array.from(document.querySelectorAll("[data-filter]"));
      let activeFilter = "all";
      let cards = [];

      const createCard = (item, index) => {
        const card = make("a", "article-card");
        card.href = root + "articles/" + item.slug + ".html";
        card.dataset.category = item.category || "other";
        card.dataset.search = [
          item.title, item.excerpt, item.categoryLabel,
          ...(item.tags || []), ...(item.keywords || [])
        ].join(" ").toLocaleLowerCase("ru");
        card.setAttribute("aria-label", item.title);

        const top = make("div", "article-card-top");
        top.append(make("span", "category-label", item.categoryLabel || "Материал"));
        top.append(make("span", "card-index", String(index + 1).padStart(2, "0")));

        const art = make("div", "card-art");
        art.dataset.category = item.category || "other";
        art.append(make("span", "card-art-ring"));
        art.append(make("span", "card-art-symbol", item.icon || "✳"));
        art.append(make("span", "card-art-caption", "MR. KIBBY / NOTES"));

        const content = make("div", "article-card-content");
        content.append(make("span", "card-read-time", item.readTime || "Материал"));
        content.append(make("h3", "card-title", item.title));
        content.append(make("p", "card-description", item.excerpt));

        const bottom = make("div", "article-card-bottom");
        const tags = make("span", "card-tags");
        (item.tags || []).slice(0, 2).forEach(tag => tags.append(make("span", "card-tag", tag)));
        const arrow = make("span", "card-arrow", "↗");
        arrow.setAttribute("aria-hidden", "true");
        bottom.append(tags, arrow);
        card.append(top, art, content, bottom);
        return card;
      };

      const pluralize = n => {
        const n100 = n % 100;
        const n10 = n % 10;
        if (n100 >= 11 && n100 <= 14) return "материалов";
        if (n10 === 1) return "материал";
        if (n10 >= 2 && n10 <= 4) return "материала";
        return "материалов";
      };

      const update = () => {
        const query = (search ? search.value : "").trim().toLocaleLowerCase("ru");
        let visible = 0;
        cards.forEach(card => {
          const categoryMatch = activeFilter === "all" || card.dataset.category === activeFilter;
          const textMatch = !query || card.dataset.search.includes(query);
          const show = categoryMatch && textMatch;
          card.hidden = !show;
          if (show) visible += 1;
        });
        if (count) count.textContent = visible + " " + pluralize(visible);
        if (empty) empty.classList.toggle("visible", visible === 0);
      };

      if (search) {
        const params = new URLSearchParams(window.location.search);
        search.value = params.get("q") || "";
        search.addEventListener("input", update);
      }
      filters.forEach(button => button.addEventListener("click", () => {
        activeFilter = button.dataset.filter || "all";
        filters.forEach(filter => filter.setAttribute("aria-pressed", String(filter === button)));
        update();
      }));

      fetch(root + "data/articles.json")
        .then(response => {
          if (!response.ok) throw new Error("Catalog unavailable");
          return response.json();
        })
        .then(items => {
          if (!Array.isArray(items)) throw new Error("Invalid catalog");
          grid.replaceChildren(...items.map(createCard));
          cards = Array.from(grid.querySelectorAll(".article-card"));
          update();
        })
        .catch(() => {
          grid.replaceChildren(make("div", "catalog-error", "Не удалось загрузить библиотеку. Обновите страницу ещё раз."));
          if (count) count.textContent = "Каталог недоступен";
          if (empty) empty.classList.remove("visible");
        });
    }
  }

  if (page === "article") {
    const progress = make("div", "reading-progress");
    progress.setAttribute("aria-hidden", "true");
    progress.innerHTML = "<span></span>";
    body.prepend(progress);
    const bar = progress.firstElementChild;
    const updateProgress = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      const ratio = total > 0 ? Math.min(1, Math.max(0, window.scrollY / total)) : 0;
      bar.style.transform = "scaleX(" + ratio + ")";
    };
    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress);
    updateProgress();

    const toc = document.querySelector(".toc nav");
    const links = toc ? Array.from(toc.querySelectorAll("a[href^='#']")) : [];
    if ("IntersectionObserver" in window && links.length) {
      const sections = links
        .map(link => document.getElementById(decodeURIComponent(link.getAttribute("href").slice(1))))
        .filter(Boolean);
      const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          links.forEach(link => {
            const active = link.getAttribute("href") === "#" + entry.target.id;
            link.classList.toggle("is-active", active);
            if (active) link.setAttribute("aria-current", "location");
            else link.removeAttribute("aria-current");
          });
        });
      }, { rootMargin: "-16% 0px -72% 0px", threshold: 0 });
      sections.forEach(section => observer.observe(section));
    }
  }
})();

(() => {
  "use strict";
  const body=document.body;
  const isHome=body.dataset.page==="home";
  const root=isHome?"./":"../";
  const header=document.querySelector("[data-site-header]");
  if(header){
    header.innerHTML=
      '<a class="skip-link" href="#top">Перейти к содержанию</a>'+
      '<header class="topbar"><div class="wrap topbar-inner">'+
      '<a class="brand" href="'+root+'" aria-label="Мистер Кибби — на главную">'+
      '<span class="brand-mark" aria-hidden="true">MK</span>'+
      '<span class="brand-copy"><strong>МИСТЕР КИББИ</strong><small>ГАЙДЫ И РАЗБОРЫ</small></span></a>'+
      '<nav class="site-nav" aria-label="Основная навигация"><a href="'+root+'#articles">Библиотека</a><a href="'+root+'#about">Наш принцип</a></nav>'+
      '<a class="top-link" href="'+root+'#articles">К материалам <span aria-hidden="true">↗</span></a>'+
      '</div></header>';
  }
  const footer=document.querySelector("[data-site-footer]");
  if(footer){
    footer.innerHTML=
      '<footer class="site-footer"><div class="wrap footer-inner">'+
      '<div class="footer-brand"><strong>Понятные инструкции от Мистера Кибби</strong><span>Сложное — по полочкам. Без лишнего шума.</span></div>'+
      '<span>© <span data-current-year></span> · Авторский проект</span><a href="#top">Наверх ↑</a>'+
      '</div></footer>';
    const year=footer.querySelector("[data-current-year]");
    if(year) year.textContent=String(new Date().getFullYear());
  }

  if(isHome){
    const grid=document.getElementById("article-grid");
    const search=document.getElementById("article-search");
    const count=document.getElementById("result-count");
    const empty=document.getElementById("empty-state");
    const filters=Array.from(document.querySelectorAll("[data-filter]"));
    let activeFilter="all";
    let cards=[];
    const el=(tag,className,value)=>{
      const node=document.createElement(tag);
      if(className) node.className=className;
      if(value!==undefined&&value!==null) node.textContent=value;
      return node;
    };
    const pluralize=(n)=>{
      const n100=n%100, n10=n%10;
      if(n100>=11&&n100<=14) return "материалов";
      if(n10===1) return "материал";
      if(n10>=2&&n10<=4) return "материала";
      return "материалов";
    };
    const createCard=(item,index)=>{
      const card=el("a","article-card");
      card.href="articles/"+item.slug+".html";
      card.dataset.category=item.category;
      card.dataset.search=[item.title,item.excerpt,item.categoryLabel,...(item.tags||[]),...(item.keywords||[])].join(" ").toLocaleLowerCase("ru");
      card.setAttribute("aria-label",item.title);
      const top=el("div","card-topline");
      top.append(el("span","category-pill",item.categoryLabel),el("span","card-number",String(index+1).padStart(2,"0")));
      const iconRow=el("div","card-icon-row");
      iconRow.append(el("span","card-icon",item.icon||"✳"),el("span","read-time",item.readTime||"Чтение"));
      const title=el("h3","card-title",item.title);
      const description=el("p","card-description",item.excerpt);
      const bottom=el("div","card-bottom");
      const tags=el("span","tags");
      (item.tags||[]).forEach(tag=>tags.append(el("span","tag",tag)));
      const arrow=el("span","card-arrow","↗");
      arrow.setAttribute("aria-hidden","true");
      bottom.append(tags,arrow);
      card.append(top,iconRow,title,description,bottom);
      return card;
    };
    const update=()=>{
      const q=(search?search.value:"").trim().toLocaleLowerCase("ru");
      let visible=0;
      cards.forEach(card=>{
        const matchesCategory=activeFilter==="all"||card.dataset.category===activeFilter;
        const matchesText=!q||card.dataset.search.includes(q);
        const show=matchesCategory&&matchesText;
        card.hidden=!show;
        if(show) visible++;
      });
      if(count) count.textContent=visible+" "+pluralize(visible);
      if(empty) empty.classList.toggle("visible",visible===0);
    };
    filters.forEach(button=>button.addEventListener("click",()=>{
      activeFilter=button.dataset.filter||"all";
      filters.forEach(item=>item.setAttribute("aria-pressed",String(item===button)));
      update();
    }));
    if(search) search.addEventListener("input",update);
    if(grid){
      fetch("data/articles.json").then(response=>{
        if(!response.ok) throw new Error("Catalog unavailable");
        return response.json();
      }).then(items=>{
        if(!Array.isArray(items)) throw new Error("Invalid catalogue");
        grid.replaceChildren(...items.map(createCard));
        cards=Array.from(grid.querySelectorAll(".article-card"));
        update();
      }).catch(()=>{
        if(empty){empty.textContent="Не удалось загрузить каталог. Обновите страницу ещё раз.";empty.classList.add("visible");}
        if(count) count.textContent="Каталог недоступен";
      });
    }
  }

  if(!isHome&&body.dataset.page==="article"){
    const progress=document.createElement("div");
    progress.className="reading-progress";
    progress.setAttribute("aria-hidden","true");
    progress.innerHTML="<span></span>";
    body.prepend(progress);
    const bar=progress.firstElementChild;
    const updateProgress=()=>{
      const total=document.documentElement.scrollHeight-window.innerHeight;
      const ratio=total>0?Math.min(1,Math.max(0,window.scrollY/total)):0;
      bar.style.transform="scaleX("+ratio+")";
    };
    window.addEventListener("scroll",updateProgress,{passive:true});
    window.addEventListener("resize",updateProgress);
    updateProgress();
    const links=Array.from(document.querySelectorAll(".toc nav a[href^='#']"));
    if("IntersectionObserver" in window&&links.length){
      const sections=links.map(link=>document.getElementById(decodeURIComponent(link.getAttribute("href").slice(1)))).filter(Boolean);
      const observer=new IntersectionObserver(entries=>{
        entries.forEach(entry=>{
          if(!entry.isIntersecting) return;
          links.forEach(link=>{
            const active=link.getAttribute("href")==="#"+entry.target.id;
            link.classList.toggle("is-active",active);
            if(active) link.setAttribute("aria-current","location");
            else link.removeAttribute("aria-current");
          });
        });
      },{rootMargin:"-16% 0px -72% 0px",threshold:0});
      sections.forEach(section=>observer.observe(section));
    }
  }
})();
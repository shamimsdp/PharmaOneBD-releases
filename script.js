(() => {
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const toggle = document.getElementById('language-toggle');
  const menuToggle = document.querySelector('.menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  let language = (() => { try { return localStorage.getItem('pharmaone-language') === 'bn' ? 'bn' : 'en'; } catch { return 'en'; } })();
  const screens = [
    { image: 'dashboard', alt: 'Actual PharmaOneBD dashboard screen', overline: ['THE OVERVIEW','এক নজরে'], title: ['A clearer start to every day.','প্রতিদিনের সহজ শুরু।'], description: ['Bills, sales, payment mix and urgent alerts live together on your dashboard.','বিল, বিক্রি, পেমেন্টের হিসাব ও জরুরি সতর্কতা—সব ড্যাশবোর্ডে।'] },
    { image: 'stock', alt: 'Actual stock management screen with OCR and expiry filters', overline: ['THE INVENTORY','স্টক ব্যবস্থাপনা'], title: ['Know what is on hand.','স্টকে কী আছে, জানুন।'], description: ['Search medicines, scan with OCR, watch low stock and filter approaching expiry.','ওষুধ খুঁজুন, OCR দিয়ে স্ক্যান করুন, কম স্টক ও মেয়াদ কাছাকাছি থাকা পণ্য দেখুন।'] },
    { image: 'reports', alt: 'Actual PharmaOneBD reports menu', overline: ['THE REPORTS','রিপোর্ট'], title: ['The whole picture, on demand.','পুরো চিত্র, যখন দরকার।'], description: ['From daily Galla to margin, dues and dead stock, find the report you need.','দৈনিক গাল্লা থেকে লাভ, বাকি ও ডেড স্টক—যে রিপোর্ট দরকার, হাতের কাছেই।'] },
    { image: 'shelves', alt: 'Actual Interactive Shelves management screen', overline: ['THE SHELVES','ইন্টারঅ্যাকটিভ শেলফ'], title: ['A place for every medicine.','প্রতিটি ওষুধের নির্দিষ্ট জায়গা।'], description: ['Create zones and bins, then map medicines to the physical location your team can find.','জোন ও বিন তৈরি করে ওষুধকে তার নির্দিষ্ট অবস্থানে ম্যাপ করুন।'] },
    { image: 'settings', alt: 'Actual settings screen with interactive shelves and management tools', overline: ['THE CONTROLS','নিয়ন্ত্রণ'], title: ['Make the system yours.','সিস্টেম সাজান নিজের মতো।'], description: ['Manage medicine data, shelves, staff, shifts, branches and sync from one place.','ওষুধ, শেলফ, স্টাফ, শিফট, শাখা ও সিঙ্ক এক জায়গা থেকে সামলান।'] },
    { image: 'stock-entry', alt: 'Actual stock entry form in the Android app', overline: ['THE STOCK ENTRY','স্টক এন্ট্রি'], title: ['New stock, entered with care.','নতুন স্টক, সহজ এন্ট্রি।'], description: ['Choose a medicine and supplier, record batch, quantity, price and expiry before saving.','ওষুধ ও সরবরাহকারী বাছুন; ব্যাচ, পরিমাণ, মূল্য ও মেয়াদ দিয়ে সেভ করুন।'] },
    { image: 'customer', alt: 'Actual customer management screen in the Android app', overline: ['THE CUSTOMER LEDGER','কাস্টমার খাতা'], title: ['Keep every due in view.','প্রতিটি বাকি চোখের সামনে।'], description: ['Find customers, track who owes what and record collections when they pay.','কাস্টমার খুঁজুন, কার কত বাকি দেখুন এবং পরিশোধের হিসাব রাখুন।'] },
    { image: 'report2', alt: 'Actual reports menu showing sales, profit, staff and due reports', overline: ['THE REPORT LIBRARY','রিপোর্টের তালিকা'], title: ['Answers for every question.','প্রতিটি প্রশ্নের রিপোর্ট।'], description: ['Explore best sellers, profit, staff performance, dues and more.', 'বেস্ট সেলার, লাভ, স্টাফ পারফরম্যান্স, বাকি—আরও অনেক রিপোর্ট দেখুন।'] },
    { image: 'report3', alt: 'Actual reports menu showing inventory and supplier insights', overline: ['THE INSIGHTS','বিশ্লেষণ'], title: ['See what needs a decision.','কোথায় সিদ্ধান্ত দরকার, দেখুন।'], description: ['Reorder, stock adjustment and supplier performance reports help keep the business moving.','রিঅর্ডার, স্টক সমন্বয় ও সাপ্লায়ার রিপোর্টে ব্যবসার গতি বুঝুন।'] },
    { image: 'settings2', alt: 'Actual settings menu showing shift, branch, cloud and printer controls', overline: ['THE OPERATIONS','অপারেশন'], title: ['Your tools, together.','সব টুল, এক জায়গায়।'], description: ['Shift management, branch settings, cloud sync and printers are close at hand.','শিফট, শাখা, ক্লাউড সিঙ্ক ও প্রিন্টারের সেটিংস হাতের কাছেই।'] },
    { image: 'dashboard2', alt: 'Actual extended PharmaOneBD dashboard', overline: ['THE SHORTCUTS','দ্রুত প্রবেশ'], title: ['One tap to the next task.','পরের কাজে এক ট্যাপ।'], description: ['Reach sales, stock, customers, medicines, suppliers and reports straight from the dashboard.','ড্যাশবোর্ড থেকেই বিক্রি, স্টক, কাস্টমার, ওষুধ, সাপ্লায়ার ও রিপোর্টে যান।'] }
  ];
  const extraLabels = [['Stock entry','স্টক এন্ট্রি'],['Customers','কাস্টমার'],['More reports','আরও রিপোর্ট'],['Insights','বিশ্লেষণ'],['Operations','অপারেশন'],['Shortcuts','শর্টকাট']];
  const thumbContainer = document.querySelector('.gallery-thumbs');
  extraLabels.forEach(([en,bn],offset) => { const index = offset + 5; const button = document.createElement('button'); button.className = 'gallery-thumb'; button.type = 'button'; button.setAttribute('role','tab'); button.setAttribute('aria-selected','false'); button.dataset.index = index; button.dataset.screen = screens[index].image; button.innerHTML = `<span>${String(index + 1).padStart(2,'0')}</span><span data-en="${en}" data-bn="${bn}">${en}</span>`; thumbContainer.appendChild(button); });
  document.querySelector('.gallery-counter').lastChild.textContent = ` / ${String(screens.length).padStart(2,'0')}`;
  document.querySelector('.gallery-progress span').style.width = `${100 / screens.length}%`;
  const thumbs = [...document.querySelectorAll('.gallery-thumb')];
  const phone = document.querySelector('.gallery-phone');
  const galleryImage = document.querySelector('.gallery-image');
  let screenIndex = 0, imageTimer;
  function galleryCopy() {
    const item = screens[screenIndex], l = language === 'bn' ? 1 : 0;
    document.querySelector('.gallery-overline').textContent = item.overline[l];
    document.getElementById('gallery-title').textContent = item.title[l];
    document.getElementById('gallery-description').textContent = item.description[l];
  }
  function setLanguage(next) {
    language = next;
    document.documentElement.lang = next;
    document.body.classList.toggle('lang-bn', next === 'bn');
    document.querySelectorAll('[data-en][data-bn]').forEach(el => { el.textContent = el.dataset[next]; });
    toggle.innerHTML = next === 'bn' ? 'English <span aria-hidden="true">↗</span>' : 'বাংলা <span aria-hidden="true">↗</span>';
    toggle.setAttribute('aria-label', next === 'bn' ? 'Switch to English' : 'Switch to Bangla');
    galleryCopy();
    try { localStorage.setItem('pharmaone-language', next); } catch { /* Optional preference. */ }
  }
  toggle.addEventListener('click', () => setLanguage(language === 'en' ? 'bn' : 'en'));
  function closeMenu() { mobileMenu.hidden = true; menuToggle.setAttribute('aria-expanded','false'); menuToggle.setAttribute('aria-label','Open menu'); }
  function placeMenu() { mobileMenu.style.top = `${Math.max(68, 102 - scrollY)}px`; }
  menuToggle.addEventListener('click', () => { const open = mobileMenu.hidden; mobileMenu.hidden = !open; menuToggle.setAttribute('aria-expanded',String(open)); menuToggle.setAttribute('aria-label',open ? 'Close menu' : 'Open menu'); if (open) placeMenu(); });
  mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
  addEventListener('resize', () => { if (innerWidth > 760) closeMenu(); else placeMenu(); });
  addEventListener('scroll', placeMenu, { passive: true });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });
  function setScreen(index, focus = false) {
    screenIndex = (index + screens.length) % screens.length;
    const item = screens[screenIndex];
    thumbs.forEach((button,i) => { const active = i === screenIndex; button.classList.toggle('active',active); button.setAttribute('aria-selected',String(active)); button.tabIndex = active ? 0 : -1; });
    if (focus) thumbs[screenIndex].focus();
    document.getElementById('gallery-current').textContent = String(screenIndex + 1).padStart(2,'0');
    document.querySelector('.gallery-progress span').style.transform = `scaleX(${screenIndex + 1})`;
    galleryCopy(); clearTimeout(imageTimer);
    if (!reduceMotion) phone.classList.add('changing');
    imageTimer = setTimeout(() => { galleryImage.src = `./assets/screens/${item.image}.png`; galleryImage.alt = item.alt; phone.classList.toggle('is-raw',item.image === 'shelves'); phone.classList.remove('changing'); }, reduceMotion ? 0 : 180);
  }
  thumbs.forEach((button,i) => { button.addEventListener('click',() => setScreen(i)); button.addEventListener('keydown',e => { const delta = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0; if (delta) { e.preventDefault(); setScreen(i + delta,true); } }); });
  document.querySelector('.gallery-prev').addEventListener('click',() => setScreen(screenIndex - 1));
  document.querySelector('.gallery-next').addEventListener('click',() => setScreen(screenIndex + 1));
  setScreen(0);
  document.querySelectorAll('.shelf-cell').forEach(cell => cell.addEventListener('click',() => {
    document.querySelectorAll('.shelf-cell').forEach(item => item.classList.remove('selected'));
    cell.classList.add('selected');
    document.getElementById('shelf-location').textContent = cell.dataset.location;
    document.getElementById('shelf-item').textContent = cell.dataset.item;
    if (!reduceMotion && window.gsap) gsap.fromTo('.shelf-result',{y:7,opacity:.7},{y:0,opacity:1,duration:.24,ease:'power2.out'});
  }));
  document.getElementById('year').textContent = String(new Date().getFullYear());
  setLanguage(language);
  const progress = document.createElement('div'); progress.className = 'scroll-progress'; progress.setAttribute('aria-hidden','true'); document.body.appendChild(progress);
  let ticking = false;
  addEventListener('scroll',() => { if (ticking) return; ticking = true; requestAnimationFrame(() => { const max = document.documentElement.scrollHeight - innerHeight; progress.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`; ticking = false; }); },{passive:true});
  if (!reduceMotion && window.gsap) {
    gsap.from('.hero-copy > *',{y:38,opacity:0,duration:.9,stagger:.12,ease:'expo.out',delay:.1});
    gsap.from('.phone-front',{x:65,y:70,rotate:16,opacity:0,duration:1.15,ease:'expo.out',delay:.2});
    gsap.from('.phone-back',{x:-55,y:55,rotate:-20,opacity:0,duration:1.15,ease:'expo.out',delay:.28});
    gsap.from('.floating-tag',{scale:.95,y:18,opacity:0,duration:.65,stagger:.16,ease:'power3.out',delay:.8});
    gsap.to('.phone-front',{y:-13,duration:3.5,repeat:-1,yoyo:true,ease:'sine.inOut',delay:1.5});
    gsap.to('.phone-back',{y:11,duration:4.2,repeat:-1,yoyo:true,ease:'sine.inOut',delay:1.5});
    if (window.ScrollTrigger) {
      gsap.registerPlugin(ScrollTrigger);
      gsap.utils.toArray('.section-intro, .why-grid, .ai-heading, .feature-atlas article, .plan').forEach(el => gsap.from(el,{y:42,opacity:0,duration:.85,ease:'expo.out',scrollTrigger:{trigger:el,start:'top 88%',once:true}}));
      gsap.from('.gallery-phone',{rotate:12,y:80,scale:.92,duration:1.15,ease:'expo.out',scrollTrigger:{trigger:'.screen-gallery',start:'top 76%',once:true}});
      gsap.from('.shelf-cell',{y:24,opacity:0,duration:.48,stagger:.09,ease:'power3.out',scrollTrigger:{trigger:'.shelf-map',start:'top 85%',once:true}});
      gsap.from('.ai-grid article',{y:42,opacity:0,duration:.72,stagger:.12,ease:'power3.out',scrollTrigger:{trigger:'.ai-grid',start:'top 84%',once:true}});
    }
  }
})();

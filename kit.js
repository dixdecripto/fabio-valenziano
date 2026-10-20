(function(){
'use strict';
var d=document,de=d.documentElement;
de.classList.add('js');
var reduce=false;try{reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches}catch(e){}
var hasG=!!(window.gsap&&window.ScrollTrigger)&&!reduce;
if(!hasG)de.classList.add('nogsap');
function $(s,c){return (c||d).querySelector(s)}
function $$(s,c){return Array.prototype.slice.call((c||d).querySelectorAll(s))}
var pg=$('.pg');

/* ---- i18n ---- */
var DICT={};try{DICT=JSON.parse($('#i18n').textContent)}catch(e){}
var cur='it';
function T(k){var v=DICT[cur]&&DICT[cur][k];return typeof v==='string'?v:''}
function apply(lang){
  var m=DICT[lang];if(!m)return;
  cur=lang;
  $$('[data-i]').forEach(function(n){
    var k=n.getAttribute('data-i'),v=m[k];if(v==null)return;
    var h=/_html$/.test(k);
    if(Array.isArray(v)){
      n.innerHTML='';
      var tag=(n.tagName==='UL'||n.tagName==='OL')?'li':'p';
      v.forEach(function(x){var e=d.createElement(tag);if(h)e.innerHTML=x;else e.textContent=x;n.appendChild(e)});
    }else if(h){n.innerHTML=v}else{n.textContent=v}
  });
  $$('[data-i-ph]').forEach(function(n){var v=m[n.getAttribute('data-i-ph')];if(v!=null)n.setAttribute('placeholder',v)});
  $$('[data-i-alt]').forEach(function(n){var v=m[n.getAttribute('data-i-alt')];if(v!=null)n.setAttribute('alt',v)});
  $$('[data-i-aria]').forEach(function(n){var v=m[n.getAttribute('data-i-aria')];if(v!=null)n.setAttribute('aria-label',v)});
  de.setAttribute('lang',lang);
  if(m._title)d.title=m._title;
  $$('[data-lang]').forEach(function(b){b.setAttribute('aria-pressed',b.getAttribute('data-lang')===lang?'true':'false')});
  syncMenuLabel();
}
function setLang(lang,persist){
  apply(lang);
  if(persist){try{localStorage.setItem('fv-lang',lang)}catch(e){}}
  if(hasG){try{window.ScrollTrigger.refresh()}catch(e){}}
}
var stored=null;try{stored=localStorage.getItem('fv-lang')}catch(e){}
$$('[data-lang]').forEach(function(b){b.addEventListener('click',function(){setLang(b.getAttribute('data-lang'),true)})});
apply(stored==='en'?'en':'it');

/* ---- menu ---- */
var mb=$('.menu-btn');
function syncMenuLabel(){
  if(!mb)return;
  var open=mb.getAttribute('aria-expanded')==='true';
  mb.setAttribute('data-i',open?'close':'menu');
  mb.textContent=T(open?'close':'menu')||(open?'Chiudi':'Menu');
}
function menu(open){
  if(!mb)return;
  mb.setAttribute('aria-expanded',open?'true':'false');
  pg.classList.toggle('menu-open',open);
  de.style.overflow=open?'hidden':'';
  syncMenuLabel();
}
if(mb){
  mb.addEventListener('click',function(){menu(mb.getAttribute('aria-expanded')!=='true')});
  $$('.ov nav a').forEach(function(a){a.addEventListener('click',function(){menu(false)})});
  d.addEventListener('keydown',function(e){if(e.key==='Escape')menu(false)});
  window.addEventListener('resize',function(){if(window.innerWidth>=1000)menu(false)});
}

/* ---- header ---- */
var head=$('.site-head');
function onScroll(){if(head&&pg.classList.contains('home'))head.classList.toggle('solid',(window.pageYOffset||de.scrollTop)>40||pg.classList.contains('menu-open'))}
window.addEventListener('scroll',onScroll,{passive:true});onScroll();
if(mb)mb.addEventListener('click',function(){if(head&&pg.classList.contains('home'))head.classList.add('solid');setTimeout(onScroll,0)});

/* ---- reveal ---- */
$$('[data-stagger]').forEach(function(p){
  Array.prototype.filter.call(p.children,function(c){return c.classList.contains('reveal')}).forEach(function(c,i){c.style.setProperty('--d',i)});
});
(function(){
  var els=$$('.reveal,.grow,.clipbox'),vh=window.innerHeight||de.clientHeight;
  var rest=[];
  els.forEach(function(el){
    var r=el.getBoundingClientRect();
    if(r.top<vh*0.96&&r.bottom>0){el.classList.add('now');el.classList.add('in')}else rest.push(el);
  });
  if(!('IntersectionObserver' in window)){rest.forEach(function(el){el.classList.add('in')});return}
  var io=new IntersectionObserver(function(es){es.forEach(function(en){if(en.isIntersecting){en.target.classList.add('in');io.unobserve(en.target)}})},{threshold:.12,rootMargin:'0px 0px -6% 0px'});
  rest.forEach(function(el){io.observe(el)});
  var tk=false;
  window.addEventListener('scroll',function(){if(tk)return;tk=true;requestAnimationFrame(function(){tk=false;var h=window.innerHeight||de.clientHeight;rest=rest.filter(function(el){if(el.classList.contains('in'))return false;var r=el.getBoundingClientRect();if(r.top<h*0.96&&r.bottom>0){el.classList.add('in');return false}return true})})},{passive:true});
})();

/* ---- split letters ---- */
$$('[data-split]').forEach(function(el){
  var label=el.textContent.replace(/\s+/g,' ').trim();
  el.setAttribute('aria-label',label);
  var i=0;
  $$('.ln',el).forEach(function(ln){
    var t=ln.textContent;ln.textContent='';ln.setAttribute('aria-hidden','true');
    for(var k=0;k<t.length;k++){
      var c=d.createElement('span');c.className='ch';
      var s=d.createElement('span');s.textContent=t.charAt(k);s.style.setProperty('--i',i++);
      c.appendChild(s);ln.appendChild(c);
    }
  });
});

/* ---- practice areas index ---- */
(function(){
  var links=$$('.pa-index a');if(!links.length||!('IntersectionObserver' in window))return;
  var blocks=$$('.pa-block');
  var io=new IntersectionObserver(function(es){es.forEach(function(en){
    if(en.isIntersecting){
      links.forEach(function(a){var on=a.getAttribute('href')==='#'+en.target.id;a.classList.toggle('on',on);if(on)a.setAttribute('aria-current','true');else a.removeAttribute('aria-current')});
    }
  })},{rootMargin:'-40% 0px -55% 0px'});
  blocks.forEach(function(b){io.observe(b)});
})();

/* ---- forms + copy ---- */
$$('[data-form]').forEach(function(f){
  f.addEventListener('submit',function(e){
    e.preventDefault();
    var n=$('.notice',f);if(n){n.hidden=false;try{n.scrollIntoView({block:'nearest',behavior:reduce?'auto':'smooth'})}catch(x){}}
  });
});
function selectNode(n){try{var r=d.createRange();r.selectNodeContents(n);var s=window.getSelection();s.removeAllRanges();s.addRange(r)}catch(e){}}
$$('[data-copy]').forEach(function(b){
  b.addEventListener('click',function(){
    var txt=b.getAttribute('data-copy');
    var holder=b.parentNode&&b.parentNode.querySelector('.sel');
    var done=function(){
      b.textContent=T('copied')||'Copiato';
      setTimeout(function(){b.textContent=T('copy')||'Copia'},1800);
    };
    var fallback=function(){
      if(holder)selectNode(holder);
      try{if(d.execCommand&&d.execCommand('copy'))done()}catch(e){}
    };
    try{
      if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(txt).then(done,fallback)}
      else fallback();
    }catch(e){fallback()}
  });
});

/* ---- GSAP ---- */
if(hasG){
  try{
    var gsap=window.gsap,ST=window.ScrollTrigger;
    gsap.registerPlugin(ST);
    ST.config({ignoreMobileResize:true});
    var ls=$$('.hero .ch>span');
    if(ls.length){
      gsap.from(ls,{yPercent:115,duration:1.15,ease:'power4.out',stagger:.03,delay:.15});
      gsap.from($$('.hero-k'),{y:26,opacity:0,duration:1.1,ease:'power3.out',stagger:.14,delay:.65});
      var him=$('.hero-media img');
      if(him){
        gsap.fromTo(him,{scale:1.12},{scale:1,duration:3.2,ease:'power2.out'});
        gsap.to(him,{y:-80,ease:'none',scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:true}});
      }
    }
    $$('.phead-media img').forEach(function(im){
      var tr=im.closest('.phead');
      gsap.fromTo(im,{scale:1.02,yPercent:0},{scale:1.22,yPercent:7,ease:'none',scrollTrigger:{trigger:tr,start:'top top',end:'bottom top',scrub:true}});
    });
    $$('.sh-r img').forEach(function(im){
      gsap.fromTo(im,{scale:1.02},{scale:1.2,ease:'none',scrollTrigger:{trigger:im.parentNode,start:'top bottom',end:'bottom top',scrub:true}});
    });
    $$('[data-par]').forEach(function(el){
      var a=parseFloat(el.getAttribute('data-par'))||40;
      gsap.fromTo(el,{y:a},{y:-a,ease:'none',scrollTrigger:{trigger:el.parentNode,start:'top bottom',end:'bottom top',scrub:true}});
    });
    (function(){
      var run=function(el){if(el.__c)return;el.__c=1;var n=parseInt(el.getAttribute('data-count'),10)||0;el.textContent=(n<10?'0':'')+n;};
      var cs=$$('[data-count]');
      if('IntersectionObserver' in window){var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){run(e.target);io.unobserve(e.target);}});},{threshold:.2});cs.forEach(function(el){io.observe(el);});}
      else cs.forEach(run);
    })();
    var hs=$('.hs'),tr=$('.hs-track');
    if(hs&&tr&&gsap.matchMedia){
      var mm=gsap.matchMedia();
      mm.add('(min-width: 1024px)',function(){
        hs.classList.add('hs-on');
        var dist=function(){return Math.max(0,tr.scrollWidth-window.innerWidth)};
        gsap.to(tr,{x:function(){return -dist()},ease:'none',scrollTrigger:{trigger:hs,start:'top 85%',end:'bottom 15%',scrub:.8,invalidateOnRefresh:true}});
        return function(){hs.classList.remove('hs-on')};
      });
    }
    var rf=function(){try{ST.refresh()}catch(e){}};
    if(d.fonts&&d.fonts.ready)d.fonts.ready.then(rf);
    window.addEventListener('load',rf);
  }catch(err){if(window.console)console.warn(err)}
}
})();

/* Indirizzo del servizio di invio moduli (es. Formspree: 'https://formspree.io/f/xxxxxxx').
   Se vuoto, il modulo compone un'email a info@fabiovalenziano.com con il programma di posta del visitatore. */
var FORM_ENDPOINT = '';
var FORM_EMAIL = 'info@fabiovalenziano.com';

(function(){
  var lang=(document.documentElement.lang||'it').slice(0,2)==='en'?'en':'it';
  var T={
    it:{mail:'Si sta aprendo il tuo programma di posta con la richiesta già compilata: per completare l’invio premi «Invia». Se non si apre, scrivi direttamente a '+FORM_EMAIL+'.',
        sending:'Invio in corso…', ok:'Grazie. La richiesta è stata inviata: lo Studio ti ricontatterà.',
        err:'Invio non riuscito. Riprova più tardi o scrivi direttamente a '+FORM_EMAIL+'.',
        subj:'Richiesta di consulenza', page:'Pagina'},
    en:{mail:'Your email program is opening with the request already filled in: press “Send” to complete it. If it does not open, please write directly to '+FORM_EMAIL+'.',
        sending:'Sending…', ok:'Thank you. Your request has been sent and the firm will be in touch.',
        err:'Your request could not be sent. Please try again later or write directly to '+FORM_EMAIL+'.',
        subj:'Consultation request', page:'Page'}
  }[lang];

  /* intestazione compatta */
  var hdr=document.querySelector('.site-header');
  function onScroll(){ if(hdr) hdr.classList.toggle('compact', window.scrollY>40); }
  onScroll(); window.addEventListener('scroll',onScroll,{passive:true});

  /* menu a hamburger (sotto 1480px) */
  var burger=document.querySelector('.burger'), nav=document.getElementById('nav');
  function setMenu(open){
    if(!burger||!nav) return;
    nav.classList.toggle('open',open);
    burger.setAttribute('aria-expanded',open?'true':'false');
    document.body.classList.toggle('menu-open',open);
  }
  if(burger&&nav){
    burger.addEventListener('click',function(){ setMenu(burger.getAttribute('aria-expanded')!=='true'); });
    nav.addEventListener('click',function(e){ if(e.target.closest&&e.target.closest('a')) setMenu(false); });
    window.addEventListener('resize',function(){ if(window.innerWidth>=1480) setMenu(false); });
  }

  /* sottomenu a tendina: hover e focus via CSS, apertura con il pulsante e con la tastiera */
  var subs=[].slice.call(document.querySelectorAll('.has-sub'));
  function closeSub(li,focusBtn){
    li.classList.remove('open');
    var b=li.querySelector('.sub-tg'); if(b){ b.setAttribute('aria-expanded','false'); if(focusBtn) b.focus(); }
  }
  subs.forEach(function(li){
    var btn=li.querySelector('.sub-tg');
    if(!btn) return;
    btn.addEventListener('click',function(){
      var open=!li.classList.contains('open');
      subs.forEach(function(o){ if(o!==li) closeSub(o); });
      li.classList.toggle('open',open); li.classList.remove('sub-closed');
      btn.setAttribute('aria-expanded',open?'true':'false');
      if(open){ var first=li.querySelector('.sub a'); if(first&&window.matchMedia('(min-width:1480px)').matches) first.focus(); }
    });
    li.addEventListener('keydown',function(e){
      var links=[].slice.call(li.querySelectorAll('.sub a')), i=links.indexOf(document.activeElement);
      if(e.key==='Escape'){ closeSub(li,true); li.classList.add('sub-closed'); e.stopPropagation(); }
      else if(e.key==='ArrowDown'&&links.length){ e.preventDefault(); if(!li.classList.contains('open')){ li.classList.add('open'); btn.setAttribute('aria-expanded','true'); } links[Math.min(i+1,links.length-1)].focus(); }
      else if(e.key==='ArrowUp'&&i>-1){ e.preventDefault(); if(i===0) btn.focus(); else links[i-1].focus(); }
    });
    li.addEventListener('focusout',function(e){ if(!li.contains(e.relatedTarget)){ closeSub(li); li.classList.remove('sub-closed'); } });
    li.addEventListener('mouseleave',function(){ li.classList.remove('sub-closed'); });
  });
  document.addEventListener('keydown',function(e){ if(e.key==='Escape'){ setMenu(false); subs.forEach(function(li){ closeSub(li); }); } });
  document.addEventListener('click',function(e){ subs.forEach(function(li){ if(!li.contains(e.target)) closeSub(li); }); });

  /* comparsa al passaggio */
  var els=[].slice.call(document.querySelectorAll('.reveal'));
  if('IntersectionObserver' in window){
    var io=new IntersectionObserver(function(entries){
      entries.forEach(function(en){ if(en.isIntersecting){ en.target.classList.add('in'); io.unobserve(en.target); } });
    },{threshold:0.12,rootMargin:'0px 0px -6% 0px'});
    els.forEach(function(el){ io.observe(el); });
  } else { els.forEach(function(el){ el.classList.add('in'); }); }

  /* filtro per categoria negli Insights */
  var flts=[].slice.call(document.querySelectorAll('.flt'));
  flts.forEach(function(b){
    b.addEventListener('click',function(){
      var c=b.getAttribute('data-cat');
      flts.forEach(function(o){ var on=o===b; o.classList.toggle('on',on); o.setAttribute('aria-pressed',on?'true':'false'); });
      document.querySelectorAll('.arts .art').forEach(function(a){ var show=!c||a.getAttribute('data-cat')===c; a.hidden=!show; if(show) a.classList.add('in'); });
    });
  });

  /* moduli di contatto */
  function fieldLabel(el){
    var l=el.closest('label'), s=l&&l.querySelector('span');
    return s?s.textContent.replace(/\*/g,'').trim():el.name;
  }
  function collect(form){
    var rows=[], data={};
    [].slice.call(form.querySelectorAll('input,select,textarea')).forEach(function(el){
      if(!el.name||el.type==='checkbox') return;
      var v=(el.value||'').trim(); data[el.name]=v;
      if(v) rows.push(fieldLabel(el)+': '+v);
    });
    data.scheda=form.getAttribute('data-kind'); data.privacy=true; data.lingua_pagina=lang;
    return {rows:rows,data:data};
  }
  function status(form,msg,err){
    var s=form.querySelector('.form-status'); if(!s) return;
    s.textContent=msg; s.hidden=false; s.classList.toggle('err',!!err);
    s.scrollIntoView({block:'nearest',behavior:'smooth'});
  }
  var forms=[].slice.call(document.querySelectorAll('.cform'));
  forms.forEach(function(form){
    form.addEventListener('submit',function(e){
      e.preventDefault();
      if(!form.checkValidity()){ form.reportValidity(); return; }
      var c=collect(form), kind=form.getAttribute('data-kind'), cat=c.data.categoria||'';
      var subject=T.subj+' — '+kind+(cat?' — '+cat:'');
      var btn=form.querySelector('button[type=submit]');
      if(FORM_ENDPOINT){
        if(btn) btn.disabled=true;
        status(form,T.sending,false);
        c.data._subject=subject;
        fetch(FORM_ENDPOINT,{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify(c.data)})
          .then(function(r){ if(!r.ok) throw new Error(r.status); status(form,T.ok,false); form.reset(); })
          .catch(function(){ status(form,T.err,true); })
          .then(function(){ if(btn) btn.disabled=false; });
      } else {
        var body=c.rows.join('\n')+'\n\n'+T.page+': '+location.href;
        status(form,T.mail,false);
        window.location.href='mailto:'+FORM_EMAIL+'?subject='+encodeURIComponent(subject)+'&body='+encodeURIComponent(body);
      }
    });
  });

  /* schede Business / Private Clients */
  var tabs=[].slice.call(document.querySelectorAll('.tab'));
  if(tabs.length){
    var show=function(id,focus){
      tabs.forEach(function(tb){ var on=tb.id==='tab-'+id; tb.classList.toggle('on',on); tb.setAttribute('aria-selected',on?'true':'false'); tb.tabIndex=on?0:-1; if(on&&focus) tb.focus(); });
      forms.forEach(function(f){ f.hidden=(f.id!=='cform-'+id); });
    };
    tabs.forEach(function(tb,i){
      tb.addEventListener('click',function(){ show(tb.id.replace('tab-','')); });
      tb.addEventListener('keydown',function(e){
        if(e.key==='ArrowRight'||e.key==='ArrowLeft'){ e.preventDefault(); var n=tabs[(i+(e.key==='ArrowRight'?1:tabs.length-1))%tabs.length]; show(n.id.replace('tab-',''),true); }
      });
    });
    show(location.hash==='#private'?'private':'business');
  }
})();

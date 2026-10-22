(function(){
  var hdr=document.querySelector('.site-header');
  function onScroll(){ if(hdr) hdr.classList.toggle('compact', window.scrollY>40); }
  onScroll(); window.addEventListener('scroll',onScroll,{passive:true});

  var burger=document.querySelector('.burger'), nav=document.getElementById('nav');
  function setMenu(open){
    if(!burger||!nav) return;
    nav.classList.toggle('open',open);
    burger.setAttribute('aria-expanded',open?'true':'false');
    document.body.classList.toggle('menu-open',open);
  }
  if(burger){
    burger.addEventListener('click',function(){ setMenu(burger.getAttribute('aria-expanded')!=='true'); });
    nav.addEventListener('click',function(e){ if(e.target.tagName==='A') setMenu(false); });
    document.addEventListener('keydown',function(e){ if(e.key==='Escape') setMenu(false); });
    window.addEventListener('resize',function(){ if(window.innerWidth>=1480) setMenu(false); });
  }

  var els=[].slice.call(document.querySelectorAll('.reveal'));
  if('IntersectionObserver' in window){
    var io=new IntersectionObserver(function(entries){
      entries.forEach(function(en){ if(en.isIntersecting){ en.target.classList.add('in'); io.unobserve(en.target); } });
    },{threshold:0.12,rootMargin:'0px 0px -6% 0px'});
    els.forEach(function(el){ io.observe(el); });
  } else { els.forEach(function(el){ el.classList.add('in'); }); }

  var forms=[].slice.call(document.querySelectorAll('.cform'));
  forms.forEach(function(form){
    form.addEventListener('submit',function(e){
      e.preventDefault();
      if(!form.checkValidity()){ form.reportValidity(); return; }
      var t=form.querySelector('.thanks'); if(t){ t.hidden=false; t.scrollIntoView({block:'nearest',behavior:'smooth'}); }
      form.querySelectorAll('input[type=text],input[type=email],input[type=tel],textarea').forEach(function(f){ f.value=''; });
    });
  });
  var tabs=[].slice.call(document.querySelectorAll('.tab'));
  if(tabs.length){
    var show=function(id){
      tabs.forEach(function(tb){ var on=tb.id==='tab-'+id; tb.classList.toggle('on',on); tb.setAttribute('aria-selected',on?'true':'false'); });
      forms.forEach(function(f){ f.hidden=(f.id!=='cform-'+id); });
    };
    tabs.forEach(function(tb){ tb.addEventListener('click',function(){ show(tb.id.replace('tab-','')); }); });
    show(location.hash==='#private'?'private':'business');
  }
})();

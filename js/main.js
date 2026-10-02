(function(){
  var b=document.querySelector('.burger'),n=document.getElementById('nav');
  if(b)b.addEventListener('click',function(){var o=n.classList.toggle('open');b.setAttribute('aria-expanded',o)});
  var y=document.getElementById('y');if(y)y.textContent=new Date().getFullYear();
  var els=document.querySelectorAll('.reveal');
  if('IntersectionObserver' in window){
    var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{threshold:.12});
    els.forEach(function(e){io.observe(e)});
  }else els.forEach(function(e){e.classList.add('in')});

  /* Tab-uri pe pagina de prețuri */
  var tabs=document.querySelectorAll('.tabs [role="tab"]');
  tabs.forEach(function(t){
    t.addEventListener('click',function(){
      tabs.forEach(function(o){
        var on=o===t; o.setAttribute('aria-selected',on);
        document.getElementById(o.getAttribute('aria-controls')).classList.toggle('active',on);
      });
    });
  });

  /* Formular: deschide emailul cu cererea completată */
  var f=document.getElementById('f');
  if(f)f.addEventListener('submit',function(e){
    e.preventDefault();
    var v=function(k){return f.elements[k].value.trim()};
    var body='Nume: '+v('n')+'\nTelefon: '+v('t')+'\nServiciu: '+v('s')+'\n\n'+v('m');
    location.href='mailto:nvoltenergysrl@gmail.com?subject='+encodeURIComponent('Cerere ofertă – '+v('s'))+'&body='+encodeURIComponent(body);
    document.getElementById('ok').style.display='block';
  });

  /* Efect de aprindere la apăsare (doar la click/tap). Gold = CTA principale și telefon; albastru = restul. */
  function flash(el){
    var gold=el.classList.contains('btn-primary')||el.classList.contains('cta')||(el.getAttribute('href')||'').indexOf('tel:')===0;
    el.classList.remove('press-gold','press-blue');
    void el.offsetWidth;
    el.classList.add(gold?'press-gold':'press-blue');
  }
  document.querySelectorAll('.btn,.cta,.chip,.pgroup,.card,.contact-list a,.tabs button,nav a:not(.cta)').forEach(function(el){
    el.addEventListener('pointerdown',function(){flash(el)});
    el.addEventListener('animationend',function(){el.classList.remove('press-gold','press-blue')});
  });
})();

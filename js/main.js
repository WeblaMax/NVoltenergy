(function(){
  var b=document.querySelector('.burger'),n=document.getElementById('nav');
  if(b)b.addEventListener('click',function(){var o=n.classList.toggle('open');b.setAttribute('aria-expanded',o)});
  var y=document.getElementById('y');if(y)y.textContent=new Date().getFullYear();
  var els=document.querySelectorAll('.reveal');
  if('IntersectionObserver' in window){
    var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{threshold:.12});
    els.forEach(function(e){io.observe(e)});
  }else els.forEach(function(e){e.classList.add('in')});
  var f=document.getElementById('f');
  if(f)f.addEventListener('submit',function(e){e.preventDefault();document.getElementById('ok').style.display='block';f.reset()});
})();

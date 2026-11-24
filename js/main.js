/* 交互脚本：导航、滚动入场、视差、阅读进度 */
(function () {
  'use strict';

  var nav = document.querySelector('.nav');
  var toggle = document.querySelector('.nav-toggle');
  var progress = document.querySelector('.progress');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* 导航栏滚动态 + 阅读进度 */
  function onScroll() {
    var y = window.pageYOffset || document.documentElement.scrollTop;
    if (nav) nav.classList.toggle('solid', y > 60);

    if (progress) {
      var h = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.width = (h > 0 ? (y / h) * 100 : 0) + '%';
    }

    /* 视差：首屏与页头背景轻微位移 */
    if (!reduce) {
      var px = document.querySelectorAll('[data-parallax]');
      for (var i = 0; i < px.length; i++) {
        var el = px[i];
        var rect = el.parentElement.getBoundingClientRect();
        if (rect.bottom > -200 && rect.top < window.innerHeight + 200) {
          el.style.transform = 'translate3d(0,' + (y - rect.top) * 0.12 + 'px,0)';
        }
      }
    }
  }

  var ticking = false;
  window.addEventListener('scroll', function () {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(function () {
        onScroll();
        ticking = false;
      });
    }
  }, { passive: true });

  /* 移动端菜单 */
  if (toggle) {
    toggle.addEventListener('click', function () {
      nav.classList.toggle('open');
    });
    nav.querySelectorAll('.nav-links a').forEach(function (a) {
      a.addEventListener('click', function () { nav.classList.remove('open'); });
    });
  }

  /* 滚动入场 */
  var items = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    items.forEach(function (el) { io.observe(el); });
  } else {
    items.forEach(function (el) { el.classList.add('in'); });
  }

  /* 封面随鼠标微倾（仅桌面） */
  var books = document.querySelectorAll('.book');
  if (window.matchMedia('(hover:hover)').matches && !reduce) {
    books.forEach(function (b) {
      var inner = b.querySelector('.book-inner');
      if (!inner) return;
      b.addEventListener('mousemove', function (ev) {
        var r = b.getBoundingClientRect();
        var dx = (ev.clientX - r.left) / r.width - 0.5;
        var dy = (ev.clientY - r.top) / r.height - 0.5;
        inner.style.transform = 'translateY(-14px) rotateY(' + (-7 + dx * 10) +
          'deg) rotateX(' + (2 - dy * 8) + 'deg) scale(1.015)';
      });
      b.addEventListener('mouseleave', function () { inner.style.transform = ''; });
    });
  }

  /* 首屏数字逐格浮出的“尘埃”氛围 */
  var canvas = document.getElementById('dust');
  if (canvas && !reduce) {
    var ctx = canvas.getContext('2d');
    var dots = [];
    var dpr = Math.min(window.devicePixelRatio || 1, 2);

    function resize() {
      canvas.width = canvas.offsetWidth * dpr;
      canvas.height = canvas.offsetHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = Math.round(canvas.offsetWidth / 26);
      dots = [];
      for (var i = 0; i < n; i++) {
        dots.push({
          x: Math.random() * canvas.offsetWidth,
          y: Math.random() * canvas.offsetHeight,
          r: Math.random() * 1.6 + 0.4,
          vx: (Math.random() - 0.5) * 0.16,
          vy: -Math.random() * 0.18 - 0.04,
          a: Math.random() * 0.5 + 0.15
        });
      }
    }

    function loop() {
      ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
      for (var i = 0; i < dots.length; i++) {
        var d = dots[i];
        d.x += d.vx; d.y += d.vy;
        if (d.y < -10) { d.y = canvas.offsetHeight + 10; d.x = Math.random() * canvas.offsetWidth; }
        if (d.x < -10) d.x = canvas.offsetWidth + 10;
        if (d.x > canvas.offsetWidth + 10) d.x = -10;
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(233,227,215,' + d.a * 0.55 + ')';
        ctx.fill();
      }
      window.requestAnimationFrame(loop);
    }

    resize();
    window.addEventListener('resize', resize);
    loop();
  }

  /* 年份 */
  var y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();

  onScroll();
})();

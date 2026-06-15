/* ═══════════════════════════════════════════════════════════
   СВАДЕБНЫЙ САЙТ — Кирилл & Ксения · 08.08.2026
   script.js — анимации, таймер, форма, музыка
   ═══════════════════════════════════════════════════════════ */

/* ─── EMAILJS НАСТРОЙКИ ─────────────────────────────────────
   Зарегистрируйтесь на https://www.emailjs.com/ и замените:
   ═══════════════════════════════════════════════════════════ */
const EMAILJS_PUBLIC_KEY  = 'S1sJorMjgUeLbzSlG';    // ← Public Key из Account > API Keys
const EMAILJS_SERVICE_ID  = 'service_fil7r08';   // ← Service ID из Email Services
const EMAILJS_TEMPLATE_ID = 'template_2vse3sx';  // ← Template ID из Email Templates

/* ─── ДАТА СВАДЬБЫ ───────────────────────────────────────── */
const WEDDING_DATE = new Date('2026-08-08T10:00:00');

/* ══════════════════════════════════════════════════════════
   ИНИЦИАЛИЗАЦИЯ EmailJS
   Вызывается один раз при загрузке страницы
   ══════════════════════════════════════════════════════════ */
(function () {
  if (typeof emailjs !== 'undefined') {
    emailjs.init(EMAILJS_PUBLIC_KEY);
  }
})();

/* ══════════════════════════════════════════════════════════
   КОНВЕРТ — ЭКРАН ПРИВЕТСТВИЯ
   ══════════════════════════════════════════════════════════ */
(function () {
  const envelopeScreen = document.getElementById('envelope-screen');
  const mainSite       = document.getElementById('main-site');
  const openBtn        = document.getElementById('open-btn');

  if (!envelopeScreen || !mainSite || !openBtn) return;

  /* Пульсация печати — подсказка пользователю */
  let pulseTimer = setTimeout(() => {
    openBtn.style.animation = 'seal-pulse 1.2s ease-in-out 3';
  }, 1500);

  /* CSS для пульсации — добавляем динамически */
  const style = document.createElement('style');
  style.textContent = `
    @keyframes seal-pulse {
      0%, 100% { transform: scale(1); }
      50%       { transform: scale(1.1); }
    }
    @keyframes envelope-open-top {
      0%   { transform: rotateX(0deg); }
      100% { transform: rotateX(-180deg); }
    }
    @keyframes envelope-open-bottom {
      0%   { transform: translateY(0); opacity: 1; }
      100% { transform: translateY(60px); opacity: 0; }
    }
  `;
  document.head.appendChild(style);

  /* Открытие конверта по нажатию */
  openBtn.addEventListener('click', function () {
    clearTimeout(pulseTimer);

    /* Применяем анимацию закрытия конверта */
    envelopeScreen.classList.add('closing');

    /* Показываем основной сайт с задержкой */
    setTimeout(() => {
      envelopeScreen.style.display = 'none';
      mainSite.classList.remove('hidden');

      /* Запускаем появление hero-элементов */
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          triggerHeroAnimations();
          initScrollAnimations();
          initNavScroll();
          initCountdown();
          initMusicBtn();
          initRSVPForm();
        });
      });

      /* Авто-проигрывание музыки (многие браузеры блокируют без жеста) */
      autoPlayMusic();

    }, 800);
  });
})();

/* ══════════════════════════════════════════════════════════
   HERO — мгновенное появление при открытии
   ══════════════════════════════════════════════════════════ */
function triggerHeroAnimations() {
  const heroItems = document.querySelectorAll('.hero-section .fade-up');
  heroItems.forEach((el, i) => {
    setTimeout(() => {
      el.classList.add('visible');
    }, i * 120);
  });
}

/* ══════════════════════════════════════════════════════════
   SCROLL-АНИМАЦИИ — Intersection Observer
   Появление блоков при скролле (fade-up)
   ══════════════════════════════════════════════════════════ */
function initScrollAnimations() {
  const fadeElements = document.querySelectorAll('.fade-up:not(.visible)');

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target); /* Анимировать только один раз */
        }
      });
    },
    {
      threshold: 0.12,    /* Начинать появление при 12% видимости */
      rootMargin: '0px 0px -40px 0px',
    }
  );

  fadeElements.forEach((el) => observer.observe(el));
}

/* ══════════════════════════════════════════════════════════
   НАВИГАЦИЯ — фиксированная панель при скролле
   ══════════════════════════════════════════════════════════ */
function initNavScroll() {
  const nav = document.getElementById('nav');
  if (!nav) return;

  const onScroll = () => {
    if (window.scrollY > 60) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* Плавный скролл к якорям */
  nav.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  /* Плавный скролл для всех якорных ссылок на странице */
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href === '#') return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}

/* ══════════════════════════════════════════════════════════
   ТАЙМЕР ОБРАТНОГО ОТСЧЁТА
   ══════════════════════════════════════════════════════════ */
function initCountdown() {
  const daysEl    = document.getElementById('days');
  const hoursEl   = document.getElementById('hours');
  const minutesEl = document.getElementById('minutes');
  const secondsEl = document.getElementById('seconds');

  if (!daysEl) return;

  function pad(num) {
    return String(num).padStart(2, '0');
  }

  function updateCountdown() {
    const now  = new Date();
    const diff = WEDDING_DATE - now;

    if (diff <= 0) {
      /* Свадьба уже состоялась */
      daysEl.textContent    = '00';
      hoursEl.textContent   = '00';
      minutesEl.textContent = '00';
      secondsEl.textContent = '00';

      /* Показать красивое сообщение */
      const countdownEl = document.getElementById('countdown');
      if (countdownEl) {
        countdownEl.insertAdjacentHTML('afterend',
          '<p style="font-family:var(--font-script);font-size:clamp(24px,4vw,40px);color:var(--clr-cream);text-align:center;margin-top:24px;opacity:0.8;">Этот день наступил! 💍</p>'
        );
      }
      return;
    }

    const totalSeconds = Math.floor(diff / 1000);
    const days    = Math.floor(totalSeconds / 86400);
    const hours   = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    /* Обновляем с флип-эффектом только при изменении */
    function setWithFlip(el, val) {
      const newVal = pad(val);
      if (el.textContent !== newVal) {
        el.style.transform = 'translateY(-8px)';
        el.style.opacity = '0';
        el.style.transition = 'transform 0.15s ease, opacity 0.15s ease';

        setTimeout(() => {
          el.textContent = newVal;
          el.style.transform = 'translateY(6px)';
          setTimeout(() => {
            el.style.transform = 'translateY(0)';
            el.style.opacity   = '1';
          }, 10);
        }, 150);
      }
    }

    setWithFlip(daysEl,    days);
    setWithFlip(hoursEl,   hours);
    setWithFlip(minutesEl, minutes);
    setWithFlip(secondsEl, seconds);
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);
}

/* ══════════════════════════════════════════════════════════
   КНОПКА МУЗЫКИ — Perfect by Ed Sheeran
   ══════════════════════════════════════════════════════════ */
function initMusicBtn() {
  const musicBtn  = document.getElementById('music-btn');
  const bgMusic   = document.getElementById('bg-music');

  if (!musicBtn || !bgMusic) return;

  let isPlaying = false;

  musicBtn.addEventListener('click', () => {
    if (isPlaying) {
      bgMusic.pause();
      isPlaying = false;
      musicBtn.classList.remove('playing');
      musicBtn.title = 'Включить музыку';
    } else {
      const playPromise = bgMusic.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            isPlaying = true;
            musicBtn.classList.add('playing');
            musicBtn.title = 'Выключить музыку';
          })
          .catch(() => {
            /* Браузер заблокировал автоплей — показываем иконку */
            console.log('Autoplay blocked by browser policy');
          });
      }
    }
  });
}

function autoPlayMusic() {
  const bgMusic  = document.getElementById('bg-music');
  const musicBtn = document.getElementById('music-btn');
  if (!bgMusic) return;

  bgMusic.volume = 0.4;

  const tryPlay = bgMusic.play();
  if (tryPlay !== undefined) {
    tryPlay
      .then(() => {
        if (musicBtn) {
          musicBtn.classList.add('playing');
          musicBtn.title = 'Выключить музыку';
        }
      })
      .catch(() => {
        /* Тихо — пользователь может включить сам */
      });
  }
}

/* ══════════════════════════════════════════════════════════
   RSVP ФОРМА — валидация и отправка через EmailJS
   ══════════════════════════════════════════════════════════ */
function initRSVPForm() {
  const form        = document.getElementById('rsvp-form');
  const submitBtn   = document.getElementById('submit-btn');
  const successMsg  = document.getElementById('form-success');
  const errorMsg    = document.getElementById('form-error');

  if (!form) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    /* ─── Валидация ──────────────────────────────────────── */
    let isValid = true;

    /* Проверка имени */
    const nameInput = document.getElementById('guest-name');
    if (!nameInput.value.trim()) {
      showFieldError(nameInput, 'Пожалуйста, введите ваше имя');
      isValid = false;
    } else {
      clearFieldError(nameInput);
    }

    /* Проверка присутствия */
    const attendanceRadios = form.querySelectorAll('input[name="attendance"]');
    const attendanceChecked = Array.from(attendanceRadios).some(r => r.checked);
    const attendanceGroup   = form.querySelector('.radio-group');

    if (!attendanceChecked) {
      if (attendanceGroup) {
        attendanceGroup.style.outline = '2px solid #C0392B';
        attendanceGroup.style.borderRadius = '8px';
        attendanceGroup.style.padding = '8px';
      }
      isValid = false;
    } else {
      if (attendanceGroup) {
        attendanceGroup.style.outline = '';
        attendanceGroup.style.padding = '';
      }
    }

    if (!isValid) {
      /* Мягко прокручиваем к первой ошибке */
      const firstError = form.querySelector('.error, [style*="outline: 2px"]');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    /* ─── Сбор данных формы ──────────────────────────────── */
    const guestName  = nameInput.value.trim();
    const attendance = form.querySelector('input[name="attendance"]:checked')?.value || '';
    const drinks     = Array.from(form.querySelectorAll('input[name="drinks"]:checked'))
                         .map(cb => cb.value)
                         .join(', ') || 'Не указано';
    const comment    = document.getElementById('comment')?.value.trim() || '';

    /* ─── Состояние кнопки — загрузка ───────────────────── */
    submitBtn.disabled = true;
    submitBtn.textContent = 'Отправляю...';
    submitBtn.style.opacity = '0.75';

    /* ─── Скрываем предыдущие сообщения ─────────────────── */
    successMsg.classList.add('hidden');
    errorMsg.classList.add('hidden');

    /* ─── Параметры шаблона EmailJS ─────────────────────── */
    /* Убедитесь, что в шаблоне EmailJS созданы переменные:
       {{guest_name}}, {{attendance}}, {{drinks}}, {{comment}}, {{to_email}} */
    const templateParams = {
      guest_name: guestName,
      attendance: attendance,
      drinks:     drinks,
      comment:    comment || 'Комментарий не оставлен',
      to_email:   'ksyunya.koshel@mail.ru',
    };

    /* ─── Проверка: настроен ли EmailJS ─────────────────── */
    const isEmailJSConfigured =
      EMAILJS_PUBLIC_KEY  !== 'ВСТАВЬТЕ_ВАШ_PUBLIC_KEY' &&
      EMAILJS_SERVICE_ID  !== 'ВСТАВЬТЕ_ВАШ_SERVICE_ID' &&
      EMAILJS_TEMPLATE_ID !== 'ВСТАВЬТЕ_ВАШ_TEMPLATE_ID';

    if (!isEmailJSConfigured) {
      /* EmailJS не настроен — показываем демо-успех для тестирования верстки */
      console.warn('EmailJS не настроен. Заполните EMAILJS_PUBLIC_KEY, EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID в script.js');
      simulateSuccess(submitBtn, successMsg, form);
      return;
    }

    /* ─── Реальная отправка через EmailJS ───────────────── */
    emailjs
      .send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams)
      .then(() => {
        /* Успех */
        form.style.opacity = '0';
        form.style.transition = 'opacity 0.4s ease';

        setTimeout(() => {
          form.style.display = 'none';
          successMsg.classList.remove('hidden');
          successMsg.style.animation = 'successAppear 0.6s var(--ease-out) forwards';
          successMsg.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 400);
      })
      .catch((err) => {
        /* Ошибка отправки */
        console.error('EmailJS error:', err);
        errorMsg.classList.remove('hidden');
        errorMsg.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

        /* Восстанавливаем кнопку */
        submitBtn.disabled = false;
        submitBtn.textContent = 'Подтвердить';
        submitBtn.style.opacity = '1';
      });
  });
}

/* Демо-успех (без EmailJS) */
function simulateSuccess(submitBtn, successMsg, form) {
  setTimeout(() => {
    form.style.opacity = '0';
    form.style.transition = 'opacity 0.4s ease';

    setTimeout(() => {
      form.style.display = 'none';
      successMsg.classList.remove('hidden');
      successMsg.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 400);
  }, 600);
}

/* ─── Вспомогательные функции для ошибок полей ──────────── */
function showFieldError(input, message) {
  input.classList.add('error');

  /* Удаляем старое сообщение об ошибке */
  const existing = input.parentElement.querySelector('.field-error-msg');
  if (existing) existing.remove();

  const msg = document.createElement('p');
  msg.className = 'field-error-msg';
  msg.textContent = message;
  msg.style.cssText = `
    font-family: var(--font-sans);
    font-size: 12px;
    color: #C0392B;
    margin-top: 6px;
    animation: fadeInDown 0.3s ease;
  `;
  input.parentElement.appendChild(msg);

  /* Мягкое тряхивание инпута */
  input.style.animation = 'shake 0.4s ease';
  setTimeout(() => { input.style.animation = ''; }, 400);
}

function clearFieldError(input) {
  input.classList.remove('error');
  const msg = input.parentElement.querySelector('.field-error-msg');
  if (msg) msg.remove();
}

/* Инлайн keyframes для shake и fadeInDown */
const extraStyle = document.createElement('style');
extraStyle.textContent = `
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    20%       { transform: translateX(-6px); }
    40%       { transform: translateX(6px); }
    60%       { transform: translateX(-4px); }
    80%       { transform: translateX(4px); }
  }
  @keyframes fadeInDown {
    from { opacity: 0; transform: translateY(-6px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes successAppear {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
`;
document.head.appendChild(extraStyle);

/* Снимаем ошибку при фокусе */
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.form-input').forEach((input) => {
    input.addEventListener('input', () => clearFieldError(input));
    input.addEventListener('focus', () => clearFieldError(input));
  });
});

/* ══════════════════════════════════════════════════════════
   ВСПОМОГАТЕЛЬНЫЕ ЭФФЕКТЫ
   ══════════════════════════════════════════════════════════ */

/* Плавный hover-эффект на карточках локаций */
document.addEventListener('DOMContentLoaded', () => {
  /* Параллакс лёгкий для декора hero */
  const heroBranches = document.querySelectorAll('.hero-decor');
  if (heroBranches.length && window.innerWidth > 900) {
    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY;
      heroBranches.forEach((el, i) => {
        const speed = i % 2 === 0 ? 0.06 : -0.06;
        el.style.transform = `translateY(${scrollY * speed}px)`;
      });
    }, { passive: true });
  }

  /* Инициализируем анимацию сразу для элементов в viewport
     при прямом заходе без конверта (на случай ошибок) */
  if (!document.getElementById('envelope-screen') ||
      document.getElementById('main-site')?.classList.contains('hidden') === false) {
    triggerHeroAnimations();
    initScrollAnimations();
    initNavScroll();
    initCountdown();
    initMusicBtn();
    initRSVPForm();
  }
});

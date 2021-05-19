'use strict';

const btnCloseModal = document.querySelector('.btn--close-modal');
const btnsOpenModal = document.querySelectorAll('.btn--show-modal');
const btnScrollTo = document.querySelector('.btn--scroll-to');
const modal = document.querySelector('.modal');
const overlay = document.querySelector('.overlay');
const section1 = document.querySelector('#section--1');
const nav = document.querySelector('.nav');
const tabs = document.querySelectorAll('.operations__tab');
const tabsContainer = document.querySelector('.operations__tab-container');
const tabsContent = document.querySelectorAll('.operations__content');

////////////////////////////////////////////////
///////////////////////////////////////
// Modal window

const openModal = function (e) {
  e.preventDefault();
  modal.classList.remove('hidden');
  overlay.classList.remove('hidden');
};

const closeModal = function () {
  modal.classList.add('hidden');
  overlay.classList.add('hidden');
};

btnsOpenModal.forEach(btn => btn.addEventListener('click', openModal));

btnCloseModal.addEventListener('click', closeModal);
overlay.addEventListener('click', closeModal);

document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
    closeModal();
  }
});

////////////////////////////////////////////////
////////////////////////////////////////////////
// Button Learn More Scrolling

btnScrollTo.addEventListener('click', function (e) {
  /// Современный метод
  section1.scrollIntoView({ behavior: 'smooth' });
});

////////////////////////////////////////////////
////////////////////////////////////////////////
// Page navigation with Event Delegation

document.querySelector('.nav__links').addEventListener('click', function (e) {
  e.preventDefault();

  // Matching strategy
  if (e.target.classList.contains('nav__link')) {
    const id = e.target.getAttribute('href');
    document.querySelector(id).scrollIntoView({ behavior: 'smooth' });
  }
});

////////////////////////////////////////////////
////////////////////////////////////////////////
// Tabbed component

tabsContainer.addEventListener('click', function (e) {
  // Т.к. кнопка содержит еще и вложенный span-элемент, мы используем closest, т.к. кликнуть можно и на вложенный span, и на кнопку
  const clicked = e.target.closest('.operations__tab');

  // Guard clause - если кнликнуть не на кнопку, а на пустом месте между кнопками
  if (!clicked) return;

  tabs.forEach(t => t.classList.remove('operations__tab--active'));

  clicked.classList.add('operations__tab--active');

  // Activate content area
  tabsContent.forEach(el => {
    el.classList.remove('operations__content--active');
  });

  document
    .querySelector(`.operations__content--${clicked.dataset.tab}`)
    .classList.add('operations__content--active');
});

////////////////////////////////////////////////
////////////////////////////////////////////////
// Menu fade animation

const handleHover = function (e) {
  if (e.target.classList.contains('nav__link')) {
    const link = e.target;
    const siblings = link.closest('.nav').querySelectorAll('.nav__link');
    const logo = link.closest('.nav').querySelector('img');

    siblings.forEach(el => {
      if (el !== link) el.style.opacity = this;
      logo.style.opacity = this;
    });
  }
};

nav.addEventListener('mouseover', handleHover.bind(0.5));

nav.addEventListener('mouseout', handleHover.bind(1));

////////////////////////////////////////////////
////////////////////////////////////////////////
// Sticky navigation: Intersection Observer API

// Sticky navigation:Intersection Observing API

const header = document.querySelector('.header'); // элемент, после исчезновения которого появляется sticky navigation

const navHeight = nav.getBoundingClientRect().height; // sticky navigation появлется, когда до нижней границы .header остается расстояние, равное sticky navigation

// Функция, которая будет вызвана после исчезновения header
const stickyNav = function (entries) {
  const [entry] = entries; // аналогично entry = entries[0];
  if (!entry.isIntersecting) {
    // если header не виден, добавляем навигации класс .sticky
    nav.classList.add('sticky');
  } else {
    // если header виден, убираем у навигации класс .sticky
    nav.classList.remove('sticky');
  }
};

const headerObserver = new IntersectionObserver(stickyNav, {
  // Это объект с опциями
  root: null,
  threshold: 0, // пороговое значение: 0 означает, что header вообще не виден
  rootMargin: `-${navHeight}px`, // дополнительный отступ, при котором появлется навигация (можно не использовать)
});

headerObserver.observe(header);

////////////////////////////////////////////////////////////////////////////////////////////////
/// Revealing Elements on Scroll

// Выбираем объекты, которые надо подгружать по мере прокрутки
const allSections = document.querySelectorAll('.section');

const revealSection = function (entries, observer) {
  const [entry] = entries; // аналогично entry = entries[0];

  if (!entry.isIntersecting) return; // Если секция "не пересекается" с областью видимости, тогда завершаем фукнцию
  entry.target.classList.remove('section--hidden');
  observer.unobserve(entry.target); // после того, как мы достигли секции, observer перестает наблюдать за этой секцией, чтобы не нагружать лишним страницу
};

const sectionObserver = new IntersectionObserver(revealSection, {
  root: null,
  threshold: 0.15,
});

allSections.forEach(function (section) {
  sectionObserver.observe(section);

  // Мы добавляем класс .section--hidden с помощью js, чтобы вначале скрыть секции, а потом отоброжать их по мере прокрутки страницы, убирая этот класс
  // section.classList.add('section--hidden');
});

////////////////////////////////////////////////
////////////////////////////////////////////////
// Lazy Loading images

// Выбираем только те изображения, которые имеют свойство data-src
const imgTargets = document.querySelectorAll('img[data-src]');

// Колл-бэк функция, которую будет вызывать объект-обозреватель. Обозреватель автоматически будет передавать в нее параметры entries (записи о положении и видимости элемента-объекта наблюдения) и observer
const loadImg = function (entries, observer) {
  const [entry] = entries; // аналогично entry = entries[0]; - берем первую запись из массива entries

  if (!entry.isIntersecting) return; // Если секция "не пересекается" с областью видимости, тогда завершаем фукнцию

  // Заменяем src в img на файл из data-src и убираем фильтр blur
  entry.target.src = entry.target.dataset.src;

  // Убираем фильтр (класс lazy-img) только после того, как изображение загрузиться (событие load)
  entry.target.addEventListener('load', function () {
    entry.target.classList.remove('lazy-img');
  });

  // перестаем наблюдать за изображением после того, как оно было загружено (чтобы не нагружать систему)
  observer.unobserve(entry.target);
};

// Создаем объект-обозреватель imgObserver, который будет вызывать коллбэк-функцию loadImg и указываем для него опции в объекте {}
const imgObserver = new IntersectionObserver(loadImg, {
  root: null,
  threshold: 0,
  rootMargin: '200px', // начинаем процесс замены изображений на 200px раньеш, чем они покажутся
});

// Указываем, что за каждым изображением будет наблюдать объект-обозреватель, который в нужный момент вывозвет коллбэк-фукнцию loadImg
imgTargets.forEach(img => {
  imgObserver.observe(img);
});

////////////////////////////////////////////////
////////////////////////////////////////////////
/// Slider Component
const slider = function () {
  const slides = document.querySelectorAll('.slide');
  const btnLeft = document.querySelector('.slider__btn--left');
  const btnRight = document.querySelector('.slider__btn--right');
  const dotContainer = document.querySelector('.dots');

  let curSlide = 0;
  const maxSlide = slides.length;

  const creatDots = function () {
    slides.forEach(function (s, i) {
      dotContainer.insertAdjacentHTML(
        'beforeend',
        `<button class="dots__dot" data-slide="${i}"></button>`
      );
    });
  };

  const activateDot = function (slide) {
    document
      .querySelectorAll('.dots__dot')
      .forEach(dot => dot.classList.remove('dots__dot--active'));

    document
      .querySelector(`.dots__dot[data-slide="${slide}"]`)
      .classList.add('dots__dot--active');
  };

  // Переход к слайду с конкретным номером
  const goToSlide = function (slide) {
    slides.forEach((s, i) => {
      s.style.transform = `translateX(${100 * (i - slide)}%)`;
    });
  };

  // Next Slide
  const nextSlide = function () {
    if (curSlide === maxSlide - 1) {
      curSlide = 0;
    } else {
      curSlide++;
    }

    goToSlide(curSlide);
    activateDot(curSlide);
  };

  // Previouse Slide
  const prevSlide = function () {
    if (curSlide === 0) {
      curSlide = maxSlide - 1;
    } else {
      curSlide--;
    }

    goToSlide(curSlide);
    activateDot(curSlide);
  };

  const init = function () {
    goToSlide(0); // Устанавливаем начальное соотояние: первый слайд - translateX(0), второй - 100%, третий - 200%, четвертый - 300% и т.д.

    creatDots();

    activateDot(0); // Чтобы сразу после загрузки первая точка была активной (т.к. загружен первый слайд)
  };

  init();

  btnRight.addEventListener('click', nextSlide);
  btnLeft.addEventListener('click', prevSlide);

  // Листаем слайдер нажатием клавиш
  document.addEventListener('keydown', function (e) {
    console.log(e);
    if (e.key === 'ArrowLeft') prevSlide();
    e.key === 'ArrowRight' && nextSlide();
  });

  dotContainer.addEventListener('click', function (e) {
    if (e.target.classList.contains('dots__dot')) {
      const { slide } = e.target.dataset;
      goToSlide(slide);
      activateDot(slide);
    }
  });
};

slider();

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////

/*
////////////////////////////////////////////////
///183. Selecting, Creating, and Deleting Elements
////////////////////////////////////////////////

console.log(document.documentElement);
console.log(document.head);
console.log(document.body);

const header = document.querySelector('.header');
const allSections = document.querySelectorAll('.section');
console.log(allSections);

document.getElementById('section--1');
const allbuttons = document.getElementsByTagName('button');
console.log(allbuttons);

document.getElementsByClassName('btn');

////////////////////////////////////////////////
/// Creating and Inserting elements

/// insertAdjacentHTML

/// createElement
const message = document.createElement('div');

message.classList.add('cookie-massege');

//message.textContent = 'We use cookies for improved functionality and analytics.';
message.innerHTML =
  'We use cookies for improved functionality and analytics. <button class="btn btn--close-cookie"> Got it!</button>';

// header.prepend(message);
header.append(message);
// header.append(message.cloneNode(true));

// header.before(message);
// header.after(message);

/// Delete elements
document
  .querySelector('.btn--close-cookie')
  .addEventListener('click', function () {
    //message.remove;

    message.parentElement.removeChild(message);
  });

////////////////////////////////////////////////
///184. Styles, Attributes and Classes
////////////////////////////////////////////////

/// продолжаем код из предудыщей лекции

/// Стили
message.style.backgroundColor = '#37383d';
message.style.width = '120%';

console.log(message.style.backgroundColor);
console.log(message.style.height);
console.log(message.style.color);

console.log(getComputedStyle(message).color);
console.log(getComputedStyle(message).height);

message.style.height =
  Number.parseFloat(getComputedStyle(message).height, 10) + 40 + 'px';

/// CSS переменные, хнаяящиеся в классе :root {} можнополучить через document.documentElement

document.documentElement.style.setProperty('--color-primary', 'orangered');

/// Атрибуты
const logo = document.querySelector('.nav__logo');
console.log(logo.alt);
console.log(logo.src);
console.log(logo.className);

/// нестандартное поведение, не должно работать
console.log(logo.designer);
console.log(logo.getAttribute('designer'));

logo.alt = 'Beatiful minimalist logo';
logo.setAttribute('company', 'Bankist');

console.log(logo.src);
console.log(logo.getAttribute('src'));

const link = document.querySelector('.nav__link--btn');
console.log(link.href);
console.log(link.getAttribute('href'));

// Data attributes
console.log(logo.dataset.versionNumber);

// Classes
logo.classList.add('c', 'j');
logo.classList.remove('c', 'j');
logo.classList.toggle('c');
logo.classList.contains('c');

// Don't use Т.к. этот метод перезапишет все существующие классы и запишет только один новый класс
logo.className = 'jonas';

document.getElementById(selectorID).getAttribute('designer');
document.getElementById(selectorID).setAttribute('designer', 'Jonas');

////////////////////////////////////////////////
/// 186. Types of Events and Event Handlers
////////////////////////////////////////////////

const h1 = document.querySelector('h1');

// Устаревший способо
// h1.onmouseenter = function (e) {
//   alert('assEventListener: Great! You are reading the heading :D');
// };

// Современный способ
// h1.addEventListener('mouseenter', function (e) {
//   alert('assEventListener: Great! You are reading the heading :D');
// });

const alertH1 = function (e) {
  alert('assEventListener: Great! You are reading the heading :D');
};

h1.addEventListener('mouseenter', alertH1);

setTimeout(() => h1.removeEventListener('mouseenter', alertH1), 3000);



////////////////////////////////////////////////
/// 188. Event Propagation in Practice
////////////////////////////////////////////////

// rgb(255,255,255)
const randomInt = (min, max) =>
  Math.floor(Math.random() * (max - min + 1) + min);

const randomColor = () =>
  `rgb(${randomInt(0, 255)}, ${randomInt(0, 255)}, ${randomInt(0, 255)})`;
console.log(randomColor());

document.querySelector('.nav__link').addEventListener('click', function (e) {
  this.style.backgroundColor = randomColor();
  console.log('LINK', e.target, e.currentTarget);

  // Stop propagation
  e.stopPropagation();
});

document.querySelector('.nav__links').addEventListener('click', function (e) {
  this.style.backgroundColor = randomColor();
  console.log('CONTAINER', e.target, e.currentTarget);
});

document.querySelector('.nav').addEventListener(
  'click',
  function (e) {
    this.style.backgroundColor = randomColor();
    console.log('NAV', e.target, e.currentTarget);
  },
  true
);




////////////////////////////////////////////////
/// 190. DOM Traversing
////////////////////////////////////////////////

const h1 = document.querySelector('h1');

// Going downwards: child
console.log(h1.querySelectorAll('.highlight'));
console.log(h1.childNodes); // Node-list
console.log(h1.children); // HTML-collection
h1.firstElementChild.style.color = 'white';
h1.lastElementChild.style.color = 'orangered';

// Going upwards: parents
console.log(h1.parentNode);
console.log(h1.parentElement);

h1.closest('.header').style.background = 'var(--gradient-secondary)';

h1.closest('h1').style.background = 'var(--gradient-primary)';

// Going sideways: siblings
console.log(h1.previousElementSibling);
console.log(h1.nextElementSibling);

console.log(h1.previousSibling);
console.log(h1.nextSibling);

// Получить всех соседей (а не только следующего или предыдущего)
console.log(h1.parentElement.children);
[...h1.parentElement.children].forEach(function (el) {
  if (el !== h1) el.style.transform = 'scale(0.5)';
});



////////////////////////////////////////////////
/// 199. Lifecycle DOM Events
////////////////////////////////////////////////

// Событие, когда загружен весь HTML и построена модель DOM
document.addEventListener('DOMContentLoaded', function (e) {
  console.log('HTML parsed and DOM tree built');
});

// Событие, когда вообще вся страница загружена
window.addEventListener('load', function (e) {
  console.log('Page fully loaded', e);
});

// Событие перед закрытием страницы
// Например, сообщение, готов ли пользователь закрыть страницу
window.addEventListener('beforeunload', function (e) {
  e.preventDefault();
  console.log(e);
  e.returnValue = '';
});

*/

////////////////////////////////////////////////
/// 200. Efficient Script Loading: defer and async
////////////////////////////////////////////////

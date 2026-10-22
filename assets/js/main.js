const buttonAddCard = document.querySelector('.helperIA');
const iaDisplay = document.querySelector('.iaDisplay');
const menuToggle = document.querySelector('.nav__toggle');
const navigationLinks = document.querySelector('.nav__links');

function setMenuOpen(isOpen) {
  menuToggle.setAttribute('aria-expanded', String(isOpen));
  menuToggle.setAttribute('aria-label', isOpen ? 'Fermer le menu' : 'Ouvrir le menu');
  menuToggle.querySelector('span').textContent = isOpen ? '×' : '☰';
  navigationLinks.classList.toggle('nav__links--open', isOpen);
}

menuToggle.addEventListener('click', () => {
  const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
  setMenuOpen(!isExpanded);
});

navigationLinks.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    setMenuOpen(false);
  });
});

buttonAddCard.addEventListener('click', () => {
  const isClosed = iaDisplay.classList.toggle('displayOff');
  buttonAddCard.classList.toggle('reduceIa', !isClosed);
  buttonAddCard.classList.remove('moveIa');
  document.dispatchEvent(new CustomEvent('assistant-visibility-change', {
    detail: { isOpen: !isClosed }
  }));
});

document.querySelectorAll('.typingEffect').forEach((typingEffect) => {
  const typingDetails = typingEffect.closest('details');
  const typingText = typingEffect.textContent.trim();
  let typingIndex = 0;
  let typingTimer;

  typingEffect.textContent = '';

  function typeNextCharacter() {
    if (!typingDetails.open || typingIndex >= typingText.length) {
      return;
    }

    typingEffect.textContent += typingText[typingIndex];
    typingIndex += 1;
    typingTimer = window.setTimeout(typeNextCharacter, 25);
  }

  typingDetails.addEventListener('toggle', () => {
    window.clearTimeout(typingTimer);
    if (typingDetails.open) {
      typeNextCharacter();
    }
  });
});
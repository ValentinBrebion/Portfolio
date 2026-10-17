const buttonAddCard = document.querySelector('.helperIA');
const iaDisplay = document.querySelector('.iaDisplay');

buttonAddCard.addEventListener('click', () => {
  iaDisplay.classList.toggle('displayOff');
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
(() => {
  const qrCodeElement = document.querySelector('[data-gift-card-qr]');
  if (!qrCodeElement || typeof QRCode === 'undefined') return;

  const identifier = qrCodeElement.dataset.identifier;
  if (!identifier) return;

  new QRCode(qrCodeElement, {
    text: identifier,
    width: 120,
    height: 120
  });
})();

(function (window) {
  'use strict';

  var PPI_CONFIG = {
    walletApiUrl: window.PPI_WALLET_API_URL || 'https://ppi-wallet.up.railway.app',
    pricingApiUrl: window.PPI_PRICING_API_URL || 'https://ppi-pricing.up.railway.app',
    publication: window.PPI_PUBLICATION || document.location.hostname,
  };

  var TOKEN_KEY = 'ppi_token';

  function getToken() {
    return localStorage.getItem(TOKEN_KEY);
  }

  function setToken(t) {
    localStorage.setItem(TOKEN_KEY, t);
  }

  function apiFetch(url, opts) {
    return fetch(url, Object.assign({ headers: { 'Content-Type': 'application/json' } }, opts))
      .then(function (r) { return r.json(); });
  }

  function authedFetch(url, opts) {
    var token = getToken();
    var headers = Object.assign({ 'Content-Type': 'application/json' }, opts && opts.headers);
    if (token) headers['Authorization'] = 'Bearer ' + token;
    return fetch(url, Object.assign({}, opts, { headers: headers })).then(function (r) { return r.json(); });
  }

  function ensureWallet() {
    if (getToken()) return Promise.resolve();
    return apiFetch(PPI_CONFIG.walletApiUrl + '/api/wallet/create', { method: 'POST', body: '{}' })
      .then(function (data) {
        if (data.token) setToken(data.token);
      });
  }

  function getPrice(wordCount, topic) {
    return apiFetch(PPI_CONFIG.pricingApiUrl + '/api/price', {
      method: 'POST',
      body: JSON.stringify({ publication: PPI_CONFIG.publication, wordCount: wordCount, topic: topic }),
    });
  }

  function getBalance() {
    return authedFetch(PPI_CONFIG.walletApiUrl + '/api/wallet/balance');
  }

  function charge(amount, description) {
    return authedFetch(PPI_CONFIG.walletApiUrl + '/api/wallet/charge', {
      method: 'POST',
      body: JSON.stringify({ amount: amount, description: description }),
    });
  }

  function blurElement(el) {
    el.style.filter = 'blur(6px)';
    el.style.userSelect = 'none';
    el.style.pointerEvents = 'none';
    el.setAttribute('data-ppi-blurred', 'true');
  }

  function unblurElement(el) {
    el.style.filter = '';
    el.style.userSelect = '';
    el.style.pointerEvents = '';
    el.removeAttribute('data-ppi-blurred');
  }

  function createOverlay(el, priceData, onUnlock) {
    var overlay = document.createElement('div');
    overlay.className = 'ppi-overlay';
    overlay.innerHTML = [
      '<div class="ppi-overlay-box">',
      '  <div class="ppi-logo">Pay-per-Insight</div>',
      '  <p class="ppi-message">This content is premium. Unlock it for <strong>$' + priceData.price.toFixed(4) + '</strong></p>',
      '  <button class="ppi-unlock-btn">Unlock Article</button>',
      '  <p class="ppi-topup-link"><a href="' + PPI_CONFIG.walletApiUrl.replace('/api', '') + '/topup" target="_blank">Top up wallet</a></p>',
      '</div>',
    ].join('');

    var style = document.createElement('style');
    style.textContent = [
      '.ppi-overlay{position:absolute;top:0;left:0;width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:rgba(255,255,255,0.85);z-index:9999;}',
      '.ppi-overlay-box{background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:32px;text-align:center;box-shadow:0 4px 24px rgba(0,0,0,0.12);max-width:360px;}',
      '.ppi-logo{font-weight:700;font-size:18px;color:#1a202c;margin-bottom:12px;}',
      '.ppi-message{color:#4a5568;margin-bottom:20px;font-size:15px;}',
      '.ppi-unlock-btn{background:#3b82f6;color:#fff;border:none;border-radius:8px;padding:12px 28px;font-size:15px;cursor:pointer;font-weight:600;}',
      '.ppi-unlock-btn:hover{background:#2563eb;}',
      '.ppi-topup-link{margin-top:12px;font-size:13px;color:#718096;}',
      '.ppi-topup-link a{color:#3b82f6;text-decoration:none;}',
    ].join('');
    document.head.appendChild(style);

    overlay.querySelector('.ppi-unlock-btn').addEventListener('click', function () {
      onUnlock(overlay);
    });

    var parent = el.parentElement;
    parent.style.position = 'relative';
    parent.appendChild(overlay);
    return overlay;
  }

  function initPremiumContent() {
    var premiumEls = document.querySelectorAll('[data-premium]');
    if (!premiumEls.length) return;

    ensureWallet().then(function () {
      premiumEls.forEach(function (el) {
        var wordCount = el.innerText.split(/\s+/).length;
        var topic = el.getAttribute('data-topic') || null;

        getPrice(wordCount, topic).then(function (priceData) {
          blurElement(el);
          createOverlay(el, priceData, function (overlay) {
            charge(priceData.price, 'Article: ' + document.title).then(function (result) {
              if (result.success) {
                overlay.remove();
                unblurElement(el);
              } else if (result.error === 'Insufficient balance') {
                alert('Insufficient balance. Please top up your wallet.');
              } else {
                alert('Payment failed: ' + (result.error || 'Unknown error'));
              }
            });
          });
        });
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPremiumContent);
  } else {
    initPremiumContent();
  }

  window.PPI = {
    getBalance: getBalance,
    ensureWallet: ensureWallet,
    getToken: getToken,
  };

})(window);

/* ============================================================
   EMBEDS — bramkowanie treści z zewnątrz (aura.md §5.2).
   Embed nie ładuje się bez zgody → placeholder z przyciskiem "Załaduj".
   Wariant prywatny działa bez zgody. Sync z TRKlaro przez 'aura:klaro-change'.
   Cel: mapa OSM (.embed-frame[data-embed=osm]); rozszerzalne na YT/formularz.
   ============================================================ */
(function () {
  'use strict';

  var COPY = {
    osm: { kicker: 'Mapa wstrzymana', title: 'Mapa OpenStreetMap', desc: 'Mapę osadzimy po Twojej zgodzie. Bez niej pokazujemy tylko link.', cta: 'Załaduj mapę', open: 'Otwórz w OpenStreetMap' },
    youtube: { kicker: 'Film wstrzymany', title: 'Film z YouTube', desc: 'Film osadzimy po Twojej zgodzie. Bez niej obejrzysz go w YouTube.', cta: 'Załaduj film', open: 'Obejrzyj w YouTube' },
    'gravity-forms': { kicker: 'Formularz wstrzymany', title: 'Pełny formularz', desc: 'Pełny formularz wczytamy po zgodzie. Tymczasem napisz na e-mail.', cta: 'Załaduj formularz', open: 'Napisz e-mail' }
  };

  function consent(svc) { return !!(window.TRKlaro && TRKlaro.consents()[svc]); }

  function placeholder(svc, frame) {
    var c = COPY[svc] || COPY.osm, open = frame.getAttribute('data-open') || '#';
    return '<div class="embed-block"><div class="embed-block__ic"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18"/></svg></div>' +
      '<div class="embed-block__kicker">' + c.kicker + '</div><h4>' + c.title + '</h4><p>' + c.desc + '</p>' +
      '<button type="button" class="btn btn--ink btn--sm" data-embed-load="' + svc + '">' + c.cta + '</button>' +
      '<a class="embed-frame__inline" href="' + open + '" target="_blank" rel="noopener noreferrer">' + c.open + '</a></div>';
  }

  function paint() {
    document.querySelectorAll('.embed-frame[data-embed]').forEach(function (frame) {
      var svc = frame.getAttribute('data-embed');
      var ifr = frame.querySelector('iframe');
      if (!frame.dataset.embedSrc && ifr) frame.dataset.embedSrc = ifr.getAttribute('src') || ifr.dataset.src || '';
      if (consent(svc)) {
        if (!frame.querySelector('iframe[src]')) {
          frame.innerHTML = '<iframe title="' + (frame.getAttribute('data-title') || 'Treść osadzona') + '" src="' + frame.dataset.embedSrc + '" loading="lazy" style="width:100%;height:100%;border:0;display:block"></iframe>' +
            (frame.dataset.open ? '<a class="embed-frame__open" href="' + frame.dataset.open + '" target="_blank" rel="noopener noreferrer">Większa mapa</a>' : '');
        }
      } else {
        frame.innerHTML = placeholder(svc, frame);
      }
    });
  }

  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-embed-load]'); if (!b) return;
    if (window.TRKlaro) TRKlaro.setConsent(b.getAttribute('data-embed-load'), true); else paint();
  });
  document.addEventListener('aura:klaro-change', paint);
  document.addEventListener('DOMContentLoaded', paint);

  window.TREmbeds = { paint: paint };
})();

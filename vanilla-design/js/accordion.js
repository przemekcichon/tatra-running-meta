/* ============================================================
   ACCORDION — ramowy plan obozu (.acc). Toggle .open + max-height + aria.
   ============================================================ */
(function () {
  'use strict';
  document.querySelectorAll('.acc').forEach(function (acc) {
    acc.querySelectorAll('.acc__head').forEach(function (head) {
      var item = head.closest('.acc__item');
      var panel = item.querySelector('.acc__panel');
      if (item.classList.contains('open') && panel) panel.style.maxHeight = panel.scrollHeight + 'px';
      head.addEventListener('click', function () {
        var open = item.classList.toggle('open');
        head.setAttribute('aria-expanded', open ? 'true' : 'false');
        if (panel) panel.style.maxHeight = open ? panel.scrollHeight + 'px' : '0';
      });
    });
  });
})();

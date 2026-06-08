/**
 * 轻量图标运行时，替代 ~400KB 的 lucide.min.js。
 * 仅内置本应用实际用到的图标（SVG 路径取自 lucide v1.16.0，ISC 协议）。
 * 暴露与 lucide 兼容的 window.lucide.createIcons()，
 * 会把 <i data-lucide="name"> 原地替换为 <svg>，并沿用原元素的属性（如 class）。
 *
 * 新增图标：在 HTML/JS 中用到新的 data-lucide 名称后，把对应的内层 SVG 字符串加到下面的 ICONS 里即可。
 */
(function () {
  'use strict';

  const ICONS = {
    'check-square': '<path d="M21 10.656V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h12.344"/><path d="m9 11 3 3L22 4"/>',
    'book-open': '<path d="M12 7v14"/><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/>',
    'user': '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
    'sparkles': '<path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z"/><path d="M20 2v4"/><path d="M22 4h-4"/><circle cx="4" cy="20" r="2"/>',
    'check': '<path d="M20 6 9 17l-5-5"/>',
    'dumbbell': '<path d="M17.596 12.768a2 2 0 1 0 2.829-2.829l-1.768-1.767a2 2 0 0 0 2.828-2.829l-2.828-2.828a2 2 0 0 0-2.829 2.828l-1.767-1.768a2 2 0 1 0-2.829 2.829z"/><path d="m2.5 21.5 1.4-1.4"/><path d="m20.1 3.9 1.4-1.4"/><path d="M5.343 21.485a2 2 0 1 0 2.829-2.828l1.767 1.768a2 2 0 1 0 2.829-2.829l-6.364-6.364a2 2 0 1 0-2.829 2.829l1.768 1.767a2 2 0 0 0-2.828 2.829z"/><path d="m9.6 14.4 4.8-4.8"/>',
    'chevron-down': '<path d="m6 9 6 6 6-6"/>',
    'file-text': '<path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z"/><path d="M14 2v5a1 1 0 0 0 1 1h5"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/>',
    'shield-alert': '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="M12 8v4"/><path d="M12 16h.01"/>',
  };

  const SVG_NS = 'http://www.w3.org/2000/svg';
  const DEFAULT_ATTRS = {
    xmlns: SVG_NS,
    width: '24',
    height: '24',
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    'stroke-width': '2',
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round',
  };

  function replaceElement(element) {
    const name = element.getAttribute('data-lucide');
    const body = ICONS[name];
    if (!body) {
      console.warn(`[icons] 未注册的图标: ${name}`);
      return;
    }

    const svg = document.createElementNS(SVG_NS, 'svg');
    Object.entries(DEFAULT_ATTRS).forEach(([key, value]) => svg.setAttribute(key, value));

    // 沿用原 <i> 的属性（class 等），与 lucide 行为一致；data-lucide 仅作标记保留。
    Array.from(element.attributes).forEach((attr) => {
      svg.setAttribute(attr.name, attr.value);
    });

    svg.classList.add('lucide', `lucide-${name}`);
    svg.innerHTML = body;

    element.parentNode?.replaceChild(svg, element);
  }

  function createIcons() {
    document.querySelectorAll('[data-lucide]').forEach(replaceElement);
  }

  window.lucide = { createIcons, icons: ICONS };
})();

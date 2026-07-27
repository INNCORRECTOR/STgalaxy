(function () {
  var FOOTER_HTML =
    '<p class="footer-brand">' +
    '<a href="index.html" class="footer-brand-link" aria-label="ST Galaxy home">' +
    '<picture>' +
    '<source srcset="images/staticunchange/logo.webp" type="image/webp">' +
    '<img src="images/staticunchange/logo.jpeg" alt="ST Galaxy" class="footer-logo" loading="lazy" width="52" height="52">' +
    "</picture></a></p>" +
    '<p class="footer-line">Nagaland · Retail &amp; Wholesale phone accessories</p>' +
    '<p class="footer-line footer-tagline">The most affordable electronics in the Northeast.</p>' +
    '<p class="footer-line">' +
    '<a class="footer-email" href="mailto:sosokachui@gmail.com">sosokachui@gmail.com</a>' +
    "</p>" +
    '<p class="footer-nav">' +
    '<a href="index.html">Home</a><span>·</span>' +
    '<a href="products.html">Products</a><span>·</span>' +
    '<a href="about.html">About</a>' +
    "</p>" +
    '<p class="footer-nav footer-legal">' +
    '<a href="privacy.html">Privacy</a><span>·</span>' +
    '<a href="terms.html">Terms</a>' +
    "</p>" +
    '<p class="footer-copy">© 2026 ST Galaxy</p>';

  var TAB_ICON =
    '<svg class="tab-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">';

  var TAB_ICONS = {
    home:
      TAB_ICON +
      '<path d="M4 10.2 12 3.5l8 6.7V20a1.2 1.2 0 0 1-1.2 1.2H15v-6.2H9V21.2H5.2A1.2 1.2 0 0 1 4 20V10.2z"/>' +
      "</svg>",
    shop:
      TAB_ICON +
      '<path d="M6 7.5h12l-1.1 11.5H7.1L6 7.5z"/>' +
      '<path d="M9 7.5V6a3 3 0 0 1 6 0v1.5"/>' +
      '<path d="M9 12h6"/>' +
      "</svg>",
    about:
      TAB_ICON +
      '<circle cx="12" cy="12" r="8.5"/>' +
      '<path d="M12 10.5v5M12 8h.01"/>' +
      "</svg>",
    order:
      TAB_ICON +
      '<path d="M20 11.5a7.5 7.5 0 0 1-11.2 6.5L4 20l2-4.8A7.5 7.5 0 1 1 20 11.5z"/>' +
      '<path d="M9.5 11.5h.01M12 11.5h.01M14.5 11.5h.01"/>' +
      "</svg>",
  };

  var TABBAR_HTML =
    '<a href="index.html" class="tab-item" data-page="index">' +
    '<span class="tab-icon">' +
    TAB_ICONS.home +
    "</span>Home</a>" +
    '<a href="products.html" class="tab-item" data-page="products">' +
    '<span class="tab-icon">' +
    TAB_ICONS.shop +
    "</span>Shop</a>" +
    '<a href="about.html" class="tab-item" data-page="about">' +
    '<span class="tab-icon">' +
    TAB_ICONS.about +
    "</span>About</a>" +
    '<a href="https://wa.me/919089030805" class="tab-item tab-order" target="_blank" rel="noopener noreferrer">' +
    '<span class="tab-icon">' +
    TAB_ICONS.order +
    "</span>Order</a>";

  function currentPage() {
    var path = (location.pathname || "").split("/").pop() || "index.html";
    if (path === "" || path === "index.html") return "index";
    if (path.indexOf("product") === 0) return "products";
    if (path.indexOf("about") === 0) return "about";
    if (path.indexOf("products") === 0) return "products";
    if (path.indexOf("privacy") === 0) return "privacy";
    if (path.indexOf("terms") === 0) return "terms";
    return "";
  }

  function isLegalPage() {
    var page = currentPage();
    return page === "privacy" || page === "terms";
  }

  function initLegalNotice() {
    if (isLegalPage()) return;

    try {
      if (localStorage.getItem("stgalaxy-legal-notice") === "1") return;
    } catch (e) {
      return;
    }

    var bar = document.createElement("div");
    bar.className = "legal-notice";
    bar.setAttribute("role", "dialog");
    bar.setAttribute("aria-label", "Privacy notice");
    bar.innerHTML =
      '<div class="legal-notice-inner">' +
      '<p class="legal-notice-text">We keep things simple — no accounts, no tracking. ' +
      'By using our site you agree to our ' +
      '<a href="privacy.html">Privacy Policy</a> and ' +
      '<a href="terms.html">Terms</a>. Questions? Just reach out.</p>' +
      '<button type="button" class="legal-notice-btn">Got it</button>' +
      "</div>";

    document.body.appendChild(bar);
    document.body.classList.add("has-legal-notice");

    bar.querySelector(".legal-notice-btn").addEventListener("click", function () {
      try {
        localStorage.setItem("stgalaxy-legal-notice", "1");
      } catch (e) {}
      bar.remove();
      document.body.classList.remove("has-legal-notice");
    });
  }

  function initNavHighlight() {
    var page = currentPage();
    document.querySelectorAll("body > nav:first-of-type .nav-links a").forEach(function (link) {
      var href = (link.getAttribute("href") || "").split("/").pop().replace(/\.html$/, "") || "index";
      var isActive =
        page === "products"
          ? href === "products"
          : page === "index"
            ? href === "index"
            : href === page;
      link.classList.toggle("active", isActive);
    });
  }

  function initWholesaleHomeLink() {
    if (currentPage() !== "index") return;

    var link = document.querySelector(".cta-wholesale-home");
    if (!link) return;

    var pdfUrl = "images/pdf/wholesale-chart.pdf";
    var pageUrl = "wholesale.html";
    var mq = window.matchMedia("(max-width: 768px)");

    function apply() {
      if (mq.matches) {
        link.href = pdfUrl;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
      } else {
        link.href = pageUrl;
        link.removeAttribute("target");
        link.removeAttribute("rel");
      }
    }

    apply();
    if (mq.addEventListener) {
      mq.addEventListener("change", apply);
    } else if (mq.addListener) {
      mq.addListener(apply);
    }
  }

  function initFooter() {
    var el = document.getElementById("site-footer");
    if (!el) return;
    el.className = "site-footer";
    el.innerHTML = FOOTER_HTML;
  }

  function initTabbar() {
    var el = document.getElementById("mobile-tabbar");
    if (!el) return;
    el.classList.add("mobile-tabbar");
    el.innerHTML = TABBAR_HTML;
    document.body.classList.add("has-mobile-chrome");

    var page = currentPage();
    el.querySelectorAll(".tab-item[data-page]").forEach(function (tab) {
      if (tab.getAttribute("data-page") === page) {
        tab.classList.add("active");
      }
    });
  }

  function init() {
    initFooter();
    initTabbar();
    initNavHighlight();
    initWholesaleHomeLink();
    initLegalNotice();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

(function () {
  var PLACEHOLDER =
    "data:image/svg+xml," +
    encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500" viewBox="0 0 800 500">' +
        '<defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">' +
        '<stop offset="0%" stop-color="#0a1628"/><stop offset="100%" stop-color="#1a0a28"/>' +
        "</linearGradient></defs>" +
        '<rect fill="url(#g)" width="800" height="500"/>' +
        '<text x="400" y="240" fill="#7a7a9a" font-family="sans-serif" font-size="22" text-anchor="middle">ST Galaxy</text>' +
        '<text x="400" y="280" fill="#00e8ff" font-family="sans-serif" font-size="16" text-anchor="middle">Photo coming soon</text>' +
        "</svg>"
    );

  var catalog = null;
  var activeCategory = "airpods";
  var catalogReady = false;

  function skeletonCardHtml() {
    return (
      '<article class="product-card skeleton-card" aria-hidden="true">' +
      '<div class="skeleton-image"></div>' +
      '<div class="skeleton-body">' +
      '<div class="skeleton-line w-90"></div>' +
      '<div class="skeleton-line w-60"></div>' +
      '<div class="skeleton-line w-40"></div>' +
      "</div>" +
      '<div class="skeleton-btn"></div>' +
      "</article>"
    );
  }

  function renderSkeletonGrid(count) {
    var grid = document.getElementById("product-grid");
    if (!grid) return;
    grid.classList.remove("is-ready");
    grid.classList.add("is-loading");
    var n = count || 6;
    var html = "";
    for (var i = 0; i < n; i++) html += skeletonCardHtml();
    grid.innerHTML = html;
  }

  function renderSkeletonTabs() {
    var nav = document.getElementById("category-tabs");
    if (!nav) return;
    nav.classList.add("is-loading");
    var html = "";
    for (var i = 0; i < 5; i++) {
      html += '<span class="skeleton-tab" aria-hidden="true"></span>';
    }
    nav.innerHTML = html;
  }

  function markImageLoaded(img) {
    img.classList.add("is-loaded");
    var wrap = img.closest(".product-image-wrap");
    if (wrap) wrap.classList.add("is-loaded");
  }

  function bindImageLoadFade() {
    document.querySelectorAll(".product-photo").forEach(function (img) {
      if (img.complete && img.naturalWidth > 0) {
        markImageLoaded(img);
        return;
      }
      img.addEventListener(
        "load",
        function () {
          markImageLoaded(img);
        },
        { once: true }
      );
    });
  }

  function escapeHtml(text) {
    var div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  function getDescPreview(text) {
    if (!text || !String(text).trim()) return { preview: "", hasMore: false };

    var lines = String(text).replace(/\r\n/g, "\n").split("\n");
    var firstLine = "";
    var start = 0;

    for (var i = 0; i < lines.length; i++) {
      if (lines[i].trim()) {
        firstLine = lines[i].trim();
        start = i;
        break;
      }
    }

    if (!firstLine) return { preview: "", hasMore: false };

    for (var j = start + 1; j < lines.length; j++) {
      if (lines[j].trim()) {
        return { preview: firstLine + "...", hasMore: true };
      }
    }

    return { preview: firstLine, hasMore: false };
  }

  function formatWhatsAppLink(baseUrl, product) {
    var message =
      "Hi ST Galaxy! I want to order:\n" +
      product.name +
      (product.description ? " (" + product.description + ")" : "");
    var separator = baseUrl.indexOf("?") >= 0 ? "&" : "?";
    return baseUrl + separator + "text=" + encodeURIComponent(message);
  }

  function renderPricing(product) {
    if (!product.available) {
      return '<p class="badge badge-soon">Coming Soon</p>';
    }

    if (!product.pricing || !product.pricing.length) {
      return "";
    }

    if (product.pricing.length > 1) {
      return '<span class="badge badge-check">Check pricing</span>';
    }

    var tier = product.pricing[0];
    var label = tier.label ? escapeHtml(tier.label) + ": " : "";
    return (
      '<p class="price-line">' +
      label +
      "₹" +
      escapeHtml(String(tier.price)) +
      "</p>"
    );
  }

  function renderProductCard(product, contact) {
    var detailUrl = "product.html?id=" + encodeURIComponent(product.id);
    var orderLink = product.available
      ? formatWhatsAppLink(contact.whatsapp, product)
      : contact.whatsapp;

    var descParts = getDescPreview(product.description);
    var description = descParts.preview
      ? '<p class="product-desc">' + escapeHtml(descParts.preview) + "</p>"
      : "";

    var orderAction = product.available
      ? '<a href="' +
        escapeHtml(orderLink) +
        '" class="buy-btn" target="_blank" rel="noopener noreferrer">Order on WhatsApp</a>'
      : '<span class="buy-btn buy-btn-disabled">Coming Soon</span>';

    var images =
      product.images && product.images.length ? product.images : [PLACEHOLDER];
    var extraCount = images.length > 1 ? images.length - 1 : 0;
    var badge =
      extraCount > 0
        ? '<span class="photo-count">+' + extraCount + " photos</span>"
        : "";

    return (
      '<article class="product-card">' +
      '<a class="product-card-link" href="' +
      escapeHtml(detailUrl) +
      '">' +
      '<div class="product-image-wrap">' +
      badge +
      STImage.renderPicture(images[0], {
        alt: product.name,
        "class": "product-photo",
        loading: "lazy",
      }) +
      "</div>" +
      '<div class="product-info">' +
      "<h3>" +
      escapeHtml(product.name) +
      "</h3>" +
      description +
      '<div class="pricing">' +
      renderPricing(product) +
      "</div></div></a>" +
      '<div class="card-actions">' +
      orderAction +
      "</div></article>"
    );
  }

  function renderProducts(categoryId, options) {
    options = options || {};
    var grid = document.getElementById("product-grid");
    if (!grid || !catalog) return;

    if (options.showSkeleton) {
      renderSkeletonGrid(6);
    } else if (catalogReady) {
      grid.classList.add("is-updating");
    }

    var items = catalog.products.filter(function (p) {
      return p.category === categoryId;
    });

    function finish(html) {
      grid.classList.remove("is-loading", "is-updating");
      grid.innerHTML = html;
      grid.removeAttribute("aria-busy");
      if (html.indexOf("product-card") >= 0) {
        bindImageFallbacks();
        bindImageLoadFade();
        grid.classList.remove("is-ready");
        requestAnimationFrame(function () {
          requestAnimationFrame(function () {
            grid.classList.add("is-ready");
          });
        });
      }
    }

    if (!items.length) {
      finish('<p class="empty-state">No products in this category yet.</p>');
      return;
    }

    if (options.showSkeleton) {
      requestAnimationFrame(function () {
        finish(
          items
            .map(function (product) {
              return renderProductCard(product, catalog.contact);
            })
            .join("")
        );
      });
      return;
    }

    finish(
      items
        .map(function (product) {
          return renderProductCard(product, catalog.contact);
        })
        .join("")
    );
  }

  function bindImageFallbacks() {
    document.querySelectorAll(".product-photo").forEach(function (img) {
      img.addEventListener("error", function onError() {
        img.removeEventListener("error", onError);
        img.src = PLACEHOLDER;
        markImageLoaded(img);
      });
    });
  }

  function setActiveTab(categoryId, options) {
    options = options || {};
    activeCategory = categoryId;

    document.querySelectorAll(".category-tab").forEach(function (tab) {
      var isActive = tab.getAttribute("data-category") === categoryId;
      tab.classList.toggle("active", isActive);
      tab.setAttribute("aria-selected", isActive ? "true" : "false");
    });

    var activeCat = catalog.categories.find(function (c) {
      return c.id === categoryId;
    });
    var heading = document.getElementById("category-heading");
    if (heading && activeCat) {
      heading.textContent = activeCat.label.toUpperCase();
    }

    if (history.replaceState) {
      history.replaceState(null, "", "#" + categoryId);
    } else {
      location.hash = categoryId;
    }

    renderProducts(categoryId, { showSkeleton: !!options.showSkeleton });
  }

  function renderTabs() {
    var nav = document.getElementById("category-tabs");
    if (!nav || !catalog) return;

    nav.classList.remove("is-loading");

    nav.innerHTML = catalog.categories
      .map(function (cat, index) {
        return (
          '<button type="button" class="category-tab' +
          (index === 0 ? " active" : "") +
          '" data-category="' +
          escapeHtml(cat.id) +
          '" role="tab" aria-selected="' +
          (index === 0 ? "true" : "false") +
          '">' +
          escapeHtml(cat.label) +
          "</button>"
        );
      })
      .join("");

    nav.querySelectorAll(".category-tab").forEach(function (tab) {
      tab.addEventListener("click", function () {
        setActiveTab(tab.getAttribute("data-category"));
      });
    });
  }

  function renderContact() {
    if (!catalog) return;

    var whatsapp = document.getElementById("contact-whatsapp");
    var instagram = document.getElementById("contact-instagram");
    if (whatsapp) whatsapp.href = catalog.contact.whatsapp;
    if (instagram) instagram.href = catalog.contact.instagram;
  }

  function renderMeta() {
    if (!catalog || !catalog.meta) return;

    var tagline = document.getElementById("page-tagline");
    var heading = document.getElementById("page-heading");

    if (tagline) tagline.textContent = catalog.meta.tagline;
    if (heading) heading.textContent = catalog.meta.heading;
  }

  function getInitialCategory() {
    var hash = (location.hash || "").replace("#", "");
    if (
      hash &&
      catalog.categories.some(function (c) {
        return c.id === hash;
      })
    ) {
      return hash;
    }
    return catalog.categories[0] ? catalog.categories[0].id : "airpods";
  }

  function init() {
    renderSkeletonGrid(6);
    renderSkeletonTabs();

    fetch("data/products.json")
      .then(function (res) {
        if (!res.ok) throw new Error("Could not load products");
        return res.json();
      })
      .then(function (data) {
        catalog = data;
        catalogReady = true;
        renderMeta();
        renderContact();
        renderTabs();
        setActiveTab(getInitialCategory());
      })
      .catch(function () {
        catalogReady = true;
        var grid = document.getElementById("product-grid");
        var tabs = document.getElementById("category-tabs");
        if (tabs) tabs.classList.remove("is-loading");
        if (grid) {
          grid.classList.remove("is-loading");
          grid.innerHTML =
            '<p class="empty-state">Could not load products. Check data/products.json.</p>';
        }
      });
  }

  window.addEventListener("hashchange", function () {
    if (!catalog) return;
    var hash = (location.hash || "").replace("#", "");
    if (hash && hash !== activeCategory) {
      setActiveTab(hash);
    }
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

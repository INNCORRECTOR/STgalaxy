(function () {
  var PLACEHOLDER =
    "data:image/svg+xml," +
    encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500" viewBox="0 0 800 500">' +
        '<defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">' +
        '<stop offset="0%" stop-color="#0a1628"/><stop offset="100%" stop-color="#1a0a28"/>' +
        "</linearGradient></defs>" +
        '<rect fill="url(#g)" width="800" height="500"/>' +
        '<text x="400" y="260" fill="#7a7a9a" font-family="sans-serif" font-size="18" text-anchor="middle">Photo coming soon</text>' +
        "</svg>"
    );

  function escapeHtml(text) {
    var div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  function getProductId() {
    return new URLSearchParams(window.location.search).get("id") || "";
  }

  function formatWhatsAppLink(baseUrl, product) {
    var message =
      "Hi ST Galaxy! I want to order:\n" +
      product.name +
      (product.description ? " (" + product.description + ")" : "");
    var separator = baseUrl.indexOf("?") >= 0 ? "&" : "?";
    return baseUrl + separator + "text=" + encodeURIComponent(message);
  }

  function renderDetailSkeleton() {
    var root = document.getElementById("detail-root");
    if (!root) return;
    root.classList.remove("is-ready");
    root.innerHTML =
      '<div class="detail-skeleton" aria-busy="true" aria-label="Loading product">' +
      '<div class="skeleton-line w-30"></div>' +
      '<div class="skeleton-line w-80 skeleton-title"></div>' +
      '<div class="skeleton-image skeleton-image-lg"></div>' +
      '<div class="skeleton-block"></div>' +
      '<div class="skeleton-line w-60"></div>' +
      '<div class="skeleton-line w-40"></div>' +
      "</div>";
  }

  function markGalleryLoaded() {
    var mainImg = document.getElementById("gallery-main-img");
    if (!mainImg) return;
    mainImg.classList.add("is-loaded");
    var mainWrap = mainImg.closest(".gallery-main");
    if (mainWrap) mainWrap.classList.add("is-loaded");
  }

  function bindGalleryImageFade() {
    var mainImg = document.getElementById("gallery-main-img");
    if (!mainImg) return;

    if (mainImg.complete && mainImg.naturalWidth > 0) {
      markGalleryLoaded();
    } else {
      mainImg.addEventListener(
        "load",
        function () {
          markGalleryLoaded();
        },
        { once: true }
      );
    }
  }

  function renderBackButton(url, label) {
    return (
      '<a href="' +
      escapeHtml(url) +
      '" class="page-back">' +
      '<span class="page-back-icon" aria-hidden="true">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
      '<path d="M15 18l-6-6 6-6"/>' +
      "</svg></span>" +
      '<span class="page-back-text">' +
      escapeHtml(label) +
      "</span></a>"
    );
  }

  function renderGallery(images, name) {
    var list = images && images.length ? images : [PLACEHOLDER];
    var main = list[0];

    var thumbs =
      list.length > 1
        ? '<div class="gallery-thumbs" id="gallery-thumbs">' +
          list
            .map(function (src, index) {
              return (
                '<button type="button" class="gallery-thumb' +
                (index === 0 ? " active" : "") +
                '" data-src="' +
                escapeHtml(src) +
                '" aria-label="Photo ' +
                (index + 1) +
                '">' +
                STImage.renderPicture(src, { alt: "", loading: "lazy" }) +
                "</button>"
              );
            })
            .join("") +
          "</div>"
        : "";

    return (
      '<section class="detail-section">' +
      '<h2 class="section-label">Photos</h2>' +
      '<div class="gallery">' +
      '<div class="gallery-main">' +
      STImage.renderPicture(main, {
        alt: name,
        id: "gallery-main-img",
      }) +
      "</div>" +
      thumbs +
      "</div></section>"
    );
  }

  function renderDescription(product) {
    if (!product.description) return "";

    return (
      '<section class="detail-section">' +
      '<h2 class="section-label">Description</h2>' +
      '<div class="detail-desc">' +
      escapeHtml(product.description) +
      "</div></section>"
    );
  }

  function renderPricing(product) {
    if (!product.available) {
      return (
        '<section class="detail-section">' +
        '<h2 class="section-label">Availability</h2>' +
        '<p class="badge-soon">Coming Soon</p></section>'
      );
    }

    if (!product.pricing || !product.pricing.length) {
      return "";
    }

    return (
      '<section class="detail-section">' +
      '<h2 class="section-label">Pricing</h2>' +
      '<div class="detail-pricing">' +
      product.pricing
        .map(function (tier) {
          var label = tier.label
            ? '<span class="price-label">' + escapeHtml(tier.label) + "</span>"
            : '<span class="price-label">Price</span>';
          return (
            '<div class="price-row">' +
            label +
            '<span class="price-value">₹' +
            escapeHtml(String(tier.price)) +
            "</span></div>"
          );
        })
        .join("") +
      "</div></section>"
    );
  }

  function renderProduct(product, catalog) {
    var category = catalog.categories.find(function (c) {
      return c.id === product.category;
    });
    var categoryLabel = category ? category.label : product.category;
    var backUrl = "products.html#" + encodeURIComponent(product.category);

    var orderBlock = product.available
      ? '<a href="' +
        escapeHtml(formatWhatsAppLink(catalog.contact.whatsapp, product)) +
        '" class="buy-btn" target="_blank" rel="noopener noreferrer">Order on WhatsApp</a>'
      : '<span class="buy-btn buy-btn-disabled">Coming Soon</span>';

    document.title = product.name + " - ST Galaxy";
    var root = document.getElementById("detail-root");
    root.classList.remove("is-ready");
    root.innerHTML =
      '<div class="detail-top">' +
      renderBackButton(backUrl, categoryLabel) +
      "</div>" +
      '<header class="detail-header">' +
      '<span class="detail-category">' +
      escapeHtml(categoryLabel) +
      "</span>" +
      "<h1>" +
      escapeHtml(product.name) +
      "</h1>" +
      "</header>" +
      renderGallery(product.images, product.name) +
      renderDescription(product) +
      renderPricing(product) +
      '<section class="detail-section detail-order">' +
      '<h2 class="section-label">Order</h2>' +
      '<div class="detail-actions">' +
      orderBlock +
      '<a href="' +
      escapeHtml(catalog.contact.instagram) +
      '" class="instagram-btn" target="_blank" rel="noopener noreferrer">Instagram</a>' +
      "</div></section>";

    bindGallery();
    bindGalleryImageFade();
    root.removeAttribute("aria-busy");
    requestAnimationFrame(function () {
      root.classList.add("is-ready");
    });
  }

  function bindGallery() {
    var mainImg = document.getElementById("gallery-main-img");
    if (!mainImg) return;

    mainImg.addEventListener("error", function onError() {
      mainImg.removeEventListener("error", onError);
      mainImg.src = PLACEHOLDER;
    });

    document.querySelectorAll(".gallery-thumb").forEach(function (btn) {
      var thumbImg = btn.querySelector("img");
      if (thumbImg) {
        thumbImg.addEventListener("error", function () {
          thumbImg.src = PLACEHOLDER;
        });
      }

      btn.addEventListener("click", function () {
        var src = btn.getAttribute("data-src");
        if (!src) return;
        STImage.setPictureSrc(mainImg, src);
        document.querySelectorAll(".gallery-thumb").forEach(function (b) {
          b.classList.remove("active");
        });
        btn.classList.add("active");
      });
    });
  }

  function renderNotFound() {
    document.getElementById("detail-root").innerHTML =
      '<p class="empty-state">Product not found.</p>' +
      renderBackButton("products.html", "Shop");
  }

  function init() {
    var productId = getProductId();
    if (!productId) {
      renderNotFound();
      return;
    }

    renderDetailSkeleton();

    fetch("data/products.json")
      .then(function (res) {
        if (!res.ok) throw new Error("Could not load products");
        return res.json();
      })
      .then(function (catalog) {
        var product = catalog.products.find(function (p) {
          return p.id === productId;
        });
        if (!product) {
          renderNotFound();
          return;
        }
        renderProduct(product, catalog);
      })
      .catch(function () {
        document.getElementById("detail-root").innerHTML =
          '<p class="empty-state">Could not load product.</p>' +
          renderBackButton("products.html", "Shop");
      });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

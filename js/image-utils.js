(function (global) {
  var WEBP_SOURCE = /\.(jpe?g|png)$/i;

  function escapeAttr(text) {
    return String(text || "")
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/</g, "&lt;");
  }

  function toWebpPath(src) {
    if (!src || src.indexOf("data:") === 0) return "";
    return src.replace(WEBP_SOURCE, ".webp");
  }

  function canWebp(src) {
    return WEBP_SOURCE.test(src || "");
  }

  /** Build <picture> with WebP source + original fallback. JSON paths stay .jpg/.png. */
  function renderPicture(src, options) {
    options = options || {};
    var alt = escapeAttr(options.alt || "");
    var cls = options["class"] ? ' class="' + escapeAttr(options["class"]) + '"' : "";
    var loading = options.loading ? ' loading="' + escapeAttr(options.loading) + '"' : "";
    var id = options.id ? ' id="' + escapeAttr(options.id) + '"' : "";
    var safeSrc = escapeAttr(src);

    if (!src || src.indexOf("data:") === 0 || !canWebp(src)) {
      return (
        "<img src=\"" +
        safeSrc +
        '" alt="' +
        alt +
        '"' +
        cls +
        loading +
        id +
        ">"
      );
    }

    return (
      "<picture>" +
      '<source srcset="' +
      escapeAttr(toWebpPath(src)) +
      '" type="image/webp">' +
      '<img src="' +
      safeSrc +
      '" alt="' +
      alt +
      '"' +
      cls +
      loading +
      id +
      "></picture>"
    );
  }

  /** Swap gallery / main image when user picks a thumbnail. */
  function setPictureSrc(imgEl, src) {
    if (!imgEl) return;

    var picture = imgEl.closest("picture");
    if (!picture) {
      imgEl.src = src;
      return;
    }

    var source = picture.querySelector("source");
    var img = picture.querySelector("img") || imgEl;

    img.src = src;
    img.alt = img.alt || "";

    if (source && canWebp(src)) {
      source.srcset = toWebpPath(src);
      source.type = "image/webp";
    } else if (source) {
      source.removeAttribute("srcset");
    }
  }

  global.STImage = {
    toWebpPath: toWebpPath,
    canWebp: canWebp,
    renderPicture: renderPicture,
    setPictureSrc: setPictureSrc,
  };
})(typeof window !== "undefined" ? window : this);

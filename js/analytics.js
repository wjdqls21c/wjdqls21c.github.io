(function () {
  const id = window.SITE_ANALYTICS?.ga4MeasurementId?.trim();
  if (!id || /X{2,}|REPLACE|여기에/i.test(id)) {
    return;
  }

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  function gtag() {
    window.dataLayer.push(arguments);
  }
  window.gtag = gtag;
  gtag("js", new Date());
  gtag("config", id, {
    anonymize_ip: true,
    send_page_view: true,
  });
})();

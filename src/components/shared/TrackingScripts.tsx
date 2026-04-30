import { useEffect } from 'react';
import api from '../../services/api';

const TrackingScripts = () => {
  useEffect(() => {
    const fetchTrackingIds = async () => {
      try {
        const response = await api.get('/api/public/tracking');
        const { google_analytics_id, google_tag_manager_id, google_search_console_id } = response.data;

        // 1. Google Search Console (Meta Tag)
        if (google_search_console_id) {
          if (!document.querySelector('meta[name="google-site-verification"]')) {
            const meta = document.createElement('meta');
            meta.name = "google-site-verification";
            meta.content = google_search_console_id;
            document.head.appendChild(meta);
          }
        }

        // 2. Google Analytics (GTAG)
        if (google_analytics_id) {
          if (!document.getElementById('google-analytics-script')) {
            const script1 = document.createElement('script');
            script1.async = true;
            script1.src = `https://www.googletagmanager.com/gtag/js?id=${google_analytics_id}`;
            script1.id = 'google-analytics-script';
            document.head.appendChild(script1);

            const script2 = document.createElement('script');
            script2.innerHTML = `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${google_analytics_id}');
            `;
            document.head.appendChild(script2);
          }
        }

        // 3. Google Tag Manager
        if (google_tag_manager_id) {
          if (!document.getElementById('google-tag-manager-script')) {
            const script = document.createElement('script');
            script.id = 'google-tag-manager-script';
            script.innerHTML = `
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','${google_tag_manager_id}');
            `;
            document.head.appendChild(script);

            // GTM Noscript
            const noscript = document.createElement('noscript');
            noscript.innerHTML = `<iframe src="https://www.googletagmanager.com/ns.html?id=${google_tag_manager_id}" height="0" width="0" style="display:none;visibility:hidden"></iframe>`;
            document.body.insertBefore(noscript, document.body.firstChild);
          }
        }
      } catch (error) {
        console.error('Error loading tracking scripts:', error);
      }
    };

    fetchTrackingIds();
  }, []);

  return null;
};

export default TrackingScripts;

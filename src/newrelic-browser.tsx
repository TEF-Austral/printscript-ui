export const initNewRelic = () => {
    if (import.meta.env.PROD) {
        const script = document.createElement('script');
        script.innerHTML = `
      window.NREUM||(NREUM={});
      NREUM.init={
        // Your New Relic config here
      };
    `;
        document.head.insertBefore(script, document.head.firstChild);
    }
};
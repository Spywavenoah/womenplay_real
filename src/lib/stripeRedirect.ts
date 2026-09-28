/**
 * Safely redirects the user to Stripe Checkout.
 * 
 * Stripe Checkout forbids running inside an iframe (such as AI Studio preview,
 * CMS embeds, or sandboxed environments) and throws:
 * "Stripe Checkout is not able to run in an iFrame. Please redirect to Checkout at the top level."
 * 
 * This helper resolves the iframe limitation by:
 * 1. Detecting if the current window is nested inside an iframe (window.self !== window.top)
 * 2. Attempting top-level navigation (window.top.location.href)
 * 3. Opening checkout in a dedicated top-level tab (window.open with target="_blank") if iframe navigation is restricted
 * 4. Navigating standard top-level windows directly (window.location.href)
 */
export function redirectToCheckout(checkoutUrl: string): void {
  if (!checkoutUrl) return;

  const isInIframe = (() => {
    try {
      return window.self !== window.top;
    } catch (e) {
      // Access to window.top threw security exception => definitely in a cross-origin iframe
      return true;
    }
  })();

  if (isInIframe) {
    // 1. Try opening in a new top-level window/tab (standard & safe for iframe environments)
    try {
      const newWin = window.open(checkoutUrl, "_blank", "noopener,noreferrer");
      if (newWin && !newWin.closed) {
        return;
      }
    } catch (e) {
      console.warn("window.open blocked or threw:", e);
    }

    // 2. Try navigating the top-level parent if allowed by container sandbox
    try {
      if (window.top) {
        window.top.location.href = checkoutUrl;
        return;
      }
    } catch (e) {
      console.warn("window.top navigation blocked:", e);
    }

    // 3. Fallback: create an anchor element with target="_blank" and trigger click
    try {
      const link = document.createElement("a");
      link.href = checkoutUrl;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    } catch (e) {
      console.warn("Anchor click fallback failed:", e);
    }

    // 4. Last resort: current frame redirect
    window.location.href = checkoutUrl;
    return;
  }

  // Not in an iframe: direct top-level redirect
  window.location.href = checkoutUrl;
}

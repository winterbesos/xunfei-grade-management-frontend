/**
 * Prints a specific DOM element by isolating it in a temporary iframe.
 * This is the most reliable method for printing a portion of a web page.
 *
 * @param {HTMLElement} element The DOM element to print.
 */
export function printElement(element) {
  if (!element) {
    console.error("Print utility: element to print is not valid.");
    return;
  }

  // Create a hidden iframe
  const iframe = document.createElement("iframe");
  iframe.style.position = "absolute";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "0";
  iframe.style.visibility = "hidden";
  document.body.appendChild(iframe);

  const doc = iframe.contentDocument;

  // Clone all style and link tags from the parent document's head to the iframe's head
  const head = doc.querySelector("head");
  if (head) {
    const styles = document.querySelectorAll('style, link[rel="stylesheet"]');
    styles.forEach((style) => {
      head.appendChild(style.cloneNode(true));
    });
  }

  // Clone the element to be printed and append it to the iframe's body
  const body = doc.querySelector("body");
  if (body) {
    body.innerHTML = element.outerHTML;
  }

  // Use a timeout to ensure all content and styles are loaded before printing
  setTimeout(() => {
    try {
      iframe.contentWindow.focus(); // Focus is needed for some browsers
      iframe.contentWindow.print();
    } catch (e) {
      console.error("Error printing:", e);
    } finally {
      // Clean up by removing the iframe after printing
      // Note: removing immediately might cancel print in some browsers, so we delay it
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 1000);
    }
  }, 500); // 500ms delay to allow for rendering
}

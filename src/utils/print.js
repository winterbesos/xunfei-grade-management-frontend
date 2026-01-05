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

export function printStatusCardElement(element) {
  const iframe = document.createElement("iframe");
  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "1px";
  iframe.style.height = "1px";
  iframe.style.opacity = "0";
  iframe.style.pointerEvents = "none";
  iframe.style.border = "0";
  document.body.appendChild(iframe);

  const doc = iframe.contentDocument;

  //const doc = window.document;

  const styles = Array.from(
    document.querySelectorAll('style, link[rel="stylesheet"]'),
  )
    .map((node) => node.outerHTML)
    .join("\n");

  doc.open();
  doc.write(`
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        ${styles}

        <style>
          /* 只在这个 iframe 内生效 */
          @page { size: A4; margin: 0; }

          @media print {
            body {
              overflow: visible !important;
          }
        </style>
      </head>
      <body style="overflow: visible;">
        ${element.outerHTML}
      </body>
    </html>
  `);
  doc.close();

  // 等图片加载完（有照片时很关键）
  const imgs = Array.from(doc.images);
  const waitImgs = Promise.all(
    imgs.map((img) =>
      img.complete
        ? Promise.resolve()
        : new Promise((r) => (img.onload = img.onerror = r)),
    ),
  );

  waitImgs.then(() => {
    iframe.contentWindow.focus();
    iframe.contentWindow.print();
    setTimeout(() => document.body.removeChild(iframe), 1000);
  });
}

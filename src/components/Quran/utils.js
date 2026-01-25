/**
 * Sanitizes HTML content by removing potentially dangerous tags
 * and allowing only safe formatting tags
 */
export function sanitizeHtml(html) {
  if (!html || typeof html !== "string") return "";

  // Create a temporary DOM element to parse HTML
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = html;

  // List of allowed tags (safe formatting tags)
  const allowedTags = [
    "p",
    "br",
    "strong",
    "b",
    "em",
    "i",
    "u",
    "span",
    "div",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "ul",
    "ol",
    "li",
    "blockquote",
  ];

  // Remove script tags and other dangerous elements
  const dangerousTags = tempDiv.querySelectorAll("script, iframe, object, embed, form, input, button");
  dangerousTags.forEach((tag) => tag.remove());

  // Remove all attributes except class (for styling)
  const allElements = tempDiv.querySelectorAll("*");
  allElements.forEach((el) => {
    // Remove dangerous attributes
    el.removeAttribute("style");
    el.removeAttribute("onclick");
    el.removeAttribute("onerror");
    el.removeAttribute("onload");
    // Remove all other attributes except class
    Array.from(el.attributes).forEach((attr) => {
      if (attr.name !== "class" && !allowedTags.includes(attr.name.toLowerCase())) {
        el.removeAttribute(attr.name);
      }
    });
  });

  return tempDiv.innerHTML;
}

/**
 * Strips all HTML tags and returns plain text
 */
export function stripHtml(html) {
  if (!html || typeof html !== "string") return "";
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = html;
  return tempDiv.textContent || tempDiv.innerText || "";
}


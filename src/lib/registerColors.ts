import { colors } from "../../design-system/colors";

function buildCssVariables() {
  let css = ":root{";
  for (const [group, shades] of Object.entries(colors)) {
    for (const [shade, hex] of Object.entries(shades as Record<string, string>)) {
      css += `--ds-${group}-${shade}: ${hex};`;
      // also create an rgb token for rgba() preservation: "r,g,b"
      const h = hex.replace('#', '');
      if (h.length === 6 || h.length === 8) {
        const r = parseInt(h.substring(0, 2), 16);
        const g = parseInt(h.substring(2, 4), 16);
        const b = parseInt(h.substring(4, 6), 16);
        css += `--ds-${group}-${shade}-rgb: ${r}, ${g}, ${b};`;
      }
    }
  }
  css += "}";
  return css;
}

export function registerDesignColors() {
  if (typeof document === "undefined") return;
  const id = "design-system-colors";
  if (document.getElementById(id)) return;
  const style = document.createElement("style");
  style.id = id;
  style.appendChild(document.createTextNode(buildCssVariables()));
  document.head.appendChild(style);
}

export function getCssVar(group: string, shade: string | number) {
  return `var(--ds-${group}-${shade})`;
}

export default registerDesignColors;

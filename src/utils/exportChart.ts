// utils/exportChart.ts
export async function imageToBase64(url: string): Promise<string> {
  const res = await fetch(url);
  const blob = await res.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export async function exportChartAsHtml(explainEl: HTMLElement, chartEl: HTMLElement): Promise<string> {
  // SVG を抽出
  const svgElement = chartEl.querySelector("svg");
  if (!svgElement) throw new Error("SVG not found");

  // クローンして画像を Base64 埋め込み
  const svgClone = svgElement.cloneNode(true) as SVGSVGElement;
  for (const imgEl of svgClone.querySelectorAll("image")) {
    const src = imgEl.getAttribute("href") || imgEl.getAttribute("xlink:href");
    if (src) {
      const srcBase64 = await imageToBase64(src);
      imgEl.setAttribute("href", srcBase64);
    }
  }

  // 完全な HTML として返す
  const htmlContent = `
  <html>
    <head>
      <meta charset="UTF-8" />
      <title>Chart Export</title>
    </head>
    <body>
      ${explainEl.outerHTML}
      ${svgClone.outerHTML}
    </body>
  </html>`;
  
  return htmlContent;
}

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const htmlPath = path.resolve(__dirname, "../../Base /feed.html");
const outDir = path.resolve(__dirname, "../src/components/feed");

const html = fs.readFileSync(htmlPath, "utf8");

function convertHtml(chunk) {
  let result = chunk.replace(/<!--[\s\S]*?-->/g, "");
  result = result.replace(/assets\/images\//g, "/images/");
  result = result.replace(/\sclass=/g, " className=");
  result = result.replace(/\sclas=/g, " className=");
  result = result.replace(/\sfor=/g, " htmlFor=");
  result = result.replace(/stroke-opacity/g, "strokeOpacity");
  result = result.replace(/fill-opacity/g, "fillOpacity");
  result = result.replace(/fill-rule/g, "fillRule");
  result = result.replace(/clip-rule/g, "clipRule");
  result = result.replace(/stroke-linecap/g, "strokeLinecap");
  result = result.replace(/stroke-linejoin/g, "strokeLinejoin");
  result = result.replace(/stroke-width/g, "strokeWidth");
  result = result.replace(/tabindex/g, "tabIndex");
  result = result.replace(/<\/(circle|rect|path|polyline|line|hr|img|input)>/gi, "");

  const voidLike =
    /<(area|base|br|col|embed|hr|img|input|link|meta|param|source|track|wbr|circle|rect|path|polyline|line)\b([^>]*?)>/gi;
  result = result.replace(voidLike, (_match, tag, attrs) => {
    const trimmed = attrs.trimEnd();
    if (trimmed.endsWith("/")) {
      return `<${tag}${attrs}>`;
    }
    return `<${tag}${attrs} />`;
  });
  result = result.replace(
    /<button([^>]*?)href="#0"([^>]*?)>/gi,
    "<button type=\"button\"$1$2>"
  );
  result = result.replace(
    /<button([^>]*?)href="[^"]*"([^>]*?)>/gi,
    "<button type=\"button\"$1$2>"
  );
  return result.trim();
}

function writeComponent(name, chunk) {
  const jsx = convertHtml(chunk);
  const output = `"use client";

/* eslint-disable @next/next/no-img-element */

export function ${name}() {
  return (
    <>
${jsx
  .split("\n")
  .map((line) => "      " + line)
  .join("\n")}
    </>
  );
}
`;
  fs.writeFileSync(path.join(outDir, `${name}.tsx`), output);
  console.log("Wrote", name);
}

const layoutStart = html.indexOf(
  "<div class=\"container _custom_container\">",
  html.indexOf("<!-- Main Layout Structure -->")
);

const leftWrapStart = html.indexOf('<div class="_layout_left_sidebar_wrap">', layoutStart);
const leftColStart = html.lastIndexOf('<div class="col-xl-3 col-lg-3 col-md-12 col-sm-12">', leftWrapStart);
const middleMarker = html.indexOf("<!-- Layout Middle -->", leftWrapStart);

const middleColStart = html.indexOf('<div class="col-xl-6 col-lg-6 col-md-12 col-sm-12">', middleMarker);
const middleInnerStart = html.indexOf('<div class="_layout_middle_inner">', middleColStart);
const composerStart = html.indexOf('<div class="_feed_inner_text_area', middleInnerStart);
const middleColEnd = html.indexOf("<!-- Layout Middle -->", middleColStart + 1);

const rightMarker = html.indexOf("<!-- Right Sidebar -->", middleColEnd);
const rightColStart = html.indexOf('<div class="col-xl-3 col-lg-3 col-md-12 col-sm-12">', rightMarker);

writeComponent(
  "FeedSidebarLeft",
  html.slice(leftColStart, middleMarker)
);

writeComponent(
  "FeedStoriesStatic",
  html.slice(middleInnerStart + '<div class="_layout_middle_inner">'.length, composerStart)
);

const rightColEnd = html.indexOf("<!-- Right Sidebar -->", rightColStart + 10);

writeComponent(
  "FeedSidebarRight",
  html.slice(rightColStart, rightColEnd)
);

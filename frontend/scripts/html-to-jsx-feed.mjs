import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const htmlPath = path.resolve(__dirname, "../../Base /feed.html");
const outPath = path.resolve(
  __dirname,
  "../src/components/feed/FeedShellStatic.tsx"
);

const html = fs.readFileSync(htmlPath, "utf8");
const start = html.indexOf('<div class="_main_layout">');
const end = html.indexOf("<!-- Main Layout Structure -->", start);
let chunk = html.slice(start, end).trim() + "\n\t\t</div>";

chunk = chunk.replace(/<!--[\s\S]*?-->/g, "");
chunk = chunk.replace(/assets\/images\//g, "/images/");
chunk = chunk.replace(/\sclass=/g, " className=");
chunk = chunk.replace(/\sclas=/g, " className=");
chunk = chunk.replace(/href="feed\.html"/g, 'href="/feed"');
chunk = chunk.replace(/\sfor=/g, " htmlFor=");
chunk = chunk.replace(/stroke-opacity/g, "strokeOpacity");
chunk = chunk.replace(/fill-opacity/g, "fillOpacity");
chunk = chunk.replace(/fill-rule/g, "fillRule");
chunk = chunk.replace(/clip-rule/g, "clipRule");
chunk = chunk.replace(/stroke-linecap/g, "strokeLinecap");
chunk = chunk.replace(/stroke-linejoin/g, "strokeLinejoin");
chunk = chunk.replace(/stroke-width/g, "strokeWidth");
chunk = chunk.replace(/tabindex/g, "tabIndex");

chunk = chunk.replace(/<\/(circle|rect|path|polyline|line|hr|img|input)>/gi, "");

const voidLike =
  /<(area|base|br|col|embed|hr|img|input|link|meta|param|source|track|wbr|circle|rect|path|polyline|line)\b([^>]*?)>/gi;
chunk = chunk.replace(voidLike, (_match, tag, attrs) => {
  const trimmed = attrs.trimEnd();
  if (trimmed.endsWith("/")) {
    return `<${tag}${attrs}>`;
  }
  return `<${tag}${attrs} />`;
});
chunk = chunk.replace(/<button([^>]*?)href="#0"([^>]*?)>/gi, '<button type="button"$1$2>');
chunk = chunk.replace(/<button([^>]*?)href="[^"]*"([^>]*?)>/gi, '<button type="button"$1$2>');

const output = `"use client";

/* eslint-disable @next/next/no-img-element */

export function FeedShellStatic() {
  return (
    <>
${chunk
  .split("\n")
  .map((line) => "      " + line)
  .join("\n")}
    </>
  );
}
`;

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, output);
console.log("Wrote", outPath);

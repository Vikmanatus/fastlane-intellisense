import { accessSync, constants } from "fs";
import axios from "axios";
import { JSDOM } from "jsdom";
import { html as beautify } from "js-beautify";
import hljs from "highlight.js";

export function convertToClassName(functionName: string): string {
  // split the function name into words
  const words = functionName.split("_");

  // capitalize the first letter of each word
  const capitalizedWords = words.map(
    (word) => word.charAt(0).toUpperCase() + word.slice(1)
  );

  // join the words together and add "Action" at the end
  const className = capitalizedWords.join("") + "Action";

  return className;
}

interface Action {
  actionName: string;
  path: string;
}

export function fileExists(filePath: string): boolean {
  try {
    // Check if the file exists
    accessSync(filePath, constants.F_OK);
    return true;
  } catch (error) {
    return false;
  }
}
function removeComments(node: ChildNode) {
  let i = 0;
  const children = node.childNodes;

  while (i < children.length) {
    if (children[i].nodeType == 8) {
      // Node.COMMENT_NODE == 8
      node.removeChild(children[i]);
    } else {
      removeComments(children[i]);
      i++;
    }
  }
}

export function parseFastlaneDoc(fastlaneHtmlPage: string): string {
  const domActionPageElement = new JSDOM(fastlaneHtmlPage);
  const parsedDoc = Array.from(
    domActionPageElement.window.document.querySelectorAll("div.section")
  );
  if (!parsedDoc.length) {
    return "An error seems to have occured";
  }

  parsedDoc.forEach((element) => {
    const imgTags = element.querySelectorAll("img");
    imgTags.forEach((imgTag) => {
      const src = imgTag.getAttribute("src");
      if (src && !src.startsWith("https")) {
        imgTag.remove();
      }
    });
    const codesTags = element.querySelectorAll("pre code");
    codesTags.forEach((el) => {
      hljs.highlightBlock(el as HTMLElement);
    });
    removeComments(element);
  });

  const htmlDoc = parsedDoc.map((element) => element.outerHTML).join("");
  const htmlFormattedDoc = `
    <head>
      <style>  
      .hljs-symbol {
        color: #f54ce1;
      }
      .hljs-string {
        color: #183691;
      }
      .section pre code .hljs-comment {
        color: #f54ce1;
        font-style: italic;
      }

      .section pre code {
        white-space: pre;
        word-wrap: normal;
        display: block;
        padding: 12px;
        font-size: 12px;
      }
      </style>
    </head>
      ${htmlDoc}
  `;
  const documentationContent = beautify(htmlFormattedDoc, {
    indent_size: 2,
    indent_body_inner_html: true,
  });

  return documentationContent;
}
export function fetchFastlaneDoc(actionName: string): Promise<string> {
  return new Promise((resolve, reject) => {
    axios
      .get(`https://docs.fastlane.tools/actions/${actionName}/`)
      .then((result) => resolve(result.data))
      .catch((err) => reject(err));
  });
}

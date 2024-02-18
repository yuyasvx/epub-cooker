// import { join, normalize, parse as parsePath, relative } from "path";
// import { normalize as posixNormalize } from "path/posix";

import "reflect-metadata";
import { XhtmlService } from "../service/XhtmlService";

// console.log(relative("hoge", "styles/style.css"));

const xhtmlSrv = new XhtmlService();

const html = xhtmlSrv.getDom(xhtmlSrv.markdownToHtml(""));

console.log(html.getElementsByTagName("head"));

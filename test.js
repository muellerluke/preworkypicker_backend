const axios = require("axios");
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const virtualConsole = new jsdom.VirtualConsole();
axios.get("https://www.mysupplementstore.com/products/apollon-hooligan-bare-knuckle-40-sv").then((response) => {
  const dom = new JSDOM(response.data, {virtualConsole});
  const element = dom.window.document.querySelectorAll(".money")[2].textContent;
  console.log(element);

})

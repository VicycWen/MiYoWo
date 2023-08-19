// 测试用例
import { addUrlParam } from "../js/utils.js";
(function testAddUrlParam() {
  const data = [
    {
      url: "http://a.com",
      param: { b: 1, c: undefined, d: null, e: "", f: false },
    },
    {
      url: "http://a.com?aa=0",
      param: { b: 1, c: undefined, d: null, e: "", f: false },
    },
  ];
  for (const { url, param } of data) {
    console.log(addUrlParam(url, param));
  }
})();

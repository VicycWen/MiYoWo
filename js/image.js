import * as Utils from "./utils.js";

const rootId = "waterfall";
// const imgUrl = "https://img.xjh.me/random_img.php?type=acg";
const imgUrl = "https://img.xjh.me/random_img.php?type=acg&return=302";

// 执行主函数
imgLazyLoadAndWaterfall(rootId, imgUrl);

//主函数定义
function imgLazyLoadAndWaterfall(rootId, imgUrl, options = {}) {
  const {
    gap = 10, // 图片间距，单位px
    imgBatchSize = 10, // 一次多少张
    imgParallelHttpRequest = 2, // 每次并行发送两个http请求
    intervalCheckImgLoad = 100, //ms
    scrollBottomThreshold = 300, // scroll更新阈值
    debounceWait = 300,
    throttleWait = 300,
  } = options;

  const wf = document.getElementById(rootId);
  const width = wf.clientWidth;
  let cols = getCols(width);
  // console.log(wf, width);
  let heightArr = new Array(cols).fill(0);

  let imgCount = 0;
  let loadSuccessNumber = 0;
  let isBatchLoaded = true;

  init();
  window.addEventListener("resize", Utils.debounce(resizePage, 2 * debounceWait))

  function init() {
    renderImgList(imgBatchSize); //不要先渲染，先让滚动条回到顶部
    window.scrollTo(0, 0);
    bindEvent();

    setTimeout(function () {
      window.scrollTo(0, 0);
      // document.documentElement.scrollTop = 0
    }, 500);

    // console.log("初始化成功", imgCount);
  }

  function bindEvent() {
    window.onscroll = Utils.throttle(() => {
      //触发滚动事件的时候间隔时间内只触发一次
      //   console.log("imgCount:", imgCount);
      //   const currImgCount = imgCount;
      if (isScrollBottom(scrollBottomThreshold) && isBatchLoaded) {
        // renderImgList(20);
        Utils.debounce(renderImgList, debounceWait)(imgBatchSize); //防止发起多次请求
      }
    }, throttleWait);
  }

  function getCols(width) {
    // 768 992 1200
    if (width < 768 - 100) {
      return 2;
    } else if (width >= 768 - 100 && width < 1200 - 200) {
      return 3;
    } else {
      return 4;
    }
  }

  function createImage(imgUrl, imgIdx) {
    const imgWidth = calcImgWidth();
    const oDiv = document.createElement("div");
    const image = new Image();
    // const imgIdx = Math.round(Math.random() * 19 + 1);

    oDiv.classList.add("wf-item");
    // oDiv.className = 'wf-item'
    // oDiv.classList.add("hide");
    

    oDiv.style.width = imgWidth + "px";

    // image.src = `./images/${(imgIdx % 20) + 1}.jpg`;

    // 动漫图，速度快
    image.src = Utils.addUrlParam(imgUrl, { num: imgIdx });

    image.onload = function () {
      //图片原宽
      let w = image.width;
      //图片原高
      let h = image.height;
      //image-dom的真实高度(依据当前宽度及图片真实宽高)
      let height = Math.floor((h * imgWidth) / w);

      const minIdx = getMinIdx(heightArr);
      oDiv.style.top = heightArr[minIdx] + "px";
      oDiv.style.left = minIdx * (imgWidth + gap) + "px";
      oDiv.style.height = height + "px";
      heightArr[minIdx] += height + gap;
      // oDiv.classList.remove("hide");

      // let height = Math.round(h / w)*4

      loadSuccessNumber++;
      // console.log('载入数&载入成功数',imgCount,loadSuccessNumber)
      oDiv.appendChild(image);
    };
    return oDiv;
  }

  function renderImgList(num) {
    isBatchLoaded = false;
    const currImgCount = imgCount;
    // let currNum = 0;

    const t = setInterval(() => {
      // `图片加载成功数：${loadSuccessNumber},预计图片数：${imgCount},批渲染前图片数：${currImgCount},所需图片数：${num},定时器:${t}`

      if (loadSuccessNumber === imgCount) {
        for (let i = 1; i < imgParallelHttpRequest + 1; i++) {
          wf.appendChild(createImage(imgUrl, loadSuccessNumber + i));
        }

        // currNum++;
        imgCount += imgParallelHttpRequest;

        if (loadSuccessNumber >= currImgCount + num) {
          isBatchLoaded = true;
          clearInterval(t);
        }
      }
    }, intervalCheckImgLoad);
    // console.log(`【防抖情况】图片加载成功数：${loadSuccessNumber},预计图片数：${imgCount},批渲染前图片数：${currImgCount},所需图片数：${num},定时器:${t}`)
  }

  function getMinIdx(arr) {
    return arr.indexOf(Math.min(...arr));
  }

  function isScrollBottom(distance) {
    var clientHeight = document.documentElement.clientHeight;
    var scrollTop = document.documentElement.scrollTop;
    var scrollHeight = document.documentElement.scrollHeight;
    if (scrollTop + clientHeight + distance >= scrollHeight) {
      return true;
    }
    return false;
  }

  function resizePage() {
    const wf = document.getElementById(rootId);
    const wfItems = wf.childNodes;
    const width = wf.clientWidth;
    let cols = getCols(width);

    const imgWidth = calcImgWidth();
    heightArr = new Array(cols).fill(0);

    const len = wfItems.length;
    for(let i=0;i<len;i++){
      const item = wfItems[i];
      // item.style.opacity = "0";
    }
    for(let i=0;i<len;i++){
      const item = wfItems[i];
      // item.style.opacity = "1";
      const imgNode = item.childNodes[0];
  
      //图片原宽
      let w = imgNode.width;
      //图片原高
      let h = imgNode.height;
      //image-dom的真实高度(依据当前宽度及图片真实宽高)
      let height = Math.floor((h * imgWidth) / w);
  
      const minIdx = getMinIdx(heightArr);
      item.style.width = imgWidth + "px";
      item.style.top = heightArr[minIdx] + "px";
      item.style.left = minIdx * (imgWidth + gap) + "px";
      item.style.height = height + "px";
      heightArr[minIdx] += height + gap;
    }

  }

  function calcImgWidth() {
    const wf = document.getElementById(rootId);
    const width = wf.clientWidth;
    const cols = getCols(width);
    const imgWidth = (width - (cols - 1) * gap) / cols;
    return imgWidth
  }
}

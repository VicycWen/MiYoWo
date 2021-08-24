const nodeName = "waterfall";
const gap = 10; //px

const imgUrl = "https://acg.toubiec.cn/random.php";
const imgBatchSize = 20; // 一次多少张
const imgParallelHttpRequest = 2; //每次并行发送两个http请求
const intervalCheckImgLoad = 100; //ms
const scrollBottomThreshold = 300; // scroll更新阈值
const debouneDelay = 300;
const throttleDelay = 300;

// 执行主函数
imgLazyLoadAndWaterfall(
  nodeName,
  gap,
  imgUrl,
  imgBatchSize,
  imgParallelHttpRequest,
  intervalCheckImgLoad,
  scrollBottomThreshold,
  debouneDelay,
  throttleDelay
);

//主函数定义
function imgLazyLoadAndWaterfall(
  className,
  gap,
  imgUrl,
  imgBatchSize,
  imgParallelHttpRequest,
  intervalCheckImgLoad,
  scrollBottomThreshold,
  debouneDelay,
  throttleDelay
) {
  const wf = document.getElementsByClassName(className)[0];
  const width = wf.offsetWidth;
  const cols = getCols(width);
  // console.log(wf, width);
  const imgWidth = (width - (cols - 1) * gap) / cols;
  const heightArr = new Array(cols).fill(0);

  let imgCount = 0;
  let loadSuccessNumber = 0;
  let isBatchLoaded = true;

  init();

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
    window.onscroll = tools.throttle(() => {
      //触发滚动事件的时候间隔时间内只触发一次
      //   console.log("imgCount:", imgCount);
      //   const currImgCount = imgCount;
      if (isScrollBottom(scrollBottomThreshold) && isBatchLoaded) {
        // renderImgList(20);
        tools.deboune(renderImgList, debouneDelay)(imgBatchSize); //防止发起多次请求
      }
    }, throttleDelay);
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
    const oDiv = document.createElement("div");
    const image = new Image();
    // const imgIdx = Math.round(Math.random() * 19 + 1);

    oDiv.classList.add("wf-item");
    // oDiv.className = 'wf-item'
    oDiv.classList.add("hide");

    oDiv.style.width = imgWidth + "px";

    // image.src = `./images/${(imgIdx % 20) + 1}.jpg`;

    // 动漫图，速度快
    image.src = imgUrl + `?x=${imgIdx}`;

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
      oDiv.style.height = height;
      heightArr[minIdx] += height + gap;
      oDiv.classList.remove("hide");

      // let height = Math.round(h / w)*4

      loadSuccessNumber++;
      // console.log('载入数&载入成功数',imgCount,loadSuccessNumber)
    };
    oDiv.appendChild(image);
    return oDiv;
  }

  function renderImgList(num) {
    isBatchLoaded = false;
    const currImgCount = imgCount;
    // let currNum = 0;

    const t = setInterval(() => {
      console
        .log
        // `图片加载成功数：${loadSuccessNumber},预计图片数：${imgCount},批渲染前图片数：${currImgCount},所需图片数：${num},定时器:${t}`
        ();
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
}

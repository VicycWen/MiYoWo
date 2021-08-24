var tools = (function () {
  function deboune(fn, delay) {
    let t = null;
    return function () {
      if (t) {
        clearTimeout(t);
      }
      t = setTimeout(fn.bind(null, ...arguments), delay);
    };
  }

  function throttle(fn, delay) {
    var timer = null,
      res,
      begin = new Date().getTime();
    return function () {
      var args = arguments;
      curr = new Date().getTime();
      if (timer) {
        clearTimeout(timer);
      }

      if (curr - begin >= delay) {
        res = fn.apply(this, args);
        begin = curr;
      } else {
        timer = setTimeout(function () {
          res = fn.apply(this, args);
        }, delay);
      }
      return res;
    };
  }

  return {
    deboune,
    throttle,
  };
})();

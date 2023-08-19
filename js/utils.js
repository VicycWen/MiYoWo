export function debounce(fn, wait, options) {
  let _this, thisArgs, result, maxWait, timerId, lastCallTime;

  let lastInvokeTime = 0,
    leading = false,
    trailing = true,
    maxing = false;

  if (options) {
    leading = "leading" in options ? options.leading : leading;
    trailing = "trailing" in options ? options.trailing : trailing;
    maxWait = "maxWait" in options ? options.maxWait : maxWait;
    maxing = "maxWait" in options;
  }

  function invokeFunc(time) {
    const args = thisArgs;
    const that = _this;
    _this = thisArgs = undefined;

    lastInvokeTime = time;
    result = fn.apply(that, args);

    return result;
  }

  function startTimer(timeExpired, wait) {
    return setTimeout(timeExpired, wait);
  }

  function leadingEdge(time) {
    lastInvokeTime = time;
    timerId = startTimer(timeExpired, wait);

    return leading ? invokeFunc(time) : result;
  }

  function remainingTime(time) {
    let timeSinceLastCall = time - lastCallTime;
    let timeSinceLastInvoke = time - lastInvokeTime;
    let timeWaiting = wait - timeSinceLastCall;
    return maxing
      ? Math.min(timeWaiting, maxWait - timeSinceLastInvoke)
      : timeWaiting;
  }

  function shouldInvoke(time) {
    let timeSinceLastCall = time - lastCallTime;
    let timeSinceLastInvoke = time - lastInvokeTime;

    return (
      lastCallTime === undefined ||
      (maxing && timeSinceLastInvoke >= maxWait) ||
      timeSinceLastCall >= wait ||
      timeSinceLastCall < 0
    );
  }

  function timeExpired() {
    const time = Date.now();
    let canInvoke = shouldInvoke(time);
    if (canInvoke) {
      return trailingEdge(time);
    }

    timerId = startTimer(timeExpired, remainingTime(time));
  }

  function trailingEdge(time) {
    timerId = undefined;

    if (trailing && thisArgs) {
      return invokeFunc(time);
    }
    _this = thisArgs = undefined;
    return result;
  }

  function debounced(...args) {
    _this = this;
    thisArgs = args;
    let time = Date.now();
    let canInvoke = shouldInvoke(time);

    lastCallTime = time;

    if (canInvoke) {
      if (timerId === undefined) {
        return leadingEdge(lastCallTime);
      }
      if (maxing) {
        timerId = startTimer(timeExpired, wait);
        return invokeFunc(lastCallTime);
      }
    }
    if (timerId === undefined) {
      timerId = startTimer(timeExpired, wait);
    }

    return result;
  }

  return debounced;
}

export function throttle(fn, wait, options) {
  let leading = true;
  let trailing = true;
  if (options) {
    leading = "leading" in options ? !!options.leading : leading;
    trailing = "trailing" in options ? !!options.trailing : trailing;
  }
  return debounce(fn, wait, { leading, trailing, maxWait: wait });
}

export function addUrlParam(url, param) {
  const hasParam = url.includes("?");
  let suffix = "";
  for (let x in param) {
    suffix += `&${x}=${param[x]}`;
  }
  if (hasParam) {
    return url + suffix;
  } else {
    return url + "?" + suffix.slice(1);
  }
}

/**
 * 函数防抖，持续触发事件时，只有最后一次操作且delay时间后触发
 * @param {function} fn 必填，要执行的函数
 * @param {number} delay 可选，延迟执行的时间
 */
export function debounce (fn, delay = 500) {
  return function () {
    clearTimeout(fn.timerId)
    fn.timerId = setTimeout(() => {
      fn.call(this, ...arguments)
    }, delay)
  }
}

 /**
 * 节流函数，持续触发事件时，一定时间内只调用一次
 * @param {function} fn 必填，要执行的函数
 * @param {number} delay 可选，延迟执行的时间
 */
 export function throttle (fn, delay = 1000) {
  return function () {
    if (!fn.timerId) {
      fn.call(this, ...arguments)
      fn.timerId = setTimeout(() => {
        fn.timerId = null
      }, delay)
    }
  }
}

/**
 * 调用方式
 * window.addEventListener('scroll', this.throttle(this.scrollHandler))
 */
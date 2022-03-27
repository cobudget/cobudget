export default function debounce(func, wait, immediate) {
  var timeout;
  return function () {
    var args = arguments;
    var later = () => {
      timeout = null;
      if (!immediate) func.apply(this, args);
    };
    var callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(this, args);
  };
}

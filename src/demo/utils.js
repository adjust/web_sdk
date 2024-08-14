function hyphenToCamelCase (string) {
  return string.replace(/(-\w)/g, ([, m]) => m.toUpperCase())
}

function capitalize(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function debounce (fn, wait = 500) {
  let timeout
  return function () {
    clearTimeout(timeout)
    timeout = setTimeout(() => fn.apply(this, arguments), wait)
  }
}

export {
  hyphenToCamelCase,
  capitalize,
  debounce
}

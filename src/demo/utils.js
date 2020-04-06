function hyphenToCamelCase (string) {
  return string.replace(/(-\w)/g, ([, m]) => m.toUpperCase())
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
  debounce
}

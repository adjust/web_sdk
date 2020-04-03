function hyphenToCamelCase (string) {
  return string.replace(/(-\w)/g, ([, m]) => m.toUpperCase())
}

export {
  hyphenToCamelCase
}

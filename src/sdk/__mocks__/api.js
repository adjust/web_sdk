/* eslint-disable */
const response = JSON.stringify({
  status: 'success'
})

function request() {
  return new Promise((resolve) => {
    process.nextTick(() => resolve(JSON.parse(response)))
  })
}

export {
  request
}

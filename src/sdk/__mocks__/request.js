/* eslint-disable */
const response = JSON.stringify({
  status: 'success'
})

export default function request() {
  return new Promise((resolve) => {
    process.nextTick(() => resolve(JSON.parse(response)))
  })
}

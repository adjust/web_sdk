/* eslint-disable */
const response = {
  status: 'success'
}

export default function request() {
  return new Promise((resolve) => {
    process.nextTick(() => resolve(response))
  })
}

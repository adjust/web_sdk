const response = JSON.stringify({
  status: 'success'
})

export default function http () {
  return new Promise((resolve) => {
    process.nextTick(() => resolve(JSON.parse(response)))
  })
}

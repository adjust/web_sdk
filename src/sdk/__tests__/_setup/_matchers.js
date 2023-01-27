import * as matchers from 'jest-extended'
expect.extend(matchers)

expect.extend({
  toEqualArrayIgnoringOrder (_received, _expected) {
    const received = [..._received]
    const expected = [..._expected]
    const pass = this.equals(received.sort(), expected.sort()) && !this.not

    const message = pass
      ? () => `Arrays expected to be not equal\n\tReceived: ${this.utils.printReceived(received)}`
      : () => `Arrays are not equal\n\tExpected: ${this.utils.printExpected(expected)}\n\tReceived: ${this.utils.printReceived(received)}`

    return {message, pass}
  },
})

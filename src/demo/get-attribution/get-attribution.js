import Adjust from '../../sdk/main'
import SimpleAction from '../simple-action'
import { write } from '../log'

function init () {
  SimpleAction('get-attr', () => {
    const attr = Adjust.getAttribution()

    if (attr) {
      write('Attribution:')
      write(JSON.stringify(attr, undefined, 2))
    }
  })()
}

export default init

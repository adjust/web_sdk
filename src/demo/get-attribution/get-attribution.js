import Adjust from '../../sdk/main'
import SimpleAction from '../simple-action'
import { write } from '../log'

function init() {
  SimpleAction('get-attr', () => {
    Adjust.waitForAttribution()
      .then(attr => {
        write('Attribution:')
        write(JSON.stringify(attr, undefined, 2))
      })
  })()
}

export default init

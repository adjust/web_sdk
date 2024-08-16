import Adjust from '../../sdk/main'
import SimpleAction from '../simple-action'
import { write } from '../log'

function init() {
  SimpleAction('get-web-uuid', () => {
    Adjust.waitForWebUUID()
      .then(web_uuid => {
        write('Web UUID:')
        write(web_uuid)
      })
  })()
}

export default init

import Adjust from '../../sdk/main'
import SimpleAction from '../simple-action'
import { write } from '../log'

function init () {
  SimpleAction('get-web-uuid', () => {
    const web_uuid = Adjust.getWebUUID()

    if (web_uuid) {
      write('Web UUID:')
      write(web_uuid)
    }
  })()
}

export default init

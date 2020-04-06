import Adjust from '../../sdk/main'
import SimpleAction from '../simple-action'

function init () {
  SimpleAction('restart', Adjust.restart)()
}

export default init

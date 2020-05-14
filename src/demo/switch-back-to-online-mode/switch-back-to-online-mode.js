import Adjust from '../../sdk/main'
import SimpleAction from '../simple-action'

function init () {
  SimpleAction('goonline', Adjust.switchBackToOnlineMode)()
}

export default init

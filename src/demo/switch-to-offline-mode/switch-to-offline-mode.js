import Adjust from '../../sdk/main'
import SimpleAction from '../simple-action'

function init () {
  SimpleAction('gooffline', Adjust.switchToOfflineMode)()
}

export default init

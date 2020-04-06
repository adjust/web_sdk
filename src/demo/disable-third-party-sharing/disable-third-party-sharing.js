import Adjust from '../../sdk/main'
import SimpleAction from '../simple-action'

function init () {
  SimpleAction('dtps', Adjust.disableThirdPartySharing)()
}

export default init

import Adjust from '../../sdk/main'
import SimpleAction from '../simple-action'

function init () {
  SimpleAction('cleargpp', Adjust.clearGlobalPartnerParameters)()
}

export default init

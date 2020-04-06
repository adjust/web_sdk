import Adjust from '../../sdk/main'
import SimpleAction from '../simple-action'

function init () {
  SimpleAction('cleargcp', Adjust.clearGlobalCallbackParameters)()
}

export default init

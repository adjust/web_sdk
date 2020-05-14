import Adjust from '../../sdk/main'
import SimpleAction from '../simple-action'

function init () {
  SimpleAction('gdpr', Adjust.gdprForgetMe)()
}

export default init

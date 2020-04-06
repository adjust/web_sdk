import Adjust from '../../sdk/main'
import AddGlobalParams from '../add-global-params'

function init () {
  AddGlobalParams('addgcp', Adjust.addGlobalCallbackParameters)()
}

export default init

import Adjust from '../../sdk/main'
import AddGlobalParams from '../add-global-params/add-global-params'

function init () {
  AddGlobalParams('addgpp', Adjust.addGlobalPartnerParameters)()
}

export default init

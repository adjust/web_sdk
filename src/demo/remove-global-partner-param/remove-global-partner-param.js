import Adjust from '../../sdk/main'
import RemoveGlobalParam from '../remove-global-param'

function init () {
  RemoveGlobalParam('removegpp', Adjust.removeGlobalPartnerParameter)()
}

export default init

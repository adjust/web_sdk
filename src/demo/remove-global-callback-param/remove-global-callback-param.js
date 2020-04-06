import Adjust from '../../sdk/main'
import RemoveGlobalParam from '../remove-global-param'

function init () {
  RemoveGlobalParam('removegcp', Adjust.removeGlobalCallbackParameter)()
}

export default init

const ACTION_SYMBOLS = {
  add: '+',
  remove: '×'
}
const ACTION_KEY_CLS = 'key-input'
const ACTION_VALUE_CLS = 'value-input'

function _createNode (name, classes = [], content, attrs) {
  const element = document.createElement(name)

  element.classList.add(...classes)

  if (content) {
    element.appendChild(document.createTextNode(content))
  }

  Object.entries(attrs)
    .map(([key, value]) => element[key] = value)

  return element
}

function _createInput (inputCls, label, value = '') {
  const keyParent = _createNode('div', ['form-row', 'flex-one', 'flex-box-row'])
  const keyLabel = _createNode('label', ['flex-auto'], label)
  const keyInput = _createNode('input', ['flex-one', inputCls], null, {type: 'text', value})

  keyParent.appendChild(keyLabel)
  keyParent.appendChild(keyInput)

  return keyParent
}

function _createPair (handle, isLast, param = {}) {
  const group = _createNode('div', ['flex-box-row', 'form-row-group'])
  const keyInput = _createInput(ACTION_KEY_CLS, 'Key', param.key)
  const valueInput = _createInput(ACTION_VALUE_CLS, 'Value', param.value)
  const actionName = isLast ? 'add' : 'remove'
  const action = _createNode('button', ['flex-auto', actionName], ACTION_SYMBOLS[actionName], {type: 'button'})

  action.addEventListener('click', handle, false)
  group.appendChild(keyInput)
  group.appendChild(valueInput)
  group.appendChild(action)

  return group
}

const KeyValueParams = (id, params = []) => {
  const _id = id
  const _params = params
  let _parent = null

  function init () {
    _parent = document.getElementById(_id)

    if (_params.length) {
      _params.forEach((param, idx) => {
        const isLast = idx === params.length - 1
        const pair = _createPair(isLast ? _handleAdd : _handleRemove, isLast, param)
        _parent.appendChild(pair)
      })
    } else {
      const pair = _createPair(_handleAdd, true)
      _parent.appendChild(pair)
    }
  }

  function query () {
    const rows = _parent.querySelectorAll('.form-row-group')
    return Array.from(rows)
      .map(row => {
        const key = row.querySelector(`.${ACTION_KEY_CLS}`).value
        const value = row.querySelector(`.${ACTION_VALUE_CLS}`).value
        return key && value ? {key, value} : null
      })
      .filter(row => !!row)
  }

  function _handleRemove (e) {
    const action = e.target
    action.removeEventListener('click', _handleRemove, false)
    action.parentNode.remove()
  }

  function _handleAdd (e) {
    const row = e.target.parentNode
    const keyInput = row.querySelector(`.${ACTION_KEY_CLS}`).value
    const valueInput = row.querySelector(`.${ACTION_VALUE_CLS}`).value

    if (!keyInput || !valueInput) {
      return
    }

    const pair = _createPair(_handleAdd, true)

    _parent.appendChild(pair)
    _swapAction(row)
  }

  function _swapAction (parent) {
    const removeAction = _createNode('button', ['flex-auto', 'remove'], ACTION_SYMBOLS.remove, {type: 'button'})
    const addAction = parent.querySelector('.add')

    removeAction.addEventListener('click', _handleRemove, false)
    addAction.removeEventListener('click', _handleAdd, false)

    addAction.remove()
    parent.appendChild(removeAction)
  }

  return {
    init,
    query
  }
}

export default KeyValueParams

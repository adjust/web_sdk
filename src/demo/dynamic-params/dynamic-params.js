import { capitalize } from '../utils'

const ACTION_SYMBOLS = {
  add: '+',
  remove: '×'
}

function _createNode(name, classes = [], content, attrs = {}) {
  const element = document.createElement(name)

  element.classList.add(...classes)

  if (content) {
    element.appendChild(document.createTextNode(content))
  }

  Object.keys(attrs)
    .map(key => [key, attrs[key]])
    .map(([key, value]) => element[key] = value)

  return element
}

function _createInput(inputCls, label, value = '') {
  const keyParent = _createNode('div', ['flex-box-column'])
  keyParent.style.height = '45px'
  const keyLabel = _createNode('label', ['flex-auto'], label)
  const keyInput = _createNode('input', ['flex-one', inputCls], null, { type: 'text', value })

  keyParent.appendChild(keyLabel)
  keyParent.appendChild(keyInput)

  return keyParent
}

function _append(parent, handle, isLast, fields, param = {}) {
  const group = _createNode('div', ['flex-box-row', 'form-row-group'])

  const elements = []
  fields.forEach(field => {
    elements.push(_createInput(`${field}-input`, capitalize(field), param[field]))
  })
  group.append(...elements)

  const actionName = isLast ? 'add' : 'remove'
  const action = _createNode('button', ['flex-auto', actionName], ACTION_SYMBOLS[actionName], { type: 'button' })

  action.addEventListener('click', handle, false)
  group.appendChild(action)

  parent.appendChild(group)
}

const DynamicParams = (id, fields = ['key', 'value'], params = [], onChange) => {
  const _id = id
  const _fields = fields
  const _params = params
  let _parent = null

  function init() {
    _parent = document.getElementById(_id)

    if (_params.length) {
      _params.forEach((param, idx) => {
        const isLast = idx === params.length - 1
        const handle = isLast ? _handleAdd : _handleRemove
        _append(_parent, handle, isLast, _fields, param)
      })
    } else {
      _append(_parent, _handleAdd, true, _fields)
    }
  }

  function query() {
    const rows = _parent.querySelectorAll('.form-row-group')
    return Array.from(rows)
      .map(row => {
        const pairs = _fields
          .map(field => [field, row.querySelector(`.${field}-input`).value])

        if (pairs.some(([, value]) => value === '')) {
          return null
        }

        return pairs.reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {})
      })
      .filter(row => !!row)
  }

  function reset() {
    Array.from(_parent.querySelectorAll('.form-row-group'))
      .map(row => {
        const action = row.querySelector('button')
        const handle = action.classList.contains('add') ? _handleAdd : _handleRemove
        action.removeEventListener('click', handle, false)
        row.remove()
      })

    _append(_parent, _handleAdd, true, _fields)
  }

  function _handleRemove(e) {
    const action = e.target
    action.removeEventListener('click', _handleRemove, false)
    action.parentNode.remove()

    if (typeof onChange === 'function') {
      onChange()
    }
  }

  function _handleAdd(e) {
    const row = e.target.parentNode

    const pairs = _fields
      .map(field => [field, row.querySelector(`.${field}-input`).value])

    if (pairs.some(([, value]) => value === '')) {
      return
    }

    _append(_parent, _handleAdd, true, _fields)
    _swapAction(row)

    if (typeof onChange === 'function') {
      onChange()
    }
  }

  function _swapAction(parent) {
    const removeAction = _createNode('button', ['flex-auto', 'remove'], ACTION_SYMBOLS.remove, { type: 'button' })
    const addAction = parent.querySelector('.add')

    removeAction.addEventListener('click', _handleRemove, false)
    addAction.removeEventListener('click', _handleAdd, false)

    addAction.remove()
    parent.appendChild(removeAction)
  }

  return {
    init,
    query,
    reset
  }
}

export default DynamicParams

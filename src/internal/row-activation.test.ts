import { describe, expect, it } from 'vitest'

import { isRowActivation } from './row-activation'

function row(html: string) {
  const element = document.createElement('div')
  element.innerHTML = html
  document.body.append(element)

  return element
}

describe('isRowActivation', () => {
  it('takes a click on plain content, text nodes included', () => {
    const element = row('<span>Ada</span>')
    const span = element.querySelector('span') as HTMLElement

    expect(isRowActivation(element, span)).toBe(true)
    expect(isRowActivation(element, span.firstChild)).toBe(true)
    expect(isRowActivation(element, element)).toBe(true)
  })

  it.each([
    '<a href="/x"><i>go</i></a>',
    '<button type="button"><i>go</i></button>',
    '<input />',
    '<label><i>go</i></label>',
    '<div role="menuitem"><i>go</i></div>',
    '<div role="switch"><i>go</i></div>',
    '<div data-row-click-ignore><i>go</i></div>',
    '<div data-table-row-click-ignore><i>go</i></div>',
  ])('leaves %s to the control', (html) => {
    const element = row(html)
    const target =
      element.querySelector('i') ?? (element.firstElementChild as Element)

    expect(isRowActivation(element, target)).toBe(false)
  })

  it('does not treat an anchor without href as a control', () => {
    const element = row('<a><i>plain</i></a>')

    expect(isRowActivation(element, element.querySelector('i'))).toBe(true)
  })

  it('refuses a target outside the row, as a portalled menu is', () => {
    const element = row('<span>Ada</span>')
    const outside = document.createElement('div')
    document.body.append(outside)

    expect(isRowActivation(element, outside)).toBe(false)
    expect(isRowActivation(element, null)).toBe(false)
  })

  it('does not count the row itself as a control even when it is one', () => {
    const element = row('<span>Ada</span>')
    element.setAttribute('role', 'button')

    expect(isRowActivation(element, element.querySelector('span'))).toBe(true)
  })
})

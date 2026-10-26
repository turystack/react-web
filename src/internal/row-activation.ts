/**
 * Whether a click inside a clickable row is a click on the row.
 *
 * Shared by Table (`onRowClick`) and List (`onItemClick`): a row that acts on
 * a click also holds controls of its own — an actions menu trigger, an inline
 * button, a link, a checkbox — and a click on one of them belongs to that
 * control. Consumers never stopPropagation; the row decides.
 */

/**
 * What a click inside a row can land on that is not "the row". Any element
 * can opt out with `data-row-click-ignore`; Table's historical
 * `data-table-row-click-ignore` keeps working.
 */
export const rowInteractiveSelector = [
  'a[href]',
  'button',
  'input',
  'label',
  'select',
  'textarea',
  '[contenteditable=""]',
  '[contenteditable="true"]',
  '[role="button"]',
  '[role="checkbox"]',
  '[role="combobox"]',
  '[role="link"]',
  '[role="menuitem"]',
  '[role="menuitemcheckbox"]',
  '[role="menuitemradio"]',
  '[role="option"]',
  '[role="switch"]',
  '[role="tab"]',
  '[data-row-click-ignore]',
  '[data-table-row-click-ignore]',
].join(',')

/**
 * React bubbles a portalled element's events through its React parent, so a
 * click on an open DropdownMenu item reaches the row although the menu is not
 * inside it in the DOM. Anything outside the row's DOM subtree is therefore
 * not a click on the row.
 */
export function isRowActivation(row: HTMLElement, target: EventTarget | null) {
  if (!(target instanceof Node) || !row.contains(target)) {
    return false
  }

  const element = target instanceof Element ? target : target.parentElement
  const interactive = element?.closest(rowInteractiveSelector)

  return !(interactive && interactive !== row && row.contains(interactive))
}

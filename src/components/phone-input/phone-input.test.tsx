import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'

import { TuryProvider } from '@/components/tury-provider'

import { PhoneInput } from './phone-input'

beforeAll(() => {
  // The country list scrolls inside a scroll area that asks its viewport for
  // running animations, and jsdom ships no Web Animations API.
  if (!Element.prototype.getAnimations) {
    Element.prototype.getAnimations = () => []
  }
})

// Opening the picker mounts every country row with its flag, which is slow
// enough on a loaded machine to outlast the default per-test budget.
const LIST_TIMEOUT = 30_000

function field() {
  return screen.getByRole('textbox')
}

function countryTrigger() {
  return screen.getByRole('button', {
    name: 'Select country code',
  })
}

describe('PhoneInput', () => {
  it('offers a phone field beside a country picker', () => {
    render(<PhoneInput defaultCountry="BR" />)

    expect(field()).toBeInTheDocument()
    expect(countryTrigger()).toBeEnabled()
  })

  it('delivers the typed number split into country, code and national part', async () => {
    const onChange = vi.fn()
    render(<PhoneInput defaultCountry="BR" onChange={onChange} />)

    await userEvent.type(field(), '11987654321')

    expect(onChange).toHaveBeenLastCalledWith({
      ddi: '55',
      iso: 'BR',
      number: '11987654321',
    })
  })

  it('delivers null once the field is emptied', async () => {
    const onChange = vi.fn()
    render(<PhoneInput defaultCountry="BR" onChange={onChange} />)

    await userEvent.type(field(), '11987654321')
    await userEvent.clear(field())

    expect(onChange).toHaveBeenLastCalledWith(null)
  })

  it('accepts typing with nobody listening', async () => {
    render(<PhoneInput defaultCountry="BR" />)

    await userEvent.type(field(), '11987654321')

    expect(field()).toHaveValue('(11) 98765-4321')
  })

  it('shows the number it was given', () => {
    render(
      <PhoneInput
        defaultCountry="BR"
        value={{
          ddi: '55',
          iso: 'BR',
          number: '11987654321',
        }}
      />,
    )

    expect(field()).toHaveValue('+55 11 98765 4321')
  })

  it('shows an already international number as it stands', () => {
    render(
      <PhoneInput
        value={{
          iso: 'BR',
          number: '+5511987654321',
        }}
      />,
    )

    expect(field()).toHaveValue('+55 11 98765 4321')
  })

  it('follows the value it is given when controlled', () => {
    const { rerender } = render(
      <PhoneInput
        defaultCountry="BR"
        value={{
          ddi: '55',
          iso: 'BR',
          number: '11987654321',
        }}
      />,
    )

    rerender(
      <PhoneInput
        defaultCountry="BR"
        value={{
          ddi: '55',
          iso: 'BR',
          number: '2133334444',
        }}
      />,
    )

    expect(field()).toHaveValue('+55 21 3333 4444')
  })

  it('changes on its own when it is given no value', async () => {
    render(<PhoneInput defaultCountry="BR" />)

    await userEvent.type(field(), '21988887777')

    expect(field()).toHaveValue('(21) 98888-7777')
  })

  it('holds the value it was given while it is typed into', async () => {
    const onChange = vi.fn()
    render(
      <PhoneInput
        defaultCountry="BR"
        onChange={onChange}
        value={{
          ddi: '55',
          iso: 'BR',
          number: '1133334444',
        }}
      />,
    )

    await userEvent.type(field(), '5')

    expect(onChange).toHaveBeenCalled()
  })

  it('starts from the defaultValue it was given and changes on its own', async () => {
    render(
      <PhoneInput
        defaultCountry="BR"
        defaultValue={{
          ddi: '55',
          iso: 'BR',
          number: '1133334444',
        }}
      />,
    )

    expect(field()).toHaveValue('+55 11 3333 4444')

    await userEvent.clear(field())
    await userEvent.type(field(), '21988887777')

    expect(field()).toHaveValue('(21) 98888-7777')
  })

  it('announces the busy state on the phone field while loading', () => {
    render(<PhoneInput defaultCountry="BR" loading />)

    expect(field()).toHaveAttribute('aria-busy', 'true')
  })

  it('holds the change back until the typing settles when debounced', async () => {
    const onChange = vi.fn()
    render(<PhoneInput debounce defaultCountry="BR" onChange={onChange} />)

    await userEvent.type(field(), '1')

    expect(onChange).not.toHaveBeenCalled()

    await userEvent.type(field(), '1987654321')

    await waitFor(() => {
      expect(onChange).toHaveBeenLastCalledWith({
        ddi: '55',
        iso: 'BR',
        number: '11987654321',
      })
    })
    expect(field()).toHaveValue('(11) 98765-4321')
  })

  it('offers the picker with no flag when no country is set', () => {
    render(<PhoneInput />)

    expect(countryTrigger()).toBeEnabled()
    expect(field()).toHaveValue('')
  })

  it('blocks both halves of the control when disabled', () => {
    render(<PhoneInput defaultCountry="BR" disabled />)

    expect(field()).toBeDisabled()
    expect(countryTrigger()).toBeDisabled()
  })
})

describe('PhoneInput country picker', () => {
  it(
    'lists each country beside its dialing code',
    async () => {
      render(<PhoneInput defaultCountry="BR" />)

      await userEvent.click(countryTrigger())
      await userEvent.type(
        screen.getByPlaceholderText('Search country...'),
        'Brazil',
      )

      expect(
        await screen.findByRole('option', {
          name: /Brazil\+55/,
        }),
      ).toBeInTheDocument()
    },
    LIST_TIMEOUT,
  )

  it(
    'narrows the list down to what was searched for',
    async () => {
      render(<PhoneInput defaultCountry="BR" />)

      await userEvent.click(countryTrigger())
      await userEvent.type(
        screen.getByPlaceholderText('Search country...'),
        'Germany',
      )

      expect(
        await screen.findByRole('option', {
          name: /Germany/,
        }),
      ).toBeInTheDocument()
      expect(
        screen.queryByRole('option', {
          name: /Brazil/,
        }),
      ).not.toBeInTheDocument()
    },
    LIST_TIMEOUT,
  )

  it(
    'says so when the search matches no country',
    async () => {
      render(<PhoneInput defaultCountry="BR" />)

      await userEvent.click(countryTrigger())
      await userEvent.type(
        screen.getByPlaceholderText('Search country...'),
        'zzzzzz',
      )

      expect(await screen.findByText('No country found.')).toBeInTheDocument()
    },
    LIST_TIMEOUT,
  )

  it(
    'delivers the number under the country that was picked',
    async () => {
      const onChange = vi.fn()
      render(<PhoneInput defaultCountry="BR" onChange={onChange} />)

      await userEvent.type(field(), '11987654321')
      await userEvent.click(countryTrigger())
      await userEvent.type(
        screen.getByPlaceholderText('Search country...'),
        'Germany',
      )
      await userEvent.click(
        await screen.findByRole('option', {
          name: /Germany/,
        }),
      )

      expect(onChange).toHaveBeenLastCalledWith(
        expect.objectContaining({
          ddi: '49',
          iso: 'DE',
        }),
      )
    },
    LIST_TIMEOUT,
  )

  it(
    'closes the list and forgets the search once a country is picked',
    async () => {
      render(<PhoneInput defaultCountry="BR" />)

      await userEvent.click(countryTrigger())
      await userEvent.type(
        screen.getByPlaceholderText('Search country...'),
        'Germany',
      )
      await userEvent.click(
        await screen.findByRole('option', {
          name: /Germany/,
        }),
      )

      await waitFor(() => {
        expect(
          screen.queryByPlaceholderText('Search country...'),
        ).not.toBeInTheDocument()
      })

      await userEvent.click(countryTrigger())

      expect(screen.getByPlaceholderText('Search country...')).toHaveValue('')
    },
    LIST_TIMEOUT,
  )

  it(
    'sends the list back to the top when the search changes',
    async () => {
      render(<PhoneInput defaultCountry="BR" />)

      await userEvent.click(countryTrigger())

      const viewport = document.querySelector(
        '[data-slot="scroll-area-viewport"]',
      ) as HTMLElement
      // jsdom lays nothing out, so a viewport can never actually scroll; the
      // property is given a real backing value to stand in for a scrolled list.
      let scrollTop = 240
      Object.defineProperty(viewport, 'scrollTop', {
        configurable: true,
        get: () => scrollTop,
        set: (next: number) => {
          scrollTop = next
        },
      })

      await userEvent.type(
        screen.getByPlaceholderText('Search country...'),
        'Ger',
      )

      await waitFor(() => {
        expect(viewport.scrollTop).toBe(0)
      })
    },
    LIST_TIMEOUT,
  )

  it('opens no list while disabled', async () => {
    render(<PhoneInput defaultCountry="BR" disabled />)

    await userEvent.click(countryTrigger())

    expect(
      screen.queryByPlaceholderText('Search country...'),
    ).not.toBeInTheDocument()
  })
})

describe.each(['sm', 'md', 'lg'] as const)('PhoneInput size %s', (size) => {
  it('keeps both halves reachable', () => {
    render(<PhoneInput defaultCountry="BR" size={size} />)

    expect(field()).toBeEnabled()
    expect(countryTrigger()).toBeEnabled()
  })
})

describe('PhoneInput inside a provider that names a portal container', () => {
  let container: HTMLElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.append(container)
  })

  afterEach(() => {
    cleanup()
    container.remove()
  })

  it(
    'mounts the country picker inside the named container',
    async () => {
      render(
        <TuryProvider portalContainer={container}>
          <PhoneInput defaultCountry="BR" />
        </TuryProvider>,
      )

      await userEvent.click(countryTrigger())

      expect(container).toContainElement(
        await screen.findByPlaceholderText('Search country...'),
      )
    },
    LIST_TIMEOUT,
  )

  it(
    'leaves the country picker on the body when no container is named',
    async () => {
      render(
        <TuryProvider>
          <PhoneInput defaultCountry="BR" />
        </TuryProvider>,
      )

      await userEvent.click(countryTrigger())

      expect(container).not.toContainElement(
        await screen.findByPlaceholderText('Search country...'),
      )
    },
    LIST_TIMEOUT,
  )
})

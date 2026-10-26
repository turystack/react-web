import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Typography, typographyStyles } from './typography'
import type {
  TypographyAlign,
  TypographyMaxWidth,
  TypographySize,
  TypographyVariant,
  TypographyWeight,
} from './typography.types'

describe('Typography', () => {
  it('renders the text it is given', () => {
    render(<Typography>Hello</Typography>)

    expect(screen.getByTestId('typography')).toHaveTextContent('Hello')
  })

  it('renders a paragraph when asked for one', () => {
    render(<Typography component="p">Body copy</Typography>)

    expect(screen.getByRole('paragraph')).toHaveTextContent('Body copy')
  })

  it('renders nested content untouched', () => {
    render(
      <Typography component="div">
        <span>nested</span>
      </Typography>,
    )

    expect(screen.getByTestId('typography')).toHaveTextContent('nested')
  })

  it('keeps the text reachable with every visual prop set at once', () => {
    render(
      <Typography
        align="center"
        centered
        destructive
        maxWidth="md"
        size="2xl"
        truncate
        variant="muted"
        weight="bold"
      >
        Everything
      </Typography>,
    )

    expect(screen.getByTestId('typography')).toHaveTextContent('Everything')
  })
})

describe.each([1, 2, 3, 4, 5, 6] as const)('Typography h%i', (level) => {
  it('exposes the matching heading level', () => {
    render(<Typography component={`h${level}`}>Title</Typography>)

    expect(
      screen.getByRole('heading', {
        level,
        name: 'Title',
      }),
    ).toBeInTheDocument()
  })
})

describe.each([
  'xs',
  'sm',
  'base',
  'lg',
  'xl',
  '2xl',
  '3xl',
  '4xl',
  '5xl',
  '6xl',
  '7xl',
  '8xl',
  '9xl',
] as TypographySize[])('Typography size %s', (size) => {
  it('still renders its text', () => {
    render(<Typography size={size}>Sized</Typography>)

    expect(screen.getByTestId('typography')).toHaveTextContent('Sized')
  })
})

describe.each([
  'thin',
  'extralight',
  'light',
  'normal',
  'medium',
  'semibold',
  'bold',
  'extrabold',
  'black',
] as TypographyWeight[])('Typography weight %s', (weight) => {
  it('still renders its text', () => {
    render(<Typography weight={weight}>Weighted</Typography>)

    expect(screen.getByTestId('typography')).toHaveTextContent('Weighted')
  })
})

describe.each(['default', 'muted'] as TypographyVariant[])(
  'Typography variant %s',
  (variant) => {
    it('still renders its text', () => {
      render(<Typography variant={variant}>Colored</Typography>)

      expect(screen.getByTestId('typography')).toHaveTextContent('Colored')
    })
  },
)

describe.each(['left', 'center', 'right'] as TypographyAlign[])(
  'Typography align %s',
  (align) => {
    it('still renders its text', () => {
      render(<Typography align={align}>Aligned</Typography>)

      expect(screen.getByTestId('typography')).toHaveTextContent('Aligned')
    })
  },
)

describe.each(['xs', 'sm', 'md', 'lg'] as TypographyMaxWidth[])(
  'Typography maxWidth %s',
  (maxWidth) => {
    it('still renders its text', () => {
      render(<Typography maxWidth={maxWidth}>Measured</Typography>)

      expect(screen.getByTestId('typography')).toHaveTextContent('Measured')
    })
  },
)

describe('Typography destructive', () => {
  it.each(['default', 'muted'] as TypographyVariant[])(
    'wins over the %s colour variant',
    (variant) => {
      const classes = typographyStyles({
        destructive: true,
        variant,
      }).split(' ')

      expect(classes).toContain('text-destructive')
      expect(classes).not.toContain('text-foreground')
      expect(classes).not.toContain('text-muted-foreground')
    },
  )

  it('leaves the colour variant alone when it is not asked for', () => {
    expect(
      typographyStyles({
        destructive: false,
      }).split(' '),
    ).toContain('text-foreground')
  })
})

describe('Typography noWrap', () => {
  it('keeps the text on one line without clipping it', () => {
    const classes = typographyStyles({ noWrap: true }).split(' ')

    expect(classes).toContain('whitespace-nowrap')
    expect(classes).not.toContain('truncate')
  })

  it('lets the text wrap when it is not asked for', () => {
    expect(typographyStyles({}).split(' ')).not.toContain('whitespace-nowrap')
  })
})

describe('Typography inherit', () => {
  it('paints no colour and no weight, so the container decides both', () => {
    const classes = typographyStyles({
      variant: 'inherit',
      weight: 'inherit',
    }).split(' ')

    expect(
      classes.filter(
        (name) => name.startsWith('text-') && name !== 'text-base',
      ),
    ).toEqual([])
    expect(classes.filter((name) => name.startsWith('font-'))).toEqual([])
  })
})

describe('Typography size inherit', () => {
  it('sets no font size, so the container decides it', () => {
    render(<Typography size="inherit">Pay</Typography>)

    const node = screen.getByText('Pay')
    const sizes = Array.from(node.classList).filter((name) =>
      /^text-(xs|sm|base|lg|[2-9]?xl)$/.test(name),
    )
    expect(sizes).toEqual([])
    expect(node).toHaveClass('typography')
  })

  it('keeps the default size when size is not given', () => {
    render(<Typography>Pay</Typography>)

    expect(screen.getByText('Pay')).toHaveClass('text-base')
  })

  it('mirrors variant and weight inherit: nothing of its own at all', () => {
    const classes = typographyStyles({
      size: 'inherit',
      variant: 'inherit',
      weight: 'inherit',
    }).split(' ')

    expect(classes.filter((name) => /^(text|font)-/.test(name))).toEqual([])
  })
})

describe('Typography axes', () => {
  it('publishes its default size and variant for a theme to select', () => {
    render(<Typography>Hello</Typography>)

    const text = screen.getByTestId('typography')
    expect(text).toHaveAttribute('data-size', 'base')
    expect(text).toHaveAttribute('data-variant', 'default')
  })

  it('publishes the size and variant it was given', () => {
    render(
      <Typography size="lg" variant="muted">
        Hello
      </Typography>,
    )

    const text = screen.getByTestId('typography')
    expect(text).toHaveAttribute('data-size', 'lg')
    expect(text).toHaveAttribute('data-variant', 'muted')
  })
})

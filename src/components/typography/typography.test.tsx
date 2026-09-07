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

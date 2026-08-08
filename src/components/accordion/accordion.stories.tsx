import type { Meta } from '@storybook/react-vite'

import { Accordion } from './accordion'

const meta = {
  component: Accordion,
  title: 'Feedback/Accordion',
} satisfies Meta<typeof Accordion>

export default meta

export const Single = {
  render: () => (
    <Accordion collapsible type="single">
      <Accordion.Item value="item-1">
        <Accordion.Trigger>Is it accessible?</Accordion.Trigger>
        <Accordion.Content>
          Yes. It adheres to the WAI-ARIA design pattern.
        </Accordion.Content>
      </Accordion.Item>
      <Accordion.Item value="item-2">
        <Accordion.Trigger>Is it styled?</Accordion.Trigger>
        <Accordion.Content>
          Yes. It comes with default styles that matches the other components
          aesthetic.
        </Accordion.Content>
      </Accordion.Item>
      <Accordion.Item value="item-3">
        <Accordion.Trigger>Is it animated?</Accordion.Trigger>
        <Accordion.Content>
          Yes. It&apos;s animated by default, but you can disable it if you
          prefer.
        </Accordion.Content>
      </Accordion.Item>
    </Accordion>
  ),
}

export const Multiple = {
  render: () => (
    <Accordion type="multiple">
      <Accordion.Item value="item-1">
        <Accordion.Trigger>First section</Accordion.Trigger>
        <Accordion.Content>
          Content for the first section. Multiple items can be open at once.
        </Accordion.Content>
      </Accordion.Item>
      <Accordion.Item value="item-2">
        <Accordion.Trigger>Second section</Accordion.Trigger>
        <Accordion.Content>Content for the second section.</Accordion.Content>
      </Accordion.Item>
      <Accordion.Item value="item-3">
        <Accordion.Trigger>Third section</Accordion.Trigger>
        <Accordion.Content>Content for the third section.</Accordion.Content>
      </Accordion.Item>
    </Accordion>
  ),
}

export const Bordered = {
  render: () => (
    <Accordion bordered collapsible type="single">
      <Accordion.Item value="item-1">
        <Accordion.Trigger>Bordered item 1</Accordion.Trigger>
        <Accordion.Content>
          This accordion has a border around the container.
        </Accordion.Content>
      </Accordion.Item>
      <Accordion.Item value="item-2">
        <Accordion.Trigger>Bordered item 2</Accordion.Trigger>
        <Accordion.Content>
          Each item is separated by a border.
        </Accordion.Content>
      </Accordion.Item>
    </Accordion>
  ),
}

export const DefaultOpen = {
  render: () => (
    <Accordion defaultValue="item-2" type="single">
      <Accordion.Item value="item-1">
        <Accordion.Trigger>First</Accordion.Trigger>
        <Accordion.Content>First content.</Accordion.Content>
      </Accordion.Item>
      <Accordion.Item value="item-2">
        <Accordion.Trigger>Second (default open)</Accordion.Trigger>
        <Accordion.Content>This item is open by default.</Accordion.Content>
      </Accordion.Item>
    </Accordion>
  ),
}

export const Disabled = {
  render: () => (
    <Accordion collapsible type="single">
      <Accordion.Item value="item-1">
        <Accordion.Trigger>Enabled item</Accordion.Trigger>
        <Accordion.Content>This item can be toggled.</Accordion.Content>
      </Accordion.Item>
      <Accordion.Item disabled value="item-2">
        <Accordion.Trigger>Disabled item</Accordion.Trigger>
        <Accordion.Content>This content is hidden.</Accordion.Content>
      </Accordion.Item>
    </Accordion>
  ),
}

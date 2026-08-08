import type { Meta, StoryObj } from '@storybook/react-vite'
import { Avatar } from '@/components/avatar'
import { Button } from '@/components/button'
import { DropdownMenu } from '@/components/dropdown-menu'
import {
  ArrowDownToLine,
  Bell,
  Bus,
  ChevronsUpDown,
  ClipboardList,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Receipt,
  Route,
  Settings,
  UserCheck,
  Users,
} from '@/internal/icons'

import { ColorSchemeSwitcher } from '../color-scheme-switcher'
import { Layout } from './layout'
import { Sidebar } from './sidebar'

const meta = {
  parameters: {
    layout: 'fullscreen',
  },
  title: 'Layout/Layout',
} satisfies Meta

export default meta
type Story = StoryObj

// ─── Shared nav data ──────────────────────────────────────────────────────────
const SIDEBAR_NAV = [
  {
    items: [
      {
        href: '/',
        icon: LayoutDashboard,
        title: 'Dashboard',
      },
    ],
    title: 'Geral',
  },
  {
    items: [
      {
        href: '/vehicles',
        icon: Bus,
        title: 'Veículos',
      },
      {
        href: '/drivers',
        icon: UserCheck,
        title: 'Motoristas',
      },
      {
        href: '/routes',
        icon: Route,
        title: 'Rotas',
      },
      {
        href: '/trips',
        icon: Route,
        title: 'Viagens',
      },
    ],
    title: 'Operações',
  },
  {
    items: [
      {
        href: '/orders',
        icon: ClipboardList,
        title: 'Pedidos',
      },
      {
        href: '/clients',
        icon: Users,
        title: 'Clientes',
      },
    ],
    title: 'Comercial',
  },
  {
    items: [
      {
        href: '/payments',
        icon: CreditCard,
        title: 'Pagamentos',
      },
      {
        href: '/receivables',
        icon: Receipt,
        title: 'Recebíveis',
      },
      {
        href: '/withdrawals',
        icon: ArrowDownToLine,
        title: 'Saques',
      },
    ],
    title: 'Financeiro',
  },
  {
    items: [
      {
        href: '/settings',
        icon: Settings,
        title: 'Configurações',
      },
    ],
    title: 'Sistema',
  },
]

export const OABusOps: Story = {
  name: 'OABus Ops',
  render: () => {
    const visibleNav = SIDEBAR_NAV.flatMap((group) => {
      return group.items.length
        ? [
            {
              ...group,
              items: group.items,
            },
          ]
        : []
    })

    return (
      <Sidebar.Provider defaultOpen>
        <Sidebar collapsible="icon" side="left" variant="sidebar">
          <Sidebar.Header>
            <div className="flex items-center gap-2 px-1 py-1.5 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary font-bold text-primary-foreground text-sm">
                OA
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                <span className="truncate font-semibold">OABus</span>
                <span className="truncate text-muted-foreground text-xs">
                  Ops
                </span>
              </div>
            </div>
          </Sidebar.Header>

          <Sidebar.Content>
            {visibleNav.map((group) => (
              <Sidebar.Group key={group.title}>
                <Sidebar.Group.Label>{group.title}</Sidebar.Group.Label>
                <Sidebar.Group.Content>
                  <Sidebar.Menu>
                    {group.items.map((item) => (
                      <Sidebar.Menu.Item key={item.href}>
                        <Sidebar.Menu.Button
                          isActive={location.pathname === item.href}
                          tooltip={item.title}
                        >
                          <item.icon />
                          <span>{item.title}</span>
                        </Sidebar.Menu.Button>
                      </Sidebar.Menu.Item>
                    ))}
                  </Sidebar.Menu>
                </Sidebar.Group.Content>
              </Sidebar.Group>
            ))}
          </Sidebar.Content>

          <Sidebar.Footer>
            <Sidebar.Menu>
              <Sidebar.Menu.Item>
                <DropdownMenu>
                  <DropdownMenu.Trigger asChild>
                    <Sidebar.Menu.Button size="lg" tooltip="Account options">
                      <Avatar size="sm">O</Avatar>
                      <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate font-semibold">John Doe</span>
                        <span className="truncate text-muted-foreground text-xs">
                          john.doe@example.com
                        </span>
                      </div>
                      <ChevronsUpDown className="ml-auto size-4" />
                    </Sidebar.Menu.Button>
                  </DropdownMenu.Trigger>
                  <DropdownMenu.Content align="end" side="right" sideOffset={4}>
                    <div className="flex items-center gap-2 px-1.5 py-1.5 text-sm">
                      <Avatar size="sm">O</Avatar>
                      <div className="grid flex-1 text-left leading-tight">
                        <span className="truncate font-semibold">John Doe</span>
                        <span className="truncate text-muted-foreground text-xs">
                          john.doe@example.com
                        </span>
                      </div>
                    </div>
                    <DropdownMenu.Separator />
                    <DropdownMenu.Item onClick={() => {}} variant="destructive">
                      <LogOut />
                      Sign out
                    </DropdownMenu.Item>
                  </DropdownMenu.Content>
                </DropdownMenu>
              </Sidebar.Menu.Item>
            </Sidebar.Menu>
          </Sidebar.Footer>
        </Sidebar>

        <Sidebar.Inset>
          <Layout.Header sticky>
            <Sidebar.Trigger />
            <span className="ml-2 font-semibold text-sm">OABus Ops</span>
          </Layout.Header>

          <Layout.Main>
            <Layout.Content maxWidth="lg" padding="md">
              <div>Hello World</div>
            </Layout.Content>
          </Layout.Main>
        </Sidebar.Inset>
      </Sidebar.Provider>
    )
  },
}
export const OABusOpsWithSections: Story = {
  name: 'OABus Ops — Header com Sections',
  render: () => {
    const visibleNav = SIDEBAR_NAV.flatMap((group) => {
      return group.items.length
        ? [
            {
              ...group,
              items: group.items,
            },
          ]
        : []
    })

    return (
      <Sidebar.Provider defaultOpen>
        <Sidebar collapsible="icon" side="left" variant="sidebar">
          <Sidebar.Header>
            <div className="flex items-center gap-2 px-1 py-1.5 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary font-bold text-primary-foreground text-sm">
                OA
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                <span className="truncate font-semibold">OABus</span>
                <span className="truncate text-muted-foreground text-xs">
                  Ops
                </span>
              </div>
            </div>
          </Sidebar.Header>

          <Sidebar.Content>
            {visibleNav.map((group) => (
              <Sidebar.Group key={group.title}>
                <Sidebar.Group.Label>{group.title}</Sidebar.Group.Label>
                <Sidebar.Group.Content>
                  <Sidebar.Menu>
                    {group.items.map((item) => (
                      <Sidebar.Menu.Item key={item.href}>
                        <Sidebar.Menu.Button
                          isActive={location.pathname === item.href}
                          tooltip={item.title}
                        >
                          <item.icon />
                          <span>{item.title}</span>
                        </Sidebar.Menu.Button>
                      </Sidebar.Menu.Item>
                    ))}
                  </Sidebar.Menu>
                </Sidebar.Group.Content>
              </Sidebar.Group>
            ))}
          </Sidebar.Content>

          <Sidebar.Footer>
            <Sidebar.Menu>
              <Sidebar.Menu.Item>
                <DropdownMenu>
                  <DropdownMenu.Trigger asChild>
                    <Sidebar.Menu.Button size="lg" tooltip="Account options">
                      <Avatar size="sm">JD</Avatar>
                      <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate font-semibold">John Doe</span>
                        <span className="truncate text-muted-foreground text-xs">
                          john.doe@example.com
                        </span>
                      </div>
                      <ChevronsUpDown className="ml-auto size-4" />
                    </Sidebar.Menu.Button>
                  </DropdownMenu.Trigger>
                  <DropdownMenu.Content align="end" side="right" sideOffset={4}>
                    <div className="flex items-center gap-2 px-1.5 py-1.5 text-sm">
                      <Avatar size="sm">JD</Avatar>
                      <div className="grid flex-1 text-left leading-tight">
                        <span className="truncate font-semibold">John Doe</span>
                        <span className="truncate text-muted-foreground text-xs">
                          john.doe@example.com
                        </span>
                      </div>
                    </div>
                    <DropdownMenu.Separator />
                    <DropdownMenu.Item onClick={() => {}} variant="destructive">
                      <LogOut />
                      Sign out
                    </DropdownMenu.Item>
                  </DropdownMenu.Content>
                </DropdownMenu>
              </Sidebar.Menu.Item>
            </Sidebar.Menu>
          </Sidebar.Footer>
        </Sidebar>

        <Sidebar.Inset>
          <Layout.Header
            leftSection={
              <>
                <Sidebar.Trigger />
                <span className="ml-2 font-semibold text-sm">OABus Ops</span>
              </>
            }
            rightSection={
              <>
                <ColorSchemeSwitcher />
                <Button
                  aria-label="Notifications"
                  size="icon-md"
                  variant="ghost"
                >
                  <Bell />
                </Button>
                <DropdownMenu>
                  <DropdownMenu.Trigger asChild>
                    <Button
                      aria-label="Account options"
                      size="icon-md"
                      variant="ghost"
                    >
                      <Avatar size="sm">JD</Avatar>
                    </Button>
                  </DropdownMenu.Trigger>
                  <DropdownMenu.Content
                    align="end"
                    side="bottom"
                    sideOffset={4}
                    width={200}
                  >
                    <div className="flex items-center gap-2 px-1.5 py-1.5 text-sm">
                      <Avatar size="sm">JD</Avatar>
                      <div className="grid flex-1 text-left leading-tight">
                        <span className="truncate font-semibold">John Doe</span>
                        <span className="truncate text-muted-foreground text-xs">
                          john.doe@example.com
                        </span>
                      </div>
                    </div>
                    <DropdownMenu.Separator />
                    <DropdownMenu.Item onClick={() => {}} variant="destructive">
                      <LogOut />
                      Sign out
                    </DropdownMenu.Item>
                  </DropdownMenu.Content>
                </DropdownMenu>
              </>
            }
            sticky
          />

          <Layout.Main>
            <Layout.Content padding="sm">
              <div>Hello World</div>
            </Layout.Content>
          </Layout.Main>
        </Sidebar.Inset>
      </Sidebar.Provider>
    )
  },
}

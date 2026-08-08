/**
 * Modal
 *
 * Centered dialog overlay for focused content, forms, or confirmations.
 * Compound component with Header (Title + Description), Body, and Footer.
 *
 * Behavior:
 * - Overlay: fixed black/80 background covering the viewport
 * - Content: centered (top-50%, left-50%, translate -50%) with max-height 90vh
 * - Header: optional close button (X icon) and bordered bottom variant
 * - Body: flex-grow with overflow-auto for scrollable content
 * - Footer: flex-reverse layout (primary action on right), optional bordered top
 * - Clicking overlay or pressing Escape closes the modal
 * - Focus is trapped within the modal while open
 *
 * Implementation:
 * - Use Radix UI Dialog primitives (Portal, Overlay, Content, Close, Title, Description)
 * - Animation: zoom from 95%, fade in/out ~200ms
 * - Modal.Header supports nested dot notation: Modal.Header.Title, Modal.Header.Description
 * - <Modal open={show} onChange={setShow}>
 *     <Modal.Header closable bordered>
 *       <Modal.Header.Title>Edit Profile</Modal.Header.Title>
 *       <Modal.Header.Description>Update your info</Modal.Header.Description>
 *     </Modal.Header>
 *     <Modal.Body>form fields...</Modal.Body>
 *     <Modal.Footer bordered><Button>Save</Button></Modal.Footer>
 *   </Modal>
 *
 * Dependencies: @radix-ui/react-dialog, @turystack/react-icons (X icon)
 */

export type ModalProps = {
  open?: boolean // controlled open state
  onChange?: (open: boolean) => void // fires on open/close
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full' // popup size (default: 'md' = max-w-lg)
}

export type ModalHeaderProps = {
  closable?: boolean // shows close button in header
  bordered?: boolean // adds bottom border to header
}

export type ModalHeaderTitleProps = {}

export type ModalHeaderDescriptionProps = {}

export type ModalBodyProps = {}

export type ModalFooterProps = {
  bordered?: boolean // adds top border to footer
}

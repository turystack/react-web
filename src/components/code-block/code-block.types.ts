/**
 * CodeBlock
 *
 * A read-only viewer for code and JSON on backoffice screens: the request and
 * response of an API inspector, the payload behind an error page, the config a
 * support agent needs to read back to a customer.
 *
 * Behavior:
 * - An object `value` is pretty-printed as JSON with two spaces; a string is
 *   shown exactly as given
 * - `language` defaults to `json` for an object and `text` for a string; JSON
 *   is coloured per token (key, string, number, boolean/null, punctuation)
 *   with theme tokens and no highlighting dependency
 * - Everything renders as React text nodes, so a value holding markup shows
 *   the markup rather than running it
 * - `copyable` puts the printed text on the clipboard — the same characters
 *   the reader sees, never the line numbers
 * - `maxHeight` caps the block and scrolls inside it; `wrap` soft-wraps long
 *   lines instead of scrolling sideways
 * - While the content overflows, the scrolling area joins the tab order as a
 *   named region, so a keyboard user can scroll it; it is named by `ariaLabel`,
 *   else by `title`, else by the `codeBlock.label` label
 *
 * Implementation:
 * - <CodeBlock maxHeight="md" title="Response" value={response.body} />
 * - <CodeBlock language="text" lineNumbers value={stackTrace} wrap />
 *
 * Dependencies: CopyButton, labels (codeBlock.label)
 */

/** How the printed text is coloured. */
export type CodeBlockLanguage = 'json' | 'text'

/** How tall the block may grow before it scrolls inside. */
export type CodeBlockMaxHeight = 'sm' | 'md' | 'lg' | 'none'

/** What CodeBlock accepts: text shown as is, or an object printed as JSON. */
export type CodeBlockValue = string | object

export type CodeBlockProps = {
  ariaLabel?: string // names the scrolling region; overrides title and the default label
  copyable?: boolean // adds a control that copies the printed text; default true
  language?: CodeBlockLanguage // default json for an object value, text for a string
  lineNumbers?: boolean // shows a line-number gutter the copy never includes; default false
  maxHeight?: CodeBlockMaxHeight // caps the height and scrolls inside; default none
  title?: React.ReactNode // header row holding the title and the copy control
  value: CodeBlockValue // the code: a string as is, an object printed as JSON (required)
  wrap?: boolean // soft-wraps long lines instead of scrolling sideways; default false
}

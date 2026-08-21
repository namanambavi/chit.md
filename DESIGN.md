# Design system

## Direction

chit.md feels like a crisp note passed from one person or agent to another. The signature device is a restrained two-sheet offset stack: one pristine foreground page with one or two nearly flush sheets behind it. It appears at handoff moments—homepage proof, composer, published result, authentication, and empty states—never behind every component. The metaphor is contemporary stationery, not vintage paper, scrapbooking, receipts, or handwriting.

## Color

Light mode remains true white (`#FFFFFF`) with near-black ink (`#0D0D0D`), quiet fills (`#F7F7F8`, `#F1F1F1`), and sheet edges (`#E5E5E5`, `#D1D1D1`). Dark mode uses the ChatGPT charcoal family: canvas `#212121`, sheets `#2F2F2F`, hover `#3A3A3A`, ink `#ECECEC`, and edges `#424242`. Stacked sheets are created through boundaries and small physical offsets, never cream, texture, gradients, or colored shadows. Green and red remain status-only.

## Typography

Inter Variable carries interface and published reading. The reading column stays 65–70 characters with 16px text and generous 1.75 leading. Headings use weight and restrained scale; tracking never exceeds `-0.04em`. Monospace appears only for Markdown source, code, URLs, paths, timestamps, and other machine values.

## Components

Controls remain familiar: 10px corners, 38–42px targets, neutral borders, high-contrast primary actions, and circular icon actions. The navigation says “New chit”; the publishing action says “Make a chit.” Copy changes in place from overlapping sheets to a checkmark. Small status chips may use fully rounded geometry; content containers may not.

## Layout

The global header is one 52px row. Reading and account surfaces use 40px desktop / 16px mobile insets. The composer uses nearly the full laptop width, capped at 1440px with 16px edge insets; published documents use a 680–720px reading measure. Offset stacks collapse to smaller offsets on mobile so they never steal usable width. The foreground sheet always owns alignment; backing sheets never contain content.

## Motion and feedback

Passing a chit is the one authored motion: on successful publish, the result settles upward a few pixels while its backing sheet remains, suggesting a note placed into someone’s hand. Stack hover uses a restrained 260ms lift and fan; ordinary controls stay at 120–180ms. Reduced motion removes transforms. Hover never rotates or scatters sheets.

## Cross-surface rules

Reading always beats metaphor. Published Markdown is a clean semantic page with no visible source punctuation; the stack is confined to its outer frame and metadata band. Editors retain standard source/preview behavior. Every Markdown surface exposes one-click copying. Public links come first, private keep links appear only for anonymous publishing, and unclaimed chits expire after 24 hours. Authenticated publishes are saved immediately and may show the owner's chosen name. Responses are not part of the product.

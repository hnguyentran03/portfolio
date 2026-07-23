A tool that translates any PDF into a chosen language while keeping the document looking like the original. Instead of dumping the text into a translator and producing a plain-text result, it edits the PDF in place: PyMuPDF extracts every span of text along with its exact position, size, and color, the original text is whited out, and the translation is written back into the same spot on the page.

## Features

- Translates PDFs into any target language from a simple CLI prompt
- Preserves the original layout by whiting out and rewriting text in place, span by span
- Dynamic font sizing fits translations of any length into the original text's bounding box
- Keeps original text color and leaves images untouched
- One batched GPT call per page, with a few-shot prompt that keeps fragment positions aligned through JSON
- Outputs a translated copy alongside the source PDF

## Implementation details

The interesting problem is that a PDF has no idea what a paragraph is. PyMuPDF exposes each page as a tree of blocks, lines, and spans, where a span is just a run of text with one style at one position — so the pipeline works span by span, translating each fragment and fitting the result back into the bounding box the original occupied.

### Preserving the layout

For each page, every non-image block is covered with white rectangles drawn over the span bounding boxes, erasing the source text while leaving images and graphics untouched. Each translated span is then reinserted at its original coordinates in the original color, converted from the span's sRGB value back to PDF color space.

Translated text is rarely the same length as the source, so a fixed font size would overflow or underfill the box. Instead, the insertion routine sizes the text dynamically: starting from a font size of 1, it grows the size until the rendered text would exceed the bounding box's width or height, capped at the original span's font size, then vertically centers the result. The output stays inside the space the original text occupied no matter how the translation's length differs.

### Batching translations through GPT

Rather than one API call per fragment, all spans on a page are numbered and sent to OpenAI's chat completions API (gpt-4o-mini) as a single JSON object mapping position to text. A few-shot system prompt, with the target language substituted in, instructs the model to return the same JSON structure with every value translated and every key and ordering untouched, and includes examples covering markup tags, HTML entities, and numbers that should pass through unchanged. The response is parsed back into a position-to-translation map, so each translated fragment lands exactly on the span it came from.

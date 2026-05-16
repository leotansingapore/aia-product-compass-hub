#!/usr/bin/env python3
"""
parse-telegram-export.py

Parse the Telegram export at
aia-product-sales/case-studies/case-study-screenshots-drawings.md
and produce a JSON map of:

  photo_filename (e.g. "photo_2025-12-28_08-59-25.jpg")
  → {
      sender, ts, date,
      message_text_with_photo: "" (text in same message body before/after the image),
      context_before: [last 5 text messages from any sender, oldest→newest],
      context_after:  [next 5 text messages from any sender],
    }

The Telegram chat is the source-of-truth for what each drawing is — most
photos sit inside an appointment-debrief thread, so the 5 messages before
and after typically describe the drawing's purpose.

Output:
    python tools/parse-telegram-export.py > .tmp/photo-contexts.json
"""

import json
import re
import sys
from pathlib import Path

EXPORT = Path(
    "/Users/leo/Documents/New project/aia-product-sales/case-studies/case-study-screenshots-drawings.md"
)

DATE_RE = re.compile(r"^### (.+)$")
MSG_HEADER_RE = re.compile(r"^\*\*(\d{2}:\d{2}) — ([^*]+?)\*\*(?: _\((.*?)\)_)?\s*$")
IMG_RE = re.compile(r"!\[\]\(_attachments/case-study-screenshots-drawings/(.+?)\)")
EDIT_NOTE_RE = re.compile(r"^_edited \d{2}:\d{2}_\s*$")

CONTEXT_WINDOW = 5  # messages before + after each photo


def parse_messages():
    """Yield message dicts: {date, ts, sender, reply_to, text, images:[fn]}."""
    if not EXPORT.exists():
        sys.exit(f"export not found: {EXPORT}")

    lines = EXPORT.read_text().splitlines()
    current_date = None
    current_msg = None

    def flush(msg):
        if msg is None:
            return None
        msg["text"] = "\n".join(msg["text_lines"]).strip()
        del msg["text_lines"]
        return msg

    for line in lines:
        # Section/date headers
        m = DATE_RE.match(line)
        if m and m.group(1).strip() not in ("Participants", "Conversation"):
            current_date = m.group(1).strip()
            continue
        # Message header
        m = MSG_HEADER_RE.match(line)
        if m:
            yield_msg = flush(current_msg)
            if yield_msg is not None:
                yield yield_msg
            current_msg = {
                "date": current_date,
                "ts": m.group(1),
                "sender": m.group(2).strip(),
                "reply_to": m.group(3),
                "text_lines": [],
                "images": [],
            }
            continue
        if current_msg is None:
            continue
        # Image lines inside the current message
        for im in IMG_RE.finditer(line):
            current_msg["images"].append(im.group(1))
        if IMG_RE.search(line):
            continue
        # Edit-time annotations
        if EDIT_NOTE_RE.match(line):
            continue
        # Skip pure markup separators
        if line.strip() in ("---", ""):
            current_msg["text_lines"].append("")
            continue
        current_msg["text_lines"].append(line)

    yield_msg = flush(current_msg)
    if yield_msg is not None:
        yield yield_msg


def main():
    msgs = list(parse_messages())
    # Strip leading/trailing blank text lines
    for m in msgs:
        m["text"] = m["text"].strip()

    # Build photo → context map. The "key" is the URL-decoded photo filename
    # without the URL-encoding spaces (Telegram export sometimes uses %20).
    def decode_fn(fn: str) -> str:
        return fn.replace("%20", " ").replace("%28", "(").replace("%29", ")")

    photo_map = {}
    for i, m in enumerate(msgs):
        for img in m["images"]:
            fn = decode_fn(img)
            # Strip ".jpg"/".jpeg"/".png" — we'll match by the stem
            # (e.g. "photo_2025-12-28_08-59-25") so it lines up with the
            # enhanced bucket name "enhanced_<ts>_photo_2025-12-28_08-59-25.png".
            stem = fn.rsplit(".", 1)[0]

            before = [
                {"ts": x["ts"], "sender": x["sender"], "date": x["date"], "text": x["text"]}
                for x in msgs[max(0, i - CONTEXT_WINDOW): i]
                if x["text"]
            ][-CONTEXT_WINDOW:]
            after = [
                {"ts": x["ts"], "sender": x["sender"], "date": x["date"], "text": x["text"]}
                for x in msgs[i + 1: i + 1 + CONTEXT_WINDOW * 3]  # over-fetch then truncate
                if x["text"]
            ][:CONTEXT_WINDOW]
            photo_map[stem] = {
                "filename": fn,
                "stem": stem,
                "date": m["date"],
                "ts": m["ts"],
                "sender": m["sender"],
                "reply_to": m["reply_to"],
                "own_text": m["text"],
                "context_before": before,
                "context_after": after,
            }
    print(json.dumps(photo_map, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()

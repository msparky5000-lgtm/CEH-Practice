import json
from pathlib import Path


class BookmarkManager:
    def __init__(self):
        self.file = Path("data") / "bookmarks.json"
        self.bookmarks = self.load()

    def load(self):
        if not self.file.exists():
            return {"questions": []}

        try:
            with open(self.file, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return {"questions": []}

    def save(self):
        with open(self.file, "w", encoding="utf-8") as f:
            json.dump(self.bookmarks, f, indent=4)

    def is_bookmarked(self, chapter, index):
        return any(
            q["chapter"] == chapter and q["index"] == index
            for q in self.bookmarks["questions"]
        )

    def add(self, chapter, index):
        if not self.is_bookmarked(chapter, index):
            self.bookmarks["questions"].append({
                "chapter": chapter,
                "index": index
            })
            self.save()

    def remove(self, chapter, index):
        self.bookmarks["questions"] = [
            q for q in self.bookmarks["questions"]
            if not (
                q["chapter"] == chapter and
                q["index"] == index
            )
        ]
        self.save()

    def toggle(self, chapter, index):
        if self.is_bookmarked(chapter, index):
            self.remove(chapter, index)
            return False

        self.add(chapter, index)
        return True

    def get_all(self):
        return self.bookmarks["questions"]


    def count(self):
        return len(self.bookmarks["questions"])
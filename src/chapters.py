import json
import re
from pathlib import Path

import customtkinter as ctk


QUESTIONS_FOLDER = Path("data") / "questions"


class ChaptersPage(ctk.CTkFrame):

    def __init__(self, parent):
        super().__init__(parent)

        self.parent = parent
        self.chapters = self.load_chapters()

        self.build_ui()

    def load_chapters(self):

        chapters = []

        if not QUESTIONS_FOLDER.exists():
            return chapters

        files = list(QUESTIONS_FOLDER.glob("*.json"))

        files.sort(
            key=lambda f: int(
                re.search(r"Chapter\s+(\d+)", f.stem).group(1)
            )
        )

        for file in files:

            with open(file, "r", encoding="utf-8") as f:
                data = json.load(f)

            chapters.append({
                "title": data.get("chapter", file.stem),
                "file": str(file)
            })

        return chapters

    def build_ui(self):

        title = ctk.CTkLabel(
            self,
            text="Browse Chapters",
            font=("Segoe UI", 30, "bold")
        )
        title.pack(pady=20)

        scroll = ctk.CTkScrollableFrame(self)
        scroll.pack(
            fill="both",
            expand=True,
            padx=20,
            pady=20
        )

        for chapter in self.chapters:

            button = ctk.CTkButton(
                scroll,
                text=chapter["title"],
                height=45,
                command=lambda c=chapter: self.parent.show_quiz(c["file"])
            )

            button.pack(
                fill="x",
                padx=10,
                pady=6
            )

        bottom = ctk.CTkFrame(self)
        bottom.pack(fill="x", padx=20, pady=15)

        ctk.CTkButton(
            bottom,
            text="🏠 Home",
            command=self.parent.show_home
        ).pack(side="left")

        ctk.CTkButton(
            bottom,
            text="🎲 Random Quiz",
            command=lambda: self.parent.show_random_quiz(20)
        ).pack(side="right")
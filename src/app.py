import customtkinter as ctk

from .home import HomePage
from .chapters import ChaptersPage
from .quiz import QuizPage
from .quiz_builder import QuizBuilder
from src.exam_builder import build_exam


ctk.set_appearance_mode("Dark")
ctk.set_default_color_theme("blue")


class CEHPracticeApp(ctk.CTk):
    def __init__(self):
        super().__init__()

        self.title("CEH Practice App")
        self.geometry("1200x800")
        self.minsize(1000, 700)

        self.current_page = None

        self.protocol("WM_DELETE_WINDOW", self.destroy)

        self.show_home()

    def clear_page(self):
        """Remove the current page completely."""
        if self.current_page is not None:
            self.current_page.destroy()
            self.current_page = None

        self.update_idletasks()

    def show_page(self, page_factory):
        self.clear_page()

        self.current_page = page_factory(self)
        self.current_page.pack(fill="both", expand=True)

    def show_home(self):
        self.show_page(HomePage)

    def show_chapters(self):
        self.show_page(ChaptersPage)

    def show_quiz(self, chapter_file):
        quiz = QuizBuilder.load_chapter(chapter_file)

        self.show_page(
            lambda parent: QuizPage(
                parent,
                quiz_data=quiz
            )
        )

    def show_random_quiz(self, amount=20):
        quiz = QuizBuilder.random_quiz(amount)

        self.show_page(
            lambda parent: QuizPage(
                parent,
                quiz_data=quiz
            )
        )
    def show_exam(self):
        """Start a 125-question practice exam."""
        quiz = build_exam()

        self.show_page(
            lambda parent: QuizPage(
                parent,
                quiz_data=quiz
            )
        )
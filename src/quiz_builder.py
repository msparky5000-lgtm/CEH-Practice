import json
import random
from pathlib import Path


class QuizBuilder:
    """
    Loads CEH quiz JSON files and builds quizzes.
    """

    QUESTIONS_FOLDER = Path("data") / "questions"

    @classmethod
    def load_chapter(cls, chapter_file):

        path = Path(chapter_file)

        if not path.exists():
            path = cls.QUESTIONS_FOLDER / chapter_file

        if not path.exists():
            raise FileNotFoundError(path)

        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)

        if isinstance(data, dict):

            chapter_name = data.get("chapter", path.stem)

            # Tag every question with its chapter
            for question in data.get("questions", []):
                question["chapter"] = chapter_name

            data["chapter_file"] = str(path)

            return data

        # Older JSON format
        questions = data

        for question in questions:
            question["chapter"] = path.stem

        return {
            "chapter": path.stem,
            "chapter_file": str(path),
            "questions": questions
        }

    @classmethod
    def random_quiz(cls, amount=20):
        """
        Build a random quiz from every chapter.
        """

        questions = []

        for file in cls.QUESTIONS_FOLDER.glob("*.json"):

            with open(file, "r", encoding="utf-8") as f:
                data = json.load(f)

            if isinstance(data, dict):

                chapter_name = data.get("chapter", file.stem)

                for question in data.get("questions", []):
                    question["chapter"] = chapter_name

                questions.extend(data.get("questions", []))

            else:

                for question in data:
                    question["chapter"] = file.stem

                questions.extend(data)

        if not questions:
            return {
                "chapter": "Random Quiz",
                "questions": []
            }

        random.shuffle(questions)

        return {
            "chapter": f"Random Quiz ({min(amount, len(questions))} Questions)",
            "questions": questions[:amount]
        }

    @classmethod
    def load_all_questions(cls):
        """
        Return every question from every chapter.
        """

        all_questions = []

        for file in cls.QUESTIONS_FOLDER.glob("*.json"):

            with open(file, "r", encoding="utf-8") as f:
                data = json.load(f)

            if isinstance(data, dict):

                chapter_name = data.get("chapter", file.stem)

                for question in data.get("questions", []):
                    question["chapter"] = chapter_name

                all_questions.extend(data.get("questions", []))

            else:

                for question in data:
                    question["chapter"] = file.stem

                all_questions.extend(data)

        return all_questions
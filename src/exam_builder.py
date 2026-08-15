import json
import random
from pathlib import Path

QUESTIONS_FOLDER = Path("data") / "questions"


def build_exam():
    """
    Build a CEH practice exam containing exactly 125 questions.

    - 6 questions from every chapter
    - 5 random chapters contribute one extra question
    - Final list shuffled
    """

    chapter_files = sorted(QUESTIONS_FOLDER.glob("*.json"))

    if not chapter_files:
        raise FileNotFoundError("No chapter question files found.")

    exam_questions = []

    # Five random chapters receive one extra question
    bonus_files = set(random.sample(chapter_files, 5))

    for file in chapter_files:

        with open(file, "r", encoding="utf-8") as f:
            data = json.load(f)

        questions = data["questions"]

        if len(questions) < 7:
            raise ValueError(
                f"{file.name} has fewer than 7 questions."
            )

        random.shuffle(questions)

        amount = 7 if file in bonus_files else 6

        exam_questions.extend(questions[:amount])

    random.shuffle(exam_questions)

    return {
        "chapter": "CEH Practice Exam",
        "question_count": 125,
        "questions": exam_questions
    }
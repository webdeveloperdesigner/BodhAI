import React, { useEffect, useState } from "react";
import { ref, onValue, push } from "firebase/database";
import { db } from "../services/firebase";
import { getAuth } from "firebase/auth";
import "./TestMCQ.css";

const TestMCQ = () => {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [accuracy, setAccuracy] = useState(0);

  const auth = getAuth();
  const user = auth.currentUser;

  useEffect(() => {
    const qRef = ref(db, "mcqs/");
    onValue(qRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list = Object.values(data);
        setQuestions(list);
      }
    });
  }, []);

  const handleOptionChange = (qIndex, selectedOption) => {
    if (submitted) return;
    setAnswers({ ...answers, [qIndex]: selectedOption });
  };

  const getScore = () => {
    let correct = 0;
    questions.forEach((q, i) => {
      if (answers[i] === q.correctAnswer) {
        correct += 1;
      }
    });
    return correct;
  };

  const handleSubmit = async () => {
    const total = questions.length;
    const correct = getScore();
    const acc = ((correct / total) * 100).toFixed(2);
    setScore(correct);
    setAccuracy(acc);
    setSubmitted(true);

    const submissionDetails = {
      user: user?.email || "guest",
      testType: "mcq",
      score: correct,
      accuracy: acc,
      submittedAt: new Date().toISOString(),
      testId: `mcq-${new Date().toISOString().split("T")[0]}`,
      source: "Dashboard",
      answers: questions.map((q, i) => ({
        qid: q.id || i,
        selected: answers[i] || null,
        correct: q.correctAnswer,
      })),
    };

    try {
      await push(ref(db, "results/"), submissionDetails);
    } catch (err) {
      console.error("Error saving result:", err);
    }
  };

  return (
    <div className="mcq-test-container">
      <h2>📘 MCQ Test</h2>

      {questions.length === 0 && <p>Loading questions...</p>}

      {questions.map((q, index) => (
        <div className="mcq-question-card" key={index}>
          <h4>
            Q{index + 1}: {q.question}
          </h4>
          <ul className="mcq-options">
            {q.options.map((opt, i) => {
              const isSelected = answers[index] === opt;
              const isCorrect = q.correctAnswer === opt;
              const showCorrect = submitted && isCorrect;
              const showWrong = submitted && isSelected && !isCorrect;

              const labelClass = [
                "mcq-option-label",
                showCorrect ? "correct-answer" : "",
                showWrong ? "wrong-answer" : "",
              ]
                .filter(Boolean)
                .join(" ");

              return (
                <li key={i}>
                  <label className={labelClass}>
                    <input
                      type="radio"
                      name={`q-${index}`}
                      value={opt}
                      checked={isSelected}
                      onChange={() => handleOptionChange(index, opt)}
                      disabled={submitted}
                    />
                    {opt}
                  </label>
                </li>
              );
            })}
          </ul>
          {submitted && (
            <p className="mcq-explanation">
              <strong>Explanation:</strong> {q.explanation}
            </p>
          )}
        </div>
      ))}

      {!submitted && questions.length > 0 && (
        <button className="mcq-submit-btn" onClick={handleSubmit}>
          Submit
        </button>
      )}

      {submitted && (
        <div className="mcq-score-display">
          <p>✅ Score: {score} / {questions.length}</p>
          <p>🎯 Accuracy: {accuracy}%</p>
        </div>
      )}
    </div>
  );
};

export default TestMCQ;

import React, { useState } from "react";
import { ref, push } from "firebase/database";
import { db } from "../services/firebase";
import axios from "axios";
import "./AdminUpload.css"; // Assuming you have some styles for this component

function AdminUpload() {
  const [topic, setTopic] = useState("");
  const [mcqs, setMcqs] = useState([]);
  const [manualMCQ, setManualMCQ] = useState({
    question: "",
    options: ["", "", "", ""],
    correctAnswer: "",
    explanation: "",
  });
  const [loading, setLoading] = useState(false);

  const handleManualChange = (field, value) => {
    setManualMCQ({ ...manualMCQ, [field]: value });
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...manualMCQ.options];
    newOptions[index] = value;
    setManualMCQ({ ...manualMCQ, options: newOptions });
  };

  const addManualMCQ = () => {
    if (
      !manualMCQ.question ||
      manualMCQ.options.some((opt) => !opt) ||
      !manualMCQ.correctAnswer
    ) {
      alert("Please fill all fields.");
      return;
    }

    const today = new Date().toISOString().slice(0, 10);
    const newEntry = { ...manualMCQ, date: today };
    setMcqs([...mcqs, newEntry]);

    setManualMCQ({
      question: "",
      options: ["", "", "", ""],
      correctAnswer: "",
      explanation: "",
    });
  };

  const uploadToFirebase = () => {
    if (mcqs.length === 0) {
      alert("No MCQs to upload.");
      return;
    }

    const mcqRef = ref(db, "mcqs/");
    mcqs.forEach((q) => {
      push(mcqRef, q);
    });

    alert("✅ MCQs uploaded to Firebase!");
    setMcqs([]);
    setTopic("");
  };

  const generateWithGemini = async () => {
    setLoading(true);
    try {
      const res = await axios.post("https://your-backend-url.com/generate", {
        topic,
      });

      if (res.data && Array.isArray(res.data.questions)) {
        const today = new Date().toISOString().slice(0, 10);
        const formatted = res.data.questions.map((q) => ({
          ...q,
          date: today,
        }));
        setMcqs([...mcqs, ...formatted]);
      } else {
        alert("Invalid response from Gemini.");
      }
    } catch (err) {
      console.error("Gemini API error:", err);
      alert("Failed to generate from Gemini.");
    }
    setLoading(false);
  };

  const handleJSONUpload = (e) => {
    const file = e.target.files[0];
    if (!file || file.type !== "application/json") {
      alert("Please upload a valid .json file");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        const today = new Date().toISOString().slice(0, 10);

        let extractedMCQs = [];

        if (Array.isArray(data)) {
          extractedMCQs = data;
        } else if (typeof data === "object") {
          Object.values(data).forEach((group) => {
            if (Array.isArray(group)) {
              extractedMCQs.push(...group);
            }
          });
        }

        const valid = extractedMCQs
          .filter(
            (q) =>
              q.question &&
              Array.isArray(q.options) &&
              q.options.length === 4 &&
              q.correctAnswer &&
              q.explanation
          )
          .map((q) => ({ ...q, date: today }));

        if (valid.length === 0) {
          alert("No valid MCQs found.");
          return;
        }

        setMcqs((prev) => [...prev, ...valid]);
        alert(`✅ Loaded ${valid.length} MCQs from JSON.`);
      } catch (err) {
        console.error("JSON parsing error:", err);
        alert("Invalid JSON format.");
      }
    };

    reader.readAsText(file);
  };

  const handleTextareaJSON = (e) => {
    try {
      const data = JSON.parse(e.target.value);
      const today = new Date().toISOString().slice(0, 10);

      const valid = data
        .filter(
          (q) =>
            q.question &&
            Array.isArray(q.options) &&
            q.options.length === 4 &&
            q.correctAnswer &&
            q.explanation
        )
        .map((q) => ({ ...q, date: today }));

      if (valid.length === 0) {
        alert("No valid MCQs found.");
        return;
      }

      setMcqs((prev) => [...prev, ...valid]);
      alert(`✅ Pasted ${valid.length} MCQs successfully.`);
    } catch (err) {
      alert("Invalid JSON in textarea.");
    }
  };

  return (
    <div className="admin-panel">
      <h2>🛠️ Admin Upload Panel</h2>

      <input
        type="text"
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
        placeholder="Enter topic (e.g., Arrays)"
        style={{ padding: "10px", width: "100%", marginBottom: "10px" }}
      />
      <button onClick={generateWithGemini} disabled={loading}>
        ⚙️ Generate with Gemini
      </button>

      <hr />
      <h3>📁 Upload JSON File</h3>
      <input type="file" accept=".json" onChange={handleJSONUpload} />

      <h3>📋 Paste JSON (array format)</h3>
      <textarea
        rows={10}
        cols={80}
        placeholder='Paste [{"question":"...", "options": [...], "correctAnswer": "...", "explanation": "..."}]'
        onBlur={handleTextareaJSON}
        style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
      />

      <hr />
      <h3>📝 Add MCQ Manually</h3>

      <input
        type="text"
        placeholder="Question"
        value={manualMCQ.question}
        onChange={(e) => handleManualChange("question", e.target.value)}
        style={{ width: "100%", marginBottom: "8px", padding: "6px" }}
      />
      <div className="option-inputs">
      {manualMCQ.options.map((opt, i) => (
        <input
          key={i}
          type="text"
          placeholder={`Option ${i + 1}`}
          value={opt}
          onChange={(e) => handleOptionChange(i, e.target.value)}
          style={{ width: "48%", margin: "4px 1%", padding: "6px" }}
        />
      ))}
      </div>
      <input
        type="text"
        placeholder="Correct Answer"
        value={manualMCQ.correctAnswer}
        onChange={(e) => handleManualChange("correctAnswer", e.target.value)}
        style={{ width: "100%", marginBottom: "8px", padding: "6px" }}
      />
      <input
        type="text"
        placeholder="Explanation"
        value={manualMCQ.explanation}
        onChange={(e) => handleManualChange("explanation", e.target.value)}
        style={{ width: "100%", marginBottom: "8px", padding: "6px" }}
      />
      <button onClick={addManualMCQ}>➕ Add MCQ to Preview</button>

      <hr />
      <button
        onClick={uploadToFirebase}
        disabled={mcqs.length === 0}
        style={{ marginTop: "10px" }}
      >
        ⬆️ Upload All to Firebase
      </button>

      <hr />
      <h3>📊 Preview ({mcqs.length} MCQs)</h3>
      {mcqs.length === 0 ? (
        <p>No MCQs added yet.</p>
      ) : (
        <ul className="mcq-preview">
          {mcqs.map((q, i) => (
            <li key={i} style={{ marginBottom: "12px" }}>
              <strong>
                Q{i + 1}: {q.question}
              </strong>
              <ul>
                {q.options.map((opt, idx) => (
                  <li key={idx}>
                    {opt}
                    {opt === q.correctAnswer && <strong> ✅</strong>}
                  </li>
                ))}
              </ul>
              <em>Explanation: {q.explanation}</em>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default AdminUpload;

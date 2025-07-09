// src/components/TestCoding.js
import React, { useState } from "react";

function TestCoding() {
  const [code, setCode] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    setSubmitted(true);
  };

  return (
    <div>
      <h2>💻 Coding Question</h2>
      <p>
        Write a function to reverse a string in your preferred language (mock
        problem).
      </p>
      <textarea
        rows="10"
        cols="80"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="Write your code here..."
        disabled={submitted}
      />
      <br />
      {!submitted && <button onClick={handleSubmit}>Submit</button>}
      {submitted && <p>Code submitted! (Mock logic)</p>}
    </div>
  );
}

export default TestCoding;

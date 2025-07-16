import React, { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import { ref, onValue } from "firebase/database";
import { db } from "../services/firebase";
import "./ViewResults.css"; // Assuming you have some styles for this component


const ViewResults = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  const auth = getAuth();
  const user = auth.currentUser;

  useEffect(() => {
    if (!user) return;

    const resultsRef = ref(db, "results/");
    onValue(resultsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const allResults = Object.entries(data)
          .map(([id, value]) => ({ id, ...value }))
          .filter((item) => item.user === user.email);

        // Sort by submittedAt or fallback to date
        allResults.sort(
          (a, b) =>
            new Date(b.submittedAt || b.date) - new Date(a.submittedAt || a.date)
        );
        setResults(allResults);
      } else {
        setResults([]);
      }
      setLoading(false);
    });
  }, [user]);

  if (!user) return <p>Please log in to view your results.</p>;

  return (
    <div  className="results-container">
      <h2>📊 Your Test Results</h2>

      {loading ? (
        <p>Loading...</p>
      ) : results.length === 0 ? (
        <p>No results found.</p>
      ) : (
        <table
           className="results-table"
        >
          <thead>
            <tr style={{ backgroundColor: "#f0f0f0" }}>
              <th style={cellStyle}>#</th>
              <th style={cellStyle}>Date</th>
              <th style={cellStyle}>Score</th>
              <th style={cellStyle}>Accuracy</th>
              <th style={cellStyle}>Type</th>
              <th style={cellStyle}>Test ID</th>
            </tr>
          </thead>
          <tbody>
            {results.map((res, index) => (
              <tr key={res.id} style={{ borderBottom: "1px solid #ddd" }}>
                <td style={cellStyle}>{index + 1}</td>
                <td style={cellStyle}>
                  {new Date(res.submittedAt || res.date).toLocaleString("en-IN", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </td>
                <td style={cellStyle}>{res.score}</td>
                <td style={cellStyle}>{res.accuracy}%</td>
                <td style={cellStyle}>
                  <span
                   className={`badge ${res.testType === "coding" ? "badge-coding" : "badge-mcq"}`}
                  >
                    {res.testType?.toUpperCase() || "MCQ"}
                  </span>
                </td>
                <td style={cellStyle}>{res.testId || "N/A"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

const cellStyle = {
  padding: "10px",
  textAlign: "center",
};

export default ViewResults;

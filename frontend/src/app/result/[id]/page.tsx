'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { FileDown, RotateCcw } from 'lucide-react';

interface Question {
  text: string;
  options?: string[];
  difficulty: string;
  marks: number;
}

interface Section {
  title: string;
  description: string;
  questions: Question[];
}

interface Assignment {
  title: string;
  subject: string;
  grade: string;
  totalMarks: number;
  sections: Section[];
}

export default function ResultPage() {
  const { id } = useParams();
  const router = useRouter();
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAssignment = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/assignments/${id}`);
        setAssignment(response.data);
      } catch (error) {
        console.error('Error fetching assignment:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAssignment();
  }, [id]);

  if (loading) return <div className="result-state">Loading...</div>;
  if (!assignment) return <div className="result-state error">Assignment not found.</div>;

  return (
    <main className="result-shell animate-fade">
      <div className="result-toolbar">
        <div>
          <p className="eyebrow">Generated paper</p>
          <h1>{assignment.title}</h1>
          <span>{assignment.subject} / {assignment.grade}</span>
        </div>
        <div className="toolbar-actions">
          <button
            className="ghost-button"
            onClick={async () => {
              try {
                await axios.post(`http://localhost:5000/api/assignments/${id}/regenerate`);
                router.push(`/processing/${id}`);
              } catch (e) {
                console.error('Regenerate failed', e);
              }
            }}
          >
            <RotateCcw size={18} /> Regenerate
          </button>
          <button 
            className="primary-action"
            onClick={() => window.print()}
          >
            <FileDown size={18} /> Download PDF
          </button>
        </div>
      </div>

      <article className="paper">
        <header className="paper-header">
          <h1>Veda International School</h1>
          <div className="paper-meta">
             <span>Subject: {assignment.subject}</span>
             <span>Class: {assignment.grade}</span>
          </div>
          <div className="paper-meta">
             <span>Time Allowed: 3 Hours</span>
             <span>Maximum Marks: {assignment.totalMarks}</span>
          </div>
        </header>

        <div className="student-grid">
          <div>Name: </div>
          <div>Roll No: </div>
          <div>Section: </div>
        </div>

        <div className="instructions">
          <p>General Instructions:</p>
          <ul>
            <li>Attempt all questions.</li>
            <li>Marks for each question are indicated against it.</li>
            <li>Write neatly and clearly.</li>
          </ul>
        </div>

        {assignment.sections.map((section, sIndex) => (
          <section key={sIndex} className="paper-section">
            <div className="paper-section-heading">
              <h2>{section.title}</h2>
              <p>{section.description}</p>
            </div>
            
            <div className="question-paper-list">
              {section.questions.map((q, qIndex) => (
                <div key={qIndex} className="paper-question">
                  <span className="question-number">Q{qIndex + 1}.</span>
                  <div className="question-body">
                    <div>
                      <p className="question-text">{q.text}</p>
                      
                      {q.options && q.options.length > 0 && (
                        <div className="option-grid">
                          {q.options.map((opt, oIndex) => (
                            <div key={oIndex}>
                              <span>({String.fromCharCode(97 + oIndex)})</span>
                              <span>{opt}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <div className="question-meta">
                      <span>{q.difficulty}</span>
                      <strong>[{q.marks} Marks]</strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}

        <footer className="paper-footer">
          *** End of Question Paper ***
        </footer>
      </article>

    </main>
  );
}

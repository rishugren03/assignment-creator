'use client';

import React from 'react';
import { useAssignmentStore } from '@/store/useAssignmentStore';
import { BookOpenText, FileUp, GraduationCap, Plus, Send, Sparkles, Trash2 } from 'lucide-react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

export default function Home() {
  const store = useAssignmentStore();
  const router = useRouter();
  const [file, setFile] = React.useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    store.setStatus('pending');
    
    try {
      const formData = new FormData();
      formData.append('title', store.title);
      formData.append('subject', store.subject);
      formData.append('grade', store.grade);
      formData.append('dueDate', store.dueDate);
      formData.append('questionTypes', JSON.stringify(store.questionTypes));
      formData.append('additionalInstructions', store.additionalInstructions);
      if (file) {
        formData.append('file', file);
      }

      const response = await axios.post('http://localhost:5000/api/assignments', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      const { assignmentId } = response.data;
      store.setAssignmentId(assignmentId);
      router.push(`/processing/${assignmentId}`);
    } catch (error) {
      console.error('Error submitting form:', error);
      store.setStatus('failed');
    }
  };

  const totalQuestions = store.questionTypes.reduce((acc, qt) => acc + qt.count, 0);
  const totalMarks = store.questionTypes.reduce((acc, qt) => acc + (qt.count * qt.marks), 0);

  return (
    <main className="app-shell animate-fade">
      <aside className="app-sidebar" aria-label="VedaAI navigation">
        <div className="brand-mark">V</div>
        <nav className="nav-stack">
          <a className="nav-item active" href="#" aria-current="page">Create</a>
          <a className="nav-item" href="#">Drafts</a>
          <a className="nav-item" href="#">Library</a>
        </nav>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div>
            <p className="eyebrow">VedaAI assessment studio</p>
            <h1>Create New Assessment</h1>
          </div>
          <div className="status-pill">
            <Sparkles size={16} aria-hidden="true" />
            AI ready
          </div>
        </header>

        <div className="creator-grid">
          <form onSubmit={handleSubmit} className="form-stack">
            <section className="panel">
              <div className="section-heading">
                <div className="section-icon"><GraduationCap size={18} aria-hidden="true" /></div>
                <div>
                  <h2>Assessment details</h2>
                  <p>Set the context the generator should follow.</p>
                </div>
              </div>

              <div className="field-grid">
                <div className="field">
                  <label>Assignment Title</label>
                  <input 
                    type="text" 
                    className="input" 
                    placeholder="e.g. Mid-Term English Exam"
                    value={store.title}
                    onChange={(e) => store.setField('title', e.target.value)}
                    required
                  />
                </div>
                <div className="field">
                  <label>Subject</label>
                  <input 
                    type="text" 
                    className="input" 
                    placeholder="e.g. English Literature"
                    value={store.subject}
                    onChange={(e) => store.setField('subject', e.target.value)}
                    required
                  />
                </div>
                <div className="field">
                  <label>Class / Grade</label>
                  <input 
                    type="text" 
                    className="input" 
                    placeholder="e.g. 5th Grade"
                    value={store.grade}
                    onChange={(e) => store.setField('grade', e.target.value)}
                    required
                  />
                </div>
                <div className="field">
                  <label>Due Date</label>
                  <input 
                    type="date" 
                    className="input"
                    value={store.dueDate}
                    onChange={(e) => store.setField('dueDate', e.target.value)}
                    required
                  />
                </div>
              </div>
            </section>

            <section className="panel">
              <div className="section-heading">
                <div className="section-icon"><BookOpenText size={18} aria-hidden="true" /></div>
                <div>
                  <h2>Question configuration</h2>
                  <p>Balance sections, counts, and marks.</p>
                </div>
              </div>

              <div className="question-list">
                {store.questionTypes.map((qt, index) => (
                  <div key={index} className="question-row">
                    <div className="field question-type">
                      <label>Question Type</label>
                      <select 
                        className="input"
                        value={qt.type}
                        onChange={(e) => store.updateQuestionType(index, 'type', e.target.value)}
                      >
                        <option>Multiple Choice Questions</option>
                        <option>Short Answer Questions</option>
                        <option>Long Answer Questions</option>
                        <option>True/False</option>
                        <option>Fill in the blanks</option>
                      </select>
                    </div>
                    <div className="field compact-field">
                      <label>Count</label>
                      <input 
                        type="number" 
                        className="input"
                        value={qt.count}
                        onChange={(e) => store.updateQuestionType(index, 'count', parseInt(e.target.value) || 0)}
                        min="1"
                      />
                    </div>
                    <div className="field compact-field">
                      <label>Marks</label>
                      <input 
                        type="number" 
                        className="input"
                        value={qt.marks}
                        onChange={(e) => store.updateQuestionType(index, 'marks', parseInt(e.target.value) || 0)}
                        min="1"
                      />
                    </div>
                    <button 
                      type="button" 
                      className="icon-button danger"
                      onClick={() => store.removeQuestionType(index)}
                      disabled={index === 0}
                      aria-label="Remove question type"
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>
                ))}
              </div>
              
              <button 
                type="button" 
                className="secondary-action"
                onClick={store.addQuestionType}
              >
                <Plus size={18} /> Add Question Type
              </button>
            </section>

            <section className="panel upload-panel">
              <div className="field">
                <label>Reference Document</label>
                <div className="upload-zone">
                  <input 
                    type="file" 
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    accept=".pdf,.txt"
                    aria-label="Upload reference document"
                  />
                  <FileUp size={30} aria-hidden="true" />
                  <strong>{file ? file.name : "Choose a file or drag it here"}</strong>
                  <span>PDF or text document</span>
                </div>
              </div>
            </section>

            <section className="panel">
              <div className="field">
                <label>Additional Instructions</label>
                <textarea 
                  className="input text-area" 
                  placeholder="e.g. Focus on Chapter 5 grammar. Make questions challenging."
                  value={store.additionalInstructions}
                  onChange={(e) => store.setField('additionalInstructions', e.target.value)}
                />
              </div>
            </section>

            <div className="action-row">
              <button type="button" className="ghost-button">Previous</button>
              <button 
                type="submit" 
                className="primary-action"
                disabled={store.status === 'pending'}
              >
                {store.status === 'pending' ? 'Processing...' : (
                  <>Generate <Send size={18} /></>
                )}
              </button>
            </div>
          </form>

          <aside className="summary-panel">
            <p className="summary-label">Assessment summary</p>
            <div className="summary-card">
              <span>Total questions</span>
              <strong>{totalQuestions}</strong>
            </div>
            <div className="summary-card">
              <span>Total marks</span>
              <strong>{totalMarks}</strong>
            </div>
            <div className="summary-card muted">
              <span>Question sections</span>
              <strong>{store.questionTypes.length}</strong>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}

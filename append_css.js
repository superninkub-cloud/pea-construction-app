const fs = require('fs');
const css = `
/* Tabs Styles */
.safety-tabs {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  border-bottom: 2px solid #e2e8f0;
}

.tab-btn {
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  color: #64748b;
  background: transparent;
  border: none;
  border-bottom: 3px solid transparent;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: -2px;
}

.tab-btn:hover {
  color: #334155;
}

.tab-btn.active {
  color: #6366f1;
  border-bottom-color: #6366f1;
}

/* History Styles */
.history-container {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.history-month-section {
  background: white;
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

.history-month-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e2e8f0;
}

.history-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.history-card {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.history-card-img-wrapper {
  width: 100%;
  height: 200px;
  background: #e2e8f0;
  position: relative;
  overflow: hidden;
}

.history-card-img-wrapper img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.history-card-img-wrapper img:hover {
  transform: scale(1.05);
}

.history-card-content {
  padding: 1rem;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.history-card-date {
  font-size: 0.875rem;
  font-weight: 600;
  color: #6366f1;
  margin-bottom: 0.5rem;
}

.history-card-title {
  font-size: 1rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 0.25rem;
}

.history-card-info {
  font-size: 0.875rem;
  color: #64748b;
  margin-bottom: 1rem;
}

.history-card-actions {
  margin-top: auto;
  display: flex;
  gap: 0.5rem;
}

.history-card-actions button {
  flex: 1;
  padding: 0.5rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
}

.btn-view {
  background: white;
  color: #3b82f6;
  border: 1px solid #bfdbfe;
}
.btn-view:hover {
  background: #eff6ff;
}

.btn-copy-text {
  background: #f8fafc;
  color: #64748b;
  border: 1px solid #e2e8f0;
}
.btn-copy-text:hover {
  background: #f1f5f9;
  color: #334155;
}

/* Modal for viewing image */
.image-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(15, 23, 42, 0.8);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.image-modal-content {
  background: white;
  padding: 1rem;
  border-radius: 1rem;
  max-width: 90vw;
  max-height: 90vh;
  position: relative;
  display: flex;
  flex-direction: column;
}

.image-modal-close {
  position: absolute;
  top: -1rem;
  right: -1rem;
  background: white;
  color: #ef4444;
  border: 2px solid #ef4444;
  border-radius: 50%;
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-weight: bold;
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
}

.image-modal-img {
  max-width: 100%;
  max-height: calc(90vh - 2rem);
  object-fit: contain;
  border-radius: 0.5rem;
}
`;
fs.appendFileSync('app/safety-hub/SafetyHub.css', css, 'utf8');
console.log('CSS appended successfully');

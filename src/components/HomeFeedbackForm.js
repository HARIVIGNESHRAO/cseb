'use client';

import { useState } from 'react';
import styles from '@/app/page.module.css';

const initialForm = {
  rating: '',
  comments: '',
  name: '',
};

export default function HomeFeedbackForm() {
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    if (!form.rating || !form.comments.trim() || !form.name.trim()) {
      setStatus({
        type: 'error',
        message: 'Please fill rating, comments, and name.',
      });
      return;
    }

    setSubmitting(true);
    setStatus({ type: '', message: '' });

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rating: form.rating,
          comments: form.comments.trim(),
          name: form.name.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Unable to save feedback right now.');
      }

      setForm(initialForm);
      setStatus({
        type: 'success',
        message: 'Feedback submitted successfully.',
      });
    } catch (error) {
      setStatus({
        type: 'error',
        message: error.message || 'Unable to save feedback right now.',
      });
    } finally {
      setSubmitting(false);
    }
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  return (
    <section className={styles.feedbackSection}>
      <div className={styles.feedbackHeader}>
        <span className={styles.feedbackLabel}>FEEDBACK</span>
        <h2 className={styles.feedbackTitle}>Share your feedback</h2>
        <p className={styles.feedbackText}>
          Tell us how helpful the portal was for your studies.
        </p>
      </div>

      <form className={styles.feedbackForm} onSubmit={handleSubmit}>
        <label className={styles.feedbackField}>
          <span className={styles.feedbackFieldLabel}>Rating</span>
          <select
            className={styles.feedbackInput}
            name="rating"
            value={form.rating}
            onChange={handleChange}
            disabled={submitting}
          >
            <option value="" disabled>
              Select rating
            </option>
            <option value="5">5 - Excellent</option>
            <option value="4">4 - Good</option>
            <option value="3">3 - Average</option>
            <option value="2">2 - Poor</option>
            <option value="1">1 - Very Poor</option>
          </select>
        </label>

        <label className={styles.feedbackField}>
          <span className={styles.feedbackFieldLabel}>Comments</span>
          <textarea
            className={`${styles.feedbackInput} ${styles.feedbackTextarea}`}
            name="comments"
            value={form.comments}
            onChange={handleChange}
            placeholder="Write your comments"
            rows={5}
            disabled={submitting}
          />
        </label>

        <label className={styles.feedbackField}>
          <span className={styles.feedbackFieldLabel}>Name</span>
          <input
            type="text"
            className={styles.feedbackInput}
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Enter your name"
            disabled={submitting}
          />
        </label>

        {status.message ? (
          <p
            className={
              status.type === 'success'
                ? styles.feedbackSuccess
                : styles.feedbackError
            }
          >
            {status.message}
          </p>
        ) : null}

        <button
          type="submit"
          className={styles.feedbackButton}
          disabled={submitting}
        >
          {submitting ? 'Submitting...' : 'Submit Feedback'}
        </button>
      </form>
    </section>
  );
}

import React, { useCallback, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FiArrowLeft, FiStar } from 'react-icons/fi';
import Card from '../../../components/Card.jsx';
import Button from '../../../components/Button.jsx';
import { useToast } from '../../../App.jsx';
import { getMenu } from '../../../api/modules/menuApi.js';
import { createComment, getComments } from '../../../api/modules/feedbackApi.js';

const asList = (value) => (Array.isArray(value) ? value : []);

const commentMealId = (entry) => entry?.meal_id ?? entry?.meal ?? entry?.mealId ?? null;
const commentText = (entry) => entry?.comment ?? entry?.content ?? entry?.text ?? '';
const commentAuthor = (entry) =>
  entry?.user_name ?? entry?.username ?? entry?.student_name ?? entry?.author ?? 'Student';
const commentDate = (entry) => entry?.created_at ?? entry?.createdAt ?? entry?.date ?? null;

export default function CommentsPage() {
  const { setToast } = useToast();
  const [searchParams] = useSearchParams();
  const initialMealId = searchParams.get('mealId') ?? '';
  const initialMealName = searchParams.get('mealName') ?? '';

  const [menu, setMenu] = useState([]);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [mealId, setMealId] = useState(initialMealId);
  const [text, setText] = useState('');
  const [rating, setRating] = useState('');

  const loadData = useCallback(async (activeMealId) => {
    setLoading(true);
    try {
      const [menuData, commentsData] = await Promise.all([
        getMenu().catch(() => []),
        getComments({ mealId: activeMealId || undefined }),
      ]);
      setMenu(asList(menuData));
      setComments(asList(commentsData));
    } catch (err) {
      setToast(err?.message ?? 'Failed to load comments.', 'error');
      setComments([]);
    } finally {
      setLoading(false);
    }
  }, [setToast]);

  useEffect(() => {
    loadData(mealId);
  }, [mealId, loadData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const value = text.trim();
    if (!value) {
      setToast('Comment cannot be empty.', 'error');
      return;
    }
    if (!mealId) {
      setToast('Select a meal before submitting.', 'error');
      return;
    }
    if (!rating) {
      setToast('Select a rating before submitting.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      await createComment({ mealId, comment: value, rating: Number(rating) });
      setText('');
      setRating('');
      setToast('Feedback submitted successfully.', 'success');
      await loadData(mealId);
    } catch (err) {
      setToast(err?.message ?? 'Failed to submit feedback.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-edueats-bg pb-24">
      <header className="rounded-b-card bg-edueats-primary px-6 pt-10 pb-6">
        <div className="flex items-center gap-3">
          <Link
            to="/student/menu"
            className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-edueats-text"
          >
            <FiArrowLeft className="text-sm" />
          </Link>
          <h1 className="text-xl font-semibold text-edueats-text">Feedback</h1>
        </div>
      </header>

      <div className="px-4 py-4 space-y-4">
        <Card>
          <form onSubmit={handleSubmit} className="space-y-3">
            <label className="block">
              <span className="mb-1 block text-sm text-edueats-text">Meal</span>
              <select
                value={mealId}
                onChange={(e) => setMealId(e.target.value)}
                className="w-full rounded-full border border-edueats-border bg-white px-4 py-2.5 text-sm text-edueats-text focus:outline-none focus:ring-2 focus:ring-edueats-accent"
              >
                <option value="">{initialMealName ? `Choose meal (suggested: ${initialMealName})` : 'Choose meal'}</option>
                {menu.map((item) => (
                  <option key={item.id ?? item.meal_id} value={item.id ?? item.meal_id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block text-sm text-edueats-text">Comment</span>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={3}
                placeholder="Share your feedback..."
                className="w-full rounded-xl border border-edueats-border bg-white px-4 py-2.5 text-sm text-edueats-text placeholder:text-edueats-textMuted focus:outline-none focus:ring-2 focus:ring-edueats-accent"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm text-edueats-text">Rating</span>
              <select
                value={rating}
                onChange={(e) => setRating(e.target.value)}
                className="w-full rounded-full border border-edueats-border bg-white px-4 py-2.5 text-sm text-edueats-text focus:outline-none focus:ring-2 focus:ring-edueats-accent"
              >
                <option value="">Choose rating</option>
                {[5, 4, 3, 2, 1].map((value) => (
                  <option key={value} value={value}>
                    {`${value} ${'★'.repeat(value)}${'☆'.repeat(5 - value)}`}
                  </option>
                ))}
              </select>
            </label>
            <Button type="submit" fullWidth disabled={submitting}>
              <FiStar className="mr-2" />
              {submitting ? 'Submitting...' : 'Submit Feedback'}
            </Button>
          </form>
        </Card>

        <div className="space-y-2">
          <h2 className="text-sm font-semibold uppercase text-edueats-textMuted">Recent comments</h2>
          {loading ? (
            <Card>
              <p className="text-sm text-edueats-textMuted">Loading comments...</p>
            </Card>
          ) : comments.length === 0 ? (
            <Card>
              <p className="text-sm text-edueats-textMuted">No comments found.</p>
            </Card>
          ) : (
            comments.map((entry, index) => {
              const created = commentDate(entry);
              return (
                <Card key={entry?.id ?? entry?.comment_id ?? index}>
                  <p className="text-sm font-medium text-edueats-text">{commentAuthor(entry)}</p>
                  <p className="mt-1 text-sm text-edueats-text">{commentText(entry)}</p>
                  <div className="mt-2 flex items-center justify-between text-xs text-edueats-textMuted">
                    <span>
                      Meal ID: {commentMealId(entry) ?? '-'}
                    </span>
                    <span>{created ? new Date(created).toLocaleString() : ''}</span>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

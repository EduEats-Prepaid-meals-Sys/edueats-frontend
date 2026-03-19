import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getMenuItem, getMenu } from '../../../api/modules/menuApi.js';
import { useCart } from '../../../App.jsx';
import Card from '../../../components/Card.jsx';
import foodPlaceholder from '../../../assets/images/food-placeholder.svg';
import { FiArrowLeft, FiShoppingCart } from 'react-icons/fi';

export default function MealDetailsPage() {
  const { id } = useParams();
  const [meal, setMeal] = useState(null);
  const [similarMeals, setSimilarMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { addItem, count } = useCart();

  useEffect(() => {
    const fetchMealDetails = async () => {
      try {
        setLoading(true);
        const [mealData, allMenuData] = await Promise.all([
          getMenuItem(id),
          getMenu()
        ]);

        // Find similar meals (same meal type or category)
        const allMeals = Array.isArray(allMenuData) ? allMenuData : allMenuData?.results ?? [];
        const targetId = String(id);
        const dailyMatch = allMeals.find((m) =>
          String(m.daily_menu_id) === targetId || String(m.meal_id ?? m.id) === targetId
        );
        // Prefer daily-menu shape so availability and daily_menu_id stay accurate for ordering.
        setMeal(dailyMatch ? { ...mealData, ...dailyMatch } : mealData);

        const similar = allMeals.filter(m => 
          String(m.meal_id ?? m.id) !== targetId &&
          (m.meal_type === mealData.meal_type || m.mealType === mealData.mealType)
        ).slice(0, 4); // Limit to 4 similar meals
        
        setSimilarMeals(similar);
      } catch (err) {
        setError('Failed to load meal details');
        console.error('Error fetching meal details:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchMealDetails();
    }
  }, [id]);

  const handleAddToCart = () => {
    if (meal && meal.available !== false && meal.in_stock !== false) {
      addItem(meal, 1);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-edueats-bg">
        <div className="px-6 py-4">
          <p className="py-8 text-center text-sm text-edueats-textMuted">Loading...</p>
        </div>
      </div>
    );
  }

  if (error || !meal) {
    return (
      <div className="min-h-screen bg-edueats-bg">
        <div className="px-6 py-4">
          <p className="py-8 text-center text-sm text-edueats-danger">{error || 'Meal not found'}</p>
          <Link 
            to="/student/menu" 
            className="mt-4 flex items-center justify-center text-edueats-accent"
          >
            <FiArrowLeft className="mr-2" />
            Back to Menu
          </Link>
        </div>
      </div>
    );
  }

  const available = meal.available !== false && meal.in_stock !== false;

  return (
    <div className="min-h-screen bg-edueats-bg">
      {/* Header */}
      <header className="rounded-b-card bg-edueats-primary px-6 pt-10 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              to="/student/menu"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-edueats-surface text-edueats-text"
            >
              <FiArrowLeft className="text-sm" />
            </Link>
            <h1 className="text-xl font-semibold text-edueats-text truncate">{meal.name}</h1>
          </div>
          <Link
            to="/student/cart"
            className="relative flex h-10 w-10 items-center justify-center rounded-full bg-edueats-surface text-edueats-text"
          >
            <FiShoppingCart className="text-lg" />
            {count > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-edueats-danger text-xs font-semibold text-white">
                {count > 9 ? '9+' : count}
              </span>
            )}
          </Link>
        </div>
      </header>

      {/* Meal Details */}
      <div className="px-4 py-4">
        <Card className="overflow-hidden rounded-md">
          {/* Meal Image */}
          <div className="h-64 w-full overflow-hidden bg-edueats-border">
            <img
              src={meal.image_url || meal.imageUrl || foodPlaceholder}
              alt={meal.name}
              className="h-full w-full object-cover"
              onError={(e) => {
                e.currentTarget.src = foodPlaceholder;
              }}
            />
          </div>

          {/* Meal Information */}
          <div className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-edueats-text truncate">{meal.name}</h2>
                <p className="mt-1 text-sm text-edueats-textMuted capitalize">
                  {meal.meal_type || meal.mealType || 'Meal'}
                </p>
              </div>
              <div className="text-right">
                <p className="text-lg font-semibold text-edueats-text">Ksh {meal.price}</p>
                <span
                  className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                    available
                      ? 'bg-edueats-success/20 text-edueats-success'
                      : 'bg-edueats-danger/20 text-edueats-danger'
                  }`}
                >
                  {available ? 'Available' : 'Out of stock'}
                </span>
              </div>
            </div>

            {/* Description */}
            {meal.description && (
              <div className="mt-4">
                <h3 className="text-sm font-medium text-edueats-text">Description</h3>
                <p className="mt-1 text-sm text-edueats-textMuted leading-relaxed">
                  {meal.description}
                </p>
              </div>
            )}

            {/* Add to Cart Button */}
            <button
              type="button"
              disabled={!available}
              onClick={handleAddToCart}
              className={`mt-6 w-full rounded-full py-3 font-medium transition-colors ${
                available
                  ? 'bg-edueats-accent text-white hover:bg-edueats-accent/90'
                  : 'bg-edueats-border text-edueats-textMuted cursor-not-allowed'
              }`}
            >
              {available ? 'Add to Cart' : 'Out of Stock'}
            </button>
          </div>
        </Card>

        {/* Similar Meals Section */}
        {similarMeals.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-edueats-text">Similar Meals</h3>
            <div className="mt-3 space-y-3">
              {similarMeals.map((similarMeal) => {
                const similarAvailable = similarMeal.available !== false && similarMeal.in_stock !== false;
                return (
                  <Link
                    key={similarMeal.id}
                    to={`/student/menu/${similarMeal.id}`}
                    className="block"
                  >
                    <Card className="flex flex-row items-center gap-3 transition-shadow hover:shadow-md rounded-md">
                      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-edueats-border">
                        <img
                          src={similarMeal.image_url || similarMeal.imageUrl || foodPlaceholder}
                          alt=""
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = foodPlaceholder;
                          }}
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-edueats-text">{similarMeal.name}</p>
                        <p className="text-xs text-edueats-textMuted capitalize">
                          {similarMeal.meal_type || similarMeal.mealType || 'Meal'}
                        </p>
                        <p className="text-sm font-medium text-edueats-text">Ksh {similarMeal.price}</p>
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-1">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                            similarAvailable
                              ? 'bg-edueats-success/20 text-edueats-success'
                              : 'bg-edueats-danger/20 text-edueats-danger'
                          }`}
                        >
                          {similarAvailable ? 'Available' : 'Out of stock'}
                        </span>
                      </div>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

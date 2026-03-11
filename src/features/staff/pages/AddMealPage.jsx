import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createMenuItem } from '../../../api/modules/menuApi.js';
import { useToast } from '../../../App.jsx';
import Card from '../../../components/Card.jsx';
import Button from '../../../components/Button.jsx';
import { FiArrowLeft, FiCamera, FiUpload } from 'react-icons/fi';

export default function AddMealPage() {
  const navigate = useNavigate();
  const { setToast } = useToast();
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    meal_type: 'lunch',
    available: true,
    in_stock: true,
    description: ''
  });

  const mealTypes = [
    { value: 'breakfast', label: 'Breakfast' },
    { value: 'lunch', label: 'Lunch' },
    { value: 'dinner', label: 'Dinner' }
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setToast('Please select an image file', 'error');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setToast('Image size should be less than 5MB', 'error');
        return;
      }

      setSelectedFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setPreviewUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.price) {
      setToast('Please fill in all required fields', 'error');
      return;
    }

    const price = parseFloat(formData.price);
    if (isNaN(price) || price <= 0) {
      setToast('Please enter a valid price', 'error');
      return;
    }

    setLoading(true);
    try {
      const mealData = {
        name: formData.name.trim(),
        price: price,
        meal_type: formData.meal_type,
        available: formData.available,
        in_stock: formData.in_stock,
        description: formData.description.trim()
      };

      // For now, we'll create the meal without the image
      // In a real app, you'd upload the image to a storage service first
      await createMenuItem(mealData);
      
      if (selectedFile) {
        // TODO: Implement image upload to storage service
        // For now, just show a success message about the meal
        setToast('Meal added successfully! (Image upload coming soon)', 'success');
      } else {
        setToast('Meal added successfully!', 'success');
      }
      
      navigate('/staff/menu');
    } catch (err) {
      setToast(err?.message || 'Failed to add meal', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-edueats-bg">
      <header className="rounded-b-card bg-edueats-primary px-6 pt-10 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              to="/staff/menu"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-edueats-surface text-edueats-text"
            >
              <FiArrowLeft className="text-sm" />
            </Link>
            <h1 className="text-xl font-semibold text-edueats-text truncate">Add New Meal</h1>
          </div>
        </div>
      </header>

      <div className="px-6 py-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Meal Name */}
          <Card className="p-4">
            <label className="block">
              <span className="text-sm font-medium text-edueats-text mb-2 block">Meal Name *</span>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter meal name"
                className="w-full rounded-lg border border-edueats-border bg-white px-3 py-2 text-sm text-edueats-text placeholder:text-edueats-textMuted focus:outline-none focus:ring-2 focus:ring-edueats-accent"
                required
              />
            </label>
          </Card>

          {/* Price and Meal Type */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="p-4">
              <label className="block">
                <span className="text-sm font-medium text-edueats-text mb-2 block">Price (Ksh) *</span>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  className="w-full rounded-lg border border-edueats-border bg-white px-3 py-2 text-sm text-edueats-text placeholder:text-edueats-textMuted focus:outline-none focus:ring-2 focus:ring-edueats-accent"
                  required
                />
              </label>
            </Card>

            <Card className="p-4">
              <label className="block">
                <span className="text-sm font-medium text-edueats-text mb-2 block">Meal Type</span>
                <select
                  name="meal_type"
                  value={formData.meal_type}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-edueats-border bg-white px-3 py-2 text-sm text-edueats-text focus:outline-none focus:ring-2 focus:ring-edueats-accent"
                >
                  {mealTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </label>
            </Card>
          </div>

          {/* Description */}
          <Card className="p-4">
            <label className="block">
              <span className="text-sm font-medium text-edueats-text mb-2 block">Description</span>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Enter meal description (optional)"
                rows={3}
                className="w-full rounded-lg border border-edueats-border bg-white px-3 py-2 text-sm text-edueats-text placeholder:text-edueats-textMuted focus:outline-none focus:ring-2 focus:ring-edueats-accent resize-none"
              />
            </label>
          </Card>

          {/* Image Upload */}
          <Card className="p-4">
            <label className="block">
              <span className="text-sm font-medium text-edueats-text mb-2 block">Meal Image</span>
              
              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              
              {/* Upload area */}
              {!previewUrl ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-edueats-border rounded-lg p-6 text-center cursor-pointer hover:border-edueats-accent transition-colors"
                >
                  <FiUpload className="mx-auto text-2xl text-edueats-textMuted mb-2" />
                  <p className="text-sm text-edueats-text mb-1">Click to upload image</p>
                  <p className="text-xs text-edueats-textMuted">PNG, JPG, GIF up to 5MB</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Preview */}
                  <div className="relative">
                    <img
                      src={previewUrl}
                      alt="Meal preview"
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute top-2 right-2 h-6 w-6 rounded-full bg-edueats-danger text-white text-xs hover:bg-edueats-danger/90"
                    >
                      ×
                    </button>
                  </div>
                  
                  {/* File info */}
                  <div className="flex items-center justify-between text-xs text-edueats-textMuted">
                    <span>{selectedFile?.name}</span>
                    <span>{(selectedFile?.size / 1024 / 1024).toFixed(2)} MB</span>
                  </div>
                  
                  {/* Change button */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-2 text-sm text-edueats-accent hover:text-edueats-accent/90 font-medium"
                  >
                    Change Image
                  </button>
                </div>
              )}
            </label>
          </Card>

          {/* Availability */}
          <Card className="p-4">
            <span className="text-sm font-medium text-edueats-text mb-3 block">Availability</span>
            <div className="space-y-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="available"
                  checked={formData.available}
                  onChange={handleInputChange}
                  className="h-4 w-4 rounded border-edueats-border bg-edueats-surface text-edueats-accent focus:ring-edueats-accent"
                />
                <span className="text-sm text-edueats-text">Available for order</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="in_stock"
                  checked={formData.in_stock}
                  onChange={handleInputChange}
                  className="h-4 w-4 rounded border-edueats-border bg-edueats-surface text-edueats-accent focus:ring-edueats-accent"
                />
                <span className="text-sm text-edueats-text">In stock</span>
              </label>
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate('/staff/menu')}
              className="flex-1"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={loading}
            >
              {loading ? 'Adding...' : 'Add Meal'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

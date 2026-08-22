import React, { useState, useEffect } from 'react';
import { TripFormData } from '../../types/trip';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Calendar, Image, DollarSign, Edit } from 'lucide-react';

interface TripFormProps {
  initialData?: Partial<TripFormData>;
  onSubmit: (data: TripFormData) => Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
  isLoading?: boolean;
}

export const TripForm: React.FC<TripFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  submitLabel = 'Save Trip',
  isLoading = false
}) => {
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [description, setDescription] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [totalBudget, setTotalBudget] = useState<number>(50000);
  
  const [errors, setErrors] = useState<{
    name?: string;
    startDate?: string;
    endDate?: string;
    totalBudget?: string;
  }>({});

  // Sync initialData when it changes (for Edit Trip pre-population)
  useEffect(() => {
    if (initialData) {
      if (initialData.name !== undefined) setName(initialData.name);
      if (initialData.startDate !== undefined) setStartDate(initialData.startDate);
      if (initialData.endDate !== undefined) setEndDate(initialData.endDate);
      if (initialData.description !== undefined) setDescription(initialData.description);
      if (initialData.coverImage !== undefined) setCoverImage(initialData.coverImage);
      if (initialData.totalBudget !== undefined) setTotalBudget(initialData.totalBudget);
    }
  }, [initialData]);

  const validate = () => {
    const tempErrors: typeof errors = {};
    
    if (!name.trim()) {
      tempErrors.name = 'Trip name is required';
    }
    if (!startDate) {
      tempErrors.startDate = 'Start date is required';
    }
    if (!endDate) {
      tempErrors.endDate = 'End date is required';
    }
    if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
      tempErrors.endDate = 'End date must be on or after the start date';
    }
    if (totalBudget < 0) {
      tempErrors.totalBudget = 'Budget cannot be a negative amount';
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    await onSubmit({ name, startDate, endDate, description, coverImage, totalBudget });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 text-left" noValidate>
      
      {/* Trip Name */}
      <div className="relative">
        <Input
          label="Trip Name *"
          type="text"
          placeholder="e.g. Europe Adventure, Winter in Tokyo"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={errors.name}
          disabled={isLoading}
          className="pl-9"
          autoFocus
        />
        <Edit size={16} className="absolute left-3 bottom-3 text-slate-400 pointer-events-none" />
      </div>

      {/* Start and End Dates */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative">
          <Input
            label="Start Date *"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            error={errors.startDate}
            disabled={isLoading}
            className="pl-9"
          />
          <Calendar size={16} className="absolute left-3 bottom-3 text-slate-400 pointer-events-none" />
        </div>

        <div className="relative">
          <Input
            label="End Date *"
            type="date"
            value={endDate}
            min={startDate || undefined}
            onChange={(e) => setEndDate(e.target.value)}
            error={errors.endDate}
            disabled={isLoading}
            className="pl-9"
          />
          <Calendar size={16} className="absolute left-3 bottom-3 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {/* Budget & Cover Image */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative">
          <Input
            label="Planned Budget (₹)"
            type="number"
            min="0"
            placeholder="50000"
            value={totalBudget}
            onChange={(e) => setTotalBudget(Number(e.target.value))}
            error={errors.totalBudget}
            disabled={isLoading}
            className="pl-9"
          />
          <DollarSign size={16} className="absolute left-3 bottom-3 text-slate-400 pointer-events-none" />
        </div>

        <div className="relative">
          <Input
            label="Cover Image URL (Optional)"
            type="url"
            placeholder="https://images.unsplash.com/..."
            value={coverImage}
            onChange={(e) => setCoverImage(e.target.value)}
            disabled={isLoading}
            className="pl-9"
          />
          <Image size={16} className="absolute left-3 bottom-3 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {/* Description */}
      <Input
        label="Description / Notes (Optional)"
        isTextArea={true}
        placeholder="What are you planning? Key destinations, must-see spots, accommodation ideas..."
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        disabled={isLoading}
      />

      {/* Cover image preview (if valid URL entered) */}
      {coverImage && (
        <div className="rounded-xl overflow-hidden border border-slate-100 h-32 bg-slate-50">
          <img
            src={coverImage}
            alt="Cover preview"
            className="w-full h-full object-cover"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-3 mt-2 border-t border-slate-100 pt-4">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
            className="font-semibold"
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          isLoading={isLoading}
          disabled={isLoading}
          className="px-6 font-semibold"
        >
          {submitLabel}
        </Button>
      </div>

    </form>
  );
};

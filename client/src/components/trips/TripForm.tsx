import React, { useState, useEffect } from 'react';
import { TripFormData } from '../../types/trip';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Calendar, Image, DollarSign, Edit } from 'lucide-react';

interface TripFormProps {
  initialData?: Partial<TripFormData>;
  onSubmit: (data: TripFormData) => Promise<void>;
  submitLabel?: string;
  isLoading?: boolean;
}

export const TripForm: React.FC<TripFormProps> = ({
  initialData,
  onSubmit,
  submitLabel = 'Save Trip',
  isLoading = false
}) => {
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [description, setDescription] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [totalBudget, setTotalBudget] = useState<number>(50000);
  
  // Errors state
  const [errors, setErrors] = useState<{
    name?: string;
    startDate?: string;
    endDate?: string;
    totalBudget?: string;
  }>({});

  // Sync initialData if provided (e.g. for Edit Trip or Prefills)
  useEffect(() => {
    if (initialData) {
      if (initialData.name) setName(initialData.name);
      if (initialData.startDate) setStartDate(initialData.startDate);
      if (initialData.endDate) setEndDate(initialData.endDate);
      if (initialData.description) setDescription(initialData.description);
      if (initialData.coverImage) setCoverImage(initialData.coverImage);
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
    
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (end < start) {
        tempErrors.endDate = 'End date cannot be earlier than start date';
      }
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

    const formData: TripFormData = {
      name,
      startDate,
      endDate,
      description,
      coverImage,
      totalBudget
    };
    
    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 text-left">
      
      {/* Trip Name */}
      <div className="relative">
        <Input
          label="Trip Name"
          type="text"
          placeholder="e.g. Europe Adventure, Winter in Tokyo"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={errors.name}
          disabled={isLoading}
          className="pl-9"
          required
        />
        <Edit size={16} className="absolute left-3 bottom-3 text-slate-400" />
      </div>

      {/* Start and End Dates */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative">
          <Input
            label="Start Date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            error={errors.startDate}
            disabled={isLoading}
            className="pl-9"
            required
          />
          <Calendar size={16} className="absolute left-3 bottom-3 text-slate-400" />
        </div>

        <div className="relative">
          <Input
            label="End Date"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            error={errors.endDate}
            disabled={isLoading}
            className="pl-9"
            required
          />
          <Calendar size={16} className="absolute left-3 bottom-3 text-slate-400" />
        </div>
      </div>

      {/* Target Budget & Cover Image */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative">
          <Input
            label="Planned Budget (INR)"
            type="number"
            placeholder="50000"
            value={totalBudget}
            onChange={(e) => setTotalBudget(Number(e.target.value))}
            error={errors.totalBudget}
            disabled={isLoading}
            className="pl-9"
          />
          <DollarSign size={16} className="absolute left-3 bottom-3 text-slate-400" />
        </div>

        <div className="relative">
          <Input
            label="Cover Image URL (Optional)"
            type="url"
            placeholder="https://images.unsplash.com/... (Image Link)"
            value={coverImage}
            onChange={(e) => setCoverImage(e.target.value)}
            disabled={isLoading}
            className="pl-9"
          />
          <Image size={16} className="absolute left-3 bottom-3 text-slate-400" />
        </div>
      </div>

      {/* Description */}
      <Input
        label="Trip Description / Notes"
        isTextArea={true}
        placeholder="Brief summary of what you plan to do, places to visit, etc."
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        disabled={isLoading}
      />

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-3 mt-2 border-t border-slate-100 pt-4">
        <Button
          type="submit"
          isLoading={isLoading}
          className="px-6 font-semibold"
        >
          {submitLabel}
        </Button>
      </div>

    </form>
  );
};

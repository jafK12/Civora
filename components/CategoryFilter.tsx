'use client';

import React from 'react';
import { ServiceCategory } from '@/lib/types';
import { SERVICE_CATEGORIES } from '@/lib/data/mockData';
import { useTranslation } from '@/context/LanguageContext';
import { FileText, Building2, Landmark, Layers } from 'lucide-react';

interface CategoryFilterProps {
  selectedCategory: ServiceCategory;
  onSelectCategory: (category: ServiceCategory) => void;
  filteredCount: number;
}

const CATEGORY_ICONS: Record<ServiceCategory, React.ElementType> = {
  'All Services': Layers,
  'ID & Civil Registration': FileText,
  'Business & Licensing': Building2,
  'Land & Property': Landmark,
};

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  selectedCategory,
  onSelectCategory,
  filteredCount,
}) => {
  const { t } = useTranslation();

  const getCategoryLabel = (cat: ServiceCategory) => {
    switch (cat) {
      case 'All Services':
        return t.categories.allServices;
      case 'ID & Civil Registration':
        return t.categories.idCivilRegistration;
      case 'Business & Licensing':
        return t.categories.businessLicensing;
      case 'Land & Property':
        return t.categories.landProperty;
      default:
        return cat;
    }
  };

  return (
    <div className="bg-[#0F2A2E] border-b border-[#24545C]/40 px-4 sm:px-6 py-2.5">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-2.5">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {SERVICE_CATEGORIES.map((category) => {
            const Icon = CATEGORY_ICONS[category];
            const isSelected = selectedCategory === category;
            return (
              <button
                key={category}
                id={`category-filter-${category.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                onClick={() => onSelectCategory(category)}
                className={`whitespace-nowrap flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors border ${
                  isSelected
                    ? 'bg-[#C97A2B] text-white border-[#C97A2B] shadow-sm'
                    : 'bg-[#153B41] text-[#A6BFBB] border-[#24545C]/60 hover:bg-[#1B4A52] hover:text-white'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-[#C97A2B]'}`} />
                <span>{getCategoryLabel(category)}</span>
              </button>
            );
          })}
        </div>

        {/* Counter and hint */}
        <div className="text-xs text-[#8DA3A0] flex items-center justify-between md:justify-end gap-2">
          <span>
            {t.categories.showing} <strong className="text-white">{filteredCount}</strong> {t.categories.officesOffering}{' '}
            <span className="text-[#F3E4D2] font-medium">
              {getCategoryLabel(selectedCategory)}
            </span>
          </span>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import Navbar from '../../Components/Navbar/Navbar';
import ProductCard from './ProductCard';
import { products } from './types';
import { Clock, Grid3X3, List } from 'lucide-react';
import './shop.css';

const categories = ['all', 'clothing', 'accessories', 'stationery'];

const Shop = () => {
  const [viewMode, setViewMode] = useState('grid');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [animateIn, setAnimateIn] = useState(false);

  useEffect(() => {
    
    setTimeout(() => setAnimateIn(true), 10); // 
  }, []);

  const filteredProducts =
    selectedCategory === 'all'
      ? products
      : products.filter(product => product.category === selectedCategory);

  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 shop-fade-wrap${animateIn ? ' shop-fade-in' : ''}`}>
      <Navbar />
      <section className="shop-hero mt-6 mb-10 mx-auto">
        <span className="shop-badge">
          <Clock size={20} style={{ marginRight: 8 }} />
          Shop Opening Soon
        </span>
        <h2 className="shop-hero-title">ChemBuzz Merchandise</h2>
        <div className="shop-hero-desc">
          Limited-edition citywear, cozy hoodies, and iconic Chemnitz items.<br />
          <b>All products are preview only.</b>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="shop-controls">
          <div className="shop-categories">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`shop-category-btn${selectedCategory === category ? ' selected' : ''}`}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>
          <div>
            <button
              onClick={() => setViewMode('grid')}
              className={`shop-view-btn${viewMode === 'grid' ? ' active' : ''}`}
              aria-label="Grid view"
            >
              <Grid3X3 size={18} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`shop-view-btn${viewMode === 'list' ? ' active' : ''}`}
              aria-label="List view"
            >
              <List size={18} />
            </button>
          </div>
        </div>
        {/* 3x2 grid */}
        <div className="shop-grid">
          {filteredProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </main>
    </div>
  );
};

export default Shop;

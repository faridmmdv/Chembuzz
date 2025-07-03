import React from 'react';
import { Clock, Star } from 'lucide-react';

const colorMap = {
  white: 'bg-white border-gray-300',
  black: 'bg-black',
  gray: 'bg-gray-400',
  navy: 'bg-blue-900',
  red: 'bg-red-500',
  burgundy: 'bg-red-800',
  forest: 'bg-green-800',
  natural: 'bg-amber-100',
  olive: 'bg-green-600',
  kraft: 'bg-amber-200'
};

const ProductCard = ({ product }) => {
  return (
    <div className="shop-product-card">
      <div className="shop-card-image-wrap">
        <img
          src={product.image}
          alt={product.name}
          className="shop-card-image"
        />
        <div className="shop-card-comingsoon">
          <Clock size={15} style={{ marginRight: 6 }} />
          Coming Soon
        </div>
      </div>
      <div className="shop-card-content">
        <div className="shop-card-category">{product.category}</div>
        <div className="shop-card-title">{product.name}</div>
        <div className="shop-card-stars">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              size={17}
              style={{ verticalAlign: '-2px' }}
              className={i < Math.floor(product.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}
            />
          ))}
        </div>
        <div className="shop-card-price">€{product.price}</div>
        <div className="shop-card-variants">
          {product.colors.map(color => (
            <span
              key={color}
              className={`shop-card-color-dot ${colorMap[color]}`}
              title={color}
              style={{ border: '2px solid #e2ecf3' }}
            ></span>
          ))}
        </div>
        <div className="shop-card-sizes">
          {product.sizes.map(size => (
            <span key={size} className="shop-card-size">{size}</span>
          ))}
        </div>
        <button className="shop-card-btn" disabled>
          <Clock size={18} />
          Available Soon
        </button>
      </div>
    </div>
  );
};

export default ProductCard;

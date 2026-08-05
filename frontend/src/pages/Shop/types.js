// src/pages/Shop/types.js
import tshirt from '../../assets/t-shirt.jpg';
import hoodie from '../../assets/hoodie.jpg';
import hat from '../../assets/hat.jpg';
import bag from '../../assets/bag.jpg';
import polo from '../../assets/polo.jpg';
import blank from '../../assets/blank.jpg';

export const products = [
  {
    id: 1,
    name: "Premium Cotton T-Shirt",
    price: 25.99,
    image: tshirt,
    category: "clothing",
    rating: 4.5,
    colors: ["white", "black", "gray", "navy"],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"]
  },
  {
    id: 2,
    name: "Cozy Winter Hoodie",
    price: 55.99,
    image: hoodie,
    category: "clothing",
    rating: 4.8,
    colors: ["black", "gray", "burgundy", "forest"],
    sizes: ["S", "M", "L", "XL", "XXL"]
  },
  {
    id: 3,
    name: "Classic Baseball Cap",
    price: 12.95,
    image: hat,
    category: "accessories",
    rating: 4.3,
    colors: ["black", "white", "navy", "red"],
    sizes: ["One Size"]
  },
  {
    id: 4,
    name: "Cool cup!",
    price: 5.00,
    image: bag,
    category: "accessories",
    rating: 4.6,
    colors: ["natural", "black", "navy", "olive"],
    sizes: ["One Size"]
  },
  {
    id: 5,
    name: "Business Polo Shirt",
    price: 39.95,
    image: polo,
    category: "clothing",
    rating: 4.4,
    colors: ["white", "black", "navy", "burgundy"],
    sizes: ["S", "M", "L", "XL", "XXL"]
  },
  {
    id: 6,
    name: "Minimalist Blank Notebook",
    price: 4.49,
    image: blank,
    category: "stationery",
    rating: 4.7,
    colors: ["white", "black", "kraft", "gray"],
    sizes: ["A5", "A4"]
  }
];

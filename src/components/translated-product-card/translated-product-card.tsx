'use client';

import Image from 'next/image';
import { useI18n } from 'src/contexts/i18n-context';
import type { Product } from 'src/types/database.types';

interface TranslatedProductCardProps {
  product: Product;
  onClick?: (product: Product) => void;
  className?: string;
}

export default function TranslatedProductCard({ 
  product, 
  onClick, 
  className = '' 
}: TranslatedProductCardProps) {
  const { translateProduct, t } = useI18n();
  
  // Translate product using current locale
  const translatedProduct = translateProduct(product);
  
  const handleClick = () => {
    onClick?.(translatedProduct);
  };

  const isOrganic = product.bio || product.is_organic;
  const isOutOfStock = product.stock_quantity <= 0;

  return (
    <div 
      className={`bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer ${className}`}
      onClick={handleClick}
    >
      {/* Product Image */}
      <div className="relative h-48 w-full bg-gray-100">
        <Image
          src={translatedProduct.image_url || translatedProduct.featured_image || '/placeholder-product.jpg'}
          alt={translatedProduct.name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        
        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {isOrganic && (
            <span className="bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded-full">
              {t('products.organic')}
            </span>
          )}
          
          {product.featured && (
            <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded-full">
              {t('products.featured')}
            </span>
          )}
        </div>
        
        {/* Out of stock overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center">
            <span className="text-white font-semibold text-lg">
              {t('products.outOfStock')}
            </span>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4">
        {/* Product Name */}
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
          {translatedProduct.name}
        </h3>
        
        {/* Short Description */}
        {translatedProduct.shortDescription && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {translatedProduct.shortDescription}
          </p>
        )}
        
        {/* Producer Info */}
        {translatedProduct.producer && (
          <div className="flex items-center text-sm text-gray-500 mb-3">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="truncate">{translatedProduct.producer.name}</span>
          </div>
        )}
        
        {/* Price and Add to Cart */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xl font-bold text-gray-900">
              {translatedProduct.price.toLocaleString()} Ft
            </span>
            {translatedProduct.unit && (
              <span className="text-sm text-gray-500">
                / {translatedProduct.unit}
              </span>
            )}
          </div>
          
          <button
            disabled={isOutOfStock}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
              isOutOfStock
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-green-600 text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2'
            }`}
            onClick={(e) => {
              e.stopPropagation();
              if (!isOutOfStock) {
                // Handle add to cart logic here
                console.log('Add to cart:', translatedProduct);
              }
            }}
          >
            {isOutOfStock ? t('products.outOfStock') : t('products.addToCart')}
          </button>
        </div>
        
        {/* Stock indicator */}
        {!isOutOfStock && product.stock_quantity < 10 && (
          <div className="mt-3 text-xs text-amber-600">
            ⚠️ {t('products.stock')}: {product.stock_quantity}
          </div>
        )}
      </div>
    </div>
  );
}

/* Example usage in a product list:

'use client';

import { useEffect, useState } from 'react';
import { getProductsWithTranslations } from 'src/actions/translations';
import { useI18n } from 'src/contexts/i18n-context';
import TranslatedProductCard from './translated-product-card';
import type { Product } from 'src/types/database.types';

export default function ProductGrid() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useI18n();

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const fetchedProducts = await getProductsWithTranslations();
        setProducts(fetchedProducts);
      } catch (error) {
        console.error('Failed to load products:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        <span className="ml-2">{t('common.loading')}</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        {t('products.title')}
      </h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <TranslatedProductCard
            key={product.id}
            product={product}
            onClick={(translatedProduct) => {
              console.log('Product clicked:', translatedProduct);
              // Navigate to product detail page
            }}
          />
        ))}
      </div>
      
      {products.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">{t('products.noProducts')}</p>
        </div>
      )}
    </div>
  );
}

*/
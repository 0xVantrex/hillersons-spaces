import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Award, Bed, Bath, Square, Building, Star, Zap, X, Phone, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';


const QuickViewModal = ({ product, onClose, isFavorite, onToggleFavorite }) => {
  const navigate = useNavigate();
  
  const handleQuickBuy = (e) => {
    onClose();
    navigate(`/quick-buy/${product.id}`);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-green-50 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center rounded-t-3xl">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            Quick Preview
          </h2>
          <div className="flex items-center gap-3">
            <button
              onClick={onToggleFavorite}
              className={`p-3 rounded-full transition-all duration-300 ${
                isFavorite 
                  ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                  : 'bg-gray-100 text-gray-600 hover:bg-red-100 hover:text-red-600'
              }`}
            >
              <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-3 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Image Section */}
            <div className="space-y-4">
              <div className="h-80 bg-gradient-to-br from-green-100 to-lime-100 rounded-2xl overflow-hidden relative">
                <img
                  src={product.finalImageURLs?.[0] || ''}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  {product.featured && (
                    <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
                      <Award className="w-3 h-3" />
                      FEATURED
                    </div>
                  )}
                  {product.newListing && (
                    <div className="bg-gradient-to-r from-lime-400 to-emerald-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                      NEW
                    </div>
                  )}
                </div>
              </div>

              {/* Additional Images */}
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-20 bg-gray-100 rounded-lg overflow-hidden">
                    <img
                      src={product.finalImageURLs?.[i] || ''}
                      alt={`View ${i + 1}`}
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-300 cursor-pointer"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Details Section */}
            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">
                  {product.title || "Premium House Plan"}
                </h3>
                <p className="text-gray-600 mb-4">Designed by {product.architect}</p>
                
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="font-semibold">{product.rating}</span>
                    <span className="text-gray-600 text-sm">(125 reviews)</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {product.views} views • {product.saved} saved
                  </div>
                </div>

                <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
                  {product.price ? `KES ${product.price.toLocaleString()}` : "Contact for Price"}
                </div>
                <p className="text-gray-600">Delivery: {product.completionTime}</p>
              </div>

              {/* Features Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 rounded-xl p-4 text-center">
                  <Bed className="w-6 h-6 text-green-600 mx-auto mb-2" />
                  <span className="text-lg font-bold text-gray-800 block">{product.rooms || "-"}</span>
                  <span className="text-sm text-gray-600">Bedrooms</span>
                </div>
                <div className="bg-lime-50 rounded-xl p-4 text-center">
                  <Bath className="w-6 h-6 text-lime-600 mx-auto mb-2" />
                  <span className="text-lg font-bold text-gray-800 block">{Math.ceil((product.rooms || 0) * 0.75)}</span>
                  <span className="text-sm text-gray-600">Bathrooms</span>
                </div>
                <div className="bg-emerald-50 rounded-xl p-4 text-center">
                  <Building className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
                  <span className="text-lg font-bold text-gray-800 block">{product.floorCount || "-"}</span>
                  <span className="text-sm text-gray-600">Floors</span>
                </div>
                <div className="bg-teal-50 rounded-xl p-4 text-center">
                  <Square className="w-6 h-6 text-teal-600 mx-auto mb-2" />
                  <span className="text-lg font-bold text-gray-800 block">{product.area ? `${product.area.toFixed(0)}` : "-"}</span>
                  <span className="text-sm text-gray-600">sqm</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Link
                  to={`/product/${product.id}`}
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-6 rounded-xl font-semibold text-center hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                >
                  View Full Details
                </Link>
                <button
                  onClick={handleQuickBuy}
                  className="bg-lime-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-lime-700 transition-colors flex items-center gap-2"
                >
                  <Zap className="w-4 h-4" />
                  Quick Buy
                </button>
              </div>

              {/* Contact Info */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4">
                <h4 className="font-semibold text-gray-800 mb-2">Need Help?</h4>
                <div className="space-y-2 text-sm">
                  <a href="tel:+254763831806" className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-green-600" />
                    Call Us
                  </a>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-green-600" />
                    <span>HillersonsCompany@gmail.com</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickViewModal;
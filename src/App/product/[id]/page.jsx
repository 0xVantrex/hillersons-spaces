//src/App/product/[id]/page.jsx
"use client";
import { useEffect, useState } from "react";
import {useAuthState } from "react-firebase-hooks/auth";
import {auth} from "@/firebase";
import { hasUserPurchasedProduct, submitReview } from "../../../lib/firebase/reviews";
import { getReviewsForProduct } from "@/lib/firebase/reviewQueries";

export default function ProductPage({ params }) {
    const productId = params.id;
    const [user] = useAuthState(auth);
    const [comment,setComment]= (useState);
    const [rating, setRating] = useState("");
    const [product, setProduct] = useState(null);
    const [reviews,setReviews] = useState([]);
    const [hasPurchased,setHasPurchased] = useState(false);


useEffect (() => {
    const fetchProductandReviews = async () => {
        const res = await fetch (`/api/products/${productId}`);
        const data = await res.json();
        setProduct(data);
        const allReviews = await getReviewsForProduct(productId);
        setReviews(allReviews);
    };
    const checkPurchase = async () => {
        if (user) {
            const result = await hasUserPurchasedProduct(user.uid, productId);
            setHasPurchased(result);
        }
    };

    fetchProductandReviews();
    if (user) checkPurchase();
    }, [user, productId]);

    const  handleReviewSubmit = async (e) => {
        e.preventDefault();
        await submitReview({
            userId: user.uid,
            productId,
            rating,
            comment,
            displayName: user.displayName || "Anonymous",
        });
        setComment("");
        setRating("");
        const all= await getReviewsForProduct(productId)
        setReviews(all);
    };

    if (!product) return <p>Loading...</p>;

    return (
         <div className="max-w-4x1 mx-auto p-6">
         <h1 className="text-3x1 font-bold mb-2">{product.name}</h1>
         <p className="text-lg mb-4">KES {product.price.toLocaleString()}</p>
         {/* other product details */}

         <div className="mt-10">
             <h2 className="text-2x1 font-semibold mb-4">Reviews</h2>
            
             {user ? (hasPurchased ? (
                <form onSubmit={handleReviewSubmit} className="space-y-3 mb-6">
                    <textarea
                        value={comment}
                        onChange={(e)=> setComment(e.target.value)}
                        placeholder="Write your review..."
                        className="w-full p-2 border rounded"
                        required
                        />
                        <select 
                            value={rating}
                            onChange={(e) => setRating(Number(e.target.value))}
                            className="border p-2 border rounded"
                            required
                            >
                                <option value="">Rating(1-5)</option>
                                {[1, 2, 3, 4, 5].map((num) => (
                                    <option key={num} value={num}>
                                        {num} Star{num > 1 ? "s" : ""}
                                    </option>
                                ))}
                            </select>
                            <button type="submit" className="bg-black text-white px-4 py-2 rounded">
                                Submit Review
                            </button>
                </form>
                ) : (
                    <p className="text-sm text-gray-600 mb-4">
                        You must purchase this product to leave a review
                    </p>
                )
            ) : (
                    <p className="text-sm text-gray-600 mb-4">
                        Please log in to leave a review.
                    </p>
                )}

                <div className="space-y-4">
                    {reviews.length === 0 ? (
                        <p className="text-gray-500">No reviews yet.</p>
                    ) : (
                        reviews.map((r) => (
                            <div key={r.id} className="border -b pb-2">
                                <p className="font-semibold">
                                    {r.displayName || "Anonymous"} • {r.rating}★
                            </p> 
                            <p>{r.comment}</p>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
       );
   }
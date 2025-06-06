import { useState } from "react";
import { Star } from "lucide-react";
import { Button } from "@components/ti/button";

export default function ProjectDisplay({ project }) {
    const [mainImage, setmainImage] = useState(project.images[0]);

    const planImage = project.images.find(img => img.isPlan);
    const otherImages = project.images.filter(img => !img.isPlan);

    return(
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-4">
            {/* Image Gallery */}
            <div>
                <div className="flex flex-col space-y-2">
                    {project.images.map((img, idx) => (
                        <img
                            key={idx}
                            src={img.url}
                            alt="thumbnail"
                            className="w-24 h-24 object-cover rounded-md border cursor-pointer"
                            onMouseEnter={() => {
                                if (!img.isPlan) setmainImage(img);

                            }}
                            />
                    ))}
                </div>
                <div className="relative mt-4">
                    <img
                        src={mainImage.url}
                        alt="Main project view"
                        className="rounded-x1 shadow-lg w-full h-auto object-cover"
                        />
                </div>
            </div>

            {/* Project Info */}
            <div className="space-y-6">
                <h2 className="text-3x1 font-bold">{project.title}</h2>
                <p className="text-gray-700">{project.description}</p>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-center">
          <div>
            <div className="font-semibold text-lg">{project.floors}</div>
            <div className="text-sm text-gray-500">Floors</div>
          </div>
          <div>
            <div className="font-semibold text-lg">{project.bedrooms}</div>
            <div className="text-sm text-gray-500">Bedrooms</div>
          </div>
          <div>
            <div className="font-semibold text-lg">{project.bathrooms}</div>
            <div className="text-sm text-gray-500">Bathrooms</div>
          </div>
          <div>
            <div className="font-semibold text-lg">{project.length} m</div>
            <div className="text-sm text-gray-500">Length</div>
          </div>
          <div>
            <div className="font-semibold text-lg">{project.width} m</div>
            <div className="text-sm text-gray-500">Width</div>
          </div>
          <div>
            <div className="font-semibold text-lg">{project.area} m²</div>
            <div className="text-sm text-gray-500">Area</div>
          </div>
        </div>

        {/* File Type Selection */}
        <div>
          <h4 className="font-medium mb-1">File Type</h4>
          <div className="flex gap-4">
            <label className="flex items-center gap-1">
              <input type="radio" name="filetype" defaultChecked /> CAD + PDF
            </label>
            <label className="flex items-center gap-1">
              <input type="radio" name="filetype" /> PDF
            </label>
          </div>
        </div>

        {/* Drawing Sets */}
        <div>
          <h4 className="font-medium mb-1">Drawing Sets</h4>
          <div className="flex flex-col gap-1">
            <label className="flex items-center gap-1">
              <input type="checkbox" defaultChecked /> Architectural Drawings
            </label>
            <label className="flex items-center gap-1">
              <input type="checkbox" /> Structural Drawings
            </label>
          </div>
        </div>

        {/* Price & Buy */}
        <div className="flex items-center justify-between bg-orange-50 p-4 rounded-xl">
          <div>
            <p className="text-lg font-semibold">${project.price}</p>
          </div>
          <Button className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-full">
            Buy Now
          </Button>
        </div>

        {/* Rating & Reviews */}
        <div className="mt-4">
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} size={18} className={i < project.rating ? 'text-yellow-400' : 'text-gray-300'} />
            ))}
            <span className="ml-2 text-sm text-gray-600">({project.reviews.length} reviews)</span>
          </div>
          <ul className="mt-2 space-y-2">
            {project.reviews.slice(0, 3).map((review, idx) => (
              <li key={idx} className="text-sm text-gray-700">“{review.text}”</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
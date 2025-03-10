import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Card,
  CardBody,
  Typography,
  Button,
  Chip,
  Avatar,
} from "@material-tailwind/react";

const ViewPackage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pkg, setPackage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [packageImages, setPackageImages] = useState([]);

  useEffect(() => {
    const fetchPackage = async () => {
      try {
        const response = await axios.get(
          `http://localhost:9090/api/v1/package/read/${id}`
        );
        const data = response.data.data;
        console.log("CONSOLE: ", data);
        setPackage(data);

        const imagesArray = data.packageImageDetails
          .map((imageDetail) =>
            imageDetail.imageData
              ? `data:image/${imageDetail.mimType};base64,${imageDetail.imageData}`
              : null
          )
          .filter((image) => image !== null);

        setPackageImages(imagesArray);
      } catch (error) {
        console.error("Error fetching package:", error);
        setError("Failed to fetch package details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchPackage();
  }, [id]);

  if (loading) {
    return <Typography className="text-center mt-10">Loading...</Typography>;
  }

  if (error) {
    return (
      <Typography className="text-center mt-10 text-red-500">{error}</Typography>
    );
  }

  if (!pkg) {
    return (
      <Typography className="text-center mt-10">No package found.</Typography>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto font-roboto">
  {/* Back Button */}
  <Button
    variant="outlined"
    onClick={() => navigate(-1)}
    className="mb-6 text-sm px-4 py-2 rounded-lg border-gray-600 hover:border-black hover:bg-gray-900 hover:text-white transition-all"
  >
    Back
  </Button>

  {/* Package Details */}
  <div className="mb-8">
    <Typography
      variant="h3"
      className="text-3xl font-extrabold text-gray-900 tracking-tight"
    >
      {pkg.name}
    </Typography>
    <Typography
      variant="h4"
      className="text-sm font-medium text-gray-700 ray-900"
    >
      Rs. {pkg.price}
    </Typography>
    <Typography
      variant="paragraph"
      className="mt-3 text-gray-600 text-sm leading-relaxed tracking-wider font-medium"
    >
      {pkg.description}
    </Typography>
  </div>

  {/* Photos Section */}
  {packageImages.length > 0 && (
    <div className="mb-10">
      <Typography
        variant="h5"
        className="font-bold text-lg uppercase text-gray-800 border-b-2 border-gray-300 pb-1"
      >
        Photos
      </Typography>
      <div className="flex overflow-x-auto gap-4 pb-4 mt-3">
        {packageImages.map((imageSrc, index) => (
          <img
            key={index}
            src={imageSrc}
            alt={`Package Image ${index}`}
            className="w-60 h-40 object-cover rounded-xl shadow-md hover:shadow-lg transition-transform duration-300 transform hover:scale-105"
          />
        ))}
      </div>
    </div>
  )}

  {/* Itinerary Section */}
  {pkg.itineraryDetails && (
    <div className="mb-10">
      <Typography
        variant="h5"
        className="font-bold text-lg uppercase text-gray-800 border-b-2 border-gray-300 pb-1"
      >
        Itinerary
      </Typography>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
        {pkg.itineraryDetails.map((itinerary, index) => (
          <Card
          key={index}
          className="p-6 bg-white text-black border border-black rounded-2xl shadow-md transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
        >
          <Typography
            variant="h5"
            className="font-bold text-lg text-gray-900 mb-2"
          >
            {itinerary.heading}
          </Typography>
          <Typography variant="small" className="text-black">
            <strong>Start Date:</strong> {itinerary.startDate}
          </Typography>
          <Typography variant="small" className="text-black">
            <strong>End Date:</strong> {itinerary.endDate}
          </Typography>
          <Typography variant="small" className="text-gray-900 mt-3 leading-relaxed">
            {itinerary.description}
          </Typography>
        </Card>        
        ))}
      </div>
    </div>
  )}

  {/* Highlights Section */}
  {pkg.highlights?.length > 0 && (
    <div className="mb-10">
      <Typography
        variant="h5"
        className="font-bold text-lg uppercase text-gray-800 border-b-2 border-gray-300 pb-1"
      >
        Highlights
      </Typography>
      <ul className="list-disc pl-5 space-y-2 mt-3 text-sm text-gray-700">
        {pkg.highlights.map((highlight, index) => (
          <li key={index} className="leading-relaxed">{highlight}</li>
        ))}
      </ul>
    </div>
  )}
</div>
  );
};

export default ViewPackage;
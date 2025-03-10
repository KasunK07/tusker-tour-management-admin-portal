import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AddPackage = () => {
  const navigate = useNavigate();
  const { packageId } = useParams();
  const isEditMode = !!packageId;

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    highlights: [""],
    itineraryDetails: [{ heading: "", startDate: "", endDate: "", description: "" }],
  });
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [removedImageIds, setRemovedImageIds] = useState([]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isEditMode) {
      const fetchPackage = async () => {
        try {
          const response = await axios.get(`http://localhost:9090/api/v1/package/read/${packageId}`, {
            withCredentials: true, 
          });
          const pkg = response.data.data;
          setFormData({
            name: pkg.name,
            description: pkg.description,
            price: pkg.price.toString(),
            highlights: pkg.highlights || [""],
            itineraryDetails: pkg.itineraryDetails || [{ heading: "", startDate: "", endDate: "", description: "" }],
          });

          const existingImageDetails = pkg.packageImageDetails.map((img) => ({
            id: img.id,
            imageName: img.imageName,
            preview: `data:image/${img.mimeType};base64,${img.imageData}`,
          }));
          setExistingImages(existingImageDetails);
          setImagePreviews(existingImageDetails.map((img) => img.preview));
        } catch (error) {
          console.error("Error fetching package:", error);
          if (error.response?.status === 401) {
            toast.error("Session expired. Please log in again.");
            navigate("/auth/sign-in");
          }
        }
      };
      fetchPackage();
    }
  }, [packageId, isEditMode, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: "" });
  };

  const handleItineraryChange = (index, e) => {
    const { name, value } = e.target;
    const newItinerary = [...formData.itineraryDetails];
    newItinerary[index][name] = value;
    setFormData({ ...formData, itineraryDetails: newItinerary });
    setErrors({ ...errors, [`itineraryDetails[${index}].${name}`]: "" }); 
  };

  const addItinerary = () => {
    setFormData({
      ...formData,
      itineraryDetails: [...formData.itineraryDetails, { heading: "", startDate: "", endDate: "", description: "" }],
    });
  };

  const removeItinerary = (index) => {
    const newItinerary = formData.itineraryDetails.filter((_, i) => i !== index);
    setFormData({ ...formData, itineraryDetails: newItinerary });
  };

  const handleImageChange = (e) => {
    const files = e.target.files;
    if (files) {
      const validFiles = Array.from(files).filter(
        (file) => file.type === "image/jpeg" || file.type === "image/png"
      );
      const totalImages = existingImages.length + imageFiles.length + validFiles.length;
      if (totalImages > 3) {
        setErrors({ ...errors, images: "You can upload a maximum of 3 images." });
        return;
      }
      if (validFiles.length > 0) {
        const newImageFiles = [...imageFiles, ...validFiles];
        setImageFiles(newImageFiles);
        const newImagePreviews = validFiles.map((file) => URL.createObjectURL(file));
        setImagePreviews([...imagePreviews, ...newImagePreviews]);
        setErrors({ ...errors, images: "" });
      } else {
        setErrors({ ...errors, images: "Only JPG and PNG files are allowed." });
      }
    }
  };

  const removeImage = async (imageName) => {
    if (isEditMode) {
      const removedImage = existingImages.find((img) => img.imageName === imageName);
      if (removedImage) {
        try {
          await axios.delete(`http://localhost:9090/api/v1/package/delete/image/${encodeURIComponent(imageName)}`, {
            withCredentials: true,
          });
          console.log(`Image ${imageName} deleted successfully.`);
          const newExistingImages = existingImages.filter((img) => img.imageName !== imageName);
          const newImagePreviews = imagePreviews.filter((_, i) => {
            const existingIndex = existingImages.findIndex((img) => img.preview === imagePreviews[i]);
            return existingIndex === -1 || existingImages[existingIndex].imageName !== imageName;
          });
          setExistingImages(newExistingImages);
          setImagePreviews(newImagePreviews);
          setRemovedImageIds((prev) => [...prev, removedImage.id]);
          validateImages(newExistingImages.length + imageFiles.length); 
        } catch (error) {
          console.error("Error deleting image:", error);
        }
      }
    } else {
      const fileIndex = imageFiles.findIndex((file) => file.name === imageName);
      if (fileIndex !== -1) {
        const newImageFiles = imageFiles.filter((_, i) => i !== fileIndex);
        const newImagePreviews = imagePreviews.filter((_, i) => i !== fileIndex + existingImages.length);
        setImageFiles(newImageFiles);
        setImagePreviews(newImagePreviews);
        validateImages(existingImages.length + newImageFiles.length); 
      }
    }
  };

  const addHighlight = () => {
    setFormData({ ...formData, highlights: [...formData.highlights, ""] });
  };

  const removeHighlight = (index) => {
    const newHighlights = formData.highlights.filter((_, i) => i !== index);
    setFormData({ ...formData, highlights: newHighlights });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name) newErrors.name = "Package name is required.";
    if (!formData.description) newErrors.description = "Description is required.";
    if (!formData.price || isNaN(parseFloat(formData.price))) newErrors.price = "Valid price is required.";

    formData.itineraryDetails.forEach((itinerary, index) => {
      if (!itinerary.heading) newErrors[`itineraryDetails[${index}].heading`] = "Heading is required.";
      if (!itinerary.startDate) newErrors[`itineraryDetails[${index}].startDate`] = "Start date is required.";
      if (!itinerary.endDate) newErrors[`itineraryDetails[${index}].endDate`] = "End date is required.";
      if (!itinerary.description) newErrors[`itineraryDetails[${index}].description`] = "Description is required.";
    });

    validateImages(existingImages.length + imageFiles.length, newErrors);

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateImages = (totalImages, errorsObj = errors) => {
    if (totalImages < 3) {
      errorsObj.images = "You must upload at least 3 images.";
    } else if (totalImages > 3) {
      errorsObj.images = "You can upload a maximum of 3 images.";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const payload = {
      ...formData,
      price: parseFloat(formData.price),
    };
    const formDataToSend = new FormData();
    formDataToSend.append("package", new Blob([JSON.stringify(payload)], { type: "application/json" }));

    if (imageFiles.length > 0) {
      imageFiles.forEach((file) => formDataToSend.append("images", file));
    }

    try {
      if (isEditMode) {
        const response = await axios.put(
          `http://localhost:9090/api/v1/package/update/${packageId}`,
          formDataToSend,
          { headers: { "Content-Type": "multipart/form-data" }, withCredentials: true }
        );
        console.log("Update response:", response);
        toast.success("Package updated successfully!");
      } else {
        const response = await axios.post(
          "http://localhost:9090/api/v1/package/save",
          formDataToSend,
          { headers: { "Content-Type": "multipart/form-data" }, withCredentials: true }
        );
        console.log("Create response:", response);
        toast.success("Package created successfully!");
      }
      navigate("/dashboard/managePackages");
    } catch (error) {
      console.error(`Error ${isEditMode ? "updating" : "saving"} package:`, error);
      if (error.response?.status === 401) {
        toast.error("Session expired. Redirecting to login...");
        setTimeout(() => navigate("/auth/sign-in"), 2000); 
      } else {
        toast.error("Unknown error occurred.");
      }
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <ToastContainer />
      {/* Header Section */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {isEditMode ? "Edit Package" : "Add New Package"}
        </h1>
        <button
          className="bg-white text-black border border-black flex items-center gap-2 shadow-none hover:shadow-md px-4 py-2 rounded-md transition-all hover:bg-gray-50"
          onClick={() => navigate(-1)}
        >
          Back
        </button>
      </div>

      {/* Form Section */}
      <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200">
        <form onSubmit={handleSubmit}>
          {/* Package Name, Description, and Price */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Package Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-2 border-gray-200 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all p-2"
                required
              />
              {errors.name && <p className="text-red-600 text-xs mt-1">{errors.name}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="mt-1 block w-full rounded-md border-2 border-gray-200 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all p-2"
                required
              />
              {errors.description && <p className="text-red-600 text-xs mt-1">{errors.description}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-2 border-gray-200 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all p-2"
                required
              />
              {errors.price && <p className="text-red-600 text-xs mt-1">{errors.price}</p>}
            </div>
          </div>

          {/* Itinerary Section */}
          <div className="mt-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Itinerary</h2>
            {formData.itineraryDetails.map((itinerary, index) => (
              <div key={index} className="mb-6 border-b border-gray-200 pb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                    <input
                      type="text"
                      name="startDate"
                      value={itinerary.startDate}
                      onChange={(e) => handleItineraryChange(index, e)}
                      className="mt-1 block w-full rounded-md border-2 border-gray-200 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all p-2"
                      required
                    />
                    {errors[`itineraryDetails[${index}].startDate`] && (
                      <p className="text-red-600 text-xs mt-1">{errors[`itineraryDetails[${index}].startDate`]}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                    <input
                      type="text"
                      name="endDate"
                      value={itinerary.endDate}
                      onChange={(e) => handleItineraryChange(index, e)}
                      className="mt-1 block w-full rounded-md border-2 border-gray-200 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all p-2"
                      required
                    />
                    {errors[`itineraryDetails[${index}].endDate`] && (
                      <p className="text-red-600 text-xs mt-1">{errors[`itineraryDetails[${index}].endDate`]}</p>
                    )}
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Itinerary Heading</label>
                  <input
                    type="text"
                    name="heading"
                    value={itinerary.heading}
                    onChange={(e) => handleItineraryChange(index, e)}
                    className="mt-1 block w-full rounded-md border-2 border-gray-200 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all p-2"
                    required
                  />
                  {errors[`itineraryDetails[${index}].heading`] && (
                    <p className="text-red-600 text-xs mt-1">{errors[`itineraryDetails[${index}].heading`]}</p>
                  )}
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    name="description"
                    value={itinerary.description}
                    onChange={(e) => handleItineraryChange(index, e)}
                    rows={2}
                    className="mt-1 block w-full rounded-md border-2 border-gray-200 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all p-2"
                    required
                  />
                  {errors[`itineraryDetails[${index}].description`] && (
                    <p className="text-red-600 text-xs mt-1">{errors[`itineraryDetails[${index}].description`]}</p>
                  )}
                </div>
                {index > 0 && (
                  <button
                    type="button"
                    onClick={() => removeItinerary(index)}
                    className="mt-4 flex items-center text-sm text-red-600 hover:text-red-800"
                  >
                    <TrashIcon className="h-4 w-4 mr-1" /> Remove Itinerary
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addItinerary}
              className="mt-4 flex items-center text-sm text-blue-600 hover:text-blue-800"
            >
              <PlusIcon className="h-4 w-4 mr-1" /> Add Itinerary
            </button>
          </div>

          {/* Image Upload Section */}
          <div className="mt-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Upload Images (Min 3, Max 3)</h2>
            <input
              type="file"
              id="image-upload"
              onChange={handleImageChange}
              accept=".jpg,.jpeg,.png"
              className="hidden"
              multiple
            />
            <label
              htmlFor="image-upload"
              className="inline-block px-4 py-2 bg-black text-white rounded-md cursor-pointer hover:bg-gray-800 transition-all"
            >
              Choose Images
            </label>
            {errors.images && <p className="text-red-600 text-xs mt-2">{errors.images}</p>}
            {imagePreviews.length > 0 && (
              <div className="mt-4 grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {imagePreviews.map((preview, index) => {
                  const existingImage = existingImages.find((img) => img.preview === preview);
                  const imageName = existingImage ? existingImage.imageName : imageFiles[index - existingImages.length]?.name;
                  return (
                    <div key={index} className="relative">
                      <img
                        src={preview}
                        alt={`Preview ${index}`}
                        className="w-full h-24 object-cover rounded-lg shadow-md"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(imageName)}
                        className="absolute top-1 right-1 p-1 bg-white rounded-full shadow-md hover:bg-gray-100"
                      >
                        <TrashIcon className="h-4 w-4 text-red-600" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Highlights Section */}
          <div className="mt-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Highlights</h2>
            {formData.highlights.map((highlight, index) => (
              <div key={index} className="flex items-center gap-2 mb-2">
                <input
                  type="text"
                  value={highlight}
                  onChange={(e) => {
                    const newHighlights = [...formData.highlights];
                    newHighlights[index] = e.target.value;
                    setFormData({ ...formData, highlights: newHighlights });
                  }}
                  className="flex-1 block w-full rounded-md border-2 border-gray-200 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all p-2"
                />
                {index > 0 && (
                  <button
                    type="button"
                    onClick={() => removeHighlight(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addHighlight}
              className="mt-2 flex items-center text-sm text-blue-600 hover:text-blue-800"
            >
              <PlusIcon className="h-4 w-4 mr-1" /> Add Highlight
            </button>
          </div>

          {/* Submit Button */}
          <div className="mt-8">
            <button
              type="submit"
              className="w-70 px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-all"
            >
              {isEditMode ? "Save Changes" : "Add Package"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPackage;
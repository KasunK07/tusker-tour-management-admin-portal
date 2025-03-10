import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Typography,
  Card,
  CardHeader,
  CardBody,
  Button,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Input,
} from "@material-tailwind/react";
import { ChevronLeftIcon, ChevronRightIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/solid";
import { useAuth } from "../auth/useAuth"; // Assuming this is the correct import path

export function FetchDayTours() {
  const [dayToursData, setDayToursData] = useState([]);
  const [destinationsData, setDestinationsData] = useState([]);
  const [dayTourImages, setDayTourImages] = useState([]);
  const [destinationImages, setDestinationImages] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editImagePreview, setEditImagePreview] = useState("");
  const [editNewImage, setEditNewImage] = useState(null);
  const [editExistingImage, setEditExistingImage] = useState(null);
  const [openAddModal, setOpenAddModal] = useState(false);
  const [addType, setAddType] = useState("");
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newImage, setNewImage] = useState(null);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [dayToursPage, setDayToursPage] = useState(1);
  const [destinationsPage, setDestinationsPage] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [deleteItem, setDeleteItem] = useState(null);
  const cardsPerPage = 4;

  const { data: user } = useAuth(); 
  const isViewer = user?.roles?.includes("VIEWER") && !user?.roles?.includes("ADMIN"); 

  useEffect(() => {
    console.log("User Role:", user?.roles);
    const fetchDayTours = async () => {
      try {
        const response = await axios.get("http://localhost:9090/api/v1/dayTours/getAll");
        const dayToursData = response.data?.data || [];
        setDayToursData(dayToursData);
        const dayTourImages = dayToursData.map((tour) =>
          tour.imageDetails && tour.imageDetails.length > 0
            ? `data:image/${tour.imageDetails[0].mimType};base64,${tour.imageDetails[0].imageData}`
            : "https://via.placeholder.com/150"
        );
        setDayTourImages(dayTourImages);
      } catch (error) {
        console.error("Error fetching day tours:", error);
        setDayToursData([]);
        setDayTourImages([]);
      }
    };

    const fetchDestinations = async () => {
      try {
        const response = await axios.get("http://localhost:9090/api/v1/destinations/getAll");
        const destinationsData = response.data?.data || [];
        setDestinationsData(destinationsData);
        const destinationImages = destinationsData.map((destination) =>
          destination.imageDetails && destination.imageDetails.length > 0
            ? `data:image/${destination.imageDetails[0].mimType};base64,${destination.imageDetails[0].imageData}`
            : "https://via.placeholder.com/150"
        );
        setDestinationImages(destinationImages);
      } catch (error) {
        console.error("Error fetching destinations:", error);
        setDestinationsData([]);
        setDestinationImages([]);
      }
    };

    fetchDayTours();
    fetchDestinations();
  }, [user]);

  const handleOpenModal = async (item) => {
    setSelectedItem(item);
    setEditName(item.name);
    setEditDescription(item.description);
    setEditImagePreview(item.image);

    try {
      const endpoint =
        item.type === "dayTour"
          ? `http://localhost:9090/api/v1/dayTours/read/${item.id}`
          : `http://localhost:9090/api/v1/destinations/read/${item.id}`;
      const response = await axios.get(endpoint);
      const data = response.data?.data;
      setEditName(data.name);
      setEditDescription(data.description);
      if (data.imageDetails && data.imageDetails.length > 0) {
        const imageDetail = data.imageDetails[0];
        setEditExistingImage({
          imageName: imageDetail.imageName,
          preview: `data:image/${imageDetail.mimType};base64,${imageDetail.imageData}`,
        });
        setEditImagePreview(`data:image/${imageDetail.mimType};base64,${imageDetail.imageData}`);
      } else {
        setEditExistingImage(null);
        setEditImagePreview("https://via.placeholder.com/150");
      }
    } catch (error) {
      console.error(`Error fetching ${item.type} details:`, error);
    }
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedItem(null);
    setEditName("");
    setEditDescription("");
    setEditImagePreview("");
    setEditNewImage(null);
    setEditExistingImage(null);
  };

  const handleSave = async () => {
    if (!selectedItem) return;
    setIsSaving(true);

    try {
      const payload = { name: editName, description: editDescription };
      const formData = new FormData();
      formData.append(selectedItem.type === "dayTour" ? "tour" : "destination", new Blob([JSON.stringify(payload)], { type: "application/json" }));
      if (editNewImage) formData.append("images", editNewImage);

      const endpoint =
        selectedItem.type === "dayTour"
          ? `http://localhost:9090/api/v1/dayTours/update/${selectedItem.id}`
          : `http://localhost:9090/api/v1/destinations/update/${selectedItem.id}`;

      await axios.put(endpoint, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const response = await axios.get(
        selectedItem.type === "dayTour"
          ? "http://localhost:9090/api/v1/dayTours/getAll"
          : "http://localhost:9090/api/v1/destinations/getAll"
      );
      if (selectedItem.type === "dayTour") {
        setDayToursData(response.data?.data || []);
        setDayTourImages(
          response.data?.data.map((tour) =>
            tour.imageDetails && tour.imageDetails.length > 0
              ? `data:image/${tour.imageDetails[0].mimType};base64,${tour.imageDetails[0].imageData}`
              : "https://via.placeholder.com/150"
          )
        );
      } else {
        setDestinationsData(response.data?.data || []);
        setDestinationImages(
          response.data?.data.map((destination) =>
            destination.imageDetails && destination.imageDetails.length > 0
              ? `data:image/${destination.imageDetails[0].mimType};base64,${destination.imageDetails[0].imageData}`
              : "https://via.placeholder.com/150"
          )
        );
      }
    } catch (error) {
      console.error("Error updating item:", error);
    } finally {
      setIsSaving(false);
      handleCloseModal();
    }
  };

  const removeEditImage = async () => {
    if (!editExistingImage || !selectedItem) return;

    try {
      const endpoint =
        selectedItem.type === "dayTour"
          ? `http://localhost:9090/api/v1/dayTours/delete/image/${encodeURIComponent(editExistingImage.imageName)}`
          : `http://localhost:9090/api/v1/destinations/delete/image/${encodeURIComponent(editExistingImage.imageName)}`;
      await axios.delete(endpoint);
      console.log(`Image ${editExistingImage.imageName} deleted successfully`);
      setEditExistingImage(null);
      setEditImagePreview("");
      setEditNewImage(null);
    } catch (error) {
      console.error("Error deleting image:", error);
    }
  };

  const handleEditImageChange = (e) => {
    const file = e.target.files[0];
    if (file && (file.type === "image/jpeg" || file.type === "image/png")) {
      setEditNewImage(file);
      setEditImagePreview(URL.createObjectURL(file));
    } else {
      alert("Only JPG and PNG files are allowed.");
    }
  };

  const handleOpenAddModal = (type) => {
    setAddType(type);
    setOpenAddModal(true);
  };

  const handleCloseAddModal = () => {
    setOpenAddModal(false);
    setNewName("");
    setNewDescription("");
    setNewImage(null);
    setImagePreviews([]);
  };

  const handleAddSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const payload = { name: newName, description: newDescription };
      const formData = new FormData();
      const jsonBlob = new Blob([JSON.stringify(payload)], { type: "application/json" });
      formData.append(addType === "dayTour" ? "tour" : "destination", jsonBlob);
      if (newImage) formData.append("images", newImage);

      const endpoint =
        addType === "dayTour"
          ? "http://localhost:9090/api/v1/dayTours/save"
          : "http://localhost:9090/api/v1/destinations/save";

      await axios.post(endpoint, formData);

      const response = await axios.get(
        addType === "dayTour"
          ? "http://localhost:9090/api/v1/dayTours/getAll"
          : "http://localhost:9090/api/v1/destinations/getAll"
      );
      if (addType === "dayTour") {
        setDayToursData(response.data?.data || []);
        const dayTourImages = response.data?.data.map((tour) =>
          tour.imageDetails && tour.imageDetails.length > 0
            ? `data:image/${tour.imageDetails[0].mimType};base64,${tour.imageDetails[0].imageData}`
            : "https://via.placeholder.com/150"
        );
        setDayTourImages(dayTourImages);
      } else {
        setDestinationsData(response.data?.data || []);
        const destinationImages = response.data?.data.map((destination) =>
          destination.imageDetails && destination.imageDetails.length > 0
            ? `data:image/${destination.imageDetails[0].mimType};base64,${destination.imageDetails[0].imageData}`
            : "https://via.placeholder.com/150"
        );
        setDestinationImages(destinationImages);
      }
    } catch (error) {
      console.error("Error adding item:", error);
    } finally {
      setIsSaving(false);
      handleCloseAddModal();
    }
  };

  const getPaginatedData = (data, page, images) => {
    const startIndex = (page - 1) * cardsPerPage;
    const endIndex = startIndex + cardsPerPage;
    const paginatedData = data.slice(startIndex, endIndex);
    const paginatedImages = images.slice(startIndex, endIndex);
    return paginatedData.map((item, index) => ({
      ...item,
      image: paginatedImages[index],
    }));
  };

  const handlePageChange = (type, direction) => {
    if (type === "dayTour") {
      setDayToursPage((prev) =>
        direction === "next" ? prev + 1 : Math.max(prev - 1, 1)
      );
    } else {
      setDestinationsPage((prev) =>
        direction === "next" ? prev + 1 : Math.max(prev - 1, 1)
      );
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewImage(file);
      setImagePreviews([URL.createObjectURL(file)]);
    }
  };

  const removeImage = () => {
    setNewImage(null);
    setImagePreviews([]);
  };

  const handleDelete = async (id, type) => {
    try {
      const endpoint =
        type === "dayTours"
          ? `http://localhost:9090/api/v1/dayTours/delete/${id}`
          : `http://localhost:9090/api/v1/destinations/delete/${id}`;
      await axios.delete(endpoint);
      if (type === "dayTours") {
        setDayToursData((prev) => prev.filter((item) => item.id !== id));
        setDayTourImages((prev) => prev.filter((_, index) => dayToursData[index]?.id !== id));
      } else {
        setDestinationsData((prev) => prev.filter((item) => item.id !== id));
        setDestinationImages((prev) => prev.filter((_, index) => destinationsData[index]?.id !== id));
      }
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  return (
    <div className="my-4 flex max-w-screen-xl flex-col gap-8">
      {/* Day Tours Section */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <Typography variant="h5" color="black">
            Day Tours
          </Typography>
          <Button
            className="bg-white text-black border border-black flex items-center gap-2 shadow-none hover:shadow-md"
            onClick={() => handleOpenAddModal("dayTour")}
            disabled={isViewer} // Disable Add Day Tour button for VIEWER
          >
            <PlusIcon className="h-5 w-5" /> Add Day Tour
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {getPaginatedData(dayToursData, dayToursPage, dayTourImages).map((item) => (
            <Card
              key={item.id}
              className="relative grid h-[12rem] w-full max-w-[16rem] items-end justify-center overflow-hidden text-center cursor-pointer shadow-md hover:scale-105 hover:shadow-lg transition-all duration-300"
              onClick={() => handleOpenModal({ ...item, type: "dayTour" })}
            >
              <CardHeader
                floated={false}
                shadow={false}
                color="transparent"
                className="absolute inset-0 m-0 h-full w-full rounded-none bg-cover bg-center"
                style={{ backgroundImage: `url(${item.image})` }}
              >
                <div className="to-bg-black-10 absolute inset-0 h-full w-full bg-gradient-to-t from-black/80 via-black/50" />
              </CardHeader>
              <CardBody className="relative py-10 px-4 md:px-6">
                <Typography
                  variant="h5"
                  color="white"
                  className="mb-4 font-bold leading-[1.5]"
                >
                  {item.name}
                </Typography>
              </CardBody>
              <button
                className="absolute bottom-2 right-2 p-1 bg-white rounded-full shadow-md hover:bg-gray-100"
                onClick={(e) => {
                  e.stopPropagation();
                  setDeleteItem({ id: item.id, type: "dayTours" });
                  setOpenDeleteModal(true);
                 
                }}
                disabled={isViewer}
              >
                <TrashIcon className="h-4 w-4 text-red-600" />
              </button>
            </Card>
          ))}
        </div>
        <div className="flex justify-between items-center mt-6">
          <Button
            variant="text"
            disabled={dayToursPage === 1}
            onClick={() => handlePageChange("dayTour", "prev")}
          >
            <ChevronLeftIcon className="h-5 w-5" />
          </Button>
          <Button
            variant="text"
            disabled={dayToursPage * cardsPerPage >= dayToursData.length}
            onClick={() => handlePageChange("dayTour", "next")}
          >
            <ChevronRightIcon className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Destinations Section */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <Typography variant="h5" color="black">
            Destinations
          </Typography>
          <Button
            className="bg-white text-black border border-black flex items-center gap-2 shadow-none hover:shadow-md"
            onClick={() => handleOpenAddModal("destination")}
            disabled={isViewer} // Disable Add Destination button for VIEWER
          >
            <PlusIcon className="h-5 w-5" /> Add Destination
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {getPaginatedData(destinationsData, destinationsPage, destinationImages).map((item) => (
            <Card
              key={item.id}
              className="relative grid h-[12rem] w-full max-w-[16rem] items-end justify-center overflow-hidden text-center cursor-pointer shadow-md hover:scale-105 hover:shadow-lg transition-all duration-300"
              onClick={() => handleOpenModal({ ...item, type: "destination" })}
            >
              <CardHeader
                floated={false}
                shadow={false}
                color="transparent"
                className="absolute inset-0 m-0 h-full w-full rounded-none bg-cover bg-center"
                style={{ backgroundImage: `url(${item.image})` }}
              >
                <div className="to-bg-black-10 absolute inset-0 h-full w-full bg-gradient-to-t from-black/80 via-black/50" />
              </CardHeader>
              <CardBody className="relative py-10 px-4 md:px-6">
                <Typography
                  variant="h5"
                  color="white"
                  className="mb-4 font-bold leading-[1.5]"
                >
                  {item.name}
                </Typography>
              </CardBody>
              <button
                className="absolute bottom-2 right-2 p-1 bg-white rounded-full shadow-md hover:bg-gray-100"
                onClick={(e) => {
                  e.stopPropagation();
                  setDeleteItem({ id: item.id, type: "destinations" });
                  setOpenDeleteModal(true);
    
                }}
                disabled={isViewer}
              >
                <TrashIcon className="h-4 w-4 text-red-600" />
              </button>
            </Card>
          ))}
        </div>
        <div className="flex justify-between items-center mt-6">
          <Button
            variant="text"
            disabled={destinationsPage === 1}
            onClick={() => handlePageChange("destination", "prev")}
          >
            <ChevronLeftIcon className="h-5 w-5" />
          </Button>
          <Button
            variant="text"
            disabled={destinationsPage * cardsPerPage >= destinationsData.length}
            onClick={() => handlePageChange("destination", "next")}
          >
            <ChevronRightIcon className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Edit Modal */}
      <Dialog open={openModal} handler={handleCloseModal}>
        <DialogHeader>Edit {selectedItem?.name}</DialogHeader>
        <DialogBody>
          <div className="grid gap-6">
            {editImagePreview ? (
              <div className="relative">
                <img
                  src={editImagePreview}
                  alt={selectedItem?.name}
                  className="w-full h-40 object-cover mb-4 rounded-lg"
                />
                {editExistingImage && (
                  <button
                    type="button"
                    onClick={removeEditImage}
                    className="absolute top-1 right-1 p-1 bg-white rounded-full shadow-md hover:bg-gray-100"
                    disabled={isViewer}
                  >
                    <TrashIcon className="h-4 w-4 text-red-600" />
                  </button>
                )}
              </div>
            ) : (
              <div className="mt-4">
                <input
                  type="file"
                  id="edit-image-upload"
                  onChange={handleEditImageChange}
                  accept=".jpg,.jpeg,.png"
                  className="hidden"
                />
                <label
                  htmlFor="edit-image-upload"
                  className="inline-block px-4 py-2 bg-black text-white rounded-md cursor-pointer hover:bg-gray-800 transition-all"
                >
                  Choose Image
                </label>
              </div>
            )}
            <Input
              label="Name"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
            />
            <Input
              label="Description"
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
            />
          </div>
        </DialogBody>
        <DialogFooter>
          <Button variant="text" color="black" onClick={handleCloseModal} className="mr-1">
            Cancel
          </Button>
          <Button
            variant="gradient"
            color="black"
            onClick={handleSave}
            disabled={isSaving || isViewer}
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </Dialog>

      {/* Add Modal */}
      <Dialog open={openAddModal} handler={handleCloseAddModal}>
        <DialogHeader>Add {addType === "dayTour" ? "Day Tour" : "Destination"}</DialogHeader>
        <DialogBody>
          <div className="grid gap-6">
            <Input
              label="Name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
            <Input
              label="Description"
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
            />
            <div className="mt-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Upload Images</h2>
              <input
                type="file"
                id="image-upload"
                onChange={handleImageChange}
                accept=".jpg,.jpeg,.png"
                className="hidden"
              />
              <label
                htmlFor="image-upload"
                className="inline-block px-4 py-2 bg-black text-white rounded-md cursor-pointer hover:bg-gray-800 transition-all"
              >
                Choose Image
              </label>
              {imagePreviews.length > 0 && (
                <div className="mt-4 grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative">
                      <img
                        src={preview}
                        alt={`Preview ${index}`}
                        className="w-full h-24 object-cover rounded-lg shadow-md"
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute top-1 right-1 p-1 bg-white rounded-full shadow-md hover:bg-gray-100"
                      >
                        <TrashIcon className="h-4 w-4 text-red-600" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </DialogBody>
        <DialogFooter>
          <Button
            variant="text"
            color="black"
            onClick={handleCloseAddModal}
            className="mr-1"
          >
            Cancel
          </Button>
          <Button
            variant="gradient"
            color="black"
            onClick={handleAddSave}
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={openDeleteModal} handler={() => setOpenDeleteModal(false)} size="sm">
        <DialogHeader>Confirm Delete</DialogHeader>
        <DialogBody className="text-center">
          Are you sure you want to delete this{" "}
          {deleteItem?.type === "dayTours" ? "Day Tour" : "Destination"}?
        </DialogBody>
        <DialogFooter className="flex justify-center gap-4">
          <Button variant="text" color="black" onClick={() => setOpenDeleteModal(false)}>
            Cancel
          </Button>
          <Button
            variant="gradient"
            color="red"
            onClick={() => {
              handleDelete(deleteItem.id, deleteItem.type);
              setOpenDeleteModal(false);
            }}
          >
            Delete
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}

export default FetchDayTours;
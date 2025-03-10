import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Button,
  IconButton,
  Switch,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
} from "@material-tailwind/react";
import { TrashIcon, PencilIcon, PlusIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import { useLocation } from "react-router-dom";

export function ManagePackages() {
  const [packages, setPackages] = useState([]);
  const [packageImages, setPackageImages] = useState([]);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [packageToDelete, setPackageToDelete] = useState(null);
  const navigate = useNavigate();
  const { data: user } = useAuth();

  const location = useLocation();

  const isViewer = user?.roles?.includes("VIEWER") && !user?.roles?.includes("ADMIN");

  useEffect(() => {
    console.log("ManagePackages: useEffect");
    const fetchPackages = async () => {
      console.log("Fetching packages...")
      try {
        const response = await axios.get("http://localhost:9090/api/v1/package/read-all");
        const packagesData = response.data?.data || [];
        setPackages(packagesData);

        const imagesArray = packagesData.map((pkg) =>
          pkg.packageImageDetails
            ? pkg.packageImageDetails.map((imageDetail) =>
                imageDetail.imageData
                  ? `data:image/${imageDetail.mimeType};base64,${imageDetail.imageData}`
                  : null
              ).filter((image) => image !== null)
            : []
        );
        setPackageImages(imagesArray);
      } catch (error) {
        console.error("Error fetching packages:", error);
        setPackages([]);
      }
    };

    fetchPackages();
  }, [location.state]);

  const togglePackage = async (id) => {
    setPackages((prev) =>
      prev.map((pkg) =>
        pkg.id === id ? { ...pkg, enabled: !pkg.enabled } : pkg
      )
    );
  };

  const handleDeleteClick = (id) => {
    setPackageToDelete(id);
    setOpenDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (packageToDelete) {
      try {
        await axios.delete(`http://localhost:9090/api/v1/package/delete/${packageToDelete}`);
        setPackages((prev) => prev.filter((pkg) => pkg.id !== packageToDelete));
        setOpenDeleteModal(false);
        setPackageToDelete(null);
      } catch (error) {
        console.error("Error deleting package:", error);
        setOpenDeleteModal(false);
        setPackageToDelete(null);
      }
    }
  };

  const handleDeleteCancel = () => {
    setOpenDeleteModal(false);
    setPackageToDelete(null);
  };

  return (
    <div className="p-6">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-6">
        <Typography variant="h5" color="black">
          Packages
        </Typography>
        <Button
          className="bg-white text-black border border-black flex items-center gap-2 shadow-none hover:shadow-md"
          onClick={() => navigate("/add-package")}
          disabled={isViewer}
        >
          <PlusIcon className="h-5 w-5" /> Add Package
        </Button>
      </div>

      {/* Package Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {packages.map((pkg, index) => (
    <Card
      key={pkg.id}
      className="flex flex-row w-full h-48 max-w-[30rem] bg-white shadow-lg hover:shadow-xl transition-all rounded-xl overflow-hidden border border-gray-200 cursor-pointer" // Fixed height
      onClick={() => navigate(`/view-package/${pkg.id}`)}
    >
      {/* Image Section */}
      <CardHeader
        shadow={false}
        floated={false}
        className="m-0 w-2/5 shrink-0 rounded-r-none"
      >
        <img
          src={packageImages[index]?.[0] || "https://via.placeholder.com/150"}
          alt={pkg.name}
          className="h-full w-full object-cover" 
        />
      </CardHeader>

      {/* Package Info */}
      <CardBody className="w-3/5 p-4 flex flex-col justify-between overflow-hidden">
        <div className="flex-1 overflow-hidden">
          <Typography variant="h6" className="font-bold text-gray-800 truncate">
            {pkg.name}
          </Typography>
          <Typography variant="h6" className="font-semibold text-gray-700">
            Rs. {pkg.price}
          </Typography>
          <Typography className="text-gray-600 text-sm mt-2 line-clamp-2 overflow-hidden">
            {pkg.description.length > 100
              ? `${pkg.description.substring(0, 100)}...`
              : pkg.description}
          </Typography>
        </div>

        {/* Status and Actions */}
        <div className="flex justify-between items-center mt-3">
          <Switch
            checked={pkg.enabled}
            onChange={() => togglePackage(pkg.id)}
            color="green"
            className="scale-125"
            disabled={isViewer} 
          />
          <div className="flex items-center gap-2">
            <IconButton
              variant="text"
              color="blue"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/edit-package/${pkg.id}`); 
              }}
              disabled={isViewer} 
            >
              <PencilIcon className="h-5 w-5" />
            </IconButton>
            <IconButton
              variant="text"
              color="red"
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteClick(pkg.id);
              }}
              disabled={isViewer} 
            >
              <TrashIcon className="h-5 w-5" />
            </IconButton>
          </div>
        </div>
      </CardBody>
    </Card>
  ))}
</div>

      {/* Delete Confirmation Modal */}
      <Dialog open={openDeleteModal} handler={handleDeleteCancel} size="sm">
        <DialogHeader>Confirm Delete</DialogHeader>
        <DialogBody className="text-center">
          Are you sure you want to delete this package?
        </DialogBody>
        <DialogFooter className="flex justify-center gap-4">
          <Button variant="text" color="gray" onClick={handleDeleteCancel}>
            Cancel
          </Button>
          <Button variant="gradient" color="red" onClick={handleDeleteConfirm}>
            Delete
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}

export default ManagePackages;
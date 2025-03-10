import React, { useState, useEffect } from "react";
import {
  Typography,
  Card,
  CardBody,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Button,
  Select,
  Option,
} from "@material-tailwind/react";
import {
  BanknotesIcon,
  UserPlusIcon,
  UsersIcon,
  ChartBarIcon,
  TrashIcon,
  XMarkIcon,
  EyeIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/solid";
import { StatisticsCard } from "@/widgets/cards";
import { useAuth } from "../auth/useAuth"; // Assuming this is the correct import path

export function Home() {
  const [customerInquiries, setCustomerInquiries] = useState([]);
  const [contactInquiries, setContactInquiries] = useState([]);
  const [selectedCustomerInquiry, setSelectedCustomerInquiry] = useState(null);
  const [selectedContactInquiry, setSelectedContactInquiry] = useState(null);
  const [openCustomerModal, setOpenCustomerModal] = useState(false);
  const [openRequirementsModal, setOpenRequirementsModal] = useState(false);
  const [openContactModal, setOpenContactModal] = useState(false);
  const [loadingCustomer, setLoadingCustomer] = useState(true);
  const [loadingContact, setLoadingContact] = useState(true);
  const [customerPage, setCustomerPage] = useState(1);
  const [contactPage, setContactPage] = useState(1);
  const [deleteConfirmation, setDeleteConfirmation] = useState({ open: false, id: "" });
  const [isDeleting, setIsDeleting] = useState(false);
  const [statisticsData, setStatisticsData] = useState({
    totalInquiries: 0,
    totalPackages: 0,
    totalDestinations: 0,
    totalDayTours: 0,
  });
  const recordsPerPage = 5;

  const { data: user } = useAuth(); // Get user data from useAuth hook
  const isViewer = user?.roles?.includes("VIEWER") && !user?.roles?.includes("ADMIN"); // Check if user is VIEWER only

  const statisticsCardsData = [
    { color: "gray", icon: BanknotesIcon, title: "Total Inquiries", value: statisticsData.totalInquiries },
    { color: "gray", icon: UsersIcon, title: "Total Packages", value: statisticsData.totalPackages },
    { color: "gray", icon: UserPlusIcon, title: "Total Destinations", value: statisticsData.totalDestinations },
    { color: "gray", icon: ChartBarIcon, title: "Total Day Tours", value: statisticsData.totalDayTours },
  ];

  useEffect(() => {
    console.log("User Role:", user?.roles); // Log the user's role
    const fetchStatistics = async () => {
      try {
        const [inquiriesResponse, packagesResponse, destinationsResponse, dayToursResponse] = await Promise.all([
          fetch('http://localhost:9090/api/v1/tailor-made-package/get/count'),
          fetch('http://localhost:9090/api/v1/package/get/count'),
          fetch('http://localhost:9090/api/v1/destinations/get/count'),
          fetch('http://localhost:9090/api/v1/dayTours/get/count'),
        ]);

        const inquiriesData = await inquiriesResponse.json();
        const packagesData = await packagesResponse.json();
        const destinationsData = await destinationsResponse.json();
        const dayToursData = await dayToursResponse.json();

        setStatisticsData({
          totalInquiries: inquiriesData.data,
          totalPackages: packagesData.data,
          totalDestinations: destinationsData.data,
          totalDayTours: dayToursData.data,
        });
      } catch (error) {
        console.error('Error fetching statistics:', error);
      }
    };

    fetchStatistics();
  }, [user]); // Added user to dependency array to log role changes

  useEffect(() => {
    const fetchCustomerInquiries = async () => {
      try {
        const response = await fetch('http://localhost:9090/api/v1/tailor-made-package/getAll');
        const result = await response.json();
        if (result.code === 200) {
          const sortedData = result.data.reverse().map(item => ({ ...item, status: "pending" }));
          setCustomerInquiries(sortedData);
        }
      } catch (error) {
        console.error('Error fetching customer inquiries:', error);
      } finally {
        setLoadingCustomer(false);
      }
    };
    fetchCustomerInquiries();
  }, []);

  useEffect(() => {
    const fetchContactInquiries = async () => {
      try {
        const response = await fetch('http://localhost:9090/api/v1/contact/getAll');
        const result = await response.json();
        if (result.code === 200) {
          const sortedData = result.data.reverse();
          setContactInquiries(sortedData);
        }
      } catch (error) {
        console.error('Error fetching contact inquiries:', error);
      } finally {
        setLoadingContact(false);
      }
    };
    fetchContactInquiries();
  }, []);

  const handleCustomerViewClick = (inquiry) => {
    setSelectedCustomerInquiry(inquiry);
    setOpenCustomerModal(true);
    setOpenRequirementsModal(false);
  };

  const handleCustomerCloseModal = () => {
    setOpenCustomerModal(false);
    setSelectedCustomerInquiry(null);
  };

  const handleCustomerDelete = (id) => {
    setCustomerInquiries(customerInquiries.filter(inquiry => inquiry.id !== id));
    setDeleteConfirmation({ open: false, id: "" });
    setIsDeleting(false);
  };

  const handleDeleteClick = (id) => {
    setDeleteConfirmation({ open: true, id });
  };

  const handleStatusChange = (id, value) => {
    setCustomerInquiries(customerInquiries.map(inquiry => 
      inquiry.id === id ? { ...inquiry, status: value } : inquiry
    ));
  };

  const handleCustomerSave = (inquiry) => {
    console.log("Saved:", inquiry);
  };

  const handleOpenRequirementsModal = () => {
    setOpenRequirementsModal(true);
    setOpenCustomerModal(false);
  };

  const handleCloseRequirementsModal = () => {
    setOpenRequirementsModal(false);
    setOpenCustomerModal(true);
  };

  const handleContactViewClick = (inquiry) => {
    setSelectedContactInquiry(inquiry);
    setOpenContactModal(true);
  };

  const handleContactCloseModal = () => {
    setOpenContactModal(false);
    setSelectedContactInquiry(null);
  };

  const trimId = (id) => id.slice(0, 5);

  const customerIndexOfLastRecord = customerPage * recordsPerPage;
  const customerIndexOfFirstRecord = customerIndexOfLastRecord - recordsPerPage;
  const currentCustomerRecords = customerInquiries.slice(customerIndexOfFirstRecord, customerIndexOfLastRecord);
  const customerTotalPages = Math.ceil(customerInquiries.length / recordsPerPage);

  const contactIndexOfLastRecord = contactPage * recordsPerPage;
  const contactIndexOfFirstRecord = contactIndexOfLastRecord - recordsPerPage;
  const currentContactRecords = contactInquiries.slice(contactIndexOfFirstRecord, contactIndexOfLastRecord);
  const contactTotalPages = Math.ceil(contactInquiries.length / recordsPerPage);

  const handleCustomerNextPage = () => {
    if (customerPage < customerTotalPages) setCustomerPage(customerPage + 1);
  };

  const handleCustomerPrevPage = () => {
    if (customerPage > 1) setCustomerPage(customerPage - 1);
  };

  const handleContactNextPage = () => {
    if (contactPage < contactTotalPages) setContactPage(contactPage + 1);
  };

  const handleContactPrevPage = () => {
    if (contactPage > 1) setContactPage(contactPage - 1);
  };

  return (
    <div className="mt-12">
      <div className="mb-12 grid gap-y-10 gap-x-6 md:grid-cols-2 xl:grid-cols-4">
        {statisticsCardsData.map(({ icon, title, ...rest }) => (
          <StatisticsCard
            key={title}
            {...rest}
            title={title}
            icon={React.createElement(icon, { className: "w-6 h-6 text-white" })}
          />
        ))}
      </div>

      <div>
        <Card>
          <div className="mb-4 p-6 bg-gray-200">
            <Typography variant="h6" color="black">Customer Package Table</Typography>
          </div>
          <CardBody className="overflow-x-auto px-0 pt-0 pb-2 max-h-80">
            <table className="w-full min-w-[640px] table-auto">
              <thead>
                <tr>
                  {["ID", "Name", "Email", "Phone Number", "Status", "Action"].map((el) => (
                    <th key={el} className="border-b border-blue-gray-50 py-3 px-5 text-left sticky top-0 bg-white z-10">
                      <Typography variant="small" className="text-[11px] font-bold uppercase text-blue-gray-400">
                        {el}
                      </Typography>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loadingCustomer ? (
                  <tr><td colSpan={6} className="py-3 px-5 text-center"><Typography>Loading...</Typography></td></tr>
                ) : currentCustomerRecords.length > 0 ? (
                  currentCustomerRecords.map(({ id, name, email, phone, status }, index) => {
                    const className = `py-2 px-5 ${index !== currentCustomerRecords.length - 1 ? "border-b border-blue-gray-50" : ""}`;
                    return (
                      <tr key={id} className="hover:bg-gray-50">
                        <td className={className}><Typography variant="small" color="blue-gray" className="font-semibold">{trimId(id)}</Typography></td>
                        <td className={className}><Typography variant="small" color="blue-gray" className="font-semibold">{name}</Typography></td>
                        <td className={className}><Typography className="text-xs font-normal text-blue-gray-500">{email}</Typography></td>
                        <td className={className}><Typography className="text-xs font-semibold text-blue-gray-600">{phone}</Typography></td>
                        <td className={className}>
                          <Select 
                            value={status}
                            onChange={(value) => handleStatusChange(id, value)}
                            className="border-none w-32"
                            size="sm"
                            disabled={isViewer} // Disable status dropdown for VIEWER
                          >
                            <Option value="pending">Pending</Option>
                            <Option value="completed">Completed</Option>
                          </Select>
                        </td>
                        <td className={className}>
                          <div className="flex gap-2 items-center">
                            <EyeIcon 
                              className="w-4 h-4 text-black cursor-pointer hover:text-gray-600"
                              onClick={() => handleCustomerViewClick(currentCustomerRecords[index])}
                            />
                            <TrashIcon 
                              className={`w-4 h-4 ${isViewer ? 'text-gray-400 cursor-not-allowed' : 'text-red-600 cursor-pointer hover:text-red-800'}`} 
                              onClick={!isViewer ? () => handleDeleteClick(id) : undefined} // Open confirmation modal for non-VIEWERs
                            />
                            <Typography
                              as="a"
                              href="#"
                              onClick={!isViewer ? () => handleCustomerSave(currentCustomerRecords[index]) : undefined} // Disable Save link for VIEWER
                              className={`text-xs font-semibold ${isViewer ? 'text-gray-400 cursor-not-allowed' : 'text-black hover:text-gray-600'}`}
                            >
                              Save
                            </Typography>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr><td colSpan={6} className="py-3 px-5 text-center"><Typography>No inquiries found</Typography></td></tr>
                )}
              </tbody>
            </table>
          </CardBody>
          {customerInquiries.length > recordsPerPage && (
            <div className="flex justify-end items-center py-2 px-5 gap-4">
              <ChevronLeftIcon 
                className={`w-5 h-5 text-black cursor-pointer ${customerPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:text-gray-600'}`} 
                onClick={handleCustomerPrevPage}
              />
              <Typography className="text-sm">
                Page {customerPage} of {customerTotalPages}
              </Typography>
              <ChevronRightIcon 
                className={`w-5 h-5 text-black cursor-pointer ${customerPage === customerTotalPages ? 'opacity-50 cursor-not-allowed' : 'hover:text-gray-600'}`} 
                onClick={handleCustomerNextPage}
              />
            </div>
          )}
        </Card>

        <Dialog 
          open={deleteConfirmation.open} 
          handler={() => setDeleteConfirmation({ open: false, id: "" })}
        >
          <DialogHeader>Confirm Deletion</DialogHeader>
          <DialogBody className="text-center">
            Are you sure you want to delete this inquiry?
          </DialogBody>
          <DialogFooter className="flex justify-center gap-4">
            <Button 
              variant="text" 
              color="gray" 
              onClick={() => setDeleteConfirmation({ open: false, id: "" })} 
              className="mr-1"
            >
              Cancel
            </Button>
            <Button 
              variant="gradient" 
              color="red" 
              onClick={() => handleCustomerDelete(deleteConfirmation.id)} 
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Confirm"}
            </Button>
          </DialogFooter>
        </Dialog>

        {selectedCustomerInquiry && (
          <>
            <Dialog open={openCustomerModal} handler={handleCustomerCloseModal} size="lg" className="bg-white rounded-2xl shadow-xl border border-gray-200">
              <DialogHeader className="flex justify-between items-center bg-white text-black rounded-t-2xl p-6">
                <Typography variant="h4" className="font-bold tracking-wide">Inquiry Details</Typography>
                <XMarkIcon 
                  className="w-6 h-6 cursor-pointer hover:text-gray-400 transition-colors" 
                  onClick={handleCustomerCloseModal}
                />
              </DialogHeader>
              <DialogBody className="p-8 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-white p-5 rounded-xl shadow-lg hover:shadow-xl transition-shadow border-l-4 border-gray-800">
                    <Typography variant="h6" color="gray" className="font-bold mb-3 flex items-center">
                      <UsersIcon className="w-5 h-5 mr-2 text-black" /> Personal Info
                    </Typography>
                    <Typography className="text-sm text-black"><strong>ID:</strong> {selectedCustomerInquiry.id}</Typography>
                    <Typography className="text-sm text-black"><strong>Name:</strong> {selectedCustomerInquiry.name}</Typography>
                    <Typography className="text-sm text-black"><strong>Email:</strong> {selectedCustomerInquiry.email}</Typography>
                    <Typography className="text-sm text-black"><strong>Phone:</strong> {selectedCustomerInquiry.phone}</Typography>
                    <Typography className="text-sm text-black"><strong>Country:</strong> {selectedCustomerInquiry.country}</Typography>
                  </div>
                  <div className="bg-white p-5 rounded-xl shadow-lg hover:shadow-xl transition-shadow border-l-4 border-gray-800">
                    <Typography variant="h6" color="gray" className="font-bold mb-3 flex items-center">
                      <BanknotesIcon className="w-5 h-5 mr-2 text-black" /> Travel Details
                    </Typography>
                    <Typography className="text-sm text-black"><strong>Budget:</strong> ${selectedCustomerInquiry.budget}</Typography>
                    <Typography className="text-sm text-black"><strong>Departure:</strong> {selectedCustomerInquiry.departureDate}</Typography>
                    <Typography className="text-sm text-black"><strong>Arrival:</strong> {selectedCustomerInquiry.arrivalDate}</Typography>
                    <Typography className="text-sm text-black"><strong>Nights:</strong> {selectedCustomerInquiry.numberOfNights}</Typography>
                    <Typography className="text-sm text-black"><strong>Flexible:</strong> {selectedCustomerInquiry.flexibilityOnDates}</Typography>
                  </div>
                  <div className="bg-white p-5 rounded-xl shadow-lg hover:shadow-xl transition-shadow border-l-4 border-gray-800">
                    <Typography variant="h6" color="gray" className="font-bold mb-3 flex items-center">
                      <UserPlusIcon className="w-5 h-5 mr-2 text-black" /> Guests
                    </Typography>
                    <Typography className="text-sm text-black"><strong>Adults:</strong> {selectedCustomerInquiry.noOfAdults.ageGroupOne} (Age Group 1)</Typography>
                    <Typography className="text-sm text-black"><strong>Children:</strong> 
                      {selectedCustomerInquiry.noOfChildren.ageGroupOne} (Age 1), 
                      {selectedCustomerInquiry.noOfChildren.ageGroupTwo} (Age 2), 
                      {selectedCustomerInquiry.noOfChildren.ageGroupThree} (Age 3)
                    </Typography>
                  </div>
                  <div className="bg-white p-5 rounded-xl shadow-lg hover:shadow-xl transition-shadow border-l-4 border-gray-800">
                    <Typography variant="h6" color="gray" className="font-bold mb-3 flex items-center">
                      <ChartBarIcon className="w-5 h-5 mr-2 text-black" /> Preferences
                    </Typography>
                    <Typography className="text-sm text-black"><strong>Hotels:</strong> {selectedCustomerInquiry.hotelTypes.firstReference}, {selectedCustomerInquiry.hotelTypes.secondReference}</Typography>
                    <Typography className="text-sm text-black"><strong>Interests:</strong> {selectedCustomerInquiry.holidayInterest.join(", ")}</Typography>
                    <Typography className="text-sm text-black">
                      <strong>Requirements:</strong> 
                      {selectedCustomerInquiry.specialRequirements.length > 50 ? (
                        <>
                          {selectedCustomerInquiry.specialRequirements.substring(0, 50)}...
                          <span 
                            className="text-black underline cursor-pointer hover:text-gray-600"
                            onClick={handleOpenRequirementsModal}
                          >
                            View More
                          </span>
                        </>
                      ) : (
                        selectedCustomerInquiry.specialRequirements
                      )}
                    </Typography>
                  </div>
                </div>
              </DialogBody>
              <DialogFooter className="p-4 bg-gray-100 rounded-b-2xl flex justify-end gap-3">
              </DialogFooter>
            </Dialog>

            {openRequirementsModal && (
              <Dialog 
                open={openRequirementsModal} 
                handler={handleCloseRequirementsModal} 
                size="md" 
                className="bg-white rounded-2xl shadow-xl border border-gray-200"
              >
                <DialogHeader className="flex justify-between items-center bg-white text-black rounded-t-2xl p-6">
                  <Typography variant="h4" className="font-bold tracking-wide">Special Requirements</Typography>
                  <XMarkIcon 
                    className="w-6 h-6 cursor-pointer hover:text-gray-400 transition-colors" 
                    onClick={handleCloseRequirementsModal}
                  />
                </DialogHeader>
                <DialogBody className="p-6 max-h-[60vh] overflow-y-auto">
                  <Typography className="text-sm text-black whitespace-pre-wrap">
                    {selectedCustomerInquiry.specialRequirements}
                  </Typography>
                </DialogBody>
                <DialogFooter className="p-4 bg-gray-100 rounded-b-2xl flex justify-end gap-3">
                </DialogFooter>
              </Dialog>
            )}
          </>
        )}

        <div className="my-8"></div>
        <Card>
          <div className="mb-4 p-6 bg-gray-200">
            <Typography variant="h6" color="black">Inquiries Table</Typography>
          </div>
          <CardBody className="overflow-x-auto px-0 pt-0 pb-2 max-h-80">
            <table className="w-full min-w-[640px] table-auto">
              <thead>
                <tr>
                  {["Name", "Email", "Phone", "Description"].map((el) => (
                    <th key={el} className="border-b border-blue-gray-50 py-3 px-5 text-left sticky top-0 bg-white z-10">
                      <Typography variant="small" className="text-[11px] font-bold uppercase text-blue-gray-400">{el}</Typography>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loadingContact ? (
                  <tr><td colSpan={4} className="py-3 px-5 text-center"><Typography>Loading...</Typography></td></tr>
                ) : currentContactRecords.length > 0 ? (
                  currentContactRecords.map(({ name, email, phone, description }, index) => {
                    const className = `py-2 px-5 ${index !== currentContactRecords.length - 1 ? "border-b border-blue-gray-50" : ""}`;
                    const truncatedDescription = description.length > 50 ? description.substring(0, 50) + "..." : description;
                    return (
                      <tr key={email} className="hover:bg-gray-50">
                        <td className={className}><Typography variant="small" color="blue-gray" className="font-semibold">{name}</Typography></td>
                        <td className={className}><Typography className="text-xs font-normal text-blue-gray-500">{email}</Typography></td>
                        <td className={className}><Typography className="text-xs font-semibold text-blue-gray-600">{phone}</Typography></td>
                        <td className={className}>
                          <Typography className="text-xs font-normal text-blue-gray-500">
                            {truncatedDescription}
                            {description.length > 50 && (
                              <span 
                                className="text-black underline cursor-pointer hover:text-gray-600 ml-2"
                                onClick={() => handleContactViewClick(currentContactRecords[index])}
                              >
                                View
                              </span>
                            )}
                          </Typography>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr><td colSpan={4} className="py-3 px-5 text-center"><Typography>No inquiries found</Typography></td></tr>
                )}
              </tbody>
            </table>
            {contactInquiries.length > recordsPerPage && (
              <div className="flex justify-end items-center py-2 px-5 gap-4">
                <ChevronLeftIcon 
                  className={`w-5 h-5 text-black cursor-pointer ${contactPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:text-gray-600'}`} 
                  onClick={handleContactPrevPage}
                />
                <Typography className="text-sm">
                  Page {contactPage} of {contactTotalPages}
                </Typography>
                <ChevronRightIcon 
                  className={`w-5 h-5 text-black cursor-pointer ${contactPage === contactTotalPages ? 'opacity-50 cursor-not-allowed' : 'hover:text-gray-600'}`} 
                  onClick={handleContactNextPage}
                />
              </div>
            )}
          </CardBody>
        </Card>

        {selectedContactInquiry && (
          <Dialog 
            open={openContactModal} 
            handler={handleContactCloseModal} 
            size="md" 
            className="bg-white rounded-2xl shadow-xl border border-gray-200"
          >
            <DialogHeader className="flex justify-between items-center bg-white text-black rounded-t-2xl p-6">
              <Typography variant="h4" className="font-bold tracking-wide">Full Description</Typography>
              <XMarkIcon 
                className="w-6 h-6 cursor-pointer hover:text-gray-400 transition-colors" 
                onClick={handleContactCloseModal}
              />
            </DialogHeader>
            <DialogBody className="p-6 max-h-[60vh] overflow-y-auto">
              <Typography className="text-sm text-black whitespace-pre-wrap">
                {selectedContactInquiry.description}
              </Typography>
            </DialogBody>
            <DialogFooter className="p-4 bg-gray-100 rounded-b-2xl flex justify-end gap-3">
            </DialogFooter>
          </Dialog>
        )}
      </div>
    </div>
  );
}

export default Home;
import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  Typography,
  Card,
  CardBody,
  Button,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Input,
  Select,
  Option,
} from "@material-tailwind/react";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/solid";
import { useAuth } from "../auth/useAuth"; // Assuming this is the correct import path

export function Profile() {
  const [users, setUsers] = useState([]);
  const [open, setOpen] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [newUser, setNewUser] = useState({ email: "", password: "", confirmPassword: "", role: "", phone: "" });
  const [deleteConfirmation, setDeleteConfirmation] = useState({ open: false, email: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [editValidationErrors, setEditValidationErrors] = useState({});

  const { data: user } = useAuth(); // Get user data from useAuth hook
  const isViewer = user?.roles?.includes("VIEWER") && !user?.roles?.includes("ADMIN"); // Check if user is VIEWER only

  useEffect(() => {
    console.log("User Role:", user?.roles); // Log the user's role
    fetchUsers();
  }, [user]); // Added user to dependency array to log role changes

  const fetchUsers = async () => {
    setIsFetching(true);
    try {
      const response = await axios.get("http://localhost:9090/api/v1/users/getAll");
      if (response.data.code === 200) {
        const mappedUsers = response.data.data.map(user => ({
          id: user.email,
          name: user.email.split('@')[0],
          email: user.email,
          phone: user.phone || 'N/A',
          role: user.role,
        }));
        setUsers(mappedUsers);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setIsFetching(false);
    }
  };

  const handleOpen = (user) => {
    setEditUser({ ...user, password: "", confirmPassword: "" });
    setOpen(true);
    setEditValidationErrors({});
  };

  const handleClose = () => {
    setOpen(false);
    setEditUser(null);
    setEditValidationErrors({});
  };

  const handleDelete = async (email) => {
    setIsLoading(true);
    try {
      const response = await axios.delete(`http://localhost:9090/api/v1/users/delete/${email}`);
      if (response.status === 200) {
        setUsers(users.filter((user) => user.email !== email));
        toast.success("User deleted successfully.");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Failed to delete user.");
    } finally {
      setDeleteConfirmation({ open: false, email: "" });
      setIsLoading(false);
    }
  };

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const validatePhone = (phone) => {
    const regex = /^\d{10}$/;
    return regex.test(phone);
  };

  const validatePassword = (password) => {
    return password.length >= 6;
  };

  const handleEdit = async () => {
    const errors = {};

    if (!editUser.email) {
      errors.email = "Email is required.";
    } else if (!validateEmail(editUser.email)) {
      errors.email = "Invalid email address.";
    }

    if (!editUser.phone) {
      errors.phone = "Phone number is required.";
    } else if (!validatePhone(editUser.phone)) {
      errors.phone = "Invalid phone number. It must be 10 digits.";
    }

    if (editUser.password && !validatePassword(editUser.password)) {
      errors.password = "Password must be at least 6 characters.";
    }

    if (editUser.password && editUser.password !== editUser.confirmPassword) {
      errors.confirmPassword = "Passwords do not match.";
    }

    if (!editUser.role) {
      errors.role = "Role is required.";
    }

    if (Object.keys(errors).length > 0) {
      setEditValidationErrors(errors);
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        email: editUser.email,
        phone: editUser.phone,
        role: editUser.role,
      };
      if (editUser.password) {
        payload.password = editUser.password;
      }

      const response = await axios.put(
        `http://localhost:9090/api/v1/users/update/${editUser.email}`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200 || response.status === 201) {
        fetchUsers();
        toast.success("User updated successfully.");
        handleClose();
      }
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error("Failed to update user.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddUser = async () => {
    const errors = {};

    if (!newUser.email) {
      errors.email = "Email is required.";
    } else if (!validateEmail(newUser.email)) {
      errors.email = "Invalid email address.";
    }

    if (!newUser.phone) {
      errors.phone = "Phone number is required.";
    } else if (!validatePhone(newUser.phone)) {
      errors.phone = "Invalid phone number. It must be 10 digits.";
    }

    if (!newUser.password) {
      errors.password = "Password is required.";
    } else if (!validatePassword(newUser.password)) {
      errors.password = "Password must be at least 6 characters.";
    }

    if (!newUser.confirmPassword) {
      errors.confirmPassword = "Confirm password is required.";
    } else if (newUser.password !== newUser.confirmPassword) {
      errors.confirmPassword = "Passwords do not match.";
    }

    if (!newUser.role) {
      errors.role = "Role is required.";
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(
        "http://localhost:9090/api/v1/users/save",
        newUser,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (response.status === 200 || response.status === 201) {
        await fetchUsers();
        setNewUser({ email: "", password: "", confirmPassword: "", role: "", phone: "" }); // Reset form
        setValidationErrors({});
        toast.success("User added successfully.");
      }
    } catch (error) {
      console.error("Error adding user:", error);
      toast.error("Failed to add user.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-12">
      <ToastContainer />
      <div className="mb-10">
        <Card>
          <div className="mb-8 p-6 bg-gray-200">
            <Typography variant="h6" className="text-black">
              Users Table
            </Typography>
          </div>
          <CardBody className="overflow-x-auto px-0 pt-0 pb-2">
            {isFetching ? (
              <Typography className="text-center">Loading users...</Typography>
            ) : (
              <table className="w-full min-w-[640px] table-auto">
                <thead>
                  <tr>
                    {["Email", "Phone Number", "Role", "Action"].map((el) => (
                      <th key={el} className="border-b border-blue-gray-50 py-3 px-5 text-left">
                        <Typography variant="small" className="text-[11px] font-bold uppercase text-blue-gray-400">
                          {el}
                        </Typography>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map(({ email, phone, role }, key) => (
                    <tr key={email} className="hover:bg-gray-50">
                      <td className={`py-3 px-5 ${key !== users.length - 1 ? "border-b border-blue-gray-50" : ""}`}>
                        <Typography variant="small" color="blue-gray" className="font-semibold">
                          {email}
                        </Typography>
                      </td>
                      <td className={`py-3 px-5 ${key !== users.length - 1 ? "border-b border-blue-gray-50" : ""}`}>
                        <Typography className="text-xs font-semibold text-blue-gray-600">
                          {phone}
                        </Typography>
                      </td>
                      <td className={`py-3 px-5 ${key !== users.length - 1 ? "border-b border-blue-gray-50" : ""}`}>
                        <Typography className="text-xs font-semibold text-blue-gray-600">
                          {role}
                        </Typography>
                      </td>
                      <td className={`py-3 px-5 ${key !== users.length - 1 ? "border-b border-blue-gray-50" : ""}`}>
                        <Button
                          variant="text"
                          size="sm"
                          className="mr-2"
                          onClick={() => handleOpen({ email, phone, role })}
                          disabled={isViewer} 
                        >
                          <PencilIcon className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="text"
                          size="sm"
                          color="red"
                          onClick={() => setDeleteConfirmation({ open: true, email })}
                          disabled={isViewer} 
                        >
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardBody>
        </Card>
      </div>

      <div className="mb-8">
        <Card>
          <div className="mb-8 p-6 bg-gray-200">
            <Typography variant="h6" color="black">
              Add User
            </Typography>
          </div>
          <CardBody>
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              <div>
                <Input
                  type="email"
                  label="Email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  disabled={isViewer} 
                />
                {validationErrors.email && (
                  <Typography variant="small" color="red" className="text-xs mt-1">
                    {validationErrors.email}
                  </Typography>
                )}
              </div>
              <div>
                <Input
                  type="phone"
                  label="Phone Number"
                  value={newUser.phone}
                  onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                  disabled={isViewer} 
                />
                {validationErrors.phone && (
                  <Typography variant="small" color="red" className="text-xs mt-1">
                    {validationErrors.phone}
                  </Typography>
                )}
              </div>
              <div>
                <Input
                  type="password"
                  label="Password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  disabled={isViewer} 
                />
                {validationErrors.password && (
                  <Typography variant="small" color="red" className="text-xs mt-1">
                    {validationErrors.password}
                  </Typography>
                )}
              </div>
              <div>
                <Input
                  type="password"
                  label="Confirm Password"
                  value={newUser.confirmPassword}
                  onChange={(e) => setNewUser({ ...newUser, confirmPassword: e.target.value })}
                  disabled={isViewer} 
                />
                {validationErrors.confirmPassword && (
                  <Typography variant="small" color="red" className="text-xs mt-1">
                    {validationErrors.confirmPassword}
                  </Typography>
                )}
              </div>
              <div>
                <Select
                  label="Role"
                  value={newUser.role}
                  onChange={(value) => setNewUser({ ...newUser, role: value })}
                  disabled={isViewer} 
                >
                  <Option value="ADMIN">ADMIN</Option>
                  <Option value="VIEWER">VIEWER</Option>
                </Select>
                {validationErrors.role && (
                  <Typography variant="small" color="red" className="text-xs mt-1">
                    {validationErrors.role}
                  </Typography>
                )}
              </div>
            </div>
            <Button
              className="mt-4"
              onClick={handleAddUser}
              disabled={isLoading || isViewer} 
            >
              {isLoading ? "Saving..." : "Add User"}
            </Button>
          </CardBody>
        </Card>
      </div>

      <Dialog open={open} handler={handleClose} size="lg" className="max-w-5xl mx-auto"> {/* Constrain max width */}
  <DialogHeader>Edit User</DialogHeader>
  <DialogBody>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"> {/* Adjusted breakpoints */}
      <div className="flex flex-col">
        <Input
          type="email"
          label="Email"
          value={editUser?.email || ""}
          onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
          className="w-full"
        />
        {editValidationErrors.email && (
          <Typography variant="small" color="red" className="text-xs mt-1 min-h-[20px]">
            {editValidationErrors.email}
          </Typography>
        )}
      </div>
      <div className="flex flex-col">
        <Input
          type="phone"
          label="Phone Number"
          value={editUser?.phone || ""}
          onChange={(e) => setEditUser({ ...editUser, phone: e.target.value })}
          className="w-full"
        />
        {editValidationErrors.phone && (
          <Typography variant="small" color="red" className="text-xs mt-1 min-h-[20px]">
            {editValidationErrors.phone}
          </Typography>
        )}
      </div>
      <div className="flex flex-col">
        <Input
          type="password"
          label="Password"
          value={editUser?.password || ""}
          onChange={(e) => setEditUser({ ...editUser, password: e.target.value })}
          className="w-full"
        />
        {editValidationErrors.password && (
          <Typography variant="small" color="red" className="text-xs mt-1 min-h-[20px]">
            {editValidationErrors.password}
          </Typography>
        )}
      </div>
      <div className="flex flex-col">
        <Input
          type="password"
          label="Confirm Password"
          value={editUser?.confirmPassword || ""}
          onChange={(e) => setEditUser({ ...editUser, confirmPassword: e.target.value })}
          className="w-full"
        />
        {editValidationErrors.confirmPassword && (
          <Typography variant="small" color="red" className="text-xs mt-1 min-h-[20px]">
            {editValidationErrors.confirmPassword}
          </Typography>
        )}
      </div>
      <div className="flex flex-col">
        <Select
          label="Role"
          value={editUser?.role || ""}
          onChange={(value) => setEditUser({ ...editUser, role: value })}
          className="w-full"
        >
          <Option value="ADMIN">ADMIN</Option>
          <Option value="VIEWER">VIEWER</Option>
        </Select>
        {editValidationErrors.role && (
          <Typography variant="small" color="red" className="text-xs mt-1 min-h-[20px]">
            {editValidationErrors.role}
          </Typography>
        )}
      </div>
    </div>
  </DialogBody>
  <DialogFooter>
    <Button variant="text" color="red" onClick={handleClose} className="mr-1">
      Cancel
    </Button>
    <Button variant="gradient" color="green" onClick={handleEdit} disabled={isLoading}>
      {isLoading ? "Saving..." : "Save Changes"}
    </Button>
  </DialogFooter>
</Dialog>

      <Dialog open={deleteConfirmation.open} handler={() => setDeleteConfirmation({ open: false, email: "" })}>
        <DialogHeader>Confirm Deletion</DialogHeader>
        <DialogBody className="text-center">
          Are you sure you want to delete this user?
        </DialogBody>
        <DialogFooter className="flex justify-center gap-4">
          <Button variant="text" color="gray" onClick={() => setDeleteConfirmation({ open: false, email: "" })} className="mr-1">
            Cancel
          </Button>
          <Button variant="gradient" color="red" onClick={() => handleDelete(deleteConfirmation.email)} disabled={isLoading}>
            {isLoading ? "Deleting..." : "Confirm"}
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}

export default Profile;
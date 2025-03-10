import { useState } from "react";
import {
  Input,
  Button,
  Typography,
} from "@material-tailwind/react";
import api from "../../config/axiosConfig";
import { Link, useNavigate } from "react-router-dom";
import { queryClient } from "@/main";
import {jwtDecode }from "jwt-decode";

export function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await api.post("/api/v1/users/sign-in", {
        email,
        password,
      });

      console.log("Login successful:", response.data);
      if (response.data.code === 204) { 
        const decodedToken = jwtDecode(response.data.data);
        queryClient.setQueryData(["authUser"], {
          email: decodedToken.sub || decodedToken.email,
          roles: decodedToken.authorities || [],
          expiresAt: decodedToken.exp * 1000,
        });
        navigate("/dashboard/home");
        return true;
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Invalid email or password");
      return false;
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-screen flex bg-gray-900">
      {/* Left Side: Login Form */}
      <div className="w-1/2 flex items-center justify-center bg-white">
        <div className="w-full max-w-md p-8 transform transition-all duration-500 animate-slide-in-left">
          <div className="text-center mb-8">
            <Typography
              variant="h2"
              className="text-3xl font-bold text-gray-900 animate-fade-in-down"
            >
              Sign In
            </Typography>
            <Typography
              variant="paragraph"
              color="gray"
              className="text-md font-normal mt-2 animate-fade-in"
            >
              Enter your credentials to access the admin portal.
            </Typography>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <Typography variant="small" className="font-medium text-gray-900">
                Your Email
              </Typography>
              <Input
                size="lg"
                placeholder="name@mail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="!border !border-black focus:!border-gray-900 text-gray-900 rounded-md transition-all duration-300"
                labelProps={{
                  className: "before:content-none after:content-none",
                }}
              />
              <Typography variant="small" className="font-medium text-gray-900">
                Password
              </Typography>
              <Input
                type="password"
                size="lg"
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="!border !border-black focus:!border-gray-900 text-gray-900 rounded-md transition-all duration-300"
                labelProps={{
                  className: "before:content-none after:content-none",
                }}
              />
            </div>

            {error && (
              <Typography
                variant="small"
                color="red"
                className="text-center animate-shake"
              >
                {error}
              </Typography>
            )}

            <Button
              className="w-full bg-black text-white hover:bg-gray-800 transition-all duration-300 transform hover:scale-105"
              type="submit"
              disabled={loading}
            >
              {loading ? "Signing In..." : "Sign In"}
            </Button>
          </form>
        </div>
      </div>

      {/* Right Side: Branding */}
      <div className="w-1/2 flex items-center justify-center bg-black relative overflow-hidden">
        <div className="text-center text-white p-8 z-10 animate-slide-in-right">
          <Typography
            variant="h1"
            className="text-4xl md:text-5xl font-extrabold animate-fade-in-down"
          >
            Tusker Lanka
          </Typography>
          <Typography
            variant="h2"
            className="text-2xl md:text-3xl font-bold mt-2 animate-fade-in-up"
          >
            Tour Management Admin Portal
          </Typography>
          <Typography
            variant="paragraph"
            className="text-lg italic mt-4 animate-fade-in"
          >
            "Where Memories Are Made"
          </Typography>
        </div>

        {/* Decorative Background Elements */}
        <div className="absolute inset-0 flex items-center justify-center opacity-10">
          <div className="w-64 h-64 bg-white rounded-full animate-pulse-slow"></div>
        </div>
        <div className="absolute top-10 left-10 w-20 h-20 bg-gray-700 rounded-full animate-float"></div>
        <div className="absolute bottom-10 right-10 w-32 h-32 bg-gray-800 rounded-full animate-float delay-1000"></div>
      </div>

      {/* Custom Animations */}
      <style jsx>{`
        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes shake {
          0%, 100% {
            transform: translateX(0);
          }
          25% {
            transform: translateX(-5px);
          }
          75% {
            transform: translateX(5px);
          }
        }
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes pulseSlow {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.1);
          }
        }
        @keyframes float {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-20px);
          }
        }
        .animate-fade-in-down {
          animation: fadeInDown 0.5s ease-in-out;
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.5s ease-in-out;
        }
        .animate-fade-in {
          animation: fadeIn 0.7s ease-in-out;
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
        .animate-slide-in-left {
          animation: slideInLeft 0.7s ease-in-out;
        }
        .animate-slide-in-right {
          animation: slideInRight 0.7s ease-in-out;
        }
        .animate-pulse-slow {
          animation: pulseSlow 4s ease-in-out infinite;
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        .delay-1000 {
          animation-delay: 1s;
        }
      `}</style>
    </section>
  );
}

export default SignIn;
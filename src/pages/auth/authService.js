
export const refreshAccessToken = async () => {
    try {
        const response = await api.post("/api/v1/users/token/refresh");

        if (response.status === 200) {
            const decodedToken = jwtDecode(response.data.access_token);

            queryClient.setQueryData(["authUser"], {
                email: decodedToken.sub,
                roles: decodedToken.roles,
                expiresAt: decodedToken.exp * 1000,
            });

            return true;
        }
    } catch (error) {
        console.error("Refresh token error:", error);
        return false;
    }
};

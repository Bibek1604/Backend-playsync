export interface RegisterUserDTO{
    fullName: string;
    email: string;
    password: string;
    confirmPassword: string;
}
export interface RegisterAdminDTO{
    fullName: string;
    email: string;
    password: string;
    confirmPassword: string;
    role: "admin";
    adminCode: string;
}

export interface LoginDTO{
    email: string;
    password: string;
}
export interface AuthResponseDTO{
    accessToken: string;
    refreshToken: string;
    user: {
        id: string;
        fullName: string;
        email: string;
        role:"user" | "admin";  
    }
}

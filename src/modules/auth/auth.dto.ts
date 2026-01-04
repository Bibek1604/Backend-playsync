export interface RegisterUserDTO{
    fullName: string;
    email: string;
    password: string;
}
export interface RegisterAdminDTO{
    fullName: string;
    email: string;
    password: string;
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

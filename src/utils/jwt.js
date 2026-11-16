import jwt from "jsonwebtoken";

//funcion generar el token
export const generateToken = (userId)=>{
return( jwt.sign({userId}, process.env.JWT_SECRET),
{
    expiresIn: process.env.JWT_EXPIRES,
}
);
};

//funcion verificar el token
export const verifyToken =(token)=>{
    try{
        return jwt.verify(token, process.env.JWT_SECRET)
    } catch(error){
        throw new Error("Token invalido o expirado");
    };
}
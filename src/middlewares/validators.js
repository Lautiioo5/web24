import { validationResult, check } from "express-validator";
import User from '../models/User.js'

export const handleValidationErrors = (req,res,next)=>{
    //preguntar si no hay errores
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({
            ok:false,
            error: errors.mapped()
        })
    }
    next(); 
}

//verificar Registtro

export const registerValidation = ()=> [
    check("username")
    .notEmpty()
    .withMessage("El nombre de usuario no puede estar vacio ")
    .custom(async (value)=>{
        const user = await User.findOne({username:value})
        if(user){
            throw new Error("El usuario ya existe")
        }
    }),

    //validar email
    check("email")
    .isEmail().withMessage("Ingresar un email válido")
    .custom(async (value)=>{
        const user = await User.findOne({email:value})
        if(user){
            throw new Error("El email ya está registrado")
        }
    })
    .normalizeEmail(),  

    //validar password
    check("password")
    .isLength({min:6})
    .withMessage("La contraseña debe tener como minimo 6 caracteres")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage("La contraseña debe tener mayusculas, minusculas y numeros"),
    handleValidationErrors,
]

//Validar login
export const loginValidation=()=>[
    check("email")
    .trim()
    .isEmail().withMessage("Por favor ingrese un email valido")
    .normalizeEmail(),
    check("password")
    .isLength({min: 6})
    .notEmpty().withMessage("La contraseña es requerida")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage("La contraseña debe tener mayusculas, minusculas y numeros"),
    handleValidationErrors,
]

export const validationPassword = ()=>[
    check("password")
    .notEmpty().withMessage("La contraseña es requerida")
    .isLength({min: 6})
    .withMessage("La contraseña debe tener como minimo 6 caracteres")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage("La contraseña debe tener mayusculas, minusculas y numeros")
    
]
//validar de codigo email
export const verifyEmailValidation=()=>[
    check("code")
    .notEmpty().withMessage("El codigo de verificación es necesario")
    .trim().
    isLength({min: 6, max:6})
    .withMessage("El código debe tener 6 digitos")
    .isNumeric().withMessage("El código debe ser un número"),
    check("email")
    .notEmpty().withMessage("El correo es requerido")
    .trim()
    .isEmail().withMessage("Ingrese un email válido")
    .custom(async(value)=>{
    const user = await User.findOne({email:value})
    if(user.emailVerified){
        throw new Error("El email ya esta verificado")
    }
    })
    .normalizeEmail(), handleValidationErrors,
]
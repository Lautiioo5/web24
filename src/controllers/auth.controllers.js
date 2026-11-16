import User from '../models/User.js' 
import {sendVerificationEmail} from '../config/nodemailer.js'
import { setRandomFallback } from 'bcryptjs'
import { generateToken } from '../utils/jwt.js'

const getUsers = async (req, res)=>{
const users = await User.find()
    res.json({
        msg: 'Todo bien',
        users,
    })
}


const register =  async (req, res)=>{
try {
const {username, email, password } = req.body
const user = new User({username, email, password});

const verificationCode = user.generateVerificationCode();

await user.save();

await sendVerificationEmail(email, username, verificationCode);


return res.status(200).json({
    ok: true,
    msg: "Usuario creado!"
})
}catch(error){
    console.log (error)
    return res.status(500).json({
        ok: false, 
        error: error.message,
    })
}
}

const login = async(req,res) => {
    try{
        const {email, password} = req.body

        const user = await User.findOne({email}).select("+password")

        if(!user){
            return res.status(401).json({
                ok: false,
                message:"Credenciales incorrectas"
            })
        }

//chequear que el password coincida
const isPasswordValid = await user.comparePassword(password)
if(!isPasswordValid){
            return res.status(403).json({
                ok: false,
                message:"Credenciales incorrectas"
            }) 
}
//chequear si tiene el codigo verificado
  if(!user.emailVerified){
            return res.status(403).json({
                ok: false,
                message:"El email no esta verificado"
            })
  }
  //Generar el token de verificacion
  const token = generateToken(user._id);
  //Guardar el token en las cookies
  //HttpOnly
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge:60 * 60 * 1000,  //1hr
  }

  res.cookie("token", token, cookieOptions);


  //Iniciar sesion
  return res.status(200).json({
    ok: true,
    message: "Login exitoso!!",
  })
    }catch(error){
        return res.status(500).json({
            ok: false,
            error: error.message,
        })
    }
}

//Verificar el codigo
const verifyEmail=async(req,res)=>{
    try{
    const {code, email} = req.body
    //1) buscar el usuario por su email
    const user = await User.findOne({email})
    if(!user){
        return res.status(404).json({
            ok: false,
            message: "Usuario no encontrado"
        })
    }
    //verifico el codigo
    if(user.verificationCode !== code){
        return res.status(400).json({
            ok: false,
            message: "Codigo de verificacion incorrecto",
        });
    }

    //Verificar si el codigo expiró
    if(user.verificationCodeExpires < Date.now()){
        return res.status(400).json({
            ok: false,
            message: "El codigo de verificacion ya expiró",
        })
    }

    //Marcar el email como verificado y realizar limpieza de codigo
    user.emailVerified=true
    user.verificationCode=null
    user.verificationCodeExpires=null

    //guardar los cambios
    await user.save();

    //devolver el mensaje ok
    return res.status(200).json({
        ok: true,
        message:"Email verificado correctamente"
    })
    } catch(error){
    console.log(error)
    return res.status(500).json({
        ok: false,
        message: error.message,
    })
    }
    
}

//Cerrar sesion
export const logOut = (req,res)=>{
    const token = req.cookies?.token
    if(!token){
        return res.status(400).json({
            ok: false,
            message: "La sesion no fue iniciada",
        })
    }

    //limpiar las cookies
    res.clearCookie("token", {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
    });
    return res.status(200).json({
        ok: true,
        message: "Sesión cerrada con éxito!",
    });
};
//Ver perfil de usuario

export const getProfile = (req,res)=>{
    try{
        const {username, email, role, emailVerified} = req.user

        res.status(200).json({
            ok:true,
            perfil: {
                username,
                email,
                role,
                emailVerified,
            },
        });
    }catch(error){
        return res.status(500).json({
            ok: false, 
            error: error.message,
        })
    }
}

const updatePassword = async (req,res)=>{
    const {email, password} = req.body 

    //Si el email existe en la bd 
    const user = await User.findOne({email})

    if(!user){
        return res.status(400).json({
            ok: false,
            message: "no existe el usuario"
        })
    }

    if(!user.emailVerified){
        return res.status(400).json({
            ok: false,
            message: "El email no esta verificado"
        })
    }

    //Enviar un mail con las instrucciones

    user.password = password
    await user.save();

    return res.status(200).json({
        ok: true,
        message: "Contraseña actualizada",
        password: user.password
    })
}

const resendCodeVerificationEmail = async (req, res)=>{
    const {email} = req.body

    const user = await User.findOne({email})

    if(!user){
        return res.status(404).json({
            ok: false, 
            message: "El correo electronico no existe"
        })
    }

    const verificationCode = user.generateVerificationCode()

    await user.save();

    try{
        await sendVerificationEmail(user.email, user.username, verificationCode)
            return res.status(200).json({
                ok: true,
                message: "Se envió un nuevo codigo de verificacion"
            })
    }catch(error){
        return res.status(500).json({
            ok: false,
            message: "Error al enviar el email"
        })


    }
}
export {getUsers, register,login, verifyEmail, updatePassword, resendCodeVerificationEmail}
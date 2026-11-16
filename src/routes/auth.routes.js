import Router from 'express';
import { getProfile, getUsers, login, logOut, register, updatePassword, verifyEmail, resendCodeVerificationEmail } from '../controllers/auth.controllers.js';
import { authenticate } from '../middlewares/auth.js';
import { check } from 'express-validator';
import {  handleValidationErrors, loginValidation, registerValidation, verifyEmailValidation } from '../middlewares/validators.js'




const router = Router()
 

router.post("/register",registerValidation() ,register)

router.post("/login", loginValidation() ,login)

router.post("/verify-email", verifyEmailValidation() ,verifyEmail)

router.get("/", authenticate ,getUsers)
router.post("/logout", authenticate , logOut)
router.get("/profile", authenticate, getProfile)

//Actualizar contraseña
router.put("/password",loginValidation(),handleValidationErrors ,updatePassword)
//Reenviar código de verificación

router.post("/resend", resendCodeVerificationEmail)
export default router;
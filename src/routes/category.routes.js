import Router from "express";

const router = Router();


router.get("/")//traer las categorias
router.post("/")//crear categoria
router.put("/:id")//actualizar categoria
router.delete("/:id") //Inactivar categoria

export default router
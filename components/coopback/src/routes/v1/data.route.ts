import express from "express"
import auth from "../../middlewares/auth"
import validate from "../../middlewares/validate"
import * as dataValidation from "../../validations/data.validation"
import { dataController } from "../../controllers"

const router = express.Router()

router
  .route("/generate")
  .post(
    auth(),
    validate(dataValidation.RGenerate),
    dataController.generateDocument
  )

router
  .route("/get-documents")
  .get(
    auth("getDocuments"),
    validate(dataValidation.RGetDocuments),
    dataController.getDocuments
  )
router
  .route("/get-my-documents")
  .get(
    auth(),
    validate(dataValidation.RGetDocuments),
    dataController.getDocuments
  )

export default router

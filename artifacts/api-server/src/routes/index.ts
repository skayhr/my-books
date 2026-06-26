import { Router, type IRouter } from "express";
import healthRouter from "./health";
import letterTypesRouter from "./letterTypes";
import employeesRouter from "./employees";
import lettersRouter from "./letters";
import statsRouter from "./stats";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/letter-types", letterTypesRouter);
router.use("/employees", employeesRouter);
router.use("/letters", lettersRouter);
router.use("/stats", statsRouter);

export default router;

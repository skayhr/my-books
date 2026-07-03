import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import letterTypesRouter from "./letterTypes.js";
import employeesRouter from "./employees.js";
import lettersRouter from "./letters.js";
import statsRouter from "./stats.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/letter-types", letterTypesRouter);
router.use("/employees", employeesRouter);
router.use("/letters", lettersRouter);
router.use("/stats", statsRouter);

export default router;

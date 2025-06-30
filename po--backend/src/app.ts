import express from "express";
import connectDB from "./database/connection";
import routes from "./routes";
import cors from "cors";
import { responseFormatter } from "./utils/reponseFormatter";
import UserService from "./services/userService";
import RoleService from "./services/roleService";
import { RoleInterface } from "./interfaces/roleInterface";
import UOMService from "./services/uomService";
import { PermissionCreate } from "./interfaces/permissionInterface";
import MasterDataService from "./services/masterDataService";
const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://inventory-r6r4.vercel.app",
      "http://69.62.74.187:3000",
      "https://inventory.swyftcore.in",
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  }),
);

app.use(express.json());
app.use(responseFormatter);
app.use("/api", routes);

connectDB();

const permissions: PermissionCreate[] = [
  {
    name: "Dashboard",
    link: "/admin/",
  },
  {
    name: "Import Part Number",
    link: "/admin/import/",
  },
  {
    name: "Create Users",
    link: "/admin/create",
  },
  {
    name: "View Part Numbers",
    link: "/admin/view",
  },
  {
    name: "Create Purchase Order",
    link: "/admin/po/create",
  },
  {
    name: "View Purchase Orders",
    link: "/admin/po/view",
  },
  {
    name: "Update Purchase Order",
    link: "/admin/po/update",
  },
  {
    name: "Import Purchase Order",
    link: "/admin/po/import",
  },
  {
    name: "View Progress Update",
    link: "/admin/progress/all",
  },
  {
    name: "Update Multiple Purchase Order",
    link: "/admin/progress/plan/multi",
  },
  {
    name: "Create Master Data",
    link: "/admin/master",
  },
  {
    name: "Accept Purchase Order",
    link: "/supplier/accept",
  },
  {
    name: "Import Purchase Order",
    link: "/admin/po/import",
  },
  {
    name: "Update Progress",
    link: "/supplier/progress",
  },
  {
    name: "Approve Quality",
    link: "/client/quality",
  },
];

const paymentTerms: RoleInterface[] = [
  {
    name: "45 days",
  },
  {
    name: "60 days",
  },
  {
    name: "90 days",
  },
  {
    name: "150 days",
  },
  {
    name: "120 days",
  },
];

const frieghtTerms: RoleInterface[] = [
  {
    name: "EXW - Ex Works",
  },
  {
    name: "FOB - Free On Board",
  },
  {
    name: "FCA - Free Carrier",
  },
];

const roles: RoleInterface[] = [
  {
    name: "ADMIN",
  },
  {
    name: "SUPPLIER",
  },
  {
    name: "CLIENT",
  },
];
const uoms: RoleInterface[] = [
  {
    name: "Inches",
  },
  {
    name: "Pieces",
  },
];
const userService = new UserService();
const roleService = new RoleService();
const uomService = new UOMService();
const masterService = new MasterDataService();

uomService.createUOMS(uoms);
roleService.createRoles(roles);
roleService.createPermission(permissions);
userService.createAdmin();
masterService.createPaymentTermsorFrieghtTerms(paymentTerms, "payment");
masterService.createPaymentTermsorFrieghtTerms(frieghtTerms, "frieght");

export default app;

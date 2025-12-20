import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import dotenv from "dotenv";

dotenv.config();

export default buildModule("StockTokenModule", (m) => {
  // Định nghĩa các tham số cho constructor
    const defaultAdmin = m.getParameter("defaultAdmin", process.env.DEFAULT_ADMIN ?? "");
    const defaultInventoryManager = m.getParameter("defaultInventoryManager", process.env.INVENTORY_MANAGER ?? "");
    const defaultCompliance = m.getParameter("defaultCompliance", process.env.COMPLIANCE_ADDRESS ?? "");
    const priceAddress = m.getParameter("priceAddress", process.env.PRICE_ORACLE_ADDRESS ?? "");

  // Deploy StockToken contract
  const stockToken = m.contract("StockToken", [
    defaultAdmin,
    defaultInventoryManager,
    defaultCompliance,
    priceAddress,
  ]);

  return { stockToken };
});



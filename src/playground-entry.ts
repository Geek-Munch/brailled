import { mountPlayground } from "../src/components/playground/index";
import "../src/styles/app.css";

const root = document.getElementById("root");
if (root) {
  mountPlayground(root);
}